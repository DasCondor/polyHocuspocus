# The Node.js web version: pages rendered on the server.
# Hardened: a distroless Node.js runtime (no shell, no npm), run as a non-root user.
FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:675c532423b908f9e56f9d60a4e62309b63cd2a3175acb90a46b96f7ee68e121
COPY web/shared/hocuspocus.css /app/web/shared/
COPY web/node/server.js /app/web/node/
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production
EXPOSE 3000
USER 65532:65532
ENTRYPOINT ["/nodejs/bin/node", "/app/web/node/server.js"]
