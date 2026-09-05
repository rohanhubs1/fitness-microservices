FROM quay.io/keycloak/keycloak:26.7.1

COPY realm-export.json /opt/keycloak/data/import/realm-export.json

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_HTTP_ENABLED=true
ENV KC_HOSTNAME_STRICT=false
ENV KC_PROXY_HEADERS=xforwarded
ENV JAVA_OPTS="-Xms64m -Xmx384m -XX:+UseSerialGC"

EXPOSE 8080 10000

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--http-port=10000", "--import-realm"]
