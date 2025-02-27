# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan CHEVAL <nathan.cheval@edissyum.com>
# @dev : Oussama BRICH <oussama.brich@edissyum.com>

import json
import argparse
from src.backend.classes.Splitter import Splitter
from src.backend.main import create_classes_from_custom_id

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Reload metadata for Splitter.')
    parser.add_argument("-m", '--methods', help='Config JSON for matadata methods')
    parser.add_argument("-c", '--custom-id', help='Custom id')
    args = parser.parse_args()
    database, config, _, _, _, log, _, _, _, docservers, _, _, _ = create_classes_from_custom_id(args.custom_id)

    with open(args.methods) as split_methods:
        split_methods = split_methods.read()
        split_methods = json.loads(split_methods)
        cursor = database.conn.cursor()
        cursor.execute("TRUNCATE TABLE metadata", {})

        for method in split_methods['methods']:
            method['referentialMode'] = 0
            if method['callOnScript']:
                metadata_load = Splitter.import_method_from_script(docservers['SPLITTER_METADATA_PATH'],
                                                                   method['script'], method['method'])
                log.info(f"Reload metadata for {method['id']}....")
                _args = {
                    'log': log,
                    'config': config,
                    'database': database,
                    'method_data': method,
                    'docservers': docservers,
                    'form_id': method['form_id']
                }
                metadata_load(_args)
                log.info(f"{method['id']} metadata reload with success")

    # Commit and close database connection
    database.conn.commit()
    database.conn.close()
