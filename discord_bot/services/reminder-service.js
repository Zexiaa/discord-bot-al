import { db_reminderTable } from '../../constants/constants.js';
import { db, dbLogger } from './db-util.js';

export const insertReminder = async (userId, channelId, triggerDate, messageText) => {
    
    try {
        const insert = db.prepare(`INSERT INTO ${db_reminderTable}(userid, channelid, triggerdate, messagetext)
                    VALUES (${userId}, ${channelId}, ${triggerDate}, ${messageText})`);

        const res = db.transaction(() => {
            insert.run();
        })
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
        const res = db.prepare(`
            SELECT * FROM ${db_reminderTable}
            WHERE triggerdate >= DATETIME('now')
            AND triggerdate < DATETIME('now', '+30 minutes')
        `).all();
        dbLogger.info(`Successfully found ${res.length} reminders.`)
        return { success: true, data: res };
    }
    catch (e) {
        dbLogger.error(`Error retrieving data ` + e);
    }

    return { success: false };
}

export const getReminderById = async (id) => {
    console.log(`Attempting to get reminder by id ${id}`);
    try {
        const res = await db`
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
        const res = await db`
            SELECT * FROM al_schema.reminder_message
            WHERE triggerDate < (SELECT CURRENT_TIMESTAMP)
        `

        if (res.length > 0) {
            await db`
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
        const res = await db`
            SELECT * FROM al_schema.reminder_message
            WHERE id = ${id}
        `
        if (res.length > 0) {
            await db`
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