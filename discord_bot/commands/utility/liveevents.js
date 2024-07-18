import { blockQuote, SlashCommandBuilder } from "discord.js";

export const command = {
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Create and check live events')
    .addSubcommand(subcommand => 
      subcommand.setName("help")
        .setDescription("Show how to use the command")
    )
    .addSubcommand(subcommand => 
      subcommand.setName("create")
        .setDescription("Creates a new live event name list")
        .addStringOption(option => 
          option.setName("name")
            .setDescription("Name of event")
            .setMaxLength(50)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
      subcommand.setName("list")
        .setDescription("Lists the existing live events")
    )
    .addSubcommand(subcommand => 
      subcommand.setName("names")
        .setDescription("Displays the list of names linked assigned to the event")
        .addStringOption(option =>
          option.setName("event_name")
            .setDescription("Name of event")
            .setMaxLength(50)
            .setRequired(true)
        )
    ),
	async execute(interaction) {
    switch (interaction.options.getSubcommand()) {
      case "help":
        const embed = buildReplyEmbed();
        interaction.reply({ embeds: [embed], ephemeral: true })
        return;
    }
	},
}

const buildReplyEmbed = () => {
  return {
    title: "Event command",
    description: "Command to create and manage events. Each event is essentially an RSVP list to show interest.",
    fields: [
      {
        name: "Usage",
        value: "/event [FLAG] [params]",
        inline: false              
      },
      {
        name: "Available flags",
        value: "HELP, CREATE, LIST, ADDMEMBER, REMOVE, DELETE",
        inline: false
      },
      {
        name: "CREATE [name]",
        value: "Create a new live event with input name",
        inline: false
      },
      {
        name: "LIST",
        value: "Lists all live events",
        inline: false
      },
      {
        name: "ADDMEMBER [event_name] [member_name]",
        value: "Adds the name of a member into the name list of the input event",
        inline: false
      },
      {
        name: "REMOVE [event_name] [member_name]",
        value: "Removes the name of a member from the name list of the input event",
        inline: false
      },
      {
        name: "DELETE [event_name]",
        value: "Removes the event name list",
        inline: false
      }
    ],
  };
}