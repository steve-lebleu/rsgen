require('module-alias/register');

import * as fs from 'fs';

import { toHyphen } from '@utils/string.util';

/**
 * 
 * @param input 
 */
const isValidEntityName = (input: string) => {
  return {
    error: /^[a-z]{3,}$/.test(input) === true ? null : `entity name should only contains alphabetical chars (3 at least) : '${input}' given`
  }
};

/**
 * 
 * @param input 
 */
const isValidTarget = (input: string) => {
  const cmds = ['-c', '-r', '--core', '--resources']; 
  return {
    error: cmds.includes(input) ? null : `target should be one of ${cmds.join(', ')} : '${input}' given`
  }
};

/**
 * 
 * @param input 
 */
const isValidPathDestination = ({...args}) => {
  const { name, target } = args;
  const path = target === '-r' || target === '--resources' ? `${process.cwd()}/src/api/resources/${toHyphen(name)}/` : `${process.cwd()}/src/api/core/models/${toHyphen(name)}.model.ts`;
  return {
    error: !fs.existsSync(path) ? null : `${path} already exists`
  }
};

/**
 * 
 * @param input 
 */
const areValidRoles = (input: string) => {
<<<<<<< HEAD
=======
  if (typeof input !== 'string') {
    throw new Error('string must be typed as string');
  }
  if (input.lastIndexOf('=') === -1) {
    throw new Error('string must be a permission string (ie -p=admin)');
  }
>>>>>>> feature/testing
  const roles = ['a', 'u', 'g', 'admin', 'user', 'ghost'];
  const parts = input.split('=');
  if (!['-p', '--permissions'].includes(parts[0])) {
    return {
      error: `permissions should be defined with -p= or --permissions= : '${parts[0]}' given`
    }  
  }
  if (!parts[1].split(',').every(role => roles.includes(role))) {
    return {
      error: `permissions should be assigned with one or many of ${roles.join(', ')} : '${parts[1]}' given`
    }  
  }
  return {
    error: null
  }
}

/**
 * 
 * @param param
 */
const validate = ({...args}) => {
  const { name, target, permissions } = args;
  return [
    {
      handler: isValidEntityName,
      input: name
    },
    {
      handler: isValidTarget,
      input: target
    },
    {
      handler: isValidPathDestination,
      input: { name, target }
    },
    {
      handler: areValidRoles,
      input: permissions
    }
  ]
  .map( (f) => f.handler(f.input).error )
  .filter(error => error);
}

<<<<<<< HEAD
export { validate }
=======
export { isValidEntityName, isValidTarget, isValidPathDestination, areValidRoles, validate }
>>>>>>> feature/testing
