DROP TABLE IF EXISTS al_schema.reminder_message;

CREATE TABLE al_schema.reminder_message (
        id SERIAL PRIMARY KEY,
        createdBy TEXT NOT NULL,
        triggerDate TIMESTAMPTZ NOT NULL,
        messageText CHARACTER VARYING(100) NOT NULL
    )

