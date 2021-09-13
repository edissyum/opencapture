import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {API_URL} from "../../env";
import {catchError, debounceTime, delay, filter, map, takeUntil, tap} from "rxjs/operators";
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
import { NgxUiLoaderService } from "ngx-ui-loader";

export interface Batch {
    id              : number,
    image_url       : any,
    file_name       : string,
    page_number     : number,
    creation_date   : string,
}

export interface CustomField {
    label_short     : string;
    id              : number;
    module          : string;
    label           : string;
    type            : string;
    enabled         : boolean;
    metadata_key    : string;
    settings        : any;
    value           : string;
}

export interface Metadata {
    id              : number,
    nom_usage       : string,
    prenom          : string,
    matricule       : string,
}

@Component({
  selector: 'app-viewer',
  templateUrl: './splitter-viewer.component.html',
  styleUrls: ['./splitter-viewer.component.scss'],
})
export class SplitterViewerComponent implements OnInit, OnDestroy{
    @ViewChild('cdkStepper') cdkDropList: CdkDragDrop<any> | undefined;

    form: FormGroup                 = new FormGroup({});
    formSearchControl: FormControl  = new FormControl();
    metaDataOpenState: boolean      = true;
    showZoomPage: boolean           = false;
    batchId : number                = -1;
    batches: Batch[]                = [];
    customFields: CustomField[]     = [];
    documents: any                  = [];
    pagesImageUrls: any             = [];
    documentsIds :string[]          = [];
    metadata: Metadata[]            = [];
    zoomImageUrl: string            = "";
    toolSelectedOption: string      = "";
    selectedItemName: string        = "";
    protected searchStr: string     = "";
    selectedMetadata: Metadata      = {id: -1, nom_usage: "", prenom: "", matricule: ""};
    autoCompleteResult!: Metadata;
    currentBatch!: Batch;
    autoCompleteSlideColor: string  = "#97bf3d";
    inputMode: string               = "Auto"

    /** indicate search operation is in progress */
    public searching: boolean = false;

