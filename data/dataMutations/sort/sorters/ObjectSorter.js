const Sorter = require("./Sorter");

class ObjectSorter extends Sorter {
    constructor(sortCriterias) {
        super();
        this.sortCriterias = sortCriterias;
    }

    compare(a, b) {
        let result = 0;

        for (const {field, order} of this.sortCriterias) {
            const orderVal = order === 'ASC' ? 1 : -1;

            const aItem = this.#getItem(a, field);
            const bItem = this.#getItem(b, field);

            const comparison = super.compare(aItem, bItem);

            if (comparison !== 0) {
                result = comparison === undefined ? -1 : comparison * orderVal;
                break;
            }
        }

        return result;
    }

    #getItem(item, propName) {
        return propName 
            ? propName.includes('.')
                ? propName.split('.').reduce((acc, key) => {
                    if (acc !== undefined && acc.hasOwnProperty(key)) {
                        acc = acc[key];
                    } else {
                        acc = undefined;
                    }
                    return acc;
                }, item)
                : item[propName]
            : item;
    }
}


module.exports = ObjectSorter;
