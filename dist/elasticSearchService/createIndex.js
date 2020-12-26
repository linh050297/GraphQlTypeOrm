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
exports.createIndex = void 0;
const elasticSearchConnect_1 = __importDefault(require("../utils/elasticSearchConnect"));
function createIndex(nameIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        let regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if (regex.test(nameIndex) === true) {
            return false;
        }
        nameIndex = nameIndex.toLowerCase();
        yield elasticSearchConnect_1.default.indices.create({
            index: nameIndex,
        }, function (err, resp, status) {
            console.log("status: ", status);
            if (err) {
                console.log(err);
                return false;
            }
            else {
                console.log("create", resp);
                return resp;
            }
        });
    });
}
exports.createIndex = createIndex;
//# sourceMappingURL=createIndex.js.map