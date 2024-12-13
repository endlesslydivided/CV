import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import * as path from 'path';
import { copyWithFormatting } from "./copyToClipboard";
import { ICVCorrections } from "./cvRules/model";
import { beginCheck } from "./cvRules/root.rule";
import { parseCVText } from "./parse/cv.parser";
import { findMatches, findTechnologies } from "./parse/requirements.parser";

const resultsDir = path.join(__dirname, '..', 'results');
const logsDir = path.join(__dirname, '..', 'logs');

const readFile = (filePath: string): string => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return fileContent;
  } catch (error) {
    console.error('Ошибка при чтении файла:', error);
    return '';
  }
};

const main = () => {
  const cvFilePath = path.join(resultsDir, 'cv.txt');
  const cvRequirementsPath = path.join(resultsDir, 'requirements.txt');
  const cvText = readFile(cvFilePath);
  const requirementsText = readFile(cvRequirementsPath);

  let parsedCV;
  let techsKeywords;
  let keywords;
  let cvCorrections: ICVCorrections;
  let result = '';

  if (cvText) {
    parsedCV = parseCVText(cvText);

    console.log(JSON.stringify(parsedCV, null, 2));

  } else {
    console.error('Не удалось прочитать текст из файла CV.');
  }

  if (requirementsText) {
    techsKeywords = findTechnologies(requirementsText);
    keywords = findMatches(requirementsText);

  } else {
    console.error('Не удалось прочитать текст из файла Requirements.');
  }

  if (parsedCV && techsKeywords && keywords) {
    cvCorrections = beginCheck({ cv: parsedCV, techsKeywords, keywords });
    if (cvCorrections?.commonCorrections.length) {
      result = '<b>Общие замечания</b>\n'
      cvCorrections?.commonCorrections.forEach((item) => {
        result += `- ${item};\n`
      })
    }

    if (cvCorrections?.projectCorrections) {
      Object.keys(cvCorrections?.projectCorrections)?.forEach(item => {
        const projectCorrections = cvCorrections?.projectCorrections[item].corrections;
          result += `<b>${item}</b>\n`;
          projectCorrections.forEach((item) => {
            result += `- ${item}\n`
          })
          if (projectCorrections.length === 0) {
            result += `Нет замечаний\n`
          }
          result += `\n`;
        
      });

    }
  }
  const markdown = marked(result);
  const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="content">${markdown}</div></body></html>`);
  const styledText = dom.window.document.documentElement.outerHTML;
  copyWithFormatting(styledText)
  fs.writeFileSync(path.join(resultsDir, 'result.md'), result);
  fs.writeFileSync(path.join(logsDir, 'parsedCV.json'), JSON.stringify(parsedCV, null, 2));
};

main();
