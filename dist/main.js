(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "/0w2":
/*!************************************************************!*\
  !*** ./src/frontend/app/settings/roles/roles.component.ts ***!
  \************************************************************/
/*! exports provided: RolesComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RolesComponent", function() { return RolesComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../services/confirm-dialog/confirm-dialog.component */ "GI+y");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _services_last_url_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../services/last-url.service */ "463q");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/table */ "+0xr");
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/sort */ "Dh3D");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");






















function RolesComponent_mat_header_cell_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "GLOBAL.id"), " ");
} }
function RolesComponent_mat_cell_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r12 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", element_r12.id, " ");
} }
function RolesComponent_mat_header_cell_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "ROLE.label_short"), " ");
} }
function RolesComponent_mat_cell_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r13 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", element_r13.label_short, " ");
} }
function RolesComponent_mat_header_cell_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "ROLE.label"), " ");
} }
function RolesComponent_mat_cell_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r14 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", element_r14.label, " ");
} }
function RolesComponent_mat_header_cell_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "ROLE.editable"), " ");
} }
function RolesComponent_mat_cell_14_span_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "span", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](4, 1, "ROLE.editable"), "");
} }
function RolesComponent_mat_cell_14_span_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "span", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](4, 1, "ROLE.non_editable"), "");
} }
function RolesComponent_mat_cell_14_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, RolesComponent_mat_cell_14_span_1_Template, 5, 3, "span", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, RolesComponent_mat_cell_14_span_2_Template, 5, 3, "span", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r15 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", element_r15.editable);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !element_r15.editable);
} }
function RolesComponent_mat_header_cell_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "mat-header-cell");
} }
function RolesComponent_mat_cell_17_span_1_Template(rf, ctx) { if (rf & 1) {
    const _r23 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function RolesComponent_mat_cell_17_span_1_Template_button_click_1_listener($event) { return $event.stopPropagation(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "i", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "button", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function RolesComponent_mat_cell_17_span_1_Template_button_click_4_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r23); const element_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r21.deleteConfirmDialog(element_r18.id, element_r18.label); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](6, "i", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate1"]("routerLink", "/profile/", element_r18.id, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 3, "ROLE.update"));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](5, 5, "GLOBAL.delete"));
} }
function RolesComponent_mat_cell_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, RolesComponent_mat_cell_17_span_1_Template, 7, 7, "span", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r18 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", element_r18.editable);
} }
function RolesComponent_mat_header_row_18_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "mat-header-row");
} }
function RolesComponent_mat_row_19_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "mat-row", 20);
} }
const _c0 = function () { return [5, 10, 15, 20, 50]; };
class RolesComponent {
    constructor(http, router, route, formBuilder, authService, userService, translate, notify, dialog, routerExtService, localeStorageService) {
        this.http = http;
        this.router = router;
        this.route = route;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.userService = userService;
        this.translate = translate;
        this.notify = notify;
        this.dialog = dialog;
        this.routerExtService = routerExtService;
        this.localeStorageService = localeStorageService;
        this.columnsToDisplay = ['id', 'label_short', 'label', 'editable', 'actions'];
        this.roles = [];
        this.pageSize = 10;
        this.pageIndex = 0;
        this.total = 0;
        this.offset = 0;
    }
    ngOnInit() {
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('roles/') || lastUrl == '/') {
            if (this.localeStorageService.get('rolesPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('rolesPageIndex'));
            this.offset = this.pageSize * (this.pageIndex);
        }
        else
            this.localeStorageService.remove('rolesPageIndex');
        this.loadRoles();
    }
    loadRoles() {
        let headers = this.authService.headers;
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/list?limit=' + this.pageSize + '&offset=' + this.offset, { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            this.total = data.roles[0].total;
            this.roles = data.roles;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
    }
    onPageChange(event) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.localeStorageService.save('rolesPageIndex', event.pageIndex);
        this.loadRoles();
    }
    deleteConfirmDialog(role_id, role) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_4__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('ROLE.confirm_delete', { "role": role }),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteRole(role_id);
            }
        });
    }
    deleteRole(role_id) {
        let headers = this.authService.headers;
        if (role_id !== undefined) {
            this.http.delete(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/delete/' + role_id, { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
                this.loadRoles();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            })).subscribe();
        }
    }
    sortData(sort) {
        let data = this.roles.slice();
        if (!sort.active || sort.direction === '') {
            this.roles = data;
            return;
        }
        this.roles = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'label_short': return this.compare(a.label_short, b.label_short, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                case 'editable': return this.compare(a.editable, b.editable, isAsc);
                default: return 0;
            }
        });
    }
    compare(a, b, isAsc) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
RolesComponent.ɵfac = function RolesComponent_Factory(t) { return new (t || RolesComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_7__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_12__["MatDialog"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_last_url_service__WEBPACK_IMPORTED_MODULE_13__["LastUrlService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_14__["LocalStorageService"])); };
RolesComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: RolesComponent, selectors: [["app-roles"]], decls: 20, vars: 8, consts: [["showFirstLastButtons", "", 3, "length", "pageSize", "pageIndex", "pageSizeOptions", "page"], ["matSort", "", 1, "w-full", 3, "dataSource", "matSortChange"], ["matColumnDef", "id"], ["mat-sort-header", "", 4, "matHeaderCellDef"], [4, "matCellDef"], ["matColumnDef", "label_short"], ["matColumnDef", "label"], ["matColumnDef", "editable"], ["matColumnDef", "actions"], [4, "matHeaderCellDef"], [4, "matHeaderRowDef"], ["class", "cursor-pointer hover:text-green-400 hover:shadow-md transition-colors duration-300", 4, "matRowDef", "matRowDefColumns"], ["mat-sort-header", ""], [4, "ngIf"], [1, "text-green-400", "text-4xl", "relative", "top-2", "leading-4"], [1, "text-red-600", "text-4xl", "relative", "top-2", "leading-4"], ["mat-icon-button", "", 1, "inline-block", "align-text-top", 3, "routerLink", "matTooltip", "click"], [1, "btn-action-icon", "fas", "fa-edit", "fa-lg"], ["mat-icon-button", "", 1, "inline-block", "align-text-top", 3, "matTooltip", "click"], [1, "btn-action-icon", "fas", "fa-trash", "fa-lg"], [1, "cursor-pointer", "hover:text-green-400", "hover:shadow-md", "transition-colors", "duration-300"]], template: function RolesComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-paginator", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("page", function RolesComponent_Template_mat_paginator_page_1_listener($event) { return ctx.onPageChange($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-table", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("matSortChange", function RolesComponent_Template_mat_table_matSortChange_2_listener($event) { return ctx.sortData($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](3, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, RolesComponent_mat_header_cell_4_Template, 3, 3, "mat-header-cell", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, RolesComponent_mat_cell_5_Template, 2, 1, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](6, 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](7, RolesComponent_mat_header_cell_7_Template, 3, 3, "mat-header-cell", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](8, RolesComponent_mat_cell_8_Template, 2, 1, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](9, 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](10, RolesComponent_mat_header_cell_10_Template, 3, 3, "mat-header-cell", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](11, RolesComponent_mat_cell_11_Template, 2, 1, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](12, 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](13, RolesComponent_mat_header_cell_13_Template, 3, 3, "mat-header-cell", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](14, RolesComponent_mat_cell_14_Template, 3, 2, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](15, 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](16, RolesComponent_mat_header_cell_16_Template, 1, 0, "mat-header-cell", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](17, RolesComponent_mat_cell_17_Template, 2, 1, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](18, RolesComponent_mat_header_row_18_Template, 1, 0, "mat-header-row", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](19, RolesComponent_mat_row_19_Template, 1, 0, "mat-row", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("length", ctx.total)("pageSize", ctx.pageSize)("pageIndex", ctx.pageIndex)("pageSizeOptions", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](7, _c0));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("dataSource", ctx.roles);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("matHeaderRowDef", ctx.columnsToDisplay);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("matRowDefColumns", ctx.columnsToDisplay);
    } }, directives: [_angular_material_paginator__WEBPACK_IMPORTED_MODULE_15__["MatPaginator"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatTable"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_17__["MatSort"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatColumnDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatHeaderCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatHeaderRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatHeaderCell"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_17__["MatSortHeader"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatCell"], _angular_common__WEBPACK_IMPORTED_MODULE_18__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_19__["MatButton"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterLink"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_20__["MatTooltip"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatHeaderRow"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatRow"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslatePipe"]], styles: [".mat-row[_ngcontent-%COMP%]:hover    > .mat-cell[_ngcontent-%COMP%] {\n  --tw-text-opacity: 1;\n  color: rgba(151, 191, 61, var(--tw-text-opacity));\n}\n\n.mat-row[_ngcontent-%COMP%]:hover {\n  transform: scale(1);\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3JvbGVzLmNvbXBvbmVudC5zY3NzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3RhaWx3aW5kY3NzL2xpYi9saWIvc3Vic3RpdHV0ZUNsYXNzQXBwbHlBdFJ1bGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VDRUEsb0JBQW1CO0VBQW5CLGlEQUFtQjtBREFuQjs7QUFFQTtFQUNJLG1CQUFBO0FBQ0oiLCJmaWxlIjoicm9sZXMuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIubWF0LXJvdzpob3ZlciA+IC5tYXQtY2VsbHtcbiAgICBAYXBwbHkgdGV4dC1ncmVlbi00MDA7XG59XG5cbi5tYXQtcm93OmhvdmVye1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMSlcbn0iLCJAdGFpbHdpbmQgYmFzZTtcbkB0YWlsd2luZCBjb21wb25lbnRzO1xuQHRhaWx3aW5kIHV0aWxpdGllczsiXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](RolesComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-roles',
                templateUrl: './roles.component.html',
                styleUrls: ['./roles.component.scss']
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"] }, { type: _angular_forms__WEBPACK_IMPORTED_MODULE_7__["FormBuilder"] }, { type: _services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"] }, { type: _services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"] }, { type: _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__["NotificationService"] }, { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_12__["MatDialog"] }, { type: _services_last_url_service__WEBPACK_IMPORTED_MODULE_13__["LastUrlService"] }, { type: _services_local_storage_service__WEBPACK_IMPORTED_MODULE_14__["LocalStorageService"] }]; }, null); })();


/***/ }),

/***/ "/azQ":
/*!********************************************************!*\
  !*** ./src/frontend/services/local-storage.service.ts ***!
  \********************************************************/
/*! exports provided: LocalStorageService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LocalStorageService", function() { return LocalStorageService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");


class LocalStorageService {
    constructor() {
    }
    save(id, content) {
        localStorage.setItem(id, content);
    }
    get(id) {
        return localStorage.getItem(id);
    }
    remove(id) {
        localStorage.removeItem(id);
    }
    resetLocal() {
        const arr = [];
        // Iterate over arr and remove the items by key
        for (let i = 0; i < arr.length; i++) {
            localStorage.removeItem(arr[i]);
        }
    }
    getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    setCookie(cname, cvalue, exdays) {
        let d = new Date();
        if (exdays !== 0) {
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            let expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }
        else {
            document.cookie = cname + "=" + cvalue;
        }
    }
    deleteCookie(cname) {
        this.setCookie(cname, '', -1);
    }
}
LocalStorageService.ɵfac = function LocalStorageService_Factory(t) { return new (t || LocalStorageService)(); };
LocalStorageService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: LocalStorageService, factory: LocalStorageService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](LocalStorageService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ 0:
/*!************************************!*\
  !*** multi ./src/frontend/main.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /var/www/html/opencaptureforinvoices/src/frontend/main.ts */"jj9e");


/***/ }),

/***/ "09X2":
/*!***************************************************!*\
  !*** ./src/frontend/app/login/login.component.ts ***!
  \***************************************************/
/*! exports provided: LoginComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginComponent", function() { return LoginComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_config_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../services/config.service */ "cMpu");
/* harmony import */ var _services_locale_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../services/locale.service */ "W2Zi");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/card */ "Wp6s");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/button */ "bTqV");




















function LoginComponent_mat_error_15_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r0.getErrorMessage("username"));
} }
function LoginComponent_mat_error_22_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r1.getErrorMessage("password"));
} }
class LoginComponent {
    constructor(router, http, formBuilder, authService, userService, translate, notify, configService, localeService) {
        this.router = router;
        this.http = http;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.userService = userService;
        this.translate = translate;
        this.notify = notify;
        this.configService = configService;
        this.localeService = localeService;
    }
    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required],
            password: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required]
        });
        this.localeService.getCurrentLocale();
    }
    onSubmit() {
        let password = this.loginForm.get('password').value;
        let username = this.loginForm.get('username').value;
        if (password && username) {
            this.http.post(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/auth/login', {
                'username': username,
                'password': password,
                'lang': this.localeService.currentLang
            }, {
                observe: 'response'
            }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
                this.userService.setUser(data.body.user);
                this.authService.setTokens(data.body.auth_token, btoa(JSON.stringify(this.userService.getUser())), data.body.days_before_exp);
                this.notify.success(this.translate.instant('AUTH.authenticated'));
                this.configService.readConfig().then(() => {
                    if (this.authService.getCachedUrl()) {
                        // @ts-ignore
                        this.router.navigateByUrl(this.authService.getCachedUrl()).then();
                        this.authService.cleanCachedUrl();
                    }
                    else {
                        this.router.navigate(['/home']).then();
                    }
                });
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
            })).subscribe();
        }
    }
    getErrorMessage(field) {
        if (this.loginForm.get(field).hasError('required')) {
            return this.translate.instant('AUTH.field_required');
        }
        return this.translate.instant('ERROR.unknow_error');
    }
}
LoginComponent.ɵfac = function LoginComponent_Factory(t) { return new (t || LoginComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_7__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_8__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_config_service__WEBPACK_IMPORTED_MODULE_11__["ConfigService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_locale_service__WEBPACK_IMPORTED_MODULE_12__["LocaleService"])); };
LoginComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: LoginComponent, selectors: [["app-login"]], decls: 31, vars: 24, consts: [[1, "mt-32", "-mb-32", "flex", "justify-center", "h-20"], ["src", "assets/imgs/logo_opencapture.png", "alt", "Open-Capture For Invoices logo"], [1, "flex", "justify-center", "items-center", 2, "height", "85vh"], [1, "text-center", "w-full", "lg:w-1/4"], [1, "mb-10"], [3, "formGroup", "ngSubmit"], [1, "block"], ["matInput", "", "formControlName", "username", "type", "text", "required", "", 3, "placeholder"], [4, "ngIf"], ["matInput", "", "formControlName", "password", "type", "password", "required", "", 3, "placeholder"], [1, "button"], ["type", "submit", "mat-button", "", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300"], [1, "absolute", "mt-96", "hover:text-green-400", "transition", "duration-500"], ["routerLink", "/register"]], template: function LoginComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "img", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "mat-card", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "mat-card-title", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](6, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "mat-card-content");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "form", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngSubmit", function LoginComponent_Template_form_ngSubmit_8_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "mat-form-field", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](12, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](13, "input", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](14, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](15, LoginComponent_mat_error_15_Template, 2, 1, "mat-error", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](16, "mat-form-field", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](17, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](18);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](19, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](20, "input", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](21, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](22, LoginComponent_mat_error_22_Template, 2, 1, "mat-error", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](23, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](24, "button", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](25);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](26, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](27, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](28, "a", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](29);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](30, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](6, 10, "GLOBAL.login"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formGroup", ctx.loginForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](12, 12, "USER.username"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](14, 14, "USER.username"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.loginForm.controls.username.invalid);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](19, 16, "USER.password"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](21, 18, "USER.password"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.loginForm.controls.password.invalid);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](26, 20, "AUTH.login"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](30, 22, "GLOBAL.register"), " ");
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_13__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_13__["MatCardTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_13__["MatCardContent"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroupDirective"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_14__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_14__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_15__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlName"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["RequiredValidator"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_17__["MatButton"], _angular_router__WEBPACK_IMPORTED_MODULE_5__["RouterLinkWithHref"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_14__["MatError"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsb2dpbi5jb21wb25lbnQuc2NzcyJ9 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](LoginComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-login',
                templateUrl: './login.component.html',
                styleUrls: ['./login.component.scss']
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"] }, { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"] }, { type: _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormBuilder"] }, { type: _services_auth_service__WEBPACK_IMPORTED_MODULE_7__["AuthService"] }, { type: _services_user_service__WEBPACK_IMPORTED_MODULE_8__["UserService"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"] }, { type: _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__["NotificationService"] }, { type: _services_config_service__WEBPACK_IMPORTED_MODULE_11__["ConfigService"] }, { type: _services_locale_service__WEBPACK_IMPORTED_MODULE_12__["LocaleService"] }]; }, null); })();


/***/ }),

/***/ "1PXZ":
/*!******************************************************************************!*\
  !*** ./src/frontend/app/settings/version-update/version-update.component.ts ***!
  \******************************************************************************/
/*! exports provided: VersionUpdateComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VersionUpdateComponent", function() { return VersionUpdateComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");


class VersionUpdateComponent {
    constructor() { }
    ngOnInit() {
    }
}
VersionUpdateComponent.ɵfac = function VersionUpdateComponent_Factory(t) { return new (t || VersionUpdateComponent)(); };
VersionUpdateComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: VersionUpdateComponent, selectors: [["app-version-update"]], decls: 2, vars: 0, template: function VersionUpdateComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "versions-update works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ2ZXJzaW9uLXVwZGF0ZS5jb21wb25lbnQuc2NzcyJ9 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](VersionUpdateComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-version-update',
                templateUrl: './version-update.component.html',
                styleUrls: ['./version-update.component.scss']
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "2VJY":
/*!*********************************************************!*\
  !*** ./src/frontend/services/login-redirect.service.ts ***!
  \*********************************************************/
/*! exports provided: LoginRedirectService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginRedirectService", function() { return LoginRedirectService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _auth_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./auth.service */ "PS2H");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");




class LoginRedirectService {
    constructor(authService, router) {
        this.authService = authService;
        this.router = router;
    }
    canActivate() {
        if (this.authService.getToken()) {
            this.router.navigateByUrl('/home');
            return false;
        }
        else {
            return true;
        }
    }
}
LoginRedirectService.ɵfac = function LoginRedirectService_Factory(t) { return new (t || LoginRedirectService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_auth_service__WEBPACK_IMPORTED_MODULE_1__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"])); };
LoginRedirectService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: LoginRedirectService, factory: LoginRedirectService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](LoginRedirectService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _auth_service__WEBPACK_IMPORTED_MODULE_1__["AuthService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }]; }, null); })();


/***/ }),

/***/ "2jQ4":
/*!*************************************************!*\
  !*** ./src/frontend/app/menu/menu.component.ts ***!
  \*************************************************/
/*! exports provided: MenuComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MenuComponent", function() { return MenuComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_animations__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/animations */ "R0Ic");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../services/user.service */ "N74B");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../services/auth.service */ "PS2H");
/* harmony import */ var _services_locale_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../services/locale.service */ "W2Zi");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../services/privileges.service */ "JdIH");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/select */ "d3UM");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/core */ "FKr1");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
















