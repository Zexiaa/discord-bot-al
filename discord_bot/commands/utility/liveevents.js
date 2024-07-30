import { blockQuote, codeBlock, SlashCommandBuilder } from "discord.js";
import * as db from "../../services/liveevents-service.js"

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
          option.setName("event_name")
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
    )
    .addSubcommand(subcommand => 
      subcommand.setName("addmember")
        .setDescription("Add a member name into the name list of a provided event")
        .addStringOption(option =>
          option.setName("event_name")
            .setDescription("Name of event")
            .setMaxLength(50)
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("member_name")
            .setDescription("Name of member to add")
            .setMaxLength(50)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
      subcommand.setName("removemember")
        .setDescription("Remove a member name from the name list of a provided event")
        .addStringOption(option =>
          option.setName("event_name")
            .setDescription("Name of event")
            .setMaxLength(50)
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("member_name")
            .setDescription("Name of member to add")
            .setMaxLength(50)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
      subcommand.setName("delete")
        .setDescription("Delete a live event")
        .addStringOption(option =>
          option.setName("event_name")
            .setDescription("Name of event")
            .setMaxLength(50)
            .setRequired(true)
        )
    ),
	async execute(interaction) {
    var res;
    var event;
    var member;

    switch (interaction.options.getSubcommand()) {
      case "help":
        const embed = buildHelpEmbed();
        interaction.reply({ embeds: [embed], ephemeral: true })
        return;

      case "create":
        event = interaction.options.getString("event_name");
        res = await db.insertLiveEvent(interaction.channelId, event);
        if (res.success) {
          interaction.reply({ content: `Roger. Event '${event}' created.` });
        }
        else {
          interaction.reply({ content: `Error encountered.`, ephemeral: true });
        }
        return;

      case "list":
        res = await db.getAllLiveEventInChannel(interaction.channelId);
        if (res.success) {
          const eventList = res.data.map(event => { return event.eventname })
            .join("\n");
          interaction.reply({ content: `Here are the list of events:\n` + codeBlock(eventList) });
        }
        else {
          interaction.reply({ content: `Error encountered.`, ephemeral: true });
        }
        return;

      case "names":
        event = interaction.options.getString("event_name");
        res = await db.getAllMembersFromEvent(interaction.channelId, event);
        if (res.success) {
          const memberList = res.data[0].members.split(",").join("\n");
          interaction.reply({ content: `Here are the members in event '${event}'\n` + codeBlock(memberList) });
        }
        else {
          interaction.reply({ content: `Error encountered.`, ephemeral: true });
        }
        return;

      case "addmember":
        event = interaction.options.getString("event_name");
        member = interaction.options.getString("member_name");

        res = await db.insertMemberIntoEvent(interaction.channelId, event, member);
        if (res.success) {
          interaction.reply({ content: `${member} successfully added into event '${event}'.` });
        }
        else {
          interaction.reply({ content: `Error encountered.`, ephemeral: true });
        }
        return;

      case "removemember":
        event = interaction.options.getString("event_name");
        member = interaction.options.getString("member_name");

        res = await db.removeMemberFromEvent(interaction.channelId, event, member);
        if (res.success) {
          interaction.reply({ content: `${member} removed from event '${event}'.` });
        }
        else {
          interaction.reply({ content: `Error encountered.`, ephemeral: true });
        }
        return;

      case "delete":
        event = interaction.options.getString("event_name");

        res = await db.deleteEventByName(interaction.channelId, event);
        if (res.success) {
          interaction.reply({ content: `Removed event '${event}'.` });
        }
        else {
          interaction.reply({ content: `Error encountered.`, ephemeral: true });
        }
        return;
    }
	},
}

const buildHelpEmbed = () => {
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
