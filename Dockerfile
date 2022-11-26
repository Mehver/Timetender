FROM node:16-alpine3.16
WORKDIR /usr/lib/timetender
COPY . .
RUN npm install --omit=dev --legacy-peer-deps \
    && npm install dos2unix -g \
    && dos2unix /usr/lib/timetender/init/init.sh
EXPOSE 8080
CMD [ "sh", "/usr/lib/timetender/init/init.sh" ]