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

import { Component, OnInit, PipeTransform, Pipe } from '@angular/core';
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
import { catchError, finalize, map, startWith, tap } from "rxjs/operators";
import { of } from "rxjs";

@Component({
    selector: 'app-ai-llm-update',
    templateUrl: './update-ai-llm.component.html',
    styleUrl: './update-ai-llm.component.scss',
    standalone: false
})
export class UpdateAiLLMComponent implements OnInit {
    headers                 : HttpHeaders   = this.authService.headers;
    loading                 : boolean       = true;
    modelLLMForm            : any[]         = [
        {
            id: 'name',
            label: this.translate.instant('AI-LLM.model_name'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'provider',
            label: this.translate.instant('AI-LLM.provider'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: [
                {id: 'chatgpt', label: 'ChatGPT'},
                {id: 'mistral', label: 'Mistral'}
                //{id: 'custom', label: this.translate.instant('AI-LLM.custom')}
            ]
        },
        {
            id: 'url',
            label: this.translate.instant('AI-LLM.url'),
            type: 'text',
            control: new FormControl(),
            required: true,
            placeholder: this.translate.instant('AI-LLM.url_placeholder'),
        },
        {
            id: 'api_key',
            label: this.translate.instant('AI-LLM.api_key'),
            type: 'text',
            control: new FormControl(),
            required: true,
            placeholder: this.translate.instant('AI-LLM.api_key_placeholder')
        },
    ];
    llmModelId              : any;
    llmModel                : any;
    llmJsonContentControl   : FormControl   = new FormControl();

    defaultJsonContent      : any         = {
        "mistral": {
            "temperature": 0.2,
            "model": "mistral-small-latest",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract the following from the provided invoice text." +
                                "Supplier: name, address, postal code, city, country, VAT number, email, iban." +
                                "Invoice: invoice number, delivery_number, quotation_number, document date, due date, currency, total excl. tax, total tax, total incl. tax, vat rate." +
                                "Line Items: description, quantity, unit price, tax rate, line total excl. tax, line total incl. tax." +
                                "If a field is missing or not applicable, set it to null." +
                                "Date format: ISO 8601 (YYYY-MM-DD)." +
                                "If value is iban, rib or number, remove spaces." +
                                "Currency format: 3-letter ISO currency code (e.g., EUR, USD)." +
                                "VAT rate format: percentage (e.g., 20.00)." +
                                "If the invoice has no VAT, set vat_amount and vat_rate to 0." +
                                "If the invoice has no line items, set line_items to an empty array." +
                                "Do not add commentary." +
                                "If it's not an invoice, respond with an empty JSON object."
                        },
                        {
                            "type": "document_url",
                            "document_url": "b64_file_content",
                        }
                    ],
                }
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "invoice_info",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "invoice_number": { "type": "string" },
                            "quotation_number": { "type": "string" },
                            "order_number": { "type": "string" },
                            "delivery_number": { "type": "string" },
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
                            "total_ht": { "type": "number" },
                            "total_ttc": { "type": "number" },
                            "total_vat": { "type": "number" },
                            "vat_rate": { "type": "number" },
                            "currency": { "type": "string" },
                            "supplier": {
                                "type": "object",
                                "properties": {
                                    "name": { "type": ["string", "null"] },
                                    "address": { "type": ["string", "null"] },
                                    "postal_code": { "type": ["string", "null"] },
                                    "city": { "type": ["string", "null"] },
                                    "country": { "type": ["string", "null"] },
                                    "vat_number": { "type": ["string", "null"] },
                                    "email": { "type": ["string", "null"] },
                                    "iban": { "type": ["string", "null"] }
                                },
                                "required": ["name", "address", "postal_code", "city", "country", "VAT_number", "email"]
                            }
                        },
                    }
                }
            }
        },
        "chatgpt": {

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
                for (const field in data) {
                    if (field === 'json_content') {
                        let json_content = null;
                        if (data[field] === null || data[field] === undefined || Object.keys(data[field]).length === 0) {
                            json_content = this.defaultJsonContent[data.provider];
                        } else {
                            json_content = data[field];
                        }
                        this.llmJsonContentControl.setValue(JSON.stringify(json_content, null, 4));
                    }
                    if (data.hasOwnProperty(field)) {
                        this.modelLLMForm.forEach(element => {
                            if (element.id === field) {
                                element.control.setValue(data[field]);
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

    updateLLMModel() {
        let llm_data: any = {};
        this.modelLLMForm.forEach(element => {
            if (element.required && (element.control.value === null || element.control.value === undefined || element.control.value === '')) {
                llm_data = null;
                this.notify.error(this.translate.instant('ERROR.mandatory_fields'));
                return;
            }
            llm_data[element.id] = element.control.value;
        });

        if (!llm_data) {
            return;
        }

        try {
            llm_data['json_content'] = JSON.parse(this.llmJsonContentControl.value);
        } catch (e) {
            console.error(e)
            this.notify.error(this.translate.instant('ERROR.json_pattern'));
            return;
        }

        this.http.put(environment['url'] + '/ws/ai/llm/update/' + this.llmModelId, {'args': llm_data}, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('AI-LLM.model_llm_updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
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
