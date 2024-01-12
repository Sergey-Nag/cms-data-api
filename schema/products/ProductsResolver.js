const last = require("lodash/last");
const { PRODUCTS_REPO_NAME } = require("../../constants/repositoryNames");
const StringMatcher = require("../../data/dataMutations/filter/matchers/StringMatcher");
const Product = require("../../data/products/Product");
const Repository = require("../../data/repositories/Repository");
const ProductValidator = require("../../data/validators/ProductValidator");
const DataResolver = require("../DataResolver");
const { getSoldProducts } = require("./utils");
const DataMutations = require("../../data/dataMutations/DataMutations");

class ProductsResolver extends DataResolver {
    static instance = null;
    constructor() {
        if (ProductsResolver.instance) {
            return ProductsResolver.instance;
        }

        super(new Repository(PRODUCTS_REPO_NAME), Product, ProductValidator);

        ProductsResolver.instance = this;
    }

    async getAll(parent, args, context) {
        if (args.filter) {
            this.#mutatePhotosFilter(args.filter);
        }

        return this.getAllWithSold(parent, args, context);
    }

    async getAllWithSold(parent, { filter, sort, pagination }, context) {
        await this.repository.load();

        const dataMutation = new DataMutations({ filter, sort, pagination }, true);
        let allData = await Promise.all(this.repository.data.map(async (data) => {
            const product = new this.model(data);
            const sold = await getSoldProducts(product);
            return { ...product, sold };
        }));

        const result = dataMutation.mutate(allData);
        const totalItems = dataMutation.itemsLengthAfterFilter;

        if (pagination) {
            return {...result, totalItems };
        }

        return { items: result, totalItems };
    }

    async get(parent, args, context) {
        if (args.find) {
            this.#mutatePhotosFilter(args.find);
        }

        return await super.get(parent, args, context);
    }

    async add(parent, { input } = {}, { actionUser } = {}) {
        this.validator?.validateDataToCreate(input);
        await this.repository.load();

        const newProduct = new this.model({ ...input, createdById: actionUser?.id });

        if (input.alias === undefined) {
            this.#handleAliasDuplication(newProduct);
        }

        const addedData = this.repository.add(newProduct);

        await this.repository.save();
        return addedData;
    }

    #handleAliasDuplication(newProduct) {
        const productAliases = this.repository.data.map(({ alias }) => alias);

        if (!productAliases.includes(newProduct.alias)) return;

        const stringMatcher = new StringMatcher(null, newProduct.alias, true);
        const existedProds = productAliases.filter((str) => stringMatcher.isMatched(str));
        const indexToAdd = existedProds.reduce((maxIndex, alias) => {
            const indx = last(alias.split('-'));
            if (!indx) return maxIndex;
            const parsedIndex = parseInt(+indx);
            if (!isNaN(parsedIndex) && parsedIndex > maxIndex) return parsedIndex;
            return maxIndex;
        }, 0);

        newProduct.alias = newProduct.alias + `-${indexToAdd + 1}`;
    }

    #mutatePhotosFilter(filter) {
        if (typeof filter?.hasPhotos === 'boolean') {
            filter.photos = filter.hasPhotos ? true : null;
            delete filter.hasPhotos;
        }
        if (typeof filter?.hasCoverPhoto === 'boolean') {
            filter.coverPhoto = filter.hasCoverPhoto ? true : null;
            delete filter.hasCoverPhoto;
        }
    }
}

module.exports = ProductsResolver;