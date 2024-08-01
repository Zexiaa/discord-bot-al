import { db, dbLogger } from "./db-util.js";
import { sha1 } from "js-sha1";


export const insertVehicleData = async (jsonData) => {
  try {
    const res = await db`
      SELECT id
      FROM wtwiki_schema.vehicle
      WHERE name=${jsonData.title}
      `

    const contentHash = sha1(JSON.stringify(jsonData));

    let count = 0;
    // Insert if new
    if (res.length < 1) {
      const insert = await db`
        INSERT INTO wtwiki_schema.vehicle(name, data, contenthash)
        VALUES (${jsonData.title}, ${jsonData}, ${contentHash})
        `
      count = insert.length;
    }
    else {
      // Update
      const update = await db`
        UPDATE wtwiki_schema.vehicle
        SET data=${jsonData}, contenthash=${contentHash}
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
