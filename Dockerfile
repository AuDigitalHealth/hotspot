FROM nginx

COPY docker/start.sh /
COPY docker/buildConfig.sh /
RUN chmod +x /start.sh /buildConfig.sh

COPY docker/hotspot.nginx.conf /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html

CMD ["/start.sh"]
