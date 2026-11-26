FROM alpine AS build
RUN apk add --no-cache build-base
WORKDIR /src
COPY c/hocuspocus.c .
RUN cc -std=c99 -Wall -Wextra -O2 -static hocuspocus.c -o /hocuspocus

FROM scratch
COPY --from=build /hocuspocus /hocuspocus
ENTRYPOINT ["/hocuspocus"]
