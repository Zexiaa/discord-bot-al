import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
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

    if (!res.success) {
      await interaction.reply({ content: "Error encountered.", ephemeral: true });
      return;
    }

    if (res.data.length > 1) {
      // suggest options
      await interaction.reply({ content: "WIP" });
    } 
    else {
      // Just show
      const embed = embedData(res.data[0].data);
      await interaction.reply({ embeds: [embed] });
    }
      
    return;
	},
};

const embedData = (data) => {

  let br = [];
  for (const [key, value] of Object.entries(data.brTable)) {
    br.push( {name: key, value: value });
  }

  return new EmbedBuilder()
    .setColor(0xe31e1c)
    .setTitle(data.title)
    .setURL(data.wikiLink)
    .setAuthor({ name: "War Thunder", iconURL: "https://wiki.warthunder.com/resources/assets/G_logo.png", url: "https://wiki.warthunder.com" })
    .setThumbnail(data.nationFlagUrl)
    .setImage(data.hangarImgUrl)
    .setDescription(data.description)
    .addFields({ name: '\u200b', value: '\u200b' })
    .addFields(
      { name: "Nation", value: data.nation },
      { name: "Class", value: data.vehicleClass.join(", ")},
      { name: "Rank", value: data.rank }
    )
    .addFields(
      Object.entries(data.brTable).map(([key, value]) => { return { name: key, value: value, inline: true } })
    )
    .addFields(
      Object.entries(data.prices).map(([key, value]) => { return { name: key, value: value, inline: true }})
    )
    
}