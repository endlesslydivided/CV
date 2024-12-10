import puppeteer from "puppeteer";
import { setTimeout } from 'timers/promises';

export const copyWithFormatting = async (htmlStr: string) => {

    const browser = await puppeteer.launch({headless: false, args:['--window-size=1,1']});
    const page = await browser.newPage();
  
    await page.setContent(htmlStr);
    await page.waitForSelector('#content');
    await setTimeout(1000);
    await page.evaluate(() => {
      const range = document.createRange();
      const content = document.getElementById("content");
      if(content) {
        range.selectNodeContents(content);
      } else {
        range.selectNodeContents(document.body);
      }
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  
    await page.keyboard.down("Control");
    await page.keyboard.press("C");
    await page.keyboard.up("Control");

    console.log("Текст с форматированием скопирован в буфер обмена!");
  
    await browser.close();
}