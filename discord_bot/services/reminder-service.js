import { db, dbLogger } from './db-util.js';

export const insertReminder = async (userId, channelId, triggerDate, messageText) => {
    
    try {
        const res = await db`
            INSERT INTO bot_schema.reminder_message(userid, channelid, triggerdate, messagetext)
            VALUES (${userId}, ${channelId}, ${triggerDate}, ${messageText})
            returning userid, channelid, triggerdate, messagetext
        `
        return { success: true, data: res };
    }
    catch (e) {
        dbLogger.error(`Error inserting to table reminder_message ` + e);
    }

    return { success: false };
}

export const getRemindersWithinInterval = async () => {
    dbLogger.info("Attempting to get reminders in 30 minute bracket...");
    try {
       const res = await db`
            SELECT * FROM bot_schema.reminder_message
            WHERE triggerDate >= (SELECT CURRENT_TIMESTAMP) 
            AND triggerDate < (SELECT CURRENT_TIMESTAMP) + INTERVAL'30 minute'
        `
        dbLogger.info(`Successfully found ${res.length} reminders.`)
        return { success: true, data: res };
    }
    catch (e) {
        dbLogger.error(`Error retrieving data ` + e);
    }

    return { success: false };
}

export const getReminderById = async (id) => {
    dbLogger.info(`Attempting to get reminder by id ${id}`);
    try {
        const res = await db`
            SELECT * FROM bot_schema.reminder_message
            WHERE id = ${id}
        `
        return { success: true, data: res };
    }
    catch (e) {
        dbLogger.error(`Error retrieving reminder of id ${id} ` + e);
    }
    return { success: false };
}

export const deleteOverdueReminders = async () => {
    dbLogger.info("Attempting to delete reminders before current time...");
    try {
        dbLogger.info("Checking for any overdue reminders...");
        const res = await db`
            SELECT * FROM bot_schema.reminder_message
            WHERE triggerDate < (SELECT CURRENT_TIMESTAMP)
        `

        if (res.length > 0) {
            await db`
                DELETE FROM bot_schema.reminder_message
                WHERE triggerDate < (SELECT CURRENT_TIMESTAMP)
            `
            dbLogger.info("Successfully deleted.");
        }
        else {
            dbLogger.info(`No reminders before current time found!`);
        }        
        return { success: true };
    }
    catch (e) {
        dbLogger.error(`Error retrieving data ` + e);
    }

    return { success: false };
}

export const deleteReminderById = async (id) => {
    dbLogger.info(`Attempting to delete reminder with id ${id}`);
    try {
        dbLogger.info(`Checking if reminder exists...`);
        const res = await db`
            SELECT * FROM bot_schema.reminder_message
            WHERE id = ${id}
        `
        if (res.length > 0) {
            await db`
                DELETE FROM bot_schema.reminder_message 
                WHERE id = ${id}
            `
            dbLogger.info(`Reminder successfully deleted.`);
        }
        else {
            dbLogger.info(`No reminder of id ${id} found!`);
        }
        return { success: true };
    }
    catch (e) {
        dbLogger.error(`Error deleting reminder ` + e);
    }

    return { success: false };
}