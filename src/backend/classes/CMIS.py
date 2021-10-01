from cmislib.model import CmisClient
from cmislib.browser.binding import BrowserBinding


class CMIS:
    def __init__(self, repository_url, cmisUsername, cmisPassword, base_dir):
        self.cmis_username = cmisUsername
        self.cmis_password = cmisPassword
        self.repository_url = repository_url
        self.base_dir = base_dir
        self._cmis_client = CmisClient(self.repository_url, self.cmis_username, self.cmis_password, binding=BrowserBinding())
        self._repo = self._cmis_client.getDefaultRepository()
        self._root_folder = self._repo.getObjectByPath(self.base_dir)

    def create_document(self, path, content_type):
        try:
            with open(path, "rb") as f:
                file_name = path.split('/')[-1]
                file_content = f.read().decode('ISO-8859-1')
                self._root_folder.createDocumentFromString(file_name, contentString=file_content, contentType=content_type)
        except IOError:
            print("Error : Unable to create CMIS file")
