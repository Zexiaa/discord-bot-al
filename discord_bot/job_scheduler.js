import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';
import { deleteOverdueReminders, getRemindersWithinInterval } from "./services/reminder-service.js";
import { DateTime } from 'luxon';
import { event_reminderTrigger } from './CONSTANTS/constants.js';
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
  // await schedule.gracefulShutdown();

  const res = await getRemindersWithinInterval(); 
  
  if (res.data.length < 1) return;
  
  res.data.forEach(data => {
    const jsDate = new Date(data.triggerdate);
    schedule.scheduleJob(DateTime.fromISO(jsDate.toISOString()).toLocal().toJSDate(), () => {
      currentClient.emit(event_reminderTrigger, currentClient, data);
    });
  });
}