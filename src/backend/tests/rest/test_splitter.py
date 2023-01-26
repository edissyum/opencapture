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

# @dev : Brich Oussama <oussama.brich@edissyum.com>

import shutil
import urllib3
import unittest
import warnings
from werkzeug.datastructures import FileStorage

from src.backend import app
from src.backend.tests import CUSTOM_ID, get_db, get_token


class SplitterTest(unittest.TestCase):
    def setUp(self):
        self.db = get_db()
        self.app = app.test_client()
        self.token = get_token('admin')
        warnings.filterwarnings('ignore', message="unclosed", category=ResourceWarning)

    def test_upload_batch(self):
        file = './custom/test/src/backend/process_queue_splitter.py'
        text_to_search = rf"@kuyruk.task(queue='splitter_{CUSTOM_ID}')"
        text_to_replace = f"# @kuyruk.task(queue='splitter_{CUSTOM_ID}')"

        with open(file, "r+") as text_file:
            texts = text_file.read()
            texts = texts.replace(text_to_search, text_to_replace)

        with open(file, "w") as text_file:
            text_file.write(texts)

        pdf_url = 'https://open-capture.com/wp-content/uploads/2022/11/splitter_test.pdf'
        pdf_path = './instance/upload/splitter/splitter_test.pdf'

        http = urllib3.PoolManager()
        with http.request('GET', pdf_url, preload_content=False) as r, open(pdf_path, 'wb') as out_file:
            shutil.copyfileobj(r, out_file)

        my_file = FileStorage(
            stream=open(pdf_path, "rb"),
            filename="splitter_test.pdf",
            content_type="application/pdf",
        )

        return self.app.post(f'/{CUSTOM_ID}/ws/splitter/upload?input_id=default_input', data={"file": my_file},
                             content_type='multipart/form-data',
                             headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

    def test_successful_get_batches(self):
        response = self.app.get(f'/{CUSTOM_ID}/ws/splitter/batches/user/1/paging/0/16/today/NEW',
                                headers={"Content-Type": "application/json", 'Authorization': 'Bearer ' + self.token})
        self.assertEqual(200, response.status_code)

    def tearDown(self) -> None:
        self.db.execute("UPDATE splitter_batches SET status = 'DEL'")
