import xlsx from "node-xlsx";
import { CommandOptions, StringObject } from "types";
import { getI18nConfig } from "./initConfig";
import fs from "fs-extra";
import {
  getBaseLanguageMap,
  setLanguageModuleSave
} from "./translateMoreLanguage";
import { flatObjectDeep, genreObjectDeep } from "./flatObjectDeep";
import { getAbsolutePath } from "./getAbsolutePath";
import { merge } from "lodash";

export const mergeLanguage = (
  options: Pick<CommandOptions, "configFile" | "excelPath" | "localePath">
) => {
  const i18nConfig = getI18nConfig(options);
  const { excelPath, localePath } = i18nConfig;
  const xlsxData = xlsx.parse(getAbsolutePath(process.cwd(), excelPath))[0]
    .data as string[][];

  const dirs = fs.existsSync(localePath) ? fs.readdirSync(localePath) : [];
  const mapData: { [k: string]: StringObject } = {};
  const newMapData: { [k: string]: StringObject } = {};
  for (const language of dirs) {
    const result = getBaseLanguageMap(localePath, language);
    const flatResult = flatObjectDeep(result);
    mapData[language] = flatResult;
    newMapData[language] = {};
  }

  const [[_, ...header], ...data] = xlsxData;

  data.forEach(([key, ...langs]) => {
    for (const i in langs) {
      newMapData[header[i]] = newMapData[header[i]] || {};
      newMapData[header[i]][key] = langs[i];
    }
  });
  const resultMerge = merge(newMapData, mapData);
  for (const item in resultMerge) {
    const languageData = resultMerge[item];
    const langPath = getAbsolutePath(localePath, item);
    const resultKeyMap = genreObjectDeep(languageData);
    setLanguageModuleSave(resultKeyMap, langPath);
  }
};
