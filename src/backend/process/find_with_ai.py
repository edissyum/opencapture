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
import requests
import pdftotext

class FindWithAI:
    def __init__(self, log, llm_model):
        self.log = log
        self.llm_model = llm_model


    def calculate_cost(self, prompt_tokens, completion_tokens):
        if self.llm_model['settings']:
            if 'input_price' in self.llm_model['settings'] and 'output_price' in self.llm_model['settings']:
                cost_input = (prompt_tokens / 1000) * self.llm_model['settings']['input_price']
                cost_output = (completion_tokens / 1000) * self.llm_model['settings']['output_price']
                total_cost = cost_input + cost_output
                return cost_input, cost_output, total_cost
        return None, None, None


    def find_invoice_info(self, file_path):
        if '##OCR_CONTENT##' in str(self.llm_model['json_content']):
            with open(file_path, 'rb') as file:
                ocr_content = pdftotext.PDF(file)
                ocr_content = "\n".join(ocr_content)
                if not ocr_content:
                    self.log.error("OCR content is empty. Please check the PDF file.")
                    return None

                json_content_str = json.dumps(self.llm_model['json_content'])
                json_content_str = json_content_str.replace('"##OCR_CONTENT##"', json.dumps(ocr_content))
                self.llm_model['json_content'] = json.loads(json_content_str)

        res = requests.post(self.llm_model['url'],
            headers={"Authorization": f"Bearer {self.llm_model['api_key']}"},
            json=self.llm_model['json_content']
        )

        if res.status_code != 200:
            self.log.error(f"Error calling AI model: {res.status_code} - {res.text}")
            return None

        response = res.json()
        if 'choices' in response and len(response['choices']) > 0:
            content = response['choices'][0]['message']['content']
            try:
                content = json.loads(content)
            except json.JSONDecodeError as e:
                self.log.error(f"Error decoding JSON response: {e}")
                return None


            token_usage = response.get('usage', {})
            if token_usage:
                ci, co, total = self.calculate_cost(token_usage.get('prompt_tokens', 0), token_usage.get('completion_tokens', 0))
                if ci is not None and co is not None and total is not None:
                    self.log.info(f"Approximate costs - Input: ${ci:.6f}, Output: ${co:.6f}, Total: ${total:.6f}")
            return content
        else:
            self.log.error("AI model did not return any choices.")
            return None
