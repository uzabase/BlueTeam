FROM node:22-bullseye-slim

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm ci
CMD "npm" "run" "start"