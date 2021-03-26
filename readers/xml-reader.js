const fs = require('fs');
const xml = require('fast-xml-parser');

class XMLReader {

    constructor(filename, options = {}) {
        this._filename = filename;
        this._option = options;
    }

    async readAll() {

    }
}

module.exports = XMLReader;
