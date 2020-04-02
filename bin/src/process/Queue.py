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
import shutil
from threading import Thread

def runQueue(q, Config, Image, Log, WebService, Ocr):
    numberOfThreads = int(Config.cfg['GLOBAL']['nbthreads'])
    threads =  []
    for i in range(numberOfThreads):
        thread = ProcessQueue(q, Config, Image, Log, WebService, Ocr, i)
        thread.start()
        threads.append(thread)

    for t in threads:
        t.join()

class ProcessQueue(Thread):
    def __init__(self, q, Config, Image, Log, WebService, Ocr, cpt):
        Thread.__init__(self, name='processQueue ' + str(cpt))
        self.queue      = q
        self.Log        = Log
        self.Ocr        = Ocr
        self.Config     = Config
        self.Image      = Image
        self.WebService = WebService

    def run(self):
        while not self.queue.empty():
            queueInfo       = self.queue.get()
            file            = queueInfo['file']
            date            = queueInfo['date']
            subject         = queueInfo['subject']
            contact         = queueInfo['contact']
            _process        = queueInfo['process']
            fileToSend      = queueInfo['fileToSend']
            destination     = queueInfo['destination']
            resId           = queueInfo['resId']
            chrono          = queueInfo['chrono']
            isInternalNote  = queueInfo['isInternalNote']

            # Send to Maarch
            if 'is_attachment' in self.Config.cfg[_process] and self.Config.cfg[_process]['is_attachment'] != '':
                if isInternalNote:
                    res = self.WebService.insert_attachment(fileToSend, self.Config, resId, _process)
                else:
                    res = self.WebService.insert_attachment_reconciliation(fileToSend, chrono, _process)
            else:
                res = self.WebService.insert_with_args(fileToSend, self.Config, contact, subject, date, destination, _process)

            if res:
                self.Log.info("Insert OK : " + res)
                try:
                    os.remove(file)
                except FileNotFoundError as e:
                    self.Log.error('Unable to delete ' + file + ' : ' + str(e))
                return True
            else:
                shutil.move(file, self.Config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
                return False
