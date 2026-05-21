# syntax=docker/dockerfile:1.7
# Multi-stage build for Open-Capture backend.
# - builder: installs build toolchain + compiles wheels into /wheels
# - runtime: slim image with only runtime libs + installed wheels
#
# The same image powers every backend role (api, worker-verifier,
# worker-splitter, worker-mail, fs-watcher, init); the role is
# selected at runtime via the OC_ROLE env var consumed by entrypoint.sh.

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
COPY pip-requirements.txt ./

RUN python -m pip install --upgrade pip wheel setuptools pycparser \
    && python -m pip wheel \
        --wheel-dir=/wheels \
        -r pip-requirements.txt \
        pyinotify-elephant-fork


FROM python:3.13-slim-bookworm AS runtime

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    LD_LIBRARY_PATH=/usr/local/lib/ \
    MAGICK_TMPDIR=/tmp/opencapture/ \
    TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata/

RUN apt-get update && apt-get install -y --no-install-recommends \
        # Image / PDF / OCR CLI tools. These pull in the matching
        # shared libs (libpoppler-cpp, libtesseract5, libleptonica,
        # libzbar0, libgs10...) transitively, so we don't list them
        # explicitly here -- avoids breakage on Debian version bumps
        # (e.g. the t64 rename libpoppler-cpp0v5 -> libpoppler-cpp2t64).
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
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /tmp/opencapture

# Install pre-built wheels from the builder stage.
COPY --from=builder /wheels /wheels
COPY pip-requirements.txt /tmp/pip-requirements.txt
RUN python -m pip install --upgrade pip \
    && python -m pip install --no-index --find-links=/wheels \
        -r /tmp/pip-requirements.txt \
        pyinotify-elephant-fork \
    && rm -rf /wheels /tmp/pip-requirements.txt

# Allow ImageMagick to read/write PDFs (the default Debian policy blocks PDF).
RUN sed -i 's|<policy domain="coder" rights="none" pattern="PDF" />|<policy domain="coder" rights="read\|write" pattern="PDF" />|' \
        /etc/ImageMagick-6/policy.xml || true

WORKDIR /app

COPY . /app/
RUN chmod +x /app/docker-entrypoint.sh /app/docker-bootstrap.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["api"]
