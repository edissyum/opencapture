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
import sys
import time
import tempfile

# useful to use the worker and avoid ModuleNotFoundError
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from kuyruk import Kuyruk
from kuyruk_manager import Manager
from webApp.functions import get_custom_id, check_python_customized_files
from .main import timer, check_file

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'Config' not in custom_array:
    from bin.src.classes.Config import Config as _Config
else:
    _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['Config']['module'], fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'Log' not in custom_array:
    from bin.src.classes.Log import Log as _Log
else:
    _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'], fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

if 'Files' not in custom_array:
    from bin.src.classes.Files import Files as _Files
else:
    _Files = getattr(__import__(custom_array['Files']['path'] + '.' + custom_array['Files']['module'], fromlist=[custom_array['Files']['module']]), custom_array['Files']['module'])

if 'Xml' not in custom_array:
    from bin.src.classes.Xml import Xml as _Xml
else:
    _Xml = getattr(__import__(custom_array['Xml']['path'] + '.' + custom_array['Xml']['module'], fromlist=[custom_array['Xml']['module']]), custom_array['Xml']['module'])

if 'Locale' not in custom_array:
    from bin.src.classes.Locale import Locale as _Locale
else:
    _Locale = getattr(__import__(custom_array['Locale']['path'] + '.' + custom_array['Locale']['module'], fromlist=[custom_array['Locale']['module']]), custom_array['Locale']['module'])

if 'PyTesseract' not in custom_array:
    from bin.src.classes.PyTesseract import PyTesseract as _PyTesseract
else:
    _PyTesseract = getattr(__import__(custom_array['PyTesseract']['path'] + '.' + custom_array['PyTesseract']['module'], fromlist=[custom_array['PyTesseract']['module']]),
                           custom_array['PyTesseract']['module'])

if 'Database' not in custom_array:
    from bin.src.classes.Database import Database as _Database
else:
    _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'], fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

if 'Splitter' not in custom_array:
    from bin.src.classes.Splitter import Splitter as _Splitter
else:
    _Splitter = getattr(__import__(custom_array['Splitter']['path'] + '.' + custom_array['Splitter']['module'], fromlist=[custom_array['Splitter']['module']]), custom_array['Splitter']['module'])

if 'OCForInvoices_splitter' not in custom_array:
    from bin.src.process import OCForInvoices_splitter
else:
    OCForInvoices_splitter = getattr(__import__(custom_array['OCForInvoices_splitter']['path'], fromlist=[custom_array['OCForInvoices_splitter']['module']]),
                                     custom_array['OCForInvoices_splitter']['module'])

OCforInvoices = Kuyruk()

OCforInvoices.config.MANAGER_HOST = "127.0.0.1"
OCforInvoices.config.MANAGER_PORT = 16502
OCforInvoices.config.MANAGER_HTTP_PORT = 16503

m = Manager(OCforInvoices)


# If needed just run "kuyruk --app bin.src.main_splitter.OCforInvoices_Sep manager" to have web dashboard of current running worker
@OCforInvoices.task(queue='splitter')
def launch(args):
    start = time.time()

    # Init all the necessary classes
    config_name = _Config(args['config'])
    cfg_name = config_name.cfg['PROFILE']['cfgpath'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini'

    if not os.path.exists(cfg_name):
        sys.exit('Config file couldn\'t be found')

    config = _Config(config_name.cfg['PROFILE']['cfgpath'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')

    tmp_folder = tempfile.mkdtemp(dir=config.cfg['SPLITTER']['tmpbatchpath']) + '/'
    file_name = tempfile.NamedTemporaryFile(dir=tmp_folder).name

    locale = _Locale(config)
    log = _Log(config.cfg['GLOBAL']['logfile'])
    ocr = _PyTesseract(locale.localeOCR, log, config)
    db_type = config.cfg['DATABASE']['databasetype']
    db_user = config.cfg['DATABASE']['postgresuser']
    db_pwd = config.cfg['DATABASE']['postgrespassword']
    db_name = config.cfg['DATABASE']['postgresdatabase']
    db_host = config.cfg['DATABASE']['postgreshost']
    db_port = config.cfg['DATABASE']['postgresport']
    database = _Database(log, db_type, db_name, db_user, db_pwd, db_host, db_port, config.cfg['DATABASE']['databasefile'])
    splitter = _Splitter(config, database, locale)
    xml = _Xml(config, database)
    files = _Files(
        file_name,
        int(config.cfg['GLOBAL']['resolution']),
        int(config.cfg['GLOBAL']['compressionquality']),
        xml,
        log,
        config.cfg['GLOBAL']['convertpdftotiff']
    )

    # Connect to database
    database.connect()

    # Start process
    if args['file'] is not None:
        path = args['file']
        if check_file(files, path, config, log) is not False:
            # Process the file and send it to Maarch
            OCForInvoices_splitter.process(path, log, splitter, files, ocr, tmp_folder, config)

    # Close database
    database.conn.close()

    end = time.time()
    log.info('Process end after ' + timer(start, end) + '')
