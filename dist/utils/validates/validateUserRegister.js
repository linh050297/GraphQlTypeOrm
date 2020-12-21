"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const responses_1 = require("../../resolvers/responses");
const checkInputWithRegex_1 = require("../checkInputWithRegex");
exports.validateRegister = (options) => {
    if (options.username.length < 2) {
        return responses_1.returnErrorResponse('username', "Username is not valid");
    }
    if (options.password.length < 5) {
        return responses_1.returnErrorResponse('password', "Password is not valid");
    }
    if (options.email) {
        let checkEmail = checkInputWithRegex_1.validateEmail(options.email);
        if (checkEmail == false) {
            return responses_1.returnErrorResponse('email', 'Email is not valid');
        }
    }
    ;
    return null;
};
//# sourceMappingURL=validateUserRegister.js.map