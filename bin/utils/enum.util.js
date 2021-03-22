"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toValue = exports.toKeys = exports.toArray = void 0;
const toArray = (e) => {
    const array = [];
    Object.keys(e).forEach((key, index) => {
        if (isNaN(parseInt(key, 10))) {
            array.push({ name: key[0].toUpperCase() + key.substr(1).toLowerCase(), value: e[key] });
        }
    });
    return array;
};
exports.toArray = toArray;
const toKeys = (e) => {
    const array = [];
    Object.keys(e).forEach((key, index) => {
        array.push(e[key]);
    });
    return array;
};
exports.toKeys = toKeys;
const toValue = (e, index) => {
    return e[index];
};
exports.toValue = toValue;
