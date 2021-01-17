FROM nginx:mainline-alpine
RUN sudo openssl dhparam -out /etc/ssl/certs/dhparam-2048.pem 2048
COPY nginx-conf /etc/nginx/conf.d
EXPOSE 80
