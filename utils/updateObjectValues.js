function updateObjectValues(objOld, objNew) {
    let obj = {...objOld};

    for (let key in objNew) {
        if (typeof obj[key] === 'object') {
            obj[key] = updateObjectValues(objOld[key], objNew[key]);
        } else if (key in obj) {
            obj[key] = obj[key] !== objNew[key] ? objNew[key] : obj[key];
        }
    }

    return obj;
}

module.exports = updateObjectValues;
