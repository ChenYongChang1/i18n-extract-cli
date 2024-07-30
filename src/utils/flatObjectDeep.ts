import type { StringObject } from "../../types";
import { isObject } from "./assertType";

/**
 * @example
 * 将{a: {bb: 1}} 转成 {'a.bb': 1}
 */
export function flatObjectDeep(data: StringObject): Record<string, string> {
  const keyValueMap: Record<string, string> = {};
  function collectMap(obj: StringObject, upperKey?: string) {
    Object.keys(obj).forEach((key) => {
      const currentKey = upperKey ? `${upperKey}.${key}` : key;
      const value = obj[key];
      if (isObject(value)) {
        collectMap(value, currentKey);
      } else {
        keyValueMap[currentKey] = value;
      }
    });
  }
  collectMap(data);
  return keyValueMap;
}

export function genreObjectDeep(obj: StringObject) {
  const newObj: StringObject = {};
  const keys = Object.keys(obj);
  for (const key of keys) {
    const keyArr = key.split(".");
    const val = obj[key];
    keyArr.reduce((data, item, index) => {
      if (index >= keyArr.length - 1) {
        data[item] = val;
      } else {
        data[item] = data[item] || {};
        return data[item] as StringObject;
      }
      return data;
    }, newObj);
  }

  return newObj;
}
