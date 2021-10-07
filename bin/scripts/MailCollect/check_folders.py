# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import sys
from socket import gaierror
from imaplib import IMAP4_SSL
from imap_tools import MailBox, MailBoxUnencrypted

hostname = ''
port = 143
securedConnection = False
login = ''
password = ''

try:
    if securedConnection:
        conn = MailBox(host=hostname, port=port)
    else:
        conn = MailBoxUnencrypted(host=hostname, port=port)
except (gaierror, IMAP4_SSL.error) as e:
    sys.exit('Error while connecting to ' + hostname + ' on port ' + str(port) + ' : ' + str(e))

try:
    conn.login(login, password)
except (gaierror, IMAP4_SSL.error) as e:
    sys.exit('Error while login to ' + hostname + ' on port ' + str(port) + ' : ' + str(e))


folders = conn.folder.list()
for f in folders:
    print(f.name)
