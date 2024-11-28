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

import { Component, EventEmitter, Injectable, Input, OnInit, Output } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, of } from "rxjs";
import { SettingsService } from "../../../services/settings.service";
import { environment } from  "../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl } from "@angular/forms";
import { AuthService } from "../../../services/auth.service";
import { UserService } from "../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../services/notifications/notifications.service";
import { PrivilegesService } from "../../../services/privileges.service";
import { SessionStorageService } from "../../../services/session-storage.service";
import { ConfirmDialogComponent } from "../../../services/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import {ExportDialogComponent} from "../../../services/export-dialog/export-dialog.component";
import {ImportDialogComponent} from "../../../services/import-dialog/import-dialog.component";

@Injectable()
export class ChecklistDatabase {
    doctypeData : any[]     = [];
    loading     : boolean   = true;
    dataChange              = new BehaviorSubject<TreeItemNode[]>([]);

    get data(): TreeItemNode[] { return this.dataChange.value; }

    constructor(
        private http: HttpClient,
        public router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
        private sessionStorageService: SessionStorageService
    ) {}

    loadTree(formId: number) {
        if (formId) {
            this.retrieveDocTypes(formId);
            this.initialize();
        }
    }

    retrieveDocTypes(formId: number) {
        this.loading      = true;
        this.doctypeData  = [];
        this.http.get(environment['url'] + '/ws/doctypes/list/' + (formId).toString(), {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let newDoctype;
                data.doctypes.forEach((doctype: {
                        id          : number
                        key         : string
                        code        : string
                        label       : string
                        type        : string
                        status      : string
                        is_default  : boolean
                        form_id     : boolean
                    }) => {
                        newDoctype = {
                            'id'        : doctype.id,
                            'key'       : doctype.key,
                            'code'      : doctype.code,
                            'label'     : doctype.label,
                            'type'      : doctype.type,
                            'status'    : doctype.status,
                            'formId'    : doctype.form_id,
                            'isDefault' : doctype.is_default,
                            'padding'   : doctype.code.split('.').length - 2
                        };
                        this.doctypeData.push(newDoctype);
                    }
                );
            }),
            finalize(() => {
                this.initialize();
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

    initialize() {
        /** Build the tree nodes from Database. The result is a list of `DocumentItemNode` with nested
         * file node as children.
         */
        this.loading = true;
        const data    = this.buildFileTree(this.doctypeData, '0');
        // Notify the change.
        this.dataChange.next(data);
        const lastSearchValue = this.sessionStorageService.get('doctype_last_search_value') || '';
        if (lastSearchValue) {
            this.filter(lastSearchValue);
        }
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `DocumentItemNode`.
     */

    buildFileTree(obj: any[], level: string): TreeItemNode[] {
        return obj.filter(o =>
            (o.code as string).startsWith(level + '.')
            && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
        )
            .map(o => {
                const node      = new TreeItemNode();
                node.id         = o.id;
                node.key        = o.key;
                node.label      = o.label;
                node.code       = o.code;
                node.type       = o.type;
                node.padding    = o.padding;
                node.isDefault  = o.isDefault;
                const children  = obj.filter(so => (so.code as string).startsWith(level + '.'));
                if (children && children.length > 0) {
                    node.children = this.buildFileTree(children, o.code);
                }
                return node;
            });
    }

    public _normalizeValue(value: string): string {
        return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    public filter(filterText: string) {
        let filteredTreeData: any[];
        if (filterText) {
            filteredTreeData = this.doctypeData.filter(d =>
                this._normalizeValue(d.label).indexOf(this._normalizeValue(filterText))
                > -1 && d.code.lastIndexOf('.') === 1
            );
            Object.assign([], filteredTreeData).forEach(ftd => {
                const code = (ftd['code'] as string);
                filteredTreeData = filteredTreeData.concat(this.doctypeData.filter(d =>
                    d.code.startsWith(code + ".") && d.code !== code
                ));
            });
        } else {
            filteredTreeData = this.doctypeData;
        }
        const data = this.buildFileTree(filteredTreeData, '0');
        this.dataChange.next(data);
    }
}

export class TreeItemNode {
    id!         : number;
    key!        : string;
    code!       : string;
    type!       : string;
    label!      : string;
    padding!    : number;
    isDefault!  : boolean;
    children!   : TreeItemNode[];
}

/** Flat item node with expandable and level information */
export class TreeItemFlatNode {
    id!         : number;
    key!        : string;
    type!       : string;
    code!       : string;
    label!      : string;
    level!      : number;
    padding!    : number;
    isDefault!  : boolean;
    expandable! : boolean;
}

@Component({
    selector: 'app-document-type-factory',
    templateUrl: './document-type-factory.component.html',
    styleUrls: ['./document-type-factory.component.scss'],
    providers: [ChecklistDatabase],
    standalone: false
})
export class DocumentTypeFactoryComponent implements OnInit {
    loading: boolean                     = false;
    searchText: string                   = this.sessionStorageService.get('doctype_last_search_value') || '';

    @Input() selectedDoctypeInput: any   = {
        'key': undefined,
        'id': undefined
    };
    @Input() settings: any               = {
        'allowImportExport': false,
        'allowUniqueDocType': false,
        'canFolderBeSelected': false,
        'formId': undefined
    };

    @Output() selectedDoctypeOutput: any = new EventEmitter < string > ();
    @Output() selectedFormOutput: any    = new EventEmitter < string > ();

    selectFormControl: FormControl       = new FormControl();
    toggleControl: FormControl           = new FormControl(false);
    forms: any[]                         = [];

    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    flatNodeMap    = new Map<TreeItemFlatNode, TreeItemNode>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap  = new Map<TreeItemNode, TreeItemFlatNode>();
    treeControl!   : FlatTreeControl<TreeItemFlatNode>;
    treeFlattener! : MatTreeFlattener<TreeItemNode, TreeItemFlatNode>;
    dataSource!    : MatTreeFlatDataSource<TreeItemNode, TreeItemFlatNode>;

    constructor(
        public router: Router,
        public dialog: MatDialog,
        public userService: UserService,
        public translate: TranslateService,
        public serviceSettings  : SettingsService,
        public treeDataObj : ChecklistDatabase,
        public privilegesService: PrivilegesService,
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService,
        private formBuilder: FormBuilder,
        private notify: NotificationService,
        private sessionStorageService: SessionStorageService
    ) {
    }

    getLevel      = (node: TreeItemFlatNode)                  => node.level;
    isExpandable  = (node: TreeItemFlatNode)                  => node.expandable;
    getChildren   = (node: TreeItemNode): TreeItemNode[]      => node.children;
    hasChild      = (_: number, _nodeData: TreeItemFlatNode)  => _nodeData.type === 'folder';

    ngOnInit(): void {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        this.treeFlattener  = new MatTreeFlattener(this.transformer, this.getLevel,
            this.isExpandable, this.getChildren);
        this.treeControl    = new FlatTreeControl<TreeItemFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource     = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.treeDataObj.dataChange.subscribe(data => {
            this.dataSource.data = data;
            const collapseTree = this.sessionStorageService.get('is_doctypes_tree_collapsed') &&
                this.sessionStorageService.get('is_doctypes_tree_collapsed') === 'true';
            if (collapseTree) {
                this.treeControl.collapseAll();
            }
            else {
                this.treeControl.expandAll();
            }
        });
        this.selectFormControl.valueChanges.subscribe(formId => {
            this.sessionStorageService.save('doctypeFormId', formId);
            this.treeDataObj.loadTree(formId);
            this.selectedFormOutput.emit({'formId': formId});
            const selectedForm  = this.forms.find( form => form.id === this.selectFormControl.value );
            this.toggleControl.setValue(selectedForm.settings.unique_doc_type);
        });
        this.settings.hasOwnProperty('formId') ? this.treeDataObj.loadTree(this.settings.formId) : this.loadForms();
    }

    loadForms(): void {
        this.loading = true;
        this.http.get(environment['url'] + '/ws/forms/splitter/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.forms = data.forms;
                if (this.forms.length > 0) {
                    const defaultFormId = this.sessionStorageService.get('doctypeFormId') ?
                        this.sessionStorageService.get('doctypeFormId') : this.forms[0].id;
                    this.selectFormControl.setValue(Number(defaultFormId));
                } else {
                    this.notify.handleErrors(this.translate.instant('FORMS.no_form_available'));
                }
                const selectedForm  = this.forms.find( form => form.id === this.selectFormControl.value );
                this.toggleControl.setValue(selectedForm.settings.unique_doc_type);
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.loading = false;
                return of(false);
            })
        ).subscribe();
    }

    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    transformer = (node: TreeItemNode, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.label === node.label
            ? existingNode
            : new TreeItemFlatNode();
        flatNode.id         = node.id;
        flatNode.label      = node.label;
        flatNode.level      = level;
        flatNode.type       = node.type;
        flatNode.code       = node.code;
        flatNode.key        = node.key;
        flatNode.padding    = node.padding;
        flatNode.isDefault  = node.isDefault;
        flatNode.expandable = (node.type === 'folder');
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    };

    filterChanged() {
        this.sessionStorageService.save('doctype_last_search_value', this.searchText);
        this.treeDataObj.filter(this.searchText);
        if (this.searchText)
        {
            this.treeControl.expandAll();
        } else {
            this.treeControl.collapseAll();
        }
        this.treeControl.expandAll();
    }

    selectNode(node: any, isDblClick:boolean) {
        this.selectedDoctypeInput = node;
        this.selectedDoctypeInput.isDblClick = isDblClick;
        this.selectedDoctypeOutput.emit(this.selectedDoctypeInput);
    }

    selectFolder(node: any) {
        if (this.settings.canFolderBeSelected) {
            this.selectedDoctypeInput = node;
            this.selectedDoctypeOutput.emit(this.selectedDoctypeInput);
        }
    }

    cloneFormDoctypes(sourceFormId: number, destFormId: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('DOCTYPE.confirm_doctypes_clone'),
                confirmButton       : this.translate.instant('DOCTYPE.clone_doctypes'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.treeDataObj.loading = true;
                this.http.get(environment['url'] + '/ws/doctypes/clone/' + sourceFormId + '/' + destFormId,
                    {headers: this.authService.headers}).pipe(
                    tap(() => {
                        this.treeDataObj.retrieveDocTypes(this.selectFormControl.value);
                        this.notify.success(this.translate.instant('DOCTYPE.doctypes_clone_success'));
                    }),
                    finalize(() => this.loading = false),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        this.treeDataObj.loading = false;
                        return of(false);
                    })
                ).subscribe();
            }
        });
    }

    highlight(text: string) {
        return text.replace(this.searchText, `<span class="p-1 rounded font-bold bg-green-400">${this.searchText}</span>`);
    }

    cleanSearchText() {
        this.searchText = '';
        this.filterChanged();
    }

    exportDoctypes() {
        const selectedColumns: any [] = [
            {
                id: 'label',
                label: this.translate.instant('HEADER.label')
            },
            {
                id: 'type',
                label: this.translate.instant('DOCTYPE.type')
            },
            {
                id: 'key',
                label: this.translate.instant('HEADER.id')
            },
            {
                id: 'form_id',
                label: this.translate.instant('DOCTYPE.form_identifier')
            },
            {
                id: 'code',
                label: this.translate.instant('DOCTYPE.code')
            }
        ];
        const availableColumns: any [] = [
            {
                id: 'status',
                label: this.translate.instant('HEADER.status')
            },
            {
                id: 'isDefault',
                label: this.translate.instant('DOCTYPE.default_doctype')
            }
        ];

        const dialogRef = this.dialog.open(ExportDialogComponent, {
            data: {
                selectedColumns: selectedColumns,
                availableColumns: availableColumns,
                title : this.translate.instant('DOCTYPE.export')
            },
            width: "900px"
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const args = {
                    'formId': this.selectFormControl.value,
                    'columns': result.selectedColumns,
                    'delimiter': result.delimiter,
                    'extension': result.extension
                };
                this.http.post(environment['url'] + '/ws/doctypes/export', {'args': args}, {headers: this.authService.headers},
                ).pipe(
                    tap((data: any) => {
                        const csvContent = atob(data.encoded_file);
                        const blob = new Blob([csvContent], {type: "data:application/octet-stream;base64"});
                        const url  = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `doctypes.${result.extension}`;
                        link.click();
                        this.notify.success(this.translate.instant('DOCTYPE.doctypes_export_success'));
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }
        });
    }

    importDoctypes() {
        const dialogRef = this.dialog.open(ImportDialogComponent, {
            data: {
                rows: [],
                extension: 'CSV',
                skipHeader: false,
                allowColumnsSelection : true,
                title : this.translate.instant('DOCTYPE.import'),
                availableColumns : [ 'key', 'label', 'type', 'code', 'form_id'],
                selectedColumns : [ 'key', 'label', 'type', 'code', 'form_id']
            },
            width: "900px"
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const formData: FormData = new FormData();
                for (let i = 0; i < result.fileControl.value!.length; i++) {
                    if (result.fileControl.status === 'VALID') {
                        formData.append(result.fileControl.value![i]['name'], result.fileControl.value![i]);
                    } else {
                        this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized'));
                        return;
                    }
                }
                formData.set('selectedColumns', result.selectedColumns);
                formData.set('skipHeader', result.skipHeader);

                this.http.post(environment['url'] + '/ws/doctypes/csv/import', formData, {headers: this.authService.headers},
                ).pipe(
                    tap(() => {
                        this.treeDataObj.retrieveDocTypes(this.selectFormControl.value);
                        this.notify.success(this.translate.instant('DOCTYPE.doctypes_import_success'));
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }
        });
    }

    expandAll() {
        this.treeControl.expandAll();
        this.sessionStorageService.save('is_doctypes_tree_collapsed', false);
    }

    changeDocType() {
        const dataSelectForm = this.forms.find(item => item.id === this.selectFormControl.value);
        dataSelectForm.settings.unique_doc_type = this.toggleControl.value;
        const uniqueDocType = this.toggleControl.value;
        const label             = dataSelectForm.label;
        const isDefault         = dataSelectForm.default_form;
        const metadataMethod    = dataSelectForm.metadata_method;
        const exportZipFile     = dataSelectForm.export_zip_file;
        const outputs = dataSelectForm.outputs;
        this.http.put(environment['url'] + '/ws/forms/splitter/update/' + dataSelectForm.id, {
            'args': {
                'label'        : label,
                'default_form' : isDefault,
                'outputs'      : outputs,
                'settings'     : {
                    'metadata_method' : metadataMethod,
                    'export_zip_file' : exportZipFile,
                    'unique_doc_type' : uniqueDocType
                }
            }
        }, {headers: this.authService.headers},
        ).pipe(
            tap( ()=>{
                this.notify.success(this.translate.instant('DOCTYPE.unique_doctype_updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            }))
        .subscribe();
    }

    collapseAll() {
        this.treeControl.collapseAll();
        this.sessionStorageService.save('is_doctypes_tree_collapsed', true);
    }
}
