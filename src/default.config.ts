import { Config, Rule } from "../types";

// 参数path，在生成配置文件时需要展示在文件里，所以这里去掉eslint校验
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCustomizeKey(key: string, path?: string): string {
  key = key.replace(/\./g, "_");
  const [type, ...fullPathArr] = (path || "").slice(4, -4).split("/");
  if (type === "views") {
    const [moduleName] = fullPathArr;
    return `${moduleName}.${key}`;
  }
  return `common.${key}`;
}

export const importCode = `var _i18n_t = (...args) => {
  const text = ref('')
  import('@locales/index').then((_i18n)=>{
      try {
          const __t = _i18n.default.global.t;
          text.value= __t(...args);
        } catch (e) {}
  });
return text\n}\n\n`;

function getCommonRule(): Rule {
  return {
    caller: "",
    functionName: "_i18n_t",
    customizeKey: getCustomizeKey,
    importDeclaration: importCode
  };
}

const config: Config = {
  input: "src",
  output: "",
  secretId: "",
  secretKey: "",
  exclude: ["**/node_modules/**/*"],
  rules: {
    js: getCommonRule(),
    ts: getCommonRule(),
    cjs: getCommonRule(),
    mjs: getCommonRule(),
    jsx: {
      ...getCommonRule(),
      functionSnippets: ""
    },
    tsx: {
      ...getCommonRule(),
      functionSnippets: ""
    },
    vue: {
      caller: "",
      importDeclaration: importCode,
      functionNameInTemplate: "$t", // vue这里的配置，仅针对vue的template标签里面的内容生效
      functionNameInScript: "_i18n_t", // vue这里的配置，仅针对vue的script部分export default里面的内容生效
      customizeKey: getCustomizeKey,
      tagOrder: ["template", "script", "style"]
    }
  },
  prettier: {
    semi: false,
    singleQuote: true
  },
  incremental: false,
  skipExtract: false,
  localePath: "./locales/module",
  localeFileType: "json",
  excelPath: "./locales/excel/locales.xlsx",
  exportExcel: false,
  skipTranslate: true,
  locales: ["en", "zh-tw"],
  globalRule: {
    ignoreMethods: ["defineProps"]
  },
  // 参数currentFileKeyMap和currentFilePath，在生成配置文件时需要展示在文件里，所以这里去掉eslint校验
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  adjustKeyMap(allKeyValue, currentFileKeyMap, currentFilePath) {
    return allKeyValue;
  }
};

export default config;
