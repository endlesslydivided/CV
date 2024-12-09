import { parseCVText } from "./parse/cv.parser";
import * as fs from 'fs';
import * as path from 'path';
import { findMatches, findTechnologies } from "./parse/requirements.parser";

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

  if (cvText) {
    const parsedCV = parseCVText(cvText);

    console.log(JSON.stringify(parsedCV, null, 2));

    fs.writeFileSync(path.join(resultsDir, 'result.txt'), JSON.stringify(parsedCV, null, 2));
  } else {
    console.error('Не удалось прочитать текст из файла CV.');
  }

  if (requirementsText) {
    const parsedRequirementsTechs = findTechnologies(requirementsText);
    const parsedRequirementsKeywords = findMatches(requirementsText);

    console.log(parsedRequirementsTechs);
    console.log(parsedRequirementsKeywords);

  } else {
    console.error('Не удалось прочитать текст из файла Requirements.');
  }
};

main();
