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
import queue
import tempfile

# useful to use the worker and avoid ModuleNotFoundError
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from kuyruk import Kuyruk
from kuyruk_manager import Manager
import bin.src.classes.Log as logClass
import bin.src.classes.Files as filesClass
import bin.src.classes.Xml as xml
import bin.src.classes.Config as configClass
import bin.src.classes.Locale as localeClass
import bin.src.classes.PyTesseract as ocrClass
import bin.src.classes.Database as databaseClass
from bin.src.process.OCForInvoices_splitter import process
import bin.src.classes.Splitter as splitter

OCforInvoices = Kuyruk()

OCforInvoices.config.MANAGER_HOST         = "127.0.0.1"
OCforInvoices.config.MANAGER_PORT         = 16502
OCforInvoices.config.MANAGER_HTTP_PORT    = 16503

m = Manager(OCforInvoices)

def check_file(Files, path, Config, Log):
    if not Files.check_file_integrity(path, Config):
        Log.error('The integrity of file could\'nt be verified : ' + str(path))
        return False

def timer(startTime, endTime):
    hours, rem = divmod(endTime - startTime, 3600)
    minutes, seconds = divmod(rem, 60)
    return "{:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds)

def recursive_delete(folder, Log):
    for file in os.listdir(folder):
        try:
            os.remove(folder + '/' + file)
        except FileNotFoundError as e:
            Log.error('Unable to delete ' + folder + '/' + file + ' on temp folder: ' + str(e))
    try:
        os.rmdir(folder)
    except FileNotFoundError as e:
        Log.error('Unable to delete ' + folder + ' on temp folder: ' + str(e))

# If needed just run "kuyruk --app bin.src.main_splitter.OCforInvoices_Sep manager" to have web dashboard of current running worker
@OCforInvoices.task(queue='splitter')
def launch(args):
    start = time.time()

    # Init all the necessary classes
    configName  = configClass.Config(args['config'])
    cfgName     = configName.cfg['PROFILE']['cfgpath'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini'

    if not os.path.exists(cfgName):
        sys.exit('Config file couldn\'t be found')

    Config      = configClass.Config(configName.cfg['PROFILE']['cfgpath'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini')

    tmpFolder   = tempfile.mkdtemp(dir=Config.cfg['SPLITTER']['tmpbatchpath']) + '/'
    fileName    = tempfile.NamedTemporaryFile(dir=tmpFolder).name

    Locale      = localeClass.Locale(Config)
    Log         = logClass.Log(Config.cfg['GLOBAL']['logfile'])
    Ocr         = ocrClass.PyTesseract(Locale.localeOCR, Log, Config)
    Database    = databaseClass.Database(Log, Config.cfg['DATABASE']['databasefile'])
    Splitter    = splitter.Splitter(Config, Database, Locale)
    Xml         = xml.Xml(Config, Database)
    Files       = filesClass.Files(
        fileName,
        int(Config.cfg['GLOBAL']['resolution']),
        int(Config.cfg['GLOBAL']['compressionquality']),
        Xml,
        Config.cfg['GLOBAL']['convertpdftotiff']
    )

    # Connect to database
    Database.connect()

    # Start process
    if args['file'] is not None:
        path = args['file']
        if check_file(Files, path, Config, Log) is not False:
            # Process the file and send it to Maarch
            process(path, Log, Splitter, Files, Ocr, tmpFolder)

    elif args['path'] is not None:
        path = args['path']
        for file in os.listdir(path):
            if check_file(Files, path + file, Config, Log) is not False:
                # Create the Queue to store files
                q = queue.Queue()

                # Find file in the wanted folder (default or exported pdf after qrcode separation)
                q = process(path + file, Log, Splitter, Files, Ocr, tmpFolder)

                if not q:
                    continue

    # Empty the tmp dir to avoid residual file
    # recursive_delete(tmpFolder, Log)
    # Close database
    Database.conn.close()

    end = time.time()
    Log.info('Process end after ' + timer(start,end) + '')