function MenuComponent__svg_svg_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "svg", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "path", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function MenuComponent__svg_svg_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "svg", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "path", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function MenuComponent_button_15_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLinkActive", "bg-gray-900 text-green-400");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 2, "GLOBAL.batches"), " ");
} }
function MenuComponent_button_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLinkActive", "bg-gray-900 text-green-400");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 2, "GLOBAL.batches"), " ");
} }
function MenuComponent_button_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("disabled", !ctx_r4.privilegesService.hasPrivilege("upload"));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLinkActive", "bg-gray-900 text-green-400");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 4, "GLOBAL.upload"), " ");
} }
function MenuComponent_a_31_Template(rf, ctx) { if (rf & 1) {
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "a", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function MenuComponent_a_31_Template_a_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r9); const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r8.closeprofileDropDown(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate1"]("routerLink", "/profile/", ctx_r5.userService.user["id"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 2, "USER.my_profile"));
} }
function MenuComponent_div_35_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "i", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("settings_active", ctx_r6.location.path().includes("settings"));
} }
function MenuComponent_mat_option_42_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-option", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const lang_r10 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("value", lang_r10[0]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](lang_r10[1]);
} }
class MenuComponent {
    constructor(router, location, userService, authService, localeService, activatedRoute, privilegesService, localeStorageService) {
        this.router = router;
        this.location = location;
        this.userService = userService;
        this.authService = authService;
        this.localeService = localeService;
        this.activatedRoute = activatedRoute;
        this.privilegesService = privilegesService;
        this.localeStorageService = localeStorageService;
        this.profileDropdownCurrentState = 'hide';
        this.profileSettingsCurrentState = 'hide';
        this.mobileMenuState = 'hide';
        this.image_url = 'assets/imgs/logo_opencapture.png';
    }
    ngOnInit() {
        this.authService.headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]().set('Authorization', 'Bearer ' + this.authService.getToken());
        this.userService.user = this.userService.getUserFromLocal();
        this.localeService.getLocales();
        this.localeService.getCurrentLocale();
    }
    getSplitterOrVerifier() {
        return this.localeStorageService.get('splitter_or_verifier');
    }
    toggleProfileDropdown() {
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'hide' ? 'show' : 'hide';
        this.profileSettingsCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState == 'show' ? 'hide' : this.profileSettingsCurrentState;
    }
    closeprofileDropDown() {
        this.profileDropdownCurrentState = 'hide';
    }
    toggleMobileMenu() {
        this.mobileMenuState = this.mobileMenuState === 'hide' ? 'show' : 'hide';
    }
}
MenuComponent.ɵfac = function MenuComponent_Factory(t) { return new (t || MenuComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common__WEBPACK_IMPORTED_MODULE_4__["Location"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_5__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_6__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_locale_service__WEBPACK_IMPORTED_MODULE_7__["LocaleService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_8__["PrivilegesService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_9__["LocalStorageService"])); };
MenuComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: MenuComponent, selectors: [["app-menu"]], decls: 43, vars: 26, consts: [[1, "shadow-md", 2, "background", "#f8f9fa"], [1, "max-w-7xl", "mx-auto", "px-2", "sm:px-6", "lg:px-8"], [1, "relative", "flex", "items-center", "justify-between", "h-16"], [1, "absolute", "inset-y-0", "left-0", "flex", "items-center", "sm:hidden"], ["aria-expanded", "false", 1, "inline-flex", "items-center", "justify-center", "p-2", "rounded-md", "text-gray-600", "hover:text-white", "hover:bg-gray-900", "focus:ring-2", "focus:ring-inset", "focus:ring-gray-900", 3, "click"], ["class", "block h-6 w-6", "xmlns", "http://www.w3.org/2000/svg", "fill", "none", "viewBox", "0 0 24 24", "stroke", "currentColor", "aria-hidden", "true", 4, "ngIf"], [1, "flex-1", "flex", "items-center", "justify-center", "sm:items-stretch", "sm:justify-start"], [1, "flex-shrink-0", "flex", "items-center"], ["src", "assets/imgs/logo_opencapture.png", "alt", "Open-Capture logo", 1, "hidden", "lg:block", "h-10", "w-auto"], [1, "hidden", "sm:block", "sm:ml-6"], [1, "flex", "space-x-4"], ["mat-flat-button", "", "routerLink", "/home", 1, "text-gray-500", "hover:bg-green-400", "hover:text-white", "px-3", "py-2", "text-sm", "font-medium", "transition", "duration-300", 3, "routerLinkActive"], ["mat-flat-button", "", "routerLink", "/verifier", "class", "text-gray-500 hover:bg-green-400 hover:text-white px-3 py-2 text-sm font-medium transition duration-300", 3, "routerLinkActive", 4, "ngIf"], ["mat-flat-button", "", "routerLink", "/splitter", "class", "text-gray-500 hover:bg-green-400 hover:text-white px-3 py-2 text-sm font-medium transition duration-300", 3, "routerLinkActive", 4, "ngIf"], ["mat-flat-button", "", "routerLink", "/upload", "class", "text-gray-500 hover:bg-green-400 hover:text-white px-3 py-2 text-sm font-medium transition duration-300", 3, "routerLinkActive", "disabled", 4, "ngIf"], [1, "absolute", "inset-y-0", "right-0", "flex", "items-center", "pr-2", "sm:static", "sm:inset-auto", "sm:ml-6", "sm:pr-0"], [1, "ml-3", "relative", "mr-2"], ["mat-mini-fab", "", "id", "user-menu", "aria-haspopup", "true", 1, "bg-green-400", "hover:ring-4", "hover:ring-offset-4", "hover:ring-green-400", "hover:ring-opacity-60", 3, "click"], [1, "fas", "fa-users-cog"], ["role", "menu", "aria-orientation", "vertical", "aria-labelledby", "user-menu", 1, "origin-top-right", "absolute", "md:right-0", "mt-2", "w-56", "rounded-md", "shadow-lg", "py-1", "bg-white", "ring-1", "ring-black", "ring-opacity-5", "z-50"], [1, "block", "text-center", "mb-2", "text-gray-900"], ["class", "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 relative", "role", "menuitem", 3, "routerLink", "click", 4, "ngIf"], ["routerLink", "/logout", "role", "menuitem", 1, "block", "px-4", "py-2", "text-sm", "text-gray-700", "hover:bg-gray-100", "relative", 3, "click"], ["class", "ml-3 relative", 4, "ngIf"], [1, "ml-3", "relative"], [1, "origin-top-right", "right-0", "mt-4", "w-32"], [3, "value", "selectionChange", "valueChange"], [3, "value", 4, "ngFor", "ngForOf"], ["xmlns", "http://www.w3.org/2000/svg", "fill", "none", "viewBox", "0 0 24 24", "stroke", "currentColor", "aria-hidden", "true", 1, "block", "h-6", "w-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M4 6h16M4 12h16M4 18h16"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M6 18L18 6M6 6l12 12"], ["mat-flat-button", "", "routerLink", "/verifier", 1, "text-gray-500", "hover:bg-green-400", "hover:text-white", "px-3", "py-2", "text-sm", "font-medium", "transition", "duration-300", 3, "routerLinkActive"], ["mat-flat-button", "", "routerLink", "/splitter", 1, "text-gray-500", "hover:bg-green-400", "hover:text-white", "px-3", "py-2", "text-sm", "font-medium", "transition", "duration-300", 3, "routerLinkActive"], ["mat-flat-button", "", "routerLink", "/upload", 1, "text-gray-500", "hover:bg-green-400", "hover:text-white", "px-3", "py-2", "text-sm", "font-medium", "transition", "duration-300", 3, "routerLinkActive"], ["role", "menuitem", 1, "block", "px-4", "py-2", "text-sm", "text-gray-700", "hover:bg-gray-100", "relative", 3, "routerLink", "click"], ["id", "settings-menu", "aria-haspopup", "true", "mat-mini-fab", "", "routerLink", "/settings/panel", 1, "bg-green-400", "hover:ring-4", "hover:ring-offset-4", "hover:ring-green-400", "hover:ring-opacity-60"], [1, "fas", "fa-cog"], [3, "value"]], template: function MenuComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "nav", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "button", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function MenuComponent_Template_button_click_4_listener() { return ctx.toggleMobileMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, MenuComponent__svg_svg_5_Template, 2, 0, "svg", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](6, MenuComponent__svg_svg_6_Template, 2, 0, "svg", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](9, "img", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "button", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](14, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](15, MenuComponent_button_15_Template, 3, 4, "button", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](16, MenuComponent_button_16_Template, 3, 4, "button", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](17, MenuComponent_button_17_Template, 3, 6, "button", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](19, "div", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](20, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](21, "button", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function MenuComponent_Template_button_click_21_listener() { return ctx.toggleProfileDropdown(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](22, "i", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](23, "div", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](24, "span", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](25, "b");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](26);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](27);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](28, "i");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](29);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](30, "hr");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](31, MenuComponent_a_31_Template, 3, 4, "a", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](32, "a", 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function MenuComponent_Template_a_click_32_listener() { return ctx.closeprofileDropDown(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](33);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](34, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](35, MenuComponent_div_35_Template, 3, 2, "div", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](36, "div", 24);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](37, "mat-form-field", 25);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](38, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](39);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](40, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](41, "mat-select", 26);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("selectionChange", function MenuComponent_Template_mat_select_selectionChange_41_listener($event) { return ctx.localeService.changeLocale($event); })("valueChange", function MenuComponent_Template_mat_select_valueChange_41_listener($event) { return ctx.localeService.currentLang = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](42, MenuComponent_mat_option_42_Template, 2, 2, "mat-option", 27);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.mobileMenuState == "hide");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.mobileMenuState == "show");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("routerLinkActive", "bg-gray-900 text-green-400");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](14, 20, "GLOBAL.home"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.location.path() !== "/home" && ctx.getSplitterOrVerifier() == "verifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.location.path() !== "/home" && ctx.getSplitterOrVerifier() == "splitter");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.location.path() !== "/home");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("settings_active", ctx.location.path().includes("profile/" + ctx.userService.user["id"]));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("@toggle", ctx.profileDropdownCurrentState);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx.userService.user["lastname"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate2"](" ", ctx.userService.user["firstname"], " (", ctx.userService.user["username"], ") ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx.userService.user["role"]["label"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.location.path() !== "/home");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](34, 22, "GLOBAL.log_out"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.getSplitterOrVerifier() != undefined && ctx.privilegesService.hasPrivilege("settings"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](40, 24, "GLOBAL.language"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("value", ctx.localeService.currentLang);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.localeService.langs);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_10__["MatButton"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterLink"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterLinkActive"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterLinkWithHref"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_11__["MatLabel"], _angular_material_select__WEBPACK_IMPORTED_MODULE_12__["MatSelect"], _angular_common__WEBPACK_IMPORTED_MODULE_4__["NgForOf"], _angular_material_core__WEBPACK_IMPORTED_MODULE_13__["MatOption"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_14__["TranslatePipe"]], styles: [".settings_active[_ngcontent-%COMP%] {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n  --tw-ring-offset-width: 2px;\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgba(151, 191, 61, var(--tw-ring-opacity));\n  --tw-ring-opacity: 0.6;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL21lbnUuY29tcG9uZW50LnNjc3MiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdGFpbHdpbmRjc3MvbGliL2xpYi9zdWJzdGl0dXRlQ2xhc3NBcHBseUF0UnVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUNFQSwyR0FBbUI7RUFBbkIseUdBQW1CO0VBQW5CLDRGQUFtQjtFQUFuQiwyQkFBbUI7RUFBbkIsb0JBQW1CO0VBQW5CLDJEQUFtQjtFQUFuQixzQkFBbUI7QURHbkIiLCJmaWxlIjoibWVudS5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5zZXR0aW5nc19hY3RpdmV7XG4gICAgQGFwcGx5IHJpbmctNDtcbiAgICBAYXBwbHkgcmluZy1vZmZzZXQtMjtcbiAgICBAYXBwbHkgcmluZy1ncmVlbi00MDA7XG4gICAgQGFwcGx5IHJpbmctb3BhY2l0eS02MDtcbn0iLCJAdGFpbHdpbmQgYmFzZTtcbkB0YWlsd2luZCBjb21wb25lbnRzO1xuQHRhaWx3aW5kIHV0aWxpdGllczsiXX0= */"], data: { animation: [
            Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["trigger"])('toggle', [
                Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["state"])('hide', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["style"])({
                    display: 'none',
                })),
                Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["state"])('show', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["style"])({
                    display: "block",
                })),
                Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["transition"])('show => hide', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["animate"])('150ms ease-out')),
                Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["transition"])('hide => show', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["animate"])('100ms ease-in'))
            ])
        ] } });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](MenuComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-menu',
                templateUrl: './menu.component.html',
                styleUrls: ['./menu.component.scss'],
                animations: [
                    Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["trigger"])('toggle', [
                        Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["state"])('hide', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["style"])({
                            display: 'none',
                        })),
                        Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["state"])('show', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["style"])({
                            display: "block",
                        })),
                        Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["transition"])('show => hide', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["animate"])('150ms ease-out')),
                        Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["transition"])('hide => show', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_1__["animate"])('100ms ease-in'))
                    ])
                ]
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"] }, { type: _angular_common__WEBPACK_IMPORTED_MODULE_4__["Location"] }, { type: _services_user_service__WEBPACK_IMPORTED_MODULE_5__["UserService"] }, { type: _services_auth_service__WEBPACK_IMPORTED_MODULE_6__["AuthService"] }, { type: _services_locale_service__WEBPACK_IMPORTED_MODULE_7__["LocaleService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"] }, { type: _services_privileges_service__WEBPACK_IMPORTED_MODULE_8__["PrivilegesService"] }, { type: _services_local_storage_service__WEBPACK_IMPORTED_MODULE_9__["LocalStorageService"] }]; }, null); })();


/***/ }),

/***/ "2xKp":
/*!**************************************************************!*\
  !*** ./src/frontend/app/splitter/viewer/viewer.component.ts ***!
  \**************************************************************/
/*! exports provided: SplitterViewerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SplitterViewerComponent", function() { return SplitterViewerComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");


class SplitterViewerComponent {
    constructor() { }
    ngOnInit() {
    }
}
SplitterViewerComponent.ɵfac = function SplitterViewerComponent_Factory(t) { return new (t || SplitterViewerComponent)(); };
SplitterViewerComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: SplitterViewerComponent, selectors: [["app-viewer"]], decls: 2, vars: 0, template: function SplitterViewerComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "viewer works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ2aWV3ZXIuY29tcG9uZW50LnNjc3MifQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](SplitterViewerComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-viewer',
                templateUrl: './viewer.component.html',
                styleUrls: ['./viewer.component.scss']
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "463q":
/*!***************************************************!*\
  !*** ./src/frontend/services/last-url.service.ts ***!
  \***************************************************/
/*! exports provided: LastUrlService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LastUrlService", function() { return LastUrlService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");




/** A router wrapper, adding extra functions. */
class LastUrlService {
    constructor(router) {
        this.router = router;
        this.previousUrl = '';
        this.currentUrl = '';
        this.currentUrl = this.router.url;
        router.events.subscribe(event => {
            if (event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["NavigationEnd"]) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;
            }
            ;
        });
    }
    getPreviousUrl() {
        return this.previousUrl;
    }
}
LastUrlService.ɵfac = function LastUrlService_Factory(t) { return new (t || LastUrlService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"])); };
LastUrlService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: LastUrlService, factory: LastUrlService.ɵfac });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](LastUrlService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"] }]; }, null); })();


/***/ }),

/***/ "7esm":
/*!*********************************!*\
  !*** ./src/frontend/app/env.ts ***!
  \*********************************/
/*! exports provided: API_URL */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "API_URL", function() { return API_URL; });
const API_URL = 'http://192.168.1.28:5000';


/***/ }),

/***/ "9Fms":
/*!********************************************************!*\
  !*** ./src/frontend/services/has-privilege.service.ts ***!
  \********************************************************/
/*! exports provided: HasPrivilegeService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HasPrivilegeService", function() { return HasPrivilegeService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./notifications/notifications.service */ "IspW");
/* harmony import */ var _privileges_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./privileges.service */ "JdIH");






class HasPrivilegeService {
    constructor(router, translate, notify, privilegesService) {
        this.router = router;
        this.translate = translate;
        this.notify = notify;
        this.privilegesService = privilegesService;
    }
    canActivate(route, state) {
        if (route.data.privilege !== undefined) {
            let hasPrivilege = this.privilegesService.hasPrivilege(route.data.privilege);
            if (hasPrivilege) {
                return true;
            }
            else {
                this.translate.get('ERROR.unauthorized').subscribe((translated) => {
                    this.notify.error(translated);
                    this.router.navigateByUrl('/home');
                });
                return false;
            }
        }
        else {
            return true;
        }
    }
}
HasPrivilegeService.ɵfac = function HasPrivilegeService_Factory(t) { return new (t || HasPrivilegeService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_privileges_service__WEBPACK_IMPORTED_MODULE_4__["PrivilegesService"])); };
HasPrivilegeService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: HasPrivilegeService, factory: HasPrivilegeService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](HasPrivilegeService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"] }, { type: _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__["NotificationService"] }, { type: _privileges_service__WEBPACK_IMPORTED_MODULE_4__["PrivilegesService"] }]; }, null); })();


/***/ }),

/***/ "BsYY":
/*!************************************************!*\
  !*** ./src/frontend/app/app-routing.module.ts ***!
  \************************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @biesbjerg/ngx-translate-extract-marker */ "4u49");
