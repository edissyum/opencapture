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
from configparser import ConfigParser, ExtendedInterpolation


class Config:
    def __init__(self, path, interpolation=True):
        self.cfg = {}
        if interpolation:
            # ExtendedInterpolation is needed to use var into the config.ini file
            parser = ConfigParser(interpolation=ExtendedInterpolation())
        else:
            parser = ConfigParser()
        parser.read(path)
        for section in parser.sections():
            self.cfg[section] = {}
            for info in parser[section]:
                self.cfg[section][info] = parser[section][info]

    def read_position(self, typology, key, locale):
        file = self.cfg['REFERENCIAL']['referencialposition'] + str(typology) + '.ini'
        res = {}
        if os.path.isfile(file):
            parser = ConfigParser(interpolation=ExtendedInterpolation())
            parser.read(file)
            for section in parser.sections():
                if section == key:
                    for info in parser[section]:
                        res[info] = parser[section][info]
        if res and res['regex']:
            locale_list = locale.get()
            res['regex'] = locale_list[res['regex']]
        return res

    @staticmethod
    def read_custom_position(file):
        if os.path.isfile(file):
            parser = ConfigParser(interpolation=ExtendedInterpolation())
            parser.read(file)
            cfg = {}
            for section in parser.sections():
                if section.split('-')[0] == 'custom':
                    cfg[section] = {}
                    for info in parser[section]:
                        cfg[section][info] = parser[section][info]
            return cfg

    @staticmethod
    def fswatcher_update_watch(file, job, data):
        config = ConfigParser()
        config.read(file)
        config[job]['watch'] = data
        with open(file, 'w') as configfile:
            config.write(configfile)

    @staticmethod
    def fswatcher_update_command(file, job, data):
        config = ConfigParser()
        config.read(file)
        config[job]['command'] = data
        with open(file, 'w') as configfile:
            config.write(configfile)

    @staticmethod
    def fswatcher_add_section(file, job, command, watch):
        config = ConfigParser()
        config.read(file)
        config.add_section(job)
        config[job]['watch'] = watch
        config[job]['events'] = 'close,move'
        config[job]['include_extensions'] = 'pdf'
        config[job]['command'] = command
        with open(file, 'w') as configfile:
            config.write(configfile)

    @staticmethod
    def fswatcher_remove_section(file, job):
        config = ConfigParser()
        config.read(file)
        config.remove_section(job)
        with open(file, 'w') as configfile:
            config.write(configfile)
