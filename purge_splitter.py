# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/>.

# @dev : Oussama BRICH <oussama.brich@edissyum.com>

import os
import sys
import shutil
import argparse
from datetime import datetime, timedelta

from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_config_from_custom_id

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Purge splitter batches.')
    parser.add_argument("-c", '--custom-id', help='Custom id')
    parser.add_argument("-t", '--target-status', help='Status to purge')
    parser.add_argument("-p", '--purge-status', help='Status to set after purge')
    parser.add_argument("-d", '--conservation-days', help='Number of days to keep batches')
    args = parser.parse_args()

    if args.custom_id is None:
        sys.exit("Please provide custom id."
                 " Ex : python3 purge_splitter.py --custom-id edissyum --target-status END --purge-status PURGED "
                 "--conservation-days 7")

    if not retrieve_config_from_custom_id(args.custom_id):
        sys.exit('Custom config file could not be found')

    database, config, _, _, _, log, _, _, _, docservers, _, _ = create_classes_from_custom_id(args.custom_id)

    if args.target_status is not None:
        target_status = args.target_status
    else:
        log.error("Please provide target status. "
                 "Ex : python3 purge_splitter.py --custom-id edissyum --target-status END --purge-status PURGED "
                 "--conservation-days 7")
        exit(1)

    if args.purge_status is not None:
        purge_status = args.purge_status
    else:
        log.error("Please provide purge status. "
                 "Ex : python3 purge_splitter.py --custom-id edissyum --target-status END --purge-status PURGED "
                 "--conservation-days 7")
        exit(1)

    if args.conservation_days is not None:
        try:
            conservation_days = int(args.conservation_days)
        except ValueError:
            log.error("Please provide a valid conservation days. "
                     "Ex : python3 purge_splitter.py --custom-id edissyum --target-status END --purge-status PURGED "
                     "--conservation-days 7")
            exit(1)
    else:
        log.error("Please provide a valid conservation days. "
                 "Ex : python3 purge_splitter.py --custom-id edissyum --target-status END --purge-status PURGED "
                 "--conservation-days 7")
        exit(1)

    # Calculate the date threshold for deletion (7 days ago)
    threshold_date = datetime.now() - timedelta(days=conservation_days)

    # Format the threshold date as a string in the format 'YYYY-MM-DD HH:MM:SS'
    threshold_date_str = threshold_date.strftime('%Y-%m-%d %H:%M:%S')

    batches = database.select({
        'select': ['id', 'status', 'file_path', 'batch_folder'],
        'table': ['splitter_batches'],
        'where': ['creation_date < %s', 'status = %s'],
        'data': [threshold_date_str, target_status]
    })
    log.info(f"Found {len(batches)} batches older than {conservation_days} days with status {target_status}")
    for batch in batches:
        log.info(f"Updating batch {batch['id']} status from {target_status} to {purge_status}")
        res = database.update({
            'table': ['splitter_batches'],
            'set': {
                'status': purge_status
            },
            'where': ['id = %s'],
            'data': [batch['id']]
        })

        try:
            # Remove files from docservers based on the file paths
            if batch['file_path'] is not None:
                file_path = f"{docservers['SPLITTER_ORIGINAL_PDF']}/{batch['file_path']}"
                os.remove(file_path)
                log.info(f"File removed: {file_path}")

            if batch['batch_folder'] is not None:
                batch_folder = f"{docservers['SPLITTER_BATCHES']}/{batch['batch_folder']}"
                thumb_folder = f"{docservers['SPLITTER_THUMB']}/{batch['batch_folder']}"
                shutil.rmtree(batch_folder)
                log.info(f"File removed: {batch_folder}")
                shutil.rmtree(thumb_folder)
                log.info(f"File removed: {thumb_folder}")

        except Exception as e:
            log.error(f"Error while removing files : {e}")
            continue

    # Commit and close database connection
    database.conn.commit()
    database.conn.close()
