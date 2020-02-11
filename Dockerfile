# Stage 1 - the build react app
FROM --platform=$BUILDPLATFORM node:12.4.0-alpine as build-deps
ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "I'm running on $BUILDPLATFORM, building for $TARGETPLATFORM"
#RUN apk add --no-cache --update \
#    python \
#    python-dev \
#    py-pip \
#    build-base
#
#RUN apk add --virtual build-deps gcc python-dev musl-dev

WORKDIR /usr/src/app
COPY client/package.json ./
RUN npm i

COPY client/ ./
RUN npm run build

# Stage 2 - the production environment
FROM --platform=$BUILDPLATFORM node:12.4.0-alpine

RUN apk add --no-cache tini
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app/
EXPOSE 4654

COPY server/package.json ./
RUN npm i --production

COPY --from=build-deps /usr/src/app/build /usr/src/app/public
COPY /server ./

USER node

ENTRYPOINT ["/sbin/tini", "--", "node", "."]
