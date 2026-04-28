/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan CHEVAL <nathan.cheval@edissyum.com> */

export const defaultPromptText: string = "Extract the following from the provided invoice text:\n" +
    "Supplier: name, address, postal code, city, country, VAT number, email, iban\n" +
    "Invoice: invoice number, order_number, quotation_number, document date, due date, currency, total excl. tax, total tax, total incl. tax, vat rate.\n" +
    "Line Items: description, quantity, unit price, tax rate, line total excl. tax, line total incl. tax.\n" +
    "If a field is missing or not applicable, set empty.\n" +
    "Date format: ISO 8601 (YYYY-MM-DD).\n" +
    "If value is iban, rib or number, remove spaces.\n" +
    "Currency format: 3-letter ISO currency code (e.g., EUR, USD).\n" +
    "VAT rate format: percentage (e.g., 20.00).\n" +
    "If the invoice has no VAT, set vat_amount and vat_rate to 0.\n" +
    "If the invoice has no line items, set line_items to an empty array.\n" +
    "Do not add commentary.\n" +
    "If it's not an invoice, respond with an empty JSON object."

export const defaultPrompts: any = [
    {
        "role": "user",
        "content": defaultPromptText
    },
    {
        "role": "user",
        "content": "##OCR_CONTENT##",
    }
];

export const defaultResponseFormat   : any           = {
    "type": "json_schema",
    "json_schema": {
        "name": "invoice_info",
        "schema": {
            "type": "object",
            "properties": {
                "supplier": {
                    "type": "object",
                    "properties": {
                        "name": { "type": "string" },
                        "address": { "type": "string" },
                        "postal_code": { "type": "string" },
                        "city": { "type": "string" },
                        "country": { "type": "string" },
                        "vat_number": { "type": "string" },
                        "email": { "type": "string" },
                        "iban": { "type": "string" }
                    },
                    "required": ["name", "address", "postal_code", "city", "country", "VAT_number", "email"]
                },
                "order_number": { "type": "string" },
                "invoice_number": { "type": "string" },
                "delivery_number": { "type": "string" },
                "quotation_number": { "type": "string" },
                "document_date": { "type": "string", "format": "date" },
                "document_due_date": { "type": "string", "format": "date" },
                "line_items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "description": { "type": "string" },
                            "quantity": { "type": ["integer", "number"] },
                            "unit_price": { "type": "number" },
                            "total_price": { "type": "number" }
                        },
                        "required": ["description", "quantity", "unit_price", "total_price"]
                    }
                },
                "currency": { "type": "string" },
                "vat_rate": { "type": "number" },
                "total_ht": { "type": "number" },
                "total_ttc": { "type": "number" },
                "total_vat": { "type": "number" }
            }
        }
    }
};

export const defaultJsonContent: any = {
    "mistral": {
        "temperature": 0.2,
        "max_tokens": 1000,
        "model": "mistral-small-latest",
        "messages": defaultPrompts,
        "response_format": defaultResponseFormat
    },
    "mistral_ocr": {
        "document": {
            "document_url": "##FILE_NAME##",
            "type": "document_url"
        },
        "document_annotation_format": {
            "json_schema": {
                "name": "invoice_info",
                "schema": {
                    "properties": {
                        "currency": {
                            "type": "string"
                        },
                        "delivery_number": {
                            "type": "string"
                        },
                        "document_date": {
                            "format": "date",
                            "type": "string"
                        },
                        "document_due_date": {
                            "format": "date",
                            "type": "string"
                        },
                        "invoice_number": {
                            "type": "string"
                        },
                        "line_items": {
                            "items": {
                                "properties": {
                                    "description": {
                                        "type": "string"
                                    },
                                    "quantity": {
                                        "type": [
                                            "integer",
                                            "number"
                                        ]
                                    },
                                    "reference": {
                                        "type": "string"
                                    },
                                    "total_price": {
                                        "type": "number"
                                    },
                                    "unit_price": {
                                        "type": "number"
                                    }
                                },
                                "required": [
                                    "description",
                                    "quantity",
                                    "unit_price",
                                    "total_price"
                                ],
                                "type": "object"
                            },
                            "type": "array"
                        },
                        "order_number": {
                            "type": "string"
                        },
                        "quotation_number": {
                            "type": "string"
                        },
                        "supplier": {
                            "properties": {
                                "address_1": {
                                    "type": "string"
                                },
                                "city": {
                                    "type": "string"
                                },
                                "country": {
                                    "type": "string"
                                },
                                "email": {
                                    "type": "string"
                                },
                                "iban": {
                                    "type": "string"
                                },
                                "name": {
                                    "type": "string"
                                },
                                "postal_code": {
                                    "type": "string"
                                },
                                "vat_number": {
                                    "type": "string"
                                }
                            },
                            "required": [
                                "name",
                                "address",
                                "postal_code",
                                "city",
                                "country",
                                "vat_number",
                                "email"
                            ],
                            "type": "object"
                        },
                        "total_ht": {
                            "type": "number"
                        },
                        "total_ttc": {
                            "type": "number"
                        },
                        "total_vat": {
                            "type": "number"
                        },
                        "vat_rate": {
                            "type": "number"
                        }
                    },
                    "type": "object"
                }
            },
            "type": "json_schema"
        },
        "model": "mistral-ocr-2512"
    },
    "copilot": {
        "temperature": 1,
        "max_tokens": 1000,
        "model": "gpt-5-mini",
        "messages": defaultPrompts,
        "response_format": defaultResponseFormat
    },
    "gemini": {
        "contents": [
            {
                "parts": [
                    {
                        "text": defaultPromptText
                    },
                    {
                        "text": "##OCR_CONTENT##"
                    }
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "response_schema": {
                "type": "object",
                "properties": {
                    "order_number": { "type": "string" },
                    "invoice_number": { "type": "string" },
                    "delivery_number": { "type": "string" },
                    "quotation_number": { "type": "string" },
                    "document_date": { "type": "string", "format": "date" },
                    "document_due_date": { "type": "string", "format": "date" },
                    "line_items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "description": { "type": "string" },
                                "quantity": { "type": "number" },
                                "unit_price": { "type": "number" },
                                "total_price": { "type": "number" }
                            },
                            "required": ["description", "quantity", "unit_price", "total_price"],
                        }
                    },
                    "vat_rate": { "type": "number" },
                    "total_ht": { "type": "number" },
                    "total_ttc": { "type": "number" },
                    "total_vat": { "type": "number" },
                    "currency": { "type": "string" },
                    "supplier": {
                        "type": "object",
                        "properties": {
                            "name": { "type": "string" },
                            "address": { "type": "string" },
                            "postal_code": { "type": "string" },
                            "city": { "type": "string" },
                            "country": { "type": "string" },
                            "vat_number": { "type": "string" },
                            "email": { "type": "string" },
                            "iban": { "type": "string" }
                        },
                        "required": ["name", "address", "postal_code", "city", "country", "vat_number", "email"],
                    }
                },
            }
        }
    }
}