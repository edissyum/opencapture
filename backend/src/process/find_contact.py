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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>
# @dev: Serena tetart <serena.tetart@edissyum.com>

import os
import re
import json
import subprocess
from flask import current_app

from ..controllers import accounts
from ..helpers import get_context_var


MAPPING = {
    'POSTAL_CODE': 'postal_code',
    'CITY': 'city',
    'NUM_STREET': 'num_address',
    'STREET': 'address',
    'ADD_ADDRESS': 'additional_address',
    'PHONE': 'phone',
    'EMAIL': 'email',
    'LASTNAME': 'lastname',
    'COMPANY': 'company',
    'FIRSTNAME': 'firstname'
}

def parse_output(output: str):
    final_dict = {}
    key_dict = ""
    sep_bool = True
    i = 0
    length = len(output)
    while i < length:
        if output[i] == "<":
            if output.startswith("<SEP>", i):
                i += 5
                sep_bool = True
                continue
            else:
                sep_bool = False
                i += 1
                key_dict = ""
                while i < length and output[i] != ">":
                    key_dict += output[i]
                    i += 1
        elif output[i] == ">":
            i += 1
            value_dict = ""
            while i < length and output[i] != "<":
                c = output[i]
                if c not in "\n[]":
                    value_dict += c
                i += 1
            key_name = key_dict[2:].upper()
            if not sep_bool:
                final_dict[key_name] = value_dict
            elif key_dict == "K_PHONE":
                cur = final_dict.get(key_name, [])
                if not isinstance(cur, list):
                    cur = [cur]
                cur.append(value_dict)
                final_dict[key_name] = cur
        else:
            i += 1
    return final_dict


def get_glibc_version():
    result = subprocess.run(
        ["ldd", "--version"],
        capture_output=True,
        text=True,
        check=False,
    )
    out = (result.stdout + result.stderr).lower()
    m = re.search(r"glibc\s+(\d+)\.(\d+)", out) or re.search(r"(\d+)\.(\d+)", out)
    if m:
        return int(m.group(1)), int(m.group(2))
    return 0, 0


def has_cpu_flags():
    """
    Return True if the CPU has the flag AVX2 and FMA.
    """
    try:
        with open("/proc/cpuinfo", "r") as f:
            data = f.read().lower()
    except FileNotFoundError:
        return False

    if "avx2" in data and "fma" in data:
        return True
    return False


def run_inference(img_path, log):
    # Check all sub-folders for .gguf files
    out = ""
    workdir = None
    for root, dirs, files in os.walk(current_app.config['CONTACT_MODEL']):
        for filename in files:
            if filename.lower().endswith(".gguf"):
                workdir = root
                break
        if workdir is not None:
            break

    # Select the binary based on the glibc version and CPU flags
    if workdir is not None and has_cpu_flags() and get_glibc_version() >= (2, 39):
        num_threads = os.cpu_count() - 1
        if num_threads <= 0:
            num_threads = 1

        cmd = [
            f"{workdir}/llama-mtmd-cli",
            "-m", f"{workdir}/Qwen3-VL-2B-Instruct-FT-Q4_K_M.gguf",
            "--mmproj", f"{workdir}/mmproj-Qwen3-VL-2B-Instruct-FT-f16.gguf",
            "--image", img_path,
            "--image-min-tokens", "256",
            "--image-max-tokens", "1024",
            "--threads", str(num_threads),
            "--temp", "0.0",
            "-p", "Extract sender's data in a python dictionary"
        ]

        result = subprocess.run(
            cmd,
            text=True,
            cwd=workdir,
            capture_output=True
        )

        out = result.stdout.replace("\n", "").replace("\"", "")
    else:  # Qwen3
        import torch
        from transformers import Qwen3VLForConditionalGeneration, AutoProcessor

        configurations = get_context_var('configurations', 10)
        dtype_str = configurations.get('informalContactDtype', 'bfloat16')

        dtype_map = {
            "float32": torch.float32,
            "bfloat16": torch.bfloat16,
        }
        try:
            dtype = dtype_map[dtype_str]
        except KeyError:
            log.error(f"Unsupported dtype: {dtype_str}")
            return None

        model = Qwen3VLForConditionalGeneration.from_pretrained(
            current_app.config['CONTACT_MODEL'],
            device_map="auto",
            dtype=dtype
        )
        model.eval()

        processor = AutoProcessor.from_pretrained(
            current_app.config['CONTACT_MODEL'],
            min_pixels=256 * 32 * 32,
            max_pixels=1024 * 32 * 32,
            use_fast=True
        )
        messages = [{
            "role": "user",
            "content": [
                {"type": "image", "url": img_path},
                {"type": "text", "text": "Extract sender's data in a python dictionary"}
            ]
        }]
        inputs = processor.apply_chat_template(
            messages,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
            add_generation_prompt=True
        )
        inputs.pop("token_type_ids", None)
        inputs = {k: v.to(model.device) for k, v in inputs.items()}

        with torch.inference_mode():
            generated_ids = model.generate(
                **inputs,
                do_sample=False,
                max_new_tokens=256,
            )

            generated_ids_trimmed = [
                out_ids[len(in_ids):]
                for in_ids, out_ids in zip(inputs["input_ids"], generated_ids)
            ]
            generated_texts = processor.batch_decode(
                generated_ids_trimmed,
                skip_special_tokens=False,
                clean_up_tokenization_spaces=False
            )
            out = generated_texts[0]

    data = parse_output(out)
    if data and isinstance(data, str):
        data = json.loads(data)
    return data


