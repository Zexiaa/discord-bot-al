import { createLogger, format, transports } from 'winston';
import "dotenv/config";
import postgres from 'postgres';

const { combine, timestamp, label, printf } = format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export const dbLogger = createLogger({
  format: combine(
    label({ label: 'db' }),
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console()
  ],
});

const pg_database = 'al_database';

// export const db = postgres({
//   username: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   host: process.env.PG_HOST,
//   port: process.env.PG_PORT,
//   database: pg_database
// });

export const db = postgres(`postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${pg_database}`);

// Create DB and tables
export const initDb = async () => {

  dbLogger.info(`Connecting to database: '${pg_database}'`);

  try {
    const dbExists = await db`SELECT datname FROM pg_database`;
    if (!dbExists.some(db => db.datname === pg_database)) {
      dbLogger.error(`Database ${pg_database} missing!`);
      return;
    }
    else 
      dbLogger.info(`Database ${pg_database} connected!`)

    await db.begin(async db => {
      await db`
        CREATE TABLE IF NOT EXISTS bot_schema.reminder_message (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        channelid TEXT NOT NULL,
        triggerDate TIMESTAMPTZ NOT NULL,
        messagetext CHARACTER VARYING(100) NOT NULL
      )`

      await db`
        CREATE TABLE IF NOT EXISTS bot_schema.live_events (
        id SERIAL PRIMARY KEY,
        channelid TEXT NOT NULL,
        eventname TEXT NOT NULL,
        members TEXT
      )`
    });
  }
  catch (e) {
    const url = `postgres://${process.env.PG_USER}:[[hidden_password]]@${process.env.PG_HOST}:${process.env.PG_PORT}/${pg_database}`;
    dbLogger.error(`Error connecting database to database at ${url}:\n` + e);
  }
};
