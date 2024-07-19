import { createLogger, format, transports } from 'winston';
import { db_directory, db_eventsTable, db_reminderTable } from '../../constants/constants.js';
import Database from 'better-sqlite3';

const { combine, timestamp, label, printf } = format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const dbLogger = createLogger({
  format: combine(
    label({ label: 'db' }),
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console()
  ],
});

var db;

// Create DB and tables
export const initDb = () => {
    db = new Database(db_directory);
    dbLogger.info(`Successfully connected to database '${db_directory}'`);
    
    try {
        db.exec(`CREATE TABLE IF NOT EXISTS ${db_reminderTable} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userid TEXT NOT NULL,
            channelid TEXT NOT NULL,
            triggerdate TEXT NOT NULL,
            messagetext VARCHAR(100) NOT NULL
        )`);

        db.exec(`CREATE TABLE IF NOT EXISTS ${db_eventsTable} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            eventname TEXT NOT NULL,
            members TEXT
        )`);
    }
    catch (err) {
        dbLogger.error("Error initialising db!");
        throw err;
    }
};

export { db, dbLogger };