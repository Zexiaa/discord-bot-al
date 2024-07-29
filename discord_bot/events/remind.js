import { codeBlock } from "discord.js";
import { event_reminderTrigger } from "../CONSTANTS/constants.js";

export const event = {
    name: event_reminderTrigger,
    once: false,
    async execute(client, reminder) {
      client.channels.fetch(reminder.channelid).then(channel => {
        channel.send(`<@${reminder.userid}> This is your scheduled reminder for:\n${codeBlock(reminder.messagetext)}`);
      }).catch(e => { console.error("Error occurred while trying to send reminder: " + e) });
    }
};