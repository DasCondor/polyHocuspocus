# Hardened: a distroless Node.js runtime (no shell, no npm), run as a non-root user.
# Node.js 24 runs TypeScript directly by stripping the types.
FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:675c532423b908f9e56f9d60a4e62309b63cd2a3175acb90a46b96f7ee68e121
COPY typescript/hocuspocus.ts /app/
USER 65532:65532
ENTRYPOINT ["/nodejs/bin/node", "--no-warnings", "/app/hocuspocus.ts"]
