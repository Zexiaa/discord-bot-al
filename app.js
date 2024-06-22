import { 
    Client, 
    Collection, 
    Events, 
    GatewayIntentBits 
} from 'discord.js';
import { readdirSync } from "fs";
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

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
	console.log(`Attempting to register command modules...`)
	for (const file of commandFiles) {
		const { command } = await import(file);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
	}
	console.log(`Registration success!`)
}
catch (e) {
	console.error(e);
}

// Read all events
const eventsRoot = join(__dirname, "events");
const eventFiles = [];
readdirSync(eventsRoot).forEach(file => {
	if (file.endsWith('.js'))
		eventFiles.push(`./events/${file}`);
});

try {
	console.log(`Attempting to register event modules...`);
	for (const file of eventFiles) {
		const { event } = await import(file);
		if (event.once)
			client.once(event.name, (...args) => event.execute(...args));
		else
			client.on(event.name, (...args) => event.execute(...args));
	}
	console.log(`Successfully registered (${eventFiles.length}) events`);
}
catch (e) {
	console.error(e);
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`${readyClient.user.tag} System Online.`);
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);