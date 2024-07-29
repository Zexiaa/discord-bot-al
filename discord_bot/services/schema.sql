CREATE TABLE IF NOT EXISTS bot_schema.reminder_message (
    id SERIAL PRIMARY KEY,
    userid TEXT NOT NULL,
    channelid TEXT NOT NULL,
    triggerDate TIMESTAMPTZ NOT NULL,
    messagetext CHARACTER VARYING(100) NOT NULL
)

CREATE TABLE IF NOT EXISTS bot_schema.live_events (
    id SERIAL PRIMARY KEY,
    eventname TEXT NOT NULL,
    members TEXT
)
