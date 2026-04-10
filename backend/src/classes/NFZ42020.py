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

import base64
import hashlib
import json
import os
from datetime import datetime, UTC

import requests
from asn1crypto import tsp, algos
from rfc3161ng import RemoteTimestamper


class NFZ42020:
    def __init__(self, log, path, enabled):
        self.log = log
        self.url = None
        self.path = path
        self.module = None
        self.provider = None
        self.enabled = enabled
        self.journal_init = False
        self.provider_config = None
        self.original_filename = None
        self.sanitized_filename = None
        self.journal_filename = self.path + "/sealed_journal.json"
        self.journal_tsa_filename = self.path + "/sealed_journal_tsa.json"

    def init(self, provider, url, config):
        self.url = url
        self.provider = provider
        self.provider_config = config

        if not self.journal_init and self.enabled:
            try:
                os.makedirs(self.path, exist_ok=True)
            except (Exception,) as e:
                self.log.error(f"Error creating NF Z42-020 directory {self.path}: {e}")

            self.initialize_journal()

            try:
                os.chmod(self.journal_filename, 0o640)
                os.chmod(self.journal_tsa_filename, 0o640)
            except (Exception,) as e:
                self.enabled = False
                self.log.error(f"Error setting permissions on NF Z42-020 journal files: {e}")

    def initialize_journal(self):
        if os.path.exists(self.journal_filename):
            self.journal_init = True
            return

        with open(self.journal_filename, "w", encoding="utf-8") as f:
            f.write("[]")

        with open(self.journal_tsa_filename, "w", encoding="utf-8") as f:
            f.write("[]")

        entry = {
            "index": 0,
            "module": self.module,
            "timestamp": datetime.now(UTC).isoformat(),
            "event_type": "INIT_JOURNAL",
            "document_id": None,
            "previous_hash": "0" * 64
        }
        entry["current_hash"] = calculate_hash(entry)
        append_journal_entry(entry, self.journal_filename)
        self.journal_init = True

    def log_event(self, event, document_id=None, stored_file=None):
        if not self.journal_init:
            return

        journal = load_journal_entries(self.journal_filename)
        if journal is None:
            return

        last_entry = journal[-1]
        if not last_entry:
            return

        entry = self.generate_entry(last_entry, event, document_id, stored_file)
        append_journal_entry(entry, self.journal_filename)

    def generate_entry(self, last_entry, event_type, document_id, stored_file):
        hashed_file = None
        if stored_file:
            hashed_file = hash_file_content(stored_file)

        if not hashed_file:
            hashed_file = hash_file_content(self.sanitized_filename)

        entry = {
            "index": last_entry["index"] + 1,
            "module": self.module,
            "timestamp": datetime.now(UTC).isoformat(),
            "event_type": event_type,
            "document_id": document_id,
            "file": {
                "original_name": self.original_filename,
                "sanitized_name": os.path.basename(self.sanitized_filename),
                "stored_name": os.path.basename(stored_file) if stored_file else None,
                "stored_path": os.path.dirname(stored_file) if stored_file else None
            },
            "document_hash": {
                "algorithm": "SHA-256",
                "value": hashed_file
            },
            "previous_hash": last_entry["current_hash"]
        }
        entry["current_hash"] = calculate_hash(entry)
        return entry

    def seal_journal(self):
        if not self.journal_init:
            return

        journal = load_journal_entries(self.journal_filename)
        if journal is None:
            return

        last_entry = journal[-1]
        if not last_entry:
            return

        res, tsr = self.generate_rfc3161_tsr(last_entry["current_hash"])
        if not res:
            self.log.error("Failed to generate RFC 3161 timestamp token, journal sealing aborted : " + tsr)
            return

        seal_entry = {
            "timestamp": datetime.now(UTC).isoformat(),
            "journal_index": last_entry["index"],
            "hash_sealed": last_entry["current_hash"],
            "algorithm": "SHA-256",
            "tsa_url": self.url,
            "tsr_hash": hashlib.sha256(tsr).hexdigest(),
            "tsr_base64": base64.b64encode(tsr).decode("ascii")
        }
        append_journal_entry(seal_entry, self.journal_tsa_filename)

    def generate_rfc3161_tsr(self, data_hash_hex):
        data_digest = bytes.fromhex(data_hash_hex)

        if self.provider == 'certinomis':
            return self.certinomis_generate_tsr(data_digest)
        else:
            return self.freetsa_generate_tsr(data_digest)

    def freetsa_generate_tsr(self, digest):
        timestamper = RemoteTimestamper(self.url, hashname="sha256")
        try:
            return True, timestamper.timestamp(digest)
        except (Exception,) as e:
            return False, f"NFZ42020 Error : Error generating timestamp token with FreeTSA: {e}"

    def certinomis_generate_tsr(self, digest):
        message_imprint = tsp.MessageImprint({
            'hashed_message': digest,
            'hash_algorithm': algos.DigestAlgorithm({'algorithm': 'sha256'})
        })

        tsq = tsp.TimeStampReq({
            'version': 1,
            'cert_req': True,
            'message_imprint': message_imprint
        })
        tsq_bytes = tsq.dump()

        user_key = self.path + '/config/' + self.provider_config['key']
        user_cert = self.path + '/config/' + self.provider_config['cert']

        response = requests.post(
            self.url,
            data=tsq_bytes,
            cert=(user_cert, user_key),
            headers={
                "Content-Type": "application/timestamp-query",
                "Accept": "application/timestamp-reply"
            }
        )

        if response.status_code == 200:
            try:
                tsr = tsp.TimeStampResp.load(response.content)
                if tsr['status']['status'].native != 'granted':
                    return False, f"NFZ42020 Error : TSA response status is not granted: {tsr['status']['status'].native}"
                return True, tsr.dump()
            except (Exception,) as e:
                return False, f"NFZ42020 Error : Error parsing TSA response: {e}"

        if response.status_code != 200:
            return False, f"NFZ42020 Error : TSA request failed with status code {response.status_code}: {response.text}"

        return True, response.content


