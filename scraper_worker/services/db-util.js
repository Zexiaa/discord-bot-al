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
        CREATE TABLE IF NOT EXISTS wtwiki_schema.vehicle (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          data JSONB NOT NULL,
          contenthash TEXT NOT NULL
        )`

      await db`
        ALTER DEFAULT PRIVILEGES IN SCHEMA wtwiki_schema
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
          TO scraper
        `

      await db`
        ALTER DEFAULT PRIVILEGES IN SCHEMA wtwiki_schema
          GRANT SELECT ON TABLES
          TO albot
        `
    });
  }
  catch (e) {
    const url = `postgres://${process.env.PG_USER}:[[hidden_password]]@${process.env.PG_HOST}:${process.env.PG_PORT}/${pg_database}`;
    dbLogger.error(`Error connecting database to database at ${url}:\n` + e);
  }
};

export const disconnectDb = async () => {
  await db.end({ timeout: 5 });
}
