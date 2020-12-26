"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("elasticsearch");
const client = new elasticsearch_1.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.2',
    httpAuth: ''
});
exports.default = client;
//# sourceMappingURL=elasticSearchConnect.js.map