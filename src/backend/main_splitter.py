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
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
import os
import sys
import time
import tempfile
from kuyruk import Kuyruk
from kuyruk_manager import Manager
from .main import timer, check_file, create_classes
from .import_classes import _Files, _Config, _Splitter, _SeparatorQR
from .import_process import OCForInvoices_splitter

OCforInvoices = Kuyruk()

OCforInvoices.config.MANAGER_HOST = "127.0.0.1"
OCforInvoices.config.MANAGER_PORT = 16502
OCforInvoices.config.MANAGER_HTTP_PORT = 16503

m = Manager(OCforInvoices)


# If needed just run "kuyruk --app src.backend.main_splitter.OCforInvoices_Sep manager"
# to have web dashboard of current running worker
@OCforInvoices.task(queue='splitter')
def launch(args):
    start = time.time()

    # Init all the necessary classes
    config_name = _Config(args['config'])
    config_file = config_name.cfg['PROFILE']['cfgpath'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini'

    if not os.path.exists(config_file):
        sys.exit('Config file couldn\'t be found')

    config, locale, log, ocr, database, spreadsheet = create_classes(config_file)
    tmp_folder = tempfile.mkdtemp(dir=config.cfg['SPLITTER']['batchpath']) + '/'
    separator_qr = _SeparatorQR(log, config, tmp_folder, 'splitter')
    splitter = _Splitter(config, database, locale, separator_qr, log)

    file_name = tempfile.NamedTemporaryFile(dir=tmp_folder).name
    files = _Files(
        file_name,
        int(config.cfg['GLOBAL']['resolution']),
        int(config.cfg['GLOBAL']['compressionquality']),
        log,
        config.cfg['GLOBAL']['convertpdftotiff'],
        locale,
        config
    )

    # Connect to database
    database.connect()

    # Start process
    if args['file'] is not None:
        path = args['file']
        if check_file(files, path, config, log) is not False:
            # Process the file and send it to Maarch
            OCForInvoices_splitter.process(args, path, log, splitter, files, tmp_folder, config)

    # Close database
    database.conn.close()

    end = time.time()
    log.info('Process end after ' + timer(start, end) + '')
