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
        const message = codeBlock(
          `Event command\n` + 
          `This command lets you manage and create name lists for live events.\n\n` +
          `Usage: /event [subcommand] [arguments]\n\n` +
          `Available subcommands:\n\n` +
          `create [event name]\n` +
          `\tCreates a new event with an empty name list\n\n` +
          `list\n` + 
          `\tLists all events added in this channel\n\n` +
          `names [event name]\n` +
          `\tLists the names of the attendees in the given event\n\n` +
          `addmember [event name] [member name]\n` +
          `\tAdds the name of the member into the corresponding event\n\n` +
          `removemember [event name] [member name]\n` +
          `\tRemoves the name of a member from the given event\n\n` +
          `delete [event name]\n` +
          `\tRemoves the event from the list`
        );
        interaction.reply({ content: message, ephemeral: true })
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
          const memberList = res.data[0].members;
          if (memberList == null) {
            interaction.reply({ content: `There are not yet any members in event '${event}'`, ephemeral: true });
            return;
          }

          memberList = memberList.split(",").join("\n");
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
