const ObjectSorter = require("./sorters/ObjectSorter");

class DataSort {
    constructor(sortCriterias) {
        this.dataSorter = new ObjectSorter(sortCriterias);
    }

    sort(data) {
        return data.slice().sort((a, b) => {
            return this.dataSorter.compare(a, b);
        });
    }
}

module.exports = DataSort;
