# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.14.0
FROM node:${NODE_VERSION}-slim as builder

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM builder as buildbot

RUN --mount=type=bind, source=discord_bot/package.json, target=package.json \
    --mount=type=bind, source=discord_bot/package-lock.json, target=package-lock.json \
    --mount=type=cache, target=/root/.npm \
    npm ci

# Install packages needed to build node modules
# RUN apt-get update -qq && \
# apt-get install --no-install-recommends -y build-essential node-gyp pkg-config

# Install node modules
# COPY discord_bot/package.json /app/discord_bot/package.json
# COPY scraper_worker/package.json /app/scraper_worker/package.json
# COPY discord_bot/package-lock.json /app/discord_bot/package-lock.json
# COPY scraper_worker/package-lock.json /app/scraper_worker/package-lock.json

# COPY --link package-lock.json package.json ./
# RUN npm ci
# RUN cd ./discord_bot \
#     && npm ci \
#     && cd ../scraper_worker \
#     && npm ci

# Copy application code
# COPY --link . .
COPY ./discord_bot .

# Final stage for app image
FROM builder

# Copy built application
COPY --from=builder /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]

# ENTRYPOINT ["npm"]