/* harmony import */ var _services_login_redirect_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../services/login-redirect.service */ "2VJY");
/* harmony import */ var _services_login_required_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../services/login-required.service */ "uepI");
/* harmony import */ var _login_login_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./login/login.component */ "09X2");
/* harmony import */ var _logout_logout_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./logout/logout.component */ "f9HG");
/* harmony import */ var _home_home_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./home/home.component */ "TIJI");
/* harmony import */ var _not_found_not_found_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./not-found/not-found.component */ "tLbZ");
/* harmony import */ var _register_register_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./register/register.component */ "iw5x");
/* harmony import */ var _profile_profile_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./profile/profile.component */ "aqBn");
/* harmony import */ var _splitter_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./splitter/viewer/viewer.component */ "2xKp");
/* harmony import */ var _splitter_list_list_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./splitter/list/list.component */ "Bu07");
/* harmony import */ var _verifier_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./verifier/viewer/viewer.component */ "H9a8");
/* harmony import */ var _verifier_list_list_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./verifier/list/list.component */ "gdoM");
/* harmony import */ var _upload_upload_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./upload/upload.component */ "hM/l");
/* harmony import */ var _settings_panel_panel_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./settings/panel/panel.component */ "vrQ+");
/* harmony import */ var _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../services/has-privilege.service */ "9Fms");




















const routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: _home_home_component__WEBPACK_IMPORTED_MODULE_7__["HomeComponent"], data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('GLOBAL.home'), image: 'assets/imgs/logo_opencapture.png' }, canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_4__["LoginRequiredService"]] },
    { path: 'login', component: _login_login_component__WEBPACK_IMPORTED_MODULE_5__["LoginComponent"], data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('GLOBAL.login') }, canActivate: [_services_login_redirect_service__WEBPACK_IMPORTED_MODULE_3__["LoginRedirectService"]] },
    { path: 'register', component: _register_register_component__WEBPACK_IMPORTED_MODULE_9__["RegisterComponent"], data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('GLOBAL.register') }, canActivate: [_services_login_redirect_service__WEBPACK_IMPORTED_MODULE_3__["LoginRedirectService"]] },
    { path: 'logout', component: _logout_logout_component__WEBPACK_IMPORTED_MODULE_6__["LogoutComponent"], canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_4__["LoginRequiredService"]] },
    { path: 'profile/:id', component: _profile_profile_component__WEBPACK_IMPORTED_MODULE_10__["UserProfileComponent"], canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_4__["LoginRequiredService"]] },
    {
        path: 'splitter/viewer/:id',
        component: _splitter_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_11__["SplitterViewerComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SPLITTER.viewer'), privilege: 'splitter' },
        canActivate: [
            _services_login_required_service__WEBPACK_IMPORTED_MODULE_4__["LoginRequiredService"],
            _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_17__["HasPrivilegeService"]
        ]
    },
    {
        path: 'splitter/list',
        component: _splitter_list_list_component__WEBPACK_IMPORTED_MODULE_12__["SplitterListComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SPLITTER.list'), privilege: 'splitter' },
        canActivate: [
            _services_login_required_service__WEBPACK_IMPORTED_MODULE_4__["LoginRequiredService"],
            _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_17__["HasPrivilegeService"]
        ],
    },
    { path: 'splitter', redirectTo: 'splitter/list', pathMatch: 'full' },
    {
        path: 'verifier/viewer',
        component: _verifier_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_13__["VerifierViewerComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('VERIFIER.viewer'), privilege: 'verifier' },
        canActivate: [
            _services_login_required_service__WEBPACK_IMPORTED_MODULE_4__["LoginRequiredService"],
            _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_17__["HasPrivilegeService"]
        ]
    },
    {
        path: 'verifier/list',
        component: _verifier_list_list_component__WEBPACK_IMPORTED_MODULE_14__["VerifierListComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('VERIFIER.list'), privilege: 'verifier' },
        canActivate: [
            _services_login_required_service__WEBPACK_IMPORTED_MODULE_4__["LoginRequiredService"],
            _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_17__["HasPrivilegeService"]
        ]
    },
    { path: 'verifier', redirectTo: 'verifier/list', pathMatch: 'full' },
    {
        path: 'upload',
        component: _upload_upload_component__WEBPACK_IMPORTED_MODULE_15__["UploadComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('GLOBAL.upload'), privilege: 'upload' },
        canActivate: [
            _services_login_required_service__WEBPACK_IMPORTED_MODULE_4__["LoginRequiredService"],
            _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_17__["HasPrivilegeService"]
        ]
    },
    {
        path: 'settings/panel',
        component: _settings_panel_panel_component__WEBPACK_IMPORTED_MODULE_16__["PanelComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('GLOBAL.settings'), privilege: 'settings' },
        canActivate: [
            _services_login_required_service__WEBPACK_IMPORTED_MODULE_4__["LoginRequiredService"],
            _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_17__["HasPrivilegeService"]
        ]
    },
    { path: '404', component: _not_found_not_found_component__WEBPACK_IMPORTED_MODULE_8__["NotFoundComponent"] },
    { path: '**', redirectTo: '404' },
];
class AppRoutingModule {
}
AppRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
AppRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); }, imports: [[
            _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forRoot(routes, { useHash: true })
        ], _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AppRoutingModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                imports: [
                    _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forRoot(routes, { useHash: true })
                ],
                exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "Bu07":
/*!**********************************************************!*\
  !*** ./src/frontend/app/splitter/list/list.component.ts ***!
  \**********************************************************/
/*! exports provided: SplitterListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SplitterListComponent", function() { return SplitterListComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../services/local-storage.service */ "/azQ");



class SplitterListComponent {
    constructor(localeStorageService) {
        this.localeStorageService = localeStorageService;
    }
    ngOnInit() {
        this.localeStorageService.save('splitter_or_verifier', 'splitter');
    }
}
SplitterListComponent.ɵfac = function SplitterListComponent_Factory(t) { return new (t || SplitterListComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_1__["LocalStorageService"])); };
SplitterListComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: SplitterListComponent, selectors: [["app-list"]], decls: 2, vars: 0, template: function SplitterListComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "list works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsaXN0LmNvbXBvbmVudC5zY3NzIn0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](SplitterListComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-list',
                templateUrl: './list.component.html',
                styleUrls: ['./list.component.scss']
            }]
    }], function () { return [{ type: _services_local_storage_service__WEBPACK_IMPORTED_MODULE_1__["LocalStorageService"] }]; }, null); })();


/***/ }),

/***/ "G9b+":
/*!****************************************!*\
  !*** ./src/frontend/app/app.module.ts ***!
  \****************************************/
/*! exports provided: createTranslateLoader, AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createTranslateLoader", function() { return createTranslateLoader; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _app_material_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app-material.module */ "cCsE");
/* harmony import */ var _services_services_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../services/services.module */ "nG5W");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/platform-browser/animations */ "R1ws");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _ngx_translate_http_loader__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @ngx-translate/http-loader */ "mqiu");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./app-routing.module */ "BsYY");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./app.component */ "pnQW");
/* harmony import */ var _verifier_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./verifier/viewer/viewer.component */ "H9a8");
/* harmony import */ var _verifier_list_list_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./verifier/list/list.component */ "gdoM");
/* harmony import */ var _splitter_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./splitter/viewer/viewer.component */ "2xKp");
/* harmony import */ var _splitter_list_list_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./splitter/list/list.component */ "Bu07");
/* harmony import */ var _login_login_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./login/login.component */ "09X2");
/* harmony import */ var _logout_logout_component__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./logout/logout.component */ "f9HG");
/* harmony import */ var _home_home_component__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./home/home.component */ "TIJI");
/* harmony import */ var _menu_menu_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./menu/menu.component */ "2jQ4");
/* harmony import */ var _register_register_component__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./register/register.component */ "iw5x");
/* harmony import */ var _not_found_not_found_component__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./not-found/not-found.component */ "tLbZ");
/* harmony import */ var _profile_profile_component__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./profile/profile.component */ "aqBn");
/* harmony import */ var _upload_upload_component__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./upload/upload.component */ "hM/l");
/* harmony import */ var ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ngx-file-drag-drop */ "Cqmy");
/* harmony import */ var _settings_users_list_list_component__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./settings/users/list/list.component */ "tPvy");
/* harmony import */ var _settings_panel_panel_component__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./settings/panel/panel.component */ "vrQ+");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _custom_mat_paginator__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./custom-mat-paginator */ "X/RA");
/* harmony import */ var _services_last_url_service__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ../services/last-url.service */ "463q");
/* harmony import */ var _settings_about_us_about_us_component__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./settings/about-us/about-us.component */ "fLAP");
/* harmony import */ var _settings_version_update_version_update_component__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./settings/version-update/version-update.component */ "1PXZ");
/* harmony import */ var _settings_roles_roles_component__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./settings/roles/roles.component */ "/0w2");





































function createTranslateLoader(http) {
    return new _ngx_translate_http_loader__WEBPACK_IMPORTED_MODULE_8__["TranslateHttpLoader"](http, 'assets/i18n/frontend/', '.json');
}
class AppModule {
    constructor(routerExtService) {
        this.routerExtService = routerExtService;
    }
}
AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_11__["AppComponent"]] });
AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ factory: function AppModule_Factory(t) { return new (t || AppModule)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_services_last_url_service__WEBPACK_IMPORTED_MODULE_29__["LastUrlService"])); }, providers: [
        _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["Title"],
        _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateService"],
        _services_last_url_service__WEBPACK_IMPORTED_MODULE_29__["LastUrlService"],
        { provide: _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__["MAT_FORM_FIELD_DEFAULT_OPTIONS"], useValue: { appearance: 'outline' } },
        {
            provide: _angular_material_paginator__WEBPACK_IMPORTED_MODULE_27__["MatPaginatorIntl"],
            useClass: _custom_mat_paginator__WEBPACK_IMPORTED_MODULE_28__["CustomMatPaginatorIntl"]
        }
    ], imports: [[
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
            _app_routing_module__WEBPACK_IMPORTED_MODULE_10__["AppRoutingModule"],
            _app_material_module__WEBPACK_IMPORTED_MODULE_2__["AppMaterialModule"],
            _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
            _angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClientModule"],
            _services_services_module__WEBPACK_IMPORTED_MODULE_3__["ServicesModule"],
            _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateModule"].forRoot({
                defaultLanguage: 'fra',
                loader: {
                    provide: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateLoader"],
                    useFactory: (createTranslateLoader),
                    deps: [_angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClient"]]
                }
            }),
            _angular_forms__WEBPACK_IMPORTED_MODULE_9__["ReactiveFormsModule"],
            _angular_forms__WEBPACK_IMPORTED_MODULE_9__["FormsModule"],
            ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_24__["NgxFileDragDropModule"],
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_11__["AppComponent"],
        _verifier_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_12__["VerifierViewerComponent"],
        _verifier_list_list_component__WEBPACK_IMPORTED_MODULE_13__["VerifierListComponent"],
        _splitter_list_list_component__WEBPACK_IMPORTED_MODULE_15__["SplitterListComponent"],
        _splitter_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_14__["SplitterViewerComponent"],
        _login_login_component__WEBPACK_IMPORTED_MODULE_16__["LoginComponent"],
        _logout_logout_component__WEBPACK_IMPORTED_MODULE_17__["LogoutComponent"],
        _home_home_component__WEBPACK_IMPORTED_MODULE_18__["HomeComponent"],
        _menu_menu_component__WEBPACK_IMPORTED_MODULE_19__["MenuComponent"],
        _register_register_component__WEBPACK_IMPORTED_MODULE_20__["RegisterComponent"],
        _not_found_not_found_component__WEBPACK_IMPORTED_MODULE_21__["NotFoundComponent"],
        _profile_profile_component__WEBPACK_IMPORTED_MODULE_22__["UserProfileComponent"],
        _upload_upload_component__WEBPACK_IMPORTED_MODULE_23__["UploadComponent"],
        _settings_users_list_list_component__WEBPACK_IMPORTED_MODULE_25__["UserListComponent"],
        _settings_panel_panel_component__WEBPACK_IMPORTED_MODULE_26__["PanelComponent"],
        _settings_about_us_about_us_component__WEBPACK_IMPORTED_MODULE_30__["AboutUsComponent"],
        _settings_version_update_version_update_component__WEBPACK_IMPORTED_MODULE_31__["VersionUpdateComponent"],
        _settings_roles_roles_component__WEBPACK_IMPORTED_MODULE_32__["RolesComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
        _app_routing_module__WEBPACK_IMPORTED_MODULE_10__["AppRoutingModule"],
        _app_material_module__WEBPACK_IMPORTED_MODULE_2__["AppMaterialModule"],
        _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
        _angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClientModule"],
        _services_services_module__WEBPACK_IMPORTED_MODULE_3__["ServicesModule"], _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateModule"], _angular_forms__WEBPACK_IMPORTED_MODULE_9__["ReactiveFormsModule"],
        _angular_forms__WEBPACK_IMPORTED_MODULE_9__["FormsModule"],
        ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_24__["NgxFileDragDropModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](AppModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"],
        args: [{
                declarations: [
                    _app_component__WEBPACK_IMPORTED_MODULE_11__["AppComponent"],
                    _verifier_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_12__["VerifierViewerComponent"],
                    _verifier_list_list_component__WEBPACK_IMPORTED_MODULE_13__["VerifierListComponent"],
                    _splitter_list_list_component__WEBPACK_IMPORTED_MODULE_15__["SplitterListComponent"],
                    _splitter_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_14__["SplitterViewerComponent"],
                    _login_login_component__WEBPACK_IMPORTED_MODULE_16__["LoginComponent"],
                    _logout_logout_component__WEBPACK_IMPORTED_MODULE_17__["LogoutComponent"],
                    _home_home_component__WEBPACK_IMPORTED_MODULE_18__["HomeComponent"],
                    _menu_menu_component__WEBPACK_IMPORTED_MODULE_19__["MenuComponent"],
                    _register_register_component__WEBPACK_IMPORTED_MODULE_20__["RegisterComponent"],
                    _not_found_not_found_component__WEBPACK_IMPORTED_MODULE_21__["NotFoundComponent"],
                    _profile_profile_component__WEBPACK_IMPORTED_MODULE_22__["UserProfileComponent"],
                    _upload_upload_component__WEBPACK_IMPORTED_MODULE_23__["UploadComponent"],
                    _settings_users_list_list_component__WEBPACK_IMPORTED_MODULE_25__["UserListComponent"],
                    _settings_panel_panel_component__WEBPACK_IMPORTED_MODULE_26__["PanelComponent"],
                    _settings_about_us_about_us_component__WEBPACK_IMPORTED_MODULE_30__["AboutUsComponent"],
                    _settings_version_update_version_update_component__WEBPACK_IMPORTED_MODULE_31__["VersionUpdateComponent"],
                    _settings_roles_roles_component__WEBPACK_IMPORTED_MODULE_32__["RolesComponent"]
                ],
                imports: [
                    _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                    _app_routing_module__WEBPACK_IMPORTED_MODULE_10__["AppRoutingModule"],
                    _app_material_module__WEBPACK_IMPORTED_MODULE_2__["AppMaterialModule"],
                    _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
                    _angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClientModule"],
                    _services_services_module__WEBPACK_IMPORTED_MODULE_3__["ServicesModule"],
                    _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateModule"].forRoot({
                        defaultLanguage: 'fra',
                        loader: {
                            provide: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateLoader"],
                            useFactory: (createTranslateLoader),
                            deps: [_angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClient"]]
                        }
                    }),
                    _angular_forms__WEBPACK_IMPORTED_MODULE_9__["ReactiveFormsModule"],
                    _angular_forms__WEBPACK_IMPORTED_MODULE_9__["FormsModule"],
                    ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_24__["NgxFileDragDropModule"],
                ],
                providers: [
                    _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["Title"],
                    _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateService"],
                    _services_last_url_service__WEBPACK_IMPORTED_MODULE_29__["LastUrlService"],
                    { provide: _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__["MAT_FORM_FIELD_DEFAULT_OPTIONS"], useValue: { appearance: 'outline' } },
                    {
                        provide: _angular_material_paginator__WEBPACK_IMPORTED_MODULE_27__["MatPaginatorIntl"],
                        useClass: _custom_mat_paginator__WEBPACK_IMPORTED_MODULE_28__["CustomMatPaginatorIntl"]
                    }
                ],
                bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_11__["AppComponent"]]
            }]
    }], function () { return [{ type: _services_last_url_service__WEBPACK_IMPORTED_MODULE_29__["LastUrlService"] }]; }, null); })();


/***/ }),

/***/ "GI+y":
/*!**************************************************************************!*\
  !*** ./src/frontend/services/confirm-dialog/confirm-dialog.component.ts ***!
  \**************************************************************************/
/*! exports provided: ConfirmDialogComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfirmDialogComponent", function() { return ConfirmDialogComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/button */ "bTqV");





class ConfirmDialogComponent {
    constructor(data) {
        this.data = data;
    }
    ngOnInit() { }
}
ConfirmDialogComponent.ɵfac = function ConfirmDialogComponent_Factory(t) { return new (t || ConfirmDialogComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MAT_DIALOG_DATA"])); };
ConfirmDialogComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: ConfirmDialogComponent, selectors: [["app-confirm-dialog"]], decls: 10, vars: 6, consts: [["mat-dialog-title", ""], [1, "border-green-400", "-mt-4", "mb-4"], [1, "mat-typography"], ["align", "end"], ["mat-button", "", "mat-dialog-close", ""], ["mat-button", "", "cdkFocusInitial", "", 3, "mat-dialog-close", "color"]], template: function ConfirmDialogComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "h2", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "hr", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "mat-dialog-content", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "mat-dialog-actions", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "button", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "button", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx.data.confirmTitle);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", ctx.data.confirmText, "\n");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx.data.cancelButton);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("color", ctx.data.confirmButtonColor);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("mat-dialog-close", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx.data.confirmButton);
    } }, directives: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogTitle"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogContent"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogActions"], _angular_material_button__WEBPACK_IMPORTED_MODULE_2__["MatButton"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MatDialogClose"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjb25maXJtLWRpYWxvZy5jb21wb25lbnQuc2NzcyJ9 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ConfirmDialogComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-confirm-dialog',
                templateUrl: './confirm-dialog.component.html',
                styleUrls: ['./confirm-dialog.component.scss']
            }]
    }], function () { return [{ type: undefined, decorators: [{
                type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Inject"],
                args: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_1__["MAT_DIALOG_DATA"]]
            }] }]; }, null); })();


/***/ }),

/***/ "H9a8":
/*!**************************************************************!*\
  !*** ./src/frontend/app/verifier/viewer/viewer.component.ts ***!
  \**************************************************************/
/*! exports provided: VerifierViewerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VerifierViewerComponent", function() { return VerifierViewerComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");


class VerifierViewerComponent {
    constructor() { }
    ngOnInit() {
    }
}
VerifierViewerComponent.ɵfac = function VerifierViewerComponent_Factory(t) { return new (t || VerifierViewerComponent)(); };
VerifierViewerComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: VerifierViewerComponent, selectors: [["app-viewer"]], decls: 2, vars: 0, template: function VerifierViewerComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "viewer works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ2aWV3ZXIuY29tcG9uZW50LnNjc3MifQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](VerifierViewerComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-viewer',
                templateUrl: './viewer.component.html',
                styleUrls: ['./viewer.component.scss']
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "IspW":
/*!**********************************************************************!*\
  !*** ./src/frontend/services/notifications/notifications.service.ts ***!
  \**********************************************************************/
