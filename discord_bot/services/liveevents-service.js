import { sql } from './db-util.js';

export const insertLiveEvent = async (eventName, member) => {
  try {
    await sql`
      INSERT INTO al_schema.live_events(eventname, members)
      VALUES (${eventName}, ${member})`;

    
  }
  catch (e) {
    console.error("Failed to insert into live events " + e)
  }
}