import fs from "fs-extra";
import { CommandOptions, StringObject } from "types";
import { getI18nConfig } from "./initConfig";
import { getBaseLanguageMap } from "./translateMoreLanguage";
import { flatObjectDeep } from "./flatObjectDeep";
import { buildExcel, getExcelHeader } from "./excelUtil";
import { getAbsolutePath } from "./getAbsolutePath";

export const exportModuleExcel = (
  options: Pick<CommandOptions, "configFile" | "excelPath">
) => {
  const i18nConfig = getI18nConfig(options);
  const { localePath, excelPath } = i18nConfig;
  const regex = new RegExp(`([A-Za-z-]+.xlsx)`, "g");
  const matchResult = excelPath.match(regex) ?? [];
  const excelFileName = matchResult[0] ?? "";

  const dirs = fs.readdirSync(localePath).filter((i) => !i.includes("."));

  const headers = ["字典 Key", ...dirs];
  const mapData: { [k: string]: StringObject } = {};
  const mapDataInfo: { [k: string]: string[] } = {};

  for (const language of dirs) {
    const result = getBaseLanguageMap(localePath, language);
    const flatResult = flatObjectDeep(result);
    mapData[language] = flatResult;
    Object.keys(flatResult).forEach((item, index) => {
      mapDataInfo[item] = mapDataInfo[item] || [item];
      mapDataInfo[item].push(flatResult[item]);
    });
  }
  const excelBuffer = buildExcel(
    headers,
    Object.values(mapDataInfo),
    excelFileName
  );
  const excelFilePath = getAbsolutePath(process.cwd(), excelPath);
  const absPath = excelFilePath.replace(regex, "").replace(/\/$/, "");
  if (!fs.existsSync(absPath)) {
    // fs.ensureFileSync(absPath);
    fs.mkdirSync(absPath, { recursive: true });
  }
  fs.writeFileSync(excelFilePath, excelBuffer, "utf8");

  //   const baseLanguageMap = getBaseLanguageMap(localePath, "zh-cn");
};
