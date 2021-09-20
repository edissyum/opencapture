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

import logging
from logging.handlers import RotatingFileHandler


class Log:
    def __init__(self, path):
        self.LOGGER = logging.getLogger('Open-Capture')
        if self.LOGGER.hasHandlers():
            self.LOGGER.handlers.clear()  # Clear the handlers to avoid double logs

        log_file = RotatingFileHandler(path, mode='a', maxBytes=5 * 1024 * 1024, backupCount=2, encoding=None, delay=False)
        formatter = logging.Formatter('[%(name)-14s] %(asctime)s %(levelname)s %(message)s', datefmt='%d-%m-%Y %H:%M:%S')
        log_file.setFormatter(formatter)
        self.LOGGER.addHandler(log_file)
        self.LOGGER.setLevel(logging.DEBUG)

    def info(self, msg):
        self.LOGGER.info(msg)

    def error(self, msg):
        self.LOGGER.error(msg)
