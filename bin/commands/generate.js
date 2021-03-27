"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generate = void 0;
const fs = require("fs");
const pluralize = require("pluralize");
const Listr = require("listr");
const inquirer = require("inquirer");
const execa = require("execa");
const camelcase = require("camelcase");
const chalk = require("chalk");
const file_util_1 = require("@utils/file.util");
const validation_util_1 = require("@utils/validation.util");
const string_util_1 = require("@utils/string.util");
/**
 * @class Generate
 */
class Generate {
    constructor() {
        /**
         * @description
         */
        this.TEMPLATES = [
            { name: 'model', dest: 'models', ext: 'ts' },
            { name: 'controller', dest: 'controllers', ext: 'ts' },
            { name: 'repository', dest: 'repositories', ext: 'ts' },
            { name: 'validation', dest: 'validations', ext: 'ts' },
            { name: 'route', dest: 'routes/v1', ext: 'ts' },
            { name: 'test', dest: '../../test/e2e', ext: 'js' },
        ];
    }
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
    do({ ...args }) {
        const { isModule, pascalCase, camelCase, lowerCase, pascalCasePlural, camelCasePlural, lowerCasePlural, permissions } = args;
        const templates = this.TEMPLATES;
        const path = process.cwd();
        const hyphen = string_util_1.toHyphen(lowerCase.toString());
        const tasks = new Listr([
            {
                title: 'Directory creating',
                task: () => {
                    try {
                        if (isModule) {
                            fs.mkdirSync(`${path}/src/api/resources/${hyphen}`, { recursive: true });
                        }
                        fs.mkdirSync(`${path}/test/e2e`, { recursive: true });
                    }
                    catch (e) {
                        process.stdout.write(chalk.red(e.message));
                    }
                }
            },
            {
                title: 'Files writing',
                task: () => {
                    const patterns = [
                        { regex: /{{LOWER_CASE}}/ig, value: lowerCase },
                        { regex: /{{PASCAL_CASE}}/ig, value: pascalCase },
                        { regex: /{{CAMEL_CASE}}/ig, value: camelCase },
                        { regex: /{{LOWER_CASE_PLURAL}}/ig, value: lowerCasePlural },
                        { regex: /{{PASCAL_CASE_PLURAL}}/ig, value: pascalCasePlural },
                        { regex: /{{CAMEL_CASE_PLURAL}}/ig, value: camelCasePlural },
                        { regex: /{{HYPHEN_PLURAL}}/ig, value: pluralize.plural(hyphen) },
                        { regex: /{{PERMISSIONS}}/ig, value: permissions.map(role => `ROLE.${role}`).join(', ') },
                        { regex: /{{MODEL}}/ig, value: isModule ? `@resources/${hyphen}/${hyphen}.model` : `@models/${hyphen}.model` },
                        { regex: /{{CONTROLLER}}/ig, value: isModule ? `@resources/${hyphen}/${hyphen}.controller` : `@controllers/${hyphen}.controller` },
                        { regex: /{{REPOSITORY}}/ig, value: isModule ? `@resources/${hyphen}/${hyphen}.repository` : `@repositories/${hyphen}.repository` },
                        { regex: /{{VALIDATION}}/ig, value: isModule ? `@resources/${hyphen}/${hyphen}.validation` : `@validations/${hyphen}.validation` },
                        { regex: /{{ROUTE}}/ig, value: isModule ? `@resources/${hyphen}/${hyphen}.route` : `@routes/${hyphen}.route` }
                    ];
                    try {
                        templates.forEach(async (template) => {
                            file_util_1.write({ isModule, template, patterns, lowerCase });
                        });
                    }
                    catch (e) {
                        process.stdout.write(chalk.red(e.message));
                    }
                }
            },
            {
                title: 'Fixtures creating',
                exitOnError: false,
                task: () => execa('touch', [path + '/test/utils/fixtures/entities/' + hyphen + '.fixture.js']).then((result) => {
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
            process.stdout.write(chalk.bold.green('Done !\n'));
        })
            .catch((err) => {
            file_util_1.remove(isModule, templates, lowerCase);
            process.stdout.write(chalk.red('O_Ops ... an error has occurred !\n'));
            process.stdout.write(chalk.red(err.message));
            process.exit(0);
        });
    }
    /**
     * @description
     */
    async confirm({ ...args }) {
        const { name, target, permissions } = args;
        let confirmation = {};
        return new Promise(async (resolve, reject) => {
            Object.assign(confirmation, await inquirer.prompt([{
                    name: 'confirm',
                    message: `You will generate ${name} in the ${(target === '-r' || target === '--resources' || target === 'Resources') ? process.cwd() + '/api/resources/' + string_util_1.toHyphen(name) + '/' : process.cwd() + '/api/core/'} directory with ${permissions} access rights. You confirm ?`,
                    type: 'confirm',
                    default: true
                }]));
            resolve(confirmation);
        });
    }
    /**
     * @description
     */
    async ask() {
        let answers = {};
        return new Promise(async (resolve, reject) => {
            Object.assign(answers, await inquirer.prompt([{
                    name: 'target',
                    message: 'Where you want to generate the files ?',
                    type: 'list',
                    choices: ['Core', 'Resources'],
                    default: 1
                }]));
            Object.assign(answers, await inquirer.prompt([{
                    name: 'name',
                    message: 'Entity name :',
                    type: 'input',
                    validate: async function (input) {
                        if (/[a-z]{3,}/.test(input) === false) {
                            return 'Entity name should only contains alphabetical chars (3 at least)';
                        }
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
            Object.assign(answers, await this.confirm(answers));
            resolve(answers);
        });
    }
    /**
     * @description
     */
    populate({ ...args }) {
        return {
            isModule: ['-r', '--resources', 'Resources'].includes(args.target),
            pascalCase: camelcase(args.name, { pascalCase: true }),
            camelCase: camelcase(args.name, { pascalCase: false }),
            lowerCase: args.name.toString().toLowerCase(),
            pascalCasePlural: camelcase(pluralize.plural(args.name), { pascalCase: true }),
            camelCasePlural: camelcase(pluralize.plural(args.name), { pascalCase: false }),
            lowerCasePlural: pluralize.plural(args.name),
            permissions: args.permissions
        };
    }
    /**
     * @description
     *
     * @param argsv
     */
    async run([bin, path, name, target, permissions]) {
        if (name) {
            const errors = validation_util_1.validate({ name, target: target || '-r', permissions: permissions ? '-p=' + string_util_1.toPermissions(permissions).join(',') : '-p=admin' });
            if (errors.length > 0) {
                process.stdout.write(`${chalk.bold.red('o_Ops, it doesn\'t work ...')}`);
                errors.forEach(e => {
                    process.stdout.write(`\n${chalk.gray('-')} ${chalk.red(e)}`);
                });
                process.stdout.write(`\n${chalk.bold.cyan('Command pattern:')} ${chalk.gray('rsgen <name> [<target>] [<permissions>]')}`);
                process.stdout.write(`\n${chalk.gray('-')} ${chalk.bold.cyan('<name>')} ${chalk.gray('entity name as string')}`);
                process.stdout.write(`\n${chalk.gray('-')} ${chalk.bold.cyan('<target>')} ${chalk.gray('-c (core) or -r (resource). Default: -r')}`);
                process.stdout.write(`\n${chalk.gray('-')} ${chalk.bold.cyan('<permissions>')} ${chalk.gray('-p=[a,u,g]|[admin,user,ghost]. Default: admin')}\n`);
                process.exit(0);
            }
            const confirmation = await this.confirm({ name, target: target || '-r', permissions: permissions ? string_util_1.toPermissions(permissions).join(',') : 'admin' });
            if (confirmation.confirm) {
                this.do(this.populate({ name, target: target || '-r', permissions: permissions ? string_util_1.toPermissions(`-p=${permissions}`) : ['admin'] }));
            }
        }
        else {
            const answers = await this.ask();
            if (answers.confirm) {
                this.do(this.populate({ name: answers.name, target: answers.target, permissions: answers.permissions ? string_util_1.toPermissions(`-p=${answers.permissions}`) : ['admin'] }));
            }
        }
    }
}
exports.Generate = Generate;
Generate.description = 'Generate files for Typescript / Express.js / Typeorm project';
