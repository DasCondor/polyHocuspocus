# Hardened: the package manager is removed; runs as a non-root user.
FROM ruby:3-alpine@sha256:43e893062fbdae3c4ff9865aaab42f870ca151768ee87c68a902976b468ef6b7
RUN apk upgrade --no-cache && apk --purge del apk-tools
COPY ruby/hocuspocus.rb /app/
USER 65534:65534
ENTRYPOINT ["ruby", "/app/hocuspocus.rb"]
