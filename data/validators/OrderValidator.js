const ApiErrorFactory = require("../../utils/ApiErrorFactory");

class OrderValidator {
    static validateDataToCreate({ customerId, orderProducts }) {
        // const {firstname, email} = data ?? {};
        if (!customerId) {
            throw ApiErrorFactory.customerNotFound();
        }

        if (orderProducts.length === 0) {
            throw ApiErrorFactory.productListIsEmpty();
        }
        // this.#validateFirstname(firstname);
        // this.#validateEmail(email);
    }

    static validateDataToEdit(data) {
        // const {firstname, email} = data ?? {};

        // !isNil(firstname) && this.#validateFirstname(firstname);
        // !isNil(email) && this.#validateEmail(email);
    }

    static dataNotFound() {
        throw ApiErrorFactory.orderNotFound();
    }
}


module.exports = OrderValidator;
