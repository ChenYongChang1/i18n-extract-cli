import fs from "fs-extra";
import glob from "glob";
import { CommandOptions, FloderType, StringObject } from "types";
import { getI18nConfig } from "./initConfig";
import { getAbsolutePath } from "./getAbsolutePath";
import getLang, { saveLocale } from "./getLang";
import { TranslateAction } from "./translateAction";
import { genreLocalExportJs } from "./util";

export const getPathFullFile = (filePath: string) => {
  const result = glob.sync(
    `${filePath}/**/*.{cjs,mjs,js,ts,tsx,jsx,vue,json}`,
    {
      ignore: []
    }
  );
  return result;
};

export const getBaseLanguageMap = (localePath: string, language: string) => {
  const baseFullPath = getAbsolutePath(localePath, language);
  const regex = new RegExp(`.*?\\/${language}\\/(.*?)\\..*?`);
  const sourceFilePaths = getPathFullFile(baseFullPath); // [localePath, language].join("/"));
  const fullMap: StringObject = {};
  sourceFilePaths.forEach((sourceFilePath) => {
    const sourceObj = getLang(sourceFilePath);
    const lang = sourceFilePath.match(regex)?.[1];
    const langKey: keyof typeof fullMap = lang!.replace(/\//, ".");
    // Object.keys(sourceObj).forEach((key) => {
    //   const fullKey = [langKey, key].join(".");
    fullMap[langKey] = sourceObj;
    // });
  });

  return fullMap;
};
const translateLanguageByObj = async (
  translate: TranslateAction,
  obj: StringObject,
  lang: string
) => {
  const newObj: StringObject = {};
  for (const i in obj) {
    const module = obj[i];
    newObj[i] = (newObj[i] || {}) as StringObject;
    const strArr = Object.values(module);
    const keyArr = Object.keys(module);
    const result = await translate.translateWithTencent(
      strArr as string[],
      lang
    );
    keyArr.forEach((item, index) => {
      (newObj[i] as StringObject)[item] = result[item];
    });
  }
  //
  return newObj;
};
export const setLanguageModuleSave = (
  languageMapData: StringObject,
  langPath: string
) => {
  const filesPath = Object.keys(languageMapData);
  filesPath.forEach((filePath) => {
    saveLocale(
      [langPath, filePath + ".json"].join("/"),
      languageMapData[filePath] as StringObject
    );
  });
};

export const translateLaguage = (
  options: Pick<CommandOptions, "configFile">
) => {
  const i18nConfig = getI18nConfig(options);
  const { localePath, locales, secretKey, secretId } = i18nConfig;
  const baseLanguageMap = getBaseLanguageMap(localePath, "zh-cn");
  //   console.log(secretKey, secretId, "secretKey, secretId");
  const translate = new TranslateAction("tenxun", {
    secretKey,
    secretId
  });
  locales.forEach(async (item) => {
    const langPath = getAbsolutePath(localePath, item);
    const languageMapData = await translateLanguageByObj(
      translate,
      baseLanguageMap,
      item
    );
    setLanguageModuleSave(languageMapData, langPath);
    genreLocalExportJs(localePath, item);
  });
};
