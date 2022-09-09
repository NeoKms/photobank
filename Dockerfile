FROM node:16.14 as build-stage

RUN apt-get update && apt-get install git -y
WORKDIR /var/

COPY . /var/
RUN npm install
RUN npm run build

FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /var/dist /usr/share/nginx/html
COPY --from=build-stage /var/getenv.sh /usr/share/nginx/html/getenv.sh
COPY --from=build-stage /var/envconfig.js /usr/share/nginx/html/envconfig.js
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
