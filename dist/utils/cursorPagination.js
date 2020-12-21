"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cursorPagination = void 0;
exports.cursorPagination = ({ cursorArgument = 'cursor', }) => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }
    };
};
//# sourceMappingURL=cursorPagination.js.map