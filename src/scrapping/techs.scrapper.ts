import puppeteer, { Page, Browser } from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { setTimeout } from 'timers/promises';

const AUTH_EMAIL = 'daria.kiliachenko@innowise.com';
const AUTH_PASSWORD = 'somedefaultsecretpassword112233';
const TECHS_APP_URL = 'https://cv-builders-net.b.inno.ws/sign-in';

// Типы для данных, которые мы будем собирать
interface ParsedData {
  [key: string]: string[];
}

export const scrapeTechs = async () => {
  // Запускаем браузер
  const browser: Browser = await puppeteer.launch({ headless: false });
  const page: Page = await browser.newPage();

  // Переходим на страницу авторизации
  await page.goto(TECHS_APP_URL);

  // Устанавливаем значение в поле "department"
  await page.evaluate(() => {
    const departmentInput = document.querySelector('input.MuiSelect-nativeInput[name="deparment"]') as HTMLInputElement;
    if (departmentInput) {
      departmentInput.value = '644912c9-6e5d-4f45-abc3-b2d1714e91d6'; // Устанавливаем нужное значение
    }
  });

  await page.click('div#department');
  await page.click('li[data-value="644912c9-6e5d-4f45-abc3-b2d1714e91d6"]');

  // Заполняем поля авторизации
  await page.type('input[name="email"]', AUTH_EMAIL); // Заменить на свой логин
  await page.type('input[name="password"]', AUTH_PASSWORD); // Заменить на свой пароль

  // Кликаем по кнопке входа
  await page.click('button[type="submit"]');

  // Ждем загрузки страницы после входа
  await page.waitForSelector('.MuiButtonBase-root.MuiListItemButton-root.MuiListItemButton-gutters.MuiListItemButton-root.MuiListItemButton-gutters');

  // Получаем все кнопки с нужным селектором
  const buttons = await page.$$('.MuiButtonBase-root.MuiListItemButton-root.MuiListItemButton-gutters.MuiListItemButton-root.MuiListItemButton-gutters');

  // Функция для получения текста кнопок
  const getButtonTexts = async (): Promise<string[]> => {
    const buttonTexts = await page.$$eval('.MuiButtonBase-root.MuiListItemButton-root.MuiListItemButton-gutters.MuiListItemButton-root.MuiListItemButton-gutters', buttons => {
      return buttons.map(button => (button as HTMLButtonElement).innerText.trim()); // Получаем текст внутри кнопки и убираем лишние пробелы
    });
    return buttonTexts;
  };

  // Получаем тексты кнопок
  const buttonTexts: string[] = await getButtonTexts();

  // Функция для парсинга данных
  const parseData = async (): Promise<string[]> => {
    const items = await page.$$eval('.MuiTableCell-root.MuiTableCell-body.MuiTableCell-sizeSmall[scope="row"]', (elements) => {
      return elements.map(item => item.innerHTML);
    });
    return items;
  };

  // Функция для клика по кнопкам и сбора данных
  const clickAndParse = async (): Promise<ParsedData> => {
    const results: ParsedData = {};

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
  const allResults: ParsedData = await clickAndParse();

  // Сохраняем результат в файл
  fs.writeFileSync(path.resolve(__dirname, './static/techs.json'), JSON.stringify(allResults));

  console.log('All data collected:', allResults);

  // Закрываем браузер
  await browser.close();
}
