FROM node:12

WORKDIR /app

RUN npm i cross-env -g

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm i --production

COPY ./src/ ./src/
COPY ./.env ./.env

CMD ["npm", "start"]