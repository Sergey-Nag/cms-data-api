const DataFilter = require("./filter/DataFilter");
const DataPagination = require("./pagination/DataPagination");
const DataSort = require("./sort/DataSort");

class DataMutations {
    constructor({filter, sort, pagination}, isFilterPartial = false) {
        this.filtering = filter && new DataFilter(filter, isFilterPartial);
        this.sorting = sort && new DataSort(sort);
        this.pagination = pagination && new DataPagination(pagination);
        this.itemsLengthAfterFilter = 0;
    }

    mutate(data) {
        let mutatedData = data;
        if (this.filtering) {
            mutatedData = this.filtering.filter(mutatedData);
        }

        this.itemsLengthAfterFilter = mutatedData.length;

        if (this.sorting) {
            mutatedData = this.sorting.sort(mutatedData);
        }


        if (this.pagination) {
            mutatedData = this.pagination.paginate(mutatedData);
        }

        return mutatedData;
    }
}

module.exports = DataMutations;