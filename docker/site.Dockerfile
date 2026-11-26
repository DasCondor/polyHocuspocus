# The whole website: builds the Angular, React and Vue versions, assembles
# the site with tools/build_site.py, and serves it with nginx.
FROM node:24-alpine AS build
RUN apk add --no-cache python3
WORKDIR /src
COPY web/angular/package.json web/angular/package-lock.json web/angular/
COPY web/react/package.json web/react/package-lock.json web/react/
COPY web/vue/package.json web/vue/package-lock.json web/vue/
RUN for app in angular react vue; do npm ci --prefix web/$app --no-audit --no-fund || exit 1; done
COPY . .
RUN for app in angular react vue; do npm run build --prefix web/$app || exit 1; done \
 && python3 tools/build_site.py

FROM nginx:alpine
COPY --from=build /src/_site /usr/share/nginx/html
