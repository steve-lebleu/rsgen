import * as fs from 'fs';
import * as pluralize from 'pluralize';
import * as Listr from 'listr';
import * as inquirer from 'inquirer';
import * as camelcase from 'camelcase';
import * as chalk from 'chalk';

import { write, remove, getIndex } from '@utils/file.util';
import { validate } from '@utils/validation.util';
import { toHyphen, toPermissions } from '@utils/string.util';

/**
 * @class Generate
 */
export class Generate {

  static description = 'Generate files for Typeplate project'

  /**
   * @description
   */
  private readonly TEMPLATES: Array<ITemplate> = [
    { name: 'model', dest: 'models', ext: 'ts' },
    { name: 'controller', dest: 'controllers', ext: 'ts' },
    { name: 'repository', dest: 'repositories', ext: 'ts' },
    { name: 'validation', dest: 'validations', ext: 'ts' },
    { name: 'route', dest: 'routes/v1', ext: 'ts' },
    { name: 'test', dest: '../../test/e2e', ext: 'js' },
    { name: 'fixture', dest: '../../test/utils/fixtures/entities', ext: 'js' },
  ];

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
  private do({...args}): void {

    const { isModule, pascalCase, camelCase, lowerCase, pascalCasePlural, camelCasePlural, lowerCasePlural, permissions } = args;

    const templates = this.TEMPLATES;
    const path = process.cwd();
    const hyphen = toHyphen(lowerCase.toString());

    const tasks = new Listr([
      {
        title: 'Directory creating',
        task: () =>  {
          try {
            if (isModule) {
              fs.mkdirSync(`${path}/src/api/resources/${hyphen}`, { recursive: true });
            } 
            fs.mkdirSync(`${path}/test/e2e`, { recursive: true });
          } catch(e) { process.stdout.write( chalk.red(e.message) ); }
        }
      },
      {
        title: 'Files writing',
        task: () =>  {
          
          const patterns: IPattern[] = [
            { regex: /{{LOWER_CASE}}/ig, value: lowerCase },
            { regex: /{{PASCAL_CASE}}/ig, value: pascalCase },
            { regex: /{{CAMEL_CASE}}/ig, value: camelCase },
            { regex: /{{LOWER_CASE_PLURAL}}/ig, value: lowerCasePlural },
            { regex: /{{PASCAL_CASE_PLURAL}}/ig, value: pascalCasePlural },
            { regex: /{{CAMEL_CASE_PLURAL}}/ig, value: camelCasePlural },
            { regex: /{{HYPHEN_PLURAL}}/ig, value: pluralize.plural( hyphen ) },
            { regex: /{{PERMISSIONS}}/ig, value: permissions.map(role => `ROLE.${role}`).join(', ') },
            { regex: /{{MODEL}}/ig, value: isModule ? `@resources/${hyphen}/${hyphen}.model` : `@models/${hyphen}.model` },
            { regex: /{{CONTROLLER}}/ig, value: isModule ? `@resources/${hyphen}/${hyphen}.controller` : `@controllers/${hyphen}.controller` },
            { regex: /{{REPOSITORY}}/ig, value: isModule ? `@resources/${hyphen}/${hyphen}.repository` : `@repositories/${hyphen}.repository` },
            { regex: /{{VALIDATION}}/ig, value: isModule ? `@resources/${hyphen}/${hyphen}.validation` : `@validations/${hyphen}.validation` },
            { regex: /{{ROUTE}}/ig, value: isModule ? `@resources/${hyphen}/${hyphen}.route` : `@routes/${hyphen}.route` }
          ];

          try {
            templates.forEach( async ( template: ITemplate ) => {
              write({ isModule, template, patterns, lowerCase });
            });
          } catch(e) { process.stdout.write( chalk.red(e.message) ); }
          
        }
      },
      {
        title: 'Route indexing',
        task: () => {
          let indexImport = null, indexDeclaration = null;
          const data = fs.readFileSync(`${process.cwd()}/src/api/core/services/proxy-router.service.ts`).toString().split('\n');
          data.forEach((line, idx) => {
            if (/import/.test(line) === true) {
              indexImport = idx + 1;
            }
            if (/{ segment: \'\/[a-z-]{1,}\/\', provider: [a-zA-Z]{1,}Router }/.test(line) === true) {
              indexDeclaration = idx + 2;
            }
          });
          if (isModule) {
            data.splice(indexImport, 0, `import { ${pascalCase}Router } from '@resources/${hyphen}/${hyphen}.route';`);
          } else {
            data.splice(indexImport, 0, `import { ${pascalCase}Router } from '@routes/${hyphen}.route';`);
          }
          data[indexDeclaration - 1] = data[indexDeclaration - 1] + ',';
          data.splice(indexDeclaration, 0, `    { segment: '/${pluralize.plural(hyphen)}/', provider: ${pascalCase}Router }`);
          fs.writeFileSync(`${process.cwd()}/src/api/core/services/proxy-router.service.ts`, data.join('\n'));
        }
      },
      {
        title: 'Test indexing',
        task: () => {
          const data = fs.readFileSync(`${process.cwd()}/test/e2e/00-api.e2e.test.js`).toString().split('\n');
          data.splice(data.length - 2, 0, `  require(\'./0${getIndex() - 1}-${hyphen}-routes.e2e.test\');`);
          fs.writeFileSync(`${process.cwd()}/test/e2e/00-api.e2e.test.js`, data.join('\n'));
        }
      },
      {
        title: 'Fixture indexing',
        exitOnError: false,
        task: () => {
          fs.appendFileSync(`${process.cwd()}/test/utils/fixtures/entities/index.js`, `\nexports.${lowerCase} = require('./${lowerCase}.fixture');`);
        },
        skip: () => {
          return fs.existsSync(`${path}/test/utils/fixtures/entities`) === false;
        }
      }
    ], { concurrent: false });

    tasks
      .run()
      .then( (result: any) => {
        process.stdout.write(chalk.bold.green('Done !\n'));
      })
      .catch( (err: Error) => {
        remove(isModule, templates, lowerCase);
        process.stdout.write( chalk.red('O_Ops ... an error has occurred !\n'));
        process.stdout.write( chalk.red(err.message) );
        process.exit(0);
      });
  }

  /**
   * @description
   */
  private async confirm({...args}): Promise<any> {

    const { name, target, permissions } = args;

    let confirmation = {} as any;

    return new Promise ( async (resolve, reject) => {

      Object.assign(confirmation, await inquirer.prompt([{
        name: 'confirm',
        message: `You will generate ${name} in the ${ (target === '-r' || target === '--resources' || target === 'Resources') ? process.cwd() + '/src/api/resources/' + toHyphen(name) + '/' : process.cwd() + '/src/api/core/' } directory with ${permissions} access rights. You confirm ?`,
        type: 'confirm',
        default: true
      }]));

      resolve(confirmation);

    }); 
  }

  /**
   * @description
   */
  private async ask(): Promise<IAnswerGenerate> {

    let answers = {} as any;

    return new Promise ( async (resolve, reject) => {

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
        validate: async function(input: any) {
          if (/[a-z]{3,}/.test(input) === false) {
            return 'Entity name should only contains alphabetical chars (3 at least)'
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
        validate: async function(input: any) {
          if(!input.toString()) {
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
  private populate( {...args} ) {
    return {
      isModule: ['-r', '--resources', 'Resources'].includes(args.target),
      pascalCase: camelcase(args.name, { pascalCase: true }),
      camelCase: camelcase(args.name, { pascalCase: false }),
      lowerCase: args.name.toString().toLowerCase(),
      pascalCasePlural: camelcase( pluralize.plural(args.name), { pascalCase: true } ),
      camelCasePlural: camelcase( pluralize.plural(args.name), { pascalCase: false } ),
      lowerCasePlural: pluralize.plural(args.name),
      permissions: args.permissions
    }
  }

  /**
   * @description
   * 
   * @param argsv 
   */
  async run([bin, path, name, target, permissions]: string[]) {
    
    if (name) {
      
      const errors = validate({name, target: target || '-r', permissions: permissions ? '-p=' + toPermissions(permissions).join(',') : '-p=admin' });
      
      if (errors.length > 0) {
        process.stdout.write( `${chalk.bold.red('o_Ops, it doesn\'t work ...')}` );
        errors.forEach(e => {
          process.stdout.write( `\n${chalk.gray('-')} ${chalk.red(e)}` );
        });
        process.stdout.write( `\n${chalk.bold.cyan('Command pattern:')} ${chalk.gray('rsgen <name> [<target>] [<permissions>]')}` );
        process.stdout.write( `\n${chalk.gray('-')} ${chalk.bold.cyan('<name>')} ${chalk.gray('entity name as string')}` );
        process.stdout.write( `\n${chalk.gray('-')} ${chalk.bold.cyan('<target>')} ${chalk.gray('-c (core) or -r (resource). Default: -r')}` );
        process.stdout.write( `\n${chalk.gray('-')} ${chalk.bold.cyan('<permissions>')} ${chalk.gray('-p=[a,u,g]|[admin,user,ghost]. Default: admin')}\n` );
        process.exit(0);
      }

      const confirmation = await this.confirm({name, target: target || '-r', permissions: permissions ? toPermissions(permissions).join(',') : 'admin' });

      if (confirmation.confirm) {
        this.do( this.populate( { name, target: target || '-r', permissions: permissions ? toPermissions(`-p=${permissions}`) : ['admin'] } ) );
      }  
      
    } else {
      const answers = await this.ask();
      if (answers.confirm) {
        this.do( this.populate( { name: answers.name, target: answers.target, permissions: answers.permissions ? toPermissions(`-p=${answers.permissions}`) : ['admin'] } ) );
      }
    }
  }
}
