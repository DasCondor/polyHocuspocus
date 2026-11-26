# Hardened: an empty image holding one static binary, run as a non-root user.
FROM rust:1-alpine@sha256:8d0e82abfdf9a38071e07cabc5afba4ddbe077631a80e4e742a760c38beadc33 AS build
WORKDIR /src
COPY rust/hocuspocus.rs .
RUN rustc -O -C target-feature=+crt-static -C strip=symbols hocuspocus.rs -o /hocuspocus

FROM scratch
COPY --from=build --chmod=0555 /hocuspocus /hocuspocus
USER 65532:65532
ENTRYPOINT ["/hocuspocus"]
