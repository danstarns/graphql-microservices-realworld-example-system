FROM node:12-buster-slim

WORKDIR /app

RUN npm i cross-env -g

COPY ./package.json ./package.json

RUN npm i --production

COPY ./src/ ./src/
COPY ./.env ./.env

CMD ["npm", "start"]