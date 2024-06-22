import { Events } from "discord.js";

export const event = {
	name: Events.MessageCreate,
	once : false,
	async execute(message) {
		if(message.author.bot) return;

		const messageToFind = ["put", "putt"];
		const content = message.content.toLowerCase();

		let found = false;
		messageToFind.forEach(text => {
			const regex = new RegExp(`\\b` + text + `\\b`);
			found = regex.test(content);
		});

		if (found)
			message.channel.send("Put put");
			//console.log(`Message read: ${message.content}`)

	},
};