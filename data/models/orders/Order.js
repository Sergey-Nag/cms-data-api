const { NEW_ORDER_DESCRIPTION } = require("../../../constants/defaults");
const OrderProduct = require("./OrderProduct");
const OrderStatusDetails = require("./OrderStatusDetails");

class Order {
    static lastOrderNumber = 0;

    constructor({ id, description, orderProducts, lastModifiedISO,
        shippingAddress, billingAddress, customerId, createdISO,
        totalPrice, currentStatus, statusHistory
    }) {
        this.id = id ?? this.#getNewId();

        this.description = description ?? null;
        this.shippingAddress = shippingAddress ?? null;
        this.billingAddress = billingAddress ?? null;
        this.customerId = customerId ?? null;

        this.orderProducts = orderProducts
            ? orderProducts.map((prod) => new OrderProduct(prod))
            : null;
        this.totalPrice = totalPrice ?? this.#getTotalPrice(this.orderProducts);

        this.statusHistory = statusHistory
            ? statusHistory.map((data) => new OrderStatusDetails(data))
            : [new OrderStatusDetails({ createdById: customerId })];
        this.currentStatus = currentStatus ?? this.statusHistory.at(-1).status;
        this.lastModifiedISO = lastModifiedISO ?? this.statusHistory.at(-1).createdISO;
        this.createdISO = createdISO ?? this.statusHistory.at(0).createdISO;
    }

    update({ orderProductsId, customerId, description, shippingAddress, billingAddress, editStatus }, modifiedById = null) {
        this.orderProductsId = orderProductsId ?? this.orderProductsId;
        this.customerId = customerId ?? this.customerId;
        this.description = description ?? this.description;
        this.shippingAddress = shippingAddress ?? this.shippingAddress;
        this.billingAddress = billingAddress ?? this.billingAddress;

        if (editStatus) this.#updateStatusHistory(editStatus, modifiedById);
        this.lastModifiedISO = new Date().toISOString();
    }

    #getTotalPrice(products = null) {
        return products
            ? products.reduce((sum, { fixedPrice, amount }) => {
                return sum + (fixedPrice * amount);
            }, 0)
            : 0;
    }

    #updateStatusHistory({ add, edit, removeByIndexes }, modifiedById) {
        if (add) {
            this.statusHistory.push(new OrderStatusDetails(add, modifiedById));
        }

        if (edit && this.statusHistory[edit.index]) {
            this.statusHistory[edit.index].update(edit.input, modifiedById);
        }

        if (removeByIndexes) {
            removeByIndexes.forEach((index) => {
                this.statusHistory[index] && this.statusHistory.splice(index, 1);
            });
        }

        this.currentStatus = this.statusHistory.at(-1).status;
    }

    #getNewId() {
        return `order-#${Order.lastOrderNumber + 1}`;
    }
}

module.exports = Order;