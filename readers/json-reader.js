const JSONStream = require('JSONStream');
const fs = require('fs');

class JSONReader {

    constructor(filename, options = {}) {
        this._filename = filename;
        this._options = options;
    }

    _getParseItem() {
        let item = '*';
        if (this._options['parseItem'] != null) {
            item = `${this._options['parseItem']}.*`;
        }

        return item;
    }

    /**
     * Reads and returns all objects from JSON file.
     *
     * @returns {Promise<[]>}
     */
    async readAll() {
        let results = [];

        let item = this._getParseItem();
        await new Promise(resolve => {
            let stream = fs.createReadStream(this._filename, {encoding: 'utf8'});
            let parser = JSONStream.parse(item);
            stream.pipe(parser);
            parser.on('data', data => {
                results.push(data);
            });
            parser.on('end', () => resolve());
        });

        return results;
    }

    /**
     * Reads and calls the callback function providing read JSON objects in the function params.
     *
     * @param bulkSize
     * @param callback
     */
    readCallback(bulkSize = 100, callback) {
        if (! callback instanceof Function) {
            throw new Error('"callback" parameter must be a callable function.')
        }

        let results = [];
        let item = this._getParseItem();
        let stream = fs.createReadStream(this._filename, {encoding: 'utf8'});
        let parser = JSONStream.parse(item);
        stream.pipe(parser);

        parser.on('data', (object) => {
            results.push(object);

            if (results.length % bulkSize === 0) {
                callback(results);
                results = [];
            }
        });
        parser.on('end', () => {
            if (results.length > 0) {
                callback(results);
                results = [];
            }
        });
    }
}

module.exports = JSONReader;
