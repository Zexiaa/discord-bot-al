import { seedList, domainList } from "./constants.js";
import { createLogger, format, transports } from 'winston';
import ppt from "puppeteer";

const { combine, timestamp, label, printf } = format;
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: 'scr' }),
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console()
  ],
});

const startWarthunderCrawler = async () => {

  let queue = seedList;
  
  const crawler = await ppt.launch({
    headless: true
  });
  const context = await crawler.createBrowserContext();
  const page = await context.newPage();

  logger.info("Scraper worker started.");

  let index = 0;
  while (index < queue.length) {
    const next = queue[index];
    await page.goto(next, {timeout: 0, waitUntil: 'domcontentloaded'});

    // Extract vehicle details
    const isVehicle = await page.$$eval('div', divs => divs.find(html => html.className === "general_info_br"));
    try {
      if (isVehicle) {
        const data = await page.evaluate(() => {
          let brTable = Array.from(document.querySelectorAll('table'));
          

          return {
            title: document.querySelector('.general_info_name').textContent,
            nationFlag: document.querySelector('.general_info_nation').querySelector('img').src,
            rank: document.querySelector('.general_info_rank').textContent,
            br: brTable//{
            //   ab: 
            // }
          } 
        });
        console.log(data)
      }
    }
    catch (e) {
      logger.error(`Error encountered while extracting vehicle details in ${next}\n` + e);
    } 

    // Add pages and proceed to next
    const anchors = await page.$$eval('a', anchors => anchors.map(link => link.href));
    anchors.forEach(url => {
      let domain = "";

      if (url.includes('https://')) {
        domain = url.replace('https://', '').split('/')[0];
      }

      // if (domainList.includes(domain)) {
      //   queue.push(url);
      // }
    })
    index++;
    sleep(1000);
  }
  
  await context.close();
  await crawler.close();
}

const sleep = (waitForMs) => {
  let start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > waitForMs) {
      break;
    }
  }
}

startWarthunderCrawler();