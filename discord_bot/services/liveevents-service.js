import { db, dbLogger } from './db-util.js';

export const insertLiveEvent = async (channelId, eventName) => {
  try {
    const res = db`
      INSERT INTO bot_schema.live_events(id, channelid, eventname)
      VALUES (${channelId}, ${eventName}, ${members})
      returning channelid, eventname
      `
    
    return { success: true, data: res };
  }
  catch (e) {
    dbLogger.error(`Failed to insert into ${db_eventsTable}` + e);
  }
  return { success: false};
}