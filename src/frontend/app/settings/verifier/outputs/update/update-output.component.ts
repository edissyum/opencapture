import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FormBuilder, FormControl} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, map, startWith, tap} from "rxjs/operators";
import { PipeTransform, Pipe } from '@angular/core';
import {of} from "rxjs";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";


@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
    transform(text: string, search:any): string {
        const pattern = search
            .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
            .split(' ')
            .filter((t:any) => t.length > 0)
            .join('|');
        const regex = new RegExp(pattern, 'gi');
        return search ? text.replace(regex, match => `<b>${match}</b>`) : text;
    }
}
@Component({
    selector: 'app-update',
    templateUrl: './update-output.component.html',
    styleUrls: ['./update-output.component.scss']
})
export class UpdateOutputComponent implements OnInit {
    headers             : HttpHeaders   = this.authService.headers;
    loading             : boolean       = true;
    connection          : boolean       = false;
    outputId            : any;
    output              : any;
    outputsTypes        : any[]         = [];
    outputsTypesForm    : any[]         = [];
    selectedOutputType  : any;
    originalOutputType  : any;
    toHighlight         : string        = '';
    outputForm          : any[]         = [
        {
            id: 'output_type_id',
            label: this.translate.instant('HEADER.output_type'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: this.outputsTypes
        },
        {
            id: 'output_label',
            label: this.translate.instant('HEADER.label'),
            type: 'text',
            control: new FormControl(),
            required: true,
        }
    ];
    availableFields     : any           = [
        {
            "id": 'HEADER.id',
            'label': 'HEADER.label'
        },
        {
            "id": 'name',
            'label': 'ACCOUNTS.supplier_name'
        },
        {
            "id": 'vat_number',
            'label': 'ACCOUNTS.vat_number'
        },
        {
            "id": 'siret',
            'label': 'ACCOUNTS.siret'
        },
        {
            "id": 'siren',
            'label': 'ACCOUNTS.siren'
        },
        {
            "id": 'invoice_number',
            'label': 'FACTURATION.invoice_number'
        },
        {
            "id": 'invoice_date_year',
            'label': marker('FACTURATION.invoice_date_year')
        },
        {
            "id": 'invoice_date_month',
            'label': marker('FACTURATION.invoice_date_month')
        },
        {
            "id": 'invoice_date_day',
            'label': marker('FACTURATION.invoice_date_day')
        },
        {
            "id": 'register_date_year',
            'label': marker('FACTURATION.register_date_year')
        },
        {
            "id": 'register_date_month',
            'label': marker('FACTURATION.register_date_month')
        },
        {
            "id": 'register_date_day',
            'label': marker('FACTURATION.register_date_day')
        },
        {
            "id": 'order_number',
            'label': 'FACTURATION.order_number'
        },
        {
            "id": 'delivery_number',
            'label': 'FACTURATION.delivery_number'
        },
    ];
    testConnectionMapping : any         = {
        'export_maarch' : "testMaarchConnection()"
    }

    /**
     * Pour ajouter une nouvelle chaine sortante (e.g : Alfresco)
     * Rajouter une nouvelle ligne dans le tableau testConnectionMapping() contenant l'id de la nouvelle chaine et le nom de la fonction permettant de verifier la connection
     * Dans le JSON présent dans la table output_types, en se basant sur celui existant (export_maarch), créer vos champs par défaut
     * Attention à bien garder les clé "auth" et "parameters" présentes
     * Si un champs "parameters" à besoin de récupérer des données depuis un WS de la solution cible (e.g récupération des utilisateurs Maarch)
     * Rajouter une ligne dans le JSON 'webservice' avec un nom de fonction (sans mettre les parenthèses)
     * Créer cette fonction et faites le process permettant de récupérer les données
     * Les données doivent être formatés comme suit : {'id': XX, 'value': XX} et être mise dans la clé "values" du champ
     * Regarder la fonction getUsersMaarch() pour voir le fonctionnement
     * Du côté des webservices permettant l'execution des chaînes sortantes, il faut créer un WS dans le fichier rest/verifier.py
     * La route doit être : verifier/invoices/<int:invoice_id>/output_type_id (e.g : verifier/invoices/<int:invoice_id>/export_maarch)
    **/

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.outputId = this.route.snapshot.params['id'];

        this.http.get(API_URL + '/ws/outputs/getById/' + this.outputId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                /**
                 * Set the output type and output label
                 **/
                this.output = data;
                for (let field in data) {
                    if (data.hasOwnProperty(field)) {
                        this.outputForm.forEach(element => {
                            if (element.id == field) {
                                if (element.id === 'output_type_id') this.selectedOutputType = this.originalOutputType = data[field];
                                element.control.setValue(data[field]);
                            }
                        });
                    }
                }
                this.http.get(API_URL + '/ws/outputs/getOutputsTypes', {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        this.outputsTypes = data.outputs_types;
                        /**
                         * Create the form with auth and parameters data
                         **/
                        for (let _output of this.outputsTypes) {
                            this.outputsTypesForm[_output.output_type_id] = {
                                'auth' : [],
                                'parameters' : [],
                            };
                            for (let category in this.outputsTypesForm[_output.output_type_id]) {
                                if (_output.data.options[category]) {
                                    for (let option of _output.data.options[category]) {
                                        this.outputsTypesForm[_output.output_type_id][category].push({
                                            id: option.id,
                                            label: option.label,
                                            type: option.type,
                                            placeholder: option.placeholder,
                                            control: new FormControl(),
                                            required: option.required,
                                            isJson: option.isJson,
                                            hint: option.hint,
                                            webservice: option.webservice,
                                        });
                                    }
                                }
                            }
                        }
                        /**
                         * Fill the form (created with data in output_types) table with the value stored (in outputs table)
                         **/
                        for (let category in this.outputsTypesForm[this.originalOutputType]) {
                            this.outputsTypesForm[this.originalOutputType][category].forEach((element: any) => {
                                this.output.data.options[category].forEach((output_element: any) => {
                                    if (element.id == output_element.id) {
                                        if (output_element.value) {
                                            if (output_element.webservice) element.values = [output_element.value];
                                            element.control.setValue(output_element.value);

                                        }
                                    }
                                });
                            });
                            this.testConnection();
                        }
                    }),
                    finalize(() => {this.loading = false}),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        this.router.navigate(['/settings/verifier/outputs']).then()
                        return of(false);
                    })
                ).subscribe();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/verifier/outputs']).then()
                return of(false);
            })
        ).subscribe();
    }

    displayFn(option: any) {
        return option ? option.value : undefined;
    }

    getErrorMessage(field: any, form: any) {
        let error = undefined;
        form.forEach((element: any) => {
            if (element.id == field && element.control.invalid) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }

                if (element.control.errors.json_error) {
                    error = this.translate.instant('ERROR.json_pattern');
                }
            }
        });
        return error
    }

    changeOutputType(event: any) {
        this.selectedOutputType = event.value;
    }

    isValidForm(form: any) {
        let state = true;
        form.forEach((element: any) => {
            if ((element.control.status !== 'DISABLED' && element.control.status !== 'VALID') || element.control.value == null) {
                state = false;
            }
        });
        return state;
    }

    getValueFromForm(form: any, field_id: any) {
        let value = '';
        form.forEach((element: any) => {
            if (field_id == element.id) {
                value = element.control.value;
            }
        });
        return value;
    }

    retrieveDataFromWS(field_id: any) {
        for (let cpt in this.outputsTypesForm[this.selectedOutputType]['parameters']) {
            let element = this.outputsTypesForm[this.selectedOutputType]['parameters'][cpt];
            if (element.id == field_id) {
                if (!element.values || element.values.length == 1) {
                    eval("this." + element.webservice + '(' + cpt + ')');
                }
            }
        }
    }

    private _filter(value: any, array: any) {
        if (typeof value == 'string') {
            this.toHighlight = value;
            const filterValue = value.toLowerCase();
            return array.filter((option: any) => option.value.toLowerCase().indexOf(filterValue) !== -1);
        }else {
            return array;
        }
    }

    /**** Maarch Webservices call ****/
    testMaarchConnection() {
        let args = this.getMaarchConnectionInfo();
        this.http.post(API_URL + '/ws/maarch/testConnection', {'args': args}, {headers: this.authService.headers},
        ).pipe(
            tap((data: any) => {
                let status = data.status;
                if (status == true) {
                    this.notify.success(this.translate.instant('OUTPUT.maarch_connection_ok'));
                    this.connection = true;
                }
                else{
                    this.notify.error(this.translate.instant('OUTPUT.maarch_connection_ko') + ' : ' + status[1]);
                    this.connection = false;
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getMaarchConnectionInfo() {
        return {
            'host': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'host'),
            'login': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'login'),
            'password': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'password'),
        };
    }

    getUsersFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            let args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getUsers', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.users) {
                    let data = _return.users;
                    let users = [];
                    for (let cpt in data) {
                        users.push({
                            'id': data[cpt].id,
                            'value': data[cpt].firstname + ' ' +  data[cpt].lastname,
                            'extra': data[cpt].user_id
                        })
                    }
                    this.setAutocompleteValues(cpt, users);
                }
            });
        }
    }

    getEntitiesFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            let args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getEntities', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.entities) {
                    let data = _return.entities;
                    let entities = [];
                    console.log(data)
                    for (let cpt in data) {
                        entities.push({
                            'id': data[cpt].serialId,
                            'value': data[cpt].entity_label,
                            'extra': data[cpt].entity_id
                        })
                    }
                    this.setAutocompleteValues(cpt, entities);
                }
            });
        }
    }

    getDoctypesFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            let args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getDoctypes', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.doctypes) {
                    let data = _return.doctypes;
                    let doctypes = [];
                    for (let cpt in data) {
                        doctypes.push({
                            'id': data[cpt].type_id,
                            'value': data[cpt].description,
                            'extra': data[cpt].type_id
                        })
                    }
                    this.setAutocompleteValues(cpt, doctypes);
                }
            });
        }
    }

    getPrioritiesFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            let args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getPriorities', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.priorities) {
                    let data = _return.priorities;
                    let priorities = [];
                    for (let cpt in data) {
                        priorities.push({
                            'id': data[cpt].id,
                            'value': data[cpt].label,
                            'extra': data[cpt].id
                        })
                    }
                    this.setAutocompleteValues(cpt, priorities);
                }
            });
        }
    }

    getStatusesFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            let args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getStatuses', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.statuses) {
                    let data = _return.statuses;
                    let statuses = [];
                    for (let cpt in data) {
                        statuses.push({
                            'id': data[cpt].id,
                            'value': data[cpt].label_status,
                            'extra': data[cpt].id
                        })
                    }
                    this.setAutocompleteValues(cpt, statuses);
                }
            });
        }
    }

    getIndexingModelsFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            let args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getIndexingModels', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.indexingModels) {
                    let data = _return.indexingModels;
                    let indexingModels = [];
                    for (let cpt in data) {
                        indexingModels.push({
                            'id': data[cpt].id,
                            'value': data[cpt].label,
                            'extra': data[cpt].category
                        })
                    }
                    this.setAutocompleteValues(cpt, indexingModels);
                }
            });
        }
    }

    /**** END Maarch Webservices call  ****/

    updateOutput() {
        let _array: any = {
            "options" : {
                "auth" : [],
                "parameters": []
            }
        };

        for (let category in this.outputsTypesForm[this.selectedOutputType]) {
            for (let cpt in this.outputsTypesForm[this.selectedOutputType][category]) {
                let field = this.outputsTypesForm[this.selectedOutputType][category][cpt];
                if (field.isJson) {
                    try {
                        JSON.parse(field.control.value);
                    } catch (error) {
                        field.control.setErrors({'json_error': true});
                        this.notify.error(this.translate.instant('OUTPUT.json_input_erorr', {"field": field.label}));
                        return;
                    }
                }

                _array['options'][category].push({
                    id: field.id,
                    type: field.type,
                    webservice: field.webservice,
                    value: field.value == undefined ? field.control.value : field.value,
                });
            }
        }

        this.http.put(API_URL + '/ws/outputs/update/' + this.outputId, {'args': _array},{headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('OUTPUT.form_updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/verifier/outputs']).then()
                return of(false);
            })
        ).subscribe();
    }

    setAutocompleteValues(cpt: number, array: any) {
        this.outputsTypesForm[this.selectedOutputType]['parameters'][cpt].values = this.sortArrayAlphab(array);
        /**
         * Ces 6 lignes sont obligatoires afin de filter les résultats des champs au fur et à mesure que l'on écrit
         */
        let element = this.outputsTypesForm[this.selectedOutputType]['parameters'][cpt];
        element.filteredOptions = element.control.valueChanges
            .pipe(
                startWith(''),
                map(option => option ? this._filter(option, element.values) : element.values)
            );
    }

    sortArrayAlphab(array: any) {
        return array.sort(function (a:any, b:any) {
            let x = a.value.toUpperCase(),
                y = b.value.toUpperCase();
            return x == y ? 0 : x > y ? 1 : -1;
        });
    }

    testConnection() {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth)) {
            let function_name = this.testConnectionMapping[this.selectedOutputType];
            eval("this." + function_name);
        }
    }
}
