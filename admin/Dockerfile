FROM node:11-alpine

WORKDIR /usr/src/app

ARG PORT=80
ARG NODE_ENV=production

COPY package*.json ./

RUN yarn

COPY . .

ENV PORT ${PORT}
ENV NODE_ENV ${NODE_ENV}

EXPOSE ${PORT}

CMD ["yarn", "start"]
