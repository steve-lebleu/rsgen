"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndex = exports.getSegment = exports.remove = exports.write = void 0;
require('module-alias/register');
const fs = require("fs");
const chalk = require("chalk");
const string_util_1 = require("@utils/string.util");
/**
 * @descriptionn
 */
const getIndex = () => {
    let index;
    if (fs.existsSync(`${process.cwd()}/test/e2e/`)) {
        const files = fs.readdirSync(`${process.cwd()}/test/e2e/`) || [];
        if (files.length > 0) {
            index = files.length;
        }
    }
    return index;
};
exports.getIndex = getIndex;
/**
 * @description
 *
 * @param isModule
 * @param template
 * @param lowerCase
 */
const getSegment = (isModule, template, lowerCase) => {
    let segment = '';
    if (template.name === 'test') {
        segment = `test/e2e/0${getIndex().toString()}-${string_util_1.toHyphen(lowerCase)}-routes.e2e`;
    }
    else if (template.name === 'fixture') {
        segment = `test/utils/fixtures/entities/${string_util_1.toHyphen(lowerCase)}`;
    }
    else {
        segment = isModule ? `src/api/resources/${string_util_1.toHyphen(lowerCase)}/${string_util_1.toHyphen(lowerCase)}` : `src/api/core/${template.dest}/${string_util_1.toHyphen(lowerCase)}`;
    }
    return segment;
};
exports.getSegment = getSegment;
/**
 * @description
 *
 * @param isModule boolean
 * @param template ITemplate
 * @param patterns IPattern
 * @param lowerCase string
 */
const write = async ({ ...args }) => {
    const { isModule, template, patterns, lowerCase } = args;
    const tpl = fs.readFileSync(`${__dirname}/../../templates/${template.name}.txt`, 'utf-8');
    const output = patterns.reduce((acc, current) => {
        return acc.replace(current.regex, current.value);
    }, tpl);
    const target = `${process.cwd()}/${getSegment(isModule, template, lowerCase)}.${template.name}.${template.ext}`;
    if (!fs.existsSync(target)) {
        fs.writeFile(target, output, { flag: 'w' }, (err) => {
            if (err) {
                throw new Error(`Error while ${template.name} file generating : ${err.message}`);
            }
            fs.chmodSync(target, parseInt('0777', 8));
        });
    }
};
exports.write = write;
/**
 *
 */
const remove = async (isModule, templates, lowerCase) => {
    templates.forEach(template => {
        if (isModule) {
            fs.unlink(`${process.cwd()}/src/api/resources/${string_util_1.toHyphen(lowerCase)}/${string_util_1.toHyphen(lowerCase)}.${template.name}.${template.ext}`, (err) => {
                process.stdout.write(chalk.red(err.message));
            });
        }
        else {
            fs.unlink(`${process.cwd()}/src/api/core/${template.dest}/${string_util_1.toHyphen(lowerCase)}.${template.name}.${template.ext}`, (err) => {
                process.stdout.write(chalk.red(err.message));
            });
        }
        if (template.name === 'test') {
            const files = fs.readdirSync(`${process.cwd()}/test/e2e/`);
            const target = files.filter(file => file.includes(string_util_1.toHyphen(lowerCase))).pop();
            fs.unlink(`${process.cwd()}/test/e2e/${target}`, (err) => {
                process.stdout.write(chalk.red(err.message));
            });
            fs.unlink(`${process.cwd()}/test/fixtures/entities/${string_util_1.toHyphen(lowerCase)}.${template.name}.${template.ext}`, (err) => {
                process.stdout.write(chalk.red(err.message));
            });
        }
    });
};
exports.remove = remove;
