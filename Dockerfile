FROM node:16-alpine3.16
WORKDIR /usr/lib/timetender
COPY . .
RUN npm install --legacy-peer-deps \
    && npm run build \
    && rm -rf node_modules
RUN npm install --omit=dev --legacy-peer-deps \
    && npm install dos2unix -g \
    && dos2unix /usr/lib/timetender/bin/init.sh
EXPOSE 8080
CMD [ "sh", "/usr/lib/timetender/bin/init.sh" ]