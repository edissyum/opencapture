#!/bin/bash

export LD_LIBRARY_PATH=/usr/local/lib/
export MAGICK_TMPDIR=/tmp/opencapture/
export TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata/

gunicorn --bind 0.0.0.0:8000 wsgi:app --reload --log-level debug --capture-output --error-logfile /app/gunicorn.log &

kuyruk_location=$(which kuyruk)
$kuyruk_location --app src.process_queue_verifier.kuyruk worker --queue verifier_edissyum


UPDATE docservers SET path = 'custom/edissyum/instance/referencial/' WHERE docserver_id = 'REFERENTIALS_PATH';