import { createLogger, format, transports } from 'winston';
import { db_eventsTable, db_reminderTable } from '../CONSTANTS/constants.js';
import * as path from 'path';
import * as fs from "fs";
import Database from 'better-sqlite3';

const __dirname = import.meta.dirname;
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
  const root = path.dirname(path.dirname(__dirname));
  const dbPath = path.join(root, "db");

  dbLogger.info(`Checking folder ${dbPath}`);
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath);
  }

  dbLogger.info(`Connecting to database: '${process.env.SQLITE_DB}'`);
  db = new Database(path.join(dbPath, process.env.SQLITE_DB));

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

  dbLogger.info("Successfully connected to db.");
};

export { db, dbLogger };