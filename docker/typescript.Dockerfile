# Node.js 24 runs TypeScript directly by stripping the types.
FROM node:24-alpine
WORKDIR /app
COPY typescript/hocuspocus.ts .
ENTRYPOINT ["node", "--no-warnings", "hocuspocus.ts"]
