# Hardened: the package manager is removed after install; runs as a non-root user.
FROM alpine:3@sha256:f59abe656b692d901e184be3445e084786602108599d2a51d229c0f5a48c71bf
RUN apk upgrade --no-cache && apk add --no-cache perl && apk --purge del apk-tools
COPY perl/hocuspocus.pl /app/
USER 65534:65534
ENTRYPOINT ["perl", "/app/hocuspocus.pl"]
