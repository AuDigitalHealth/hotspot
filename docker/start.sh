#!/bin/bash

CONF=/etc/nginx/conf.d

envsubst '\$HOTSPOT_FHIR_SERVER \$HOTSPOT_FHIR_VERSION \$HOTSPOT_NARRATIVE_STYLES' \
  < $CONF/default.conf > $CONF/default.subst.conf && \
  cp $CONF/default.subst.conf $CONF/default.conf && \
  rm $CONF/default.subst.conf && \
  exec nginx -g 'daemon off;'
