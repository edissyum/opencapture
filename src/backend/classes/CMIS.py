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

# @dev : Oussama Brich <oussama.brich@edissyum.com>

from cmislib.model import CmisClient
from cmislib.browser.binding import BrowserBinding


class CMIS:
    def __init__(self, repository_url, cmis_username, cmis_password, base_dir):
        self.cmis_username = cmis_username
        self.cmis_password = cmis_password
        self.repository_url = repository_url
        self.base_dir = base_dir
        self._cmis_client = CmisClient(self.repository_url, self.cmis_username, self.cmis_password, binding=BrowserBinding())
        self._repo = self._cmis_client.getDefaultRepository()
        self._root_folder = self._repo.getObjectByPath(self.base_dir)

    def create_document(self, path, content_type):
        try:
            print(path)
            with open(path, 'rb') as file:
                file_name = path.split('/')[-1]
                file_content = file.read().decode('ISO-8859-1')
                self._root_folder.createDocumentFromString(file_name, contentString=file_content, contentType=content_type)
                return True, ''
        except Exception as e:
            return False, str(e)
