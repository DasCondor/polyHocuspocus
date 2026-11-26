# Hardened: an empty image holding one static binary, run as a non-root user.
FROM golang:1-alpine@sha256:70bd7ddea8b6cbe5d6943cde279d6b67feb10cc924fb9100d1d8757c1575b280 AS build
WORKDIR /src
COPY go/hocuspocus.go .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /hocuspocus hocuspocus.go

FROM scratch
COPY --from=build --chmod=0555 /hocuspocus /hocuspocus
USER 65532:65532
ENTRYPOINT ["/hocuspocus"]
