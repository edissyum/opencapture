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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../../../services/user.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormControl } from "@angular/forms";
import { AuthService } from "../../../../../services/auth.service";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";

@Component({
    selector: 'app-ai-llm-update',
    templateUrl: './update-ai-llm.component.html',
    standalone: false
})
export class UpdateAiLLMComponent implements OnInit {
    headers                 : HttpHeaders   = this.authService.headers;
    loading                 : boolean       = true;
    updateLoading           : boolean       = false;
    modelLLMForm            : any[]         = [
        {
            id: 'name',
            label: this.translate.instant('AI-LLM.model_name'),
            type: 'text',
            control: new FormControl(),
            required: true,
            class: ""
        },
        {
            id: 'provider',
            label: this.translate.instant('AI-LLM.provider'),
            type: 'select',
            control: new FormControl(),
            required: true,
            class: "",
            values: [
                {id: 'mistral', label: 'Mistral'},
                {id: 'gemini', label: 'Google Gemini'},
                {id: 'copilot', label: 'Microsoft Copilot'}
                //{id: 'custom', label: this.translate.instant('AI-LLM.custom')}
            ]
        },
        {
            id: 'input_price',
            label: this.translate.instant('AI-LLM.input_price'),
            type: 'text',
            control: new FormControl(),
            required: false,
            class: "",
            hint: this.translate.instant('AI-LLM.price_hint')
        },
        {
            id: 'output_price',
            label: this.translate.instant('AI-LLM.output_price'),
            type: 'text',
            control: new FormControl(),
            required: false,
            class: "",
            hint: this.translate.instant('AI-LLM.price_hint')
        },
        {
            id: 'url',
            label: this.translate.instant('AI-LLM.url'),
            type: 'text',
            control: new FormControl(),
            required: true,
            class: "col-span-2"
        },
        {
            id: 'api_key',
            label: this.translate.instant('AI-LLM.api_key'),
            type: 'text',
            control: new FormControl(),
            required: true,
            placeholder: this.translate.instant('AI-LLM.api_key_placeholder'),
            class: "col-span-2"
        },
    ];
    llmModelId              : any;
    llmModel                : any;
    llmJsonContentControl   : FormControl   = new FormControl();
    llmProvider             : string        = '';
    llmModelJsonUpdated     : boolean      = false;

    defaultResponseFormat   : any           = {
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
    defaultUrlPlaceholder   : any           = {
        "mistral": "https://api.mistral.ai/v1/chat/completions",
        "gemini": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
        "copilot": "https://oc.cognitiveservices.azure.com/openai/deployments/gpt-5-mini/chat/completions?api-version=2024-08-01-preview"
    };
    defaultCosts            : any           = {
        "mistral": {
            "input_price": 0.00010,
            "output_price": 0.00030
        },
        "gemini": {
            "input_price": 0.00010,
            "output_price": 0.00040
        },
        "copilot": {
            "input_price": 0.012,
            "output_price": 0.024
        }
    };
    defaultPromptText       : string        = "Extract the following from the provided invoice text:\n" +
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

    defaultPrompts          : any           = [
        {
            "role": "user",
            "content": this.defaultPromptText
        },
        {
            "role": "user",
            "content": "##OCR_CONTENT##",
        }
    ];
    defaultJsonContent      : any           = {
        "mistral": {
            "temperature": 0.2,
            "max_tokens": 1000,
            "model": "mistral-small-latest",
            "messages": this.defaultPrompts,
            "response_format": this.defaultResponseFormat
        },
        "copilot": {
            "temperature": 1,
            "max_tokens": 1000,
            "model": "gpt-5-mini",
            "messages": this.defaultPrompts,
            "response_format": this.defaultResponseFormat
        },
        "gemini": {
            "contents": [
                {
                    "parts":  [
                        {
                            "text": this.defaultPromptText
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

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) {}

    ngOnInit() {
        this.serviceSettings.init();
        this.llmModelId = this.route.snapshot.params['id'];

        this.http.get(environment['url'] + '/ws/ai/llm/getById/' + this.llmModelId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.llmModel = data;
                if (this.llmModel.provider) {
                    this.llmProvider = this.llmModel.provider;
                }
                for (const field in data) {
                    if (field === 'json_content') {
                        let json_content = null;
                        if (data[field] === null || data[field] === undefined || Object.keys(data[field]).length === 0) {
                            json_content = this.defaultJsonContent[data.provider];
                        } else {
                            this.llmModelJsonUpdated = true;
                            json_content = data[field];
                        }
                        this.llmJsonContentControl.setValue(JSON.stringify(json_content, null, 4));
                    }

                    if (data.hasOwnProperty(field)) {
                        this.modelLLMForm.forEach(element => {
                            if (element.id === field) {
                                element.control.setValue(data[field]);
                            }
                            if (element.id === 'url' && this.llmProvider) {
                                element.placeholder = this.defaultUrlPlaceholder[this.llmProvider];
                            }
                            if (element.id == 'input_price' || element.id == 'output_price') {
                                if (data['settings'][element.id] === null || data['settings'][element.id] === undefined || data['settings'][element.id] === '') {
                                    element.control.setValue(this.defaultCosts[this.llmProvider][element.id]);
                                } else {
                                    element.control.setValue(data['settings'][element.id]);
                                }
                            }
                        });
                    }
                }
            }),
            finalize(() => {
                this.loading = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/verifier/ai-llm']).then();
                return of(false);
            })
        ).subscribe();
    }

    changeProvider(event:any) {
        this.llmProvider = event.value;
        this.modelLLMForm.forEach(element => {
            if (element.id === 'url') {
                element.placeholder = this.defaultUrlPlaceholder[this.llmProvider];
            }
            if (element.id === 'input_price' || element.id === 'output_price') {
                if (this.defaultCosts[this.llmProvider][element.id] !== undefined) {
                    element.control.setValue(this.defaultCosts[this.llmProvider][element.id]);
                } else {
                    element.control.setValue(null);
                }
            }
        });

        this.llmModel.json_content = this.defaultJsonContent[this.llmProvider];
        this.llmJsonContentControl.setValue(JSON.stringify(this.llmModel.json_content, null, 4));
    }

    updateLLMModel() {
        this.updateLoading = true;
        let llm_data: any = {};
        llm_data['settings'] = {};

        this.modelLLMForm.forEach(element => {
            if (element.required && (element.control.value === null || element.control.value === undefined || element.control.value === '')) {
                llm_data = null;
                this.updateLoading = false;
                this.notify.error(this.translate.instant('ERROR.mandatory_fields'));
                return;
            }
            if (element.id == 'input_price' || element.id == 'output_price') {
                if (element.control.value) {
                    llm_data['settings'][element.id] = element.control.value;
                }
            } else {
                llm_data[element.id] = element.control.value;
            }
        });

        if (!llm_data) {
            return;
        }

        try {
            llm_data['json_content'] = JSON.parse(this.llmJsonContentControl.value);
        } catch (e) {
            console.error(e)
            this.updateLoading = false;
            this.notify.error(this.translate.instant('ERROR.json_pattern'));
            return;
        }

        this.http.put(environment['url'] + '/ws/ai/llm/update/' + this.llmModelId, {'args': llm_data}, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('AI-LLM.model_llm_updated'));
                this.updateLoading = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.updateLoading = false;
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getErrorMessage(field: any, form: any) {
        let error: any;
        form.forEach((element: any) => {
            if (element.id === field && element.control.invalid) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }

                if (element.control.errors.json_error) {
                    error = this.translate.instant('ERROR.json_pattern');
                }
            }
        });
        return error;
    }
}
