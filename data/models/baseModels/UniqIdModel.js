const uniqId = require('uniqid');

class UniqIdModel {
    constructor(id = null, prefix) {
        this.id = id ?? uniqId(prefix);
    }
}

module.exports = UniqIdModel;
