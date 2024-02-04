const { random } = require("lodash");
const { ORDERS_REPO_NAME, PRODUCTS_REPO_NAME } = require("../../constants/repositoryNames");
const Order = require("../../data/models/orders/Order");
const Repository = require("../../data/repositories/Repository");
const OrderValidator = require("../../data/validators/OrderValidator");
const DataResolver = require("../DataResolver");
const CustomersResolver = require("../user/CustomersResolver");
const { getPriceFromProducts, getCurrentStatus } = require("../utils");
const ApiErrorFactory = require("../../utils/ApiErrorFactory");

class OrdersResolver extends DataResolver {
    static instance = null;
    constructor() {
        if (OrdersResolver.instance) {
            return OrdersResolver.instance;
        }

        super(new Repository(ORDERS_REPO_NAME), Order, OrderValidator);

        this.customersResolver = new CustomersResolver();

        OrdersResolver.instance = this;
    }

    async updateOrderId() {
        await this.repository.load();
        const ids = this.repository.data.map(({ id }) => parseInt(id.split('#')[1]));
        Order.lastOrderNumber = ids.length && Math.max(...ids);
    }

    async getAll(parent, args, context) {
        if (args.filter) {
            this.#mutateOrdersFilter(args.filter);
        }

        return await super.getAll(parent, args, context);
    }

    async add(parent, { input }, context) {
        await this.updateOrderId();

        if (input.customer) {
            await this.#mutateCustomerInput(parent, input, context);
        }

        await this.#mutateOrderProductsInput(input);

        const result = await super.add(parent, { input }, context);
        return result;
    }

    async delete(...args) {
        const result = await super.delete(...args);
        await this.updateOrderId();
        return result;
    }

    async getCustomer({ customerId }, args, context) {
        return customerId && await this.customersResolver.get(null, { find: { id: customerId } }, context);
    }

    getCurrentStatus({ statusHistory }) {
        return getCurrentStatus(statusHistory);
    }

    getTotalPrice({ orderProductsId }) {
        return getPriceFromProducts(orderProductsId);
    }

    async #mutateCustomerInput(parent, input, context) {
        const { email } = input.customer;
        let customerId = null;
        try {
            const customer = await this.customersResolver.get(null, { find: { email } }, context);
            await this.customersResolver.edit(null, { id: customer.id, input: input.customer }, context);
            customerId = customer.id;
        } catch (error) {
            const customer = await this.customersResolver.add(null, { input: input.customer }, context);
            customerId = customer.id;
        }

        input.customerId = customerId;
    }

    #mutateOrdersFilter(filter) {
        if (filter.orderProductsId) {
            filter.orderProducts = filter.orderProductsId.map((id) => ({ productId: id }));
            delete filter.orderProductsId;
        }
    }

    async #mutateOrderProductsInput(input) {
        const repo = new Repository(PRODUCTS_REPO_NAME);
        await repo.load();

        input.orderProducts = input.orderProducts.map(({ productId, amount }) => {
            const product = repo.get(({ id }) => id === productId);
            
            if (!product) {
                throw ApiErrorFactory.productNotFound();
            }

            return {
                product: product,
                amount,
            }
        });
    }
}

module.exports = OrdersResolver;