import { db, dbLogger } from "./db-util.js";

export const insertVehicleData = async (page, jsonData) => {
  try {
    db`
      INSERT INTO wtwiki_schema.vehicle(page, data)
      VALUES (${page}, ${jsonData})`

    return { success: true };
  }
  catch (e) {
    dbLogger.error("Error encountered inserting into table vehicle\n" + e);
  }

  return { success: false };
}