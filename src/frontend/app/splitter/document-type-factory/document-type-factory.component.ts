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

import {Component, Injectable, EventEmitter, OnInit, Output, Input} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {BehaviorSubject, of} from "rxjs";
import {SettingsService} from "../../../services/settings.service";
import {API_URL} from "../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";
import {PrivilegesService} from "../../../services/privileges.service";

export class TreeItemNode {
    key!        : string;
    item!       : string;
    children!   : TreeItemNode[];
    code!       : string;
    type!       : string;
    isDefault!  : boolean;
}

/** Flat item node with expandable and level information */
export class TreeItemFlatNode {
    item!       : string;
    key!        : string;
    level!      : number;
    type!       : string;
    expandable! : boolean;
    code!       : string;
}

@Injectable()
export class ChecklistDatabase {
    dataChange = new BehaviorSubject<TreeItemNode[]>([]);
    treeData : any[] = [];
    get data(): TreeItemNode[] { return this.dataChange.value; }
    loading = true;
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
        public privilegesService: PrivilegesService
    ) {
        this.retrieveDocTypes();
    }
    reloadTree(){
        this.retrieveDocTypes();
        this.initialize();
    }
    retrieveDocTypes() {
        this.treeData = [];
        this.http.get(API_URL + '/ws/docTypes/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let newDoctype;
                data.docTypes.forEach((field: {
                        id      : any;
                        key     : string;
                        code    : string;
                        label   : string;
                        type    : string;
                        status  : string;
                        default : boolean;
                    }) => {
                        newDoctype = {
                            'id'        : field.id,
                            'key'       : field.key,
                            'code'      : field.code,
                            'label'     : field.label,
                            'type'      : field.type,
                            'status'    : field.status,
                            'default'   : field.default,
                        };
                        this.treeData.push(newDoctype);
                    }
                );
            }),
            finalize(() => {
                this.initialize();
                this.loading = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    initialize() {
        /** Build the tree nodes from Database. The result is a list of `DocumentItemNode` with nested
         * file node as children.
         */
        const data    = this.buildFileTree(this.treeData, '0');
        // Notify the change.
        this.dataChange.next(data);
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
                node.key        = o.key;
                node.item       = o.label;
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

    public filter(filterText: string) {
        let filteredTreeData: any[];
        if (filterText) {
            filteredTreeData = this.treeData.filter(d => d.label.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
            Object.assign([], filteredTreeData).forEach(ftd => {
                // @ts-ignore
                let str = (ftd.code as string);
                while (str.lastIndexOf('.') > -1) {
                    const index = str.lastIndexOf('.');
                    str = str.substring(0, index);
                    if (filteredTreeData.findIndex(t => t.code === str) === -1) {
                        const obj = this.treeData.find(d => d.code === str);
                        if (obj) {
                            filteredTreeData.push(obj);
                        }
                    }
                }
            });

        } else {
            filteredTreeData = this.treeData;
        }

        /** Build the tree nodes from Json object. The result is a list of `DocumentItemNode` with nested
         * file node as children.
         */
        const data = this.buildFileTree(filteredTreeData, '0');
        // Notify the change.
        this.dataChange.next(data);
    }
}

@Component({
    selector: 'app-document-type-factory',
    templateUrl: './document-type-factory.component.html',
    styleUrls: ['./document-type-factory.component.scss'],
    providers: [ChecklistDatabase]
})
export class DocumentTypeFactoryComponent implements OnInit {
    searchText: string                = "";
    @Input() selectedDocType: any     = {"key": undefined};
    @Output() output                  = new EventEmitter < string > ();

    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    flatNodeMap               = new Map<TreeItemFlatNode, TreeItemNode>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap             = new Map<TreeItemNode, TreeItemFlatNode>();

    treeControl   : FlatTreeControl<TreeItemFlatNode>;

    treeFlattener : MatTreeFlattener<TreeItemNode, TreeItemFlatNode>;

    dataSource    : MatTreeFlatDataSource<TreeItemNode, TreeItemFlatNode>;

    constructor(
        public treeDataObj         : ChecklistDatabase,
        public serviceSettings  : SettingsService,
    ) {
        this.treeFlattener  = new MatTreeFlattener(this.transformer, this.getLevel,
            this.isExpandable, this.getChildren);
        this.treeControl    = new FlatTreeControl<TreeItemFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource     = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        treeDataObj.dataChange.subscribe(data => {
            this.dataSource.data = data;
            this.treeControl.expandAll();
        });
    }

    getLevel      = (node: TreeItemFlatNode)                  => node.level;
    isExpandable  = (node: TreeItemFlatNode)                  => node.expandable;
    getChildren   = (node: TreeItemNode): TreeItemNode[]      => node.children;
    hasChild      = (_: number, _nodeData: TreeItemFlatNode)  => _nodeData.type === 'folder';

    ngOnInit(): void {
    }
    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    transformer = (node: TreeItemNode, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.item === node.item
            ? existingNode
            : new TreeItemFlatNode();
        flatNode.item       = node.item;
        flatNode.level      = level;
        flatNode.type       = node.type;
        flatNode.code       = node.code;
        flatNode.key        = node.key;
        flatNode.expandable = (node.type === 'folder');
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    }

    filterChanged() {
        this.treeDataObj.filter(this.searchText);
        if (this.searchText)
        {
            this.treeControl.expandAll();
        } else {
            this.treeControl.collapseAll();
        }
        this.treeControl.expandAll();
    }

    selectNode(node: any) {
        this.selectedDocType = node;
        this.output.emit(this.selectedDocType);
    }
}