    /** list of banks filtered after simulating server side search */
    public  filteredServerSideMetadata: ReplaySubject<Metadata[]> = new ReplaySubject<Metadata[]>(1);

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
    ) {
    }

    ngOnInit(): void {
        this.userService.user   = this.userService.getUserFromLocal();
        this.batchId            = this.route.snapshot.params['id'];
        this.loadBatches();
        this.loadPages();
        this.loadCustomFields();
        this.loadMetadata();
        console.log(this.customFields);
    }

    loadSelectedBatch(id: number): void{
        this.batchId        = id;
        this.documents      = [];
        this.loadPages();
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
        this.http.get(API_URL + '/ws/splitter/pages/' + this.batchId, {headers}).pipe(
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
                    })
                }
            }
            this.ngxService.stopBackground("load-pages");
          }),
          catchError((err: any) => {
              this.notify.error(err);
              return of(false);
          })
        ).subscribe()
    }

    getPageUrlById(pageId: number): any{
        for(let pageImage of this.pagesImageUrls){
            if(pageImage.pageId === pageId)
                return pageImage.url
        }
        return "";
    }

    /* -- Metadata -- */
    changeInputMode($event: any) {
        this.inputMode = $event.checked ? "Auto": "Manual";
        this.selectedMetadata = {nom_usage: "", id: -1, prenom: "", matricule: ""};
        this.fillDataValues({
            'nom_usage' : "",
            'matricule' : "",
            'prenom'    : "",
        })
    }


    fillDataValues(data: any): void{
        // @ts-ignore
        this.form.get('nom_usage').setValue(data['nom_usage']);
        // @ts-ignore
        this.form.get('prenom').setValue(data['prenom']);
        // @ts-ignore
        this.form.get('matricule').setValue(data['matricule']);
    }

    private static _normalizeValue(value: string): string {
        return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    formChange(labelShort: string) {
        if (labelShort!='nom_usage')
            return;

        // @ts-ignore
        let newValue = SplitterViewerComponent._normalizeValue(this.form.get('nom_usage').value);
        if(newValue.length < 3){
            return;
        }

        if (newValue.length > 4){
            this.fillData("");
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
            data.metadata.forEach((metadataItem: any) => {
            this.metadata.push(
                {
                    id              : metadataItem.id,
                    prenom          : metadataItem.data.prenom,
                    nom_usage       : metadataItem.data.nom_usage,
                    matricule       : metadataItem.data.matricule,
                }
            );
            }
            );
            this.ngxService.stopBackground("load-metadata");
            this.notify.success(this.translate.instant('SPLITTER.referential_updated'))
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
        let optionId            =  this.selectedMetadata['id']
        // @ts-ignore
        this.form.get('prenom').setValue(optionId);
        // @ts-ignore
        this.form.get('matricule').setValue(optionId);
        // @ts-ignore
        this.form.get('nom_usage').setValue(optionId);
    }

    loadCustomFields(){
        this.ngxService.startBackground("load-custom-fields");
        setTimeout(() => {
          this.ngxService.stopBackground("load-custom-fields");
        }, 10000);

        let headers = this.authService.headers;
        let newField;
        this.http.get(API_URL + '/ws/customFields/list',{headers}).pipe(
        tap((data: any) => {
            data.customFields.forEach((field: CustomField) =>{
                newField = {
                    'id'            : field.id,
                    'label_short'   : field.label_short,
                    'module'        : field.module,
                    'label'         : field.label,
                    'type'          : field.type,
                    'enabled'       : field.enabled,
                    'metadata_key'  : field.metadata_key,
                    'settings'      : field.settings,
                    'value'         : '',
                }
                if(field.enabled) {
                    this.customFields.push(newField);
                    let control         = new FormControl();
                    let controlSearch   = new FormControl();
                    this.form.addControl(field.label_short, control);
                    this.form.addControl("search_" + field.label_short, controlSearch);
                }
            })
            this.form = this.toFormGroup();
            // listen for search field value changes
            // @ts-ignore
            this.customFields.forEach((field: CustomField) => {
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
            this.customFields.forEach((input: CustomField) => {
                if(input.enabled) {
                    let control = input.settings.required ?
                        new FormControl(input.value || '', Validators.required) :
                        new FormControl(input.value || '');
                    if(!input.settings.editable)
                        control.disable()
                    group[input.label_short] = control;
                    if(input.metadata_key)
                        group['search_' + input.label_short] = new FormControl('')
                }
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
        window.location.reload();
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

    changeBatch(batchId: number) {
        this.fillDataValues({
            'nom_usage' : "",
            'matricule' : "",
            'prenom'    : "",
        })
        // @ts-ignore
        this.form.get('commentaire').setValue("");
        this.selectedMetadata = {id: -1, nom_usage: "", prenom: "", matricule: ""};
        window.location.href = "/dist/#/splitter/viewer/" + batchId;
        this.loadSelectedBatch(batchId);
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
        })
    }

    isElementInViewport(el: any) {
        let rect = el.getBoundingClientRect();
        return (
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    validate() {
        this.ngxService.startBackground("validate");
        setTimeout(() => {
          this.ngxService.stopBackground("validate");
        }, 10000);

        if(this.inputMode == 'Manual'){
            // @ts-ignore
            let prenom  = this.form.get('prenom').value;

            // @ts-ignore
            let nom_usage     = this.form.get('nom_usage').value;

            // @ts-ignore
            let matricule = this.form.get('matricule').value;

            this.selectedMetadata = {
                nom_usage     : nom_usage,
                matricule  : matricule,
                prenom  : prenom,
                id      : 0
            }
        }

        if(this.selectedMetadata['id'] == -1){
            this.notify.error(this.translate.instant('SPLITTER.error_no_metadata'));
            this.ngxService.stopBackground("validate")
            return;
        }

        for(let document of this.documents){
            if(!document.documentTypeKey){
                document.class = "text-red-500";
                this.notify.error(this.translate.instant('SPLITTER.error_no_doc_type'));
                this.ngxService.stopBackground("validate")
                return;
            }
            else
                document.class = "";
        }

        let headers     = this.authService.headers;
        let metadata    = {
            'id'            : this.batchId,
            'firstName'     : this.selectedMetadata['prenom'],
            'lastName'      : this.selectedMetadata['nom_usage'],
            'matricule'     : this.selectedMetadata['matricule'],
            'userName'      : this.userService.user['username'],
            'userFirstName' : this.userService.user['firstname'],
            'userLastName'  : this.userService.user['lastname'],
        }

        // @ts-ignore
        metadata['comment'] = this.form.get('commentaire').value

        this.http.post(API_URL + '/ws/splitter/validate',
            {
                'documents' : this.documents,
                'metadata'  : metadata,
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
                window.location.href = "/dist/#/splitter/list";
                this.notify.success("Lot validé avec succès");
            }
        )
    }
    /* -- End tools bar -- */
}
