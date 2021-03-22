"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generate = void 0;
const fs = require("fs");
const pluralize = require("pluralize");
const Listr = require("listr");
const inquirer = require("inquirer");
const execa = require("execa");
const camelcase = require("camelcase");
const file_util_1 = require("@utils/file.util");
const string_util_1 = require("@utils/string.util");
const templates = [
    { template: 'model', dest: 'models', ext: 'ts' },
    { template: 'controller', dest: 'controllers', ext: 'ts' },
    { template: 'repository', dest: 'repositories', ext: 'ts' },
    { template: 'validation', dest: 'validations', ext: 'ts' },
    { template: 'route', dest: 'routes/v1', ext: 'ts' },
    { template: 'test', dest: '../../test/e2e', ext: 'js' },
];
class Generate {
    /**
     * Write files into API directory
     *
     * @param {Iwritable[]} templates
     * @param {string} path
     * @param {string} lowercase
     * @param {string} capitalize
     * @param {string} pluralize
     * @param {string} pluralizeUp
     */
    do(templates, path, lowercase, capitalize, pluralize, pluralizeUp, permissions, isModular) {
        const tasks = new Listr([
            {
                title: 'Directory creating',
                task: () => {
                    try {
                        if (isModular) {
                            fs.mkdirSync(`${process.cwd()}/src/api/resources/${lowercase}`, { recursive: true });
                        }
                    }
                    catch (e) {
                        process.stdout.write(e.message);
                    }
                },
                skip: () => {
                    return isModular === false;
                }
            },
            {
                title: 'Files writing',
                task: () => {
                    const expressions = [
                        { regex: /{{ENTITY_LOWERCASE}}/ig, value: lowercase },
                        { regex: /{{ENTITY_CAPITALIZE}}/ig, value: camelcase(capitalize, { pascalCase: true }) },
                        { regex: /{{ENTITY_PLURALIZE}}/ig, value: pluralize },
                        { regex: /{{ENTITY_PLURALIZE_UP}}/ig, value: camelcase(pluralizeUp, { pascalCase: true }) },
                        { regex: /{{ENTITY_PERMISSIONS}}/ig, value: permissions.toString() },
                    ];
                    try {
                        templates.forEach(async (template) => {
                            const dest = isModular ? `${path}/src/api/resources/${string_util_1.toHyphen(lowercase)}` : `${path}/src/api/${template.dest}`;
                            file_util_1.writeReplacedOutput(dest, string_util_1.toHyphen(lowercase), template, '.', expressions);
                        });
                    }
                    catch (e) {
                        process.stdout.write(e.message);
                    }
                }
            },
            {
                title: 'Fixtures file creating',
                exitOnError: false,
                task: () => execa('touch', [path + '/test/utils/fixtures/entities/' + lowercase + '.fixture.js']).then((result) => {
                    if (result.stderr) {
                        throw new Error(result.stdout);
                    }
                }),
                skip: () => {
                    return fs.existsSync(`${path}/test/utils/fixtures/entities`) === false;
                }
            }
        ], { concurrent: false });
        tasks
            .run()
            .then((result) => {
            console.log('Done');
        })
            .catch((err) => {
            templates.forEach(template => {
                if (isModular) {
                    fs.unlinkSync(`${path}/src/api/resources/${string_util_1.toHyphen(lowercase)}/${string_util_1.toHyphen(lowercase)}.${template.template}.${template.ext}`);
                }
                else {
                    fs.unlinkSync(`${path}/src/api/core/${template.dest}/${string_util_1.toHyphen(lowercase)}.${template.template}.${template.ext}`);
                }
                fs.unlinkSync(`${path}/src/api/test/e2e/${string_util_1.toHyphen(lowercase)}.e2e.${template.template}.${template.ext}`);
                fs.unlinkSync(`${path}/src/api/test/fixtures/entities/${string_util_1.toHyphen(lowercase)}.${template.template}.${template.ext}`);
            });
            console.log('');
            console.log('Oh oh ... an error has occurred');
            console.log('');
            console.log(err.message);
        });
    }
    /**
     *
     */
    async ask() {
        let answers = {};
        return new Promise(async (resolve, reject) => {
            Object.assign(answers, await inquirer.prompt([{
                    name: 'type',
                    message: 'What would you like generate ?',
                    type: 'list',
                    choices: ['Core members', 'Resource module'],
                    default: 1
                }]));
            Object.assign(answers, await inquirer.prompt([{
                    name: 'entity',
                    message: 'Entity name :',
                    type: 'input',
                    validate: async function (input) {
                        if (fs.existsSync(`${process.cwd()}/src/api/resources/${input}/`) || fs.existsSync(`${process.cwd()}/src/api/core/models/${input}.model.ts`)) {
                            return 'Entity already exists';
                        }
                        return true;
                    }
                }]));
            Object.assign(answers, await inquirer.prompt([{
                    name: 'permissions',
                    message: 'Authorized roles :',
                    type: 'checkbox',
                    choices: ['admin', 'user', 'ghost'],
                    validate: async function (input) {
                        if (!input.toString()) {
                            return 'Invalid entry : permissions must be admin|user|ghost';
                        }
                        return true;
                    }
                }]));
            resolve(answers);
        });
    }
    async run() {
        const answers = await this.ask();
        const isModular = answers.type === 'Resource module';
        const capitalize = answers.entity[0].toUpperCase() + answers.entity.substr(1);
        const lowercase = answers.entity;
        const pluralized = pluralize.plural(answers.entity);
        const pluralizedUp = pluralized[0].toUpperCase() + pluralized.substr(1);
        const permissions = answers.permissions.toString();
        this.do(templates, process.cwd(), lowercase, capitalize, pluralized, pluralizedUp, permissions, isModular);
    }
}
exports.Generate = Generate;
Generate.description = 'Generate files for Typescript / Express.js / Typeorm project';
