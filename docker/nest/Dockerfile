FROM node:18.14.1

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

USER node

RUN npm install --production

RUN npm install -d ts-node@10.9.1

COPY --chown=node:node ./dist  .

CMD node ./main.js
