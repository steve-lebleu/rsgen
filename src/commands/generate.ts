import * as fs from 'fs';
import * as pluralize from 'pluralize';
import * as Listr from 'listr';
import * as inquirer from 'inquirer';
import * as execa from 'execa';
import * as camelcase from 'camelcase';

import { IAnswerGenerate } from '@interfaces/IAnswer.interface';
import { writeReplacedOutput } from '@utils/file.util';
import { toHyphen } from '@utils/string.util';

const templates = [
  { template : 'model', dest: 'models', ext: 'ts' },
  { template : 'controller', dest: 'controllers', ext: 'ts' },
  { template : 'repository', dest: 'repositories', ext: 'ts' },
  { template : 'validation', dest: 'validations', ext: 'ts' },
  { template : 'route', dest: 'routes/v1', ext: 'ts' },
  { template : 'test', dest: '../../test/e2e', ext: 'js' },
];

export class Generate {

  static description = 'Generate files for Typescript / Express.js / Typeorm project'

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
  do( templates: ITemplate[], path: string, lowercase: string, capitalize: string, pluralize: string, pluralizeUp: string, permissions: string, isModular: boolean ): void {

    const tasks = new Listr([
      {
        title: 'Directory creating',
        task: () =>  {
          try {
            if (isModular) {
              fs.mkdirSync(`${process.cwd()}/src/api/resources/${lowercase}`, { recursive: true });
            }
          } catch(e) { process.stdout.write(e.message); }
        },
        skip: () => {
          return isModular === false;
        }
      },
      {
        title: 'Files writing',
        task: () =>  {
         
          const expressions = [
            { regex: /{{ENTITY_LOWERCASE}}/ig, value: lowercase },
            { regex: /{{ENTITY_CAPITALIZE}}/ig, value: camelcase(capitalize, { pascalCase: true }) },
            { regex: /{{ENTITY_PLURALIZE}}/ig, value: pluralize },
            { regex: /{{ENTITY_PLURALIZE_UP}}/ig, value: camelcase(pluralizeUp, { pascalCase: true }) },
            { regex: /{{ENTITY_PERMISSIONS}}/ig, value: permissions.toString() },
          ];

          try {
            templates.forEach( async ( template: ITemplate ) => {
              const dest = isModular ? `${path}/src/api/resources/${toHyphen(lowercase)}` : `${path}/src/api/core/${template.dest}` ;
              writeReplacedOutput(dest, toHyphen(lowercase), template, '.', expressions);
            });
          } catch(e) { process.stdout.write(e.message); }
          
        }
      },
      {
        title: 'Fixtures file creating',
        exitOnError: false,
        task: () => execa('touch', [path + '/test/utils/fixtures/entities/' + lowercase + '.fixture.js']).then( (result: any) => {
          if(result.stderr) { throw new Error(result.stdout); }
        }),
        skip: () => {
          return fs.existsSync(`${path}/test/utils/fixtures/entities`) === false;
        }
      }
    ], { concurrent: false });

    tasks
      .run()
      .then( (result: any) => {
        console.log('Done')
      })
      .catch( (err: Error) => {
        templates.forEach( template => {
          if (isModular) {
            fs.unlinkSync(`${path}/src/api/resources/${toHyphen(lowercase)}/${toHyphen(lowercase)}.${template.template}.${template.ext}`);
          } else {
            fs.unlinkSync(`${path}/src/api/core/${template.dest}/${toHyphen(lowercase)}.${template.template}.${template.ext}`);
          }
          fs.unlinkSync(`${path}/src/api/test/e2e/${toHyphen(lowercase)}.e2e.${template.template}.${template.ext}`);
          fs.unlinkSync(`${path}/src/api/test/fixtures/entities/${toHyphen(lowercase)}.${template.template}.${template.ext}`);
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
  async ask(): Promise<IAnswerGenerate> {

    let answers = {} as any;

    return new Promise ( async (resolve, reject) => {

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
        validate: async function(input: any) {
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

      resolve(answers);

    });   
  }

  async run() {

    const answers = await this.ask();

    const isModular     = answers.type === 'Resource module';
    const capitalize    = answers.entity[0].toUpperCase() + answers.entity.substr(1);
    const lowercase     = answers.entity;
    const pluralized    = pluralize.plural(answers.entity);
    const pluralizedUp  = pluralized[0].toUpperCase() + pluralized.substr(1);
    const permissions   = answers.permissions.toString();

    this.do(templates, process.cwd(), lowercase, capitalize, pluralized, pluralizedUp, permissions, isModular);

  }
}
