import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';
import { getRemindersWithinInterval } from "./services/util-service";

export default function StartScheduler() {
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
  const res = await getRemindersWithinInterval();
  
  if (res.data.length > 0) {
    //queue timeouts
  }
}