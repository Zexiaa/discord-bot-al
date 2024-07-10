CREATE TABLE IF NOT EXISTS al_schema.reminder_message (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        channelid TEXT NOT NULL,
        triggerDate TIMESTAMPTZ NOT NULL,
        messagetext CHARACTER VARYING(100) NOT NULL
    )

