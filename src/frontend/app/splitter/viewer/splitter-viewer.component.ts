/* Open-Capture for Invoices is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Open-Capture is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

@dev : Oussama BRICH <oussama.brich@edissyum.com> */

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
import {DocumentTreeComponent} from "../document-tree/document-tree.component";
import {remove} from 'remove-accents';
import {NgxUiLoaderService} from "ngx-ui-loader";
import {HistoryService} from "../../../services/history.service";

export interface Batch {
    id              : number,
    input_id        : number,
    image_url       : any,
    file_name       : string,
    page_number     : number,
    creation_date   : string,
}

export interface Field {
    id              : number;
    label_short     : string;
    label           : string;
    type            : string;
    metadata_key    : string;
    class           : string;
    required        : string;
}

@Component({
  selector: 'app-viewer',
  templateUrl: './splitter-viewer.component.html',
  styleUrls: ['./splitter-viewer.component.scss'],
})
export class SplitterViewerComponent implements OnInit, OnDestroy{
    @ViewChild(`cdkStepper`) cdkDropList: CdkDragDrop<any> | undefined;
    form: FormGroup                 = new FormGroup({});
    metaDataOpenState: boolean      = true;
    showZoomPage: boolean           = false;
    currentBatch: any               = {id: -1, inputId: -1};
    batches: Batch[]                = [];
    fields: Field[]                 = [];
    documents: any                  = [];
    pagesImageUrls: any             = [];
    documentsIds :string[]          = [];
    metadata: any[]                 = [];
    zoomImageUrl: string            = "";
    toolSelectedOption: string      = "";
    selectedMetadata: any           = {id: -1};
    inputMode: string               = "Manual";
    outputs: any;

    /** indicate search operation is in progress */
    public searching: boolean = false;

    /** list of banks filtered after simulating server side search */
    public  filteredServerSideMetadata: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    /** Subject that emits when the component has been destroyed. */
    protected _onDestroy = new Subject<void>();

    constructor(
        private localeStorageService: LocalStorageService,
        private http                : HttpClient,
        private router              : Router,
        private route               : ActivatedRoute,
        private formBuilder         : FormBuilder,
        private authService         : AuthService,
        public userService          : UserService,
        private translate           : TranslateService,
        private notify              : NotificationService,
        private _sanitizer          : DomSanitizer,
        public dialog               : MatDialog,
        private ngxService          : NgxUiLoaderService,
        private historyService      : HistoryService,
    ) {
    }

    ngOnInit(): void {
        this.userService.user   = this.userService.getUserFromLocal();
        this.currentBatch.id    = this.route.snapshot.params['id'];
        this.loadBatches();
        this.loadSelectedBatch();
        this.loadMetadata();
        this.loadOutputs();
        this.translate.get('HISTORY-DESC.viewer_splitter', {batch_id: this.currentBatch.id}).subscribe((translated: string) => {
            this.historyService.addHistory('splitter', 'viewer', translated);
        });
    }

    loadSelectedBatch(): void{
        this.documents = [];
        this.loadPages();
        this.loadBatchById();
    }

    loadOutputs(): void {
        this.http.get(API_URL + '/ws/outputs/list?module=splitter', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.outputs = data.outputs;
            }),
            finalize(() => {}),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadBatchById(): void{
        let headers = this.authService.headers;
        this.ngxService.startBackground("load-current-batch");
        setTimeout(() => {
          this.ngxService.stopBackground("load-current-batch");
        }, 10000);

        this.http.get(API_URL + '/ws/splitter/batches/' + this.currentBatch.id, {headers}).pipe(
          tap((data: any) => {
            this.currentBatch.formId    = data.batches[0].form_id;
            this.loadFormFields(this.currentBatch.formId);
            this.ngxService.stopBackground("load-current-batch");
          }),
          catchError((err: any) => {
              this.notify.error(err);
              return of(false);
          })
        ).subscribe()
    }

    loadBatches(): void{
        let headers = this.authService.headers;
        this.ngxService.startBackground("load-batch");
        setTimeout(() => {
          this.ngxService.stopBackground("load-batch");
        }, 10000);

        this.http.get(API_URL + '/ws/splitter/batches/0/5', {headers}).pipe(
          tap((data: any) => {
            data.batches.forEach((batch: Batch) =>
                this.batches.push(
                    {
                        id              : batch.id,
                        image_url       : this.sanitize(batch.image_url),
                        file_name       : batch.file_name,
                        page_number     : batch.page_number,
                        creation_date   : batch.creation_date,
                        input_id        : batch.input_id,
                    }
                )
            );
            this.ngxService.stopBackground("load-batch");
          }),
          catchError((err: any) => {
              this.notify.error(err);
              return of(false);
          })
        ).subscribe()
    }