/*! exports provided: CustomSnackbarComponent, NotificationService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustomSnackbarComponent", function() { return CustomSnackbarComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NotificationService", function() { return NotificationService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/snack-bar */ "dNgK");
/* harmony import */ var _app_env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../app/env */ "7esm");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "tyNb");







class CustomSnackbarComponent {
    constructor(data) {
        this.data = data;
    }
    dismiss() {
        this.data.close();
    }
}
CustomSnackbarComponent.ɵfac = function CustomSnackbarComponent_Factory(t) { return new (t || CustomSnackbarComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_1__["MAT_SNACK_BAR_DATA"])); };
CustomSnackbarComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: CustomSnackbarComponent, selectors: [["custom-snackbar"]], decls: 7, vars: 5, consts: [[1, "notif-container", 3, "click"], [1, "notif-container-icon"], [1, "notif-container-content"], [1, "notif-container-content-msg"], [3, "innerHTML"]], template: function CustomSnackbarComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function CustomSnackbarComponent_Template_div_click_0_listener() { return ctx.dismiss(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "i");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](5, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](6, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMapInterpolate1"]("fa fa-", ctx.data.icon, " fa-2x");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("innerHTML", ctx.data.url, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeHtml"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("innerHTML", ctx.data.message, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeHtml"]);
    } }, styles: [".notif-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding-top: 25px;\n  padding-bottom: 25px;\n  cursor: pointer;\n}\n\n.notif-container-icon[_ngcontent-%COMP%] {\n  display: flex;\n  width: 50px;\n  justify-content: center;\n}\n\n.notif-container-content[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  justify-content: center;\n}\n\n.notif-container-content-msg[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n\n .mat-snack-bar-container {\n  background: white;\n}\n\n .mat-snack-bar-container.error-snackbar {\n  color: red;\n  border: solid 1px red;\n}\n\n .mat-snack-bar-container.success-snackbar {\n  color: green;\n  border: solid 1px green;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL25vdGlmaWNhdGlvbi5zZXJ2aWNlLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxpQkFBQTtFQUNBLG9CQUFBO0VBQ0EsZUFBQTtBQUNGOztBQUNFO0VBQ0UsYUFBQTtFQUNBLFdBQUE7RUFDQSx1QkFBQTtBQUNKOztBQUVFO0VBQ0UsYUFBQTtFQUNBLE9BQUE7RUFDQSx1QkFBQTtBQUFKOztBQUVJO0VBQ0UsYUFBQTtFQUNBLHNCQUFBO0FBQU47O0FBS0E7RUFDRSxpQkFBQTtBQUZGOztBQUlFO0VBQ0UsVUFBQTtFQUNBLHFCQUFBO0FBRko7O0FBS0U7RUFDRSxZQUFBO0VBQ0EsdUJBQUE7QUFISiIsImZpbGUiOiJub3RpZmljYXRpb24uc2VydmljZS5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLm5vdGlmLWNvbnRhaW5lciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIHBhZGRpbmctdG9wOiAyNXB4O1xuICBwYWRkaW5nLWJvdHRvbTogMjVweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuXG4gICYtaWNvbiB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICB3aWR0aDo1MHB4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICB9XG5cbiAgJi1jb250ZW50IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXg6IDE7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cbiAgICAmLW1zZyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB9XG4gIH1cbn1cblxuOjpuZy1kZWVwLm1hdC1zbmFjay1iYXItY29udGFpbmVyIHtcbiAgYmFja2dyb3VuZDogd2hpdGU7XG5cbiAgJi5lcnJvci1zbmFja2JhcntcbiAgICBjb2xvcjogcmVkO1xuICAgIGJvcmRlcjogc29saWQgMXB4IHJlZDtcbiAgfVxuXG4gICYuc3VjY2Vzcy1zbmFja2JhcntcbiAgICBjb2xvcjogZ3JlZW47XG4gICAgYm9yZGVyOiBzb2xpZCAxcHggZ3JlZW47XG4gIH1cbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](CustomSnackbarComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'custom-snackbar',
                templateUrl: 'notification.service.html',
                styleUrls: ['notification.service.scss'],
            }]
    }], function () { return [{ type: undefined, decorators: [{
                type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Inject"],
                args: [_angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_1__["MAT_SNACK_BAR_DATA"]]
            }] }]; }, null); })();
class NotificationService {
    constructor(translate, router, snackBar) {
        this.translate = translate;
        this.router = router;
        this.snackBar = snackBar;
    }
    success(message) {
        const duration = this.getMessageDuration(message, 2000);
        const snackBar = this.snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: duration,
            panelClass: ['success-snackbar', 'mt-20', 'mr-3'],
            verticalPosition: 'top',
            horizontalPosition: 'right',
            data: { message: message, icon: 'info-circle', close: () => { snackBar.dismiss(); } }
        });
    }
    error(message, url = null) {
        const duration = this.getMessageDuration(message, 8000);
        const snackBar = this.snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: duration,
            panelClass: ['error-snackbar', 'mt-20', 'mr-3'],
            verticalPosition: 'top',
            horizontalPosition: 'right',
            data: { url: url, message: message, icon: 'exclamation-triangle', close: () => { snackBar.dismiss(); } }
        });
    }
    handleErrors(err) {
        if (err.status === 0 && err.statusText === 'Unknown Error') {
            let message = this.translate.instant('ERROR.connection_failed') + ' : ' + this.translate.instant('ERROR.is_server_up', { server: _app_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] });
            this.error(message);
            if (this.router.url !== '/login')
                this.router.navigate(['/logout']);
        }
        else if (err.error !== undefined) {
            if (err.error.errors !== undefined) {
                this.error(err.error.errors + ' : ' + err.error.message, err.url);
                if (err.status === 403 || err.status === 404)
                    this.router.navigate(['/login']).then();
                else if (err.error.errors == this.translate.instant('ERROR.jwt_error'))
                    this.router.navigate(['/logout']).then();
            }
            else if (err.error.exception !== undefined)
                this.error(err.error.exception[0].message, err.url);
            else if (err.error.error !== undefined) {
                if (err.error.error[0] !== undefined)
                    this.error(err.error.error[0].message, err.url);
                else
                    this.error(err.error.error.message, err.url);
            }
            else
                this.error(`${err.status} : ${err.statusText}`, err.url);
        }
        else
            this.error(err);
    }
    getMessageDuration(message, minimumDuration) {
        const duration = (message.length / 25) * 1000;
        const maxDuration = 10000;
        if (duration < minimumDuration) {
            return minimumDuration;
        }
        else if (duration > maxDuration) {
            return maxDuration;
        }
        return duration;
    }
}
NotificationService.ɵfac = function NotificationService_Factory(t) { return new (t || NotificationService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_1__["MatSnackBar"])); };
NotificationService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: NotificationService, factory: NotificationService.ɵfac });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](NotificationService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"]
    }], function () { return [{ type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"] }, { type: _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_1__["MatSnackBar"] }]; }, null); })();


/***/ }),

/***/ "JdIH":
/*!*****************************************************!*\
  !*** ./src/frontend/services/privileges.service.ts ***!
  \*****************************************************/
/*! exports provided: PrivilegesService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PrivilegesService", function() { return PrivilegesService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _user_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./user.service */ "N74B");



class PrivilegesService {
    constructor(userService) {
        this.userService = userService;
    }
    hasPrivilege(privilege_id) {
        let found = false;
        let user_privileges = this.userService.getUserFromLocal()['privileges'];
        if (user_privileges) {
            if (user_privileges == '*')
                return true;
            user_privileges.forEach((element) => {
                if (privilege_id == element) {
                    found = true;
                }
            });
            return found;
        }
        return false;
    }
}
PrivilegesService.ɵfac = function PrivilegesService_Factory(t) { return new (t || PrivilegesService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_user_service__WEBPACK_IMPORTED_MODULE_1__["UserService"])); };
PrivilegesService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: PrivilegesService, factory: PrivilegesService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](PrivilegesService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _user_service__WEBPACK_IMPORTED_MODULE_1__["UserService"] }]; }, null); })();


/***/ }),

/***/ "N74B":
/*!***********************************************!*\
  !*** ./src/frontend/services/user.service.ts ***!
  \***********************************************/
/*! exports provided: UserService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserService", function() { return UserService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _local_storage_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./local-storage.service */ "/azQ");




class UserService {
    constructor(http, localStorage) {
        this.http = http;
        this.localStorage = localStorage;
        this.user = {};
    }
    setUser(value) {
        this.user = value;
    }
    getUser() {
        return this.user;
    }
    getUserFromLocal() {
        let token = this.getTokenAuth();
        if (token) {
            return JSON.parse(atob(token));
        }
    }
    getTokenAuth() {
        return this.localStorage.getCookie('OpenCaptureForInvoicesToken_2');
    }
}
UserService.ɵfac = function UserService_Factory(t) { return new (t || UserService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_local_storage_service__WEBPACK_IMPORTED_MODULE_2__["LocalStorageService"])); };
UserService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: UserService, factory: UserService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](UserService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"] }, { type: _local_storage_service__WEBPACK_IMPORTED_MODULE_2__["LocalStorageService"] }]; }, null); })();


/***/ }),

/***/ "PS2H":
/*!***********************************************!*\
  !*** ./src/frontend/services/auth.service.ts ***!
  \***********************************************/
/*! exports provided: AuthService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthService", function() { return AuthService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _user_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./user.service */ "N74B");
/* harmony import */ var _local_storage_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./local-storage.service */ "/azQ");







class AuthService {
    constructor(router, http, userService, localStorage) {
        this.router = router;
        this.http = http;
        this.userService = userService;
        this.localStorage = localStorage;
        this.headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpHeaders"]().set('Authorization', 'Bearer ' + this.getToken());
    }
    setCachedUrl(url) {
        this.localStorage.save('OpenCaptureForInvoicesCachedUrl', url);
    }
    getCachedUrl() {
        return this.localStorage.get('OpenCaptureForInvoicesCachedUrl');
    }
    cleanCachedUrl() {
        return this.localStorage.remove('OpenCaptureForInvoicesCachedUrl');
    }
    setTokenCustom(name, token) {
        this.localStorage.save(name, token);
    }
    getTokenCustom(name) {
        return this.localStorage.get(name);
    }
    setTokens(token, token2, days_before_exp) {
        this.localStorage.setCookie('OpenCaptureForInvoicesToken', token, days_before_exp);
        this.localStorage.setCookie('OpenCaptureForInvoicesToken_2', token2, days_before_exp);
    }
    setTokenAuth(token, days_before_exp) {
        this.localStorage.setCookie('OpenCaptureForInvoicesToken_2', token, days_before_exp);
    }
    getToken() {
        return this.localStorage.getCookie('OpenCaptureForInvoicesToken');
    }
    clearTokens() {
        this.localStorage.deleteCookie('OpenCaptureForInvoicesToken');
        this.localStorage.deleteCookie('OpenCaptureForInvoicesToken_2');
        this.localStorage.remove('splitter_or_verifier');
    }
    logout() {
        this.userService.setUser({});
        this.clearTokens();
        this.router.navigateByUrl("/login");
    }
}
AuthService.ɵfac = function AuthService_Factory(t) { return new (t || AuthService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_user_service__WEBPACK_IMPORTED_MODULE_3__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_local_storage_service__WEBPACK_IMPORTED_MODULE_4__["LocalStorageService"])); };
AuthService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: AuthService, factory: AuthService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AuthService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }, { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"] }, { type: _user_service__WEBPACK_IMPORTED_MODULE_3__["UserService"] }, { type: _local_storage_service__WEBPACK_IMPORTED_MODULE_4__["LocalStorageService"] }]; }, null); })();


/***/ }),

/***/ "TCaw":
/*!*******************************************************************!*\
  !*** ./src/frontend/$$_lazy_route_resource lazy namespace object ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "TCaw";

/***/ }),

/***/ "TIJI":
/*!*************************************************!*\
  !*** ./src/frontend/app/home/home.component.ts ***!
  \*************************************************/
/*! exports provided: HomeComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeComponent", function() { return HomeComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/user.service */ "N74B");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../services/privileges.service */ "JdIH");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/card */ "Wp6s");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");









class HomeComponent {
    constructor(authService, userService, privilegesService, localeStorageService) {
        this.authService = authService;
        this.userService = userService;
        this.privilegesService = privilegesService;
        this.localeStorageService = localeStorageService;
    }
    ngOnInit() {
    }
    setValue(value) {
        this.localeStorageService.save('splitter_or_verifier', value);
    }
}
HomeComponent.ɵfac = function HomeComponent_Factory(t) { return new (t || HomeComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_1__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_2__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_3__["PrivilegesService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_4__["LocalStorageService"])); };
HomeComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: HomeComponent, selectors: [["app-home"]], decls: 13, vars: 10, consts: [[1, "flex", "relative", "justify-center", "items-center", "gap-8", 2, "height", "85vh"], [1, "text-center", "w-full", "lg:w-1/6", "shadow-lg", "transition", "duration-500", "ease-in-out", "transform", "hover:-translate-y-1", "hover:scale-110", "hover:shadow-2xl"], ["routerLink", "/splitter/list", 1, "block", 3, "click"], [1, "bg-splitter", "bg-100", "bg-no-repeat", "bg-center", "w-full", "h-64", "transition", "duration-500", "ease-in-out", "hover:opacity-30"], ["routerLink", "/verifier/list", 1, "block", 3, "click"], [1, "bg-verifier", "bg-60", "bg-no-repeat", "bg-center", "w-full", "h-64", "transition", "duration-500", "ease-in-out", "hover:opacity-30"]], template: function HomeComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-card", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "a", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function HomeComponent_Template_a_click_2_listener() { return ctx.setValue("splitter"); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "mat-card-subtitle");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](6, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "mat-card", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "a", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function HomeComponent_Template_a_click_8_listener() { return ctx.setValue("verifier"); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](9, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "mat-card-subtitle");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](12, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("disabled", !ctx.privilegesService.hasPrivilege("splitter"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](6, 6, "HOME.splitter"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("disabled", !ctx.privilegesService.hasPrivilege("verifier"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](12, 8, "HOME.verifier"), " ");
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCard"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterLinkWithHref"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardSubtitle"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__["TranslatePipe"]], styles: [".disabled[_ngcontent-%COMP%] {\n  opacity: 0.3;\n  pointer-events: none !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2hvbWUuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxZQUFBO0VBQ0EsK0JBQUE7QUFDSiIsImZpbGUiOiJob21lLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmRpc2FibGVke1xuICAgIG9wYWNpdHk6IDAuMztcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZSFpbXBvcnRhbnQ7XG59Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](HomeComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-home',
                templateUrl: './home.component.html',
                styleUrls: ['./home.component.scss']
            }]
    }], function () { return [{ type: _services_auth_service__WEBPACK_IMPORTED_MODULE_1__["AuthService"] }, { type: _services_user_service__WEBPACK_IMPORTED_MODULE_2__["UserService"] }, { type: _services_privileges_service__WEBPACK_IMPORTED_MODULE_3__["PrivilegesService"] }, { type: _services_local_storage_service__WEBPACK_IMPORTED_MODULE_4__["LocalStorageService"] }]; }, null); })();


/***/ }),

/***/ "W2Zi":
/*!*************************************************!*\
  !*** ./src/frontend/services/locale.service.ts ***!
  \*************************************************/
/*! exports provided: LocaleService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LocaleService", function() { return LocaleService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _app_env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../app/env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _auth_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./auth.service */ "PS2H");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./notifications/notifications.service */ "IspW");










class LocaleService {
    constructor(http, authService, translate, notify) {
        this.http = http;
        this.authService = authService;
        this.translate = translate;
        this.notify = notify;
        this.currentLang = '';
        this.langs = [];
    }
    changeLocale(data) {
        const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpHeaders"]().set('Authorization', 'Bearer ' + this.authService.getToken());
        this.http.get(_app_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/i18n/changeLanguage/' + data.value, { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
        })).subscribe();
        this.currentLang = data.value;
        this.translate.use(data.value);
    }
    getCurrentLocale() {
        this.http.get(_app_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/i18n/getCurrentLang').pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
            this.currentLang = data.lang;
            this.translate.use(this.currentLang);
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
        })).subscribe();
    }
    getLocales() {
        const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpHeaders"]().set('Authorization', 'Bearer ' + this.authService.getToken());
        this.http.get(_app_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/i18n/getAllLang', { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
            this.langs = data.langs;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
        })).subscribe();
    }
}
LocaleService.ɵfac = function LocaleService_Factory(t) { return new (t || LocaleService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_auth_service__WEBPACK_IMPORTED_MODULE_5__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_7__["NotificationService"])); };
LocaleService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: LocaleService, factory: LocaleService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](LocaleService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"] }, { type: _auth_service__WEBPACK_IMPORTED_MODULE_5__["AuthService"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateService"] }, { type: _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_7__["NotificationService"] }]; }, null); })();


/***/ }),

/***/ "X/RA":
/*!**************************************************!*\
  !*** ./src/frontend/app/custom-mat-paginator.ts ***!
  \**************************************************/
/*! exports provided: CustomMatPaginatorIntl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustomMatPaginatorIntl", function() { return CustomMatPaginatorIntl; });
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");




class CustomMatPaginatorIntl extends _angular_material_paginator__WEBPACK_IMPORTED_MODULE_0__["MatPaginatorIntl"] {
    constructor(translate) {
        super();
        this.translate = translate;
        this.getRangeLabel = (page, pageSize, length) => {
            if (length == 0 || pageSize == 0) {
                return `0 de ${length}`;
            }
            length = Math.max(length, 0);
            const startIndex = page * pageSize;
            // If the start index exceeds the list length, do not try and fix the end index to the end.
            const endIndex = startIndex < length ?
                Math.min(startIndex + pageSize, length) :
                startIndex + pageSize;
            const nbPage = Math.ceil(length / pageSize);
            //return `${startIndex + 1} - ${endIndex} / ${length} (${page})`;
            return this.translate.instant('PAGINATOR.page') + ` ${page + 1} / ${nbPage}`;
        };
        this.getAndInitTranslations();
    }
    getAndInitTranslations() {
        this.translate.get('PAGINATOR.items_per_page').subscribe((translated) => {
            this.itemsPerPageLabel = translated;
        });
        this.translate.get('PAGINATOR.next_page').subscribe((translated) => {
            this.nextPageLabel = translated;
        });
        this.translate.get('PAGINATOR.first_page').subscribe((translated) => {
            this.firstPageLabel = translated;
        });
        this.translate.get('PAGINATOR.last_page').subscribe((translated) => {
            this.lastPageLabel = translated;
        });
        this.translate.get('PAGINATOR.previous_page').subscribe((translated) => {
            this.previousPageLabel = translated;
        });
        this.changes.next();
    }
}
CustomMatPaginatorIntl.ɵfac = function CustomMatPaginatorIntl_Factory(t) { return new (t || CustomMatPaginatorIntl)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"])); };
CustomMatPaginatorIntl.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: CustomMatPaginatorIntl, factory: CustomMatPaginatorIntl.ɵfac });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](CustomMatPaginatorIntl, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"]
    }], function () { return [{ type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"] }]; }, null); })();


/***/ }),

