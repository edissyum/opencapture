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
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import json
import time
import logging
import logging.handlers


class RotatingFileHandlerUmask(logging.handlers.RotatingFileHandler):
    def _open(self):
        prevumask = os.umask(0o000)  # -rw-rw-rw-
        rtv = logging.handlers.RotatingFileHandler._open(self)
        os.umask(prevumask)
        return rtv


class Log:
    def __init__(self, path, smtp):
        self.smtp = smtp
        self.filename = ''
        self.database = None
        self.current_step = 1
        self.task_id_monitor = None
        self.process_in_error = False
        self.logger = logging.getLogger('Open-Capture')
        if self.logger.hasHandlers():
            self.logger.handlers.clear()  # Clear the handlers to avoid double logs
        max_size = 5 * 1024 * 1024
        log_file = RotatingFileHandlerUmask(path, mode='a', maxBytes=max_size, backupCount=2, delay=False)
        formatter = logging.Formatter('[%(name)-17s] %(asctime)s %(levelname)s %(message)s',
                                      datefmt='%d-%m-%Y %H:%M:%S')
        log_file.setFormatter(formatter)
        self.logger.addHandler(log_file)
        self.logger.setLevel(logging.DEBUG)

    def info(self, msg):
        if self.database and self.task_id_monitor:
            self.update_task_monitor(msg)
        self.current_step += 1
        self.logger.info(msg)

    def error(self, msg, send_notif=True):
        self.process_in_error = True
        if self.smtp and self.smtp.enabled and send_notif:
            self.smtp.send_notification(msg, self.filename)

        if self.database and self.task_id_monitor:
            self.update_task_monitor(str(msg), 'error')
        self.current_step += 1
        self.logger.error(msg)

    def update_task_monitor(self, msg, status='running'):
        new_step = {
            "status": status,
            "message": str(msg).replace("'", '"'),
            "date": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        self.database.update({
            'table': ['monitoring'],
            'set': {
                "error": status == 'error' or self.process_in_error,
                'steps': "jsonb_set(steps, '{" + str(self.current_step) + "}', '" + json.dumps(new_step) + "')"
            },
            'where': ['id = %s'],
            'data': [self.task_id_monitor]
        })
