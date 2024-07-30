// import tencentCloud from "tencentcloud-sdk-nodejs";
const tencentCloud = require("tencentcloud-sdk-nodejs");
import chalk from "chalk";
import { MultiBar, Presets } from "cli-progress";
export class TranslateAction {
  client: any;
  signleBar: any;
  multiBar: MultiBar;
  constructor(
    type = "tenxun",
    credential: { secretId?: string; secretKey?: string },
    region = "ap-shanghai"
  ) {
    this.signleBar = {};
    this.multiBar = new MultiBar(
      {
        clearOnComplete: false,
        hideCursor: true,
        format: "{filename} | {bar} | {percentage}%  {eta}s"
      },
      Presets.shades_grey
    );
    const tmtClient = tencentCloud.tmt.v20180321.Client;
    this.client = new tmtClient({
      credential,
      region
    });
  }
  sleep = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  };
  createSingleBar = (targetLang = "en", num = 100) => {
    const bar = this.multiBar.create(num, 0, { filename: targetLang });
    // const bar = new cliProgress.SingleBar(
    //   {
    //     format: `${chalk.cyan(`${targetLang}-翻译进度:`)} [{bar}] {percentage}%`
    //   },
    //   cliProgress.Presets.shades_classic
    // );
    this.signleBar[targetLang] = bar;
  };
  async translateWithTencent(sourceTexts: string[], targetLang = "en") {
    const result: { [k: string]: string } = {};
    const length = sourceTexts.length;
    const stepTranslate = Math.ceil(length / 100);
    const sourctTextStep: string[][] = [];
    if (!this.signleBar[targetLang]) {
      this.createSingleBar(targetLang, stepTranslate);
    }
    const bar = this.signleBar[targetLang];
    for (let i = 0; i < stepTranslate; i += 1) {
      sourctTextStep.push(sourceTexts.slice(i * 100, (i + 1) * 100));
    }
    while (sourctTextStep.length) {
      const text = sourctTextStep.pop();
      if (text) {
        const resultText = await this.excuteTranslateWithTencent(
          text,
          targetLang
        );
        for (const i in text) {
          result[text[i]] = resultText[i];
        }
        // console.log(resultText, text, "======");

        // result.push(...resultText);
      }

      bar.increment();
      await this.sleep();
    }
    bar.stop();
    setTimeout(() => {
      delete this.signleBar[targetLang];
      if (Object.values(this.signleBar).length <= 0) {
        this.multiBar.stop();
      }
    }, 300);

    return result;
  }
  /**
   * 腾讯云翻译方法
   * @param {string[]} sourceTexts 待翻译的原文列表
   * @param {string} targetLang 目标语言（如 "en"）
   * @returns {Promise<string[]>} 翻译后的文本列表
   */
  async excuteTranslateWithTencent(sourceTexts: string[], targetLang = "en") {
    targetLang = targetLang === "zh-tw" ? "zh-TW" : targetLang;
    // 发送POST请求
    const ret = new Promise((resolve, reject) => {
      this.client.TextTranslateBatch(
        {
          SourceTextList: sourceTexts,
          Source: "zh",
          Target: targetLang,
          ProjectId: 0
        },
        (err: any, resp: { TargetTextList?: string[] }) => {
          if (err) return reject(err);

          resolve(resp?.TargetTextList as string[]);
        }
      );
    });

    // 解析响应
    const data = await ret;
    return data as string[];
  }
}
