FROM node:24-alpine
WORKDIR /app
COPY javascript/hocuspocus.js .
ENTRYPOINT ["node", "hocuspocus.js"]
