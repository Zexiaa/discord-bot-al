import { sql } from './db-util.js';
import { DateTime } from 'luxon';

export const insertReminder = async (userId, channelId, triggerDate, messageText) => {
    
    try {
        const res = await sql`
            INSERT INTO al_schema.reminder_message(userid, channelid, triggerdate, messagetext)
            VALUES (${userId}, ${channelId}, ${triggerDate}, ${messageText})
            returning userid, channelid, triggerdate, messagetext
        `

        // TODO Debug this
        // Change to check minutes
        if (DateTime.now() - triggerDate < 30) {
            addReminderTrigger(res.data);
        }

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

export const getReminderById = async (id) => {
    console.log(`Attempting to get reminder by id ${id}`);
    try {
        const res = await sql`
            SELECT * FROM al_schema.reminder_message
            WHERE id = ${id}
        `
        return { success: true, data: res };
    }
    catch (e) {
        console.error(`Error retrieving reminder of id ${id} ` + e);
    }
    return { success: false };
}

export const deleteOverdueReminders = async () => {
    console.log("Attempting to delete reminders before current time...");
    try {
        console.log("Checking for any overdue reminders...");
        const res = await sql`
            SELECT * FROM al_schema.reminder_message
            WHERE triggerDate < (SELECT CURRENT_TIMESTAMP)
        `

        if (res.length > 0) {
            await sql`
                DELETE FROM al_schema.reminder_message
                WHERE triggerDate < (SELECT CURRENT_TIMESTAMP)
            `
            console.log("Successfully deleted.");
        }
        else {
            console.log(`No reminders before current time found!`);
        }        
        return { success: true };
    }
    catch (e) {
        console.error(`Error retrieving data ` + e);
    }

    return { success: false };
}

export const deleteReminderById = async (id) => {
    console.log(`Attempting to delete reminder with id ${id}`);
    try {
        console.log(`Checking if reminder exists...`);
        const res = await sql`
            SELECT * FROM al_schema.reminder_message
            WHERE id = ${id}
        `
        if (res.length > 0) {
            await sql`
                DELETE FROM al_schema.reminder_message 
                WHERE id = ${id}
            `
            console.log(`Reminder successfully deleted.`);
        }
        else {
            console.log(`No reminder of id ${id} found!`);
        }
        return { success: true };
    }
    catch (e) {
        console.error(`Error deleting reminder ` + e);
    }

    return { success: false };
}