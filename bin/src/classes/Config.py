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

from configparser import ConfigParser, ExtendedInterpolation

class Config:
    def __init__(self, path):
        self.cfg = {}
        # ExtendedInterpolation is needed to use var into the config.ini file
        parser = ConfigParser(interpolation=ExtendedInterpolation())
        parser.read(path)
        for section in parser.sections():
            self.cfg[section] = {}
            for info in parser[section]:
                self.cfg[section][info] = parser[section][info]
