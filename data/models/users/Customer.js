const User = require("./User");

class Customer extends User {
    constructor({ orders, ...data}) {
        super(data, 'C');
    }

    update(data) {
        super.update(data);
    }
}

module.exports = Customer;