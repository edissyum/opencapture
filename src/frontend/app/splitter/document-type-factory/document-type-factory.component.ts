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
import { LocalStorageService } from "../../../services/local-storage.service";
import { ConfirmDialogComponent } from "../../../services/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";

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
        private localStorageService: LocalStorageService
    ) {}

    loadTree(formId: number) {
        if (formId) {
            this.retrieveDocTypes(formId);
            this.initialize();
        }
    }

    retrieveDocTypes(formId: number) {
        this.loading      = true;
        this.doctypeData = [];
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
                            'isDefault' : doctype.is_default,
                            'formId'    : doctype.form_id,
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
        const lastSearchValue = this.localStorageService.get('doctype_last_search_value') || '';
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
                // @ts-ignore
                const code = (ftd.code as string);
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
    label!      : string;
    children!   : TreeItemNode[];
    code!       : string;
    type!       : string;
    isDefault!  : boolean;
}

/** Flat item node with expandable and level information */
export class TreeItemFlatNode {
    id!         : number;
    label!      : string;
    key!        : string;
    level!      : number;
    type!       : string;
    isDefault!  : boolean;
    expandable! : boolean;
    code!       : string;
}

@Component({
    selector: 'app-document-type-factory',
    templateUrl: './document-type-factory.component.html',
    styleUrls: ['./document-type-factory.component.scss'],
    providers: [ChecklistDatabase]
})
export class DocumentTypeFactoryComponent implements OnInit {
    loading: boolean                        = false;
    searchText: string                      = this.localStorageService.get('doctype_last_search_value') || '';
    @Input() selectedDocTypeInput: any      = {"key": undefined, "id": -1};
    @Output() selectedDoctypeOutput: any    = new EventEmitter < string > ();
    @Output() selectedFormOutput: any       = new EventEmitter < string > ();
    selectFormControl: FormControl          = new FormControl();
    forms: any[]                            = [];
    @Input() data:any;

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
        private localStorageService: LocalStorageService
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
            this.treeControl.expandAll();
        });
        this.selectFormControl.valueChanges.subscribe(formId => {
            this.localStorageService.save('doctypeFormId', formId);
            this.treeDataObj.loadTree(formId);
            this.selectedFormOutput.emit({'formId': formId});
        });
        this.data.hasOwnProperty('formId') ? this.treeDataObj.loadTree(this.data.formId): this.loadForms();
    }

    loadForms(): void {
        this.loading = true;
        this.http.get(environment['url'] + '/ws/forms/list?module=splitter', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.forms = data.forms;
                if (this.forms.length > 0) {
                    const defaultFormId = this.localStorageService.get('doctypeFormId') ?
                        this.localStorageService.get('doctypeFormId') : this.forms[0].id;
                    this.selectFormControl.setValue(Number(defaultFormId));
                }
                else {
                    this.notify.handleErrors(this.translate.instant('FORMS.no_form_available'));
                }
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
        flatNode.isDefault  = node.isDefault;
        flatNode.expandable = (node.type === 'folder');
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    };

    filterChanged() {
        this.localStorageService.save('doctype_last_search_value',this.searchText);
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
        this.selectedDocTypeInput = node;
        this.selectedDocTypeInput.isDblClick =isDblClick;
        this.selectedDoctypeOutput.emit(this.selectedDocTypeInput);
    }

    selectFolder(node: any) {
        if (this.data.canFolderBeSelected) {
            this.selectedDocTypeInput = node;
            this.selectedDoctypeOutput.emit(this.selectedDocTypeInput);
        }
    }

    loadDefaultDocType() {
        this.treeDataObj.doctypeData.forEach((doctype: any) => {
            if (doctype.isDefault) {
                this.selectedDocTypeInput = doctype;
                this.selectedDoctypeOutput.emit(doctype);
            }
        });
    }

    cloneFormDoctypes(sourceFormId: number, destFormId: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('DOCTYPE.confirm_doctypes_clone'),
                confirmButton       : this.translate.instant('DOCTYPE.clone_doctypes'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
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
}
