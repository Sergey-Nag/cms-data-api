const User = require("./User");

class Customer extends User {
    constructor({ phone, ip, ...data}) {
        super(data, 'C');
        this.ip = ip ?? null;
        this.phone = phone ?? null;
    }

    update({phone, ip, ...data}) {
        this.phone = phone ?? this.phone;
        this.ip = ip ?? this.ip;

        super.update(data);
    }
}

module.exports = Customer;