FROM alpine
RUN apk add --no-cache lua5.4
WORKDIR /app
COPY lua/hocuspocus.lua .
ENTRYPOINT ["lua5.4", "hocuspocus.lua"]
