# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture.If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan CHEVAL <nathan.cheval@outlook.fr>
# @dev : Oussama BRICH <oussama.brich@edissyum.com>

import os
import sys
import argparse
from datetime import datetime, timedelta
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_config_from_custom_id

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Purge Verifier documents')
    parser.add_argument("-c", '--custom-id', help='Custom id')
    parser.add_argument("-t", '--target-status', help='Status to purge')
    parser.add_argument("-p", '--purge-status', help='Status to set after purge')
    parser.add_argument("-d", '--conservation-days', help='Number of days to keep documents')
    args = parser.parse_args()

    if args.custom_id is None:
        sys.exit("Please provide custom id \n"
                 "Ex : python3 purge_verifier.py --custom-id edissyum --target-status END --purge-status PURGED "
                 "--conservation-days 7")

    if not retrieve_config_from_custom_id(args.custom_id):
        sys.exit('Custom config file could not be found')

    database, config, _, _, _, log, _, _, _, docservers, _, _, _ = create_classes_from_custom_id(args.custom_id)

    if args.target_status is not None:
        target_status = args.target_status
    else:
        log.error("Please provide target status\n"
                  "Ex : python3 purge_verifier.py --custom-id edissyum --target-status END --purge-status PURGED "
                  "--conservation-days 7")
        exit(1)

    if args.purge_status is not None:
        purge_status = args.purge_status
    else:
        log.error("Please provide purge status\n"
                  "Ex : python3 purge_verifier.py --custom-id edissyum --target-status END --purge-status PURGED "
                  "--conservation-days 7")
        exit(1)

    if args.conservation_days is not None:
        try:
            conservation_days = int(args.conservation_days)
        except ValueError:
            log.error("Please provide a valid conservation days\n"
                      "Ex : python3 purge_verifier.py --custom-id edissyum --target-status END --purge-status PURGED "
                      "--conservation-days 7")
            exit(1)
    else:
        log.error("Please provide a valid conservation days\n"
                  "Ex : python3 purge_verifier.py --custom-id edissyum --target-status END --purge-status PURGED "
                  "--conservation-days 7")
        exit(1)

    # Calculate the date threshold for deletion (7 days ago)
    threshold_date = datetime.now() - timedelta(days=conservation_days)

    # Format the threshold date as a string in the format 'YYYY-MM-DD HH:MM:SS'
    threshold_date_str = threshold_date.strftime('%Y-%m-%d %H:%M:%S')

    documents = database.select({
        'select': ['id', 'status', 'path', 'filename', 'full_jpg_filename', 'register_date'],
        'table': ['documents'],
        'where': ['register_date < %s', 'status = %s'],
        'data': [threshold_date_str, target_status]
    })
    log.info(f"Found {len(documents)} documents older than {conservation_days} days with status {target_status}")
    for document in documents:
        log.info(f"Updating document {document['id']} status from {target_status} to {purge_status}")
        database.update({
            'table': ['documents'],
            'set': {
                'status': purge_status
            },
            'where': ['id = %s'],
            'data': [document['id']]
        })

        try:
            # Remove files from docservers based on the file paths
            if document['path'] and document['filename']:
                file_path = f"{document['path']}/{document['filename']}"
                if os.path.exists(file_path):
                    os.remove(file_path)
                    log.info(f"File removed: {file_path}")

            if document['full_jpg_filename']:
                year = document['register_date'].strftime('%Y')
                month = document['register_date'].strftime('%m')
                thumb_file = f"{docservers['VERIFIER_THUMB']}/{year}/{month}/{document['full_jpg_filename']}"
                full_file = f"{docservers['VERIFIER_IMAGE_FULL']}/{year}/{month}/{document['full_jpg_filename']}"

                if os.path.exists(thumb_file):
                    os.remove(thumb_file)
                    log.info(f"File removed: {thumb_file}")
                if os.path.exists(full_file):
                    os.remove(full_file)
                    log.info(f"File removed: {full_file}")
        except (Exception,) as e:
            log.error(f"Error while removing files : {e}")
            continue

    # Commit and close database connection
    database.conn.commit()
    database.conn.close()
