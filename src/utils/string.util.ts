const toHyphen = (string: string): string => {
  return string.toLowerCase().replace(/\s+/g, '-');
};

const toUnderscore = (string: string): string => {
  return string.toLowerCase().replace(/\s+/g, '_');
};

const pathify = (path: string): string => {
  const splitted = path.split('/');
  const src = splitted.includes('src');
  const api = splitted.includes('api');
  if (src || api) {
    const index = src ? splitted.findIndex( entry => entry === 'src') : splitted.findIndex( entry => entry === 'api');
    return src ? splitted.slice(0, index).join('/') : splitted.slice(0, index - 1).join('/');
  }
  return path.lastIndexOf('/') === path.length - 1 ? path.substr(0, path.length - 2) : path;
};

const toPermissions = (string: string): Array<string> => {
  return Array.from( new Set( string.split('=')[1].split(',') ) )
    .filter(role => ['a','u','g','admin','user','ghost'].includes(role))
    .map(role => role === 'u' ? 'user' : role === 'a' ? 'admin' : role === 'g' ? 'ghost' : role);
};

export { toPermissions, toHyphen, toUnderscore, pathify };