    loadPages(): void{
        this.ngxService.startBackground("load-pages");
        setTimeout(() => {
          this.ngxService.stopBackground("load-pages");
        }, 10000);
        let headers = this.authService.headers;
        this.http.get(API_URL + '/ws/splitter/pages/' + this.currentBatch.id, {headers}).pipe(
          tap((data: any) => {
            for (let i=0; i < data['page_lists'].length; i++) {
                this.documents[i] = {
                    id                  : "document-" + i,
                    documentTypeName    : "Document " + (i + 1),
                    documentTypeKey     : "",
                    pages               : [],
                    class               : "",
                };
                for (let page of data['page_lists'][i]) {
                    this.documents[i].pages.push({
                        id              : page['id'],
                        sourcePage      : page['source_page'],
                        showZoomButton  : false,
                        zoomImage       : false,
                        checkBox        : false,
                    });
                    this.pagesImageUrls.push({
                        pageId          : page['id'],
                        url             : this.sanitize(page['image_url'])
                    });
                }
            }
            this.ngxService.stopBackground("load-pages");
          }),
          catchError((err: any) => {
              this.notify.error(err);
              return of(false);
          })
        ).subscribe();
    }

    getPageUrlById(pageId: number): any{
        for(let pageImage of this.pagesImageUrls){
            if(pageImage.pageId === pageId)
                return pageImage.url;
        }
        return "";
    }

    /* -- Metadata -- */
    changeInputMode($event: any) {
        this.inputMode = $event.checked ? "Auto": "Manual";
        this.selectedMetadata = null;
        this.fillDataValues({});
    }


    fillDataValues(data: any): void{
        for (let field of this.fields) {
            let key = field['metadata_key'];
            let new_value = data.hasOwnProperty(key) ? data[key] : '';
            // @ts-ignore
            this.form.get(key).setValue(new_value);
        }
    }

    loadReferential(): void{
        this.ngxService.startBackground("load-referential");
        setTimeout(() => {
          this.ngxService.stopBackground("load-referential");
        }, 10000);

        let headers = this.authService.headers;
        this.http.get(API_URL + '/ws/splitter/referential', {headers}).pipe(
          tap((data: any) => {
              this.ngxService.stopBackground("load-referential");
              this.loadMetadata();
          }),
          catchError((err: any) => {
              this.notify.error(err);
              return of(false);
          })
        ).subscribe();
    }

    loadMetadata(): void{
        this.ngxService.startBackground("load-metadata");
        this.metadata = []
        setTimeout(() => {
          this.ngxService.stopBackground("load-metadata");
        }, 10000);

        this.metadata   = [];

        let headers     = this.authService.headers;
        this.http.get(API_URL + '/ws/splitter/metadata', {headers}).pipe(
          tap((data: any) => {
            let cpt = 0;
            data.metadata.forEach((metadataItem: any) => {
                metadataItem.data['id'] = cpt;
                this.metadata.push(metadataItem.data);
                cpt++;
            });
            this.ngxService.stopBackground("load-metadata");
            this.notify.success(this.translate.instant('SPLITTER.referential_updated'));
          }),
          catchError((data: any) => {
              this.ngxService.stopBackground("load-metadata");
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
        this.selectedMetadata   = selectedMetadata;
        let optionId            = this.selectedMetadata['id'];
        for (let field of this.fields){
            if (field['metadata_key']){
                // @ts-ignore
                this.form.get(field['metadata_key']).setValue(optionId);
            }
        }
    }

    loadFormFields(formId: number){
        this.ngxService.startBackground("load-custom-fields");
        setTimeout(() => {
          this.ngxService.stopBackground("load-custom-fields");
        }, 10000);

        let headers = this.authService.headers;
        this.http.get(API_URL + '/ws/forms/fields/getByFormId/' + formId,{headers}).pipe(
        tap((data: any) => {
            data.fields.metadata.forEach((field: Field) =>{
                this.fields.push({
                    'id'            : field.id,
                    'label_short'   : field.label_short,
                    'label'         : field.label,
                    'type'          : field.type,
                    'metadata_key'  : field.metadata_key,
                    'class'         : field.class,
                    'required'      : field.required,
                });

                let control             = new FormControl();
                this.form.addControl(field.label_short, control);

                if(field.metadata_key){ // used to control autocomplete search fields
                    let controlSearch   = new FormControl();
                    this.form.addControl("search_" + field.label_short, controlSearch);
                }
            });
            this.form = this.toFormGroup();
            // listen for search field value changes
            // @ts-ignore
            data.fields.metadata.forEach((field: Field) => {
                if(!field.metadata_key)
                    return;
                 // @ts-ignore
                this.form.get('search_' + field.label_short).valueChanges
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
                        this.searching = true
                        // simulate server fetching and filtering data
                        return this.metadata.filter(
                            // @ts-ignore
                            metadataItem => remove(metadataItem[field.label_short].toString())
                                .toLowerCase()
                                .indexOf(remove(search.toString().toLowerCase())) > -1);
                        }),
                    delay(500)
                )
                .subscribe(filteredMetadata => {
                    this.filteredServerSideMetadata.next(filteredMetadata);
                    this.searching = false;
                    },
                error => {
                  // no errors in our simulated example
                  this.searching = false;
                  // handle error...
                });
            });
            this.ngxService.stopBackground("load-custom-fields");
        }),
        catchError((err: any) => {
            console.debug(err);
            return of(false);
        })
        ).subscribe()
    }

