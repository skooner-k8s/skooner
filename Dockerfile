# Stage 1 - install the heavy dependencies
FROM --platform=$BUILDPLATFORM node:lts-alpine as build-deps
WORKDIR /usr/src/app
COPY client/package.json ./
RUN npm install --quiet

# Stage 2 - the build react app
FROM --platform=$BUILDPLATFORM node:lts-alpine as build
COPY --from=build-deps /usr/src/app/node_modules /usr/src/app/node_modules
WORKDIR /usr/src/app
COPY client/ ./
RUN npm run build

# Stage 3 - the production environment
FROM --platform=$TARGETPLATFORM node:lts-alpine as runtime
RUN apk add --no-cache tini
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app/
EXPOSE 4654

COPY server/package.json ./
RUN npm install --production --quiet

COPY --from=build /usr/src/app/build /usr/src/app/public
COPY /server ./

USER node

ENTRYPOINT ["/sbin/tini", "--", "node", "."]
