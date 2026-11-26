# The Node.js web version: pages rendered on the server.
FROM node:24-alpine
WORKDIR /app
COPY web/shared/hocuspocus.css web/shared/
COPY web/node/server.js web/node/
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "web/node/server.js"]
