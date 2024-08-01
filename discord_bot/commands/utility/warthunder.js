import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import * as ld from "closest-match";
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
		const name = interaction.options.getString('vehicle_name').toLowerCase();
    const search = await getClosestNames(name);
    if (search == null) {
      await interaction.reply({ content: "Error encountered.", ephemeral: true });
      return;
    }

    if (search.length == 1) {
      const res = await db.getVehicleByName(search[0]);

      if (res == null || !res.success) {
        await interaction.reply({ content: "Error encountered.", ephemeral: true });
        return;
      }
  
      const embed = embedData(res.data[0].data);
      await interaction.reply({ embeds: [embed] });
      return;
    }
    else {
      const message = `I could not find a vehicle by name: '${name}'\n` +
        `Did you mean the following:\n`;

      const options = search.map(v => {
        return new ButtonBuilder()
          .setCustomId(v)
          .setLabel(v)
          .setStyle(ButtonStyle.Secondary);
      });

      const buttonRow = new ActionRowBuilder()
        .addComponents(...options);

      const response = await interaction.reply({ content: message, components: [buttonRow] });
      const originalUserFilter = i => i.user.id === interaction.user.id;

      try {
        const query = await response.awaitMessageComponent({ filter: originalUserFilter, time: 10_000 });
        const res = await db.getVehicleByName(query.customId.toLowerCase());
        if (!res.success) {
          await query.update({ content: "Error encountered.", ephemeral: true });
          return;
        }
        const embed = embedData(res.data[0].data);
        await query.update({ embeds: [embed], content: "", components: [] });
      }
      catch (e) {
        await interaction.editReply({ content: "No reply was received or there was an error. Cancelling command...", components: [] });
        console.error(e)
      }

      return;
    }
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
    .setAuthor({ name: "War Thunder", url: "https://wiki.warthunder.com" })
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
      Object.entries(data.prices).map(([key, value]) => { return { 
        name: key,
        value: key === "Purchase" ? value + " SL" : value + " RP",
        inline: true 
      }})
    )
}

const getClosestNames = async (input) => {
  
  let allVehicles = [];
  const allVehCheck = await db.getAllVehicleNames();
  if (!allVehCheck.success) {
    await interaction.reply({ content: "Error encountered.", ephemeral: true });
    return;
  }
  else {
    allVehicles = allVehCheck.data;
  }

  let matches = {};
  allVehicles.forEach(x => {
    const lookup = x.name;
    const levenshteinDistance = ld.distance(input, lookup.toLowerCase());

    // Ignore words that are too different
    if (levenshteinDistance < 3) {

      if (matches[levenshteinDistance] == null) {
        matches[levenshteinDistance] = [lookup];
      }
      else {
        matches[levenshteinDistance].push(lookup);
      }
    }
  });

  const distances = Object.keys(matches).map(k => { return parseInt(k) });
  return matches[Math.min(...distances)];
}