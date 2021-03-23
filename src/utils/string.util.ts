require('module-alias/register');

const toHyphen = (string: string): string => {
  if (typeof string !== 'string') {
    throw new Error('string must be typed as string');
  }
  return string.toLowerCase().replace(/\s+/g, '-');
};

const toUnderscore = (string: string): string => {
  if (typeof string !== 'string') {
    throw new Error('string must be typed as string');
  }
  return string.toLowerCase().replace(/\s+/g, '_');
};

const toPermissions = (string: string): Array<string> => {
  if (typeof string !== 'string') {
    throw new Error('string must be typed as string');
  }
  if (string.lastIndexOf('=') === -1) {
    throw new Error('string must be a permission string (ie -p=admin)');
  }
  return Array.from( new Set( string.split('=')[1].split(',') ) )
    .filter(role => ['a','u','g','admin','user','ghost'].includes(role))
    .map(role => role === 'u' ? 'user' : role === 'a' ? 'admin' : role === 'g' ? 'ghost' : role);
};

export { toPermissions, toHyphen, toUnderscore };