/***/ "aqBn":
/*!*******************************************************!*\
  !*** ./src/frontend/app/profile/profile.component.ts ***!
  \*******************************************************/
/*! exports provided: UserProfileComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserProfileComponent", function() { return UserProfileComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @biesbjerg/ngx-translate-extract-marker */ "4u49");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_locale_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../services/locale.service */ "W2Zi");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../services/privileges.service */ "JdIH");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/card */ "Wp6s");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/select */ "d3UM");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/core */ "FKr1");























function UserProfileComponent_div_0_span_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "USER.modify_my_profile"));
} }
function UserProfileComponent_div_0_span_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate2"]("", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 2, "USER.modify_profile_of"), " ", ctx_r2.profile["username"], "");
} }
function UserProfileComponent_div_0_ng_container_7_mat_form_field_1_mat_error_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2).$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r7.getErrorMessage(field_r4.id));
} }
function UserProfileComponent_div_0_ng_container_7_mat_form_field_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-form-field", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](4, "input", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](6, UserProfileComponent_div_0_ng_container_7_mat_form_field_1_mat_error_6_Template, 2, 1, "mat-error", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](3, 6, field_r4.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](5, 8, field_r4.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formControl", field_r4.control)("type", field_r4.type)("required", field_r4.required);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", field_r4.control.invalid);
} }
function UserProfileComponent_div_0_ng_container_7_mat_form_field_2_mat_option_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-option", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const option_r11 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("value", option_r11["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](option_r11["label"]);
} }
function UserProfileComponent_div_0_ng_container_7_mat_form_field_2_Template(rf, ctx) { if (rf & 1) {
    const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-form-field", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "mat-select", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("valueChange", function UserProfileComponent_div_0_ng_container_7_mat_form_field_2_Template_mat_select_valueChange_4_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r14); const field_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; return field_r4.control.value = $event; });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, UserProfileComponent_div_0_ng_container_7_mat_form_field_2_mat_option_5_Template, 2, 2, "mat-option", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](3, 4, field_r4.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("disabled", ctx_r6.userService.getUserFromLocal()["privileges"] != "*")("value", field_r4.control.value);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", field_r4.values);
} }
function UserProfileComponent_div_0_ng_container_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, UserProfileComponent_div_0_ng_container_7_mat_form_field_1_Template, 7, 10, "mat-form-field", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, UserProfileComponent_div_0_ng_container_7_mat_form_field_2_Template, 6, 6, "mat-form-field", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const field_r4 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", field_r4.type != "select");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", field_r4.type == "select");
} }
function UserProfileComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    const _r17 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-card", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-card-title", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, UserProfileComponent_div_0_span_3_Template, 3, 3, "span", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, UserProfileComponent_div_0_span_4_Template, 3, 4, "span", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "mat-card-content");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "form", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngSubmit", function UserProfileComponent_div_0_Template_form_ngSubmit_6_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r17); const ctx_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r16.onSubmit(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](7, UserProfileComponent_div_0_ng_container_7_Template, 3, 2, "ng-container", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "button", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](11, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.userId == ctx_r0.userService.user.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r0.userId != ctx_r0.userService.user.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r0.profileForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](11, 4, "USER.modify"), " ");
} }
class UserProfileComponent {
    constructor(http, router, route, formBuilder, authService, userService, translate, notify, localeService, privilegeService) {
        this.http = http;
        this.router = router;
        this.route = route;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.userService = userService;
        this.translate = translate;
        this.notify = notify;
        this.localeService = localeService;
        this.privilegeService = privilegeService;
        this.roles = [];
        this.profileForm = [
            {
                id: 'firstname',
                label: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__["marker"])('USER.firstname'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](),
                required: true,
            },
            {
                id: 'lastname',
                label: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__["marker"])('USER.lastname'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](),
                required: true
            },
            {
                id: 'old_password',
                label: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__["marker"])('USER.old_password'),
                type: 'password',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](),
                required: false
            },
            {
                id: 'new_password',
                label: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__["marker"])('USER.new_password'),
                type: 'password',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](),
                required: false
            },
            {
                id: 'role',
                label: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__["marker"])('USER.role'),
                type: 'select',
                values: [],
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"](),
                required: false
            }
        ];
        this.loading = true;
    }
    ngOnInit() {
        console.log(this.userService.getUserFromLocal()['privileges']);
        this.userId = this.route.snapshot.params['id'];
        let headers = this.authService.headers;
        if (this.userId != this.userService.user.id) {
            if (!this.privilegeService.hasPrivilege('modify_user')) {
                this.notify.error('ERROR.unauthorized');
                this.router.navigateByUrl('/home');
            }
        }
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/roles/list', { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
            data.roles.forEach((element) => {
                if (element.editable) {
                    this.roles.push(element);
                }
                else {
                    if ((this.userService.getUser().privileges == '*')) {
                        this.roles.push(element);
                    }
                }
            });
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
        })).subscribe();
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/users/getById/' + this.userId, { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
            this.profile = data;
            // console.log(this.profile)
            for (let field in this.profile) {
                if (this.profile.hasOwnProperty(field)) {
                    this.profileForm.forEach(element => {
                        if (element.id == field) {
                            element.control.value = this.profile[field];
                            if (element.id == 'role') {
                                element.values = this.roles;
                            }
                        }
                    });
                }
            }
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
        })).subscribe();
    }
    isValidForm() {
        let state = true;
        this.profileForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }
    onSubmit() {
        if (this.isValidForm()) {
            const user = {};
            let headers = this.authService.headers;
            this.profileForm.forEach(element => {
                user[element.id] = element.control.value;
            });
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/users/update/' + this.userId, {
                'args': user,
                'lang': this.localeService.currentLang
            }, {
                headers
            }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
                this.notify.success(this.translate.instant('USER.profile_updated'));
                if (this.userId == this.userService.user.id) {
                    this.userService.setUser(data.user);
                    this.authService.setTokenAuth(btoa(JSON.stringify(this.userService.getUser())), data.days_before_exp);
                }
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
            })).subscribe();
        }
    }
    getErrorMessage(field) {
        let error = '';
        this.profileForm.forEach(element => {
            if (element.id == field)
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
        });
        return error;
    }
}
UserProfileComponent.ɵfac = function UserProfileComponent_Factory(t) { return new (t || UserProfileComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_locale_service__WEBPACK_IMPORTED_MODULE_12__["LocaleService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_13__["PrivilegesService"])); };
UserProfileComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: UserProfileComponent, selectors: [["app-user-profile"]], decls: 1, vars: 1, consts: [["class", "flex justify-center items-center", "style", "height: 85vh", 4, "ngIf"], [1, "flex", "justify-center", "items-center", 2, "height", "85vh"], [1, "text-center", "w-full", "lg:w-1/4"], [1, "mb-10"], [4, "ngIf"], [3, "ngSubmit"], [4, "ngFor", "ngForOf"], [1, "button"], ["type", "submit", "mat-button", "", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300"], ["class", "block", 4, "ngIf"], [1, "block"], ["matInput", "", 3, "formControl", "type", "placeholder", "required"], [3, "disabled", "value", "valueChange"], [3, "value", 4, "ngFor", "ngForOf"], [3, "value"]], template: function UserProfileComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, UserProfileComponent_div_0_Template, 12, 6, "div", 0);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx.loading);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_14__["NgIf"], _angular_material_card__WEBPACK_IMPORTED_MODULE_15__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_15__["MatCardTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_15__["MatCardContent"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgForm"], _angular_common__WEBPACK_IMPORTED_MODULE_14__["NgForOf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_16__["MatButton"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_17__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_17__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_18__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlDirective"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["RequiredValidator"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_17__["MatError"], _angular_material_select__WEBPACK_IMPORTED_MODULE_19__["MatSelect"], _angular_material_core__WEBPACK_IMPORTED_MODULE_20__["MatOption"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwcm9maWxlLmNvbXBvbmVudC5zY3NzIn0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](UserProfileComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-user-profile',
                templateUrl: './profile.component.html',
                styleUrls: ['./profile.component.scss']
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_7__["Router"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"] }, { type: _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormBuilder"] }, { type: _services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"] }, { type: _services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"] }, { type: _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__["NotificationService"] }, { type: _services_locale_service__WEBPACK_IMPORTED_MODULE_12__["LocaleService"] }, { type: _services_privileges_service__WEBPACK_IMPORTED_MODULE_13__["PrivilegesService"] }]; }, null); })();


/***/ }),

/***/ "cCsE":
/*!*************************************************!*\
  !*** ./src/frontend/app/app-material.module.ts ***!
  \*************************************************/
/*! exports provided: APP_DATE_FORMATS, AppMaterialModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "APP_DATE_FORMATS", function() { return APP_DATE_FORMATS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppMaterialModule", function() { return AppMaterialModule; });
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/material/core */ "FKr1");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/autocomplete */ "/1cH");
/* harmony import */ var _angular_material_badge__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/badge */ "TU8p");
/* harmony import */ var _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/bottom-sheet */ "2ChS");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/button-toggle */ "jaxi");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/card */ "Wp6s");
/* harmony import */ var _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/checkbox */ "bSwM");
/* harmony import */ var _angular_material_chips__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/chips */ "A5z7");
/* harmony import */ var _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/datepicker */ "iadO");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/grid-list */ "zkoq");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/icon */ "NFeN");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/menu */ "STbY");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/progress-bar */ "bv9b");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/progress-spinner */ "Xa2L");
/* harmony import */ var _angular_material_radio__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/radio */ "QibW");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/select */ "d3UM");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/slide-toggle */ "1jcm");
/* harmony import */ var _angular_material_slider__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/material/slider */ "5RNC");
/* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @angular/material/snack-bar */ "dNgK");
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @angular/material/sort */ "Dh3D");
/* harmony import */ var _angular_material_stepper__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @angular/material/stepper */ "xHqg");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @angular/material/table */ "+0xr");
/* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! @angular/material/tabs */ "wZkO");
/* harmony import */ var _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! @angular/material/toolbar */ "/t3+");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");
/* harmony import */ var _angular_material_tree__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! @angular/material/tree */ "8yBR");





































const APP_DATE_FORMATS = {
    parse: {
        dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
    },
    display: {
        dateInput: 'input',
        monthYearLabel: { month: 'short', year: 'numeric', day: 'numeric' },
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' },
    }
};
class AppMaterialModule {
}
AppMaterialModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppMaterialModule });
AppMaterialModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ factory: function AppMaterialModule_Factory(t) { return new (t || AppMaterialModule)(); }, providers: [
        { provide: _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MAT_DATE_FORMATS"], useValue: APP_DATE_FORMATS },
    ], imports: [[
            _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_8__["MatCheckboxModule"],
            _angular_material_select__WEBPACK_IMPORTED_MODULE_22__["MatSelectModule"],
            _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_24__["MatSlideToggleModule"],
            _angular_material_input__WEBPACK_IMPORTED_MODULE_15__["MatInputModule"],
            _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_32__["MatTooltipModule"],
            _angular_material_tabs__WEBPACK_IMPORTED_MODULE_30__["MatTabsModule"],
            _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_23__["MatSidenavModule"],
            _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButtonModule"],
            _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardModule"],
            _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_6__["MatButtonToggleModule"],
            _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_20__["MatProgressSpinnerModule"],
            _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_19__["MatProgressBarModule"],
            _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_31__["MatToolbarModule"],
            _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__["MatMenuModule"],
            _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_13__["MatGridListModule"],
            _angular_material_table__WEBPACK_IMPORTED_MODULE_29__["MatTableModule"],
            _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__["MatPaginatorModule"],
            _angular_material_sort__WEBPACK_IMPORTED_MODULE_27__["MatSortModule"],
            _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatDatepickerModule"],
            _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatNativeDateModule"],
            _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__["MatExpansionModule"],
            _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_2__["MatAutocompleteModule"],
            _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_26__["MatSnackBarModule"],
            _angular_material_icon__WEBPACK_IMPORTED_MODULE_14__["MatIconModule"],
            _angular_material_dialog__WEBPACK_IMPORTED_MODULE_11__["MatDialogModule"],
            _angular_material_list__WEBPACK_IMPORTED_MODULE_16__["MatListModule"],
            _angular_material_chips__WEBPACK_IMPORTED_MODULE_9__["MatChipsModule"],
            _angular_material_stepper__WEBPACK_IMPORTED_MODULE_28__["MatStepperModule"],
            _angular_material_radio__WEBPACK_IMPORTED_MODULE_21__["MatRadioModule"],
            _angular_material_slider__WEBPACK_IMPORTED_MODULE_25__["MatSliderModule"],
            _angular_material_badge__WEBPACK_IMPORTED_MODULE_3__["MatBadgeModule"],
            _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_4__["MatBottomSheetModule"],
            _angular_material_tree__WEBPACK_IMPORTED_MODULE_33__["MatTreeModule"],
            _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatRippleModule"],
        ], _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_8__["MatCheckboxModule"],
        _angular_material_select__WEBPACK_IMPORTED_MODULE_22__["MatSelectModule"],
        _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_24__["MatSlideToggleModule"],
        _angular_material_input__WEBPACK_IMPORTED_MODULE_15__["MatInputModule"],
        _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_32__["MatTooltipModule"],
        _angular_material_tabs__WEBPACK_IMPORTED_MODULE_30__["MatTabsModule"],
        _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_23__["MatSidenavModule"],
        _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButtonModule"],
        _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardModule"],
        _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_6__["MatButtonToggleModule"],
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_20__["MatProgressSpinnerModule"],
        _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_19__["MatProgressBarModule"],
        _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_31__["MatToolbarModule"],
        _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__["MatMenuModule"],
        _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_13__["MatGridListModule"],
        _angular_material_table__WEBPACK_IMPORTED_MODULE_29__["MatTableModule"],
        _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__["MatPaginatorModule"],
        _angular_material_sort__WEBPACK_IMPORTED_MODULE_27__["MatSortModule"],
        _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatDatepickerModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatNativeDateModule"],
        _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__["MatExpansionModule"],
        _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_2__["MatAutocompleteModule"],
        _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_26__["MatSnackBarModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_14__["MatIconModule"],
        _angular_material_dialog__WEBPACK_IMPORTED_MODULE_11__["MatDialogModule"],
        _angular_material_list__WEBPACK_IMPORTED_MODULE_16__["MatListModule"],
        _angular_material_chips__WEBPACK_IMPORTED_MODULE_9__["MatChipsModule"],
        _angular_material_stepper__WEBPACK_IMPORTED_MODULE_28__["MatStepperModule"],
        _angular_material_radio__WEBPACK_IMPORTED_MODULE_21__["MatRadioModule"],
        _angular_material_slider__WEBPACK_IMPORTED_MODULE_25__["MatSliderModule"],
        _angular_material_badge__WEBPACK_IMPORTED_MODULE_3__["MatBadgeModule"],
        _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_4__["MatBottomSheetModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatRippleModule"],
        _angular_material_tree__WEBPACK_IMPORTED_MODULE_33__["MatTreeModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppMaterialModule, { imports: [_angular_material_checkbox__WEBPACK_IMPORTED_MODULE_8__["MatCheckboxModule"],
        _angular_material_select__WEBPACK_IMPORTED_MODULE_22__["MatSelectModule"],
        _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_24__["MatSlideToggleModule"],
        _angular_material_input__WEBPACK_IMPORTED_MODULE_15__["MatInputModule"],
        _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_32__["MatTooltipModule"],
        _angular_material_tabs__WEBPACK_IMPORTED_MODULE_30__["MatTabsModule"],
        _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_23__["MatSidenavModule"],
        _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButtonModule"],
        _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardModule"],
        _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_6__["MatButtonToggleModule"],
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_20__["MatProgressSpinnerModule"],
        _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_19__["MatProgressBarModule"],
        _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_31__["MatToolbarModule"],
        _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__["MatMenuModule"],
        _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_13__["MatGridListModule"],
        _angular_material_table__WEBPACK_IMPORTED_MODULE_29__["MatTableModule"],
        _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__["MatPaginatorModule"],
        _angular_material_sort__WEBPACK_IMPORTED_MODULE_27__["MatSortModule"],
        _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatDatepickerModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatNativeDateModule"],
        _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__["MatExpansionModule"],
        _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_2__["MatAutocompleteModule"],
        _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_26__["MatSnackBarModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_14__["MatIconModule"],
        _angular_material_dialog__WEBPACK_IMPORTED_MODULE_11__["MatDialogModule"],
        _angular_material_list__WEBPACK_IMPORTED_MODULE_16__["MatListModule"],
        _angular_material_chips__WEBPACK_IMPORTED_MODULE_9__["MatChipsModule"],
        _angular_material_stepper__WEBPACK_IMPORTED_MODULE_28__["MatStepperModule"],
        _angular_material_radio__WEBPACK_IMPORTED_MODULE_21__["MatRadioModule"],
        _angular_material_slider__WEBPACK_IMPORTED_MODULE_25__["MatSliderModule"],
        _angular_material_badge__WEBPACK_IMPORTED_MODULE_3__["MatBadgeModule"],
        _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_4__["MatBottomSheetModule"],
        _angular_material_tree__WEBPACK_IMPORTED_MODULE_33__["MatTreeModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatRippleModule"]], exports: [_angular_material_checkbox__WEBPACK_IMPORTED_MODULE_8__["MatCheckboxModule"],
        _angular_material_select__WEBPACK_IMPORTED_MODULE_22__["MatSelectModule"],
        _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_24__["MatSlideToggleModule"],
        _angular_material_input__WEBPACK_IMPORTED_MODULE_15__["MatInputModule"],
        _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_32__["MatTooltipModule"],
        _angular_material_tabs__WEBPACK_IMPORTED_MODULE_30__["MatTabsModule"],
        _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_23__["MatSidenavModule"],
        _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButtonModule"],
        _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardModule"],
        _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_6__["MatButtonToggleModule"],
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_20__["MatProgressSpinnerModule"],
        _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_19__["MatProgressBarModule"],
        _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_31__["MatToolbarModule"],
        _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__["MatMenuModule"],
        _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_13__["MatGridListModule"],
        _angular_material_table__WEBPACK_IMPORTED_MODULE_29__["MatTableModule"],
        _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__["MatPaginatorModule"],
        _angular_material_sort__WEBPACK_IMPORTED_MODULE_27__["MatSortModule"],
        _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatDatepickerModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatNativeDateModule"],
        _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__["MatExpansionModule"],
        _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_2__["MatAutocompleteModule"],
        _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_26__["MatSnackBarModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_14__["MatIconModule"],
        _angular_material_dialog__WEBPACK_IMPORTED_MODULE_11__["MatDialogModule"],
        _angular_material_list__WEBPACK_IMPORTED_MODULE_16__["MatListModule"],
        _angular_material_chips__WEBPACK_IMPORTED_MODULE_9__["MatChipsModule"],
        _angular_material_stepper__WEBPACK_IMPORTED_MODULE_28__["MatStepperModule"],
        _angular_material_radio__WEBPACK_IMPORTED_MODULE_21__["MatRadioModule"],
        _angular_material_slider__WEBPACK_IMPORTED_MODULE_25__["MatSliderModule"],
        _angular_material_badge__WEBPACK_IMPORTED_MODULE_3__["MatBadgeModule"],
        _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_4__["MatBottomSheetModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatRippleModule"],
        _angular_material_tree__WEBPACK_IMPORTED_MODULE_33__["MatTreeModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](AppMaterialModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"],
        args: [{
                imports: [
                    _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_8__["MatCheckboxModule"],
                    _angular_material_select__WEBPACK_IMPORTED_MODULE_22__["MatSelectModule"],
                    _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_24__["MatSlideToggleModule"],
                    _angular_material_input__WEBPACK_IMPORTED_MODULE_15__["MatInputModule"],
                    _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_32__["MatTooltipModule"],
                    _angular_material_tabs__WEBPACK_IMPORTED_MODULE_30__["MatTabsModule"],
                    _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_23__["MatSidenavModule"],
                    _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButtonModule"],
                    _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardModule"],
                    _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_6__["MatButtonToggleModule"],
                    _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_20__["MatProgressSpinnerModule"],
                    _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_19__["MatProgressBarModule"],
                    _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_31__["MatToolbarModule"],
                    _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__["MatMenuModule"],
                    _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_13__["MatGridListModule"],
                    _angular_material_table__WEBPACK_IMPORTED_MODULE_29__["MatTableModule"],
                    _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__["MatPaginatorModule"],
                    _angular_material_sort__WEBPACK_IMPORTED_MODULE_27__["MatSortModule"],
                    _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatDatepickerModule"],
                    _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatNativeDateModule"],
                    _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__["MatExpansionModule"],
                    _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_2__["MatAutocompleteModule"],
                    _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_26__["MatSnackBarModule"],
                    _angular_material_icon__WEBPACK_IMPORTED_MODULE_14__["MatIconModule"],
                    _angular_material_dialog__WEBPACK_IMPORTED_MODULE_11__["MatDialogModule"],
                    _angular_material_list__WEBPACK_IMPORTED_MODULE_16__["MatListModule"],
                    _angular_material_chips__WEBPACK_IMPORTED_MODULE_9__["MatChipsModule"],
                    _angular_material_stepper__WEBPACK_IMPORTED_MODULE_28__["MatStepperModule"],
                    _angular_material_radio__WEBPACK_IMPORTED_MODULE_21__["MatRadioModule"],
                    _angular_material_slider__WEBPACK_IMPORTED_MODULE_25__["MatSliderModule"],
                    _angular_material_badge__WEBPACK_IMPORTED_MODULE_3__["MatBadgeModule"],
                    _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_4__["MatBottomSheetModule"],
                    _angular_material_tree__WEBPACK_IMPORTED_MODULE_33__["MatTreeModule"],
                    _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatRippleModule"],
                ],
                exports: [
                    _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_8__["MatCheckboxModule"],
                    _angular_material_select__WEBPACK_IMPORTED_MODULE_22__["MatSelectModule"],
                    _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_24__["MatSlideToggleModule"],
                    _angular_material_input__WEBPACK_IMPORTED_MODULE_15__["MatInputModule"],
                    _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_32__["MatTooltipModule"],
                    _angular_material_tabs__WEBPACK_IMPORTED_MODULE_30__["MatTabsModule"],
                    _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_23__["MatSidenavModule"],
                    _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButtonModule"],
                    _angular_material_card__WEBPACK_IMPORTED_MODULE_7__["MatCardModule"],
                    _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_6__["MatButtonToggleModule"],
                    _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_20__["MatProgressSpinnerModule"],
                    _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_19__["MatProgressBarModule"],
                    _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_31__["MatToolbarModule"],
                    _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__["MatMenuModule"],
                    _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_13__["MatGridListModule"],
                    _angular_material_table__WEBPACK_IMPORTED_MODULE_29__["MatTableModule"],
                    _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__["MatPaginatorModule"],
                    _angular_material_sort__WEBPACK_IMPORTED_MODULE_27__["MatSortModule"],
                    _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_10__["MatDatepickerModule"],
                    _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatNativeDateModule"],
                    _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__["MatExpansionModule"],
                    _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_2__["MatAutocompleteModule"],
                    _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_26__["MatSnackBarModule"],
                    _angular_material_icon__WEBPACK_IMPORTED_MODULE_14__["MatIconModule"],
                    _angular_material_dialog__WEBPACK_IMPORTED_MODULE_11__["MatDialogModule"],
                    _angular_material_list__WEBPACK_IMPORTED_MODULE_16__["MatListModule"],
                    _angular_material_chips__WEBPACK_IMPORTED_MODULE_9__["MatChipsModule"],
                    _angular_material_stepper__WEBPACK_IMPORTED_MODULE_28__["MatStepperModule"],
                    _angular_material_radio__WEBPACK_IMPORTED_MODULE_21__["MatRadioModule"],
                    _angular_material_slider__WEBPACK_IMPORTED_MODULE_25__["MatSliderModule"],
                    _angular_material_badge__WEBPACK_IMPORTED_MODULE_3__["MatBadgeModule"],
                    _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_4__["MatBottomSheetModule"],
                    _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatRippleModule"],
                    _angular_material_tree__WEBPACK_IMPORTED_MODULE_33__["MatTreeModule"],
                ],
                providers: [
                    { provide: _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MAT_DATE_FORMATS"], useValue: APP_DATE_FORMATS },
                ]
            }]
    }], null, null); })();


/***/ }),

