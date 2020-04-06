FROM node:12-alpine

RUN apk add --no-cache yarn
RUN yarn global add pm2

COPY app /app
WORKDIR /app

RUN yarn install

RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["pm2-runtime", "index.js"]
