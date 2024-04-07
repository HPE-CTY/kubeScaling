# Use a Node.js base image for ARM64 architecture
FROM node:18.3.0-alpine3.14 as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY server.js .

CMD [ "node", "server.js" ]