/***/ "cMpu":
/*!*************************************************!*\
  !*** ./src/frontend/services/config.service.ts ***!
  \*************************************************/
/*! exports provided: ConfigService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfigService", function() { return ConfigService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _app_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../app/env */ "7esm");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _auth_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./auth.service */ "PS2H");
/* harmony import */ var _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./notifications/notifications.service */ "IspW");









class ConfigService {
    constructor(http, authService, notify) {
        this.http = http;
        this.authService = authService;
        this.notify = notify;
    }
    readConfig() {
        const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]().set('Authorization', 'Bearer ' + this.authService.getToken());
        return new Promise((resolve, reject) => {
            this.http.get(_app_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/config/readConfig', { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
                this.setConfig(data.text);
                resolve(true);
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                console.debug(err);
                resolve(false);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
            })).subscribe();
        });
    }
    setConfig(config) {
        this.authService.setTokenCustom('OpenCaptureForInvoicesConfig', btoa(JSON.stringify(config)));
    }
    getConfig() {
        return JSON.parse(atob(this.authService.getTokenCustom('OpenCaptureForInvoicesConfig')));
    }
}
ConfigService.ɵfac = function ConfigService_Factory(t) { return new (t || ConfigService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_auth_service__WEBPACK_IMPORTED_MODULE_5__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_6__["NotificationService"])); };
ConfigService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: ConfigService, factory: ConfigService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ConfigService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] }, { type: _auth_service__WEBPACK_IMPORTED_MODULE_5__["AuthService"] }, { type: _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_6__["NotificationService"] }]; }, null); })();


/***/ }),

/***/ "f9HG":
/*!*****************************************************!*\
  !*** ./src/frontend/app/logout/logout.component.ts ***!
  \*****************************************************/
/*! exports provided: LogoutComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LogoutComponent", function() { return LogoutComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../services/auth.service */ "PS2H");






class LogoutComponent {
    constructor(router, translate, notify, authService) {
        this.router = router;
        this.translate = translate;
        this.notify = notify;
        this.authService = authService;
    }
    ngOnInit() {
        this.authService.logout();
    }
}
LogoutComponent.ɵfac = function LogoutComponent_Factory(t) { return new (t || LogoutComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_4__["AuthService"])); };
LogoutComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: LogoutComponent, selectors: [["app-logout"]], decls: 0, vars: 0, template: function LogoutComponent_Template(rf, ctx) { }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsb2dvdXQuY29tcG9uZW50LnNjc3MifQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](LogoutComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-logout',
                templateUrl: './logout.component.html',
                styleUrls: ['./logout.component.scss']
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"] }, { type: _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__["NotificationService"] }, { type: _services_auth_service__WEBPACK_IMPORTED_MODULE_4__["AuthService"] }]; }, null); })();


/***/ }),

/***/ "fLAP":
/*!******************************************************************!*\
  !*** ./src/frontend/app/settings/about-us/about-us.component.ts ***!
  \******************************************************************/
/*! exports provided: AboutUsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AboutUsComponent", function() { return AboutUsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");


class AboutUsComponent {
    constructor() { }
    ngOnInit() {
    }
}
AboutUsComponent.ɵfac = function AboutUsComponent_Factory(t) { return new (t || AboutUsComponent)(); };
AboutUsComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AboutUsComponent, selectors: [["app-about-us"]], decls: 8, vars: 0, consts: [[1, "text-center", "text-gray-900", "mb-10"], [1, "border-green-400", "-mt-4", "mb-4", "w-1/2", "m-auto"], [1, "logo", "flex", "justify-center", "items-center", "gap-48"], ["id", "verifier"], ["src", "assets/imgs/logo_opencapture.png", "alt", "Open-Capture Verifier"], ["id", "splitter"], ["src", "assets/imgs/logo_splitter.png", "alt", "Open-Capture Splitter"]], template: function AboutUsComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "h1", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "Open-Capture For Invoices");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "hr", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](5, "img", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](7, "img", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhYm91dC11cy5jb21wb25lbnQuc2NzcyJ9 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AboutUsComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-about-us',
                templateUrl: './about-us.component.html',
                styleUrls: ['./about-us.component.scss']
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "gdoM":
/*!**********************************************************!*\
  !*** ./src/frontend/app/verifier/list/list.component.ts ***!
  \**********************************************************/
/*! exports provided: VerifierListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VerifierListComponent", function() { return VerifierListComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../services/local-storage.service */ "/azQ");



class VerifierListComponent {
    constructor(localeStorageService) {
        this.localeStorageService = localeStorageService;
        this.loading = true;
    }
    ngOnInit() {
        this.localeStorageService.save('splitter_or_verifier', 'verifier');
    }
}
VerifierListComponent.ɵfac = function VerifierListComponent_Factory(t) { return new (t || VerifierListComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_1__["LocalStorageService"])); };
VerifierListComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: VerifierListComponent, selectors: [["app-list"]], decls: 2, vars: 0, template: function VerifierListComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "list works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsaXN0LmNvbXBvbmVudC5zY3NzIn0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](VerifierListComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-list',
                templateUrl: './list.component.html',
                styleUrls: ['./list.component.scss']
            }]
    }], function () { return [{ type: _services_local_storage_service__WEBPACK_IMPORTED_MODULE_1__["LocalStorageService"] }]; }, null); })();


/***/ }),

/***/ "hM/l":
/*!*****************************************************!*\
  !*** ./src/frontend/app/upload/upload.component.ts ***!
  \*****************************************************/
/*! exports provided: UploadComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UploadComponent", function() { return UploadComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ngx-file-drag-drop */ "Cqmy");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/button */ "bTqV");


















class UploadComponent {
    constructor(http, router, route, formBuilder, authService, userService, translate, notify, localeStorageService) {
        this.http = http;
        this.router = router;
        this.route = route;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.userService = userService;
        this.translate = translate;
        this.notify = notify;
        this.localeStorageService = localeStorageService;
        this.fileControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"]([], [
            ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_2__["FileValidators"].required,
            ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_2__["FileValidators"].fileExtension(['pdf'])
        ]);
    }
    ngOnInit() {
    }
    checkFile(data) {
        if (data && data.length != 0) {
            for (let i = 0; i < data.length; i++) {
                let file_name = data[i].name;
                let file_extension = file_name.split('.').pop();
                console.log(file_extension);
                if (file_extension.toLowerCase() != 'pdf') {
                    this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized', { count: data.length }));
                    return;
                }
            }
        }
    }
    uploadFile() {
        const formData = new FormData();
        let headers = this.authService.headers;
        if (this.fileControl.value.length == 0) {
            this.notify.handleErrors(this.translate.instant('UPLOAD.no_file'));
            return;
        }
        for (let i = 0; i < this.fileControl.value.length; i++) {
            if (this.fileControl.status == 'VALID') {
                console.log(this.fileControl.value[i]);
                console.log(this.fileControl.value[i].name);
                formData.append(this.fileControl.value[i].name, this.fileControl.value[i]);
                console.log(formData);
            }
            else {
                this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized'));
                return;
            }
        }
        console.log(formData);
        let splitter_or_verifier = this.localeStorageService.get('splitter_or_verifier');
        if (splitter_or_verifier !== undefined || splitter_or_verifier !== '') {
            this.http.post(_env__WEBPACK_IMPORTED_MODULE_3__["API_URL"] + '/ws/' + splitter_or_verifier + '/upload', formData, {
                headers
            }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["tap"])((data) => {
                this.notify.success(this.translate.instant('UPLOAD.upload_success'));
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["catchError"])((err) => {
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_5__["of"])(false);
            })).subscribe();
        }
        else {
            this.notify.handleErrors(this.translate.instant('ERROR.unknow_error'));
            return;
        }
    }
}
UploadComponent.ɵfac = function UploadComponent_Factory(t) { return new (t || UploadComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_12__["LocalStorageService"])); };
UploadComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: UploadComponent, selectors: [["app-upload"]], decls: 6, vars: 13, consts: [[3, "formControl", "activeBorderColor", "multiple", "accept", "displayFileSize", "emptyPlaceholder", "valueChanged"], [1, "flex", "justify-center", "content-center"], ["mat-flat-button", "", 1, "mt-5", "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "px-3", "py-2", "text-sm", "font-medium", "transition", "duration-300", 3, "click"]], template: function UploadComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "ngx-file-drag-drop", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("valueChanged", function UploadComponent_Template_ngx_file_drag_drop_valueChanged_0_listener($event) { return ctx.checkFile($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](1, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "button", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UploadComponent_Template_button_click_3_listener() { return ctx.uploadFile(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"]("max-w-3xl h-56");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formControl", ctx.fileControl)("activeBorderColor", "#97BF3D")("multiple", true)("accept", "pdf")("displayFileSize", true)("emptyPlaceholder", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](1, 9, "UPLOAD.placeholder"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](5, 11, "UPLOAD.send"), " ");
    } }, directives: [ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_2__["NgxFileDragDropComponent"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlDirective"], _angular_material_button__WEBPACK_IMPORTED_MODULE_13__["MatButton"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslatePipe"]], styles: [".mat-chip.mat-standard-chip.mat-chip-selected.mat-accent {\n  background-color: #97BF3D !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3VwbG9hZC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLG9DQUFBO0FBQ0oiLCJmaWxlIjoidXBsb2FkLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLm1hdC1jaGlwLm1hdC1zdGFuZGFyZC1jaGlwLm1hdC1jaGlwLXNlbGVjdGVkLm1hdC1hY2NlbnR7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzk3QkYzRCFpbXBvcnRhbnQ7XG59XG4iXX0= */"], encapsulation: 2 });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](UploadComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-upload',
                templateUrl: './upload.component.html',
                styleUrls: ['./upload.component.scss'],
                encapsulation: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewEncapsulation"].None,
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_7__["Router"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"] }, { type: _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormBuilder"] }, { type: _services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"] }, { type: _services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"] }, { type: _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__["NotificationService"] }, { type: _services_local_storage_service__WEBPACK_IMPORTED_MODULE_12__["LocalStorageService"] }]; }, null); })();


/***/ }),

/***/ "iw5x":
/*!*********************************************************!*\
  !*** ./src/frontend/app/register/register.component.ts ***!
  \*********************************************************/
/*! exports provided: RegisterComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RegisterComponent", function() { return RegisterComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../services/auth.service */ "PS2H");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_config_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../services/config.service */ "cMpu");
/* harmony import */ var _services_locale_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../services/locale.service */ "W2Zi");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/card */ "Wp6s");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/button */ "bTqV");



















