# syntax=docker/dockerfile:1.7
# Runtime image for the Open-Capture frontend: nginx serving the bundle.
#
# NO build happens here. The Vite bundle is produced outside.

FROM nginx:1.30-alpine AS bundle
COPY frontend/dist/ /dist/
RUN test -n "$(ls -A /dist)" \
    || (echo "ERROR: frontend/dist/ is empty" >&2; exit 1)


FROM nginx:1.30-alpine

# envsubst lives in gettext on alpine; the base image already ships it.
COPY install/docker/shared/nginx.conf.template /etc/nginx/templates/default.conf.template
# Taken from the guard stage, not from the context: the runtime image must
# DEPEND on it, otherwise BuildKit prunes the unreferenced stage and the
# check never runs.
COPY --from=bundle /dist/ /usr/share/nginx/html/

EXPOSE 80

# nginx:alpine entrypoint runs /etc/nginx/templates/*.template through
# envsubst into /etc/nginx/conf.d/ on startup, then exec's nginx.
