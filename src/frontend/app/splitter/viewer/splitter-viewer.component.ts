/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {API_URL} from "../../env";
import {catchError, debounceTime, delay, filter, finalize, map, takeUntil, tap} from "rxjs/operators";
import {of, ReplaySubject, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "../../../services/local-storage.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";
import {DomSanitizer} from "@angular/platform-browser";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {MatDialog} from "@angular/material/dialog";
import {DocumentTypeComponent} from "../document-type/document-type.component";
import {remove} from 'remove-accents';
import {HistoryService} from "../../../services/history.service";

export interface Batch {
    id: number
    input_id: number
    thumbnail: any
    file_name: string
    page_number: number
    batch_date: string
}

export interface Field {
    id: number
    label_short: string
    label: string
    type: string
    metadata_key: string
    class: string
    required: string
}

@Component({
    selector: 'app-viewer',
    templateUrl: './splitter-viewer.component.html',
    styleUrls: ['./splitter-viewer.component.scss'],
})
export class SplitterViewerComponent implements OnInit, OnDestroy {
    @ViewChild(`cdkStepper`) cdkDropList: CdkDragDrop<any> | undefined;
    fieldsCategories              : any       = {
        'batch_metadata'    : [],
        'document_metadata' : []
    };
    batchForm                   : FormGroup     = new FormGroup({});
    documentMetadataOpenState   : boolean       = false;
    showZoomPage                : boolean       = false;
    loading                     : boolean       = true;
    addDocumentLoading          : boolean       = false;
    documentsLoading            : boolean       = false;
    batchMetadataOpenState      : boolean       = true;
    currentBatch                : any           = {
        id                  : -1,
        inputId             : -1,
        maxSplitIndex       : 0,
        selectedPagesCount  : 0,
    };
    selectedDocument            : any           = {id: '', displayOrder: 0};
    batchMetadataValues         : any           = {};
    documentsForms              : FormGroup[]   = [];
    batches                     : Batch[]       = [];
    deletedPagesIds             : number[]      = [];
    rotatedPages                : any[]         = [];
    movedPages                  : any[]         = [];
    deletedDocumentsIds         : number[]      = [];
    outputs                     : any           = [];
    metadata                    : any[]         = [];
    documents                   : any           = [];
    pagesImageUrls              : any           = [];
    documentsIds                : string[]      = [];
    zoomPage                    : any           = {
        thumbnail    : "",
        rotation     : 0,
    };
    toolSelectedOption          : string        = "";
    inputMode                   : string        = "Manual";
    defaultDoctype              : any           = {
        label   : null,
        key     : null
    };
    defaultDocType              : any;

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
        private localeStorageService: LocalStorageService,
    ) {}

    ngOnInit(): void {
        this.localeStorageService.save('splitter_or_verifier', 'splitter');
        this.userService.user   = this.userService.getUserFromLocal();
        this.currentBatch.id    = this.route.snapshot.params['id'];
        this.loadBatches();
        this.loadSelectedBatch();
        this.loadMetadata();
        this.translate.get('HISTORY-DESC.viewer_splitter', {batch_id: this.currentBatch.id}).subscribe((translated: string) => {
            this.historyService.addHistory('splitter', 'viewer', translated);
        });
    }

    loadSelectedBatch(): void {
        this.documents      = [];
        this.documentsForms = [];
        this.loadBatchById();
    }

    loadBatchById(): void {
        this.loading = true;
        this.http.get(API_URL + '/ws/splitter/batches/' + this.currentBatch.id, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.currentBatch = {
                    id                 : data.batches[0]['id'],
                    formId             : data.batches[0]['form_id'],
                    customFieldsValues : data.batches[0]['data'].hasOwnProperty('custom_fields') ? data.batches[0]['data']['custom_fields'] : {},
                    selectedPagesCount : 0,
                    maxSplitIndex      : 0,
                };
                this.loadFormFields();
                this.loadDocuments();
                this.loadDefaultDocType();
                this.loadOutputsData();
            }),
            catchError((err: any) => {
                this.loading = false;
                this.notify.error(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    loadOutputsData(): void {
        this.loading = true;
        this.outputs = [];
        this.http.get(API_URL + '/ws/forms/getById/' + this.currentBatch.formId, {headers: this.authService.headers}).pipe(
            tap((formData: any) => {
                for(const outputsId of formData['outputs']) {
                    this.http.get(API_URL + '/ws/outputs/getById/' + outputsId, {headers: this.authService.headers}).pipe(
                        tap((outputsData: any) => {
                            this.outputs.push(outputsData['output_label']);
                        }),
                        catchError((err: any) => {
                            this.loading = false;
                            this.notify.error(err);
                            console.debug(err);
                            return of(false);
                        })
                    ).subscribe();
                }
            }),
            catchError((err: any) => {
                this.loading = false;
                this.notify.error(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    loadBatches(): void {
        this.http.get(API_URL + '/ws/splitter/batches/0/5/None/NEW', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.batches.forEach((batch: Batch) =>
                    this.batches.push(
                        {
                            id          : batch.id,
                            thumbnail   : this.sanitize(batch.thumbnail),
                            file_name   : batch.file_name,
                            page_number : batch.page_number,
                            batch_date  : batch.batch_date,
                            input_id    : batch.input_id,
                        }
                    )
                );
            }),
            catchError((err: any) => {
                this.notify.error(err);
                return of(false);
            })
        ).subscribe();
    }

    loadDocuments(): void {
        this.documentsLoading = true;
        this.http.get(API_URL + '/ws/splitter/documents/' + this.currentBatch.id, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                for (let i = 0; i < data['documents'].length; i++) {
                    // -- Add documents metadata --
                    this.documents[i] = {
                        id                  : "document-" + data['documents'][i]['id'],
                        documentTypeName    : data['documents'][i]['doctype_label'] ? data['documents'][i]['doctype_label'] : (this.defaultDoctype.label || ""),
                        documentTypeKey     : data['documents'][i]['doctype_key'] ? data['documents'][i]['doctype_key'] : (this.defaultDoctype.label || ""),
                        status              : data['documents'][i]['status'],
                        splitIndex          : data['documents'][i]['split_index'],
                        pages               : [],
                        class               : "",
                        customFieldsValues  : {},
                    };
                    // -- Get max split index, used when adding a new document --
                    if (this.documents[i].splitIndex > this.currentBatch.maxSplitIndex) {
                        this.currentBatch.maxSplitIndex = this.documents[i].splitIndex;
                    }
                    if (data['documents'][i]['data'].hasOwnProperty('custom_fields')) {
                        this.documents[i].customFieldsValues = data['documents'][i]['data']['custom_fields'];
                    }
                    // -- Add documents pages --
                    for (const page of data['documents'][i]['pages']) {
                        this.documents[i].pages.push({
                            id              : page['id'],
                            sourcePage      : page['source_page'],
                            thumbnail       : this.sanitize(page['thumbnail']),
                            showZoomButton  : false,
                            checkBox        : false,
                            rotation        : page['rotation'],
                        });
                    }
                }
                // -- Add document forms --
                this.loadDocumentsForms();
                this.documentsLoading = false;
            }),
            catchError((err: any) => {
                this.notify.error(err);
                console.debug(err);
                this.documentsLoading = false;
                return of(false);
            })
        ).subscribe();
    }

    createDocument() {
        if(this.addDocumentLoading) { return; }
        this.http.post(API_URL + '/ws/splitter/addDocument',
            {
                'batchId'       : this.currentBatch.id,
                'splitIndex'    : this.currentBatch.maxSplitIndex + 1,
            },
            {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.documents.push({
                    id                  : "document-" + data.newDocumentId,
                    status              : "NEW",
                    documentTypeName    : this.defaultDoctype.label,
                    documentTypeKey     : this.defaultDoctype.key,
                    pages               : [],
                    customFieldsValues  : {},
                    class               : "",
                });
                this.addFormForDocument({}, this.documents.length);
                this.currentBatch.maxSplitIndex++;
                this.addDocumentLoading = false;
            }),
            catchError((err: any) => {
                this.addDocumentLoading = false;
                this.notify.error(err.message);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    loadDocumentsForms() {
        let cpt = 0;
        this.documentsForms = [];
        for (const document of this.documents) {
            this.addFormForDocument(document.customFieldsValues, cpt);
            cpt++;
        }
    }

    addFormForDocument(customFieldsValues: any, documentIndex: number) {
        const newForm = new FormGroup({});
        for (let fieldsIndex = 0; fieldsIndex < this.fieldsCategories['document_metadata'].length; fieldsIndex++) {
            const control = new FormControl();
            const labelShort = this.fieldsCategories['document_metadata'][fieldsIndex].label_short;
            if(customFieldsValues.hasOwnProperty(labelShort))
                control.setValue(customFieldsValues[labelShort]);
            control.valueChanges.subscribe(value => {
                this.documents[documentIndex]['customFieldsValues'][labelShort] = value;
            });
            newForm.addControl(labelShort, control);
            if (this.fieldsCategories['document_metadata'][fieldsIndex].metadata_key) { // used to control autocomplete search fields
                const controlSearch = new FormControl();
                newForm.addControl("search_" + labelShort, controlSearch);
            }
        }
        this.documentsForms.push(newForm);
    }

    getPageUrlById(pageId: number): any {
        for (const pageImage of this.pagesImageUrls) {
            if (pageImage.pageId === pageId)
                return pageImage.url;
        }
        return "";
    }

    getZoomPage(page: any) {
        this.showZoomPage = true;
        this.zoomPage = {
            pageId      : page.id,
            thumbnail   : page.thumbnail,
            rotation    : page.rotation,
        };
    }
    /* -- Metadata -- */
    loadDefaultDocType() {
        this.loading      = true;
        this.http.get(API_URL + '/ws/doctypes/list/' + (this.currentBatch.formId).toString(), {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.doctypes.forEach((doctype: {
                        id          : any
                        key         : string
                        label       : string
                        type        : string
                        is_default  : boolean
                    }) => {
                        if(doctype.is_default && doctype.type === 'document') {
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

    changeInputMode($event: any) {
        this.inputMode = $event.checked ? "Auto" : "Manual";
        this.batchMetadataValues = null;
        this.fillDataValues({});
    }

    fillDataValues(data: any): void {
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
            for (let i = 0; i < this.documentsForms.length; i++) {
                if (key && this.documentsForms[i].get(key)) {
                    this.documentsForms[i].get(key)?.setValue(newValue);
                }
            }
        }
    }

    loadReferential(): void {
        this.http.get(API_URL + '/ws/splitter/referential', {headers: this.authService.headers}).pipe(
            tap(() => {
                this.loadMetadata();
            }),
            catchError((err: any) => {
                this.notify.error(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    loadMetadata(): void {
        this.metadata = [];
        this.http.get(API_URL + '/ws/splitter/metadata', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let cpt = 0;
                data.metadata.forEach((metadataItem: any) => {
                    metadataItem.data['id'] = cpt;
                    this.metadata.push(metadataItem.data);
                    cpt++;
                });
                this.notify.success(this.translate.instant('SPLITTER.referential_updated'));
            }),
            catchError((data: any) => {
                this.notify.error(data['message']);
                return of(false);
            })
        ).subscribe();
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    fillData(selectedMetadata: any) {
        this.batchMetadataValues = selectedMetadata;
        const optionId = this.batchMetadataValues['id'];
        for (const field of this.fieldsCategories['batch_metadata']) {
            if (field['metadata_key']) {
                this.batchForm.get(field['metadata_key'])?.setValue(optionId);
            }
        }
    }

    loadFormFields() {
        this.http.get(API_URL + '/ws/forms/fields/getByFormId/' + this.currentBatch.formId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                for (const fieldCategory in this.fieldsCategories) {
                    this.fieldsCategories[fieldCategory] = [];
                    if(data.fields.hasOwnProperty(fieldCategory)) {
                        data.fields[fieldCategory].forEach((field: Field) => {
                            this.fieldsCategories[fieldCategory].push({
                                'id'            : field.id,
                                'label_short'   : field.label_short,
                                'label'         : field.label,
                                'type'          : field.type,
                                'metadata_key'  : field.metadata_key,
                                'class'         : field.class,
                                'required'      : field.required,
                            });
                        });
                    }
                }
                this.batchForm = this.toBatchFormGroup();

                // listen for search field value changes
                for (const fieldCategory in this.fieldsCategories) {
                    if(data.fields.hasOwnProperty(fieldCategory)) {
                        data.fields[fieldCategory].forEach((field: Field) => {
                            if (field.metadata_key && this.batchForm.get('search_' + field.label_short)) {
                                this.batchForm.get('search_' + field.label_short)?.valueChanges
                                    .pipe(
                                        filter((search: string) => !!search),
                                        tap(() => {
                                        }),
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
                this.notify.error(err);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    toBatchFormGroup() {
        const group: any = {};
        this.fieldsCategories['batch_metadata'].forEach((input: Field) => {
            group[input.label_short] = input.required ?
                new FormControl('', Validators.required) :
                new FormControl('');
            if(this.currentBatch.customFieldsValues.hasOwnProperty(input.label_short)) {
                group[input.label_short].setValue(this.currentBatch.customFieldsValues[input.label_short]);
            }
            if (input.metadata_key)
                group['search_' + input.label_short] = new FormControl('');
        });
        return new FormGroup(group);
    }
    /* -- End Metadata -- */

    /* -- Begin documents control -- */
    addId(id: string) {
        if (!this.documentsIds.includes(id))
            this.documentsIds.push(id);
        return id;
    }

    sanitize(url: string) {
        return this._sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
    }

    drop(event: CdkDragDrop<any[]>, document: any) {
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

    openDocumentTypeDialog(document: any): void {
        const dialogRef = this.dialog.open(DocumentTypeComponent, {
            width: '800px',
            height: '900px',
            data: {
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
            }
        });
    }

    selectDocument(document: any){
        this.selectedDocument = {'id': document.id, 'documentOrder': 0};
    }

    deleteDocument(documentIndex: number) {
        this.deletedDocumentsIds.push(this.documents[documentIndex].id);
        this.documents = this.deleteItemFromList(this.documents, documentIndex);
    }
    /* End documents control */

    /* Begin tools bar */
    deleteItemFromList(list: any[], index: number) {
        delete list[index];
        list = list.filter((x: any): x is any => x !== null);
        return list;
    }

    countSelectedPages(){
        console.log("countSelectedPages()...");
        let selectedPageCount = 0;
        for (const document of this.documents) {
            for (const page of document.pages) {
                console.log(page.checkBox);
                if (page.checkBox) {
                    selectedPageCount++;
                }
            }
        }
        this.currentBatch.selectedPagesCount = selectedPageCount;
    }

    deleteSelectedPages() {
        for (const document of this.documents) {
            for (let pageIndex = 0; pageIndex < document.pages.length; pageIndex++) {
                if (document.pages[pageIndex].checkBox) {
                    this.deletedPagesIds.push(document.pages[pageIndex].id);
                    document.pages = this.deleteItemFromList(document.pages, pageIndex);
                    pageIndex--;
                }
            }
        }
    }

    setAllPagesTo(check: boolean) {
        let selectPagesCount = 0;
        for (const document of this.documents) {
            for (const page of document.pages) {
                page.checkBox = check;
                selectPagesCount++;
            }
        }
        this.currentBatch.selectedPagesCount = check ? selectPagesCount : 0;
    }

    undoAll() {
        this.fieldsCategories['batch_metadata'] = [];
        this.loadSelectedBatch();
        this.loadMetadata();
    }

    rotatePage(documentIndex: number, pageIndex: number){
        const currentDegree = this.documents[documentIndex].pages[pageIndex].rotation;
        switch(currentDegree) {
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

        if(this.zoomPage.pageId === this.documents[documentIndex].pages[pageIndex].id){
            this.zoomPage.rotation = this.documents[documentIndex].pages[pageIndex].rotation;
        }
    }

    rotateSelectedPages() {
        for (let documentIndex = 0; documentIndex < this.documents.length; documentIndex++) {
            for (let pageIndex = 0; pageIndex < this.documents[documentIndex].pages.length; pageIndex++) {
                if (this.documents[documentIndex].pages[pageIndex].checkBox) {
                    this.rotatePage(documentIndex, pageIndex);
                }
            }
        }
    }

    sendSelectedPages() {
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
    }

    changeBatch(id: number) {
        this.loading                            = true;
        this.fieldsCategories['batch_metadata'] = [];
        this.batchMetadataValues                = {};
        this.fillDataValues({});
        this.router.navigate(['splitter/viewer/' + id]).then();
        this.currentBatch.id = id;
        this.loadSelectedBatch();
    }

    validate() {
        this.loading = true;
        if (this.inputMode === 'Manual') {
            for (const field of this.fieldsCategories['batch_metadata']) {
                if (this.batchForm.get(field.label_short)) {
                    this.batchMetadataValues[field.label_short] = this.batchForm.get(field.label_short)?.value;
                }
            }
        }
        for (let documentIndex = 0; documentIndex < this.documents.length; documentIndex++) {
            this.documents[documentIndex]['metadata'] = this.documentsForms[documentIndex].getRawValue();
        }

        for (const document of this.documents) {
            if (!document.documentTypeKey) {
                document.class = "text-red-500";
                this.notify.error(this.translate.instant('SPLITTER.error_no_doc_type'));
                this.loading = false;
                return;
            } else
                document.class = "";
        }

        const batchMetadata             = this.batchMetadataValues;
        batchMetadata['id']             = this.currentBatch.id;
        batchMetadata['userName']       = this.userService.user['username'];
        batchMetadata['userFirstName']  = this.userService.user['firstname'];
        batchMetadata['userLastName']   = this.userService.user['lastname'];
        this.loading = true;
        this.http.post(API_URL + '/ws/splitter/validate',
            {
                'formId'                : this.currentBatch.formId,
                'batchId'               : this.currentBatch.id,
                'documents'             : this.documents,
                'movedPages'            : this.movedPages,
                'deletedPagesIds'       : this.deletedPagesIds,
                'deletedDocumentsIds'   : this.deletedDocumentsIds,
                'batchMetadata'         : batchMetadata,
            },
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.router.navigate(['splitter/list']).then();
                this.notify.success(this.translate.instant('SPLITTER.validate_batch'));
                this.loading = true;
            }),
            catchError((err: any) => {
                this.loading = false;
                this.notify.error(err.message);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    saveInfo() {
        if (this.inputMode === 'Manual') {
            for (const field of this.fieldsCategories['batch_metadata']) {
                if (this.batchForm.get(field.label_short)) {
                    this.batchMetadataValues[field.label_short] = this.batchForm.get(field.label_short)?.value;
                }
            }
        }
        for (let documentIndex = 0; documentIndex < this.documents.length; documentIndex++) {
            this.documents[documentIndex]['metadata'] = this.documentsForms[documentIndex].getRawValue();
        }
        this.http.post(API_URL + '/ws/splitter/saveInfo',
            {
                'documents'             : this.documents,
                'batchId'               : this.currentBatch.id,
                'batchMetadata'         : this.batchMetadataValues,
                'deletedPagesIds'       : this.deletedPagesIds,
                'deletedDocumentsIds'   : this.deletedDocumentsIds,
                'movedPages'            : this.movedPages,
            },
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('SPLITTER.batch_info_saved'));
            }),
            catchError((err: any) => {
                this.loading = false;
                this.notify.error(err.error.message);
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }
    /* -- End tools bar -- */
}
