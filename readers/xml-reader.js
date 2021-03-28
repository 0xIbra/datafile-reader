const fs = require('fs');
const Stream = require('stream');
const XMLSplitter = require('xml-splitter');

class XMLReader {

    constructor(filename, selector, options = {}) {
        this._filename = filename;
        this._selector = selector;
        this._options = options;

        if (selector == null) {
            throw new Error('"selector" parameter must be provided in order parse XML.');
        }
    }

    /**
     * Reads and returns all objects from XML file.
     *
     * @returns {Promise<[]>}
     */
    async readAll() {
        let results = [];

        await new Promise(resolve => {
            let parser = new XMLSplitter(this._selector, this._options);
            parser.on('data', (data) => {
                results.push(data);
            });

            parser.on('end', () => resolve());

            let stream = fs.createReadStream(this._filename, {encoding: 'utf8'})
                .pipe(parser.stream);
        });

        return results;
    }

    /**
     * Reads and calls the callback function providing read XML objects in the function params.
     *
     * @param bulkSize
     * @param callback
     */
    readCallback(bulkSize, callback) {
        if (! callback instanceof Function) {
            throw new Error('"callback" parameter must be a callable function.')
        }

        let results = [];
        let parser = new XMLSplitter(this._selector, this._options);
        parser.on('data', data => {
            results.push(data);

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

        fs.createReadStream(this._filename, {encoding: 'utf8'})
            .pipe(parser.stream);
    }

    iterate() {
        let readable = new Stream.Readable({ objectMode: true });
        readable._read = () => {};
        let parser = new XMLSplitter(this._selector, this._options);
        parser.on('data', data => {
            readable.push(data);
        })
        parser.on('end', () => readable.destroy())

        let stream = fs.createReadStream(this._filename, {encoding: 'utf8'});
        stream.pipe(parser.stream);

        return readable;
    }
}

module.exports = XMLReader;
