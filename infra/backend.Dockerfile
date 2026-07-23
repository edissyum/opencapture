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

# Service account shared by all backend / tenant containers.
# UID/GID are configurable at build time to align with an existing
# host account (see APP_UID/APP_GID in .env). The entrypoint also
# re-reads these values at runtime and can drop to another UID without
# a rebuild.
ARG APP_UID=1000
ARG APP_GID=1000
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
    HOME=/app \
    NLTK_DATA=/usr/local/share/nltk_data

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
        # `file` CLI (libmagic front-end): the fs-watcher workflow
        # scripts detect the MIME type via `file -b -i`; without it,
        # the PDF is rejected as "not valid".
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

# NLTK corpora required by ArtificialIntelligence.py (word_tokenize /
# stopwords FR). Downloaded at build time into one of NLTK's default
# search paths: data is baked into the image, so no runtime egress and
# no permission issues on the bind mounts.
RUN python -m nltk.downloader -d "$NLTK_DATA" punkt punkt_tab stopwords

# Allow ImageMagick to read/write PDFs (the default Debian policy blocks PDF).
RUN sed -i 's|<policy domain="coder" rights="none" pattern="PDF" />|<policy domain="coder" rights="read\|write" pattern="PDF" />|' \
        /etc/ImageMagick-6/policy.xml || true

WORKDIR /app

# App code (everything under backend/ at the repo root).
COPY backend/ /app/

# Defaults for the SHARED AI models, kept OUTSIDE the
# /app/instance/artificial_intelligence bind mount so docker-bootstrap.sh
# can seed the shared host folder (initially empty) on first startup.
COPY backend/instance/artificial_intelligence/rotate_document.pt /opt/oc-default-models/rotate_document.pt

# Entrypoint scripts live in infra/, copied into /app/ to keep the
# legacy /app/docker-entrypoint.sh layout.
COPY infra/docker-entrypoint.sh /app/docker-entrypoint.sh
COPY infra/docker-bootstrap.sh  /app/docker-bootstrap.sh
RUN chmod +x /app/docker-entrypoint.sh /app/docker-bootstrap.sh

# Default service account (home=/app, bash shell for the "shell"
# role). The ENTRYPOINT stays root at startup: it chowns the bind
# mounts then drops to this account via gosu (see docker-entrypoint.sh).
RUN groupadd -g "${APP_GID}" "${APP_USER}" \
    && useradd -u "${APP_UID}" -g "${APP_GID}" -d /app -s /bin/bash -M "${APP_USER}" \
    && chown -R "${APP_UID}:${APP_GID}" /app /tmp/opencapture

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["api"]
