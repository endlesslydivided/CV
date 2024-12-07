const fs = require('fs');

// Функция для чтения и обработки файла
function processFile(filePath) {
  // Чтение файла
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Разделяем содержимое на строки
  const lines = fileContent.split('\n').map(line => line.trim());

  // Массив для хранения всех строк
  let allStrings = [];

  // Обрабатываем каждую строку в файле
  lines.forEach(line => {
    // Игнорируем пустые строки
    if (line) {
      // Разделяем строку на массив строк (если элементы массива разделены запятыми)
      const lineArray = line.split(/\s*,\s*/);
      const parsedLines = JSON.parse(lineArray)
      // Убираем символы ; и . в конце каждой строки внутри массива
      const cleanedArray = parsedLines.map(item => item.replace(/[;.]$/, '').trim());

      // Добавляем очищенные строки в общий массив
      allStrings = allStrings.concat(cleanedArray);
    }
  });

  // Удаляем дубликаты, превращая массив в Set, а затем обратно в массив
  const uniqueStrings = [...new Set(allStrings)];

  // Выводим результат
  console.log('Уникальные строки:', uniqueStrings);

  fs.writeFileSync('./resps_unique.json', JSON.stringify(uniqueStrings,null,2))
}

// Пример вызова функции с путем к файлу
processFile('./resps.txt');
