import { db, dbLogger } from './db-util.js';
import { db_eventsTable } from '../CONSTANTS/constants.js';

export const insertLiveEvent = async (channelId, eventName) => {
  try {
    const res = await db`
      INSERT INTO bot_schema.live_events(channelid, eventname)
      VALUES (${channelId}, ${eventName})
      returning channelid, eventname
      `
    return { success: true, data: res };
  }
  catch (e) {
    dbLogger.error(`Failed to insert into ${db_eventsTable}` + e);
  }
  return { success: false };
}

export const getAllLiveEventInChannel = async (channelId) => {
  try {
    const res = await db`
      SELECT eventName
      FROM bot_schema.live_events
      WHERE channelid=${channelId}
    `
    return { success: true, data: res };
  }
  catch (e) {
    dbLogger.error(`Failed to retrieve list of live events from channel ` + e);
  }
  return { success: false };
}

export const insertMemberIntoEvent = async (channelId, eventName, memberName) => {
  try {
    const eventList = await db`
      SELECT *
      FROM bot_schema.live_events
      WHERE channelid=${channelId} AND eventname=${eventName}
    `

    if (eventList.length < 1) {
      return { success: false };
    }

    let members = eventList[0].members;

    if (members == null) 
      members = memberName;
    else
      members = members + "," + memberName;

    await db`
      UPDATE bot_schema.live_events
      SET members=${members}
      WHERE channelid=${channelId} AND eventname=${eventName}
    `

    return { success: true };
  }
  catch (e) {
    dbLogger.error(`Failed to insert member into event ` + e);
  }
  return { success: false };
}

export const getAllMembersFromEvent = async (channelId, eventName) => {
  try {
    const res = await db`
      SELECT members
      FROM bot_schema.live_events
      WHERE channelid=${channelId} AND eventname=${eventName}
    `
    if (res.length < 1)
      return { success: false };

    return { success: true, data: res };
  }
  catch (e) {
    dbLogger.error(`Failed to insert member into event ` + e);
  }
  return { success: false };
}

export const removeMemberFromEvent = async (channelId, eventName, memberName) => {
  try {
    const eventList = await db`
      SELECT *
      FROM bot_schema.live_events
      WHERE channelid=${channelId} AND eventname=${eventName}
    `

    if (eventList.length < 1) {
      return { success: false };
    }

    let members = eventList[0].members;

    if (members == null) 
      return { success: false };
    
    members = members.split(",");
    const index = members.indexOf(memberName);
    if (index < 0) {
      return { success: false };
    }

    members.splice(index, 1);
    members = members.join();

    await db`
      UPDATE bot_schema.live_events
      SET members=${members}
      WHERE channelid=${channelId} AND eventname=${eventName}
    `

    return { success: true };
  }
  catch (e) {
    dbLogger.error(`Failed to remove member from event ` + e);
  }
  return { success: false };
}

export const deleteEventByName = async (channelId, eventName) => {
  try {
    const res = await db`
      DELETE FROM bot_schema.live_events
      WHERE channelid=${channelId} AND eventname=${eventName}
      returning id
    `

    return { success: true, data: res };
  }
  catch (e) {
    dbLogger.error(`Failed to remove member from event ` + e);
  }
  return { success: false };
}