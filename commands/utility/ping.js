import { SlashCommandBuilder } from "discord.js";

export const command = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check up status of Al'),
	async execute(interaction) {
		await interaction.reply('System all green.');
	},
};