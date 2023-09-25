class OrderProduct {
    constructor({ product, productId, fixedPrice, amount }) {
        this.productId = productId ?? product.id;
        this.fixedPrice = fixedPrice ?? product.price;
        this.amount = amount;
    }
}

module.exports = OrderProduct;