# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import logging
from inspect import getframeinfo, stack
from logging.handlers import RotatingFileHandler


def caller_reader(f):
    """This wrapper updates the context with the callor infos"""

    def wrapper(self, *args):
        caller = getframeinfo(stack()[1][0])
        self._filter.file = os.path.basename(caller.filename)
        self._filter.line_n = caller.lineno
        return f(self, *args)
    return wrapper


class Log:
    def __init__(self, path, smtp):
        self.smtp = smtp
        self.filename = ''
        self.LOGGER = logging.getLogger('Open-Capture')
        if self.LOGGER.hasHandlers():
            self.LOGGER.handlers.clear()  # Clear the handlers to avoid double logs
        log_file = RotatingFileHandler(path, mode='a', maxBytes=5 * 1024 * 1024,
                                       backupCount=2, encoding=None, delay=False)
        formatter = logging.Formatter(
            '[%(name)-17s] [%(file)-26sline %(line_n)-3s] %(asctime)s %(levelname)s %(message)s',
            datefmt='%d-%m-%Y %H:%M:%S')
        log_file.setFormatter(formatter)
        self.LOGGER.addHandler(log_file)

        self.LOGGER.filters.clear()
        self._filter = CallerFilter()
        self.LOGGER.addFilter(self._filter)
        self.LOGGER.setLevel(logging.DEBUG)

    @caller_reader
    def info(self, msg):
        self.LOGGER.info(msg)

    @caller_reader
    def error(self, msg, send_notif=True):
        if self.smtp.enabled and send_notif:
            self.smtp.send_notification(msg, self.filename)
        self.LOGGER.error(msg)


class CallerFilter(logging.Filter):
    """ This class adds some context to the log record instance """
    file = ''
    line_n = ''

    def filter(self, record):
        record.file = self.file
        record.line_n = self.line_n
        return True
