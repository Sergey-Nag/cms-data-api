const { ORDERS_REPO_NAME } = require("../../constants/repositoryNames");
const Repository = require("../../data/repositories/Repository");

const getSoldProducts = async ({ id }) => {
    const ordersRepo = new Repository(ORDERS_REPO_NAME);
    await ordersRepo.load();
    const orders = ordersRepo.data.filter(({ orderProducts }) => orderProducts.some(({ productId }) => productId === id));
    const sold = orders.reduce((acc, { orderProducts }) => {
        const orderProduct = orderProducts.find(({ productId }) => productId === id);
        return acc + orderProduct.amount;
    }, 0);
    return sold;
};

module.exports = {
    getSoldProducts,
};