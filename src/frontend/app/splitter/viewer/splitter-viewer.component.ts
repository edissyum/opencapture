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

 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from  "../../env";
import { catchError, debounceTime, delay, filter, finalize, map, takeUntil, tap } from "rxjs/operators";
import { of, ReplaySubject, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { LocalStorageService } from "../../../services/local-storage.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../../services/auth.service";
import { UserService } from "../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../services/notifications/notifications.service";
import { DomSanitizer } from "@angular/platform-browser";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { MatDialog } from "@angular/material/dialog";
import { DocumentTypeComponent } from "../document-type/document-type.component";
import { remove } from 'remove-accents';
import { HistoryService } from "../../../services/history.service";
import { ConfirmDialogComponent } from "../../../services/confirm-dialog/confirm-dialog.component";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { LocaleService } from "../../../services/locale.service";
import * as moment from "moment";

export interface Field {
    id              : number
    type            : string
    label           : string
    class           : string
    required        : string
    resultMask      : string
    searchMask      : string
    label_short     : string
    metadata_key    : string
    validationMask  : string
    settings        : any
}

@Component({
    selector: 'app-viewer',
    templateUrl: './splitter-viewer.component.html',
    styleUrls: ['./splitter-viewer.component.scss'],
})
export class SplitterViewerComponent implements OnInit, OnDestroy {
    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler($event: any) {
        if (this.isDataEdited) {
            $event.returnValue = true;
        }
    }

    @ViewChild(`cdkStepper`) cdkDropList: CdkDragDrop<any> | undefined;

    loading                     : boolean       = true;
    showZoomPage                : boolean       = false;
    isDataEdited                : boolean       = false;
    isBatchOnDrag               : boolean       = false;
    batchesLoading              : boolean       = false;
    validateLoading             : boolean       = false;
    downloadLoading             : boolean       = false;
    saveInfosLoading            : boolean       = false;
    documentsLoading            : boolean       = false;
    addDocumentLoading          : boolean       = false;
    isMouseInDocumentList       : boolean       = false;
    batchMetadataOpenState      : boolean       = true;
    documentMetadataOpenState   : boolean       = false;
    batchForm                   : FormGroup     = new FormGroup({});
    batches                     : any[]         = [];
    forms                       : any[]         = [];
    status                      : any[]         = [];
    outputs                     : any[]         = [];
    metadata                    : any[]         = [];
    documents                   : any[]         = [];
    movedPages                  : any[]         = [];
    deletedPagesIds             : number[]      = [];
    deletedDocumentsIds         : number[]      = [];
    DropListDocumentsIds        : string[]      = [];
    batchMetadataValues         : any           = {};
    inputMode                   : string        = "Manual";
    currentTime                 : string        = "";
    toolSelectedOption          : string        = "";
    timeLabels                  : any           = {
        'today'     : marker('BATCH.today'),
        'yesterday' : marker('BATCH.yesterday'),
        'older'     : marker('BATCH.older'),
    };
    defaultDoctype              : any           = {
        label       : null,
        key         : null,
    };
    zoomPage                    : any           = {
        thumbnail   : "",
        rotation    : 0,
    };
    currentBatch                : any           = {
        id                  : -1,
        formId              : -1,
        inputId             : -1,
        pageIdInLoad        : -1,
        previousFormId      : -1,
        status              : '',
        maxSplitIndex       : 0,
        selectedPagesCount  : 0,
        selectedDocument    : {
            id              : '',
            displayOrder    : -1,
        },
    };
    fieldsCategories            : any           = {
        'batch_metadata'    : [],
        'document_metadata' : []
    };

    /** indicate search operation is in progress */
    public searching        : boolean   = false;

    /** list of banks filtered after simulating server side search */
    public filteredServerSideMetadata: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    /** Subject that emits when the component has been destroyed. */
    protected _onDestroy = new Subject<void>();

    constructor(
        private router: Router,
        public dialog: MatDialog,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private _sanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        public localeService: LocaleService,
        private localStorageService: LocalStorageService,
    ) {}

    ngOnInit(): void {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        this.localStorageService.save('splitter_or_verifier', 'splitter');
        this.userService.user   = this.userService.getUserFromLocal();
        this.currentBatch.id    = this.route.snapshot.params['id'];
        this.currentTime        = this.route.snapshot.params['currentTime'];
        this.loadSelectedBatch();
        this.updateBatchLock();
        this.translate.get('HISTORY-DESC.viewer_splitter', {batch_id: this.currentBatch.id}).subscribe((translated: string) => {
            this.historyService.addHistory('splitter', 'viewer', translated);
        });
    }

    setValuesFromSavedMetadata(autocompletionValue: any): void {
        for (const field of this.fieldsCategories['batch_metadata']) {
            if (this.currentBatch.customFieldsValues.hasOwnProperty(field['label_short'])) {
                const savedValue = this.currentBatch.customFieldsValues[field['label_short']];
                if (autocompletionValue.hasOwnProperty(field['label_short'])
                    && autocompletionValue[field['label_short']] !== savedValue) {
                    this.batchMetadataValues[field['label_short']] = savedValue;
                    this.batchForm.controls[field['label_short']].setValue(savedValue);
                }
            }
        }
    }

    updateBatchLock() {
        this.http.post(environment['url'] + '/ws/splitter/lockBatch', {
                'batchId' : this.currentBatch.id,
                'lockedBy': this.userService.user.username
            }, {headers: this.authService.headers}).pipe(
            catchError((err: any) => {
                this.loading = false;
                this.notify.handleErrors(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    loadSelectedBatch(): void {
        this.defaultDoctype = {};
        this.documents      = [];
        this.loadBatchById();
    }

    loadBatchById(): void {
        this.http.post(environment['url'] + '/ws/splitter/batches/list', {
                'batchId': this.currentBatch.id,
                'userId': this.userService.user.id
            },
            {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.currentBatch = {
                    id                  : data.batches[0]['id'],
                    status              : data.batches[0]['status'],
                    formId              : data.batches[0]['form_id'],
                    previousFormId      : data.batches[0]['form_id'],
                    customFieldsValues  : data.batches[0]['data'].hasOwnProperty('custom_fields') ? data.batches[0]['data']['custom_fields'] : {},
                    selectedPagesCount  : 0,
                    maxSplitIndex       : 0,
                    selectedDocument    : {
                        id           : '',
                        displayOrder : -1,
                    }
                };
                this.loadForms();
                this.loadBatches();
                this.loadStatus();
                this.loadFormFields();
                this.loadDocuments();
                this.loadDefaultDocType();
                this.loadOutputsData();
                this.loadReferentialOnView();
            }),
            catchError((err: any) => {
                this.loading = false;
                this.notify.handleErrors(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    getStatusLabel(statusId: string) {
        const statusFound = this.status.find(status => status.id === statusId);
        return statusFound ? statusFound.label : undefined;
    }

    loadStatus(): void {
        this.http.get(environment['url'] + '/ws/status/splitter/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.status = data.status;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadOutputsData(): void {
        this.loading = true;
        this.outputs = [];
        this.http.get(environment['url'] + '/ws/forms/splitter/getById/' + this.currentBatch.formId, {headers: this.authService.headers}).pipe(
            tap((formData: any) => {
                for (const outputsId of formData['outputs']) {
                    this.http.get(environment['url'] + '/ws/outputs/splitter/getById/' + outputsId, {headers: this.authService.headers}).pipe(
                        tap((outputsData: any) => {
                            this.outputs.push(outputsData['output_label']);
                        }),
                        catchError((err: any) => {
                            this.loading = false;
                            this.notify.handleErrors(err);
                            console.debug(err);
                            return of(false);
                        })
                    ).subscribe();
                }
            }),
            catchError((err: any) => {
                this.loading = false;
                this.notify.handleErrors(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    loadBatches(): void {
        this.batchesLoading = true;
        this.batches        = [];
        this.loading        = true;

        this.http.post(environment['url'] + '/ws/splitter/batches/list', {
            'page': 0,
            'size': 10,
            'time': this.currentTime,
            'userId': this.userService.user.id,
            'status': this.currentBatch.status,
        }, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.batches.forEach((batch: any) =>
                    this.batches.push({
                        id             : batch['id'],
                        inputId        : batch['input_id'],
                        fileName       : batch['file_name'],
                        formLabel      : batch['form_label'],
                        date           : batch['batch_date'],
                        customerName   : batch['customer_name'],
                        documentsCount : batch['documents_count'],
                        thumbnail      : this.sanitize(batch['thumbnail']),
                    })
                );

                // Move current batch to the top of the list
                const currentBatchIndex = this.batches.findIndex((batch: any) => batch.id === this.currentBatch.id);
                if (currentBatchIndex > -1) {
                    this.batches.unshift(this.batches.splice(currentBatchIndex, 1)[0]);
                } else {
                    this.batches.unshift({
                        id             : this.currentBatch.id,
                        inputId        : this.currentBatch.inputId,
                        fileName       : this.currentBatch.fileName,
                        formLabel      : this.currentBatch.formLabel,
                        date           : this.currentBatch.date,
                        customerName   : this.currentBatch.customerName,
                        documentsCount : this.currentBatch.documentsCount,
                        thumbnail      : this.sanitize(this.currentBatch.thumbnail),
                    });
                }

                this.batchesLoading = false;
            }),
            catchError((err: any) => {
                this.batchesLoading = false;
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadDocuments(): void {
        this.documentsLoading = true;
        this.http.get(environment['url'] + '/ws/splitter/documents/' + this.currentBatch.id, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                for (let documentIndex = 0; documentIndex < data['documents'].length; documentIndex++) {
                    // -- Add documents metadata --
                    this.documents[documentIndex] = {
                        id                 : "document-" + data['documents'][documentIndex]['id'],
                        documentTypeName   : data['documents'][documentIndex]['doctype_label'] ? data['documents'][documentIndex]['doctype_label'] : (this.defaultDoctype.label || ""),
                        documentTypeKey    : data['documents'][documentIndex]['doctype_key'] ? data['documents'][documentIndex]['doctype_key'] : (this.defaultDoctype.label || ""),
                        status             : data['documents'][documentIndex]['status'],
                        splitIndex         : data['documents'][documentIndex]['split_index'],
                        displayOrder       : data['documents'][documentIndex]['display_order'],
                        pages              : [],
                        class              : "",
                        customFieldsValues : {},
                    };
                    // -- Get max split index, used when adding a new document --
                    if (this.documents[documentIndex].splitIndex > this.currentBatch.maxSplitIndex) {
                        this.currentBatch.maxSplitIndex = this.documents[documentIndex].splitIndex;
                    }
                    if (data['documents'][documentIndex]['data'].hasOwnProperty('custom_fields')) {
                        this.documents[documentIndex].customFieldsValues = data['documents'][documentIndex]['data']['custom_fields'];
                    }
                    // -- Add document forms --
                    this.documents[documentIndex].form = this.getFormForDocument(documentIndex);
                    // -- Add documents pages --
                    for (const page of data['documents'][documentIndex]['pages']) {
                        this.documents[documentIndex].pages.push({
                            id             : page['id'],
                            sourcePage     : page['source_page'],
                            thumbnail      : this.sanitize(page['thumbnail']),
                            showZoomButton : false,
                            checkBox       : false,
                            rotation       : page['rotation'],
                        });
                    }
                }
                // -- Select first document --
                this.selectDocument(this.documents[0]);
                this.documentsLoading = false;
            }),
            catchError((err: any) => {
                this.notify.handleErrors(err);
                console.debug(err);
                this.documentsLoading = false;
                return of(false);
            })
        ).subscribe();
    }

    updateDocumentDisplayOrder() {
        const updatedDocuments = [];
        for (const document of this.documents) {
            const currentDisplayOrder   = document.displayOrder;
            const newDisplayOrder       = currentDisplayOrder + 1;
            if (currentDisplayOrder > this.currentBatch.selectedDocument.displayOrder) {
                document.displayOrder = newDisplayOrder;
                updatedDocuments.push({
                    'id': Number(document.id.split('-').pop()),
                    'displayOrder': newDisplayOrder
                });
            }
        }
        return updatedDocuments;
    }

    sortDocumentsByDisplayOrder() {
        this.documents.sort((a:any, b:any) => (a.displayOrder > b.displayOrder) ? 1 : -1);
    }

    createDocument() {
        if (this.addDocumentLoading) { return; }
        this.isDataEdited = true;
        const documentDisplayOrder  = this.updateDocumentDisplayOrder();
        this.addDocumentLoading = true;
        this.http.post(environment['url'] + '/ws/splitter/addDocument',
            {
                'batchId'           : this.currentBatch.id,
                'splitIndex'        : this.currentBatch.maxSplitIndex + 1,
                'displayOrder'      : this.currentBatch.selectedDocument.displayOrder + 1,
                'updatedDocuments'  : documentDisplayOrder
            },
            {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                const newId = `document-${data.newDocumentId}`;
                this.documents.push({
                    id                 : newId,
                    documentTypeName   : this.defaultDoctype.label,
                    documentTypeKey    : this.defaultDoctype.key,
                    splitIndex         : this.currentBatch.maxSplitIndex + 1,
                    displayOrder       : this.currentBatch.selectedDocument.displayOrder + 1,
                    status             : "NEW",
                    pages              : [],
                    customFieldsValues : {},
                    class              : "",
                });
                this.documents[this.documents.length - 1].form = this.getFormForDocument(this.documents.length - 1);
                this.sortDocumentsByDisplayOrder();
                this.currentBatch.maxSplitIndex++;
                this.addDocumentLoading = false;
                this.notify.success(this.translate.instant('SPLITTER.document_added_with_success'));
            }),
            catchError((err: any) => {
                this.addDocumentLoading = false;
                this.notify.handleErrors(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    getFormForDocument(documentIndex: number) {
        const newForm = new FormGroup({});
        for (const field of this.fieldsCategories['document_metadata']) {
            const control = field.required ? new FormControl('', Validators.required) : new FormControl('');
            const labelShort = field.label_short;
            if (this.documents[documentIndex]['customFieldsValues'].hasOwnProperty(labelShort))
                control.setValue(this.documents[documentIndex]['customFieldsValues'][labelShort]);
            control.valueChanges.subscribe(value => {
                this.documents[documentIndex]['customFieldsValues'][labelShort] = value;
            });
            newForm.addControl(labelShort, control);
            if (field.metadata_key) { // used to control autocomplete search fields
                const controlSearch = new FormControl('');
                newForm.addControl("search_" + labelShort, controlSearch);
            }
        }
        return newForm;
    }

    getZoomPage(page: any) {
        this.currentBatch.pageIdInLoad = page.id;
        this.http.get(environment['url'] + '/ws/splitter/pages/' + (page.id).toString() + '/fullThumbnail', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.showZoomPage = true;
                this.zoomPage = {
                    pageId    : page.id,
                    rotation  : page.rotation,
                    thumbnail : this.sanitize(data['fullThumbnail']),
                };
                this.currentBatch.pageIdInLoad = -1;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.currentBatch.pageIdInLoad = -1;
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    /* -- Metadata -- */
    loadDefaultDocType() {
        this.loading      = true;
        this.http.get(environment['url'] + '/ws/doctypes/list/' + (this.currentBatch.formId).toString(), {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.doctypes.forEach((doctype: {
                        id         : any
                        key        : string
                        type       : string
                        label      : string
                        is_default : boolean
                    }) => {
                        if (doctype.is_default && doctype.type === 'document') {
                            this.defaultDoctype = {
                                'id'        : doctype.id,
                                'key'       : doctype.key,
                                'label'     : doctype.label,
                                'type'      : doctype.type,
                                'isDefault' : doctype.is_default,
                            };
                        }
                    }
                );
                this.loading = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.loading = false;
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getPlaceholderFromResultMask(mask: string, metadata: any) {
        const maskVariables = mask ? mask.split('#') : [];
        const result        = [];
        for (const maskVariable of maskVariables!) {
            result.push(metadata.hasOwnProperty(maskVariable) ? metadata[maskVariable] : maskVariable);
        }
        return result.join(' ');
    }

    getPlaceholderFromSearchMask(mask: string, label: string) {
        return mask ? mask.replace('#label', label) : '';
    }

    changeInputMode($event: any) {
        this.inputMode = $event.checked ? "Auto" : "Manual";
        this.batchMetadataValues = {};
        this.fillDataValues({});
    }

    fillDataValues(data: any): void {
        this.isDataEdited = true;
        for (const field of this.fieldsCategories['batch_metadata']) {
            const key = field['metadata_key'];
            const newValue = data.hasOwnProperty(key) ? data[key] : '';
            if (key && this.batchForm.get(key)) {
                this.batchForm.get(key)?.setValue(newValue);
            }
        }
        for (const field of this.fieldsCategories['document_metadata']) {
            const key = field['metadata_key'];
            const newValue = data.hasOwnProperty(key) ? data[key] : '';
            for (const document of this.documents) {
                if (key && document.form.get(key)) {
                    document.form.get(key)?.setValue(newValue);
                }
            }
        }
    }

    loadReferentialOnView(): void {
        this.http.get(environment['url'] + `/ws/splitter/metadataMethods/${this.currentBatch.formId}`, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.metadataMethods[0].callOnSplitterView) {
                    this.loadReferential(false);
                }
            }),
            catchError((err: any) => {
                this.loading = false;
                this.notify.handleErrors(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    loadReferentialWithConfirmation(refreshAfterLoad: boolean): void {
        this.metadata = [];
        this.http.get(environment['url'] + `/ws/splitter/loadReferential/${this.currentBatch.formId}`, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.metadata.forEach((metadataItem: any) => {
                    metadataItem.data['metadataId'] = metadataItem.id;
                    this.metadata.push(metadataItem.data);
                });
                if (this.currentBatch.customFieldsValues.hasOwnProperty('metadataId')) {
                    const autocompletionValue = this.metadata.filter(item => item.metadataId === this.currentBatch.customFieldsValues.metadataId);
                    if (autocompletionValue.length > 0) {
                        this.filteredServerSideMetadata.next(autocompletionValue);
                        this.fillData((autocompletionValue[0]));
                        this.setValuesFromSavedMetadata(autocompletionValue[0]);
                    }
                }
                if (refreshAfterLoad) {
                    this.loadSelectedBatch();
                }
                this.notify.success(this.translate.instant('SPLITTER.referential_updated'));
            }),
            catchError((err: any) => {
                this.loading = false;
                this.notify.handleErrors(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    loadReferential(refreshAfterLoad: boolean): void {
        if (this.isDataEdited) {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                data:{
                    confirmTitle       : this.translate.instant('GLOBAL.confirm'),
                    confirmText        : this.translate.instant('SPLITTER.refresh_without_saving_modifications'),
                    confirmButton      : this.translate.instant('SPLITTER.refresh_without_saving'),
                    confirmButtonColor : "warn",
                    cancelButton       : this.translate.instant('GLOBAL.cancel')
                },
                width: "600px"
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.loadReferentialWithConfirmation(refreshAfterLoad);
                }
            });
        } else {
            this.loadReferentialWithConfirmation(refreshAfterLoad);
        }
    }

    setValueChange(key: string, value: string) {
        this.isDataEdited = true;
        this.batchMetadataValues[key] = value;
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    fillData(selectedMetadata: any) {
        this.batchMetadataValues = selectedMetadata;
        const optionId = this.batchMetadataValues['metadataId'];
        for (const field of this.fieldsCategories['batch_metadata']) {
            if (field['metadata_key']) {
                if (field.type === 'select' && selectedMetadata[field['metadata_key']]) {
                    this.batchForm.get(field['metadata_key'])?.setValue(selectedMetadata[field['metadata_key']]);
                }
                else {
                    this.batchForm.get(field['metadata_key'])?.setValue(optionId);
                }
            }
        }
    }

    loadForms() {
        this.forms = [];
        this.http.get(environment['url'] + '/ws/forms/splitter/list?user_id=' + this.userService.user.id, {headers: this.authService.headers}).pipe(
            tap((forms: any) => {
                this.forms = forms.forms;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    onFormChange(newFormId: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle       : this.translate.instant('GLOBAL.confirm'),
                confirmText        : this.translate.instant('GLOBAL.confirm_form_change'),
                confirmButton      : this.translate.instant('GLOBAL.confirm_modification'),
                confirmButtonColor : "green",
                cancelButton       : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading = true;
                this.http.post(environment['url'] + '/ws/splitter/changeForm',
                    {
                        'batchId' : this.currentBatch.id,
                        'formId'  : newFormId,
                    },
                    {headers: this.authService.headers}).pipe(
                    tap(() => {
                        this.notify.success(this.translate.instant('SPLITTER.barch_form_change_success'));
                        this.translate.get('HISTORY-DESC.change_batch_form',
                            {
                                batch_id : this.currentBatch.id,
                                form_id  : newFormId
                            })
                            .subscribe((translated: string) => {
                            this.historyService.addHistory('splitter', 'viewer', translated);
                        });
                        this.loadSelectedBatch();
                    }),
                    catchError((err: any) => {
                        this.loading = false;
                        this.notify.handleErrors(err);
                        console.debug(err);
                        return of(false);
                    })
                ).subscribe();
            } else {
                this.currentBatch.formId = this.currentBatch.previousFormId;
            }
        });
    }

    loadFormFields(): void {
        this.http.get(environment['url'] + '/ws/forms/fields/getByFormId/' + this.currentBatch.formId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                for (const fieldCategory in this.fieldsCategories) {
                    this.fieldsCategories[fieldCategory] = [];
                    if (data.fields.hasOwnProperty(fieldCategory)) {
                        data.fields[fieldCategory].forEach((field: Field) => {
                            this.fieldsCategories[fieldCategory].push({
                                'id'             : field.id,
                                'type'           : field.type,
                                'label'          : field.label,
                                'class'          : field.class,
                                'settings'       : field.settings,
                                'required'       : field.required,
                                'searchMask'     : field.searchMask,
                                'resultMask'     : field.resultMask,
                                'label_short'    : field.label_short,
                                'metadata_key'   : field.metadata_key,
                                'validationMask' : field.validationMask,
                            });
                            if (field.metadata_key && fieldCategory === 'batch_metadata') {
                                this.inputMode = 'Auto';
                            }
                        });
                    }
                }
                this.batchForm = this.toBatchFormGroup();

                // listen for search field value changes
                for (const fieldCategory in this.fieldsCategories) {
                    if (data.fields.hasOwnProperty(fieldCategory)) {
                        data.fields[fieldCategory].forEach((field: Field) => {
                            if (field.metadata_key && this.batchForm.get('search_' + field.label_short)) {
                                this.batchForm.get('search_' + field.label_short)?.valueChanges
                                    .pipe(
                                        filter((search: string) => !!search),
                                        tap(() => {}),
                                        takeUntil(this._onDestroy),
                                        debounceTime(200),
                                        map(search => {
                                            if (!this.metadata || search.length < 3) {
                                                return [];
                                            }
                                            this.searching = true;
                                            return this.metadata.filter(
                                                metadataItem => remove(metadataItem[field.label_short].toString())
                                                    .toLowerCase()
                                                    .indexOf(remove(search.toString().toLowerCase())) > -1
                                            );
                                        }),
                                        delay(500)
                                    )
                                    .subscribe(filteredMetadata => {
                                        this.filteredServerSideMetadata.next(filteredMetadata);
                                        this.searching = false;
                                    }, () => {
                                        this.searching = false;
                                    });
                            }
                        });
                    }
                }
            }), finalize(() => this.loading = false),
            catchError((err: any) => {
                this.loading = false;
                this.notify.handleErrors(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    getFormFieldsValues() {
        for (const field of this.fieldsCategories['batch_metadata']) {
            if (this.batchForm.get(field.label_short)) {
                this.batchMetadataValues[field.label_short] = this.batchForm.get(field.label_short)?.value;
                if (field.type === 'date') {
                    this.batchMetadataValues[field.label_short] = moment(this.batchMetadataValues[field.label_short]).format('L');
                }
            }
        }
    }

    toBatchFormGroup():FormGroup {
        const group: any = {};
        const format = moment().localeData().longDateFormat('L');
        this.fieldsCategories['batch_metadata'].forEach((field: Field) => {
            group[field.label_short] = field.required ?
                new FormControl('', Validators.required) :
                new FormControl('');
            if (this.currentBatch.customFieldsValues.hasOwnProperty(field.label_short)) {
                const value = field.type !== 'date' ? this.currentBatch.customFieldsValues[field.label_short] :
                    moment(this.currentBatch.customFieldsValues[field.label_short], format);
                group[field.label_short].setValue(value);
            }
            if (field.metadata_key)
                group['search_' + field.label_short] = new FormControl('');
        });
        return new FormGroup(group);
    }

    downloadOriginalFile(): void {
        this.downloadLoading = true;
        this.http.get(environment['url'] + '/ws/splitter/batch/' + this.currentBatch.id + '/file',
            {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                const src = `data:application/pdf;base64,${data['encodedFile']}`;
                const newWindow = window.open();
                newWindow!.document.write(`<iframe style="width: 100%;height: 100%;margin: 0;padding: 0;" src="${src}" allowfullscreen></iframe>`);
                newWindow!.document.title = data['filename'];
            }),
            finalize(() => this.downloadLoading = false),
            catchError((err: any) => {
                this.downloadLoading = false;
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
    /* -- End Metadata -- */

    /* -- Begin documents control -- */
    addDocumentIdToDropList(id: string): string {
        if (!this.DropListDocumentsIds.includes(id))
            this.DropListDocumentsIds.push(id);
        return id;
    }

    sanitize(url: string): any {
        return this._sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
    }

    dropPage(event: CdkDragDrop<any[]>, document: any): void {
        this.isDataEdited = true;
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
            this.movedPages.push({
                'pageId'        : event.container.data[event.currentIndex].id,
                'newDocumentId' : Number(document['id'].split('-')[1]),
                'isAddInNewDoc' : (document.status === 'USERADD')
            });
        }
    }

    dropDocument(event: CdkDragDrop<string[]>): void {
        this.isDataEdited = true;
        moveItemInArray(this.documents, event.previousIndex, event.currentIndex);
        this.OrderDisplayDocumentValues();
    }

    OrderDisplayDocumentValues(): void {
        let cpt = 1;
        for (const document of this.documents) {
            document.displayOrder = cpt;
            cpt++;
        }
    }

    openDocumentTypeDialog(document: any): void {
        const dialogRef = this.dialog.open(DocumentTypeComponent, {
            width   : '800px',
            height  : '860px',
            data    : {
                selectedDocType: {
                    key: document.documentTypeKey  ? document.documentTypeKey  : "",
                },
                formId: this.currentBatch.formId
            }
        });
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                document.documentTypeName = result.label;
                document.documentTypeKey = result.key;
                this.isDataEdited = true;
            }
        });
    }

    selectDocument(document: any): void {
        this.currentBatch.selectedDocument = {'id': document.id, 'displayOrder': document.displayOrder};
    }

    deleteDocument(documentIndex: number): void {
        const pagesCount = this.documents[documentIndex].pages.length;
        const confirmMessage = pagesCount > 0 ?
            this.translate.instant('SPLITTER.confirm_delete_document_not_empty', {"pagesCount": pagesCount}) :
            this.translate.instant('SPLITTER.confirm_delete_document_empty');

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle       : this.translate.instant('GLOBAL.confirm'),
                confirmText        : confirmMessage,
                confirmButton      : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor : "warn",
                cancelButton       : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deletedDocumentsIds.push(this.documents[documentIndex].id);
                this.documents = this.deleteItemFromList(this.documents, documentIndex);
                this.isDataEdited = true;
            }
        });
    }

    onBatchDrop(batchIdToMerge: number) {
        this.isBatchOnDrag = false;
        if (!this.isMouseInDocumentList) {
            return;
        }
        if (this.isMouseInDocumentList && this.currentBatch.id === batchIdToMerge) {
            this.notify.error(this.translate.instant('SPLITTER.can_not_merge_same_batch'));
            return;
        }
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('SPLITTER.confirm_merge_batches'),
                confirmButton       : this.translate.instant('SPLITTER.merge'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.mergeBatches(batchIdToMerge);
            }
        });
    }

    mergeBatches(batchIdToMerge: number) {
        this.http.post(environment['url'] + '/ws/splitter/merge/' + this.currentBatch.id, {'batches': [batchIdToMerge]}, {headers: this.authService.headers},
        ).pipe(
            tap(() => {
                this.loadSelectedBatch();
                this.notify.success(this.translate.instant('SPLITTER.merge_success'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    dropBatch(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.batches, event.previousIndex, event.currentIndex);
    }
    /* End documents control */

    /* Begin tools bar */
    deleteItemFromList(list: any[], index: number): any[] {
        delete list[index];
        list = list.filter((x: any): x is any => x !== null);
        return list;
    }

    countSelectedPages(): void {
        let selectedPageCount = 0;
        for (const document of this.documents) {
            for (const page of document.pages) {
                page.checkBox ? selectedPageCount++ : '';
            }
        }
        this.currentBatch.selectedPagesCount = selectedPageCount;
    }

    deleteSelectedPages(): void {
        if (this.currentBatch.selectedPagesCount === 0)
            return;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle       : this.translate.instant('GLOBAL.confirm'),
                confirmText        : this.translate.instant('SPLITTER.confirm_delete_pages', {"pagesCount": this.currentBatch.selectedPagesCount}),
                confirmButton      : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor : "warn",
                cancelButton       : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                for (const document of this.documents) {
                    for (let pageIndex = 0; pageIndex < document.pages.length; pageIndex++) {
                        if (document.pages[pageIndex].checkBox) {
                            this.deletedPagesIds.push(document.pages[pageIndex].id);
                            document.pages = this.deleteItemFromList(document.pages, pageIndex);
                            pageIndex--;
                        }
                    }
                }
                this.isDataEdited = true;
            }
        });
    }

    setAllPagesTo(check: boolean): void {
        let selectPagesCount = 0;
        for (const document of this.documents) {
            for (const page of document.pages) {
                page.checkBox = check;
                selectPagesCount++;
            }
        }
        this.currentBatch.selectedPagesCount = check ? selectPagesCount : 0;
    }

    rotatePage(documentIndex: number, pageIndex: number): void {
        const currentDegree = this.documents[documentIndex].pages[pageIndex].rotation;
        this.isDataEdited = true;
        switch (currentDegree) {
            case -90: {
                this.documents[documentIndex].pages[pageIndex].rotation = 0;
                break;
            }
            case 180: {
                this.documents[documentIndex].pages[pageIndex].rotation = -90;
                break;
            }
            default: {
                this.documents[documentIndex].pages[pageIndex].rotation += 90;
                break;
            }
        }

        if (this.zoomPage.pageId === this.documents[documentIndex].pages[pageIndex].id) {
            this.zoomPage.rotation = this.documents[documentIndex].pages[pageIndex].rotation;
        }
    }

    rotateSelectedPages(): void {
        for (let documentIndex = 0; documentIndex < this.documents.length; documentIndex++) {
            for (let pageIndex = 0; pageIndex < this.documents[documentIndex].pages.length; pageIndex++) {
                if (this.documents[documentIndex].pages[pageIndex].checkBox) {
                    this.rotatePage(documentIndex, pageIndex);
                }
            }
        }
    }

    sendSelectedPages(): void {
        const selectedDoc = this.documents.filter((doc: any) => doc.id === this.toolSelectedOption);
        if (!selectedDoc) {
            return;
        }
        const selectedDocIndex = this.documents.indexOf(selectedDoc[0]);
        for (const document of this.documents) {
            for (let i = document.pages.length - 1; i >= 0; i--) {
                if (document.pages[i].checkBox) {
                    const newPosition = this.documents[selectedDocIndex].pages.length;
                    transferArrayItem(document.pages,
                        this.documents[selectedDocIndex].pages, i,
                        newPosition);
                    this.movedPages.push({
                        'pageId'        : this.documents[selectedDocIndex].pages[newPosition].id,
                        'newDocumentId' : Number(this.documents[selectedDocIndex].id.split('-')[1]),
                        'isAddInNewDoc' : (this.documents[selectedDocIndex].status === 'USERADD')
                    });
                }
            }
        }
        this.isDataEdited = true;
    }

    changeBatch(id: number): void {
        this.loading                            = true;
        this.fieldsCategories['batch_metadata'] = [];
        this.batchMetadataValues                = {};
        this.fillDataValues({});
        this.router.navigate(['splitter/viewer/' + this.currentTime + '/' + id]).then();
        this.currentBatch.id = id;
        this.loadSelectedBatch();
        this.isDataEdited = false;
    }

    cancel(): void {
        if (this.isDataEdited) {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                data:{
                    confirmTitle       : this.translate.instant('GLOBAL.confirm'),
                    confirmText        : this.translate.instant('SPLITTER.quit_without_saving_modifications'),
                    confirmButton      : this.translate.instant('SPLITTER.quit_without_saving'),
                    confirmButtonColor : "warn",
                    cancelButton       : this.translate.instant('GLOBAL.cancel'),
                },
                width: "600px"
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.router.navigate(["/splitter/list"]).then();
                }
            });
        }
        else {
            this.router.navigate(["/splitter/list"]).then();
        }
    }

    validateWithConfirmation(): void {
        if (!this.batchForm.valid && this.inputMode === "Manual") {
            this.notify.error(this.translate.instant('SPLITTER.error_empty_document_metadata'));
            this.loading = false;
            return;
        }
        if (this.inputMode === 'Auto' && !this.batchMetadataValues.metadataId && this.fieldsCategories['batch_metadata'].length !== 0) {
            this.notify.error(this.translate.instant('SPLITTER.error_autocomplete_value'));
            return;
        }
        for (const document of this.documents) {
            if (!document.form.valid) {
                this.notify.error(this.translate.instant('SPLITTER.error_empty_document_metadata'));
                this.loading = false;
                return;
            }
            if (!document.documentTypeKey) {
                document.class = "text-red-500";
                this.notify.error(this.translate.instant('SPLITTER.error_no_doc_type'));
                this.loading = false;
                return;
            } else {
                document.class = "";
            }
        }
        this.getFormFieldsValues();
        for (const field of this.fieldsCategories['batch_metadata']) {
            if (field.validationMask) {
                if (!this.batchMetadataValues[field.label_short].match(field.validationMask)) {
                    this.notify.error(this.translate.instant('SPLITTER.field_form_not_respected', {'field': field.label}));
                    this.loading = false;
                    return;
                }
            }
        }

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle       : this.translate.instant('GLOBAL.confirm'),
                confirmText        : this.translate.instant('SPLITTER.confirm_validate'),
                confirmButton      : this.translate.instant('SPLITTER.validate_batch'),
                confirmButtonColor : "green",
                cancelButton       : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.validate();
            }
        });
    }

    validate(): void {
        this.validateLoading = true;
        const batchMetadata             = this.batchMetadataValues;
        batchMetadata['id']             = this.currentBatch.id;
        batchMetadata['userName']       = this.userService.user['username'];
        batchMetadata['userLastName']   = this.userService.user['lastname'];
        batchMetadata['userFirstName']  = this.userService.user['firstname'];

        // Build documents metadata arguments
        const _documents: any[] = [];
        for (const document of this.documents) {
            const _document: any = {
                id               : document['id'],
                displayOrder     : document['displayOrder'],
                documentTypeKey  : document['documentTypeKey'],
                documentTypeName : document['documentTypeName'],
                metadata         : document.form.getRawValue(),
                pages            : []
            };
            for (const page of document.pages) {
                _document.pages.push({
                    id         : page['id'],
                    rotation   : page['rotation'],
                    sourcePage : page['sourcePage']
                });
            }
            _documents.push(_document);
        }
        this.http.post(environment['url'] + '/ws/splitter/validate',
            {
                'documents'           : _documents,
                'batchMetadata'       : batchMetadata,
                'movedPages'          : this.movedPages,
                'batchId'             : this.currentBatch.id,
                'deletedPagesIds'     : this.deletedPagesIds,
                'deletedDocumentsIds' : this.deletedDocumentsIds,
                'formId'              : this.currentBatch.formId
            },
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.translate.get('HISTORY-DESC.validate_splitter', {batch_id: this.currentBatch.id}).subscribe((translated: string) => {
                    this.historyService.addHistory('splitter', 'viewer', translated);
                });
                this.notify.success(this.translate.instant('SPLITTER.validate_batch_success'));
                this.router.navigate(['splitter/list']).then();
            }),
            catchError((err: any) => {
                this.validateLoading = false;
                this.notify.handleErrors(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    saveInfo(): void {
        this.saveInfosLoading   = true;
        this.getFormFieldsValues();

        const _documents        = [];
        for (const document of this.documents) {
            const _document         = Object.assign({}, document);
            _document['metadata']   = document.form.getRawValue();
            delete _document.class;
            delete _document.form;
            _documents.push(_document);
        }

        this.http.post(environment['url'] + '/ws/splitter/saveInfo',
            {
                'documents'           : _documents,
                'movedPages'          : this.movedPages,
                'batchId'             : this.currentBatch.id,
                'deletedPagesIds'     : this.deletedPagesIds,
                'batchMetadata'       : this.batchMetadataValues,
                'deletedDocumentsIds' : this.deletedDocumentsIds
            },
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.saveInfosLoading   = false;
                this.isDataEdited       = false;
                this.notify.success(this.translate.instant('SPLITTER.batch_modification_saved'));
            }),
            catchError((err: any) => {
                this.saveInfosLoading = false;
                this.notify.handleErrors(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }
    /* -- End tools bar -- */
}