    toFormGroup(){
        const group: any = {};
            this.fields.forEach((input: Field) => {
                group[input.label_short] = input.required ?
                        new FormControl('', Validators.required) :
                        new FormControl('');
                if(input.metadata_key)
                    group['search_' + input.label_short] = new FormControl('');
            });
        return new FormGroup(group);
    }
    /* -- End Metadata -- */

    /* -- Begin documents control -- */
    addId(id: string) {
        if(!this.documentsIds.includes(id))
            this.documentsIds.push(id);
        return id;
    }

    sanitize(url:string){
        return this._sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
    }

    drop(event: CdkDragDrop<any[]>) {
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }
        else {
          transferArrayItem(event.previousContainer.data,
                            event.container.data,
                            event.previousIndex,
                            event.currentIndex);
        }
    }

    openDocumentTypeDialog(document: any): void {
        const dialogRef = this.dialog.open(DocumentTreeComponent, {
            width   : '800px',
            height  : '900px',
            data    : {}
        });
        dialogRef.afterClosed().subscribe((result: any) => {
            document.documentTypeName   = result.item;
            document.documentTypeKey    = result.key;
        });
    }

    deleteDocument(documentIndex: number) {
        this.documents = this.deleteItemFromList(this.documents, documentIndex);
    }
    /* End documents control */

    /* Begin tools bar */
    deleteItemFromList(list: any[], index: number){
        delete list[index];
        list = list.filter((x: any): x is any => x !== null);
        return list;
    }

    deleteSelectedPages(){
        for(let document of this.documents){
            for(let i=0; i<document.pages.length; i++){
                if(document.pages[i].checkBox){
                    document.pages = this.deleteItemFromList(document.pages, i);
                    i--;
                }
            }
        }
    }

    setAllPagesTo(check: boolean){
        for(let document of this.documents){
            for(let page of document.pages){
                page.checkBox = check;
            }
        }
    }

    undoAll(){
        this.fields = [];
        this.loadSelectedBatch();
        this.loadMetadata();
    }

    sendSelectedPages(){
        let selectedDoc         = this.documents.filter((doc: any) => doc.id === this.toolSelectedOption);
        if (!selectedDoc) {
            return;
        }
        let selectedDocIndex    = this.documents.indexOf(selectedDoc[0]);
        for(let document of this.documents){
            for(let i = document.pages.length - 1; i>=0; i--){
                if(document.pages[i].checkBox) {
                    transferArrayItem(document.pages,
                        this.documents[selectedDocIndex].pages, i,
                        this.documents[selectedDocIndex].pages.length);
                }
            }
        }
    }

    changeBatch(id: number) {
        this.fillDataValues({})
        this.selectedMetadata = {id: -1};
        window.location.href = "/#/splitter/viewer/" + id;
        this.currentBatch.id = id;
        this.loadSelectedBatch();
    }

    addDocument() {
        let newId = 0;
        for(let document of this.documents){
            let id = parseInt(document.id.split('-')[1]);
            if(id > newId){
                newId= id;
            }
            newId++;
        }
        this.documents.push({
            id                  : "document-" + newId ,
            documentTypeName    : "Document " + (newId + 1),
            documentTypeKey     : "",
            pages               : [],
            class               : "",
        });
    }


    validate() {
        this.ngxService.startBackground("validate");
        setTimeout(() => {
          this.ngxService.stopBackground("validate");
        }, 10000);

        if(this.inputMode == 'Manual'){
            for (let field of this.fields) {
                // @ts-ignore
                this.selectedMetadata[field.label_short] = this.form.get(field.label_short).value;
            }
        }

        if(this.selectedMetadata['id'] == -1 && this.inputMode == 'Auto'){
            this.notify.error(this.translate.instant('SPLITTER.error_no_metadata'));
            this.ngxService.stopBackground("validate");
            return;
        }

        for(let document of this.documents){
            if(!document.documentTypeKey){
                document.class = "text-red-500";
                this.notify.error(this.translate.instant('SPLITTER.error_no_doc_type'));
                this.ngxService.stopBackground("validate");
                return;
            }
            else
                document.class = "";
        }

        let headers                 = this.authService.headers;
        let metadata                = this.selectedMetadata;
        metadata['id']              = this.currentBatch.id;
        metadata['userName']        = this.userService.user['username'];
        metadata['userFirstName']   = this.userService.user['firstname'];
        metadata['userLastName']    = this.userService.user['lastname'];

        this.http.post(API_URL + '/ws/splitter/validate',
            {
                'documents' : this.documents,
                'metadata'  : metadata,
                'formId'    : this.currentBatch.formId,
            },
            {headers}).pipe(
          tap((data: any) => {
            this.ngxService.stopBackground("validate");
          }),
          catchError((err: any) => {
              this.notify.error(err);
              return of(false);
          })
        ).subscribe(
            x => {
                window.location.href = "/#/splitter/list";
                this.notify.success("Lot validé avec succès");
            }
        )
    }
    /* -- End tools bar -- */
}
