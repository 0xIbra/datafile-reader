const csv = require('csv-parser');
const fs = require('fs');
const { Readable } = require('stream');

class CSVReader {

    constructor(filename, options = {}) {
        this._filename = filename;
        this._options = options;
    }

    /**
     * Reads and returns all rows from CSV file.
     *
     * @returns {Promise<[]>}
     */
    async readAll() {
        let results = [];

        await new Promise(resolve => {
            fs.createReadStream(this._filename, {encoding: 'utf8'})
                .pipe(csv(this._options))
                .on('data', (row) => {
                    results.push(row);
                })
                .on('end', () => resolve())
        });

        console.log('Total count:', results.length);

        console.log(results[0])
        return results;
    }

    /**
     * Reads by bulk size, and sends the bulk rows to callback functions.
     *
     * @param bulkSize
     * @param callback
     */
    readCallback(bulkSize = 100, callback) {
        if (! callback instanceof Function) {
            throw new Error('"callback" parameter must be a callable function.')
        }

        let headerSkipped = false;
        let results = [];

        fs.createReadStream(this._filename, {encoding: 'utf8'})
            .pipe(csv(this._options))
            .on('data', (row) => {
                if (headerSkipped === false && this._options['skipHeader'] === true) {
                    headerSkipped = true;
                    return true;
                }

                results.push(row);

                if (results.length % bulkSize === 0) {
                    callback(results);
                    results = [];
                }
            })
            .on('end', () => {
                if (results.length > 0) {
                    callback(results);
                }
            });
    }

    iterate() {
        let readable = new Readable({objectMode: true});
        readable._read = () => {};

        fs.createReadStream(this._filename, {encoding: 'utf8'})
            .pipe(csv(this._options))
            .on('data', data => {
                readable.push(data);
            })
            .on('end', () => readable.destroy());

        return readable;
    }
}

module.exports = CSVReader;
