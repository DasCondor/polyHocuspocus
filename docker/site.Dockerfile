# The whole website: builds the Angular, React and Vue versions, assembles
# the site with tools/build_site.py, and serves it with nginx.
# Hardened: Alpine's nginx run as its non-root user on port 8080, with security
# headers, no package manager and no entrypoint scripts; only /tmp is written to.
FROM node:26-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS build
RUN apk add --no-cache python3
WORKDIR /src
COPY web/angular/package.json web/angular/package-lock.json web/angular/
COPY web/react/package.json web/react/package-lock.json web/react/
COPY web/vue/package.json web/vue/package-lock.json web/vue/
# --ignore-scripts: no dependency gets to run install scripts during the build.
RUN for app in angular react vue; do npm ci --prefix web/$app --ignore-scripts --no-audit --no-fund || exit 1; done
COPY . .
RUN for app in angular react vue; do npm run build --prefix web/$app || exit 1; done \
 && python3 tools/build_site.py

FROM alpine:3@sha256:f59abe656b692d901e184be3445e084786602108599d2a51d229c0f5a48c71bf
RUN apk upgrade --no-cache && apk add --no-cache nginx && apk --purge del apk-tools \
 && rm -rf /etc/nginx/http.d /var/lib/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /src/_site /usr/share/nginx/html
# Alpine's nginx user and group
USER 100:101
EXPOSE 8080
ENTRYPOINT ["nginx", "-e", "/dev/stderr", "-g", "daemon off;"]
