FROM golang:1-alpine AS build
WORKDIR /src
COPY go/hocuspocus.go .
RUN CGO_ENABLED=0 go build -o /hocuspocus hocuspocus.go

# The static binary needs nothing else.
FROM scratch
COPY --from=build /hocuspocus /hocuspocus
ENTRYPOINT ["/hocuspocus"]
