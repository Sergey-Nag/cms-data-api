class ProductCharacteristic {
    constructor({ name, value }) {
        this.name = name;
        this.value = value ?? null;
    }

    update({ name = this.name, value = this.value } = {}) {
        this.name = name;
        this.value = value;
    }
}

module.exports = ProductCharacteristic;