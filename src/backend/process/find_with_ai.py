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

import os
import re
import json
import pypdf
import requests
import tempfile
import pdftotext
from pdf2image import convert_from_path
from src.backend.classes.Files import convert_heif_to_jpg, rotate_img


class FindWithAI:
    def __init__(self, log, ocr, llm_model):
        self.log = log
        self.ocr = ocr
        self.llm_model = llm_model


    def calculate_cost(self, prompt_tokens, completion_tokens):
        if self.llm_model['settings']:
            if 'input_price' in self.llm_model['settings'] and 'output_price' in self.llm_model['settings']:
                cost_input = (prompt_tokens / 1000) * self.llm_model['settings']['input_price']
                cost_output = (completion_tokens / 1000) * self.llm_model['settings']['output_price']
                total_cost = cost_input + cost_output
                return cost_input, cost_output, total_cost
        return None, None, None


    def extract_text_from_pdf(self, file_path):
        with open(file_path, 'rb') as pdf:
            cpt = 1
            text = ''
            pdf_reader = pypdf.PdfReader(pdf)
            page_count = len(pdf_reader.pages)
            with tempfile.NamedTemporaryFile() as tmp_file:
                for chunk_idx in range(0, page_count, 10):
                    start_page = 0 if chunk_idx == 0 else chunk_idx + 1
                end_page = min(chunk_idx + 10, page_count)
                chunk_images = convert_from_path(file_path, first_page=start_page, last_page=end_page, dpi=400)

                for image in chunk_images:
                    output_path = tmp_file.name + '-' + str(cpt).zfill(3) + '.jpg'
                    image.save(output_path, 'JPEG')
                    rotate_img(output_path)
                    cpt = cpt + 1
                    text += self.ocr.text_builder(output_path)
                    if os.path.exists(output_path):
                        os.remove(output_path)
            return text

    def find_invoice_info(self, file_path):
        if '##OCR_CONTENT##' in str(self.llm_model['json_content']):
            if file_path.lower().endswith(('.heif', '.heic', '.jpg', '.jpeg', '.png')):
                if file_path.lower().endswith(('.heic', '.heif')):
                    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                        final_directory = tmp_file.name
                        heif_image = convert_heif_to_jpg(file_path)
                        heif_image.save(final_directory, 'JPEG')
                        file_path = final_directory
                    rotate_img(file_path + '.jpg')
                ocr_content = self.ocr.text_builder(file_path)
            else:
                with open(file_path, 'rb') as file:
                    ocr_content = pdftotext.PDF(file)
                    ocr_content = "\n".join(ocr_content)
                    ocr_content = ocr_content.strip()
                    if not ocr_content:
                        self.log.info("PDF seems to be image-based, proceeding with OCR using pytesseract.")
                        ocr_content = self.extract_text_from_pdf(file_path)

            ocr_content = re.sub(r'\s+', ' ', ocr_content)
            if not ocr_content:
                self.log.error("OCR content is empty. Please check the PDF file.")
                return None

            json_content_str = json.dumps(self.llm_model['json_content'])
            json_content_str = json_content_str.replace('"##OCR_CONTENT##"', json.dumps(ocr_content))
            self.llm_model['json_content'] = json.loads(json_content_str)

        headers = {
            "Authorization": f"Bearer {self.llm_model['api_key']}",
            "Content-Type": "application/json"
        }
        if self.llm_model['provider'] == 'gemini':
            headers = {
                "X-goog-api-key": f"{self.llm_model['api_key']}",
                "Content-Type": "application/json"
            }

        ai_llm_res = requests.post(
            self.llm_model['url'],
            headers=headers,
            json=self.llm_model['json_content']
        )

        if ai_llm_res.status_code != 200:
            self.log.error(f"Error calling AI model: {ai_llm_res.status_code} - {ai_llm_res.text}")
            return None

        response = ai_llm_res.json()
        content = None
        if self.llm_model['provider'] == 'gemini':
            if 'candidates' in response and len(response['candidates']) > 0:
                content = response['candidates'][0]['content']['parts'][0]['text']
        else:
            if 'choices' in response and len(response['choices']) > 0:
                content = response['choices'][0]['message']['content']

        if content:
            try:
                content = json.loads(content)
            except json.JSONDecodeError as e:
                self.log.error(str(content))
                self.log.error(f"Error decoding JSON response: {e}")
                return None

            if self.llm_model['provider'] == 'gemini':
                token_usage = response.get('usageMetadata', {})
                prompt_tokens = token_usage.get('promptTokenCount', 0)
                completion_tokens = token_usage.get('candidatesTokenCount', 0)
            else:
                token_usage = response.get('usage', {})
                prompt_tokens = token_usage.get('prompt_tokens', 0)
                completion_tokens = token_usage.get('completion_tokens', 0)

            if token_usage:
                ci, co, total = self.calculate_cost(prompt_tokens, completion_tokens)
                if ci is not None and co is not None and total is not None:
                    self.log.info(f"Tokens used - Prompt (input): {prompt_tokens}, "
                                  f"Completion (output): {completion_tokens}, ")
                    self.log.info(f"Approximate costs - Input: ${ci:.6f}, Output: ${co:.6f}, Total: ${total:.6f}")
            return content
        else:
            self.log.error("AI model did not return any content.")
            return None