function RegisterComponent_mat_error_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r0.getErrorMessage("firstname"));
} }
function RegisterComponent_mat_error_23_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r1.getErrorMessage("lastname"));
} }
function RegisterComponent_mat_error_30_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r2.getErrorMessage("username"));
} }
function RegisterComponent_mat_error_37_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r3.getErrorMessage("password"));
} }
class RegisterComponent {
    constructor(router, http, formBuilder, authService, notify, translate, configService, localeService) {
        this.router = router;
        this.http = http;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.notify = notify;
        this.translate = translate;
        this.configService = configService;
        this.localeService = localeService;
    }
    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            username: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required],
            password: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required],
            firstname: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required],
            lastname: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].required]
        });
        this.localeService.getCurrentLocale();
    }
    onSubmit() {
        let password = this.registerForm.get('password').value;
        let username = this.registerForm.get('username').value;
        let firstname = this.registerForm.get('firstname').value;
        let lastname = this.registerForm.get('lastname').value;
        if (password && username) {
            this.http.post(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/auth/register', {
                'username': username,
                'password': password,
                'firstname': firstname,
                'lastname': lastname,
                'lang': this.localeService.currentLang
            }, {
                observe: 'response'
            }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
                this.notify.success(this.translate.instant('AUTH.registered'));
                this.authService.logout();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
            })).subscribe();
        }
    }
    getErrorMessage(field) {
        if (this.registerForm.get(field).hasError('required')) {
            return this.translate.instant('AUTH.field_required');
        }
        return this.translate.instant('ERROR.unknow_error');
    }
}
RegisterComponent.ɵfac = function RegisterComponent_Factory(t) { return new (t || RegisterComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_7__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_8__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_config_service__WEBPACK_IMPORTED_MODULE_10__["ConfigService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_locale_service__WEBPACK_IMPORTED_MODULE_11__["LocaleService"])); };
RegisterComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: RegisterComponent, selectors: [["app-register"]], decls: 46, vars: 38, consts: [[1, "mt-32", "-mb-32", "flex", "justify-center", "h-20"], ["src", "assets/imgs/logo_opencapture.png", "alt", "Open-Capture For Invoices logo"], [1, "flex", "justify-center", "items-center", 2, "height", "85vh"], [1, "text-center", "w-1/4"], [1, "mb-10"], [3, "formGroup", "ngSubmit"], [1, "grid", "grid-cols-2", "gap-4"], [1, "block"], ["matInput", "", "formControlName", "firstname", "autocomplete", "off", "type", "text", "required", "", 3, "placeholder"], [4, "ngIf"], ["matInput", "", "formControlName", "lastname", "autocomplete", "off", "type", "text", "required", "", 3, "placeholder"], ["matInput", "", "formControlName", "username", "autocomplete", "off", "type", "text", "required", "", 3, "placeholder"], ["matInput", "", "formControlName", "password", "autocomplete", "off", "type", "password", "required", "", 3, "placeholder"], [1, "button"], ["type", "submit", "mat-button", "", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300"], [1, "absolute", "mt-96", "hover:text-green-400", "transition", "duration-500"], ["routerLink", "/login", 1, "relative", "top-7"]], template: function RegisterComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "img", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "mat-card", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "mat-card-title", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](6, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "mat-card-content");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "form", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngSubmit", function RegisterComponent_Template_form_ngSubmit_8_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "mat-form-field", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](13, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](14, "input", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](15, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](16, RegisterComponent_mat_error_16_Template, 2, 1, "mat-error", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](17, "mat-form-field", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](19);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](20, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](21, "input", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](22, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](23, RegisterComponent_mat_error_23_Template, 2, 1, "mat-error", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](24, "mat-form-field", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](25, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](26);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](27, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](28, "input", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](29, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](30, RegisterComponent_mat_error_30_Template, 2, 1, "mat-error", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](31, "mat-form-field", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](32, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](33);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](34, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](35, "input", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](36, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](37, RegisterComponent_mat_error_37_Template, 2, 1, "mat-error", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](38, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](39, "button", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](40);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](41, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](42, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](43, "a", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](44);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](45, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](6, 16, "GLOBAL.register"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formGroup", ctx.registerForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](13, 18, "USER.firstname"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](15, 20, "USER.firstname"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.registerForm.controls.firstname.invalid);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](20, 22, "USER.lastname"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](22, 24, "USER.lastname"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.registerForm.controls.lastname.invalid);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](27, 26, "USER.username"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](29, 28, "USER.username"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.registerForm.controls.username.invalid);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](34, 30, "USER.password"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](36, 32, "USER.password"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.registerForm.controls.password.invalid);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](41, 34, "GLOBAL.submit"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](45, 36, "AUTH.login"), " ");
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_12__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_12__["MatCardTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_12__["MatCardContent"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["ɵangular_packages_forms_forms_y"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormGroupDirective"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_13__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_13__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_14__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlName"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["RequiredValidator"], _angular_common__WEBPACK_IMPORTED_MODULE_15__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_16__["MatButton"], _angular_router__WEBPACK_IMPORTED_MODULE_5__["RouterLinkWithHref"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_13__["MatError"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJyZWdpc3Rlci5jb21wb25lbnQuc2NzcyJ9 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](RegisterComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-register',
                templateUrl: './register.component.html',
                styleUrls: ['./register.component.scss']
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"] }, { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"] }, { type: _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormBuilder"] }, { type: _services_auth_service__WEBPACK_IMPORTED_MODULE_7__["AuthService"] }, { type: _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_8__["NotificationService"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"] }, { type: _services_config_service__WEBPACK_IMPORTED_MODULE_10__["ConfigService"] }, { type: _services_locale_service__WEBPACK_IMPORTED_MODULE_11__["LocaleService"] }]; }, null); })();


/***/ }),

/***/ "jj9e":
/*!******************************!*\
  !*** ./src/frontend/main.ts ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app/app.module */ "G9b+");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");



Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_1__["AppModule"]);


/***/ }),

/***/ "nG5W":
/*!**************************************************!*\
  !*** ./src/frontend/services/services.module.ts ***!
  \**************************************************/
/*! exports provided: ServicesModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ServicesModule", function() { return ServicesModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _app_app_material_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../app/app-material.module */ "cCsE");
/* harmony import */ var _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./notifications/notifications.service */ "IspW");
/* harmony import */ var _confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./confirm-dialog/confirm-dialog.component */ "GI+y");
/* harmony import */ var _last_url_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./last-url.service */ "463q");







class ServicesModule {
}
ServicesModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: ServicesModule });
ServicesModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function ServicesModule_Factory(t) { return new (t || ServicesModule)(); }, providers: [_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__["NotificationService"], _last_url_service__WEBPACK_IMPORTED_MODULE_5__["LastUrlService"]], imports: [[
            _app_app_material_module__WEBPACK_IMPORTED_MODULE_2__["AppMaterialModule"],
            _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](ServicesModule, { declarations: [_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__["CustomSnackbarComponent"],
        _confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_4__["ConfirmDialogComponent"]], imports: [_app_app_material_module__WEBPACK_IMPORTED_MODULE_2__["AppMaterialModule"],
        _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ServicesModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                imports: [
                    _app_app_material_module__WEBPACK_IMPORTED_MODULE_2__["AppMaterialModule"],
                    _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]
                ],
                declarations: [
                    _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__["CustomSnackbarComponent"],
                    _confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_4__["ConfirmDialogComponent"],
                ],
                exports: [],
                entryComponents: [
                    _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__["CustomSnackbarComponent"],
                    _confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_4__["ConfirmDialogComponent"]
                ],
                providers: [_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__["NotificationService"], _last_url_service__WEBPACK_IMPORTED_MODULE_5__["LastUrlService"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "pnQW":
/*!*******************************************!*\
  !*** ./src/frontend/app/app.component.ts ***!
  \*******************************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _menu_menu_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./menu/menu.component */ "2jQ4");











function AppComponent_app_menu_0_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "app-menu");
} }
class AppComponent {
    constructor(router, location, http, titleService, notify, translate, activatedRoute) {
        this.router = router;
        this.location = location;
        this.http = http;
        this.titleService = titleService;
        this.notify = notify;
        this.translate = translate;
        this.activatedRoute = activatedRoute;
        this.title = 'Open-Capture For Invoices';
        this.image = '';
        this.loading = true;
    }
    ngOnInit() {
        const appTitle = this.titleService.getTitle();
        this.router.events.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["filter"])(event => event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_1__["NavigationEnd"]), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["map"])(() => {
            let child = this.activatedRoute.firstChild;
            let child_image = '';
            if (child) {
                while (child.firstChild) {
                    child = child.firstChild;
                }
                if (child.snapshot.data['image']) {
                    child_image = child.snapshot.data['image'];
                }
                if (child.snapshot.data['title']) {
                    return [child.snapshot.data['title'], child_image];
                }
            }
            return [appTitle, child_image];
        })).subscribe((data) => {
            let ttl = data[0];
            this.image = data[1];
            this.translate.get(ttl).subscribe((data) => {
                this.titleService.setTitle(data + ' - ' + this.title);
            });
            this.loading = false;
        });
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common__WEBPACK_IMPORTED_MODULE_3__["Location"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_platform_browser__WEBPACK_IMPORTED_MODULE_5__["Title"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_6__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"])); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 2, vars: 1, consts: [[4, "ngIf"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, AppComponent_app_menu_0_Template, 1, 0, "app-menu", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "router-outlet");
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.location.path() !== "/login" && ctx.location.path() !== "/register" && ctx.location.path() !== "/404" && ctx.loading == false);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_3__["NgIf"], _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterOutlet"], _menu_menu_component__WEBPACK_IMPORTED_MODULE_8__["MenuComponent"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhcHAuY29tcG9uZW50LnNjc3MifQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AppComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-root',
                templateUrl: './app.component.html',
                styleUrls: ['./app.component.scss'],
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"] }, { type: _angular_common__WEBPACK_IMPORTED_MODULE_3__["Location"] }, { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"] }, { type: _angular_platform_browser__WEBPACK_IMPORTED_MODULE_5__["Title"] }, { type: _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_6__["NotificationService"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__["TranslateService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"] }]; }, null); })();


/***/ }),

/***/ "tLbZ":
/*!***********************************************************!*\
  !*** ./src/frontend/app/not-found/not-found.component.ts ***!
  \***********************************************************/
/*! exports provided: NotFoundComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NotFoundComponent", function() { return NotFoundComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");





class NotFoundComponent {
    constructor(notify, router, translate) {
        this.notify = notify;
        this.router = router;
        this.translate = translate;
    }
    ngOnInit() {
        this.translate.get('ERROR.404').subscribe((translated) => {
            this.notify.error(translated);
            this.router.navigate(['/login']);
        });
    }
}
NotFoundComponent.ɵfac = function NotFoundComponent_Factory(t) { return new (t || NotFoundComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_1__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"])); };
NotFoundComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: NotFoundComponent, selectors: [["app-not-found"]], decls: 9, vars: 0, consts: [["id", "preloader", 1, "fixed", "inset-0", "bg-white", "z-50"], ["id", "status", 1, "flex", "absolute", "items-center", "justify-center", "w-full", "h-0", "top-1/2"], ["xmlns", "http://www.w3.org/2000/svg", "x", "0px", "y", "0px", "viewBox", "0 0 74.4 81.9", "width", "300", "height", "300", 0, "xml", "space", "preserve"], ["id", "fill", "x1", "0.5", "y1", "1", "x2", "0.5", "y2", "0"], ["offset", "0%", "stop-color", "#76B442"], ["attributeName", "stop-color", "values", "#76B442; #A7A8AA; #76B442", "dur", "1s", "repeatCount", "indefinite"], ["offset", "100%", "stop-color", "#A7A8AA"], ["attributeName", "stop-color", "values", "#A7A8AA; #76B442; #A7A8AA", "dur", "1s", "repeatCount", "indefinite"], ["fill", "url(#fill)", "d", "M1.9,79.4c-1.5-1.5,0.3-4.7,8.2-14.2c4.8-5.7,10.1-12.3,11.9-14.6l3.3-4.1l-1.6-1.7\n                        c-7.2-7.4-8.6-20.6-3-29.7C27.9,3.4,43.8-1.4,56.8,4.2c6,2.6,11.8,8,14.4,13.5c2.7,5.6,2.5,15.4-0.4,21.1\n                        c-6.6,13-22.8,18.9-36.3,13.3c-2.2-1-4.1-1.3-4.4-1c-0.3,0.4-5.8,7-12.2,14.8C8.8,76.8,5.7,80,4.3,80C3.3,80,2.1,79.7,1.9,79.4\n                        L1.9,79.4z M53.5,48.8c5.7-2,10.7-6.3,13.4-11.3c2.8-5.2,2.9-13.8,0.1-18.9c-4.5-8.4-12-12.8-21.9-12.8c-26.3,0-33.2,33.2-9,42.7\n                        C42.2,50.9,47.3,51,53.5,48.8L53.5,48.8z"]], template: function NotFoundComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnamespaceSVG"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "svg", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "linearGradient", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "stop", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](5, "animate", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "stop", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](7, "animate", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](8, "path", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJub3QtZm91bmQuY29tcG9uZW50LnNjc3MifQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](NotFoundComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-not-found',
                templateUrl: './not-found.component.html',
                styleUrls: ['./not-found.component.scss']
            }]
    }], function () { return [{ type: _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_1__["NotificationService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"] }]; }, null); })();


/***/ }),

/***/ "tPvy":
/*!****************************************************************!*\
  !*** ./src/frontend/app/settings/users/list/list.component.ts ***!
  \****************************************************************/
/*! exports provided: UserListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserListComponent", function() { return UserListComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../env */ "7esm");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../services/confirm-dialog/confirm-dialog.component */ "GI+y");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _services_last_url_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../../services/last-url.service */ "463q");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/table */ "+0xr");
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/sort */ "Dh3D");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");






















function UserListComponent_mat_header_cell_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "GLOBAL.id"), " ");
} }
function UserListComponent_mat_cell_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r16 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", element_r16.id, " ");
} }
function UserListComponent_mat_header_cell_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "USER.username"), " ");
} }
function UserListComponent_mat_cell_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r17 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", element_r17.username, " ");
} }
function UserListComponent_mat_header_cell_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "USER.firstname"), " ");
} }
function UserListComponent_mat_cell_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r18 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", element_r18.firstname, " ");
} }
function UserListComponent_mat_header_cell_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "USER.lastname"), " ");
} }
function UserListComponent_mat_cell_14_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r19 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", element_r19.lastname, " ");
} }
function UserListComponent_mat_header_cell_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "USER.role"), " ");
} }
function UserListComponent_mat_cell_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r20 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", element_r20.role_label, " ");
} }
function UserListComponent_mat_header_cell_19_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-header-cell", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 1, "USER.status"), " ");
} }
function UserListComponent_mat_cell_20_span_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "span", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](4, 1, "USER.active"), "");
} }
function UserListComponent_mat_cell_20_span_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "span", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](4, 1, "USER.inactive"), "");
} }
function UserListComponent_mat_cell_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, UserListComponent_mat_cell_20_span_1_Template, 5, 3, "span", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, UserListComponent_mat_cell_20_span_2_Template, 5, 3, "span", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r21 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", element_r21.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !element_r21.enabled);
} }
function UserListComponent_mat_header_cell_22_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "mat-header-cell");
} }
function UserListComponent_mat_cell_23_button_4_Template(rf, ctx) { if (rf & 1) {
    const _r30 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UserListComponent_mat_cell_23_button_4_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r30); const element_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r28.disableConfirmDialog(element_r24.id, element_r24.username); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "i", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](1, 1, "USER.disable"));
} }
function UserListComponent_mat_cell_23_button_5_Template(rf, ctx) { if (rf & 1) {
    const _r33 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UserListComponent_mat_cell_23_button_5_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r33); const element_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r31.enableConfirmDialog(element_r24.id, element_r24.username); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "i", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](1, 1, "USER.enable"));
} }
function UserListComponent_mat_cell_23_button_6_Template(rf, ctx) { if (rf & 1) {
    const _r36 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function UserListComponent_mat_cell_23_button_6_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r36); const element_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r34 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r34.deleteConfirmDialog(element_r24.id, element_r24.username); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "i", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](1, 1, "GLOBAL.delete"));
} }
function UserListComponent_mat_cell_23_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "i", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, UserListComponent_mat_cell_23_button_4_Template, 3, 3, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, UserListComponent_mat_cell_23_button_5_Template, 3, 3, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](6, UserListComponent_mat_cell_23_button_6_Template, 3, 3, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r24 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate1"]("routerLink", "/profile/", element_r24.id, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](2, 5, "USER.update"));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", element_r24.role_label !== "SuperUtilisateur" && element_r24.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", element_r24.role_label !== "SuperUtilisateur" && !element_r24.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", element_r24.role_label !== "SuperUtilisateur");
} }
function UserListComponent_mat_header_row_24_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "mat-header-row");
} }
function UserListComponent_mat_row_25_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "mat-row", 25);
} if (rf & 2) {
    const row_r37 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate1"]("routerLink", "/profile/", row_r37.id, "");
} }
const _c0 = function () { return [5, 10, 15, 20, 50]; };
class UserListComponent {
    constructor(http, router, route, formBuilder, authService, userService, translate, notify, dialog, routerExtService, localeStorageService) {
        this.http = http;
        this.router = router;
        this.route = route;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.userService = userService;
        this.translate = translate;
        this.notify = notify;
        this.dialog = dialog;
        this.routerExtService = routerExtService;
        this.localeStorageService = localeStorageService;
        this.columnsToDisplay = ['id', 'username', 'firstname', 'lastname', 'role', 'status', 'actions'];
        this.users = [];
        this.pageSize = 10;
        this.pageIndex = 0;
        this.total = 0;
        this.offset = 0;
    }
    ngOnInit() {
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('profile/') || lastUrl == '/') {
            if (this.localeStorageService.get('usersPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('usersPageIndex'));
            this.offset = this.pageSize * (this.pageIndex);
        }
        else
            this.localeStorageService.remove('usersPageIndex');
        this.loadUsers();
    }
    onPageChange(event) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.localeStorageService.save('usersPageIndex', event.pageIndex);
        this.loadUsers();
    }
    loadUsers() {
        let headers = this.authService.headers;
        let roles = [];
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/roles/list', { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
            roles = data.roles;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/users/list?limit=' + this.pageSize + '&offset=' + this.offset, { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
            this.total = data.users[0].total;
            this.users = data.users;
            if (roles) {
                this.users.forEach((user) => {
                    roles.forEach((element) => {
                        if (user.role == element.id) {
                            user.role_label = element.label;
                        }
                    });
                });
            }
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
    }
    deleteConfirmDialog(user_id, user) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_4__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('USER.confirm_delete', { "user": user }),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteUser(user_id);
            }
        });
    }
    disableConfirmDialog(user_id, user) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_4__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('USER.confirm_disable', { "user": user }),
                confirmButton: this.translate.instant('GLOBAL.disable'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.disableUser(user_id);
            }
        });
    }
    enableConfirmDialog(user_id, user) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_4__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('USER.confirm_enable', { "user": user }),
                confirmButton: this.translate.instant('GLOBAL.enable'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.enableUser(user_id);
            }
        });
    }
    deleteUser(user_id) {
        let headers = this.authService.headers;
        if (user_id !== undefined) {
            this.http.delete(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/users/delete/' + user_id, { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
                this.loadUsers();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            })).subscribe();
        }
    }
    disableUser(user_id) {
        let headers = this.authService.headers;
        if (user_id !== undefined) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/users/disable/' + user_id, null, { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
                this.loadUsers();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            })).subscribe();
        }
    }
    enableUser(user_id) {
        let headers = this.authService.headers;
        if (user_id !== undefined) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/users/enable/' + user_id, null, { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
                this.loadUsers();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            })).subscribe();
        }
    }
    sortData(sort) {
        let data = this.users.slice();
        if (!sort.active || sort.direction === '') {
            this.users = data;
            return;
        }
        this.users = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'username': return this.compare(a.username, b.username, isAsc);
                case 'firstname': return this.compare(a.firstname, b.firstname, isAsc);
                case 'lastname': return this.compare(a.lastname, b.lastname, isAsc);
                case 'role': return this.compare(a.role, b.role, isAsc);
                case 'status': return this.compare(a.status, b.status, isAsc);
                default: return 0;
            }
        });
    }
    compare(a, b, isAsc) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
