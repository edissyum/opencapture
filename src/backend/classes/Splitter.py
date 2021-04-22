# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import uuid

from datetime import date
from src.backend.classes.Files import Files


def get_lot_name():
    random_number = uuid.uuid4().hex
    # date object of today's date
    today = date.today()
    lot_name = str(today.year) + str(today.month) + str(today.day) + str(random_number)
    return lot_name


class Splitter:
    def __init__(self, config, database, locale, separator_qr):
        self.Config = config
        self.db = database
        self.Locale = locale
        self.separator_qr = separator_qr

    def save_batch(self, pages, batch_folder, orig_file):
        batch_name = os.path.basename(os.path.normpath(batch_folder))
        split_document = 0
        args = {
            'table': 'splitter_batches',
            'columns': {
                'file_name': orig_file.rsplit('/')[-1],
                'batch_folder': batch_name,
                'first_page': pages[0][1],
                'page_number': str(len(pages) - len(self.separator_qr.pages))
            }
        }
        batch_id = self.db.insert(args)

        for index, path in pages:
            is_separator = list(filter(lambda separator: int(separator['num']) + 1 == int(index),
                                       self.separator_qr.pages))
            if is_separator:
                if self.Config.cfg['SPLITTER']['DOCSTART'] in is_separator[0]['qr_code']:
                    split_document += 1

                elif self.Config.cfg['SPLITTER']['BUNDLESTART'] in is_separator[0]['qr_code'] and split_document != 0:
                    split_document = 0
                    args = {
                        'table': 'splitter_batches',
                        'columns': {
                            'file_name': orig_file.rsplit('/')[-1],
                            'batch_folder': batch_name,
                            'first_page': pages[0][1],
                            'page_number': str(len(pages) - len(self.separator_qr.pages))
                        }
                    }
                    batch_id = self.db.insert(args)

                continue

            image = Files.open_image_return(path)
            args = {
                'table': 'splitter_pages',
                'columns': {
                    'batch_id': str(batch_id),
                    'image_path': path,
                    'split_document': str(split_document),
                }
            }
            self.db.insert(args)
            image.save(path, 'JPEG')
        self.db.conn.commit()

        return {'batch_id': batch_id}
