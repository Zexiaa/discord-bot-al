import { db_reminderTable } from '../CONSTANTS/constants.js';
import { db, dbLogger } from './db-util.js';

export const insertReminder = async (userId, channelId, triggerDate, messageText) => {
    try {
        const insert = db.prepare(`INSERT INTO ${db_reminderTable}(userid, channelid, triggerdate, messagetext)
                    VALUES (${userId}, ${channelId}, ${triggerDate}, ${messageText})`);

        const res = db.transaction(() => {
            insert.run();
        });
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
    dbLogger.info(`Attempting to get reminder by id ${id}`);
    try {
        const res = db.prepare(`
            SELECT * FROM al_schema.reminder_message
            WHERE id = ${id}
        `).get();
        return { success: true, data: res };
    }
    catch (e) {
        dbLogger.error(`Error retrieving reminder of id ${id} ` + e);
    }
    return { success: false };
}

export const deleteOverdueReminders = async () => {
    try {
        dbLogger.info("Checking for any overdue reminders...");
        const res = db.prepare(`
            SELECT * FROM ${db_reminderTable}
            WHERE triggerDate < DATETIME('now')
        `).all();

        if (res.length > 0) {
            const del = db.prepare(`
                DELETE FROM ${db_reminderTable}
                WHERE triggerDate < (SELECT CURRENT_TIMESTAMP)
            `);
            
            const deleted = db.transaction(() => {
                del.run();
            });
            
            dbLogger.info(`Successfully deleted ${deleted.length} reminders.`);
        }
        else {
            dbLogger.info(`No reminders before current time found.`);
        }        
        return { success: true };
    }
    catch (e) {
        dbLogger.error(`Error retrieving data ` + e);
    }

    return { success: false };
}
