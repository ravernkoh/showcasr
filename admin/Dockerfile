FROM node:11-alpine as builder
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package*.json ./
RUN yarn
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
