import os
import sys
import shutil
import argparse
from datetime import datetime, timedelta
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_config_from_custom_id

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Purge batches.')
    parser.add_argument("-c", '--custom-id', help='Custom id')
    args = parser.parse_args()

    if args.custom_id is None:
        sys.exit("Please provide custom id\n"
                 "Ex : python3 purge_batches.py --custom-id edissyum")

    if not retrieve_config_from_custom_id(args.custom_id):
        sys.exit('Custom config file could not be found')

    database, config, _, _, _, log, _, _, _, docservers, _, _, _ = create_classes_from_custom_id(args.custom_id)

    path_batches = docservers['SPLITTER_BATCHES']
    path_thumb = docservers['SPLITTER_THUMB']

    log.info(f"Found {len(os.listdir(path_batches))} batches")

    for directory in os.listdir(path_batches):

        batche = database.select({
            'select': ['id','batch_folder'],
            'table': ['splitter_batches'],
            'where': ['batch_folder = %s'],
            'data': [directory]
        })

        try:
            if not batche:
                batch_folder = f"{path_batches}/{directory}"
                thumb_folder = f"{path_thumb}/{directory}"
                shutil.rmtree(batch_folder)
                shutil.rmtree(thumb_folder)
                log.info(f"File removed: {batch_folder}")
        except (Exception,) as e:
            log.error(f"Error while removing files : {e}")
            continue
        
    # Commit and close database connection
    database.conn.commit()
    database.conn.close()
