import "dotenv/config";
import postgres from 'postgres';
import { pg_database } from '../constants/constants.js';

export const sql = postgres({
        username: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        database: pg_database
    });

// Create DB and tables
export const checkDb = async () => {
    console.log(`Attempting to connect to DB...`);
    
    try {
        const dbExists = await sql`SELECT datname FROM pg_database`;
        if (!dbExists.some(db => db.datname === pg_database)) {
            console.error(`Database ${pg_database} missing!`);
            return;
        }
        else 
            console.log(`Database ${pg_database} connected!`)
    }
    catch (e) {
        console.error(`Error connecting or creating database: `, e);
    }
};