class FindContact:
    def __init__(self, log, image, database, customer_id):
        self.log = log
        self.nb_page = 1
        self.image = image
        self.database = database
        self.customer_id = customer_id

    def search_contact(self, data_name, data_value):
        where = f"LOWER({data_name}) LIKE LOWER(%s)"
        args = {
            'select': ['accounts_supplier.id as supplier_id', '*'],
            'table': ['accounts_supplier', 'addresses'],
            'left_join': ['accounts_supplier.address_id = addresses.id'],
            'where': [where],
            'data': [data_value]
        }
        existing_supplier = self.database.select(args)
        if existing_supplier:
            if self.customer_id:
                customer = self.database.select({
                    'select': ['siret', 'siren', 'vat_number'],
                    'table': ['accounts_customer'],
                    'where': ['id = %s'],
                    'data': [self.customer_id]
                })

                if customer:
                    if (existing_supplier[0]['siret'] == customer[0]['siret']
                            or existing_supplier[0]['siren'] == customer[0]['siren']
                            or existing_supplier[0]['vat_number'] == customer[0]['vat_number']):
                        return {}
            return existing_supplier[0]
        return {}

    def run(self):
        if not current_app.config['CONTACT_MODEL']:
            self.log.info('No contact model configured, skipping contact search/creation')
            return None

        found_contact = {}
        ai_contact = run_inference(self.image, self.log)
        for key in ai_contact:
            if ai_contact[key] and key in MAPPING.keys():
                found_contact[MAPPING[key]] = ai_contact[key][:254]
                if key in ('LASTNAME', 'COMPANY', 'CITY'):
                    found_contact[MAPPING[key]] = found_contact[MAPPING[key]].upper()
                elif key == 'FIRSTNAME':
                    found_contact[MAPPING[key]] = found_contact[MAPPING[key]].capitalize()
                elif key == 'EMAIL':
                    found_contact[MAPPING[key]] = found_contact[MAPPING[key]].lower()
                elif key == 'POSTAL_CODE' and len(found_contact[MAPPING[key]]) != 5:
                    found_contact[MAPPING[key]] = ''
                elif key == 'STREET':
                    found_contact[MAPPING[key]] = found_contact[MAPPING[key]].upper()

        if 'email' in found_contact:
            contact = self.search_contact('email', found_contact['email'])
            if contact:
                name = contact['name'] if contact['name'] else contact['lastname']
                self.log.info('Third-party account found with AI : ' + name + ' using email : ' + contact['email'])
                return [contact['vat_number'], {}, contact, '']

        if 'phone' in found_contact:
            contact = self.search_contact('phone', found_contact['phone'])
            if contact:
                name = contact['name'] if contact['name'] else contact['lastname']
                self.log.info('Third-party account found with AI : ' + name + ' using phone : ' + contact['phone'])
                return [contact['vat_number'], {}, contact, '']

        # Create contact if not exists
        if ('company' in found_contact and found_contact['company']) or ('lastname' in found_contact and found_contact['lastname']):
            address = ''
            if 'address' in found_contact and found_contact['address'] and 'num_address' in found_contact and found_contact[
                'num_address']:
                address = found_contact['num_address'] + ' ' + found_contact['address']
            elif 'address' in found_contact and found_contact['address']:
                address = found_contact['address']

            address_data = {
                'address1': address,
                'address2': found_contact['additional_address'].title() if 'additional_address' in found_contact else '',
                'city': found_contact['city'] if 'city' in found_contact else '',
                'postal_code': found_contact['postal_code'] if 'postal_code' in found_contact else ''
            }
            address = accounts.create_address(address_data)

            address_id = None
            if address:
                address_id = address[0]['id']

            found_contact = {
                'bic': None,
                'duns': None,
                'siret': None,
                'siren': None,
                'country': None,
                'vat_number': None,
                'address_id': address_id,
                'informal_contact': True,
                'skip_auto_validate': False,
                'email': found_contact['email'] if 'email' in found_contact else '',
                'phone': found_contact['phone'] if 'phone' in found_contact else '',
                'name': found_contact['company'] if 'company' in found_contact else '',
                'lastname': found_contact['lastname'].upper() if 'lastname' in found_contact else '',
                'firstname': found_contact['firstname'].capitalize() if 'firstname' in found_contact else '',
            }
            found_contact = dict(list(found_contact.items()) + list(address_data.items()))
            contact = accounts.create_supplier(found_contact, True)
            if contact:
                contact_name = found_contact['name'] if found_contact['name'] else found_contact['lastname']
                self.log.info(f'Third-party account created with AI : {contact_name}')
                contact = contact[0]
                found_contact['supplier_id'] = contact['id']
                return ['', {}, found_contact, '']
        return None
