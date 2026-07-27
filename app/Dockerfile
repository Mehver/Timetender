# ---------- build stage ----------
FROM node:24-alpine AS build
WORKDIR /usr/lib/timetender
RUN corepack enable || npm install -g pnpm@11
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---------- runtime stage ----------
FROM node:24-alpine
WORKDIR /usr/lib/timetender
RUN corepack enable || npm install -g pnpm@11
ENV NODE_ENV=production \
    TIMETENDER_DATA_DIR=/usr/lib/timetender/data
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /usr/lib/timetender/dist ./dist
COPY server.js ./
VOLUME /usr/lib/timetender/data
EXPOSE 8080
CMD ["node", "server.js"]
