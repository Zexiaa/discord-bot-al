import { codeBlock, SlashCommandBuilder } from "discord.js";
import * as db from "../../services/wtwiki-service.js";

export const command = {
	data: new SlashCommandBuilder()
	.setName('warthunder')
	.setDescription('Look up details from the War Thunder wiki')
	.addStringOption(option => 
    option.setName('vehicle_name')
      .setDescription('Vehicle to look up from the wiki')
      .setRequired(true)
  ),
  async execute(interaction) {
		const name = interaction.options.getString('vehicle_name');
    const res = await db.getVehicleByName(name);

    console.log(res.data[0])

		await interaction.reply("WIP");
	},
};