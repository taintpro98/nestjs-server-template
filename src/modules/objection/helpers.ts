export function pick(
  obj: Record<string, any>,
  props: string | string[],
): Record<string, any> {
  const newObj = {} as Record<string, any>;
  // eslint-disable-next-line no-prototype-builtins
  if (typeof props === 'string' && obj.hasOwnProperty(props)) {
    newObj[props] = obj[props];
  }

  if (Array.isArray(props)) {
    for (const prop of props) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(prop)) {
        newObj[prop] = obj[prop];
      }
    }
  }

  return newObj;
}

export const getRelationsFromIncludes = (
  include: string,
  ignores: Array<string>,
): string => {
  const tree = convertStringToObject(include);
  ignores.forEach((item) => {
    delete tree[item];
  });

  return `[${convertTreeToString(tree)}]`;
};

export function convertStringToObject(
  include: string[] | string | object = '',
): Record<string, any> {
  if (include instanceof Object) {
    return include;
  }

  let includes;

  if (Array.isArray(include)) {
    includes = include.join(',');
  } else if (typeof include === typeof String()) {
    includes = include.trim();
  }
  const result = {};

  function set(parts, mainMap) {
    let map = mainMap;
    for (const item of parts) {
      map[item] = map[item] || {};
      map = map[item];
    }
  }

  includes
    .split(',')
    .map((item) => item.split('.'))
    .forEach((parts) => {
      set(parts, result);
    });

  return result;
}

export function convertTreeToString(data: object = {}): string {
  const keys = Object.keys(data);
  let result = '';
  for (let i = 0; i < keys.length; i++) {
    if (Object.keys(data[keys[i]]).length > 0) {
      result += `${keys[i]}.[${convertTreeToString(data[keys[i]])}]`;
    } else {
      result += keys[i];
    }
    if (i < keys.length - 1) {
      result += ',';
    }
  }
  return `${result}`;
}

export function convertObjectToString(
  data: string[] | string | object = '',
): string {
  if (data instanceof Object) {
    const result: any[] = [];

    // eslint-disable-next-line no-inner-declarations
    function dfs(path: string[], currentObject: any) {
      if (Object.keys(currentObject).length === 0) {
        result.push([...path].join('.'));
      }
      for (const key of Object.keys(currentObject)) {
        path.push(key);
        dfs(path, currentObject[key]);
        path.pop();
      }
    }

    dfs([], data);
    return result.join(',');
  }
  return data;
}
