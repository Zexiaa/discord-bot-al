import { seedList, domainList } from "./constants.js";
import { createLogger, format, transports } from 'winston';
import { disconnectDb, initDb } from "./services/db-util.js";
import { DateTime } from "luxon";
import * as db from "./services/wtwiki-service.js";
import * as cheerio from "cheerio";

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

  // TODO: Check for collisions
  let queue = seedList;
  let index = 0;
  while (index < queue.length) {
    const page = queue[index];
    const urlRoot = 'https://' + page.replace('https://', '').split('/')[0];

    const html = await fetch(page).then(res => res.text());
    const $ = cheerio.load(html);
    
    const updateMsg = $("li[id='footer--lastmod']").first().text();
    const date = updateMsg.split(",")[0].split("on")[1].trim();
    const time = updateMsg.split(",")[1].replace('at', '').replace('.', '').trim();
    const updatedDate = DateTime.fromFormat(`${date} ${time}`, "d MMMM yyyy H:mm", { zone: "utc" });

    let isPageChanged = true;
    const res = await db.getLastPageUpdate(page);    
    if (!res.success) {
      await db.insertPageLog(page, updatedDate);
    }
    else {
      const dataDateString = new Date(res.data).toISOString();
      const lastUpdated = DateTime.fromISO(dataDateString);

      if (updatedDate > lastUpdated) {
        await db.updatePageLog(page, updatedDate);
      }
      else {
        // Page has not changed don't crawl
        isPageChanged = false;
      }
    }

    // Extract details
    if (isPageChanged) {
      const isVehicle = $("div.general_info_br").length > 0;
      if (isVehicle) {
        const details = extractVehicleStats(urlRoot, $);
        details.wikiLink = page;
        await db.insertVehicleData(details);
      }
    }

    // Queue links
    $("a").each((i, e) => {
      const url = $(e).attr("href");
      let domain = "";
      if (url != null && url.includes('https://')) {
        domain = url.replace('https://', '').split('/')[0];
      }

      // if (domainList.includes(domain)) {
      //   queue.push(url);
      // }
    })

    index++;
    // sleep(1000);
  }

  logger.info("Scraping completed. Exiting.");
}

const extractVehicleStats = (urlRoot, $) => {
  // Look for BR table
  var table;
  $("table").each((i, e) => {
    $(e).find("a").each((j, innerel) => {
      if ($(innerel).attr("title") != null &&
      $(innerel).attr("title").includes("Battles")) {
        table = e;
      }
    })
  })
  
  // Extract each row as an array
  const brArr = [...$(table).find("tr")].map(e => 
    [...$(e).find("td")].map(e => $(e).text())
  );

  // Convert into key-value pair
  let brTable = {};
  brArr[0].forEach((key, index) => {
    brTable[key] = brArr[1][index] 
  })

  let classes = [];
  $(".general_info_class a").each((i, e) => {
    classes.push($(e).text())
  })

  let prices = [];
  $(".general_info_price div").each((i, e) => {
    prices.push($(e).text().trim());
  });

  let priceIcons = {};
  $(".general_info_price a").each((i, e) => {
    priceIcons[$(e).attr("title")] = urlRoot + $(e).find("img").first().attr("src");
  });

  const descElem = $("h2 span[id=Description]").first().parent().next();
  let description = "";
  if (descElem != null && $(descElem).has("p")) {
    description = $(descElem).text();
  }

  const details = {
    title: $('.general_info_name').first().text().trim(),
    hangarImgUrl: urlRoot + $(".specs_card_main_slider_system img[width=800]").first().attr("src"),
    nation: $('.general_info_nation').first().text().trim(),
    nationFlagUrl: urlRoot + $('div.general_info_nation img').first().attr("src"),
    rank: $('.general_info_rank').text().trim(),
    brTable: brTable,
    vehicleClass: classes,
    prices: Object.fromEntries(prices.map(p => p.split(":"))),
    priceIcons: priceIcons,
    description: description
  }

  return details;
}

const sleep = (waitForMs) => {
  let start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > waitForMs) {
      break;
    }
  }
}

initDb()
  .then(startWarthunderCrawler)
  .finally(disconnectDb)