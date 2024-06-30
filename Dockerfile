# Stage 1 - the build react app
FROM node:16.20.2-alpine as build-deps
WORKDIR /usr/src/app
COPY client/package.json ./
RUN npm i -timeout=600000

COPY client/ ./
RUN npm config set package-lock true; npm install react-app-rewired stream-http url util ;npm run build -timeout=600000

# Stage 2 - the production environment
FROM node:16.20.2-alpine

RUN apk add --no-cache tini
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app/
EXPOSE 4654

COPY server/package.json ./
RUN npm config set package-lock true;  npm i --production -timeout=600000

COPY --from=build-deps /usr/src/app/build /usr/src/app/public
COPY /server ./

# USER 1000 is the "node" user
# This is to avoid the "container has runAsNonRoot and image has non-numeric user (node), cannot verify user is non-root"
# in clusters with PSP enabled
USER 1000

ENTRYPOINT ["/sbin/tini", "--", "node", "."]
