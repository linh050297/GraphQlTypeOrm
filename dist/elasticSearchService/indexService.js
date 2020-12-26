"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIndex = exports.createIndexSearchTitlePost = void 0;
const elasticSearchConnect_1 = __importDefault(require("../utils/elasticSearchConnect"));
function createIndexSearchTitlePost(nameIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        let regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if (regex.test(nameIndex) === true) {
            return false;
        }
        nameIndex = nameIndex.toLowerCase();
        let body = {
            "settings": {
                "analysis": {
                    "filter": {
                        "autocomplete_filter": {
                            "type": "edge_ngram",
                            "min_gram": 1,
                            "max_gram": 8
                        }
                    },
                    "analyzer": {
                        "autocomplete": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": [
                                "lowercase",
                                "autocomplete_filter"
                            ]
                        }
                    }
                }
            },
            "mappings": {
                "properties": {
                    "text": {
                        "type": "text",
                        "analyzer": "autocomplete",
                        "search_analyzer": "autocomplete"
                    }
                }
            }
        };
        return new Promise((resolve, reject) => {
            elasticSearchConnect_1.default.indices.create({
                index: nameIndex,
                body: {
                    settings: {
                        index: {
                            number_of_replicas: 0
                        }
                    }
                }
            }, function (err, resp, status) {
                console.log("status: ", status);
                if (err) {
                    console.log('err:', typeof err);
                    console.log('err: ', err);
                    return reject(false);
                }
                else {
                    console.log("create:", resp);
                    resolve(resp.acknowledged);
                }
            });
        });
    });
}
exports.createIndexSearchTitlePost = createIndexSearchTitlePost;
function deleteIndex(nameIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        let regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if (regex.test(nameIndex) === true) {
            return false;
        }
        nameIndex = nameIndex.toLowerCase();
        yield elasticSearchConnect_1.default.indices.delete({ index: nameIndex }, function (err, resp, status) {
            console.log("status: ", status);
            if (err) {
                console.log("err: ", err);
                return false;
            }
            else {
                return resp.acknowledged;
            }
        });
    });
}
exports.deleteIndex = deleteIndex;
//# sourceMappingURL=indexService.js.map