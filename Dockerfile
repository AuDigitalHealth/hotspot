FROM node

RUN npm install express http-proxy-middleware

COPY docker/proxy.js /
COPY docker/start.sh /
COPY docker/buildConfig.sh /

RUN chmod +x /start.sh /buildConfig.sh

COPY build /var/www/html

EXPOSE 80/tcp

ENV HOTSPOT_WEB_ROOT=/var/www/html

CMD ["/start.sh"]
