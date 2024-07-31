import { codeBlock, SlashCommandBuilder } from "discord.js";

export const command = {
  data: new SlashCommandBuilder()
  .setName('deletemessages')
  .setDescription('Deletes the previous messages'),
	async execute(interaction) {
    await interaction.reply("WIP");
    //message.channel.messages.fetch({limit: x})
	},
};