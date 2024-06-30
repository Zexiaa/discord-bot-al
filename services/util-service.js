import { sql } from './db-util.js';

export const insertReminder = async (createdBy, triggerDate, messageText) => {
    
    try {
        await sql`
            INSERT INTO al_schema.reminder_message(createdBy, triggerDate, messageText)
            VALUES (${createdBy}, ${triggerDate}, ${messageText})
        `
        return { success: true }
    }
    catch (e) {
        console.error(`Error inserting to table reminder_message ` + e);
    }

    return { success: false }
}