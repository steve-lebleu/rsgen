"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathify = exports.toUnderscore = exports.toHyphen = exports.toPermissions = void 0;
const toHyphen = (string) => {
    return string.toLowerCase().replace(/\s+/g, '-');
};
exports.toHyphen = toHyphen;
const toUnderscore = (string) => {
    return string.toLowerCase().replace(/\s+/g, '_');
};
exports.toUnderscore = toUnderscore;
const pathify = (path) => {
    const splitted = path.split('/');
    const src = splitted.includes('src');
    const api = splitted.includes('api');
    if (src || api) {
        const index = src ? splitted.findIndex(entry => entry === 'src') : splitted.findIndex(entry => entry === 'api');
        return src ? splitted.slice(0, index).join('/') : splitted.slice(0, index - 1).join('/');
    }
    return path.lastIndexOf('/') === path.length - 1 ? path.substr(0, path.length - 2) : path;
};
exports.pathify = pathify;
const toPermissions = (string) => {
    return Array.from(new Set(string.split('=')[1].split(',')))
        .filter(role => ['a', 'u', 'g', 'admin', 'user', 'ghost'].includes(role))
        .map(role => role === 'u' ? 'user' : role === 'a' ? 'admin' : role === 'g' ? 'ghost' : role);
};
exports.toPermissions = toPermissions;
