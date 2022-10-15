FROM node:16
WORKDIR /usr/timetender
COPY . .
RUN [ "npm", "install", "--legacy-peer-deps" ]
RUN [ "npm", "run", "build" ]
EXPOSE 8080
CMD [ "node", "server.js" ]