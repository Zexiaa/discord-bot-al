import ppt from "puppeteer";

const startCrawler = async () => {

  const crawler = await ppt.launch({
    headless: true
  });
  const context = await crawler.createBrowserContext();
  const page = await context.newPage();
  await page.goto('https://wiki.warthunder.com/Main_Page');
  
  await context.close();
  await crawler.close();
  
}


startCrawler();