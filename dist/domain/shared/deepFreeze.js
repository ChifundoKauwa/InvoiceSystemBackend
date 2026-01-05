"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepFreeze = deepFreeze;
function deepFreeze(obj) {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
        const value = obj[prop];
        if (value && typeof value === 'object') {
            deepFreeze(value);
        }
    });
    return Object.freeze(obj);
}
//# sourceMappingURL=deepFreeze.js.map