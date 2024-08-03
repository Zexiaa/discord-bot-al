CREATE ROLE albot login password '';
CREATE ROLE scraper login password '';
CREATE DATABASE al_database owner albot;
GRANT ALL PRIVILEGES ON DATABASE al_database TO albot;
GRANT ALL PRIVILEGES ON DATABASE al_database TO scraper;
CREATE SCHEMA bot_schema AUTHORIZATION albot;
CREATE SCHEMA wtwiki_schema AUTHORIZATION scraper;
GRANT ALL PRIVILEGES ON SCHEMA bot_schema TO albot;
GRANT ALL PRIVILEGES ON SCHEMA wtwiki_schema TO scraper;
GRANT USAGE ON SCHEMA wtwiki_schema TO albot;
GRANT SELECT ON ALL TABLES IN SCHEMA wtwiki_schema TO albot;
