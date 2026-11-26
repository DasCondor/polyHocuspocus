FROM rust:1-alpine AS build
WORKDIR /src
COPY rust/hocuspocus.rs .
RUN rustc -O -C target-feature=+crt-static hocuspocus.rs -o /hocuspocus

FROM scratch
COPY --from=build /hocuspocus /hocuspocus
ENTRYPOINT ["/hocuspocus"]
