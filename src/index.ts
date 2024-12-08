import { parseCVText } from "./parse/cv.parser";
import * as fs from 'fs'; 
import * as path from 'path'; 

const staticDir = path.join(__dirname, '..', 'results');  // Статические файлы в папке 'public'

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
  const filePath = path.join(staticDir, 'cv.txt');
  const cvText = readFile(filePath);

  if (cvText) {
    const parsedCV = parseCVText(cvText);

    console.log(JSON.stringify(parsedCV, null, 2));

    fs.writeFileSync(path.join(staticDir, 'result.txt'),JSON.stringify(parsedCV, null, 2));
  } else {
    console.error('Не удалось прочитать текст из файла.');
  }
};

main();
