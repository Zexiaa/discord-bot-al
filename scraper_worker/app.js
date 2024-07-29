import { seedList } from "./seed.js";
import ppt from "puppeteer";

const startCrawler = async () => {

  const crawler = await ppt.launch({
    headless: true
  });
  const context = await crawler.createBrowserContext();
  const page = await context.newPage();

  for (const seed of seedList){
    await page.goto(seed);
  }
  
  await context.close();
  await crawler.close();
  
}

startCrawler();