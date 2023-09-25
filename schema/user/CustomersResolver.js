const { isEmpty } = require("lodash");
const { CUSTOMERS_REPO_NAME } = require("../../constants/repositoryNames");
const Customer = require("../../data/models/users/Customer");
const Repository = require("../../data/repositories/Repository");
const UserValidator = require("../../data/validators/UserValidator");
const DataResolver = require("../DataResolver");

class CustomersResolver extends DataResolver {
    static instance = null;
    constructor() {
        if (CustomersResolver.instance) {
            return CustomersResolver.instance;
        }

        super(new Repository(CUSTOMERS_REPO_NAME), Customer, UserValidator);

        CustomersResolver.instance = this;
    }

    async edit(parent, { id, input } = {}, context) {
        if (!isEmpty(input?.ordersId)) {
            input.ordersId = [];
        }

        return await super.edit(parent, { id, input }, context)
    }
}

module.exports = CustomersResolver;
