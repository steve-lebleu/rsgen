import { IList } from '../types/interfaces/IList.interface';

const toArray = ( e: any ): IList[] => {
  const array = [] as IList[];
  Object.keys(e).forEach( (key: any, index: number) => {
    if( isNaN( parseInt(key, 10) ) ) {
      array.push( { name: key[0].toUpperCase() + key.substr(1).toLowerCase(), value: e[key] } );
    }
  });
  return array;
};

const toKeys = ( e: any ): string[] => {
  const array = [] as string[];
  Object.keys(e).forEach( (key: string, index: number) => {
    array.push( e[key] );
  });
  return array;
};

const toValue = (e: any, index: number): any => {
  return e[index];
};

export { toArray, toKeys, toValue };