"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeReplacedOutput = void 0;
const fs = require("fs");
const util = require("util");
const ReadFile = util.promisify(fs.readFile);
const writeReplacedOutput = async (path, filename, template, separator, expressions) => {
    let file = await ReadFile(`${__dirname}/../../templates/${template.template}.txt`, 'utf-8');
    let output = file;
    expressions.forEach((expression) => {
        output = output.replace(expression.regex, expression.value);
    });
    let dest = template.template === 'test' ? `${process.cwd()}/test/e2e/0[xx]-${filename}${separator}e2e${separator}${template.template}.${template.ext}` : `${path}/${filename}${separator}${template.template}.${template.ext}`;
    if (!fs.existsSync(dest)) {
        fs.writeFile(dest, output, (err) => {
            if (err) {
                throw new Error(`Error while ${template.template} file generating : ${err.message}`);
            }
            fs.chmodSync(dest, parseInt('0777', 8));
        });
    }
};
exports.writeReplacedOutput = writeReplacedOutput;
