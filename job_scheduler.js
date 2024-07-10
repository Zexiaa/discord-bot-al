import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';
import { deleteOverdueReminders, deleteReminderById, getRemindersWithinInterval } from "./services/util-service.js";
import { ReminderTrigger } from './constants/constants.js';
import schedule from 'node-schedule';

var currentClient;

export default function StartScheduler(client) {
  currentClient = client;
  
  const scheduler = new ToadScheduler();

  const reminderTask = new Task('check reminder', checkReminders)
  const reminderJob = new SimpleIntervalJob(
    { minutes: 30, runImmediately: true },
    reminderTask,
    { id: 'id_1' }
  )

  scheduler.addSimpleIntervalJob(reminderJob);
}

const checkReminders = async () => {
  await deleteOverdueReminders();

  await schedule.gracefulShutdown();

  const res = await getRemindersWithinInterval(); 
  // TODO: Doesn't handle multiple
  if (res.data.length > 0) {
    addReminderTrigger(res.data);
  }
}

export const addReminderTrigger = (data) => {
  schedule.scheduleJob(data.triggerDate, () => {
    currentClient.emit(ReminderTrigger, currentClient, data);
  });
}