import { 
    Client, 
    Collection, 
    Events, 
    GatewayIntentBits 
} from 'discord.js';
import { readdirSync } from "fs";
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createLogger, format, transports } from 'winston';
import StartScheduler from './job_scheduler.js';
import * as db from './services/db-util.js';
import 'dotenv/config';

const { combine, timestamp, label, printf } = format;
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: 'bot' }),
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console()
  ],
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

/* REGISTER SLASH COMMANDS FOR DISCORD */
client.commands = new Collection();
const __dirname = dirname(fileURLToPath(import.meta.url));
const commandsRoot = join(__dirname, "commands");

// Read all files from command directory
const commandFiles = [];
readdirSync(commandsRoot).forEach(category => {
	readdirSync(join(commandsRoot, category)).map(file => {
		if (file.endsWith('.js'))
			commandFiles.push(`./commands/${category}/${file}`);
	});
});

try {
	logger.info(`Attempting to register command modules...`);
	for (const file of commandFiles) {
		const { command } = await import(file);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
	}
	logger.info(`Successfully registered (${commandFiles.length}) commands`);
}
catch (e) {
	logger.error(e);
}

// Read all events
const eventsRoot = join(__dirname, "events");
const eventFiles = [];
readdirSync(eventsRoot).forEach(file => {
	if (file.endsWith('.js'))
		eventFiles.push(`./events/${file}`);
});

try {
	logger.info(`Attempting to register event modules...`);
	for (const file of eventFiles) {
		const { event } = await import(file);
		if (event.once)
			client.once(event.name, (...args) => event.execute(...args));
		else
			client.on(event.name, (...args) => event.execute(...args));
	}
	logger.info(`Successfully registered (${eventFiles.length}) events`);
}
catch (e) {
	logger.error(e);
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	logger.info(`${readyClient.user.tag} System Online.`);
});

db.initDb();
StartScheduler(client);

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);