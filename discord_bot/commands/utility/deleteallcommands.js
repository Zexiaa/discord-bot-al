import { SlashCommandBuilder, REST, Routes } from "discord.js";

export const command = {
	data: new SlashCommandBuilder()
		.setName('guildflush')
		.setDescription('Deletes all the commands registered in this guild'),
	async execute(interaction) {

        if (interaction.user.id !== process.env.DISCORD_OWNER_ID)
            await interaction.reply("Unauthorised access to command.");

        try {
            const rest = new REST().setToken(process.env.DISCORD_TOKEN);
            await rest.put(
                Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, interaction.guildId),
                { body: [] },
            );

            await interaction.reply('\:thumbsup:');
            console.log("Successfully deleted all guild commands.");
        }
        catch (e) {
            console.error("There was an error executing this command:" + e);
        }
	},
};