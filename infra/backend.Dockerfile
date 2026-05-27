# syntax=docker/dockerfile:1.7
# Multi-stage build for Open-Capture backend.
#
# Build context: the repo root (compose passes context: ..).
# All COPY paths are therefore prefixed by `backend/` (the app code)
# or `infra/` (the entrypoint scripts).

FROM python:3.13-slim-bookworm AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        pkg-config \
        python3-dev \
        libcairo2-dev \
        libheif-dev \
        libpq-dev \
        libpoppler-cpp-dev \
        libleptonica-dev \
        libtesseract-dev \
        libmagic1 \
        zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY backend/pip-requirements.txt ./

RUN python -m pip install --upgrade pip wheel setuptools pycparser \
    && python -m pip wheel \
        --wheel-dir=/wheels \
        -r pip-requirements.txt \
        pyinotify-elephant-fork


FROM python:3.13-slim-bookworm AS runtime

# Compte de service partagé par tous les conteneurs backend / tenants.
# UID/GID paramétrables au build pour s'aligner sur un compte hôte
# existant (cf. APP_UID/APP_GID dans .env). L'entrypoint relit aussi
# ces valeurs au runtime et peut droper vers un autre UID sans rebuild.
ARG APP_UID=1050
ARG APP_GID=1050
ARG APP_USER=opencapture

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    LD_LIBRARY_PATH=/usr/local/lib/ \
    MAGICK_TMPDIR=/tmp/opencapture/ \
    TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata/ \
    APP_USER=${APP_USER} \
    HOME=/app

RUN apt-get update && apt-get install -y --no-install-recommends \
        # Image / PDF / OCR CLI tools. These pull in the matching
        # shared libs (libpoppler-cpp, libtesseract5, libleptonica,
        # libzbar0, libgs10...) transitively.
        ghostscript \
        imagemagick \
        poppler-utils \
        tesseract-ocr \
        tesseract-ocr-fra \
        tesseract-ocr-eng \
        zbar-tools \
        # Shared libs that don't have a CLI front-end on this image.
        libgl1 \
        libmagic1 \
        # `file` CLI (libmagic front-end) : les scripts de workflow
        # fs-watcher détectent le type MIME via `file -b -i` ; sans lui,
        # le PDF est rejeté comme "not valid".
        file \
        libcairo2 \
        libheif1 \
        libpq5 \
        # pdftotext (pip) links against libpoppler-cpp.so.0v5; the
        # poppler-utils CLI on Bookworm does NOT pull this transitively.
        libpoppler-cpp0v5 \
        # Postgres client for bootstrap.sh (psql + pg_isready).
        postgresql-client \
        # Misc utils used by bootstrap.sh.
        ca-certificates \
        gettext-base \
        # Privilege-drop helper: the entrypoint starts as root to chown
        # the bind mounts, then re-exec's via gosu under APP_UID.
        gosu \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /tmp/opencapture \
    && gosu nobody true

# Install pre-built wheels from the builder stage.
# Two steps on purpose: fs-watcher pulls the original `pyinotify`
# which is broken on Python 3.12+ (it imports the removed asyncore
# module). We then force-install pyinotify-elephant-fork last so its
# pyinotify.py overwrites the broken one.
COPY --from=builder /wheels /wheels
COPY backend/pip-requirements.txt /tmp/pip-requirements.txt
RUN python -m pip install --upgrade pip \
    && python -m pip install --no-index --find-links=/wheels \
        -r /tmp/pip-requirements.txt \
    && python -m pip install --no-index --find-links=/wheels \
        --force-reinstall --no-deps pyinotify-elephant-fork \
    && rm -rf /wheels /tmp/pip-requirements.txt

# Allow ImageMagick to read/write PDFs (the default Debian policy blocks PDF).
RUN sed -i 's|<policy domain="coder" rights="none" pattern="PDF" />|<policy domain="coder" rights="read\|write" pattern="PDF" />|' \
        /etc/ImageMagick-6/policy.xml || true

WORKDIR /app

# App code (everything under backend/ at the repo root).
COPY backend/ /app/

# Entrypoint scripts live in infra/, copied into /app/ to keep the
# legacy /app/docker-entrypoint.sh layout.
COPY infra/docker-entrypoint.sh /app/docker-entrypoint.sh
COPY infra/docker-bootstrap.sh  /app/docker-bootstrap.sh
RUN chmod +x /app/docker-entrypoint.sh /app/docker-bootstrap.sh

# Compte de service par défaut (home=/app, shell bash pour le rôle
# "shell"). L'ENTRYPOINT reste root au démarrage : il chown les bind
# mounts puis droppe vers ce compte via gosu (cf. docker-entrypoint.sh).
RUN groupadd -g "${APP_GID}" "${APP_USER}" \
    && useradd -u "${APP_UID}" -g "${APP_GID}" -d /app -s /bin/bash -M "${APP_USER}" \
    # Staging des workflows fs-watcher : les scripts générés font
    # `mv "$file" "$OCPath/data/pdf/"` (OCPath=/app) sans mkdir préalable.
    # Le traitement étant INLINE dans le conteneur qui déclenche le script
    # (fs-watcher), ce dossier container-local suffit.
    && mkdir -p /app/data/pdf \
    && chown -R "${APP_UID}:${APP_GID}" /app /tmp/opencapture

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["api"]
