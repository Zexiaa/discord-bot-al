import { db, dbLogger } from "./db-util.js";

export const insertVehicleData = async (jsonData) => {
  try {
    const res = await db`
      SELECT *
      FROM wtwiki_schema.vehicle
      WHERE name=${jsonData.title}
      `

    let count = 0;
    // Insert if new
    if (res.length < 1) {
      const insert = await db`
        INSERT INTO wtwiki_schema.vehicle(name, data)
        VALUES (${jsonData.title}, ${jsonData})
        `
      count = insert.length;
    }
    else {
      // Update
      const update = await db`
        UPDATE wtwiki_schema.vehicle
        SET data=${jsonData}
        WHERE name=${jsonData.title}`

      count = update.length;
    }

    if (count < 1)
      return { success: false };
    else 
      return { success: true };
  }
  catch (e) {
    dbLogger.error("Error encountered inserting into table vehicle\n" + e);
  }

  return { success: false };
}

export const getLastPageUpdate = async (url) => {
  try {
    const res = await db`
      SELECT datemodified
      FROM wtwiki_schema.visited_page_log
      WHERE url=${url}
      `

    if (res.length > 0)
      return { success: true, data: res[0].datemodified }
  }
  catch (e) {
    dbLogger.error(e);
  }

  return { success: false }
}

export const insertPageLog = async (url, dateModified) => {
  try {
    await db`
      INSERT INTO wtwiki_schema.visited_page_log(url, datemodified)
      VALUES (${url}, ${dateModified})
      `

    return { success: true }
  }
  catch (e) {
    dbLogger.error(e);
  }

  return { success: false }
}

export const updatePageLog = async (url, dateModified) => {
  try {
    await db`
      UPDATE wtwiki_schema.visited_page_log(url, datemodified)
      SET datemodified=${dateModified}
      WHERE url=${url}
      `

    return { success: true }
  }
  catch (e) {
    dbLogger.error(e);
  }

  return { success: false }
}
