require('module-alias/register');

import * as fs from 'fs';
import * as chalk from 'chalk';

import { toHyphen } from '@utils/string.util';

/**
 * @descriptionn
 */
const getIndex = () => {
  let index: number;
  if ( fs.existsSync(`${process.cwd()}/test/e2e/`) ) {
    const files = fs.readdirSync(`${process.cwd()}/test/e2e/`) || [];
    if (files.length > 0) {
      index = files.length;
    }
  } 
  
  return index;
}

/**
 * @description
 *
 * @param isModule 
 * @param template 
 * @param lowerCase 
 */
const getSegment = (isModule: boolean, template: ITemplate, lowerCase: string): string => {
  let segment: string = '';
  if (template.name === 'test') {
    segment = `test/e2e/0${getIndex().toString()}-${toHyphen(lowerCase)}-routes.e2e`
  } else if (template.name === 'fixture') {
    segment = `test/utils/fixtures/entities/${toHyphen(lowerCase)}`;
  } else {
    segment = isModule ? `src/api/resources/${toHyphen(lowerCase)}/${toHyphen(lowerCase)}` : `src/api/core/${template.dest}/${toHyphen(lowerCase)}`;
  }
  return segment;
};

/**
 * @description
 * 
 * @param isModule boolean 
 * @param template ITemplate 
 * @param patterns IPattern 
 * @param lowerCase string 
 */
const write = async ({...args}) => {

  const { isModule, template, patterns, lowerCase } = args;
  
  const tpl = fs.readFileSync(`${process.cwd()}/src/templates/${template.name}.txt`, 'utf-8');

  const output = patterns.reduce( (acc, current) => {
    return acc.replace(current.regex, current.value);
  }, tpl);

  const target = `${process.cwd()}/${getSegment(isModule, template, lowerCase)}.${template.name}.${template.ext}`;

  if (!fs.existsSync(target) && ( isModule || ( !isModule && !['business.service','data-layer.service'].includes(template.name) ) ) ) {
    fs.writeFile(target, output, { flag: 'w' }, (err) => {
      if(err) { throw new Error(`Error while ${template.name} file generating : ${err.message}`); }  
      fs.chmodSync(target, parseInt('0777', 8));
    });
  }
  
};

/**
 * 
 */
const remove = async (isModule: boolean, templates: Array<ITemplate>, lowerCase: string) => {
  templates.forEach( template => {

    if (isModule) {
      fs.unlink(`${process.cwd()}/src/api/resources/${toHyphen(lowerCase)}/${toHyphen(lowerCase)}.${template.name}.${template.ext}`, (err) => {
        process.stdout.write( chalk.red(err.message) );
      });
    } else {
      fs.unlink(`${process.cwd()}/src/api/core/${template.dest}/${toHyphen(lowerCase)}.${template.name}.${template.ext}`, (err) => {
        process.stdout.write( chalk.red(err.message) );
      });
    }

    if (template.name === 'test') {
      const files = fs.readdirSync(`${process.cwd()}/test/e2e/`);
      const target = files.filter(file => file.includes(toHyphen(lowerCase))).pop();
      fs.unlink(`${process.cwd()}/test/e2e/${target}`, (err) => {
        process.stdout.write( chalk.red(err.message) );
      });
      fs.unlink(`${process.cwd()}/test/fixtures/entities/${toHyphen(lowerCase)}.${template.name}.${template.ext}`, (err) => {
        process.stdout.write( chalk.red(err.message) );
      });
    }
  });
};

export { write, remove, getSegment, getIndex };
