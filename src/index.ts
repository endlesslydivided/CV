import { parseCVText } from "./parse/cv.parser";
import * as fs from 'fs';
import * as path from 'path';
import { findMatches, findTechnologies } from "./parse/requirements.parser";
import { beginCheck } from "./cvRules/root.rule";
import { ICVCorrections } from "./cvRules/model";

const resultsDir = path.join(__dirname, '..', 'results');

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

    if (cvCorrections?.commonCorrections) {
      result = '<b>Общие замечания</b>\n'
      cvCorrections?.commonCorrections.forEach((item) => {
        result += `- ${item};\n`
      })
    }

    if (cvCorrections?.projectCorrections) {
      Object.keys(cvCorrections?.projectCorrections)?.forEach(item => {
        const projectCorrections = cvCorrections?.projectCorrections[item].corrections;
        if (projectCorrections.length > 0) {
          result = `<b>${item}</b>\n`;
          projectCorrections.forEach((item) => {
            result += `- ${item};\n`
          })
        }
      });

    }
  }

  fs.writeFileSync(path.join(resultsDir, 'result.md'), result);

};

main();
