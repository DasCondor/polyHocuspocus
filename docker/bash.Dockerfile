# Hardened: the package manager is removed; runs as a non-root user.
FROM bash:5@sha256:589adbc588d8ef3c1ec3c68333faf4baf5dccb65d3cb50f6cf3d78cad2d6e1b0
RUN apk upgrade --no-cache && apk --purge del apk-tools
COPY bash/hocuspocus.sh /app/
USER 65534:65534
ENTRYPOINT ["bash", "/app/hocuspocus.sh"]
