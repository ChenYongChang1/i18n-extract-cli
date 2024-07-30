import fs from "fs-extra";
export const genreLocalExportJs = (localePath: string, language: string) => {
  const template = `const data = import.meta.glob('./${language}/*.json', { eager: true });
  
    const genreLanguageJson = module => {
      const mapData = {};
      for (const i in module) {
        const [, key] = i.match(/\\.\\/${language}\\/(.*?)\\.json/) || [];
        const resultData = module[i].default;
        mapData[key] = resultData;
      }
      return mapData;
    };
    
    export default genreLanguageJson(data);`;
  fs.writeFile([localePath, `${language}.js`].join("/"), template, (e) => {});
};
