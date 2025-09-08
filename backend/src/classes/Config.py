# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import re
import unidecode
from configparser import ConfigParser, ExtendedInterpolation


class Config:
    def __init__(self, path, interpolation=True):
        self.cfg = {}
        self.file = path
        if interpolation:
            # ExtendedInterpolation is needed to use var into the config.ini file
            parser = ConfigParser(interpolation=ExtendedInterpolation())
        else:
            parser = ConfigParser()
        parser.read(path)
        for section in parser.sections():
            self.cfg[section] = {}
            for info in parser[section]:
                config_data = parser[section][info]
                if any(map(info.__contains__, ['path', 'url', 'config', 'file'])):
                    config_data = re.sub('/{2,}', '/', config_data)
                self.cfg[section][info] = config_data

    @staticmethod
    def fswatcher_update_watch(file, job, data, input_label):
        config = ConfigParser(allow_no_value=True)
        config.read(file)
        config.set(job, '; ' + unidecode.unidecode(input_label))
        config[job]['watch'] = data
        with open(file, 'w', encoding='utf-8') as configfile:
            config.write(configfile)

    @staticmethod
    def fswatcher_update_command(file, job, data, input_label):
        config = ConfigParser(allow_no_value=True)
        config.read(file)
        config.set(job, '; ' + unidecode.unidecode(input_label))
        config[job]['command'] = data
        with open(file, 'w', encoding='utf-8') as configfile:
            config.write(configfile)

    @staticmethod
    def fswatcher_add_section(file, job, command, watch, input_label):
        config = ConfigParser(allow_no_value=True)
        config.read(file)
        config.add_section(job)
        config.set(job, '; ' + unidecode.unidecode(input_label))
        config[job]['watch'] = watch
        config[job]['events'] = 'close,move'
        config[job]['include_extensions'] = 'pdf,PDF'
        config[job]['command'] = command
        with open(file, 'w', encoding='utf-8') as configfile:
            config.write(configfile)

    @staticmethod
    def fswatcher_remove_section(file, job):
        config = ConfigParser()
        config.read(file)
        config.remove_section(job)
        with open(file, 'w', encoding='utf-8') as configfile:
            config.write(configfile)
