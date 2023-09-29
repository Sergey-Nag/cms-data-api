const { kebabCase } = require("lodash");
const EditableModel = require("../models/baseModels/EditableModel");
const ImageContent = require("../models/content/ImageContent");
const PriceHistory = require("./PriceHistory");
const ProductCharacteristic = require("./ProductCharacteristic");
const ProductOption = require("./ProductOption");
const Stock = require("./Stock");

class Product extends EditableModel {
    constructor({
        name, alias, description, price = 0, priceHistory, 
        categoriesId, tags, coverPhotoUrl, photosUrl,
        stock, characteristics, options, isPublished,
        ...data 
    }) {
        super(data, 'PT');

        this.name = name;
        this.alias = alias ?? kebabCase(name);
        this.description = description ?? null;
        this.price = price;
        this.priceHistory = this.#getPriceHistory(priceHistory, price, data.createdById);
        this.categoriesId = categoriesId ?? [];
        this.tags = tags ?? [];
        this.stock = new Stock(stock);
        this.characteristics = this.#getCharacteristics(characteristics);
        this.options = this.#getOptions(options);
        this.isPublished = isPublished ?? false;
        this.coverPhotoUrl = coverPhotoUrl ?? null;
        this.photosUrl = photosUrl ?? null;
    }

    update({
        name = this.name, 
        alias = this.alias, 
        description = this.description, 
        categoriesId = this.categoriesId, 
        tags = this.tags, 
        coverPhotoUrl = this.coverPhotoUrl, 
        photosUrl = this.photosUrl,
        characteristics = this.characteristics,
        options = this.options,
        isPublished = this.isPublished,
        price,
        stock,
    }, modifiedById) {
        this.name = name;
        this.alias = alias;
        this.description = description;
        this.categoriesId = categoriesId;
        this.tags = tags;
        this.characteristics = this.#getCharacteristics(characteristics);
        this.isPublished = isPublished;
        this.photosUrl = photosUrl;
        this.coverPhotoUrl = coverPhotoUrl;
        this.options = this.#getOptions(options);

        if (stock) {
            this.stock.update(stock);
        }

        if (price) {
            this.price = price;
            this.priceHistory.push(new PriceHistory(price, modifiedById));
        }

        super.update(modifiedById);
    }

    #getPriceHistory(priceHistory, price, createdById) {
        return priceHistory
            ? priceHistory.map(data => new PriceHistory(data))
            : [new PriceHistory(price, createdById)];
    }

    #getCharacteristics(chars) {
        return chars
            ? chars.map((char) => new ProductCharacteristic(char))
            : null
    }

    #getOptions(options) {
        return options
            ? options.map(opt => new ProductOption(opt))
            : null;
    }
}

module.exports = Product;