"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnErrorResponse = void 0;
exports.returnErrorResponse = (field, message) => {
    return {
        errors: [{
                field,
                message
            }]
    };
};
//# sourceMappingURL=returnError.js.map