"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUnderscore = exports.toHyphen = exports.toPermissions = void 0;
const toHyphen = (string) => {
    return string.toLowerCase().replace(/\s+/g, '-');
};
exports.toHyphen = toHyphen;
const toUnderscore = (string) => {
    if (typeof string !== 'string') {
        throw new Error('string must be typed as string');
    }
    return string.toLowerCase().replace(/\s+/g, '_');
};
exports.toUnderscore = toUnderscore;
const toPermissions = (string) => {
    if (typeof string !== 'string') {
        throw new Error('string must be typed as string');
    }
    if (string.lastIndexOf('=') === -1) {
        throw new Error('string must be a permission string (ie -p=admin)');
    }
    return Array.from(new Set(string.split('=')[1].split(',')))
        .filter(role => ['a', 'u', 'g', 'admin', 'user', 'ghost'].includes(role))
        .map(role => role === 'u' ? 'user' : role === 'a' ? 'admin' : role === 'g' ? 'ghost' : role);
};
exports.toPermissions = toPermissions;
