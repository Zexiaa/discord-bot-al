import { db, dbLogger } from "./db-util.js";

export const getVehicleByName = async (name) => {
  try {
    const res = await db`
      SELECT data
      FROM wtwiki_schema.vehicle
      WHERE LOWER(name)=${name.toLowerCase()}
      `
    return { success: true, data: res };
  }
  catch (e) {
    dbLogger.error("Error encountered\n" + e);
  }

  return { success: false };
}

export const getAllVehicleNames = async () => {
  try {
    const res = await db`
      SELECT name
      FROM wtwiki_schema.vehicle
      `
    
    return { success: true, data: res };
  }
  catch (e) {
    dbLogger.error("Error encountered\n" + e);
  }

  return { success: false };
}