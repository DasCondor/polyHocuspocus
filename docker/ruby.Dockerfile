# Hardened: the package manager is removed; runs as a non-root user.
FROM ruby:4-alpine@sha256:9d3416708d4f434a62bf265a865deab75d376cc1d260c71651c9fb8708dbb2e7
RUN apk upgrade --no-cache && apk --purge del apk-tools
COPY ruby/hocuspocus.rb /app/
USER 65534:65534
ENTRYPOINT ["ruby", "/app/hocuspocus.rb"]
