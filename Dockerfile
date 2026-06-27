FROM --platform=linux/amd64 node:24-alpine AS build-stage

WORKDIR /var/

COPY . /var/
RUN npm ci
RUN npm run build

FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /var/dist /usr/share/nginx/html
COPY --from=build-stage /var/getenv.sh /usr/share/nginx/html/getenv.sh
COPY --from=build-stage /var/envconfig.js /usr/share/nginx/html/envconfig.js
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["/bin/sh", "-c", "sh /usr/share/nginx/html/getenv.sh && nginx -g 'daemon off;'"]
