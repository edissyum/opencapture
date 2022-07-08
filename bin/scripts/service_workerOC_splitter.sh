#!/bin/bash
# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

export LD_LIBRARY_PATH=/usr/local/lib/
export MAGICK_TMPDIR=/tmp/opencaptureforinvoices/
export TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata/

cd /var/www/html/opencaptureforinvoices/ || exit
/usr/local/bin/kuyruk --app src.backend.main_splitter.OCforInvoices_worker worker --queue splitter
