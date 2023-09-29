class ProductOption {
    constructor({ name, options }) {
        this.name = name ?? null;
        this.options = options ?? []
    }
}

module.exports = ProductOption;