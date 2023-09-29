class PriceHistory {
    constructor(priceOrData, actionUserId ) {
        if (typeof priceOrData === 'number') {
            this.price = priceOrData ?? 0;
            this.createdById = actionUserId ?? null;
            this.createdISO = new Date().toISOString();
        } else {
            this.price = priceOrData.price ?? 0;
            this.createdById = priceOrData.createdById ?? null;
            this.createdISO = priceOrData.createdISO;
        }
    }
}

module.exports = PriceHistory;