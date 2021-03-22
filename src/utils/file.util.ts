import * as fs from 'fs';
import * as util from 'util';

import { IReplacement } from '@interfaces/IReplacement.interface';

const ReadFile = util.promisify(fs.readFile);

const writeReplacedOutput = async ( path: string, filename: string, template: ITemplate, separator: string, expressions: IReplacement[] ) => {

  let file = await ReadFile(`${__dirname}/../../templates/${template.template}.txt`, 'utf-8');
  let output = file;

  expressions.forEach( (expression: IReplacement) => {
    output = output.replace(expression.regex, expression.value);
  });

  let dest = template.template === 'test' ? `${process.cwd()}/test/e2e/0[xx]-${filename}${separator}e2e${separator}${template.template}.${template.ext}` : `${path}/${filename}${separator}${template.template}.${template.ext}`

  if (!fs.existsSync(dest)) {
    fs.writeFile(dest, output, (err) => {
      if(err) { throw new Error(`Error while ${template.template} file generating : ${err.message}`); }  
      fs.chmodSync(dest, parseInt('0777', 8));
    });
  }
  
};

export { writeReplacedOutput };