FROM node:21-bullseye-slim

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm ci
CMD "npm" "run" "dev"