class Stock {
    constructor({ amount = 0, lowStockAlert = 0 } = {}) {
        this.amount = amount;
        this.lowStockAlert = lowStockAlert;
    }

    update({ amount = this.amount, lowStockAlert = this.lowStockAlert }) {
        this.amount = amount;
        this.lowStockAlert = lowStockAlert;
    }
}

module.exports = Stock;