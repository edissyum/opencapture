#!/bin/bash

export LD_LIBRARY_PATH=/usr/local/lib/
export MAGICK_TMPDIR=/tmp/opencapture/
export TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata/

kuyruk_location=$(which kuyruk)
#$kuyruk_location --app src.process_queue_verifier.kuyruk worker --queue verifier_edissyum

$kuyruk_location --app custom.edissyum.src.backend.process_queue_verifier.kuyruk worker --queue verifier_edissyum