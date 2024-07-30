import xlsx from "node-xlsx";
import StateManager from "./stateManager";

export function getExcelHeader(): string[] {
  const { locales } = StateManager.getToolConfig();
  const header = ["字典key", "zh-CN"];
  for (const locale of locales) {
    header.push(locale);
  }
  return header;
}

export function buildExcel(
  headers: string[],
  data: string[][],
  name: string
): Buffer {
  const sheetOptions: Record<string, any> = {};
  sheetOptions["!cols"] = [];
  headers.forEach(() => {
    sheetOptions["!cols"].push({
      wch: 50 // 表格列宽
    });
  });

  data.unshift(headers);
  const buffer = xlsx.build([{ options: {}, name, data }], { sheetOptions });
  return buffer;
}

// export const exportModuleExcel = (
//   options: Pick<CommandOptions, "configFile" | "excelPath">
// ) => {
//   const i18nConfig = getI18nConfig(options);
//   const { localePath, excelPath, locales } = i18nConfig;
//   const matchResult =
//     excelPath.match(new RegExp(`([A-Za-z-]+.xlsx)`, "g")) ?? [];
//   const excelFileName = matchResult[0] ?? "";

//   const headers = ["字典 Key", "zh-cn", ...locales];
//   const mapData: { [k: string]: StringObject } = {};
//   const resultBody: string[][] = [];
//   //   console.log(dirs, "dirs");

//   for (const language of ["zh-cn", ...locales]) {
//     const result = getBaseLanguageMap(localePath, language);
//     const flatResult = flatObjectDeep(result);
//     mapData[language] = flatResult;
//   }
//   console.log(mapData, "mapData");

//   const zhcnData = mapData["zh-cn"];
//   for (const i in zhcnData) {
//     const row = [i, zhcnData[i] as string];
//     locales.forEach((litem) => {
//       row.push((mapData[litem] as StringObject)?.[i] as string);
//     });
//     resultBody.push(row);
//   }
//   //   console.log(resultBody, "resultBody");

//   //   for(const i in mapData){
//   //     const data = mapData[i]
//   //     for(const j in data){

//   //     }
//   //     // mapDataInfo[item] = mapDataInfo[item] || [item];
//   //   }
//   //   Object.keys(flatResult).forEach((item, index) => {
//   //     mapDataInfo[item] = mapDataInfo[item] || [item];
//   //     mapDataInfo[item].push(flatResult[item]);
//   //   });
//   const excelBuffer = buildExcel(headers, resultBody, excelFileName);
//   fs.writeFileSync(
//     getAbsolutePath(process.cwd(), excelPath),
//     excelBuffer,
//     "utf8"
//   );

//   //   const baseLanguageMap = getBaseLanguageMap(localePath, "zh-cn");
// };
