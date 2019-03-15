# THIS IS THE BASEIMAGE THAT ALL OTHER SERVICES ARE BUILT UPON

FROM node:11.10.0-alpine

RUN apk add --no-cache tini

ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN chown -R node:node /usr/src/app/

COPY server/package.json /usr/src/app/
COPY server/package-lock.json /usr/src/app/
RUN npm install --production

COPY client/build /usr/src/app/public
COPY server /usr/src/app

USER node

ENTRYPOINT ["/sbin/tini", "--", "node", "."]