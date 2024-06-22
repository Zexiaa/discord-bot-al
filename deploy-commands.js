import { 
    REST, 
    Routes 
} from 'discord.js';
import { readdirSync } from "fs";
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

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

const commandsList = [];
try {
	console.log(`Attempting to import command modules...`)
	for (const file of commandFiles) {
		const { command } = await import(file);
		commandsList.push(command.data.toJSON());
	}
	console.log(`Import success!`)
}
catch (e) {
	console.error(e);
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
(async () => {
	try {
		console.log(`Started refreshing ${commandsList.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
			{ body: commandsList },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();