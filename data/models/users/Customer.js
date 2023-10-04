const User = require("./User");

class Customer extends User {
    constructor({ phone, ...data}) {
        super(data, 'C');
        this.phone = phone ?? null;
    }

    update({phone, ...data}) {
        this.phone = phone;

        super.update(data);
    }
}

module.exports = Customer;