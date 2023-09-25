const { NEW_ORDER_DESCRIPTION } = require("../../../constants/defaults");

class OrderStatusDetails {
    constructor({status, description, createdById, createdISO, lastModifiedISO }, actionUserId = null) {
        this.status = status ?? 0;
        this.description = description ?? NEW_ORDER_DESCRIPTION;
        this.createdById = createdById ??  actionUserId;
        this.createdISO = createdISO ?? new Date().toISOString();
        this.lastModifiedISO = lastModifiedISO ?? null;
    }

    update({status, description}, modifiedById = null) {
        this.status = status ?? this.status;
        this.description = description ?? this.description;
        this.createdById = modifiedById ?? this.createdById;
        this.lastModifiedISO = new Date().toISOString();
    }
}

module.exports = OrderStatusDetails;