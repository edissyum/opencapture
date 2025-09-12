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

import torch
import warnings
import transformers
from flask import current_app
from src.backend.controllers import accounts

class FindContact:
    def __init__(self, ocr, log, regex, files, database, file, image, customer_id):
        self.ocr = ocr
        self.log = log
        self.file = file
        self.nb_page = 1
        self.files = files
        self.regex = regex
        self.image = image
        self.database = database
        self.customer_id = customer_id

    def run_inference(self):
        warnings.filterwarnings('ignore')
        transformers.logging.set_verbosity_error()

        processor = transformers.DonutProcessor.from_pretrained(current_app.config['CONTACT_MODEL'], local_files_only=True)
        model = transformers.VisionEncoderDecoderModel.from_pretrained(current_app.config['CONTACT_MODEL'], local_files_only=True)

        pixel_values = processor(self.image.convert('RGB'), random_padding="test", return_tensors="pt").pixel_values.squeeze()
        pixel_values = torch.tensor(pixel_values).unsqueeze(0)
        task_prompt = "<s>"
        decoder_input_ids = processor.tokenizer(task_prompt, add_special_tokens=False, return_tensors="pt").input_ids

        device = "cuda" if torch.cuda.is_available() else "cpu"

        try:
            outputs = model.generate(
                pixel_values.to(device),
                decoder_input_ids=decoder_input_ids.to(device),
                max_length=model.decoder.config.max_position_embeddings,
                early_stopping=True,
                pad_token_id=processor.tokenizer.pad_token_id,
                eos_token_id=processor.tokenizer.eos_token_id,
                use_cache=True,
                num_beams=1,
                bad_words_ids=[[processor.tokenizer.unk_token_id]],
                return_dict_in_generate=True
            )
            prediction = processor.batch_decode(outputs.sequences)[0]
            prediction = processor.token2json(prediction)
        except RuntimeError:
            self.log.info('Error during contact model inference, please check the model or the machine')
            prediction = {}
        return prediction

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
                        return False
            return existing_supplier[0]
        return {}


    def run(self):
        if not current_app.config['CONTACT_MODEL']:
            self.log.info('No contact model configured, skipping contact search/creation')
            return None

        contact_data = self.run_inference()
        if 'email' in contact_data:
            contact = self.search_contact('email', contact_data['email'])
            if contact:
                name = contact['name'] if contact['name'] else contact['lastname']
                self.log.info('Third-party account found with AI : ' + name + ' using email : ' + contact['email'])
                return [contact['vat_number'], {}, contact, '']

        if 'phone' in contact_data:
            contact = self.search_contact('phone', contact_data['phone'])
            if contact:
                name = contact['name'] if contact['name'] else contact['lastname']
                self.log.info('Third-party account found with AI : ' + name + ' using phone : ' + contact['phone'])
                return [contact['vat_number'], {}, contact, '']

        # Create contact if not exists
        if ('company' in contact_data and contact_data['company']) or ('lastname' in contact_data and contact_data['lastname']):
            address = ''
            if 'address' in contact_data and contact_data['address'] and 'num_address' in contact_data and contact_data['num_address']:
                address = contact_data['num_address'] + ' ' + contact_data['address']
            elif 'address' in contact_data and contact_data['address']:
                address = contact_data['address']

            address_data = {
                'address1': address.title(),
                'address2': contact_data['additional_address'].title() if 'additional_address' in contact_data else '',
                'city': contact_data['city'].title() if 'city' in contact_data else '',
                'postal_code': contact_data['postal_code'] if 'postal_code' in contact_data else ''
            }
            address = accounts.create_address(address_data)

            address_id = None
            if address:
                address_id = address[0]['id']

            contact_data = {
                'bic': None,
                'duns': None,
                'siret': None,
                'siren': None,
                'country': None,
                'vat_number': None,
                'address_id': address_id,
                'informal_contact': True,
                'skip_auto_validate': False,
                'email': contact_data['email'] if 'email' in contact_data else '',
                'phone': contact_data['phone'] if 'phone' in contact_data else '',
                'name': contact_data['company'] if 'company' in contact_data else '',
                'lastname': contact_data['lastname'].upper() if 'lastname' in contact_data else '',
                'firstname': contact_data['firstname'].capitalize() if 'firstname' in contact_data else '',
            }
            contact_data = dict(list(contact_data.items()) + list(address_data.items()))
            contact = accounts.create_supplier(contact_data)
            if contact:
                contact_name = contact_data['name'] if contact_data['name'] else contact_data['lastname']
                self.log.info('Third-party account created with AI : ' + contact_name)
                contact = contact[0]
                contact_data['supplier_id'] = contact['id']
                return ['', {}, contact_data, '']
        return None
