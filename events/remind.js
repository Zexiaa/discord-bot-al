import { ReminderTrigger } from "../constants/constants";

export const event = {
    name: ReminderTrigger,
    once: false,
    async execute(client, reminder) {
      client.channels.fetch(reminder.channelId).then(channel => {
        channel.send(`<@${reminder.userId}> This is your scheduled reminder.`)
      }).catch(e => { console.error("Error occurred while trying to send reminder: " + e) });
    }
};