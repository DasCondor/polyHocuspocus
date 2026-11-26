# Hardened: a distroless Python runtime (no shell, no pip), run as a non-root user.
FROM gcr.io/distroless/python3-debian13:nonroot@sha256:72de1dda9d4c52c370e2ef2d93c28e3e1a8193c92058b7dfa42bace38a83d114
COPY python/hocuspocus.py /app/
ENV PYTHONDONTWRITEBYTECODE=1
USER 65532:65532
ENTRYPOINT ["/usr/bin/python3", "/app/hocuspocus.py"]
