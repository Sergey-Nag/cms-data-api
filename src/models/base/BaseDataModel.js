const uniqId = require('uniqid');

module.exports = class BaseDataModel {
    constructor(id = null, prefix = '') {
        this.id = id ?? uniqId(prefix);
        console.log('IDDDD', this.id);
    }

    update() {}

    static create(data) {}
}