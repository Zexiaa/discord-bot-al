import { db, dbLogger } from "./db-util.js";

export const insertVehicleData = async (jsonData) => {
  try {
    await db`
      INSERT INTO wtwiki_schema.vehicle(name, data)
      VALUES (${jsonData.title}, ${jsonData})
      `

    return { success: true };
  }
  catch (e) {
    dbLogger.error("Error encountered inserting into table vehicle\n" + e);
  }

  return { success: false };
}