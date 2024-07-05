import { SlashCommandBuilder } from "discord.js";
import * as db from '../../services/util-service.js';

export const command = {
	data: new SlashCommandBuilder()
		.setName('remindme')
		.setDescription('Set a reminder and a time for Al to ping you')
		.addStringOption(option => 
			option.setName('message')
				.setDescription('The message Al will ping you with')
				.setRequired(true)
				.setMaxLength(100)
		)
		.addStringOption(option => 
			option.setName('date')
				.setDescription('Date for reminder to trigger')
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(2)
		)
		.addStringOption(option => 
			option.setName('month')
				.setDescription('Numerical month for reminder to trigger')
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(2)
		)
		.addStringOption(option => 
			option.setName('year')
				.setDescription('Year for reminder to trigger')
				.setRequired(true)
				.setMinLength(4)
				.setMaxLength(4)
		)
		.addStringOption(option => 
			option.setName('hour')
				.setDescription('24-hour format hour for reminder to trigger')
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(2)
		)
		.addStringOption(option => 
			option.setName('minute')
				.setDescription('Minute for reminder to trigger')
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(2)
		),
	async execute(interaction) {
		const message = interaction.options.getString('message');
		let date = 0;
		let month = 0;
		let year = 0;
		let hour = 0;
		let minute = 0;

		// Validation checks
		try {
			date = parseInt(interaction.options.getString('date'));
			month = parseInt(interaction.options.getString('month'));
			year = parseInt(interaction.options.getString('year'));
			hour = parseInt(interaction.options.getString('hour'));
			minute = parseInt(interaction.options.getString('minute'));
		}
		catch (e) {
			await interaction.reply('The date and time input must be numbers.');
			console.error("Invalid date time input" + e);
			return;
		}

		if (date > 31 || month > 12 || hour > 24 || minute > 60 ||
			date < 1 || month < 1 || hour < 0 || minute < 0
		) {
			const input = `${date}/${month}/${year} ${hour}:${minute}`;
			await interaction.reply({ content: `Date input (${input}) is incorrect.`, ephemeral: true });
			return;
		}

		// Refuse past datetime
		let inputDate = new Date();
		try {
			inputDate = new Date(year, month, date, hour, minute);
			if (inputDate < Date.now()) {
				await interaction.reply({ content: `Date input (${inputDate}) is in the past.`, ephemeral: true });
				return;
			}
		}
		catch (e) {
			console.error("Input date is invalid" + e);
			return;
		}

		const res = await db.insertReminder(interaction.user.id, inputDate, message);
		if (res.success) 
			await interaction.reply(`Roger. I will remind you on ${inputDate}`);

		else
			await interaction.reply(`Error encountered.`);
	},
};