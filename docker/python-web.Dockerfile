# The Python web version: pages rendered on the server, standard library only.
# Hardened: a distroless Python runtime (no shell, no pip), run as a non-root user.
FROM gcr.io/distroless/python3-debian13:nonroot@sha256:72de1dda9d4c52c370e2ef2d93c28e3e1a8193c92058b7dfa42bace38a83d114
COPY web/shared/hocuspocus.css /app/web/shared/
COPY web/python/server.py /app/web/python/
ENV HOST=0.0.0.0 PORT=8000 PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
EXPOSE 8000
USER 65532:65532
ENTRYPOINT ["/usr/bin/python3", "/app/web/python/server.py"]
