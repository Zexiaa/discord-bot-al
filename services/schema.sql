CREATE TABLE IF NOT EXISTS al_schema.reminder_message (
        id SERIAL PRIMARY KEY,
        userId TEXT NOT NULL,
        triggerDate TIMESTAMPTZ NOT NULL,
        messageText CHARACTER VARYING(100) NOT NULL
    )

