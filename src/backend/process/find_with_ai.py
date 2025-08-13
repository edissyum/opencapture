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

import json
import base64
import requests
import mimetypes

class FindWithAI:
    def __init__(self, log, llm_model):
        self.log = log
        self.llm_model = llm_model
        self.price_input = 0.00010  # $ per 1000 tokens
        self.price_output = 0.00030  # $ per 1000 tokens


    def calculate_cost(self, prompt_tokens, completion_tokens):
        cost_input = (prompt_tokens / 1000) * self.price_input
        cost_output = (completion_tokens / 1000) * self.price_output
        total_cost = cost_input + cost_output
        return cost_input, cost_output, total_cost

    def find_invoice_info(self, file_path):
        if 'b64_file_content' in str(self.llm_model['json_content']):
            with open(file_path, 'rb') as file:
                file_data = file.read()
                mimetype = mimetypes.guess_type(file_path)[0]
                fileb64 = base64.b64encode(file_data).decode('utf-8')
                file_content = 'data:' + mimetype + ';base64,' + fileb64

                json_content_str = json.dumps(self.llm_model['json_content'])
                json_content_str = json_content_str.replace('b64_file_content', file_content)
                self.llm_model['json_content'] = json.loads(json_content_str)

        res = requests.post(self.llm_model['url'],
            headers={"Authorization": f"Bearer {self.llm_model['api_key']}"},
            json=self.llm_model['json_content']
        )
        if res.status_code != 200:
            self.log.error(f"Error calling AI model: {res.status_code} - {res.text}")
            return None

        response = res.json()
        if self.llm_model['provider'] == 'mistral':
            token_usage = response.get('usage', {})
            if token_usage:
                ci, co, total = self.calculate_cost(token_usage.get('prompt_tokens', 0), token_usage.get('completion_tokens', 0))
                self.log.info(f"Cost Input: ${ci:.6f}, Cost Output: ${co:.6f}, Total Cost: ${total:.6f}")

            if 'choices' in response and len(response['choices']) > 0:
                content = response['choices'][0]['message']['content']
                try:
                    content = json.loads(content)
                except json.JSONDecodeError as e:
                    self.log.error(f"Error decoding JSON response: {e}")
                    return None
                return content
            else:
                self.log.error("AI model did not return any choices.")
                return None
        return None