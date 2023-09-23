class DataPagination {
    constructor({ start, amount }) {
        this.start = start;
        this.amount = amount;
    }

    paginate(data) {
        const amount = this.amount ?? data.length;
        if (this.start < 0 || amount < 0) {
            return {
                items: [],
                end: 0,
                itemsLeft: data.length
            }
        }
        const end = Math.min(this.start + amount, data.length);
        const items = data.slice(this.start, end);
        const itemsLeft = Math.max(data.length - this.start - items.length, 0);

        return {
            items,
            end,
            itemsLeft
        }
    }
}

module.exports = DataPagination;