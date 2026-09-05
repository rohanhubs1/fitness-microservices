FROM quay.io/keycloak/keycloak:26.7.1

COPY realm-export.json /opt/keycloak/data/import/realm-export.json

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_HTTP_ENABLED=true
ENV KC_HOSTNAME_STRICT=false
ENV KC_PROXY_HEADERS=xforwarded
ENV KC_HTTP_HOST=0.0.0.0
ENV KC_HTTP_PORT=10000
ENV JAVA_OPTS="-Xms64m -Xmx384m -XX:+UseSerialGC"

EXPOSE 10000

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--http-host=0.0.0.0", "--http-port=10000", "--import-realm"]
