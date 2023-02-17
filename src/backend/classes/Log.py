# This file is part of Open-Capture.
import json
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

import time
import logging
from logging.handlers import RotatingFileHandler


class Log:
    def __init__(self, path, smtp):
        self.smtp = smtp
        self.filename = ''
        self.current_step = 1
        self.task_id_watcher = None
        self.task_id_monitor = None
        self.database = None
        self.logger = logging.getLogger('Open-Capture')
        if self.logger.hasHandlers():
            self.logger.handlers.clear()  # Clear the handlers to avoid double logs
        max_size = 5 * 1024 * 1024
        log_file = RotatingFileHandler(path, mode='a', maxBytes=max_size, backupCount=2, encoding=None, delay=False)
        formatter = logging.Formatter('[%(name)-17s] %(asctime)s %(levelname)s %(message)s', datefmt='%d-%m-%Y %H:%M:%S')
        log_file.setFormatter(formatter)
        self.logger.addHandler(log_file)

        self.logger.filters.clear()
        self.logger.setLevel(logging.DEBUG)

    def info(self, msg):
        if self.database and self.task_id_monitor:
            self.update_task_monitor(msg)
        self.current_step += 1
        self.logger.info(msg)

    def error(self, msg, send_notif=True):
        self.current_step += 1
        if self.smtp and self.smtp.enabled and send_notif:
            self.smtp.send_notification(msg, self.filename)

        if self.database:
            if self.task_id_monitor:
                self.update_task_monitor(msg, 'error')
            if self.task_id_watcher:
                self.update_task_watcher(msg)
        self.logger.error(msg)

    def update_task_monitor(self, msg, status='running'):
        new_step = {
            "status": status,
            "message": msg,
            "date": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.database.update({
            'table': ['monitoring'],
            'set': {
                "error": True if status == 'error' else False,
                'steps': "jsonb_set(steps, '{" + str(self.current_step) + "}', '" + json.dumps(new_step) + "')",
            },
            'where': ['id = %s'],
            'data': [self.task_id_monitor]
        })

    def update_task_watcher(self, msg):
        self.database.update({
            'table': ['tasks_watcher'],
            'set': {
                'status': 'error',
                'error_description': msg,
                'end_date': time.strftime("%Y-%m-%d %H:%M:%S")
            },
            'where': ['id = %s'],
            'data': [self.task_id_watcher]
        })
