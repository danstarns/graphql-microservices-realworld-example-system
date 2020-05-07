FROM node:12.16.3

WORKDIR /app

RUN npm i cross-env -g

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm i --production

COPY ./src/index.js ./src/index.js
COPY ./src/server.js ./src/server.js
COPY ./src/mongodb.js ./src/mongodb.js
COPY ./src/config.js ./src/config.js
COPY ./src/debug.js ./src/debug.js

COPY ./src/graphql/locals/ ./src/graphql/locals/
COPY ./src/models/ ./src/models/
COPY ./src/util/ ./src/util/

COPY ./.env ./.env

EXPOSE 3000

CMD ["npm", "start"]