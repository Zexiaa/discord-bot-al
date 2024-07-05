import { sql } from './db-util.js';

export const insertReminder = async (userId, triggerDate, messageText) => {
    
    try {
        await sql`
            INSERT INTO al_schema.reminder_message(userId, triggerDate, messageText)
            VALUES (${userId}, ${triggerDate}, ${messageText})
        `
        return { success: true };
    }
    catch (e) {
        console.error(`Error inserting to table reminder_message ` + e);
    }

    return { success: false };
}

export const getRemindersWithinInterval = async () => {
    
    console.log("Attempting to get reminders in 30 minute bracket...");
    try {
       const res = await sql`
            SELECT * FROM al_schema.reminder_message
            WHERE triggerDate >= (SELECT CURRENT_TIMESTAMP) 
            AND triggerDate < (SELECT CURRENT_TIMESTAMP) + INTERVAL'30 minute'
        `
        return { success: true, data: res };
    }
    catch (e) {
        console.error(`Error retrieving data ` + e);
    }

    return { success: false };
}