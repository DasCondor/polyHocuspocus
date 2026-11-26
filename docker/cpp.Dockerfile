FROM alpine AS build
RUN apk add --no-cache build-base
WORKDIR /src
COPY cpp/hocuspocus.cpp .
RUN c++ -std=c++17 -Wall -Wextra -O2 -static hocuspocus.cpp -o /hocuspocus

FROM scratch
COPY --from=build /hocuspocus /hocuspocus
ENTRYPOINT ["/hocuspocus"]
