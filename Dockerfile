FROM node
ARG version

COPY docker/proxy/* /
COPY docker/start.sh /
COPY docker/buildConfig.sh /

RUN yarn

RUN chmod +x /start.sh /buildConfig.sh

COPY build /var/www/html

EXPOSE 80/tcp

ENV HOTSPOT_WEB_ROOT=/var/www/html
ENV HOTSPOT_VERSION=$version

CMD ["/start.sh"]
