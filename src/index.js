
const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs');
const { setTimeout } = require('timers/promises');

async function scrapeData() {
  const browser = await puppeteer.launch({ headless: false }); // Запуск браузера (можно использовать headless: true для работы без интерфейса)
  const page = await browser.newPage();
  
  // Переходим на страницу авторизации
  await page.goto('https://cv-builders-net.b.inno.ws/sign-in');
  
  // Устанавливаем значение в поле "department"
  await page.evaluate(() => {
    const departmentInput = document.querySelector('input.MuiSelect-nativeInput[name="deparment"]');
    if (departmentInput) {
      departmentInput.value = '644912c9-6e5d-4f45-abc3-b2d1714e91d6'; // Устанавливаем нужное значение
    }
  });
  
  await page.click('div#department');
  await page.click('li[data-value="644912c9-6e5d-4f45-abc3-b2d1714e91d6"]');

  // Заполняем поля авторизации
  await page.type('input[name="email"]', 'daria.kiliachenko@innowise.com'); // Заменить на свой логин
  await page.type('input[name="password"]', 'somedefaultsecretpassword112233'); // Заменить на свой пароль
  
  // Кликаем по кнопке входа
  await page.click('button[type="submit"]');
  
  // Ждем загрузки страницы после входа
  await page.waitForSelector('.MuiButtonBase-root.MuiListItemButton-root.MuiListItemButton-gutters.MuiListItemButton-root.MuiListItemButton-gutters');

  // Получаем все кнопки с нужным селектором
  const buttons = await page.$$('.MuiButtonBase-root.MuiListItemButton-root.MuiListItemButton-gutters.MuiListItemButton-root.MuiListItemButton-gutters');
  
  const getButtonTexts = async () => {
    const buttonTexts = await page.$$eval('.MuiButtonBase-root.MuiListItemButton-root.MuiListItemButton-gutters.MuiListItemButton-root.MuiListItemButton-gutters', buttons => {
      return buttons.map(button => button.innerText.trim()); // Получаем текст внутри кнопки и убираем лишние пробелы
    });
    return buttonTexts;
  };

  // Получаем тексты кнопок
  const buttonTexts = await getButtonTexts();

  // Функция для парсинга данных
  const parseData = async () => {
    const items = await page.$$eval('.MuiTableCell-root.MuiTableCell-body.MuiTableCell-sizeSmall[scope="row"]', (elements) => {
      return elements.map(item => item.innerHTML);
    });
    return items;
  };

  // Функция для клика по кнопкам и сбора данных
  const clickAndParse = async () => {
    const results = {};

    for (let i = 0; i < buttons.length; i++) {
      // Кликаем по каждой кнопке
      await buttons[i].click();


      await setTimeout(1000);

      // Спарсим данные с текущей страницы после клика
      const data = await parseData();
      results[buttonTexts[i]] = data;

      console.log(`Data after clicking button ${i + 1}:`, data);
    }

    return results;
  };

  // Запускаем процесс
  const allResults = await clickAndParse();

  fs.writeFileSync(path.resolve(__dirname, './static/techs.json'),JSON.stringify(allResults));
  console.log('All data collected:', allResults);

  // Закрываем браузер
  await browser.close();
}

// Запускаем функцию
scrapeData().catch(console.error);
п