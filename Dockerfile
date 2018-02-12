FROM nginx
ARG version

COPY docker/start.sh /usr/local/bin
RUN chmod +x /usr/local/bin/start.sh

COPY docker/hotspot.nginx.conf /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html
COPY docker/config-ssi.json /usr/share/nginx/html/config.json

ENV HOTSPOT_FHIR_SERVER=https://ontoserver.csiro.au/stu3-latest
ENV HOTSPOT_FHIR_VERSION=3.0.1
ENV HOTSPOT_NARRATIVE_STYLES=/agency-narrative.css
ENV HOTSPOT_PATH_ROUTES=[]
ENV HOTSPOT_PATH_PREFIX=""

CMD ["/usr/local/bin/start.sh"]
