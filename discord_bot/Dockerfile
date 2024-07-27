# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.14.0
ARG arch=arm64
FROM --platform=linux/${arch} node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# RUN apt-get update -qq && \
#     apt-get install --no-install-recommends -y build-essential node-gyp pkg-config

# Throw-away build stage to reduce size of final image
FROM base AS build

RUN --mount=type=cache,target=/root/.npm/ \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci

# Copy application code
# COPY --link . .
COPY . .

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
# EXPOSE 5432
CMD ["npm", "run", "start"]