UserListComponent.ɵfac = function UserListComponent_Factory(t) { return new (t || UserListComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_7__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_12__["MatDialog"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_last_url_service__WEBPACK_IMPORTED_MODULE_13__["LastUrlService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_14__["LocalStorageService"])); };
UserListComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: UserListComponent, selectors: [["app-users-list"]], decls: 26, vars: 8, consts: [["showFirstLastButtons", "", 3, "length", "pageSize", "pageIndex", "pageSizeOptions", "page"], ["matSort", "", 1, "w-full", 3, "dataSource", "matSortChange"], ["matColumnDef", "id"], ["mat-sort-header", "", 4, "matHeaderCellDef"], [4, "matCellDef"], ["matColumnDef", "username"], ["matColumnDef", "firstname"], ["matColumnDef", "lastname"], ["matColumnDef", "role"], ["matColumnDef", "status"], ["matColumnDef", "actions"], [4, "matHeaderCellDef"], [4, "matHeaderRowDef"], ["class", "cursor-pointer hover:text-green-400 hover:shadow-md transition-colors duration-300", 3, "routerLink", 4, "matRowDef", "matRowDefColumns"], ["mat-sort-header", ""], [4, "ngIf"], [1, "text-green-400", "text-4xl", "relative", "top-2", "leading-4"], [1, "text-red-600", "text-4xl", "relative", "top-2", "leading-4"], ["mat-icon-button", "", 1, "inline-block", "align-text-top", 3, "routerLink", "matTooltip"], [1, "btn-action-icon", "fas", "fa-edit", "fa-lg"], ["mat-icon-button", "", "class", "inline-block align-text-top", 3, "matTooltip", "click", 4, "ngIf"], ["mat-icon-button", "", 1, "inline-block", "align-text-top", 3, "matTooltip", "click"], [1, "btn-action-icon", "fas", "fa-pause", "fa-lg"], [1, "btn-action-icon", "fas", "fa-play", "fa-lg"], [1, "btn-action-icon", "fas", "fa-trash", "fa-lg"], [1, "cursor-pointer", "hover:text-green-400", "hover:shadow-md", "transition-colors", "duration-300", 3, "routerLink"]], template: function UserListComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-paginator", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("page", function UserListComponent_Template_mat_paginator_page_1_listener($event) { return ctx.onPageChange($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-table", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("matSortChange", function UserListComponent_Template_mat_table_matSortChange_2_listener($event) { return ctx.sortData($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](3, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, UserListComponent_mat_header_cell_4_Template, 3, 3, "mat-header-cell", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, UserListComponent_mat_cell_5_Template, 2, 1, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](6, 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](7, UserListComponent_mat_header_cell_7_Template, 3, 3, "mat-header-cell", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](8, UserListComponent_mat_cell_8_Template, 2, 1, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](9, 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](10, UserListComponent_mat_header_cell_10_Template, 3, 3, "mat-header-cell", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](11, UserListComponent_mat_cell_11_Template, 2, 1, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](12, 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](13, UserListComponent_mat_header_cell_13_Template, 3, 3, "mat-header-cell", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](14, UserListComponent_mat_cell_14_Template, 2, 1, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](15, 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](16, UserListComponent_mat_header_cell_16_Template, 3, 3, "mat-header-cell", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](17, UserListComponent_mat_cell_17_Template, 2, 1, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](18, 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](19, UserListComponent_mat_header_cell_19_Template, 3, 3, "mat-header-cell", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](20, UserListComponent_mat_cell_20_Template, 3, 2, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerStart"](21, 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](22, UserListComponent_mat_header_cell_22_Template, 1, 0, "mat-header-cell", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](23, UserListComponent_mat_cell_23_Template, 7, 7, "mat-cell", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](24, UserListComponent_mat_header_row_24_Template, 1, 0, "mat-header-row", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](25, UserListComponent_mat_row_25_Template, 1, 1, "mat-row", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("length", ctx.total)("pageSize", ctx.pageSize)("pageIndex", ctx.pageIndex)("pageSizeOptions", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](7, _c0));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("dataSource", ctx.users);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](22);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("matHeaderRowDef", ctx.columnsToDisplay);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("matRowDefColumns", ctx.columnsToDisplay);
    } }, directives: [_angular_material_paginator__WEBPACK_IMPORTED_MODULE_15__["MatPaginator"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatTable"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_17__["MatSort"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatColumnDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatHeaderCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatHeaderRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatHeaderCell"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_17__["MatSortHeader"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatCell"], _angular_common__WEBPACK_IMPORTED_MODULE_18__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_19__["MatButton"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterLink"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_20__["MatTooltip"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatHeaderRow"], _angular_material_table__WEBPACK_IMPORTED_MODULE_16__["MatRow"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslatePipe"]], styles: [".mat-row[_ngcontent-%COMP%]:hover    > .mat-cell[_ngcontent-%COMP%] {\n  --tw-text-opacity: 1;\n  color: rgba(151, 191, 61, var(--tw-text-opacity));\n}\n\n.mat-row[_ngcontent-%COMP%]:hover {\n  transform: scale(1);\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2xpc3QuY29tcG9uZW50LnNjc3MiLCIuLi8uLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdGFpbHdpbmRjc3MvbGliL2xpYi9zdWJzdGl0dXRlQ2xhc3NBcHBseUF0UnVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUNFQSxvQkFBbUI7RUFBbkIsaURBQW1CO0FEQW5COztBQUVBO0VBQ0ksbUJBQUE7QUFDSiIsImZpbGUiOiJsaXN0LmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLm1hdC1yb3c6aG92ZXIgPiAubWF0LWNlbGx7XG4gICAgQGFwcGx5IHRleHQtZ3JlZW4tNDAwO1xufVxuXG4ubWF0LXJvdzpob3ZlcntcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpXG59IiwiQHRhaWx3aW5kIGJhc2U7XG5AdGFpbHdpbmQgY29tcG9uZW50cztcbkB0YWlsd2luZCB1dGlsaXRpZXM7Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](UserListComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-users-list',
                templateUrl: './list.component.html',
                styleUrls: ['./list.component.scss']
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"] }, { type: _angular_forms__WEBPACK_IMPORTED_MODULE_7__["FormBuilder"] }, { type: _services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"] }, { type: _services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"] }, { type: _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__["NotificationService"] }, { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_12__["MatDialog"] }, { type: _services_last_url_service__WEBPACK_IMPORTED_MODULE_13__["LastUrlService"] }, { type: _services_local_storage_service__WEBPACK_IMPORTED_MODULE_14__["LocalStorageService"] }]; }, null); })();


/***/ }),

/***/ "uepI":
/*!*********************************************************!*\
  !*** ./src/frontend/services/login-required.service.ts ***!
  \*********************************************************/
/*! exports provided: LoginRequiredService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginRequiredService", function() { return LoginRequiredService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _auth_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./auth.service */ "PS2H");
/* harmony import */ var _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./notifications/notifications.service */ "IspW");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");





class LoginRequiredService {
    constructor(authService, notify, translate) {
        this.authService = authService;
        this.notify = notify;
        this.translate = translate;
    }
    canActivate(route, state) {
        if (this.authService.getToken()) {
            return true;
        }
        else {
            this.translate.get('AUTH.not_connected').subscribe((translated) => {
                this.authService.setCachedUrl(state.url.replace(/^\//g, ''));
                this.notify.error(translated);
                this.authService.logout();
            });
            return false;
        }
    }
}
LoginRequiredService.ɵfac = function LoginRequiredService_Factory(t) { return new (t || LoginRequiredService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_auth_service__WEBPACK_IMPORTED_MODULE_1__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_2__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"])); };
LoginRequiredService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: LoginRequiredService, factory: LoginRequiredService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](LoginRequiredService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _auth_service__WEBPACK_IMPORTED_MODULE_1__["AuthService"] }, { type: _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_2__["NotificationService"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"] }]; }, null); })();


/***/ }),

/***/ "vrQ+":
/*!************************************************************!*\
  !*** ./src/frontend/app/settings/panel/panel.component.ts ***!
  \************************************************************/
/*! exports provided: PanelComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PanelComponent", function() { return PanelComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_last_url_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../services/last-url.service */ "463q");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _users_list_list_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../users/list/list.component */ "tPvy");
/* harmony import */ var _roles_roles_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../roles/roles.component */ "/0w2");
/* harmony import */ var _version_update_version_update_component__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../version-update/version-update.component */ "1PXZ");
/* harmony import */ var _about_us_about_us_component__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../about-us/about-us.component */ "fLAP");




















function PanelComponent_mat_expansion_panel_13_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function PanelComponent_mat_expansion_panel_13_div_6_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r12); const setting_r8 = ctx.$implicit; const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r10.changeSetting(setting_r8["id"], parent_r6["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "p", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r8 = ctx.$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("text-green-400", ctx_r7.selectedSetting === setting_r8["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r8["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("font-medium", ctx_r7.selectedSetting === setting_r8["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](5, 8, setting_r8["label"]), " ");
} }
function PanelComponent_mat_expansion_panel_13_Template(rf, ctx) { if (rf & 1) {
    const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-expansion-panel", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("opened", function PanelComponent_mat_expansion_panel_13_Template_mat_expansion_panel_opened_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r14); const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r13.settingListOpenState = true; })("closed", function PanelComponent_mat_expansion_panel_13_Template_mat_expansion_panel_closed_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r14); const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r15.settingListOpenState = false; });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-expansion-panel-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](6, PanelComponent_mat_expansion_panel_13_div_6_Template, 6, 10, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r6 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("expanded", ctx_r1.selectedParentSetting == parent_r6["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](4, 3, parent_r6["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r1.settings[parent_r6["id"]]);
} }
function PanelComponent_app_users_list_18_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "app-users-list");
} }
function PanelComponent_app_roles_19_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "app-roles");
} }
function PanelComponent_app_version_update_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "app-version-update");
} }
function PanelComponent_app_about_us_21_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "app-about-us");
} }
class PanelComponent {
    constructor(http, router, route, formBuilder, authService, userService, translate, routerExtService, localeStorageService) {
        this.http = http;
        this.router = router;
        this.route = route;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.userService = userService;
        this.translate = translate;
        this.routerExtService = routerExtService;
        this.localeStorageService = localeStorageService;
        this.isMenuOpen = true;
        this.selectedSetting = "users";
        this.selectedParentSetting = "general";
        this.searchSetting = "";
        this.settingListOpenState = true;
        this.settingsParent = [
            {
                "id": "general",
                "label": this.translate.instant("SETTINGS.general"),
            },
            {
                "id": "verifier",
                "label": this.translate.instant("SETTINGS.verifier"),
            },
            {
                "id": "splitter",
                "label": this.translate.instant("SETTINGS.splitter"),
            },
        ];
        this.settings = {
            "general": [
                {
                    "id": "users",
                    "label": this.translate.instant("SETTINGS.users_list"),
                    "icon": "fas fa-user",
                },
                {
                    "id": "roles",
                    "label": this.translate.instant("SETTINGS.roles_list"),
                    "icon": "fas fa-users",
                },
                {
                    "id": "custom-fields",
                    "label": this.translate.instant("SETTINGS.custom_fields"),
                    "icon": "fas fa-code",
                },
                {
                    "id": "version-update",
                    "label": this.translate.instant("SETTINGS.version_and_update"),
                    "icon": "fas fa-sync",
                },
                {
                    "id": "about-us",
                    "label": this.translate.instant("SETTINGS.abouts_us"),
                    "icon": "fas fa-address-card",
                }
            ],
            "splitter": [
                {
                    "id": "separator",
                    "label": this.translate.instant("SETTINGS.document_separator"),
                    "icon": "fas fa-qrcode",
                },
                {
                    "id": "document-type",
                    "label": this.translate.instant("SETTINGS.document_type"),
                    "icon": "fas fa-file",
                },
                {
                    "id": "connector",
                    "label": this.translate.instant("SETTINGS.connector_EDM"),
                    "icon": "fas fa-link",
                }
            ]
        };
    }
    ngOnInit() {
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('role/') || lastUrl == '/' || lastUrl.includes('profile/')) {
            let selectedSettings = this.localeStorageService.get('selectedSettings');
            let selectedParentSettings = this.localeStorageService.get('selectedParentSettings');
            if (selectedSettings)
                this.selectedSetting = selectedSettings;
            if (selectedParentSettings)
                this.selectedParentSetting = selectedParentSettings;
        }
        else {
            this.localeStorageService.remove('selectedSettings');
            this.localeStorageService.remove('selectedParentSettings');
        }
    }
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
    changeSetting(settingId, settingParentId) {
        this.selectedSetting = settingId;
        this.selectedParentSetting = settingParentId;
        this.localeStorageService.save('selectedSettings', settingId);
        this.localeStorageService.save('selectedParentSettings', settingParentId);
    }
}
PanelComponent.ɵfac = function PanelComponent_Factory(t) { return new (t || PanelComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_4__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_5__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_last_url_service__WEBPACK_IMPORTED_MODULE_7__["LastUrlService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_8__["LocalStorageService"])); };
PanelComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: PanelComponent, selectors: [["app-panel"]], decls: 22, vars: 15, consts: [[1, "w-full", "min-h-screen", "left-auto", "bg-white"], ["mode", "side", "opened", "", 1, "w-1/6"], ["drawer", ""], [1, "text-center", "text-gray-900"], [1, "search-input"], ["appearance", "outline", 1, "absolute", "mt-4", "top-4", "mx-4", "w-5/6"], ["id", "search-input", "matInput", "", 3, "ngModel", "ngModelChange"], [1, "setting-list", "absolute", "top-24", "w-full"], [3, "expanded", "opened", "closed", 4, "ngFor", "ngForOf"], [1, "p-10"], ["mat-icon-button", "", 1, "absolute", "top-0", "left-0", 3, "click"], [1, "fas", "fa-arrow-left", "fa-2x"], [3, "ngSwitch"], [4, "ngSwitchCase"], [3, "expanded", "opened", "closed"], [1, "w-full", "border-t-2", "border-gray-600"], ["class", "border-b border-gray-400 ", 4, "ngFor", "ngForOf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "click"], [1, "m-0"]], template: function PanelComponent_Template(rf, ctx) { if (rf & 1) {
        const _r16 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-drawer-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-drawer", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "mat-form-field", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](10, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "input", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("ngModelChange", function PanelComponent_Template_input_ngModelChange_11_listener($event) { return ctx.searchSetting = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "mat-accordion", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](13, PanelComponent_mat_expansion_panel_13_Template, 7, 5, "mat-expansion-panel", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](14, "mat-drawer-content", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](15, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function PanelComponent_Template_button_click_15_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r16); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](2); _r0.toggle(); return ctx.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](16, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](17, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](18, PanelComponent_app_users_list_18_Template, 1, 0, "app-users-list", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](19, PanelComponent_app_roles_19_Template, 1, 0, "app-roles", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](20, PanelComponent_app_version_update_20_Template, 1, 0, "app-version-update", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](21, PanelComponent_app_about_us_21_Template, 1, 0, "app-about-us", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](5, 11, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](10, 13, "SPLITTER.search"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngModel", ctx.searchSetting);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.settingsParent);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("fa-arrow-right", !ctx.isMenuOpen);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngSwitch", ctx.selectedSetting);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngSwitchCase", "users");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngSwitchCase", "roles");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngSwitchCase", "version-update");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngSwitchCase", "about-us");
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_9__["MatDrawerContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_9__["MatDrawer"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_11__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_3__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_3__["NgModel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__["MatAccordion"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_9__["MatDrawerContent"], _angular_material_button__WEBPACK_IMPORTED_MODULE_14__["MatButton"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgSwitch"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgSwitchCase"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_12__["MatExpansionPanelTitle"], _users_list_list_component__WEBPACK_IMPORTED_MODULE_15__["UserListComponent"], _roles_roles_component__WEBPACK_IMPORTED_MODULE_16__["RolesComponent"], _version_update_version_update_component__WEBPACK_IMPORTED_MODULE_17__["VersionUpdateComponent"], _about_us_about_us_component__WEBPACK_IMPORTED_MODULE_18__["AboutUsComponent"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslatePipe"]], styles: [".mat-expansion-panel-body {\n  padding: 0 !important;\n}\n\n  .mat-expansion-indicator::after {\n  --tw-border-opacity: 1;\n  border-color: rgba(151, 191, 61, var(--tw-border-opacity));\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhbmVsLmNvbXBvbmVudC5zY3NzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3RhaWx3aW5kY3NzL2xpYi9saWIvc3Vic3RpdHV0ZUNsYXNzQXBwbHlBdFJ1bGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0kscUJBQUE7QUFDSjs7QUFFQTtFQ0ZBLHNCQUFtQjtFQUFuQiwwREFBbUI7QURJbkIiLCJmaWxlIjoicGFuZWwuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyI6Om5nLWRlZXAgLm1hdC1leHBhbnNpb24tcGFuZWwtYm9keXtcbiAgICBwYWRkaW5nOjAgIWltcG9ydGFudDtcbn1cblxuOjpuZy1kZWVwIC5tYXQtZXhwYW5zaW9uLWluZGljYXRvcjo6YWZ0ZXJ7XG4gICAgQGFwcGx5IGJvcmRlci1ncmVlbi00MDA7XG59IiwiQHRhaWx3aW5kIGJhc2U7XG5AdGFpbHdpbmQgY29tcG9uZW50cztcbkB0YWlsd2luZCB1dGlsaXRpZXM7Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](PanelComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-panel',
                templateUrl: './panel.component.html',
                styleUrls: ['./panel.component.scss']
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"] }, { type: _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormBuilder"] }, { type: _services_auth_service__WEBPACK_IMPORTED_MODULE_4__["AuthService"] }, { type: _services_user_service__WEBPACK_IMPORTED_MODULE_5__["UserService"] }, { type: _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateService"] }, { type: _services_last_url_service__WEBPACK_IMPORTED_MODULE_7__["LastUrlService"] }, { type: _services_local_storage_service__WEBPACK_IMPORTED_MODULE_8__["LocalStorageService"] }]; }, null); })();


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map