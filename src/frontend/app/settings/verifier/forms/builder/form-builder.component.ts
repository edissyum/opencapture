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
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import { environment } from "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";

@Component({
    selector: 'form-builder',
    templateUrl: './form-builder.component.html',
    styleUrls: ['./form-builder.component.scss'],
    standalone: false
})
export class FormBuilderComponent implements OnInit {
    formId                  : any;
    formSettingId           : any;
    formLabels              : any       = {};
    selectedFields          : any       = [];
    outputs                 : any[]     = [];
    loading                 : boolean   = true;
    loadingCustomFields     : boolean   = true;
    creationMode            : boolean   = true;
    updateFormLoading       : boolean   = false;
    form                    : any       = {
        'label': {
            'control': new FormControl()
        },
        'default_form': {
            'control': new FormControl()
        }
    };
    formSettings            : any       = {
        'supplier_verif': {
            'control': new FormControl()
        },
        'allow_learning': {
            'control': new FormControl(true)
        }
    };
    outputForm              : any       = [
        {
            control: new FormControl(),
            cpt: 0
        }
    ];
    fields                  : any       = {
        'supplier': [],
        'lines': [],
        'facturation': [],
        'other': []
    };
    fieldCategories         : any []    = [
        {
            'id': 'supplier',
            'label': _('FORMS.supplier'),
            'edit': false
        },
        {
            'id': 'lines',
            'label': _('FACTURATION.lines'),
            'edit': false
        },
        {
            'id': 'facturation',
            'label': _('FACTURATION.facturation'),
            'edit': false
        },
        {
            'id': 'other',
            'label': _('FORMS.other'),
            'edit': false
        }
    ];
    availableFieldsParent   : any []    = [
        {
            'id': 'accounts_fields',
            'label': _('ACCOUNTS.supplier'),
            'values': [
                {
                    id: 'name',
                    label: _('ACCOUNTS.supplier_name'),
                    unit: 'supplier',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'white',
                    format: 'alphanum_extended_with_accent',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'lastname',
                    label: _('ACCOUNTS.lastname'),
                    unit: 'supplier',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'white',
                    format: 'alphanum_extended_with_accent',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'firstname',
                    label: _('ACCOUNTS.firstname'),
                    unit: 'supplier',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'white',
                    format: 'alphanum_extended_with_accent',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'function',
                    label: _('ACCOUNTS.function'),
                    unit: 'supplier',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'white',
                    format: 'alphanum_extended_with_accent',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'civility',
                    label: _('ACCOUNTS.civility'),
                    unit: 'supplier',
                    type: 'select',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'white',
                    format: 'select',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'siret',
                    label: _('ACCOUNTS.siret'),
                    unit: 'supplier',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'green',
                    format: 'number_int',
                    format_icon:'fa-solid fa-calculator',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'siren',
                    label: _('ACCOUNTS.siren'),
                    unit: 'supplier',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'lime',
                    format: 'number_int',
                    format_icon:'fa-solid fa-calculator',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'vat_number',
                    label: _('ACCOUNTS.vat_number'),
                    unit: 'supplier',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'olive',
                    format: 'alphanum',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'iban',
                    label: _('ACCOUNTS.iban'),
                    unit: 'supplier',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'green',
                    format: 'alphanum',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'duns',
                    label: _('ACCOUNTS.duns'),
                    unit: 'supplier',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'green',
                    format: 'alphanum',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'bic',
                    label: _('ACCOUNTS.bic'),
                    unit: 'supplier',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'green',
                    format: 'alphanum',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'rccm',
                    label: _('ACCOUNTS.rccm'),
                    unit: 'supplier',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'green',
                    format: 'alphanum',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'email',
                    label: _('FORMATS.email'),
                    unit: 'supplier',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'green',
                    format: 'email',
                    format_icon:'fa-solid fa-at',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'phone',
                    label: _('FORMATS.phone'),
                    unit: 'supplier',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'green',
                    format: 'alphanum',
                    format_icon:'fa-solid fa-at',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'address1',
                    label: _('ADDRESSES.address_1'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'alphanum_extended_with_accent',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'address2',
                    label: _('ADDRESSES.address_2'),
                    unit: 'addresses',
                    type: 'text',
                    required: false,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'alphanum_extended_with_accent',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'postal_code',
                    label: _('ADDRESSES.postal_code'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'number_int',
                    format_icon:'fa-solid fa-calculator',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'city',
                    label: _('ADDRESSES.city'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'char',
                    format_icon:'fa-solid fa-font',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'country',
                    label: _('ADDRESSES.country'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'char',
                    format_icon:'fa-solid fa-font',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                }
            ]
        },
        {
            'id': 'lines_fields',
            'label': this.translate.instant('FACTURATION.lines'),
            'values': [
                {
                    id: 'description',
                    label: _('FACTURATION.description'),
                    unit: 'lines',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/5",
                    class_label: "1/5",
                    format: 'alphanum',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'quantity',
                    label: _('FACTURATION.quantity'),
                    unit: 'lines',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/5",
                    class_label: "1/5",
                    format: 'number_float',
                    format_icon:'fa-solid fa-calculator',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'unit_price',
                    label: _('FACTURATION.unit_price'),
                    unit: 'lines',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/5",
                    class_label: "1/5",
                    format: 'number_float',
                    format_icon:'fa-solid fa-calculator',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'line_ht',
                    label: _('FACTURATION.no_rate_amount'),
                    unit: 'lines',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/5",
                    class_label: "1/5",
                    format: 'number_float',
                    format_icon:'fa-solid fa-calculator',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'line_vat_rate',
                    label: _('FACTURATION.vat_rate'),
                    unit: 'lines',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/5",
                    class_label: "1/5",
                    format: 'number_float',
                    format_icon:'fa-solid fa-calculator',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                }
            ]
        },
        {
            'id': 'facturation_fields',
            'label': this.translate.instant('FACTURATION.facturation'),
            'values': [
                {
                    id: 'delivery_number',
                    label: _('FACTURATION.delivery_number'),
                    unit: 'facturation',
                    type: 'text',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'silver',
                    format: 'alphanum_extended',
                    format_icon: 'fa-solid fa-hashtag',
                    display: 'multi',
                    display_icon:'fa-solid fa-layer-group',
                    default_value: ''
                },
                {
                    id: 'invoice_number',
                    label: _('FACTURATION.invoice_number'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'red',
                    format: 'alphanum_extended',
                    format_icon: 'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'subject',
                    label: _('WORKFLOW.subject'),
                    unit: 'facturation',
                    type: 'text',
                    required: false,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'red',
                    format: 'alphanum_extended_with_accent',
                    format_icon: 'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'quotation_number',
                    label: _('FACTURATION.quotation_number'),
                    unit: 'facturation',
                    type: 'text',
                    required: false,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'orange',
                    format: 'alphanum_extended',
                    format_icon: 'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'document_date',
                    label: _('FACTURATION.document_date'),
                    unit: 'facturation',
                    type: 'date',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'yellow',
                    format: 'date',
                    format_icon: 'fa-solid fa-calendar-day',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'document_due_date',
                    label: _('FACTURATION.document_due_date'),
                    unit: 'facturation',
                    type: 'date',
                    required: false,
                    required_icon: 'far fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'blue',
                    format: 'date',
                    format_icon: 'fa-solid fa-calendar-day',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'currency',
                    label: _('WORKFLOW.currency'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'pink',
                    format: 'alphanum',
                    format_icon:'fa-solid fa-hashtag',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'vat_rate',
                    label: _('FACTURATION.vat_rate'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'pink',
                    format: 'number_float',
                    format_icon:'fa-solid fa-calculator',
                    display: 'multi',
                    display_icon:'fa-solid fa-layer-group',
                    default_value: ''
                },
                {
                    id: 'no_rate_amount',
                    label: _('FACTURATION.no_rate_amount'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'fuschia',
                    format: 'number_float',
                    format_icon:'fa-solid fa-calculator',
                    display: 'multi',
                    display_icon:'fa-solid fa-layer-group',
                    default_value: ''
                },
                {
                    id: 'vat_amount',
                    label: _('FACTURATION.vat_amount'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: 'purple',
                    format: 'number_float',
                    format_icon:'fa-solid fa-calculator',
                    display: 'multi',
                    display_icon:'fa-solid fa-layer-group',
                    default_value: ''
                },
                {
                    id: 'accounting_plan',
                    label: _('FACTURATION.accounting_plan'),
                    unit: 'facturation',
                    type: 'select',
                    required: false,
                    format: 'select',
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    display: 'multi',
                    display_icon:'fa-solid fa-layer-group',
                    default_value: ''
                },
                {
                    id: 'total_ttc',
                    label: _('FACTURATION.total_ttc'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'number_float',
                    format_icon:'fa-solid fa-calculator',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'total_ht',
                    label: this.translate.instant('FACTURATION.total_ht'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    format: 'number_float',
                    format_icon:'fa-solid fa-calculator',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                },
                {
                    id: 'total_vat',
                    label: this.translate.instant('FACTURATION.total_vat'),
                    unit: 'facturation',
                    type: 'text',
                    required: true,
                    required_icon: 'fa-solid fa-star',
                    class: "w-1/3",
                    class_label: "1/33",
                    color: '',
                    format: 'number_float',
                    format_icon:'fa-solid fa-calculator',
                    display: 'simple',
                    display_icon:'fa-solid fa-file-alt',
                    default_value: ''
                }
            ]
        },
        {
            'id': 'custom_fields',
            'label': _('FORMS.custom_fields'),
            'values': []
        }
    ];
    classList               : any []    = [
        {
            'id': 'w-full',
            'label': '1'
        },
        {
            'id': 'w-1/2',
            'label': '1/2'
        },
        {
            'id': 'w-30',
            'label': '1/3'
        },
        {
            'id': 'w-1/3',
            'label': '1/33'
        },
        {
            'id': 'w-1/4',
            'label': '1/4'
        },
        {
            'id': 'w-1/5',
            'label': '1/5'
        },
        {
            'id': 'w-1/6',
            'label': '1/6'
        }
    ];
    colorsList              : any []    = [
        {
            'id': 'yellow',
            'label': _('COLORS.yellow')
        },
        {
            'id': 'pink',
            'label': _('COLORS.pink')
        },
        {
            'id': 'red',
            'label': _('COLORS.red')
        },
        {
            'id': 'blue',
            'label': _('COLORS.blue')
        },
        {
            'id': 'orange',
            'label': _('COLORS.orange')
        },
        {
            'id': 'purple',
            'label': _('COLORS.purple')
        },
        {
            'id': 'black',
            'label': _('COLORS.black')
        },
        {
            'id': 'white',
            'label': _('COLORS.white')
        },
        {
            'id': 'aqua',
            'label': _('COLORS.aqua')
        },
        {
            'id': 'maroon',
            'label': _('COLORS.maroon')
        },
        {
            'id': 'teal',
            'label': _('COLORS.teal')
        },
        {
            'id': 'navy',
            'label': _('COLORS.navy')
        },
        {
            'id': 'fuchsia',
            'label': _('COLORS.fuchsia')
        },
        {
            'id': 'silver',
            'label': _('COLORS.silver')
        },
        {
            'id': 'gray',
            'label': _('COLORS.gray')
        },
        {
            'id': 'lime',
            'label': _('COLORS.lime')
        },
        {
            'id': 'green',
            'label': _('COLORS.green')
        }
    ];
    formatList              : any []    = [
        {
            'id': 'date',
            'label': _('FORMATS.date'),
            'icon': 'fa-solid fa-calendar-day'
        },
        {
            'id': 'number_float',
            'label': _('FORMATS.number_float'),
            'icon': 'fa-solid fa-calculator'
        },
        {
            'id': 'number_int',
            'label': _('FORMATS.number_int'),
            'icon': 'fa-solid fa-calculator'
        },
        {
            'id': 'char',
            'label': _('FORMATS.char'),
            'icon': 'fa-solid fa-font'
        },
        {
            'id': 'alphanum',
            'label': _('FORMATS.alphanum'),
            'icon': 'fa-solid fa-hashtag'
        },
        {
            'id': 'alphanum_extended',
            'label': _('FORMATS.alphanum_extended'),
            'icon': 'fa-solid fa-level-up-alt'
        },
        {
            'id': 'alphanum_extended_with_accent',
            'label': _('FORMATS.alphanum_extended_with_accent'),
            'icon': 'fa-solid fa-level-up-alt'
        },
        {
            'id': 'email',
            'label': _('FORMATS.email'),
            'icon': 'fa-solid fa-alt'
        }
    ];
    displayList             : any []    = [
        {
            'id': 'simple',
            'label': _('DISPLAY.simple'),
            'icon': 'fa-solid fa-file-alt'
        },
        {
            'id': 'multi',
            'label': _('DISPLAY.multi'),
            'icon': 'fa-solid fa-layer-group'
        }
    ];
    mandatoryList           : any []    = [
        {
            'id': true,
            'label': _('MANDATORY.required'),
            'icon': 'fa-solid fa-star'
        },
        {
            'id': false,
            'label': _('MANDATORY.not_required'),
            'icon': 'far fa-star'
        }
    ];


    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.formId = this.route.snapshot.params['id'];

        this.http.get(environment['url'] + '/ws/outputs/verifier/list', {headers: this.authService.headers}).pipe(
            tap((res_outputs: any) => {
                this.outputs = res_outputs.outputs;
                if (this.formId) {
                    this.creationMode = false;
                    this.http.get(environment['url'] + '/ws/forms/verifier/getById/' + this.formId, {headers: this.authService.headers}).pipe(
                        tap((data: any) => {
                            this.formLabels = data.labels;
                            this.formSettingId = data.module_settings_id;
                            for (const field in this.form) {
                                for (const info in data) {
                                    if (info === field) {
                                        this.form[field].control.setValue(data[field]);
                                    }
                                }
                            }

                            for (const field in this.formSettings) {
                                for (const setting in data['settings']) {
                                    if (setting === field) {
                                        this.formSettings[setting].control.setValue(data['settings'][setting]);
                                    }
                                }
                            }

                            if (data.outputs) {
                                const length = data.outputs.length;
                                if (length === 1) {
                                    this.outputForm[0].control.setValue(data.outputs[0]);
                                }
                                if (length > 1) {
                                    for (const cpt in data.outputs) {
                                        if (parseInt(cpt) !== 0) {
                                            this.addOutput();
                                        }
                                        this.outputForm[cpt].control.setValue(data.outputs[cpt]);
                                    }
                                }
                            }
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                }
            }), catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/customFields/list?module=verifier', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data['customFields']) {
                    for (const field in data['customFields']) {
                        for (const parent in this.availableFieldsParent) {
                                if (this.availableFieldsParent[parent].id === 'custom_fields') {
                                    this.availableFieldsParent[parent].values.push({
                                        id: 'custom_' + data['customFields'][field].id,
                                        label: data['customFields'][field].label,
                                        unit: 'custom',
                                        type: data['customFields'][field].type,
                                        required: data['customFields'][field].required,
                                        autocomplete: data['customFields'][field].autocomplete,
                                        class: "w-1/3",
                                        class_label: "1/33",
                                        default_value: ''
                                    });

                                    let format = '';

                                    if (data['customFields'][field].type === 'regex' && data['customFields'][field].settings['regex']) {
                                        format = data['customFields'][field].settings['regex']['format'];
                                    } else if (data['customFields'][field].type === 'text') {
                                        format = 'char';
                                    } else if (data['customFields'][field].type === 'select') {
                                        format = 'select';
                                    } else if (data['customFields'][field].type === 'textarea') {
                                        format = 'char';
                                    } else {
                                        format = data['customFields'][field].type;
                                    }
                                    this.availableFieldsParent[parent].values[this.availableFieldsParent[parent].values.length - 1]['format'] = format;
                                }
                            }
                    }
                }
                this.loadingCustomFields = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        if (this.formId) {
            this.http.get(environment['url'] + '/ws/forms/fields/getByFormId/' + this.formId, {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    if (data.fields) {
                        Object.keys(data.fields).forEach((category: any) => {
                            if (data.fields[category]) {
                                this.fields[category] = data.fields[category];
                            }
                        });

                        for (const category in this.fields) {
                            if (this.fields.hasOwnProperty(category)) {
                                this.fields[category].forEach((currentField: any) => {
                                    this.availableFieldsParent.forEach((parent: any) => {
                                        let cpt = 0;
                                        parent['values'].forEach((childFields: any) => {
                                            if (currentField.id === childFields.id) {
                                                parent['values'].splice(cpt, 1);
                                            }
                                            cpt = cpt + 1;
                                        });
                                    });
                                });
                            }
                        }
                    }
                }),
                finalize(() => setTimeout(() => {
                    this.loading = false;
                }, 500)),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            this.loading = false;
        }
    }

    dropFromAvailableFields(event: any) {
        const unit = event.previousContainer.id;
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data ? event.previousContainer.data : this.fields[unit],
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
    }

    updateLabel(category: any, label:any) {
        category.edit = !category.edit;
        if (label) {
            category.label = label;
            this.formLabels[category.id] = label;
            if (!this.creationMode) {
                this.http.put(environment['url'] + '/ws/forms/updateLabel/' + this.formId + '/' + category.id,
                    {label: category.label}, {headers: this.authService.headers}).pipe(
                    tap(()=> {
                        this.notify.success(this.translate.instant('FORMS.label_updated_successfully'));
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }
        }
    }

    focusInput(category_id: any) {
        setTimeout(() => {
            document.getElementById(category_id)!.focus();
        }, 200);
    }

    getCategoryLabel(category: any) {
        return this.formLabels[category.id] ? this.formLabels[category.id] : this.translate.instant(category.label);
    }

    changeClass(fieldId: any, newClass: any, classLabel: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.class = newClass;
                element.class_label = classLabel;
            }
        });
    }

    changeFormat(fieldId: any, newFormat: any, formatIcon: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.format = newFormat;
                element.format_icon = formatIcon;
            }
        });
    }

    changeDisplay(fieldId: any, newDisplay: any, displayIcon: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.display = newDisplay;
                element.display_icon = displayIcon;
            }
        });
    }

    changeRequired(fieldId: any, newRequired: any, requiredIcon: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.required = newRequired;
                element.required_icon = requiredIcon;
            }
        });
    }

    updateDefaultValue(fieldId: any, newDefaultValue: any, category: any) {
        this.fields[category].forEach((element: any) => {
            if (element.id === fieldId) {
                element.default_value = newDefaultValue.value;
            }
        });
    }

    changeColor(fieldId: any, newColor: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.color = newColor;
            }
        });
    }

    dropFromForm(event: any) {
        const unit = event.container.id;
        const previousUnit = event.previousContainer.id;

        if (event.previousContainer === event.container) {
            if (event.container.data) {
                moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            }
        } else {
            transferArrayItem(event.previousContainer.data ? event.previousContainer.data : this.fields[previousUnit],
                event.container.data ? event.container.data : this.fields[unit],
                event.previousIndex,
                event.currentIndex);
        }
    }

    deleteField(previousIndex: any, category: any, unit: any) {
        if (unit === 'addresses' || unit === 'supplier') {
            unit = 'accounts';
        }
        for (const parentField in this.availableFieldsParent) {
            const id = this.availableFieldsParent[parentField].id.split('_fields')[0];
            if (id === unit) {
                const currentIndex = this.availableFieldsParent[parentField]['values'].length;
                transferArrayItem(this.fields[category],
                    this.availableFieldsParent[parentField]['values'],
                    previousIndex,
                    currentIndex);
            }
        }
    }

    updateValue(event: any, field: any) {
        const value = event.target ? event.target.value : event.value;
        if (value) {
            field.label = value;
        }
        field['edit_name'] = false;
    }

    storeNewOrder(event: any, categoryId: any) {
        const tmpCurrentOrder: any[] = [];
        event.currentOrder.forEach((element: any) => {
            this.fields[categoryId].forEach((field: any) => {
                if (element.id === field.id) {
                    const elementAlreadyInArray = tmpCurrentOrder.find((elementInArray: any) => elementInArray.id === element.id);
                    if (!elementAlreadyInArray) {
                        tmpCurrentOrder.push(element);
                    }
                }
            });
        });
        this.fields[categoryId] = tmpCurrentOrder;
    }

    addOutput() {
        this.outputForm[0].cpt = this.outputForm[0].cpt + 1;
        this.outputForm.push({
            'control': new FormControl(),
            'canRemove': true
        });
    }

    removeOutput(cpt: any) {
        this.outputForm.splice(cpt, 1);
    }

    updateForm() {
        this.updateFormLoading = true;
        const label = this.form.label.control.value;
        const isDefault = this.form.default_form.control.value;
        const outputs: any[] = [];
        this.outputForm.forEach((element: any) => {
            if (element.control.value) {
                outputs.push(element.control.value);
            }
        });

        const settings: any = {};
        Object.keys(this.formSettings).forEach((element: any) => {
            settings[element] = this.formSettings[element].control.value;
        });

        if (label !== '' && outputs.length >= 1) {
            this.http.put(environment['url'] + '/ws/forms/verifier/update/' + this.formId, {
                    'args': {
                        'label'        : label,
                        'default_form' : isDefault,
                        'outputs'      : outputs,
                        'settings'     : settings
                    }
                }, {headers: this.authService.headers},
            ).pipe(
                tap(()=> {
                    this.http.post(environment['url'] + '/ws/forms/verifier/updateFields/' + this.formId, this.fields, {headers: this.authService.headers}).pipe(
                        tap(() => {
                            this.notify.success(this.translate.instant('FORMS.updated'));
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.updateFormLoading = false;
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                }),
                finalize(() => this.updateFormLoading = false),
                catchError((err: any) => {
                    console.debug(err);
                    this.updateFormLoading = false;
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            if (!label && outputs.length === 0) {
                this.notify.error(this.translate.instant('FORMS.label_and_output_mandatory'));
            } else if (!label) {
                this.notify.error(this.translate.instant('FORMS.label_mandatory'));
            } else if (outputs.length === 0) {
                this.notify.error(this.translate.instant('FORMS.output_type_mandatory'));
            }
            this.updateFormLoading = false;
        }
    }

    selectForLine(event: any, field: any) {
        if (event.ctrlKey) {
            field.lineSelected = !field.lineSelected;
            if (field.lineSelected) {
                this.selectedFields.push({'id': field.id, 'class': field.class});
            } else {
                this.selectedFields.forEach((element: any, index: number) => {
                    if (element.id === field.id) {
                        this.selectedFields.splice(index, 1);
                        field.fullSize = false;
                    }
                });
            }
            let size = 0;
            this.selectedFields.forEach((element: any) => {
                const currentNumber = element.class.replace('w-', '');
                if (currentNumber !== 'full') {
                    const currentSize = new Function("return " + element.class.replace('w-', ''))();
                    size += currentSize;
                } else {
                    size = 1;
                }
            });
            if (Math.round((size * 10)) / 10 % 1 === 0 && field.lineSelected) {
                field.fullSize = true;
            }
        }
    }

    createForm() {
        const label = this.form.label.control.value;
        const isDefault = this.form.default_form.control.value;
        let supplierVerif = this.formSettings.supplier_verif.control.value;
        let allowLearning = this.formSettings.allow_learning.control.value;
        if (!supplierVerif) {
            supplierVerif = false;
        }

        if (!allowLearning) {
            allowLearning = false;
        }

        const outputs: any[] = [];
        this.outputForm.forEach((element: any) => {
            if (element.control.value) {
                outputs.push(element.control.value);
            }
        });
        if (label !== '' && outputs.length >= 1) {
            this.http.post(environment['url'] + '/ws/forms/verifier/create', {
                    'args': {
                        'module'       : 'verifier',
                        'label'        : label,
                        'outputs'      : outputs,
                        'default_form' : isDefault,
                        'settings'     : {
                            "supplier_verif" : supplierVerif,
                            "allow_learning" : allowLearning
                        }
                    }
                }, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    this.http.post(environment['url'] + '/ws/forms/verifier/updateFields/' + data.id, this.fields, {headers: this.authService.headers}).pipe(
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                    this.notify.success(this.translate.instant('FORMS.created'));
                    this.router.navigateByUrl('settings/verifier/forms').then();
                    Object.keys(this.formLabels).forEach((category: any) => {
                        this.http.put(environment['url'] + '/ws/forms/updateLabel/' + data.id + '/' + category,
                            {label: this.formLabels[category]}, {headers: this.authService.headers}).pipe(
                            catchError((err: any) => {
                                console.debug(err);
                                this.notify.handleErrors(err);
                                return of(false);
                            })
                        ).subscribe();
                    });
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            if (!label && outputs.length === 0) {
                this.notify.error(this.translate.instant('FORMS.label_and_output_mandatory'));
            } else if (!label) {
                this.notify.error(this.translate.instant('FORMS.label_mandatory'));
            } else if (outputs.length === 0) {
                this.notify.error(this.translate.instant('FORMS.output_type_mandatory'));
            }
            this.updateFormLoading = false;
        }
    }
}
