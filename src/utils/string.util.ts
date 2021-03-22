const toHyphen = (string: string) => {
  return string.toLowerCase().replace(/\s+/g, '-');
};

const toUnderscore = (string: string) => {
  return string.toLowerCase().replace(/\s+/g, '_');
};

const pathify = (path: string) => {
  const splitted = path.split('/');
  const src = splitted.includes('src');
  const api = splitted.includes('api');
  if (src || api) {
    const index = src ? splitted.findIndex( entry => entry === 'src') : splitted.findIndex( entry => entry === 'api');
    return src ? splitted.slice(0, index).join('/') : splitted.slice(0, index - 1).join('/');
  }
  return path.lastIndexOf('/') === path.length - 1 ? path.substr(0, path.length - 2) : path;
};

export { toHyphen, toUnderscore, pathify };