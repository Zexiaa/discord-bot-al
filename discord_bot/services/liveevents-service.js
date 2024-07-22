import { db_eventsTable } from '../../constants/constants.js';
import { db, dbLogger } from './db-util.js';

export const insertLiveEvent = async (eventName, member) => {
  try {
    const insert = db.prepare(`
      INSERT INTO ${db_eventsTable}(eventname, members)
      VALUES (${eventName}, ${member})`);

    db.transaction(() => {
      insert.run();
    });
    
    dbLogger.info(`Successfully inserted into ${db_eventsTable}`);
  }
  catch (e) {
    dbLogger.error(`Failed to insert into ${db_eventsTable}` + e);
  }
}