def count_journal_entries(journal_path):
    with open(journal_path, "r", encoding="utf-8") as f:
        content = json.load(f)
        return len(content)


def read_last_journal_entry(journal_path):
    journal = load_journal_entries(journal_path)
    if not journal:
        return None
    return journal[-1]


def load_journal_entries(journal_path):
    if not os.path.exists(journal_path):
        return []

    with open(journal_path, "r", encoding="utf-8") as f:
        return json.load(f)


def append_journal_entry(entry, journal_path):
    entry_json = json.dumps(entry, ensure_ascii=False)

    with open(journal_path, "r+b") as f:
        # Go to the end to determine file size
        f.seek(0, os.SEEK_END)
        size = f.tell()

        if size < 2:
            raise ValueError("Invalid journal file")

        # Check for closing ]
        f.seek(-1, os.SEEK_END)
        if f.read(1) != b"]":
            raise ValueError("Invalid journal format (missing closing ])")

        # Check if the journal is empty
        f.seek(0)
        is_empty = f.read().strip() == b"[]"

        if not is_empty:
            # Move back before the closing ]
            f.seek(-2, os.SEEK_END)
            # Add a comma BEFORE the new object
            f.write(b",\n")
        else:
            # Move back before the closing ]
            f.seek(-1, os.SEEK_END)
            # Carrier return after [
            f.write(b"\n")

        # Écrire l'objet
        f.write(entry_json.encode("utf-8"))
        f.write(b"\n]")


def calculate_hash(entry):
    copy = dict(entry)
    copy.pop("current_hash", None)
    payload = json.dumps(copy, sort_keys=True).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def hash_file_content(file_path, chunk_size=8192, hash_algorithm="sha256"):
    h = hashlib.new(hash_algorithm)
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            h.update(chunk)
    return h.hexdigest()
