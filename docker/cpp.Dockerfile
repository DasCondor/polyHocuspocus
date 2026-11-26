# Hardened: an empty image holding one static binary, run as a non-root user.
FROM alpine:3@sha256:f59abe656b692d901e184be3445e084786602108599d2a51d229c0f5a48c71bf AS build
RUN apk add --no-cache build-base
WORKDIR /src
COPY cpp/hocuspocus.cpp .
RUN c++ -std=c++17 -Wall -Wextra -O2 -static -fstack-protector-strong -D_FORTIFY_SOURCE=2 hocuspocus.cpp -o /hocuspocus

FROM scratch
COPY --from=build --chmod=0555 /hocuspocus /hocuspocus
USER 65532:65532
ENTRYPOINT ["/hocuspocus"]
