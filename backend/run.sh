#!/bin/bash

export LD_LIBRARY_PATH=/usr/local/lib/
export MAGICK_TMPDIR=/tmp/opencapture/
export TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata/

gunicorn --bind 0.0.0.0:8000 wsgi:app --timeout 600 --workers 2 --threads 2 --worker-class gthread --reload --log-level debug --capture-output --error-logfile /app/gunicorn.log &

kuyruk_location=$(which kuyruk)
$kuyruk_location --app src.process_queue_verifier.kuyruk worker --queue verifier_edissyum