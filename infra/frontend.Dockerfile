# syntax=docker/dockerfile:1.7
# Multi-stage build for the Open-Capture frontend.
# - builder: installs deps and produces the Vite production bundle
# - runtime: nginx alpine that serves the bundle and reverse-proxies
#   the backend API.
#
# VITE_BACKEND_URL is consumed by Vite at build time. We bake it as
# "/" because nginx in the runtime stage proxies /backend_oc/ and
# /<custom_id>/ws/ to the backend service on the internal network.

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json* postinstall_tinymce.js ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Build the bundle.
COPY . .
ARG VITE_BACKEND_URL=/
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
RUN npm run build


FROM nginx:1.27-alpine AS runtime

# envsubst lives in gettext on alpine; the base image already ships it.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx:alpine entrypoint runs /etc/nginx/templates/*.template through
# envsubst into /etc/nginx/conf.d/ on startup, then exec's nginx.
