import { codeBlock, SlashCommandBuilder } from "discord.js";
import * as temp from "pi-temperature";
import osu from "node-os-utils";

export const command = {
	data: new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Check up status of Al'),
	async execute(interaction) {
		const { mem } = osu;

		const RED = "\u001b[0;31m";
		const GREEN = "\u001b[0;32m";
		const WHITE = "\u001b[0;0m";

		const packageVer = process.env.npm_package_version;

		let cpuTemp = `${RED}ERROR`;
		if (process.env.NODE_ENV === "production") {
			temp.measure((err, temp) => {
				if (err) {
					console.error(err); 
					return;
				}

				if (temp > 70) cpuTemp = `${RED}${temp} ${WHITE}degrees`;
				else cpuTemp = `${GREEN}${temp} ${WHITE}degrees`
			})
		}

		let memUsage = `${RED}ERROR`;
		try {
			const memInfo = await mem.info();
			const memTotal = memInfo.totalMemMb;
			const memUsed = memInfo.usedMemMb;
			const memUsedPercent = Math.ceil(memUsed / memTotal * 100);
			if (memUsedPercent > 50)
				memUsage = `${RED}${memUsedPercent}%`;
			else
			memUsage = `${GREEN}${memUsedPercent}%`;
		}
		catch (err) {
			console.error(err);
		}

		const message = codeBlock("ansi",
			`${WHITE}System all ${GREEN}green${WHITE}\n` +
			`${WHITE}Thermals are at ${cpuTemp}${WHITE}\n` +
			`${WHITE}Memory Usage at ${memUsage}${WHITE}\n` +
			`${WHITE}\n` +
			`${WHITE}Al v${packageVer}`
		);

		await interaction.reply(message);
	},
};