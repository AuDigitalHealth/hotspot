FROM nginx
ARG version

COPY docker/start.sh /usr/local/bin
RUN chmod +x /usr/local/bin/start.sh

COPY docker/hotspot.nginx.conf /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html
COPY docker/config-ssi.json /usr/share/nginx/html/config.json

ENV HOTSPOT_FHIR_SERVER=NULL
ENV HOTSPOT_FHIR_VERSION=NULL
ENV HOTSPOT_NARRATIVE_STYLES=NULL
ENV HOTSPOT_PATH_ROUTES=NULL
ENV HOTSPOT_PATH_PREFIX=NULL

CMD ["/usr/local/bin/start.sh"]
