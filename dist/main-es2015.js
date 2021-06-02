(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

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


/***/ }),

/***/ "/zY6":
/*!******************************************************************************!*\
  !*** ./src/frontend/app/settings/general/roles/list/roles-list.component.ts ***!
  \******************************************************************************/
/*! exports provided: RolesListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RolesListComponent", function() { return RolesListComponent; });
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../services/confirm-dialog/confirm-dialog.component */ "GI+y");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../../services/user.service */ "N74B");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../../services/auth.service */ "PS2H");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_last_url_service__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../../../services/last-url.service */ "463q");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/table */ "+0xr");
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/sort */ "Dh3D");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ../../../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");





























function RolesListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r27 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "button", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function RolesListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r27); const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](4).$implicit; const parent_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r25.serviceSettings.changeSetting(setting_r17["id"], parent_r15["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "p", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r23 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r24.router.url.includes(action_r23["route"]))("disable_link", action_r23["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", action_r23["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r23["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 9, action_r23["label"]), " ");
} }
function RolesListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, RolesListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r23 = ctx.$implicit;
    const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3).$implicit;
    const ctx_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("border-gray-600", !action_r23["showOnlyIfActive"])("border-t", !action_r23["showOnlyIfActive"])("w-full", !action_r23["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", (ctx_r22.privilegesService.hasPrivilege(action_r23["privilege"]) || setting_r17["privilege"] == "*") && (!action_r23["showOnlyIfActive"] || action_r23["showOnlyIfActive"] && ctx_r22.router.url.includes(action_r23["route"])));
} }
function RolesListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r33 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-expansion-panel-header", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-panel-title", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "button", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function RolesListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r33); const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit; const parent_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r31.serviceSettings.changeSetting(setting_r17["id"], parent_r15["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "p", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, RolesListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit;
    const parent_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", ctx_r21.router.url.includes(setting_r17["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r17["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r21.router.url == setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r21.router.url == setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("font-medium", ctx_r21.router.url == setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](7, 13, setting_r17["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r21.serviceSettings.getSettingsAction(parent_r15["id"], setting_r17["id"]));
} }
function RolesListComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, RolesListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r18.privilegesService.hasPrivilege(setting_r17["privilege"]) || setting_r17["privilege"] == "*");
} }
function RolesListComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r41 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function RolesListComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r41); const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit; const parent_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r39 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r39.serviceSettings.changeSetting(setting_r17["id"], parent_r15["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "p", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit;
    const ctx_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r38.router.url == setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r17["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("font-medium", ctx_r38.router.url == setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 9, setting_r17["label"]), " ");
} }
function RolesListComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](0, RolesListComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 41);
} if (rf & 2) {
    const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r20.privilegesService.hasPrivilege(setting_r17["privilege"]) || setting_r17["privilege"] == "*");
} }
function RolesListComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, RolesListComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, RolesListComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 30, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r17 = ctx.$implicit;
    const _r19 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](3);
    const parent_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("border-b", ctx_r16.privilegesService.hasPrivilege(setting_r17["privilege"]) || setting_r17["privilege"] == "*")("border-gray-400", ctx_r16.privilegesService.hasPrivilege(setting_r17["privilege"]) || setting_r17["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r16.serviceSettings.getSettingsAction(parent_r15["id"], setting_r17["id"]))("ngIfElse", _r19);
} }
function RolesListComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-expansion-panel-header", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](6, RolesListComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r15 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r15["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 3, parent_r15["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r15["id"]]);
} }
function RolesListComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function RolesListComponent_mat_header_cell_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "HEADER.id"), " ");
} }
function RolesListComponent_mat_cell_21_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r46 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r46.id, " ");
} }
function RolesListComponent_mat_header_cell_23_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "HEADER.label_short"), " ");
} }
function RolesListComponent_mat_cell_24_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r47 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r47.label_short, " ");
} }
function RolesListComponent_mat_header_cell_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "HEADER.label"), " ");
} }
function RolesListComponent_mat_cell_27_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r48 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r48.label, " ");
} }
function RolesListComponent_mat_header_cell_29_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "HEADER.status"), " ");
} }
function RolesListComponent_mat_cell_30_span_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "span", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 1, "HEADER.active"), "");
} }
function RolesListComponent_mat_cell_30_span_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "span", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 1, "HEADER.inactive"), "");
} }
function RolesListComponent_mat_cell_30_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, RolesListComponent_mat_cell_30_span_1_Template, 5, 3, "span", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, RolesListComponent_mat_cell_30_span_2_Template, 5, 3, "span", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r49 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r49.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !element_r49.enabled);
} }
function RolesListComponent_mat_header_cell_32_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-header-cell");
} }
function RolesListComponent_mat_cell_33_button_1_Template(rf, ctx) { if (rf & 1) {
    const _r57 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function RolesListComponent_mat_cell_33_button_1_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r57); const element_r52 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r55.disableConfirmDialog(element_r52.id, element_r52.label); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "i", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](1, 1, "ROLE.disable"));
} }
function RolesListComponent_mat_cell_33_button_2_Template(rf, ctx) { if (rf & 1) {
    const _r60 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function RolesListComponent_mat_cell_33_button_2_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r60); const element_r52 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r58 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r58.enableConfirmDialog(element_r52.id, element_r52.label); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "i", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](1, 1, "ROLE.enable"));
} }
function RolesListComponent_mat_cell_33_Template(rf, ctx) { if (rf & 1) {
    const _r62 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, RolesListComponent_mat_cell_33_button_1_Template, 3, 3, "button", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, RolesListComponent_mat_cell_33_button_2_Template, 3, 3, "button", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "button", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function RolesListComponent_mat_cell_33_Template_button_click_3_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r62); const element_r52 = ctx.$implicit; const ctx_r61 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r61.deleteConfirmDialog(element_r52.id, element_r52.label); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](5, "i", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r52 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r52.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !element_r52.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 3, "GLOBAL.delete"));
} }
function RolesListComponent_mat_header_row_34_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-header-row");
} }
function RolesListComponent_mat_row_35_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-row", 50);
} if (rf & 2) {
    const row_r63 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate1"]("routerLink", "/settings/general/roles/update/", row_r63.id, "");
} }
const _c0 = function () { return [5, 10, 15, 20, 50]; };
class RolesListComponent {
    constructor(router, http, dialog, route, userService, formBuilder, authService, translate, notify, serviceSettings, routerExtService, privilegesService, localeStorageService) {
        this.router = router;
        this.http = http;
        this.dialog = dialog;
        this.route = route;
        this.userService = userService;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.translate = translate;
        this.notify = notify;
        this.serviceSettings = serviceSettings;
        this.routerExtService = routerExtService;
        this.privilegesService = privilegesService;
        this.localeStorageService = localeStorageService;
        this.headers = this.authService.headers;
        this.columnsToDisplay = ['id', 'label_short', 'label', 'status', 'actions'];
        this.loading = true;
        this.roles = [];
        this.pageSize = 10;
        this.pageIndex = 0;
        this.total = 0;
        this.offset = 0;
    }
    ngOnInit() {
        this.serviceSettings.init();
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
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/roles/list?limit=' + this.pageSize + '&offset=' + this.offset, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
            this.total = data.roles[0].total;
            this.roles = data.roles;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
        })).subscribe();
    }
    onPageChange(event) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.localeStorageService.save('rolesPageIndex', event.pageIndex);
        this.loadRoles();
    }
    deleteConfirmDialog(role_id, role) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
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
    disableConfirmDialog(role_id, role) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('ROLE.confirm_disable', { "role": role }),
                confirmButton: this.translate.instant('GLOBAL.disable'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.disableRole(role_id);
            }
        });
    }
    enableConfirmDialog(role_id, role) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('ROLE.confirm_enable', { "role": role }),
                confirmButton: this.translate.instant('GLOBAL.enable'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.enableRole(role_id);
            }
        });
    }
    deleteRole(role_id) {
        if (role_id !== undefined) {
            this.http.delete(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/roles/delete/' + role_id, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])(() => {
                this.loadRoles();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
            })).subscribe();
        }
    }
    disableRole(role_id) {
        if (role_id !== undefined) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/roles/disable/' + role_id, null, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])(() => {
                this.loadRoles();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
            })).subscribe();
        }
    }
    enableRole(role_id) {
        if (role_id !== undefined) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/roles/enable/' + role_id, null, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])(() => {
                this.loadRoles();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
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
                default:
                    return 0;
            }
        });
    }
    compare(a, b, isAsc) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
RolesListComponent.ɵfac = function RolesListComponent_Factory(t) { return new (t || RolesListComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_8__["MatDialog"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_10__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_11__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_13__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_14__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_last_url_service__WEBPACK_IMPORTED_MODULE_15__["LastUrlService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_16__["PrivilegesService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_17__["LocalStorageService"])); };
RolesListComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({ type: RolesListComponent, selectors: [["app-roles-list"]], features: [_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵProvidersFeature"]([
            { provide: _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__["MAT_FORM_FIELD_DEFAULT_OPTIONS"], useValue: { appearance: 'fill' } },
        ])], decls: 37, vars: 16, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], [1, "settings_title", "text-center"], ["matSort", "", 1, "w-full", 3, "dataSource", "matSortChange"], ["matColumnDef", "id"], ["mat-sort-header", "", 4, "matHeaderCellDef"], [4, "matCellDef"], ["matColumnDef", "label_short"], ["matColumnDef", "label"], ["matColumnDef", "status"], [4, "matHeaderCellDef"], ["matColumnDef", "actions"], [4, "matHeaderRowDef"], ["class", "cursor-pointer hover:text-green-400 hover:shadow-md transition-colors duration-300", 3, "routerLink", 4, "matRowDef", "matRowDefColumns"], ["showFirstLastButtons", "", 3, "length", "pageSize", "pageIndex", "pageSizeOptions", "page"], [3, "expanded"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"], ["mat-sort-header", ""], [1, "text-green-400", "text-4xl", "relative", "top-2", "leading-4"], [1, "text-red-600", "text-4xl", "relative", "top-2", "leading-4"], ["mat-icon-button", "", "class", "inline-block align-text-top", 3, "matTooltip", "click", 4, "ngIf"], ["mat-icon-button", "", 1, "inline-block", "align-text-top", 3, "matTooltip", "click"], [1, "btn-action-icon", "fas", "fa-trash", "fa-lg"], [1, "btn-action-icon", "fas", "fa-pause", "fa-lg"], [1, "btn-action-icon", "fas", "fa-play", "fa-lg"], [1, "cursor-pointer", "hover:text-green-400", "hover:shadow-md", "transition-colors", "duration-300", 3, "routerLink"]], template: function RolesListComponent_Template(rf, ctx) { if (rf & 1) {
        const _r64 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, RolesListComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](10, RolesListComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function RolesListComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r64); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](17, "hr", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "mat-table", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("matSortChange", function RolesListComponent_Template_mat_table_matSortChange_18_listener($event) { return ctx.sortData($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](19, 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](20, RolesListComponent_mat_header_cell_20_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](21, RolesListComponent_mat_cell_21_Template, 2, 1, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](22, 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](23, RolesListComponent_mat_header_cell_23_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](24, RolesListComponent_mat_cell_24_Template, 2, 1, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](25, 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](26, RolesListComponent_mat_header_cell_26_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](27, RolesListComponent_mat_cell_27_Template, 2, 1, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](28, 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](29, RolesListComponent_mat_header_cell_29_Template, 3, 3, "mat-header-cell", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](30, RolesListComponent_mat_cell_30_Template, 3, 2, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](31, 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](32, RolesListComponent_mat_header_cell_32_Template, 1, 0, "mat-header-cell", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](33, RolesListComponent_mat_cell_33_Template, 6, 5, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](34, RolesListComponent_mat_header_row_34_Template, 1, 0, "mat-header-row", 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](35, RolesListComponent_mat_row_35_Template, 1, 1, "mat-row", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](36, "mat-paginator", 24);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("page", function RolesListComponent_Template_mat_paginator_page_36_listener($event) { return ctx.onPageChange($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 13, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx.serviceSettings.getTitle());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("dataSource", ctx.roles);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matHeaderRowDef", ctx.columnsToDisplay);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matRowDefColumns", ctx.columnsToDisplay);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("length", ctx.total)("pageSize", ctx.pageSize)("pageIndex", ctx.pageIndex)("pageSizeOptions", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](15, _c0));
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_19__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_20__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_21__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_21__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_22__["MatButton"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatTable"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_24__["MatSort"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatColumnDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatRowDef"], _angular_material_paginator__WEBPACK_IMPORTED_MODULE_25__["MatPaginator"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__["MatExpansionPanelTitle"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_27__["LoaderComponent"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderCell"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_24__["MatSortHeader"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatCell"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_28__["MatTooltip"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderRow"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatRow"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJyb2xlcy1saXN0LmNvbXBvbmVudC5zY3NzIn0= */"] });


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
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
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
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r0.getErrorMessage("username"));
} }
function LoginComponent_mat_error_22_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.getErrorMessage("password"));
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
            username: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].required],
            password: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].required]
        });
        this.localeService.getCurrentLocale();
    }
    onSubmit() {
        let password = this.loginForm.get('password').value;
        let username = this.loginForm.get('username').value;
        if (password && username) {
            this.http.post(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/auth/login', {
                'username': username,
                'password': password,
                'lang': this.localeService.currentLang
            }, {
                observe: 'response'
            }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
                this.userService.setUser(data.body.user);
                this.authService.setTokens(data.body.auth_token, btoa(JSON.stringify(this.userService.getUser())), data.body.days_before_exp);
                this.authService.generateHeaders();
                this.notify.success(this.translate.instant('AUTH.authenticated'));
                this.configService.readConfig().then(() => {
                    if (this.authService.getCachedUrl()) {
                        this.router.navigate([this.authService.getCachedUrl()]).then();
                        this.authService.cleanCachedUrl();
                    }
                    else {
                        this.router.navigate(['/home']).then();
                    }
                });
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
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
LoginComponent.ɵfac = function LoginComponent_Factory(t) { return new (t || LoginComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_7__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_8__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_config_service__WEBPACK_IMPORTED_MODULE_11__["ConfigService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_locale_service__WEBPACK_IMPORTED_MODULE_12__["LocaleService"])); };
LoginComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({ type: LoginComponent, selectors: [["app-login"]], decls: 26, vars: 21, consts: [[1, "mt-32", "-mb-32", "flex", "justify-center", "h-20"], ["src", "assets/imgs/logo_opencapture.png", "alt", "Open-Capture For Invoices logo"], [1, "flex", "justify-center", "items-center", 2, "height", "85vh"], [1, "text-center", "w-full", "lg:w-1/4"], [1, "mb-10"], [3, "formGroup", "ngSubmit"], [1, "block"], ["matInput", "", "formControlName", "username", "type", "text", "required", "", 3, "placeholder"], [4, "ngIf"], ["matInput", "", "formControlName", "password", "type", "password", "required", "", 3, "placeholder"], ["mat-button", "", "type", "submit", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300"]], template: function LoginComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "img", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "mat-card", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "mat-card-title", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](6, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "mat-card-content");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](8, "form", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngSubmit", function LoginComponent_Template_form_ngSubmit_8_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "mat-form-field", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](10, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](11);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](12, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](13, "input", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](14, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](15, LoginComponent_mat_error_15_Template, 2, 1, "mat-error", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](16, "mat-form-field", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](17, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](18);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](19, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](20, "input", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](21, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](22, LoginComponent_mat_error_22_Template, 2, 1, "mat-error", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](23, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](24);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](25, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](6, 9, "GLOBAL.login"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("formGroup", ctx.loginForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](12, 11, "USER.username"));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](14, 13, "USER.username"));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.loginForm.controls.username.invalid);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](19, 15, "USER.password"));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](21, 17, "USER.password"));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.loginForm.controls.password.invalid);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](25, 19, "AUTH.login"), " ");
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_13__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_13__["MatCardTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_13__["MatCardContent"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_ba"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroupDirective"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_14__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_14__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_15__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlName"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["RequiredValidator"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_17__["MatButton"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_14__["MatError"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsb2dpbi5jb21wb25lbnQuc2NzcyJ9 */"] });


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
        return true;
    }
}
LoginRedirectService.ɵfac = function LoginRedirectService_Factory(t) { return new (t || LoginRedirectService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_auth_service__WEBPACK_IMPORTED_MODULE_1__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"])); };
LoginRedirectService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: LoginRedirectService, factory: LoginRedirectService.ɵfac, providedIn: 'root' });


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
/* harmony import */ var _angular_animations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/animations */ "R0Ic");
/* harmony import */ var _biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @biesbjerg/ngx-translate-extract-marker */ "4u49");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_locale_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../services/locale.service */ "W2Zi");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../services/privileges.service */ "JdIH");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/select */ "d3UM");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/core */ "FKr1");















function MenuComponent__svg_svg_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "svg", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "path", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function MenuComponent__svg_svg_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "svg", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "path", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} }
function MenuComponent_button_15_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "button", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("routerLinkActive", "bg-gray-900 text-green-400");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](2, 2, "GLOBAL.batches"), " ");
} }
function MenuComponent_button_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "button", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("routerLinkActive", "bg-gray-900 text-green-400");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](2, 2, "GLOBAL.batches"), " ");
} }
function MenuComponent_button_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "button", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassProp"]("disabled", !ctx_r4.privilegesService.hasPrivilege("upload"));
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("routerLinkActive", "bg-gray-900 text-green-400");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](2, 4, "GLOBAL.upload"), " ");
} }
function MenuComponent_div_37_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "button", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](2, "i", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassProp"]("settings_active", ctx_r5.location.path().includes("settings"));
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("matTooltip", ctx_r5.translate.instant("GLOBAL.settings"));
} }
function MenuComponent_div_38_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "button", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](2, "i", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassProp"]("settings_active", ctx_r6.location.path().includes("/accounts/suppliers"));
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("matTooltip", ctx_r6.translate.instant("ACCOUNTS.suppliers_list"));
} }
function MenuComponent_div_39_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "button", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](2, "i", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassProp"]("settings_active", ctx_r7.location.path().includes("accounts/customers"));
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("matTooltip", ctx_r7.translate.instant("ACCOUNTS.customers_list"));
} }
function MenuComponent_mat_option_46_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-option", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
} if (rf & 2) {
    const lang_r9 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", lang_r9[0]);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](lang_r9[1]);
} }
class MenuComponent {
    constructor(router, location, userService, translate, localeService, privilegesService, localeStorageService) {
        this.router = router;
        this.location = location;
        this.userService = userService;
        this.translate = translate;
        this.localeService = localeService;
        this.privilegesService = privilegesService;
        this.localeStorageService = localeStorageService;
        this.profileDropdownCurrentState = 'hide';
        this.profileSettingsCurrentState = 'hide';
        this.mobileMenuState = 'hide';
    }
    ngOnInit() {
        Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__["marker"])('ACCOUNTS.suppliers_list'); // Needed to get the translation in the JSON file
        Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__["marker"])('ACCOUNTS.customers_list'); // Needed to get the translation in the JSON file
        this.userService.user = this.userService.getUserFromLocal();
        if (this.userService.user) {
            this.localeService.getLocales();
            this.localeService.getCurrentLocale();
        }
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
MenuComponent.ɵfac = function MenuComponent_Factory(t) { return new (t || MenuComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_common__WEBPACK_IMPORTED_MODULE_4__["Location"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_5__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_locale_service__WEBPACK_IMPORTED_MODULE_7__["LocaleService"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_8__["PrivilegesService"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_9__["LocalStorageService"])); };
MenuComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: MenuComponent, selectors: [["app-menu"]], inputs: { image: "image" }, decls: 47, vars: 33, consts: [[1, "shadow-md", "relative", "z-30", 2, "background", "#f8f9fa"], [1, "max-w-7xl", "mx-auto", "px-2", "sm:px-6", "lg:px-8"], [1, "relative", "flex", "items-center", "justify-between", "h-16", "z-50"], [1, "absolute", "inset-y-0", "left-0", "flex", "items-center", "sm:hidden"], ["aria-expanded", "false", 1, "inline-flex", "items-center", "justify-center", "p-2", "rounded-md", "text-gray-600", "hover:text-white", "hover:bg-gray-900", "focus:ring-2", "focus:ring-inset", "focus:ring-gray-900", 3, "click"], ["class", "block h-6 w-6", "xmlns", "http://www.w3.org/2000/svg", "fill", "none", "viewBox", "0 0 24 24", "stroke", "currentColor", "aria-hidden", "true", 4, "ngIf"], [1, "flex-1", "flex", "items-center", "justify-center", "sm:items-stretch", "sm:justify-start"], [1, "flex-shrink-0", "flex", "items-center"], ["alt", "Open-Capture logo", 1, "hidden", "lg:block", "h-10", "w-auto", 3, "src"], [1, "hidden", "sm:block", "sm:ml-6"], [1, "flex", "space-x-4"], ["mat-flat-button", "", "routerLink", "/home", 1, "text-gray-500", "hover:bg-green-400", "hover:text-white", "px-3", "py-2", "text-sm", "font-medium", "transition", "duration-300", 3, "routerLinkActive"], ["mat-flat-button", "", "routerLink", "/verifier", "class", "text-gray-500 hover:bg-green-400 hover:text-white px-3 py-2 text-sm font-medium transition duration-300", 3, "routerLinkActive", 4, "ngIf"], ["mat-flat-button", "", "routerLink", "/splitter", "class", "text-gray-500 hover:bg-green-400 hover:text-white px-3 py-2 text-sm font-medium transition duration-300", 3, "routerLinkActive", 4, "ngIf"], ["mat-flat-button", "", "routerLink", "/upload", "class", "text-gray-500 hover:bg-green-400 hover:text-white px-3 py-2 text-sm font-medium transition duration-300", 3, "routerLinkActive", "disabled", 4, "ngIf"], [1, "absolute", "inset-y-0", "right-0", "flex", "items-center", "pr-2", "sm:static", "sm:inset-auto", "sm:ml-6", "sm:pr-0"], [1, "ml-3", "relative", "mr-2"], ["mat-mini-fab", "", "id", "user-menu", "aria-haspopup", "true", 1, "bg-green-400", "hover:ring-4", "hover:ring-offset-4", "hover:ring-green-400", "hover:ring-opacity-60", 3, "matTooltip", "click"], [1, "fas", "fa-users-cog"], ["role", "menu", "aria-orientation", "vertical", "aria-labelledby", "user-menu", 1, "origin-top-right", "absolute", "md:right-0", "mt-2", "w-56", "rounded-md", "shadow-lg", "py-1", "bg-white", "ring-1", "ring-black", "ring-opacity-5", "z-50"], [1, "block", "text-center", "mb-2", "text-gray-900"], ["role", "menuitem", 1, "block", "px-4", "py-2", "text-sm", "text-gray-700", "hover:bg-gray-100", "relative", 3, "routerLink", "click"], ["routerLink", "/logout", "role", "menuitem", 1, "block", "px-4", "py-2", "text-sm", "text-gray-700", "hover:bg-gray-100", "relative", 3, "click"], ["class", "ml-3 mr-2 relative", 4, "ngIf"], ["class", "ml-3 mr-2 relative border-l border-green-400 pl-5", 4, "ngIf"], ["class", "ml-3 relative", 4, "ngIf"], [1, "ml-3", "relative"], [1, "origin-top-right", "right-0", "mt-4", "w-32"], [3, "value", "selectionChange", "valueChange"], [3, "value", 4, "ngFor", "ngForOf"], ["xmlns", "http://www.w3.org/2000/svg", "fill", "none", "viewBox", "0 0 24 24", "stroke", "currentColor", "aria-hidden", "true", 1, "block", "h-6", "w-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M4 6h16M4 12h16M4 18h16"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M6 18L18 6M6 6l12 12"], ["mat-flat-button", "", "routerLink", "/verifier", 1, "text-gray-500", "hover:bg-green-400", "hover:text-white", "px-3", "py-2", "text-sm", "font-medium", "transition", "duration-300", 3, "routerLinkActive"], ["mat-flat-button", "", "routerLink", "/splitter", 1, "text-gray-500", "hover:bg-green-400", "hover:text-white", "px-3", "py-2", "text-sm", "font-medium", "transition", "duration-300", 3, "routerLinkActive"], ["mat-flat-button", "", "routerLink", "/upload", 1, "text-gray-500", "hover:bg-green-400", "hover:text-white", "px-3", "py-2", "text-sm", "font-medium", "transition", "duration-300", 3, "routerLinkActive"], [1, "ml-3", "mr-2", "relative"], ["id", "settings-menu", "aria-haspopup", "true", "mat-mini-fab", "", "routerLink", "/settings", 1, "bg-green-400", "hover:ring-4", "hover:ring-offset-4", "hover:ring-green-400", "hover:ring-opacity-60", 3, "matTooltip"], [1, "fas", "fa-cog"], [1, "ml-3", "mr-2", "relative", "border-l", "border-green-400", "pl-5"], ["id", "supplier-menu", "aria-haspopup", "true", "mat-mini-fab", "", "routerLink", "/accounts/suppliers", 1, "bg-green-400", "hover:ring-4", "hover:ring-offset-4", "hover:ring-green-400", "hover:ring-opacity-60", 3, "matTooltip"], [1, "fas", "fa-building"], ["id", "customer-menu", "aria-haspopup", "true", "mat-mini-fab", "", "routerLink", "/accounts/customers", 1, "bg-green-400", "hover:ring-4", "hover:ring-offset-4", "hover:ring-green-400", "hover:ring-opacity-60", 3, "matTooltip"], [1, "fas", "fa-user"], [3, "value"]], template: function MenuComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "nav", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](4, "button", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function MenuComponent_Template_button_click_4_listener() { return ctx.toggleMobileMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](5, MenuComponent__svg_svg_5_Template, 2, 0, "svg", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](6, MenuComponent__svg_svg_6_Template, 2, 0, "svg", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](7, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](8, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](9, "img", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](10, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](11, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](12, "button", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](13);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](14, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](15, MenuComponent_button_15_Template, 3, 4, "button", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](16, MenuComponent_button_16_Template, 3, 4, "button", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](17, MenuComponent_button_17_Template, 3, 6, "button", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](18, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](19, "div", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](20, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](21, "button", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function MenuComponent_Template_button_click_21_listener() { return ctx.toggleProfileDropdown(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](22, "i", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](23, "div", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](24, "span", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](25, "b");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](26);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](27);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](28, "i");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](29);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](30, "hr");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](31, "a", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function MenuComponent_Template_a_click_31_listener() { return ctx.closeprofileDropDown(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](32);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](33, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](34, "a", 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function MenuComponent_Template_a_click_34_listener() { return ctx.closeprofileDropDown(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](35);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](36, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](37, MenuComponent_div_37_Template, 3, 3, "div", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](38, MenuComponent_div_38_Template, 3, 3, "div", 24);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](39, MenuComponent_div_39_Template, 3, 3, "div", 25);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](40, "div", 26);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](41, "mat-form-field", 27);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](42, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](43);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](44, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](45, "mat-select", 28);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("selectionChange", function MenuComponent_Template_mat_select_selectionChange_45_listener($event) { return ctx.localeService.changeLocale($event); })("valueChange", function MenuComponent_Template_mat_select_valueChange_45_listener($event) { return ctx.localeService.currentLang = $event; });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](46, MenuComponent_mat_option_46_Template, 2, 2, "mat-option", 29);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.mobileMenuState == "hide");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.mobileMenuState == "show");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("src", ctx.image, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsanitizeUrl"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("routerLinkActive", "bg-gray-900 text-green-400");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](14, 25, "GLOBAL.home"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.location.path() !== "/home" && ctx.getSplitterOrVerifier() == "verifier");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.location.path() !== "/home" && ctx.getSplitterOrVerifier() == "splitter");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.location.path() !== "/home" && ctx.getSplitterOrVerifier() != undefined);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassProp"]("settings_active", ctx.location.path().includes("profile/" + ctx.userService.user["id"]));
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("matTooltip", ctx.translate.instant("USER.my_profile"));
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("@toggle", ctx.profileDropdownCurrentState);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](ctx.userService.user["lastname"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate2"](" ", ctx.userService.user["firstname"], " (", ctx.userService.user["username"], ") ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](ctx.userService.user["role"]["label"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpropertyInterpolate1"]("routerLink", "/profile/", ctx.userService.user["id"], "");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](33, 27, "USER.my_profile"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](36, 29, "GLOBAL.log_out"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.privilegesService.hasPrivilege("settings"));
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.privilegesService.hasPrivilege("suppliers_list"));
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.privilegesService.hasPrivilege("customers_list"));
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](44, 31, "GLOBAL.language"));
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", ctx.localeService.currentLang);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx.localeService.langs);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_10__["MatButton"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterLink"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterLinkActive"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_11__["MatTooltip"], _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterLinkWithHref"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_12__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_12__["MatLabel"], _angular_material_select__WEBPACK_IMPORTED_MODULE_13__["MatSelect"], _angular_common__WEBPACK_IMPORTED_MODULE_4__["NgForOf"], _angular_material_core__WEBPACK_IMPORTED_MODULE_14__["MatOption"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslatePipe"]], styles: [".settings_active[_ngcontent-%COMP%] {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n  --tw-ring-offset-width: 2px;\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgba(151, 191, 61, var(--tw-ring-opacity));\n  --tw-ring-opacity: 0.6;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL21lbnUuY29tcG9uZW50LnNjc3MiLCIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdGFpbHdpbmRjc3MvbGliL2xpYi9zdWJzdGl0dXRlQ2xhc3NBcHBseUF0UnVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUNFQSwyR0FBbUI7RUFBbkIseUdBQW1CO0VBQW5CLDRGQUFtQjtFQUFuQiwyQkFBbUI7RUFBbkIsb0JBQW1CO0VBQW5CLDJEQUFtQjtFQUFuQixzQkFBbUI7QURHbkIiLCJmaWxlIjoibWVudS5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5zZXR0aW5nc19hY3RpdmV7XG4gICAgQGFwcGx5IHJpbmctNDtcbiAgICBAYXBwbHkgcmluZy1vZmZzZXQtMjtcbiAgICBAYXBwbHkgcmluZy1ncmVlbi00MDA7XG4gICAgQGFwcGx5IHJpbmctb3BhY2l0eS02MDtcbn0iLCJAdGFpbHdpbmQgYmFzZTtcbkB0YWlsd2luZCBjb21wb25lbnRzO1xuQHRhaWx3aW5kIHV0aWxpdGllczsiXX0= */"], data: { animation: [
            Object(_angular_animations__WEBPACK_IMPORTED_MODULE_0__["trigger"])('toggle', [
                Object(_angular_animations__WEBPACK_IMPORTED_MODULE_0__["state"])('hide', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_0__["style"])({
                    display: 'none',
                })),
                Object(_angular_animations__WEBPACK_IMPORTED_MODULE_0__["state"])('show', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_0__["style"])({
                    display: "block",
                })),
                Object(_angular_animations__WEBPACK_IMPORTED_MODULE_0__["transition"])('show => hide', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_0__["animate"])('150ms ease-out')),
                Object(_angular_animations__WEBPACK_IMPORTED_MODULE_0__["transition"])('hide => show', Object(_angular_animations__WEBPACK_IMPORTED_MODULE_0__["animate"])('100ms ease-in'))
            ])
        ] } });


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


/***/ }),

/***/ "3D8z":
/*!**************************************************************************************!*\
  !*** ./src/frontend/app/settings/general/version-update/version-update.component.ts ***!
  \**************************************************************************************/
/*! exports provided: VersionUpdateComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VersionUpdateComponent", function() { return VersionUpdateComponent; });
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../services/user.service */ "N74B");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../services/auth.service */ "PS2H");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../loader.component */ "sUWp");




















function VersionUpdateComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r15 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "button", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function VersionUpdateComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r15); const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](4).$implicit; const parent_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r13.serviceSettings.changeSetting(setting_r5["id"], parent_r3["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "p", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("text-green-400", ctx_r12.router.url.includes(action_r11["route"]))("disable_link", action_r11["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpropertyInterpolate"]("routerLink", action_r11["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r11["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](5, 9, action_r11["label"]), " ");
} }
function VersionUpdateComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, VersionUpdateComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r11 = ctx.$implicit;
    const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3).$implicit;
    const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("border-gray-600", !action_r11["showOnlyIfActive"])("border-t", !action_r11["showOnlyIfActive"])("w-full", !action_r11["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", (ctx_r10.privilegesService.hasPrivilege(action_r11["privilege"]) || setting_r5["privilege"] == "*") && (!action_r11["showOnlyIfActive"] || action_r11["showOnlyIfActive"] && ctx_r10.router.url.includes(action_r11["route"])));
} }
function VersionUpdateComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r21 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "mat-expansion-panel", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "mat-expansion-panel-header", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "mat-panel-title", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "button", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function VersionUpdateComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r21); const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit; const parent_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r19.serviceSettings.changeSetting(setting_r5["id"], parent_r3["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "p", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](8, VersionUpdateComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit;
    const parent_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("expanded", ctx_r9.router.url.includes(setting_r5["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r5["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("text-green-400", ctx_r9.router.url == setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("text-green-400", ctx_r9.router.url == setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpropertyInterpolate"]("routerLink", setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("font-medium", ctx_r9.router.url == setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](7, 13, setting_r5["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r9.serviceSettings.getSettingsAction(parent_r3["id"], setting_r5["id"]));
} }
function VersionUpdateComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, VersionUpdateComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r6.privilegesService.hasPrivilege(setting_r5["privilege"]) || setting_r5["privilege"] == "*");
} }
function VersionUpdateComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r29 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "button", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function VersionUpdateComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r29); const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit; const parent_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r27 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r27.serviceSettings.changeSetting(setting_r5["id"], parent_r3["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "p", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit;
    const ctx_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("text-green-400", ctx_r26.router.url == setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpropertyInterpolate"]("routerLink", setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r5["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("font-medium", ctx_r26.router.url == setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](4, 9, setting_r5["label"]), " ");
} }
function VersionUpdateComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](0, VersionUpdateComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 29);
} if (rf & 2) {
    const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r8.privilegesService.hasPrivilege(setting_r5["privilege"]) || setting_r5["privilege"] == "*");
} }
function VersionUpdateComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, VersionUpdateComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, VersionUpdateComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 18, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r5 = ctx.$implicit;
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵreference"](3);
    const parent_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("border-b", ctx_r4.privilegesService.hasPrivilege(setting_r5["privilege"]) || setting_r5["privilege"] == "*")("border-gray-400", ctx_r4.privilegesService.hasPrivilege(setting_r5["privilege"]) || setting_r5["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r4.serviceSettings.getSettingsAction(parent_r3["id"], setting_r5["id"]))("ngIfElse", _r7);
} }
function VersionUpdateComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "mat-expansion-panel", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "mat-expansion-panel-header", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](6, VersionUpdateComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r3 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r3["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](4, 3, parent_r3["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r3["id"]]);
} }
function VersionUpdateComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
class VersionUpdateComponent {
    constructor(router, http, route, userService, formBuilder, authService, translate, notify, serviceSettings, privilegesService) {
        this.router = router;
        this.http = http;
        this.route = route;
        this.userService = userService;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.translate = translate;
        this.notify = notify;
        this.serviceSettings = serviceSettings;
        this.privilegesService = privilegesService;
        this.loading = true;
    }
    ngOnInit() {
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/config/gitInfo', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
            console.log(data);
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
        })).subscribe();
    }
}
VersionUpdateComponent.ɵfac = function VersionUpdateComponent_Factory(t) { return new (t || VersionUpdateComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_6__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_7__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_11__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_12__["PrivilegesService"])); };
VersionUpdateComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: VersionUpdateComponent, selectors: [["app-version-update"]], decls: 18, vars: 8, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], [1, "settings_title", "text-center"], [3, "expanded"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"]], template: function VersionUpdateComponent_Template(rf, ctx) { if (rf & 1) {
        const _r34 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](8, VersionUpdateComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](10, VersionUpdateComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function VersionUpdateComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r34); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](15, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](17, "hr", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](5, 6, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.serviceSettings.getTitle());
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_15__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_17__["MatButton"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanelTitle"], _angular_router__WEBPACK_IMPORTED_MODULE_4__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_19__["LoaderComponent"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ2ZXJzaW9uLXVwZGF0ZS5jb21wb25lbnQuc2NzcyJ9 */"] });


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
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");



/** A router wrapper, adding extra functions. */
class LastUrlService {
    constructor(router) {
        this.router = router;
        this.previousUrl = '';
        this.currentUrl = '';
        this.currentUrl = this.router.url;
        router.events.subscribe(event => {
            if (event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_0__["NavigationEnd"]) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;
            }
        });
    }
    getPreviousUrl() {
        return this.previousUrl;
    }
}
LastUrlService.ɵfac = function LastUrlService_Factory(t) { return new (t || LastUrlService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_0__["Router"])); };
LastUrlService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: LastUrlService, factory: LastUrlService.ɵfac });


/***/ }),

/***/ "6I7K":
/*!******************************************************************************!*\
  !*** ./src/frontend/app/settings/general/users/list/users-list.component.ts ***!
  \******************************************************************************/
/*! exports provided: UsersListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UsersListComponent", function() { return UsersListComponent; });
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../env */ "7esm");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../services/confirm-dialog/confirm-dialog.component */ "GI+y");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../../services/user.service */ "N74B");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../../services/auth.service */ "PS2H");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_last_url_service__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../../../services/last-url.service */ "463q");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/table */ "+0xr");
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/sort */ "Dh3D");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ../../../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");





























function UsersListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r31 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "button", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function UsersListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r31); const setting_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](4).$implicit; const parent_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r29 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r29.serviceSettings.changeSetting(setting_r21["id"], parent_r19["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "p", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r27 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r28.router.url.includes(action_r27["route"]))("disable_link", action_r27["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", action_r27["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r27["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 9, action_r27["label"]), " ");
} }
function UsersListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, UsersListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r27 = ctx.$implicit;
    const setting_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3).$implicit;
    const ctx_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("border-gray-600", !action_r27["showOnlyIfActive"])("border-t", !action_r27["showOnlyIfActive"])("w-full", !action_r27["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", (ctx_r26.privilegesService.hasPrivilege(action_r27["privilege"]) || setting_r21["privilege"] == "*") && (!action_r27["showOnlyIfActive"] || action_r27["showOnlyIfActive"] && ctx_r26.router.url.includes(action_r27["route"])));
} }
function UsersListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r37 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-expansion-panel-header", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-panel-title", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "button", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function UsersListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r37); const setting_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit; const parent_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r35.serviceSettings.changeSetting(setting_r21["id"], parent_r19["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "p", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, UsersListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit;
    const parent_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", ctx_r25.router.url.includes(setting_r21["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r21["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r25.router.url == setting_r21["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r25.router.url == setting_r21["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", setting_r21["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("font-medium", ctx_r25.router.url == setting_r21["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](7, 13, setting_r21["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r25.serviceSettings.getSettingsAction(parent_r19["id"], setting_r21["id"]));
} }
function UsersListComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, UsersListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r22.privilegesService.hasPrivilege(setting_r21["privilege"]) || setting_r21["privilege"] == "*");
} }
function UsersListComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r45 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function UsersListComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r45); const setting_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit; const parent_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r43.serviceSettings.changeSetting(setting_r21["id"], parent_r19["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "p", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit;
    const ctx_r42 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r42.router.url == setting_r21["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", setting_r21["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r21["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("font-medium", ctx_r42.router.url == setting_r21["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 9, setting_r21["label"]), " ");
} }
function UsersListComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](0, UsersListComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 43);
} if (rf & 2) {
    const setting_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r24.privilegesService.hasPrivilege(setting_r21["privilege"]) || setting_r21["privilege"] == "*");
} }
function UsersListComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, UsersListComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, UsersListComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 32, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r21 = ctx.$implicit;
    const _r23 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](3);
    const parent_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("border-b", ctx_r20.privilegesService.hasPrivilege(setting_r21["privilege"]) || setting_r21["privilege"] == "*")("border-gray-400", ctx_r20.privilegesService.hasPrivilege(setting_r21["privilege"]) || setting_r21["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r20.serviceSettings.getSettingsAction(parent_r19["id"], setting_r21["id"]))("ngIfElse", _r23);
} }
function UsersListComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-expansion-panel-header", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](6, UsersListComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r19 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r19["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 3, parent_r19["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r19["id"]]);
} }
function UsersListComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function UsersListComponent_mat_header_cell_19_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "HEADER.id"), " ");
} }
function UsersListComponent_mat_cell_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r50 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r50.id, " ");
} }
function UsersListComponent_mat_header_cell_22_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "USER.username"), " ");
} }
function UsersListComponent_mat_cell_23_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r51 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r51.username, " ");
} }
function UsersListComponent_mat_header_cell_25_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "USER.firstname"), " ");
} }
function UsersListComponent_mat_cell_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r52 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r52.firstname, " ");
} }
function UsersListComponent_mat_header_cell_28_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "USER.lastname"), " ");
} }
function UsersListComponent_mat_cell_29_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r53 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r53.lastname, " ");
} }
function UsersListComponent_mat_header_cell_31_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "HEADER.role"), " ");
} }
function UsersListComponent_mat_cell_32_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r54 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r54.role_label, " ");
} }
function UsersListComponent_mat_header_cell_34_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "HEADER.status"), " ");
} }
function UsersListComponent_mat_cell_35_span_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "span", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 1, "HEADER.active"), "");
} }
function UsersListComponent_mat_cell_35_span_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 1, "HEADER.inactive"), "");
} }
function UsersListComponent_mat_cell_35_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, UsersListComponent_mat_cell_35_span_1_Template, 5, 3, "span", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, UsersListComponent_mat_cell_35_span_2_Template, 5, 3, "span", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r55 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r55.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !element_r55.enabled);
} }
function UsersListComponent_mat_header_cell_37_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-header-cell");
} }
function UsersListComponent_mat_cell_38_button_1_Template(rf, ctx) { if (rf & 1) {
    const _r63 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function UsersListComponent_mat_cell_38_button_1_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r63); const element_r58 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r61 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r61.disableConfirmDialog(element_r58.id, element_r58.username); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "i", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](1, 1, "USER.disable"));
} }
function UsersListComponent_mat_cell_38_button_2_Template(rf, ctx) { if (rf & 1) {
    const _r66 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function UsersListComponent_mat_cell_38_button_2_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r66); const element_r58 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r64 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r64.enableConfirmDialog(element_r58.id, element_r58.username); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "i", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](1, 1, "USER.enable"));
} }
function UsersListComponent_mat_cell_38_Template(rf, ctx) { if (rf & 1) {
    const _r68 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, UsersListComponent_mat_cell_38_button_1_Template, 3, 3, "button", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, UsersListComponent_mat_cell_38_button_2_Template, 3, 3, "button", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "button", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function UsersListComponent_mat_cell_38_Template_button_click_3_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r68); const element_r58 = ctx.$implicit; const ctx_r67 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r67.deleteConfirmDialog(element_r58.id, element_r58.username); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](5, "i", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r58 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r58.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !element_r58.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 3, "GLOBAL.delete"));
} }
function UsersListComponent_mat_header_row_39_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-header-row");
} }
function UsersListComponent_mat_row_40_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-row", 52);
} if (rf & 2) {
    const row_r69 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate1"]("routerLink", "/settings/general/users/update/", row_r69.id, "");
} }
const _c0 = function () { return [5, 10, 15, 20, 50]; };
class UsersListComponent {
    constructor(router, http, dialog, route, userService, formBuilder, authService, translate, notify, serviceSettings, routerExtService, privilegesService, localeStorageService) {
        this.router = router;
        this.http = http;
        this.dialog = dialog;
        this.route = route;
        this.userService = userService;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.translate = translate;
        this.notify = notify;
        this.serviceSettings = serviceSettings;
        this.routerExtService = routerExtService;
        this.privilegesService = privilegesService;
        this.localeStorageService = localeStorageService;
        this.headers = this.authService.headers;
        this.loading = true;
        this.columnsToDisplay = ['id', 'username', 'firstname', 'lastname', 'role', 'status', 'actions'];
        this.users = [];
        this.pageSize = 10;
        this.pageIndex = 0;
        this.total = 0;
        this.offset = 0;
        this.roles = [];
    }
    ngOnInit() {
        this.serviceSettings.init();
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('profile/') || lastUrl == '/') {
            if (this.localeStorageService.get('usersPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('usersPageIndex'));
            this.offset = this.pageSize * (this.pageIndex);
        }
        else
            this.localeStorageService.remove('usersPageIndex');
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/list', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["tap"])((data) => {
            this.roles = data.roles;
            this.loadUsers();
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
        })).subscribe();
    }
    onPageChange(event) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.localeStorageService.save('usersPageIndex', event.pageIndex);
        this.loadUsers();
    }
    loadUsers() {
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/users/list?limit=' + this.pageSize + '&offset=' + this.offset, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["tap"])((data) => {
            this.total = data.users[0].total;
            this.users = data.users;
            if (this.roles) {
                this.users.forEach((user) => {
                    this.roles.forEach((element) => {
                        if (user.role == element.id) {
                            user.role_label = element.label;
                        }
                    });
                });
            }
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
        })).subscribe();
    }
    deleteConfirmDialog(user_id, user) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
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
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
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
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
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
        if (user_id !== undefined) {
            this.http.delete(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/users/delete/' + user_id, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["tap"])(() => {
                this.loadUsers();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
            })).subscribe();
        }
    }
    disableUser(user_id) {
        if (user_id !== undefined) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/users/disable/' + user_id, null, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["tap"])(() => {
                this.loadUsers();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
            })).subscribe();
        }
    }
    enableUser(user_id) {
        if (user_id !== undefined) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/users/enable/' + user_id, null, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["tap"])(() => {
                this.loadUsers();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_0__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
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
                case 'role': return this.compare(a.role_label, b.role_label, isAsc);
                case 'status': return this.compare(a.enabled, b.enabled, isAsc);
                default: return 0;
            }
        });
    }
    compare(a, b, isAsc) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
UsersListComponent.ɵfac = function UsersListComponent_Factory(t) { return new (t || UsersListComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_8__["MatDialog"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_10__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_11__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_13__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_14__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_last_url_service__WEBPACK_IMPORTED_MODULE_15__["LastUrlService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_16__["PrivilegesService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_17__["LocalStorageService"])); };
UsersListComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({ type: UsersListComponent, selectors: [["app-users-list"]], features: [_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵProvidersFeature"]([
            { provide: _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__["MAT_FORM_FIELD_DEFAULT_OPTIONS"], useValue: { appearance: 'fill' } },
        ])], decls: 42, vars: 16, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], [1, "text-center"], ["matSort", "", 1, "w-full", 3, "dataSource", "matSortChange"], ["matColumnDef", "id"], ["mat-sort-header", "", 4, "matHeaderCellDef"], [4, "matCellDef"], ["matColumnDef", "username"], ["matColumnDef", "firstname"], ["matColumnDef", "lastname"], ["matColumnDef", "role"], ["matColumnDef", "status"], ["matColumnDef", "actions"], [4, "matHeaderCellDef"], [4, "matHeaderRowDef"], ["class", "cursor-pointer hover:text-green-400 hover:shadow-md transition-colors duration-300", 3, "routerLink", 4, "matRowDef", "matRowDefColumns"], ["showFirstLastButtons", "", 3, "length", "pageSize", "pageIndex", "pageSizeOptions", "page"], [3, "expanded"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"], ["mat-sort-header", ""], [1, "text-green-400", "text-4xl", "relative", "top-2", "leading-4"], [1, "text-red-600", "text-4xl", "relative", "top-2", "leading-4"], ["mat-icon-button", "", "class", "inline-block align-text-top", 3, "matTooltip", "click", 4, "ngIf"], ["mat-icon-button", "", 1, "inline-block", "align-text-top", 3, "matTooltip", "click"], [1, "btn-action-icon", "fas", "fa-trash", "fa-lg"], [1, "btn-action-icon", "fas", "fa-pause", "fa-lg"], [1, "btn-action-icon", "fas", "fa-play", "fa-lg"], [1, "cursor-pointer", "hover:text-green-400", "hover:shadow-md", "transition-colors", "duration-300", 3, "routerLink"]], template: function UsersListComponent_Template(rf, ctx) { if (rf & 1) {
        const _r70 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, UsersListComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](10, UsersListComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function UsersListComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r70); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "h3", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](16, "hr", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](17, "mat-table", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("matSortChange", function UsersListComponent_Template_mat_table_matSortChange_17_listener($event) { return ctx.sortData($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](18, 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](19, UsersListComponent_mat_header_cell_19_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](20, UsersListComponent_mat_cell_20_Template, 2, 1, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](21, 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](22, UsersListComponent_mat_header_cell_22_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](23, UsersListComponent_mat_cell_23_Template, 2, 1, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](24, 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](25, UsersListComponent_mat_header_cell_25_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](26, UsersListComponent_mat_cell_26_Template, 2, 1, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](27, 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](28, UsersListComponent_mat_header_cell_28_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](29, UsersListComponent_mat_cell_29_Template, 2, 1, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](30, 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](31, UsersListComponent_mat_header_cell_31_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](32, UsersListComponent_mat_cell_32_Template, 2, 1, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](33, 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](34, UsersListComponent_mat_header_cell_34_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](35, UsersListComponent_mat_cell_35_Template, 3, 2, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](36, 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](37, UsersListComponent_mat_header_cell_37_Template, 1, 0, "mat-header-cell", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](38, UsersListComponent_mat_cell_38_Template, 6, 5, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](39, UsersListComponent_mat_header_row_39_Template, 1, 0, "mat-header-row", 24);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](40, UsersListComponent_mat_row_40_Template, 1, 1, "mat-row", 25);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](41, "mat-paginator", 26);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("page", function UsersListComponent_Template_mat_paginator_page_41_listener($event) { return ctx.onPageChange($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 13, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx.serviceSettings.getTitle());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("dataSource", ctx.users);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](22);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matHeaderRowDef", ctx.columnsToDisplay);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matRowDefColumns", ctx.columnsToDisplay);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("length", ctx.total)("pageSize", ctx.pageSize)("pageIndex", ctx.pageIndex)("pageSizeOptions", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](15, _c0));
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_19__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_20__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_21__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_21__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_22__["MatButton"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatTable"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_24__["MatSort"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatColumnDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatRowDef"], _angular_material_paginator__WEBPACK_IMPORTED_MODULE_25__["MatPaginator"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__["MatExpansionPanelTitle"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_27__["LoaderComponent"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderCell"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_24__["MatSortHeader"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatCell"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_28__["MatTooltip"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderRow"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatRow"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ1c2Vycy1saXN0LmNvbXBvbmVudC5zY3NzIn0= */"] });


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
const API_URL = 'http://192.168.1.9:5000';
// export const API_URL = '../../backend_oc';


/***/ }),

/***/ "878q":
/*!************************************************************************************!*\
  !*** ./src/frontend/app/settings/general/custom-fields/custom-fields.component.ts ***!
  \************************************************************************************/
/*! exports provided: CustomFieldsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustomFieldsComponent", function() { return CustomFieldsComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/cdk/drag-drop */ "5+WD");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/tabs */ "wZkO");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/select */ "d3UM");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/material/core */ "FKr1");




























function CustomFieldsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "button", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function CustomFieldsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r17); const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](4).$implicit; const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r15.serviceSettings.changeSetting(setting_r7["id"], parent_r5["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "p", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r14.router.url.includes(action_r13["route"]))("disable_link", action_r13["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", action_r13["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r13["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 9, action_r13["label"]), " ");
} }
function CustomFieldsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, CustomFieldsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r13 = ctx.$implicit;
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3).$implicit;
    const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("border-gray-600", !action_r13["showOnlyIfActive"])("border-t", !action_r13["showOnlyIfActive"])("w-full", !action_r13["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", (ctx_r12.privilegesService.hasPrivilege(action_r13["privilege"]) || setting_r7["privilege"] == "*") && (!action_r13["showOnlyIfActive"] || action_r13["showOnlyIfActive"] && ctx_r12.router.url.includes(action_r13["route"])));
} }
function CustomFieldsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r23 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-expansion-panel-header", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-panel-title", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "button", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function CustomFieldsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r23); const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit; const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r21.serviceSettings.changeSetting(setting_r7["id"], parent_r5["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "p", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, CustomFieldsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit;
    const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", ctx_r11.router.url.includes(setting_r7["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r7["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r11.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r11.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("font-medium", ctx_r11.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](7, 13, setting_r7["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r11.serviceSettings.getSettingsAction(parent_r5["id"], setting_r7["id"]));
} }
function CustomFieldsComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, CustomFieldsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r8.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*");
} }
function CustomFieldsComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r31 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function CustomFieldsComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r31); const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit; const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r29 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r29.serviceSettings.changeSetting(setting_r7["id"], parent_r5["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "p", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit;
    const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r28.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r7["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("font-medium", ctx_r28.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 9, setting_r7["label"]), " ");
} }
function CustomFieldsComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](0, CustomFieldsComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 37);
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r10.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*");
} }
function CustomFieldsComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, CustomFieldsComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, CustomFieldsComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 26, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = ctx.$implicit;
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](3);
    const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("border-b", ctx_r6.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*")("border-gray-400", ctx_r6.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r6.serviceSettings.getSettingsAction(parent_r5["id"], setting_r7["id"]))("ngIfElse", _r9);
} }
function CustomFieldsComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-expansion-panel-header", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](6, CustomFieldsComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r5 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r5["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 3, parent_r5["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r5["id"]]);
} }
function CustomFieldsComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function CustomFieldsComponent_mat_form_field_26_input_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "input", 42);
} if (rf & 2) {
    const input_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("formControlName", input_r36.label_short)("id", input_r36.label_short)("type", input_r36.type);
} }
function CustomFieldsComponent_mat_form_field_26_mat_select_6_mat_option_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-option", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const opt_r41 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("value", opt_r41.key);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 2, opt_r41.value), " ");
} }
function CustomFieldsComponent_mat_form_field_26_mat_select_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-select", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, CustomFieldsComponent_mat_form_field_26_mat_select_6_mat_option_1_Template, 3, 4, "mat-option", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const input_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("id", input_r36.label_short)("formControlName", input_r36.label_short);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", input_r36.options);
} }
function CustomFieldsComponent_mat_form_field_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-form-field", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](5, CustomFieldsComponent_mat_form_field_26_input_5_Template, 1, 3, "input", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](6, CustomFieldsComponent_mat_form_field_26_mat_select_6_Template, 2, 3, "mat-select", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const input_r36 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵattribute"]("for", input_r36.label_short);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](3, 5, input_r36.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngSwitch", input_r36.controlType);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngSwitchCase", "textbox");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngSwitchCase", "dropdown");
} }
function CustomFieldsComponent_mat_tab_33_span_7_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r51 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "div", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "span", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "button", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function CustomFieldsComponent_mat_tab_33_span_7_div_1_Template_button_click_6_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r51); const i_r47 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const ctx_r49 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r49.moveToActive(i_r47); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](7, "i", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r46 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", item_r46.label, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" (", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 2, "CUSTOM-FIELDS." + item_r46.type), ") ");
} }
function CustomFieldsComponent_mat_tab_33_span_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, CustomFieldsComponent_mat_tab_33_span_7_div_1_Template, 8, 4, "div", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r46 = ctx.$implicit;
    const parent_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", item_r46.module == parent_r43["id"]);
} }
function CustomFieldsComponent_mat_tab_33_span_13_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r59 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "div", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "span", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "button", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function CustomFieldsComponent_mat_tab_33_span_13_div_1_Template_button_click_6_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r59); const i_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().index; const ctx_r57 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2); return ctx_r57.moveToInactive(i_r55); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](7, "i", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r54 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", item_r54.label, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" (", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 2, "CUSTOM-FIELDS." + item_r54.type), ") ");
} }
function CustomFieldsComponent_mat_tab_33_span_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, CustomFieldsComponent_mat_tab_33_span_13_div_1_Template, 8, 4, "div", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r54 = ctx.$implicit;
    const parent_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", item_r54.module == parent_r43["id"]);
} }
function CustomFieldsComponent_mat_tab_33_Template(rf, ctx) { if (rf & 1) {
    const _r63 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-tab", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "div", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "div", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "h2");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "div", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("cdkDropListDropped", function CustomFieldsComponent_mat_tab_33_Template_div_cdkDropListDropped_6_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r63); const ctx_r62 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r62.drop($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](7, CustomFieldsComponent_mat_tab_33_span_7_Template, 2, 1, "span", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "div", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "h2");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](11, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "div", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("cdkDropListDropped", function CustomFieldsComponent_mat_tab_33_Template_div_cdkDropListDropped_12_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r63); const ctx_r64 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r64.drop($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](13, CustomFieldsComponent_mat_tab_33_span_13_Template, 2, 1, "span", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r43 = ctx.$implicit;
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("label", ctx_r4.translate.instant(parent_r43.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 7, "HEADER.inactive"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("cdkDropListData", ctx_r4.inactiveFields);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r4.inactiveFields);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](11, 9, "HEADER.active"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("cdkDropListData", ctx_r4.activeFields);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r4.activeFields);
} }
class CustomFieldsComponent {
    constructor(http, router, route, formBuilder, authService, userService, translate, notify, serviceSettings, privilegesService) {
        this.http = http;
        this.router = router;
        this.route = route;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.userService = userService;
        this.translate = translate;
        this.notify = notify;
        this.serviceSettings = serviceSettings;
        this.privilegesService = privilegesService;
        this.inactiveFields = [];
        this.activeFields = [];
        this.parent = [
            {
                'id': 'verifier',
                'label': 'Open-Capture Verifier'
            },
            {
                'id': 'splitter',
                'label': 'Open-Capture Splitter'
            }
        ];
        this.addFieldInputs = [
            {
                controlType: 'textbox',
                label_short: 'label_short',
                label: this.translate.instant('HEADER.label_short'),
                required: true,
            },
            {
                controlType: 'textbox',
                label_short: 'label',
                label: this.translate.instant('HEADER.label'),
                required: true,
            },
            {
                controlType: 'dropdown',
                label_short: 'type',
                label: this.translate.instant('CUSTOM-FIELDS.type'),
                options: [
                    { key: 'textbox', value: this.translate.instant('CUSTOM-FIELDS.textbox') },
                    { key: 'textarea', value: this.translate.instant('CUSTOM-FIELDS.textarea') },
                    { key: 'select', value: this.translate.instant('CUSTOM-FIELDS.select') },
                    { key: 'checkBok', value: this.translate.instant('CUSTOM-FIELDS.checkbox') },
                ],
                required: true,
            },
            {
                controlType: 'dropdown',
                label_short: 'module',
                label: this.translate.instant('CUSTOM-FIELDS.module'),
                options: [
                    { key: 'verifier', value: this.translate.instant('HOME.verifier') },
                    { key: 'splitter', value: this.translate.instant('HOME.splitter') }
                ],
                required: true,
            },
        ];
        this.loading = true;
    }
    ngOnInit() {
        this.retrieveCustomFields();
        this.form = this.toFormGroup();
    }
    drop(event) {
        if (event.previousContainer === event.container) {
            Object(_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["moveItemInArray"])(event.container.data, event.previousIndex, event.currentIndex);
        }
        else {
            this.enableCustomField(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
    }
    toFormGroup() {
        const group = {};
        this.addFieldInputs.forEach(input => {
            group[input.label_short] = input.required ? new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](input.value || '', _angular_forms__WEBPACK_IMPORTED_MODULE_0__["Validators"].required)
                : new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](input.value || '');
        });
        return new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroup"](group);
    }
    moveToActive(index) {
        this.enableCustomField(this.inactiveFields, this.activeFields, index, this.activeFields.length);
    }
    moveToInactive(index) {
        this.enableCustomField(this.activeFields, this.inactiveFields, index, this.inactiveFields.length);
    }
    retrieveCustomFields() {
        let newField;
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/customFields/list', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
            data.customFields.forEach((field) => {
                newField = {
                    'id': field.id,
                    'label_short': field.label_short,
                    'module': field.module,
                    'label': field.label,
                    'type': field.type,
                    'enabled': field.enabled,
                };
                field.enabled ? this.activeFields.push(newField) : this.inactiveFields.push(newField);
            });
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
        })).subscribe();
    }
    addCustomField() {
        let newField = this.form.getRawValue();
        newField = {
            'label_short': newField.label_short,
            'label': newField.label,
            'type': newField.type,
            'module': newField.module,
            'enabled': newField.enabled,
        };
        this.http.post(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/customFields/add', newField, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
            newField['id'] = data.id;
            this.activeFields.push(newField);
            this.notify.success(this.translate.instant('CUSTOM-FIELDS.field_added'));
            this.form.reset();
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
        })).subscribe();
    }
    enableCustomField(oldList, newList, oldIndex, newIndex) {
        let updatedField = oldList[oldIndex];
        updatedField = {
            'id': updatedField['id'],
            'label_short': updatedField['label_short'],
            'module': updatedField['module'],
            'label': updatedField['label'],
            'type': updatedField['type'],
            'enabled': !updatedField['enabled']
        };
        this.http.post(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/customFields/update', updatedField, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
            Object(_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["transferArrayItem"])(oldList, newList, oldIndex, newIndex);
            this.notify.success(this.translate.instant('CUSTOM-FIELDS.field_updated'));
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
        })).subscribe();
    }
}
CustomFieldsComponent.ɵfac = function CustomFieldsComponent_Factory(t) { return new (t || CustomFieldsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_12__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_13__["PrivilegesService"])); };
CustomFieldsComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({ type: CustomFieldsComponent, selectors: [["app-custom-fields"]], decls: 34, vars: 19, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], [1, "settings_title", "text-center"], [1, "setting-custom-fields"], [3, "expanded"], [3, "formGroup", "ngSubmit"], [1, "mx-8", "grid", "grid-cols-6", "gap-4", 3, "formGroup"], ["appearance", "outline", "class", "w-full", 4, "ngFor", "ngForOf"], [1, "flex", "justify-center", "m-5"], ["mat-button", "", "type", "submit", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300"], [1, "custom-fields-control", "w-full"], [3, "label", 4, "ngFor", "ngForOf"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"], ["appearance", "outline", 1, "w-full"], [3, "ngSwitch"], ["matInput", "", 3, "formControlName", "id", "type", 4, "ngSwitchCase"], [3, "id", "formControlName", 4, "ngSwitchCase"], ["matInput", "", 3, "formControlName", "id", "type"], [3, "id", "formControlName"], [3, "value", 4, "ngFor", "ngForOf"], [3, "value"], [3, "label"], ["cdkDropListGroup", "", 1, "w-max", "mx-auto"], [1, "list-container"], ["cdkDropList", "", 1, "custom-fields-list", "overflow-auto", 3, "cdkDropListData", "cdkDropListDropped"], [4, "ngFor", "ngForOf"], ["cdkDrag", "", "class", "custom-field-box", 4, "ngIf"], ["cdkDrag", "", 1, "custom-field-box"], [1, "text-left"], [1, "text-gray-400"], ["mat-button", "", 3, "click"], [1, "fa", "fa-plus"], [1, "fa", "fa-minus"]], template: function CustomFieldsComponent_Template(rf, ctx) { if (rf & 1) {
        const _r65 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, CustomFieldsComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](10, CustomFieldsComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function CustomFieldsComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r65); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](17, "hr", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "mat-accordion", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](19, "mat-expansion-panel", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](20, "mat-expansion-panel-header");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](21, "mat-panel-title");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](22);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](23, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](24, "form", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("ngSubmit", function CustomFieldsComponent_Template_form_ngSubmit_24_listener() { return ctx.addCustomField(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](25, "div", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](26, CustomFieldsComponent_mat_form_field_26_Template, 7, 7, "mat-form-field", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](27, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](28, "button", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](29);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](30, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](31, "div", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](32, "mat-tab-group");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](33, CustomFieldsComponent_mat_tab_33_Template, 14, 11, "mat-tab", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 13, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx.serviceSettings.getTitle());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](23, 15, "SETTINGS.add_custom_fields"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("formGroup", ctx.form);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("formGroup", ctx.form);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx.addFieldInputs);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](30, 17, "CUSTOM-FIELDS.add"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx.parent);
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_14__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_14__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_15__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_16__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_17__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_14__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_17__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_18__["MatButton"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_19__["MatAccordion"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_19__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_19__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_19__["MatExpansionPanelTitle"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_ba"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormGroupDirective"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_20__["MatTabGroup"], _angular_router__WEBPACK_IMPORTED_MODULE_7__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_21__["LoaderComponent"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_22__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_22__["MatLabel"], _angular_common__WEBPACK_IMPORTED_MODULE_17__["NgSwitch"], _angular_common__WEBPACK_IMPORTED_MODULE_17__["NgSwitchCase"], _angular_material_input__WEBPACK_IMPORTED_MODULE_23__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlName"], _angular_material_select__WEBPACK_IMPORTED_MODULE_24__["MatSelect"], _angular_material_core__WEBPACK_IMPORTED_MODULE_25__["MatOption"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_20__["MatTab"], _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["CdkDropListGroup"], _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["CdkDropList"], _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["CdkDrag"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslatePipe"]], styles: [".list-container[_ngcontent-%COMP%] {\n  width: 400px;\n  max-width: 100%;\n  margin: 25px;\n  display: inline-block;\n  vertical-align: top;\n}\n\n.list-container[_ngcontent-%COMP%]    > h2[_ngcontent-%COMP%] {\n  margin: 0;\n}\n\n.custom-fields-control[_ngcontent-%COMP%] {\n  margin-top: 25px;\n  border: solid 1px #ccc;\n  border-radius: 4px;\n}\n\n.custom-fields-list[_ngcontent-%COMP%] {\n  border: solid 1px #ccc;\n  min-height: 200px;\n  background: white;\n  border-radius: 4px;\n  overflow: hidden;\n  display: block;\n}\n\n.custom-field-box[_ngcontent-%COMP%] {\n  padding: 20px 10px;\n  border-bottom: solid 1px #ccc;\n  color: rgba(0, 0, 0, 0.87);\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  justify-content: space-between;\n  box-sizing: border-box;\n  cursor: move;\n  background: white;\n  font-size: 14px;\n}\n\n.cdk-drag-preview[_ngcontent-%COMP%] {\n  box-sizing: border-box;\n  border-radius: 4px;\n  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);\n}\n\n.cdk-drag-placeholder[_ngcontent-%COMP%] {\n  opacity: 0;\n}\n\n.cdk-drag-animating[_ngcontent-%COMP%] {\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n\n.custom-fields-list.cdk-drop-list-dragging[_ngcontent-%COMP%]   .custom-field-box[_ngcontent-%COMP%]:not(.cdk-drag-placeholder) {\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2N1c3RvbS1maWVsZHMuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsdUJBQUE7O0FBQ0E7RUFDSSxZQUFBO0VBQ0EsZUFBQTtFQUNBLFlBQUE7RUFDQSxxQkFBQTtFQUNBLG1CQUFBO0FBQ0o7O0FBRUE7RUFDSSxTQUFBO0FBQ0o7O0FBRUE7RUFDSSxnQkFBQTtFQUNBLHNCQUFBO0VBQ0Esa0JBQUE7QUFDSjs7QUFFQTtFQUNJLHNCQUFBO0VBQ0EsaUJBQUE7RUFDQSxpQkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxjQUFBO0FBQ0o7O0FBRUE7RUFDSSxrQkFBQTtFQUNBLDZCQUFBO0VBQ0EsMEJBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxtQkFBQTtFQUNBLDhCQUFBO0VBQ0Esc0JBQUE7RUFDQSxZQUFBO0VBQ0EsaUJBQUE7RUFDQSxlQUFBO0FBQ0o7O0FBRUE7RUFDSSxzQkFBQTtFQUNBLGtCQUFBO0VBQ0EscUhBQUE7QUFDSjs7QUFJQTtFQUNJLFVBQUE7QUFESjs7QUFJQTtFQUNJLHNEQUFBO0FBREo7O0FBSUE7RUFDSSxzREFBQTtBQURKOztBQUdBLDJCQUFBIiwiZmlsZSI6ImN1c3RvbS1maWVsZHMuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBEcmFnIGFuZCBkcm9wIGxpc3QgKi9cbi5saXN0LWNvbnRhaW5lciB7XG4gICAgd2lkdGg6IDQwMHB4O1xuICAgIG1heC13aWR0aDogMTAwJTtcbiAgICBtYXJnaW46IDI1cHg7XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgIHZlcnRpY2FsLWFsaWduOiB0b3A7XG59XG5cbi5saXN0LWNvbnRhaW5lciA+IGgye1xuICAgIG1hcmdpbjogMDtcbn1cblxuLmN1c3RvbS1maWVsZHMtY29udHJvbHtcbiAgICBtYXJnaW4tdG9wOiAyNXB4O1xuICAgIGJvcmRlcjogc29saWQgMXB4ICNjY2M7XG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xufVxuXG4uY3VzdG9tLWZpZWxkcy1saXN0IHtcbiAgICBib3JkZXI6IHNvbGlkIDFweCAjY2NjO1xuICAgIG1pbi1oZWlnaHQ6IDIwMHB4O1xuICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIGRpc3BsYXk6IGJsb2NrO1xufVxuXG4uY3VzdG9tLWZpZWxkLWJveCB7XG4gICAgcGFkZGluZzogMjBweCAxMHB4O1xuICAgIGJvcmRlci1ib3R0b206IHNvbGlkIDFweCAjY2NjO1xuICAgIGNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuODcpO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIGN1cnNvcjogbW92ZTtcbiAgICBiYWNrZ3JvdW5kOiB3aGl0ZTtcbiAgICBmb250LXNpemU6IDE0cHg7XG59XG5cbi5jZGstZHJhZy1wcmV2aWV3IHtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICBib3gtc2hhZG93OiAwIDVweCA1cHggLTNweCByZ2JhKDAsIDAsIDAsIDAuMiksXG4gICAgMCA4cHggMTBweCAxcHggcmdiYSgwLCAwLCAwLCAwLjE0KSxcbiAgICAwIDNweCAxNHB4IDJweCByZ2JhKDAsIDAsIDAsIDAuMTIpO1xufVxuXG4uY2RrLWRyYWctcGxhY2Vob2xkZXIge1xuICAgIG9wYWNpdHk6IDA7XG59XG5cbi5jZGstZHJhZy1hbmltYXRpbmcge1xuICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAyNTBtcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKTtcbn1cblxuLmN1c3RvbS1maWVsZHMtbGlzdC5jZGstZHJvcC1saXN0LWRyYWdnaW5nIC5jdXN0b20tZmllbGQtYm94Om5vdCguY2RrLWRyYWctcGxhY2Vob2xkZXIpIHtcbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMjUwbXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSk7XG59XG4vKiBFbmQgZHJhZyBhbmQgZHJvcCBsaXN0ICovIl19 */"] });


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
    canActivate(route) {
        if (route.data.privileges !== undefined) {
            let return_value = true;
            route.data.privileges.forEach((privilege) => {
                let hasPrivilege = this.privilegesService.hasPrivilege(privilege);
                if (!hasPrivilege) {
                    this.translate.get('ERROR.unauthorized').subscribe((translated) => {
                        this.notify.error(translated);
                        this.router.navigateByUrl('/home');
                    });
                    return_value = false;
                }
            });
            return return_value;
        }
        else {
            return false;
        }
    }
}
HasPrivilegeService.ɵfac = function HasPrivilegeService_Factory(t) { return new (t || HasPrivilegeService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_3__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_privileges_service__WEBPACK_IMPORTED_MODULE_4__["PrivilegesService"])); };
HasPrivilegeService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: HasPrivilegeService, factory: HasPrivilegeService.ɵfac, providedIn: 'root' });


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
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @biesbjerg/ngx-translate-extract-marker */ "4u49");
/* harmony import */ var _services_login_redirect_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/login-redirect.service */ "2VJY");
/* harmony import */ var _services_login_required_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../services/login-required.service */ "uepI");
/* harmony import */ var _login_login_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./login/login.component */ "09X2");
/* harmony import */ var _logout_logout_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./logout/logout.component */ "f9HG");
/* harmony import */ var _home_home_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./home/home.component */ "TIJI");
/* harmony import */ var _not_found_not_found_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./not-found/not-found.component */ "tLbZ");
/* harmony import */ var _profile_profile_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./profile/profile.component */ "aqBn");
/* harmony import */ var _splitter_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./splitter/viewer/viewer.component */ "2xKp");
/* harmony import */ var _splitter_list_list_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./splitter/list/list.component */ "Bu07");
/* harmony import */ var _verifier_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./verifier/viewer/viewer.component */ "H9a8");
/* harmony import */ var _verifier_list_list_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./verifier/list/list.component */ "gdoM");
/* harmony import */ var _upload_upload_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./upload/upload.component */ "hM/l");
/* harmony import */ var _accounts_suppliers_list_suppliers_list_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./accounts/suppliers/list/suppliers-list.component */ "wiki");
/* harmony import */ var _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../services/has-privilege.service */ "9Fms");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/core */ "fXoL");


















const routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: _home_home_component__WEBPACK_IMPORTED_MODULE_6__["HomeComponent"], data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__["marker"])('GLOBAL.home') }, canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"]] },
    { path: 'login', component: _login_login_component__WEBPACK_IMPORTED_MODULE_4__["LoginComponent"], data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__["marker"])('GLOBAL.login') }, canActivate: [_services_login_redirect_service__WEBPACK_IMPORTED_MODULE_2__["LoginRedirectService"]] },
    { path: 'logout', component: _logout_logout_component__WEBPACK_IMPORTED_MODULE_5__["LogoutComponent"], canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"]] },
    { path: 'profile/:id', component: _profile_profile_component__WEBPACK_IMPORTED_MODULE_8__["UserProfileComponent"], canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"]] },
    {
        path: 'splitter/viewer/:id', component: _splitter_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_9__["SplitterViewerComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__["marker"])('SPLITTER.viewer'), privileges: ['splitter'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_15__["HasPrivilegeService"]]
    },
    {
        path: 'splitter/list', component: _splitter_list_list_component__WEBPACK_IMPORTED_MODULE_10__["SplitterListComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__["marker"])('SPLITTER.list'), privileges: ['splitter'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_15__["HasPrivilegeService"]]
    },
    { path: 'splitter', redirectTo: 'splitter/list', pathMatch: 'full' },
    {
        path: 'verifier/viewer/:id', component: _verifier_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_11__["VerifierViewerComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__["marker"])('VERIFIER.viewer'), privileges: ['verifier'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_15__["HasPrivilegeService"]]
    },
    {
        path: 'verifier/list', component: _verifier_list_list_component__WEBPACK_IMPORTED_MODULE_12__["VerifierListComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__["marker"])('VERIFIER.list'), privileges: ['verifier'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_15__["HasPrivilegeService"]]
    },
    { path: 'verifier', redirectTo: 'verifier/list', pathMatch: 'full' },
    {
        path: 'upload', component: _upload_upload_component__WEBPACK_IMPORTED_MODULE_13__["UploadComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__["marker"])('GLOBAL.upload'), privileges: ['upload'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_15__["HasPrivilegeService"]]
    },
    { path: 'accounts/suppliers', redirectTo: 'accounts/suppliers/list', pathMatch: 'full' },
    {
        path: 'accounts/suppliers/list', component: _accounts_suppliers_list_suppliers_list_component__WEBPACK_IMPORTED_MODULE_14__["SuppliersListComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_1__["marker"])('ACCOUNTS.suppliers_list'), privileges: ['suppliers_list'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_15__["HasPrivilegeService"]]
    },
    { path: '404', component: _not_found_not_found_component__WEBPACK_IMPORTED_MODULE_7__["NotFoundComponent"] },
    { path: '**', redirectTo: '404' },
];
class AppRoutingModule {
}
AppRoutingModule.ɵfac = function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); };
AppRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_16__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
AppRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_16__["ɵɵdefineInjector"]({ imports: [[
            _angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"].forRoot(routes, { useHash: true })
        ], _angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_16__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] }); })();


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
/* harmony import */ var _app_material_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app-material.module */ "cCsE");
/* harmony import */ var _services_services_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/services.module */ "nG5W");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/cdk/drag-drop */ "5+WD");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/platform-browser/animations */ "R1ws");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _ngx_translate_http_loader__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @ngx-translate/http-loader */ "mqiu");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./app-routing.module */ "BsYY");
/* harmony import */ var _settings_settings_routing_module__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./settings/settings-routing.module */ "X5rm");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./app.component */ "pnQW");
/* harmony import */ var _verifier_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./verifier/viewer/viewer.component */ "H9a8");
/* harmony import */ var _verifier_list_list_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./verifier/list/list.component */ "gdoM");
/* harmony import */ var _splitter_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./splitter/viewer/viewer.component */ "2xKp");
/* harmony import */ var _splitter_list_list_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./splitter/list/list.component */ "Bu07");
/* harmony import */ var _login_login_component__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./login/login.component */ "09X2");
/* harmony import */ var _logout_logout_component__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./logout/logout.component */ "f9HG");
/* harmony import */ var _home_home_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./home/home.component */ "TIJI");
/* harmony import */ var _menu_menu_component__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./menu/menu.component */ "2jQ4");
/* harmony import */ var _not_found_not_found_component__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./not-found/not-found.component */ "tLbZ");
/* harmony import */ var _profile_profile_component__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./profile/profile.component */ "aqBn");
/* harmony import */ var _upload_upload_component__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./upload/upload.component */ "hM/l");
/* harmony import */ var ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ngx-file-drag-drop */ "Cqmy");
/* harmony import */ var _settings_general_users_list_users_list_component__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./settings/general/users/list/users-list.component */ "6I7K");
/* harmony import */ var _settings_settings_component__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./settings/settings.component */ "QrgV");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _custom_mat_paginator__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./custom-mat-paginator */ "X/RA");
/* harmony import */ var _services_last_url_service__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ../services/last-url.service */ "463q");
/* harmony import */ var _settings_general_about_us_about_us_component__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./settings/general/about-us/about-us.component */ "M+yw");
/* harmony import */ var _settings_general_version_update_version_update_component__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./settings/general/version-update/version-update.component */ "3D8z");
/* harmony import */ var _settings_general_users_create_create_user_component__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./settings/general/users/create/create-user.component */ "UYg5");
/* harmony import */ var _settings_general_users_update_update_user_component__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./settings/general/users/update/update-user.component */ "xVtZ");
/* harmony import */ var _settings_general_roles_list_roles_list_component__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./settings/general/roles/list/roles-list.component */ "/zY6");
/* harmony import */ var _settings_general_roles_update_update_role_component__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./settings/general/roles/update/update-role.component */ "VLDq");
/* harmony import */ var _settings_general_roles_create_create_role_component__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./settings/general/roles/create/create-role.component */ "NQut");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./loader.component */ "sUWp");
/* harmony import */ var _settings_general_custom_fields_custom_fields_component__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./settings/general/custom-fields/custom-fields.component */ "878q");
/* harmony import */ var _settings_verifier_form_list_form_list_component__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./settings/verifier/form/list/form-list.component */ "c8hn");
/* harmony import */ var _settings_verifier_form_builder_form_builder_component__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./settings/verifier/form/builder/form-builder.component */ "VzAV");
/* harmony import */ var ng_sortgrid__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ng-sortgrid */ "0dH1");
/* harmony import */ var _accounts_suppliers_list_suppliers_list_component__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./accounts/suppliers/list/suppliers-list.component */ "wiki");
/* harmony import */ var _accounts_suppliers_update_update_supplier_component__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./accounts/suppliers/update/update-supplier.component */ "QO1C");
/* harmony import */ var _accounts_suppliers_create_create_supplier_component__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./accounts/suppliers/create/create-supplier.component */ "faJs");
/* harmony import */ var _accounts_customers_list_customer_list_component__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./accounts/customers/list/customer-list.component */ "QTKp");
/* harmony import */ var _accounts_customers_update_update_customer_component__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./accounts/customers/update/update-customer.component */ "Oxnr");
/* harmony import */ var _accounts_customers_create_create_customer_component__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./accounts/customers/create/create-customer.component */ "eKNj");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! @angular/core */ "fXoL");




















































function createTranslateLoader(http) {
    return new _ngx_translate_http_loader__WEBPACK_IMPORTED_MODULE_8__["TranslateHttpLoader"](http, 'assets/i18n/frontend/', '.json');
}
class AppModule {
    constructor(routerExtService) {
        this.routerExtService = routerExtService;
    }
}
AppModule.ɵfac = function AppModule_Factory(t) { return new (t || AppModule)(_angular_core__WEBPACK_IMPORTED_MODULE_48__["ɵɵinject"](_services_last_url_service__WEBPACK_IMPORTED_MODULE_29__["LastUrlService"])); };
AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_48__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_12__["AppComponent"]] });
AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_48__["ɵɵdefineInjector"]({ providers: [
        _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["Title"],
        _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateService"],
        _services_last_url_service__WEBPACK_IMPORTED_MODULE_29__["LastUrlService"],
        { provide: _angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__["MAT_FORM_FIELD_DEFAULT_OPTIONS"], useValue: { appearance: 'outline' } },
        {
            provide: _angular_material_paginator__WEBPACK_IMPORTED_MODULE_27__["MatPaginatorIntl"],
            useClass: _custom_mat_paginator__WEBPACK_IMPORTED_MODULE_28__["CustomMatPaginatorIntl"]
        }
    ], imports: [[
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
            _settings_settings_routing_module__WEBPACK_IMPORTED_MODULE_11__["SettingsRoutingModule"],
            _app_routing_module__WEBPACK_IMPORTED_MODULE_10__["AppRoutingModule"],
            _app_material_module__WEBPACK_IMPORTED_MODULE_1__["AppMaterialModule"],
            _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
            _angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClientModule"],
            _services_services_module__WEBPACK_IMPORTED_MODULE_2__["ServicesModule"],
            ng_sortgrid__WEBPACK_IMPORTED_MODULE_41__["NgsgModule"],
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
            _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_4__["DragDropModule"],
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_48__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_12__["AppComponent"],
        _verifier_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_13__["VerifierViewerComponent"],
        _verifier_list_list_component__WEBPACK_IMPORTED_MODULE_14__["VerifierListComponent"],
        _splitter_list_list_component__WEBPACK_IMPORTED_MODULE_16__["SplitterListComponent"],
        _splitter_viewer_viewer_component__WEBPACK_IMPORTED_MODULE_15__["SplitterViewerComponent"],
        _login_login_component__WEBPACK_IMPORTED_MODULE_17__["LoginComponent"],
        _logout_logout_component__WEBPACK_IMPORTED_MODULE_18__["LogoutComponent"],
        _home_home_component__WEBPACK_IMPORTED_MODULE_19__["HomeComponent"],
        _menu_menu_component__WEBPACK_IMPORTED_MODULE_20__["MenuComponent"],
        _not_found_not_found_component__WEBPACK_IMPORTED_MODULE_21__["NotFoundComponent"],
        _profile_profile_component__WEBPACK_IMPORTED_MODULE_22__["UserProfileComponent"],
        _upload_upload_component__WEBPACK_IMPORTED_MODULE_23__["UploadComponent"],
        _settings_general_users_list_users_list_component__WEBPACK_IMPORTED_MODULE_25__["UsersListComponent"],
        _settings_settings_component__WEBPACK_IMPORTED_MODULE_26__["SettingsComponent"],
        _settings_general_about_us_about_us_component__WEBPACK_IMPORTED_MODULE_30__["AboutUsComponent"],
        _settings_general_version_update_version_update_component__WEBPACK_IMPORTED_MODULE_31__["VersionUpdateComponent"],
        _settings_general_roles_list_roles_list_component__WEBPACK_IMPORTED_MODULE_34__["RolesListComponent"],
        _settings_general_users_create_create_user_component__WEBPACK_IMPORTED_MODULE_32__["CreateUserComponent"],
        _settings_general_users_update_update_user_component__WEBPACK_IMPORTED_MODULE_33__["UpdateUserComponent"],
        _settings_general_roles_update_update_role_component__WEBPACK_IMPORTED_MODULE_35__["UpdateRoleComponent"],
        _settings_general_roles_create_create_role_component__WEBPACK_IMPORTED_MODULE_36__["CreateRoleComponent"],
        _loader_component__WEBPACK_IMPORTED_MODULE_37__["LoaderComponent"],
        _settings_general_custom_fields_custom_fields_component__WEBPACK_IMPORTED_MODULE_38__["CustomFieldsComponent"],
        _settings_verifier_form_builder_form_builder_component__WEBPACK_IMPORTED_MODULE_40__["FormBuilderComponent"],
        _settings_verifier_form_list_form_list_component__WEBPACK_IMPORTED_MODULE_39__["FormListComponent"],
        _settings_verifier_form_builder_form_builder_component__WEBPACK_IMPORTED_MODULE_40__["FormBuilderComponent"],
        _accounts_suppliers_list_suppliers_list_component__WEBPACK_IMPORTED_MODULE_42__["SuppliersListComponent"],
        _accounts_suppliers_update_update_supplier_component__WEBPACK_IMPORTED_MODULE_43__["UpdateSupplierComponent"],
        _accounts_suppliers_create_create_supplier_component__WEBPACK_IMPORTED_MODULE_44__["CreateSupplierComponent"],
        _accounts_customers_list_customer_list_component__WEBPACK_IMPORTED_MODULE_45__["CustomerListComponent"],
        _accounts_customers_create_create_customer_component__WEBPACK_IMPORTED_MODULE_47__["CreateCustomerComponent"],
        _accounts_customers_update_update_customer_component__WEBPACK_IMPORTED_MODULE_46__["UpdateCustomerComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
        _settings_settings_routing_module__WEBPACK_IMPORTED_MODULE_11__["SettingsRoutingModule"],
        _app_routing_module__WEBPACK_IMPORTED_MODULE_10__["AppRoutingModule"],
        _app_material_module__WEBPACK_IMPORTED_MODULE_1__["AppMaterialModule"],
        _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
        _angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClientModule"],
        _services_services_module__WEBPACK_IMPORTED_MODULE_2__["ServicesModule"],
        ng_sortgrid__WEBPACK_IMPORTED_MODULE_41__["NgsgModule"], _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateModule"], _angular_forms__WEBPACK_IMPORTED_MODULE_9__["ReactiveFormsModule"],
        _angular_forms__WEBPACK_IMPORTED_MODULE_9__["FormsModule"],
        ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_24__["NgxFileDragDropModule"],
        _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_4__["DragDropModule"]] }); })();


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
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/button */ "bTqV");




class ConfirmDialogComponent {
    constructor(data) {
        this.data = data;
    }
    ngOnInit() { }
}
ConfirmDialogComponent.ɵfac = function ConfirmDialogComponent_Factory(t) { return new (t || ConfirmDialogComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__["MAT_DIALOG_DATA"])); };
ConfirmDialogComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: ConfirmDialogComponent, selectors: [["app-confirm-dialog"]], decls: 10, vars: 6, consts: [["mat-dialog-title", ""], [1, "border-green-400", "-mt-4", "mb-4"], [1, "mat-typography"], ["align", "end"], ["mat-button", "", "mat-dialog-close", ""], ["mat-button", "", "cdkFocusInitial", "", 3, "mat-dialog-close", "color"]], template: function ConfirmDialogComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "h2", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](2, "hr", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "mat-dialog-content", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "mat-dialog-actions", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "button", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "button", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx.data.confirmTitle);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", ctx.data.confirmText, "\n");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx.data.cancelButton);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate"]("color", ctx.data.confirmButtonColor);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("mat-dialog-close", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx.data.confirmButton);
    } }, directives: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__["MatDialogTitle"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__["MatDialogContent"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__["MatDialogActions"], _angular_material_button__WEBPACK_IMPORTED_MODULE_2__["MatButton"], _angular_material_dialog__WEBPACK_IMPORTED_MODULE_0__["MatDialogClose"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjb25maXJtLWRpYWxvZy5jb21wb25lbnQuc2NzcyJ9 */"] });


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
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../services/auth.service */ "PS2H");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/input */ "qFsG");










class VerifierViewerComponent {
    constructor(http, route, authService, notify) {
        this.http = http;
        this.route = route;
        this.authService = authService;
        this.notify = notify;
        this.loading = true;
        this.isOCRRunning = false;
        this.lastLabel = '';
        this.lastColor = '';
    }
    ngOnInit() {
        let invoiceId = this.route.snapshot.params['id'];
        this.imageInvoice = $('#my-image');
        // this.ocrOnFly(false, '')
    }
    ocr(event, enable, color = 'red') {
        let _this = this;
        let inputId = event.target.id;
        this.lastLabel = event.target.labels[0].textContent;
        this.lastColor = color;
        let imageContainer = $('.image-container');
        imageContainer.addClass('pointer-events-none');
        imageContainer.addClass('cursor-auto');
        if (enable) {
            imageContainer.removeClass('pointer-events-none');
            imageContainer.removeClass('cursor-auto');
            this.imageInvoice.selectAreas({
                mineSize: [20, 20],
                maxSize: [this.imageInvoice.width(), this.imageInvoice.height() / 8],
                onChanged: function (img, cpt, selection) {
                    if (selection['width'] !== 0 && selection['height'] !== 0) {
                        // Write the label of the input above the selection rectangle
                        if ($('#select-area-label_' + cpt).length == 0) {
                            $('#select-areas-label-container_' + cpt).append('<div id="select-area-label_' + cpt + '">' + _this.lastLabel + '</div>');
                            $('#select-areas-background-area_' + cpt).css('background-color', _this.lastColor);
                        }
                        // End write
                        // Test to avoid multi selection for same label. If same label exists, remove the selected areas and replace it by the new one
                        let label = $('div[id*=select-area-label_]:contains(' + _this.lastLabel + ')');
                        let labelCount = label.length;
                        if (labelCount > 1) {
                            let cptToDelete = label[labelCount - 1].id.split('_')[1];
                            $('#select-areas-label-container_' + cptToDelete).remove();
                            $('#select-areas-background-area_' + cptToDelete).remove();
                            $('#select-areas-outline_' + cptToDelete).remove();
                            $('#select-areas-delete_' + cptToDelete).remove();
                            $('.select-areas-resize-handler_' + cptToDelete).remove();
                        }
                        if (!_this.isOCRRunning) {
                            _this.isOCRRunning = true;
                            _this.http.post(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/verifier/ocrOnFly', {
                                selection: selection[cpt],
                                fileName: $('#my-image')[0].src.replace(/^.*[\\\/]/, ''),
                                thumbSize: { width: img.currentTarget.width, height: img.currentTarget.height }
                            }, { headers: _this.authService.headers })
                                .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
                                console.log(data);
                                _this.isOCRRunning = false;
                            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                                console.debug(err);
                                _this.notify.handleErrors(err);
                                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
                            })).subscribe();
                        }
                    }
                }
            });
        }
    }
    ocrOnFly(isRemoved, input, removeWhiteSpace = false, needToBeNumber = false, needToBeDate = false) {
        let _this = this;
        this.imageInvoice.imgAreaSelect({
            fadeSpeed: 400,
            autoHide: false,
            handles: true,
            remove: isRemoved,
            maxWidth: this.imageInvoice.width(),
            maxHeight: this.imageInvoice.height() / 8,
            onSelectEnd: function (img, selection) {
                console.log(selection);
                if (selection['width'] !== 0 && selection['height'] !== 0) {
                    if (!_this.isOCRRunning) {
                        _this.isOCRRunning = true;
                        _this.http.post(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/verifier/ocrOnFly', { selection: selection, fileName: $('#my-image')[0].src.replace(/^.*[\\\/]/, ''), thumbSize: { width: img.width, height: img.height } }, { headers: _this.authService.headers })
                            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
                            console.log(data);
                        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                            console.debug(err);
                            _this.notify.handleErrors(err);
                            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
                        })).subscribe();
                    }
                }
            }
        });
        console.log(this.isOCRRunning);
    }
}
VerifierViewerComponent.ɵfac = function VerifierViewerComponent_Factory(t) { return new (t || VerifierViewerComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_6__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_7__["NotificationService"])); };
VerifierViewerComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: VerifierViewerComponent, selectors: [["app-viewer"]], decls: 17, vars: 0, consts: [[1, "grid", "grid-cols-2", "overflow-auto", 2, "height", "calc(100vh + -3rem) !important"], [1, "image-container"], ["id", "rectangle", 1, "rectangle-not-active"], ["id", "my-image", "alt", "File", "src", "assets/imgs/thumb.jpg", 1, "file"], ["matInput", "", "type", "text", "id", "test", 3, "focusin", "focusout"], ["matInput", "", "type", "text", "id", "test1", 3, "focusin", "focusout"], ["matInput", "", "type", "text", "id", "test2", 3, "focusin", "focusout"]], template: function VerifierViewerComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](3, "img", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "mat-form-field");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](7, "Num\u00E9ro de facture");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "input", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("focusin", function VerifierViewerComponent_Template_input_focusin_8_listener($event) { return ctx.ocr($event, true, "red"); })("focusout", function VerifierViewerComponent_Template_input_focusout_8_listener($event) { return ctx.ocr($event, false); });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "mat-form-field");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](10, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](11, "Date de facture");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "input", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("focusin", function VerifierViewerComponent_Template_input_focusin_12_listener($event) { return ctx.ocr($event, true, "blue"); })("focusout", function VerifierViewerComponent_Template_input_focusout_12_listener($event) { return ctx.ocr($event, false); });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](13, "mat-form-field");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](15, "Num\u00E9ro de commande");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](16, "input", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("focusin", function VerifierViewerComponent_Template_input_focusin_16_listener($event) { return ctx.ocr($event, true, "yellow"); })("focusout", function VerifierViewerComponent_Template_input_focusout_16_listener($event) { return ctx.ocr($event, false); });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    } }, directives: [_angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_9__["MatInput"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ2aWV3ZXIuY29tcG9uZW50LnNjc3MifQ== */"] });


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
/* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/material/snack-bar */ "dNgK");
/* harmony import */ var _app_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../app/env */ "7esm");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "fXoL");
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
CustomSnackbarComponent.ɵfac = function CustomSnackbarComponent_Factory(t) { return new (t || CustomSnackbarComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_0__["MAT_SNACK_BAR_DATA"])); };
CustomSnackbarComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({ type: CustomSnackbarComponent, selectors: [["custom-snackbar"]], decls: 7, vars: 5, consts: [[1, "notif-container", 3, "click"], [1, "notif-container-icon"], [1, "notif-container-content"], [1, "notif-container-content-msg"], [3, "innerHTML"]], template: function CustomSnackbarComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function CustomSnackbarComponent_Template_div_click_0_listener() { return ctx.dismiss(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](2, "i");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](4, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](5, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](6, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassMapInterpolate1"]("fa fa-", ctx.data.icon, " fa-2x");
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("innerHTML", ctx.data.url, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsanitizeHtml"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("innerHTML", ctx.data.message, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsanitizeHtml"]);
    } }, styles: [".notif-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding-top: 25px;\n  padding-bottom: 25px;\n  cursor: pointer;\n}\n\n.notif-container-icon[_ngcontent-%COMP%] {\n  display: flex;\n  width: 50px;\n  justify-content: center;\n}\n\n.notif-container-content[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  justify-content: center;\n}\n\n.notif-container-content-msg[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n\n .mat-snack-bar-container {\n  background: white;\n}\n\n .mat-snack-bar-container.error-snackbar {\n  color: red;\n  border: solid 1px red;\n}\n\n .mat-snack-bar-container.success-snackbar {\n  color: green;\n  border: solid 1px green;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL25vdGlmaWNhdGlvbi5zZXJ2aWNlLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxpQkFBQTtFQUNBLG9CQUFBO0VBQ0EsZUFBQTtBQUNGOztBQUNFO0VBQ0UsYUFBQTtFQUNBLFdBQUE7RUFDQSx1QkFBQTtBQUNKOztBQUVFO0VBQ0UsYUFBQTtFQUNBLE9BQUE7RUFDQSx1QkFBQTtBQUFKOztBQUVJO0VBQ0UsYUFBQTtFQUNBLHNCQUFBO0FBQU47O0FBS0E7RUFDRSxpQkFBQTtBQUZGOztBQUlFO0VBQ0UsVUFBQTtFQUNBLHFCQUFBO0FBRko7O0FBS0U7RUFDRSxZQUFBO0VBQ0EsdUJBQUE7QUFISiIsImZpbGUiOiJub3RpZmljYXRpb24uc2VydmljZS5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLm5vdGlmLWNvbnRhaW5lciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIHBhZGRpbmctdG9wOiAyNXB4O1xuICBwYWRkaW5nLWJvdHRvbTogMjVweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuXG4gICYtaWNvbiB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICB3aWR0aDo1MHB4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICB9XG5cbiAgJi1jb250ZW50IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXg6IDE7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cbiAgICAmLW1zZyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB9XG4gIH1cbn1cblxuOjpuZy1kZWVwLm1hdC1zbmFjay1iYXItY29udGFpbmVyIHtcbiAgYmFja2dyb3VuZDogd2hpdGU7XG5cbiAgJi5lcnJvci1zbmFja2JhcntcbiAgICBjb2xvcjogcmVkO1xuICAgIGJvcmRlcjogc29saWQgMXB4IHJlZDtcbiAgfVxuXG4gICYuc3VjY2Vzcy1zbmFja2JhcntcbiAgICBjb2xvcjogZ3JlZW47XG4gICAgYm9yZGVyOiBzb2xpZCAxcHggZ3JlZW47XG4gIH1cbn0iXX0= */"] });
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
    handleErrors(err, route = '') {
        if (err.status === 0 && err.statusText === 'Unknown Error') {
            let message = this.translate.instant('ERROR.connection_failed') + ' : ' + this.translate.instant('ERROR.is_server_up', { server: _app_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] });
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
        if (route) {
            this.router.navigate([route]).then();
        }
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
NotificationService.ɵfac = function NotificationService_Factory(t) { return new (t || NotificationService)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_0__["MatSnackBar"])); };
NotificationService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({ token: NotificationService, factory: NotificationService.ɵfac });


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


/***/ }),

/***/ "M+yw":
/*!**************************************************************************!*\
  !*** ./src/frontend/app/settings/general/about-us/about-us.component.ts ***!
  \**************************************************************************/
/*! exports provided: AboutUsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AboutUsComponent", function() { return AboutUsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../loader.component */ "sUWp");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");












function AboutUsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r15 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "button", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AboutUsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r15); const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](4).$implicit; const parent_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r13.serviceSettings.changeSetting(setting_r5["id"], parent_r3["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "p", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("text-green-400", ctx_r12.router.url.includes(action_r11["route"]))("disable_link", action_r11["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("routerLink", action_r11["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r11["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](5, 9, action_r11["label"]), " ");
} }
function AboutUsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, AboutUsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r11 = ctx.$implicit;
    const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](3).$implicit;
    const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("border-gray-600", !action_r11["showOnlyIfActive"])("border-t", !action_r11["showOnlyIfActive"])("w-full", !action_r11["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", (ctx_r10.privilegesService.hasPrivilege(action_r11["privilege"]) || setting_r5["privilege"] == "*") && (!action_r11["showOnlyIfActive"] || action_r11["showOnlyIfActive"] && ctx_r10.router.url.includes(action_r11["route"])));
} }
function AboutUsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r21 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-expansion-panel", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-expansion-panel-header", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-panel-title", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "button", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AboutUsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r21); const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2).$implicit; const parent_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r19.serviceSettings.changeSetting(setting_r5["id"], parent_r3["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "p", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](8, AboutUsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2).$implicit;
    const parent_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("expanded", ctx_r9.router.url.includes(setting_r5["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r5["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("text-green-400", ctx_r9.router.url == setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("text-green-400", ctx_r9.router.url == setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("routerLink", setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("font-medium", ctx_r9.router.url == setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](7, 13, setting_r5["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r9.serviceSettings.getSettingsAction(parent_r3["id"], setting_r5["id"]));
} }
function AboutUsComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, AboutUsComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r6.privilegesService.hasPrivilege(setting_r5["privilege"]) || setting_r5["privilege"] == "*");
} }
function AboutUsComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r29 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AboutUsComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r29); const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2).$implicit; const parent_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit; const ctx_r27 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r27.serviceSettings.changeSetting(setting_r5["id"], parent_r3["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "p", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2).$implicit;
    const ctx_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("text-green-400", ctx_r26.router.url == setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpropertyInterpolate"]("routerLink", setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r5["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("font-medium", ctx_r26.router.url == setting_r5["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](4, 9, setting_r5["label"]), " ");
} }
function AboutUsComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](0, AboutUsComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 37);
} if (rf & 2) {
    const setting_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r8.privilegesService.hasPrivilege(setting_r5["privilege"]) || setting_r5["privilege"] == "*");
} }
function AboutUsComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, AboutUsComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, AboutUsComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 26, _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r5 = ctx.$implicit;
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](3);
    const parent_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("border-b", ctx_r4.privilegesService.hasPrivilege(setting_r5["privilege"]) || setting_r5["privilege"] == "*")("border-gray-400", ctx_r4.privilegesService.hasPrivilege(setting_r5["privilege"]) || setting_r5["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r4.serviceSettings.getSettingsAction(parent_r3["id"], setting_r5["id"]))("ngIfElse", _r7);
} }
function AboutUsComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-expansion-panel", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-expansion-panel-header", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](6, AboutUsComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r3 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r3["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](4, 3, parent_r3["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r3["id"]]);
} }
function AboutUsComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
class AboutUsComponent {
    constructor(router, serviceSettings, privilegesService) {
        this.router = router;
        this.serviceSettings = serviceSettings;
        this.privilegesService = privilegesService;
        this.loading = true;
    }
    ngOnInit() {
        this.loading = false;
    }
}
AboutUsComponent.ɵfac = function AboutUsComponent_Factory(t) { return new (t || AboutUsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_2__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_3__["PrivilegesService"])); };
AboutUsComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AboutUsComponent, selectors: [["app-about-us"]], decls: 37, vars: 14, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], [1, "settings_title", "text-center"], [1, "edissyum", "text-center", "mt-10", "text-2xl", 2, "line-height", "35px !important"], [1, "logo", "flex", "justify-center", "items-center", "gap-48", "mt-12"], ["id", "verifier"], ["src", "assets/imgs/logo_verifier.png", "alt", "Open-Capture Verifier"], [1, "m-auto", "mt-10", "w-1/2", "border-green-400"], [1, "mt-6"], ["id", "splitter"], ["src", "assets/imgs/logo_splitter.png", "alt", "Open-Capture Splitter"], [3, "expanded"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"]], template: function AboutUsComponent_Template(rf, ctx) { if (rf & 1) {
        const _r34 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](8, AboutUsComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](10, AboutUsComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AboutUsComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r34); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](14, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](15, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](17, "hr", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](18, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](19, " Soci\u00E9t\u00E9 Edissyum ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](20, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](21, " 129 Boulevard Louis Giraud ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](22, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](23, " 84200 Carpentras ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](24, "div", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](25, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](26, "img", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](27, "hr", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](28, "h3", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](29);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](30, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](31, "div", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](32, "img", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](33, "hr", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](34, "h3", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](35);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](36, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](5, 8, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx.serviceSettings.getTitle());
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"]("", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](30, 10, "ABOUT-US.lead_dev"), " : CHEVAL Nathan");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"]("", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](36, 12, "ABOUT-US.lead_dev"), " : BRICH Oussama");
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_4__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_4__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_5__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_6__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_4__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_7__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_8__["MatButton"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_9__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_9__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_9__["MatExpansionPanelTitle"], _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_10__["LoaderComponent"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_11__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhYm91dC11cy5jb21wb25lbnQuc2NzcyJ9 */"] });


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


/***/ }),

/***/ "NQut":
/*!*********************************************************************************!*\
  !*** ./src/frontend/app/settings/general/roles/create/create-role.component.ts ***!
  \*********************************************************************************/
/*! exports provided: CreateRoleComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CreateRoleComponent", function() { return CreateRoleComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/tabs */ "wZkO");
/* harmony import */ var _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/slide-toggle */ "1jcm");

























function CreateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r17 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "button", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function CreateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r17); const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](4).$implicit; const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r15.serviceSettings.changeSetting(setting_r7["id"], parent_r5["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "p", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r14.router.url.includes(action_r13["route"]))("disable_link", action_r13["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", action_r13["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r13["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 9, action_r13["label"]), " ");
} }
function CreateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, CreateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r13 = ctx.$implicit;
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3).$implicit;
    const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("border-gray-600", !action_r13["showOnlyIfActive"])("border-t", !action_r13["showOnlyIfActive"])("w-full", !action_r13["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", (ctx_r12.privilegesService.hasPrivilege(action_r13["privilege"]) || setting_r7["privilege"] == "*") && (!action_r13["showOnlyIfActive"] || action_r13["showOnlyIfActive"] && ctx_r12.router.url.includes(action_r13["route"])));
} }
function CreateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r23 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-expansion-panel", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-expansion-panel-header", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "mat-panel-title", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "button", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function CreateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r23); const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit; const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r21.serviceSettings.changeSetting(setting_r7["id"], parent_r5["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "p", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](8, CreateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("expanded", ctx_r11.router.url.includes(setting_r7["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r7["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r11.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r11.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("font-medium", ctx_r11.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](7, 13, setting_r7["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r11.serviceSettings.getSettingsAction(parent_r5["id"], setting_r7["id"]));
} }
function CreateRoleComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, CreateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r8.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*");
} }
function CreateRoleComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r31 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "button", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function CreateRoleComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r31); const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit; const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r29 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r29.serviceSettings.changeSetting(setting_r7["id"], parent_r5["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "p", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r28.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r7["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("font-medium", ctx_r28.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 9, setting_r7["label"]), " ");
} }
function CreateRoleComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](0, CreateRoleComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 38);
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r10.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*");
} }
function CreateRoleComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, CreateRoleComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, CreateRoleComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 27, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = ctx.$implicit;
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵreference"](3);
    const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("border-b", ctx_r6.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*")("border-gray-400", ctx_r6.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r6.serviceSettings.getSettingsAction(parent_r5["id"], setting_r7["id"]))("ngIfElse", _r9);
} }
function CreateRoleComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-expansion-panel", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-expansion-panel-header", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, CreateRoleComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r5 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r5["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 3, parent_r5["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r5["id"]]);
} }
function CreateRoleComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} }
function CreateRoleComponent_ng_container_20_mat_form_field_1_mat_error_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r38.getErrorMessage(field_r36.id));
} }
function CreateRoleComponent_ng_container_20_mat_form_field_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-form-field");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "input", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, CreateRoleComponent_ng_container_20_mat_form_field_1_mat_error_6_Template, 2, 1, "mat-error", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](3, 7, field_r36.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 9, field_r36.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", field_r36.control.value)("formControl", field_r36.control)("type", field_r36.type)("required", field_r36.required);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r36.control.invalid);
} }
function CreateRoleComponent_ng_container_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, CreateRoleComponent_ng_container_20_mat_form_field_1_Template, 7, 11, "mat-form-field", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const field_r36 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r36.type == "text");
} }
function CreateRoleComponent_mat_tab_group_26_mat_tab_1_mat_slide_toggle_2_Template(rf, ctx) { if (rf & 1) {
    const _r46 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-slide-toggle", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("change", function CreateRoleComponent_mat_tab_group_26_mat_tab_1_mat_slide_toggle_2_Template_mat_slide_toggle_change_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r46); const ctx_r45 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3); return ctx_r45.changePrivilege($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const privilege_r44 = ctx.$implicit;
    const ctx_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("name", privilege_r44)("checked", ctx_r43.hasPrivilege(privilege_r44));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 3, "PRIVILEGES." + privilege_r44), " ");
} }
function CreateRoleComponent_mat_tab_group_26_mat_tab_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-tab", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "div", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, CreateRoleComponent_mat_tab_group_26_mat_tab_1_mat_slide_toggle_2_Template, 3, 5, "mat-slide-toggle", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r42 = ctx.$implicit;
    const ctx_r41 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("label", ctx_r41.translate.instant("PRIVILEGES." + parent_r42));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r41.getChildsByParent(parent_r42));
} }
function CreateRoleComponent_mat_tab_group_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-tab-group", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, CreateRoleComponent_mat_tab_group_26_mat_tab_1_Template, 3, 2, "mat-tab", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r4.privileges["parent"]);
} }
class CreateRoleComponent {
    constructor(http, router, route, formBuilder, authService, userService, translate, notify, serviceSettings, privilegesService) {
        this.http = http;
        this.router = router;
        this.route = route;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.userService = userService;
        this.translate = translate;
        this.notify = notify;
        this.serviceSettings = serviceSettings;
        this.privilegesService = privilegesService;
        this.loading = true;
        this.rolePrivileges = [];
        this.roleForm = [
            {
                id: 'label',
                label: this.translate.instant('HEADER.label'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true,
            },
            {
                id: 'label_short',
                label: this.translate.instant('HEADER.label_short'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true,
            }
        ];
    }
    ngOnInit() {
        this.serviceSettings.init();
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/privileges/list', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            this.privileges = data;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err, '/settings/general/roles');
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
    }
    isValidForm() {
        let state = true;
        this.roleForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }
    onSubmit() {
        if (this.isValidForm()) {
            const role = {};
            this.roleForm.forEach(element => {
                role[element.id] = element.control.value;
            });
            let role_privileges = [];
            this.privileges['privileges'].forEach((element) => {
                this.rolePrivileges.forEach((element2) => {
                    if (element['label'] == element2) {
                        role_privileges.push(element['id']);
                    }
                });
            });
            this.http.post(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/create', { 'args': role }, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
                let newRoleId = data.id;
                this.http.put(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/updatePrivilege/' + newRoleId, { 'privileges': role_privileges }, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])(() => {
                    this.notify.success(this.translate.instant('ROLE.created'));
                    this.router.navigate(['/settings/general/roles/']);
                }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
                    console.debug(err);
                    // this.notify.handleErrors(err, '/settings/general/roles/');
                    return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
                })).subscribe();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/roles/');
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            })).subscribe();
        }
    }
    getErrorMessage(field) {
        let error = undefined;
        this.roleForm.forEach(element => {
            if (element.id == field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }
    hasPrivilege(privilege_id) {
        let found = false;
        if (this.rolePrivileges) {
            this.rolePrivileges.forEach((element) => {
                if (privilege_id == element) {
                    found = true;
                }
            });
        }
        return found;
    }
    getChildsByParent(parent) {
        let data = [];
        this.privileges['privileges'].forEach((element) => {
            if (parent == element['parent']) {
                data.push(element['label']);
            }
        });
        return data;
    }
    changePrivilege(event) {
        let privilege = event.source.name;
        let checked = event.checked;
        if (!checked) {
            this.rolePrivileges.forEach((element) => {
                if (privilege == element) {
                    let index = this.rolePrivileges.indexOf(privilege, 0);
                    this.rolePrivileges.splice(index, 1);
                }
            });
        }
        else {
            this.rolePrivileges.push(privilege);
        }
    }
}
CreateRoleComponent.ɵfac = function CreateRoleComponent_Factory(t) { return new (t || CreateRoleComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_7__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_8__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_11__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_12__["PrivilegesService"])); };
CreateRoleComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({ type: CreateRoleComponent, selectors: [["app-create"]], decls: 31, vars: 16, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], [1, "settings_title", "text-center"], [1, "flex", "justify-center", "items-center"], [1, "grid", "grid-cols-2", "gap-6", "w-full", "m-10", "text-center", 3, "ngSubmit"], [4, "ngFor", "ngForOf"], [1, "w-1/2", "m-auto", "border-green-400"], [1, "text-center", "mt-10", "mb-10"], [1, "flex", "justify-center", "items-center", "ml-10", "mr-5"], ["dynamicHeight", "", 4, "ngIf"], [1, "flex", "justify-center", "items-center", "mt-10"], ["mat-button", "", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300", 3, "click"], [3, "expanded"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"], ["matInput", "", 3, "value", "formControl", "type", "placeholder", "required"], ["dynamicHeight", ""], [3, "label", 4, "ngFor", "ngForOf"], [3, "label"], [1, "grid", "grid-cols-4", "gap-x-60", "gap-y-10", "mt-10"], [3, "name", "checked", "change", 4, "ngFor", "ngForOf"], [3, "name", "checked", "change"]], template: function CreateRoleComponent_Template(rf, ctx) { if (rf & 1) {
        const _r47 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](8, CreateRoleComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](10, CreateRoleComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function CreateRoleComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r47); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](14, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](15, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](17, "hr", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](18, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "form", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngSubmit", function CreateRoleComponent_Template_form_ngSubmit_19_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](20, CreateRoleComponent_ng_container_20_Template, 2, 1, "ng-container", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](21, "mat-divider", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](22, "h4", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](23);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](24, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](25, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](26, CreateRoleComponent_mat_tab_group_26_Template, 2, 1, "mat-tab-group", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](27, "div", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](28, "button", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function CreateRoleComponent_Template_button_click_28_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](29);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](30, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 10, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx.serviceSettings.getTitle());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.roleForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](24, 12, "PRIVILEGES.list"));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.privileges);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](30, 14, "ROLE.create"), " ");
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_15__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_17__["MatButton"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_ba"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgForm"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanelTitle"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_19__["LoaderComponent"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_21__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlDirective"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["RequiredValidator"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatError"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_22__["MatTabGroup"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_22__["MatTab"], _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_23__["MatSlideToggle"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjcmVhdGUtcm9sZS5jb21wb25lbnQuc2NzcyJ9 */"] });


/***/ }),

/***/ "Oxnr":
/*!*********************************************************************************!*\
  !*** ./src/frontend/app/accounts/customers/update/update-customer.component.ts ***!
  \*********************************************************************************/
/*! exports provided: UpdateCustomerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UpdateCustomerComponent", function() { return UpdateCustomerComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");

class UpdateCustomerComponent {
    constructor() { }
    ngOnInit() {
    }
}
UpdateCustomerComponent.ɵfac = function UpdateCustomerComponent_Factory(t) { return new (t || UpdateCustomerComponent)(); };
UpdateCustomerComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: UpdateCustomerComponent, selectors: [["app-update"]], decls: 2, vars: 0, template: function UpdateCustomerComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "update works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ1cGRhdGUtY3VzdG9tZXIuY29tcG9uZW50LnNjc3MifQ== */"] });


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
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _user_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./user.service */ "N74B");
/* harmony import */ var _local_storage_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./local-storage.service */ "/azQ");






class AuthService {
    constructor(router, http, userService, localStorage) {
        this.router = router;
        this.http = http;
        this.userService = userService;
        this.localStorage = localStorage;
        this.headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpHeaders"]().set('Authorization', 'Bearer ' + this.getToken());
    }
    generateHeaders() {
        this.headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpHeaders"]().set('Authorization', 'Bearer ' + this.getToken());
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
AuthService.ɵfac = function AuthService_Factory(t) { return new (t || AuthService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_user_service__WEBPACK_IMPORTED_MODULE_3__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_local_storage_service__WEBPACK_IMPORTED_MODULE_4__["LocalStorageService"])); };
AuthService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: AuthService, factory: AuthService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ "QO1C":
/*!*********************************************************************************!*\
  !*** ./src/frontend/app/accounts/suppliers/update/update-supplier.component.ts ***!
  \*********************************************************************************/
/*! exports provided: UpdateSupplierComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UpdateSupplierComponent", function() { return UpdateSupplierComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");

class UpdateSupplierComponent {
    constructor() { }
    ngOnInit() {
    }
}
UpdateSupplierComponent.ɵfac = function UpdateSupplierComponent_Factory(t) { return new (t || UpdateSupplierComponent)(); };
UpdateSupplierComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: UpdateSupplierComponent, selectors: [["app-update"]], decls: 2, vars: 0, template: function UpdateSupplierComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "update works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ1cGRhdGUtc3VwcGxpZXIuY29tcG9uZW50LnNjc3MifQ== */"] });


/***/ }),

/***/ "QTKp":
/*!*****************************************************************************!*\
  !*** ./src/frontend/app/accounts/customers/list/customer-list.component.ts ***!
  \*****************************************************************************/
/*! exports provided: CustomerListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustomerListComponent", function() { return CustomerListComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");

class CustomerListComponent {
    constructor() { }
    ngOnInit() {
    }
}
CustomerListComponent.ɵfac = function CustomerListComponent_Factory(t) { return new (t || CustomerListComponent)(); };
CustomerListComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: CustomerListComponent, selectors: [["app-list"]], decls: 2, vars: 0, template: function CustomerListComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "list works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjdXN0b21lci1saXN0LmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ "QrgV":
/*!*********************************************************!*\
  !*** ./src/frontend/app/settings/settings.component.ts ***!
  \*********************************************************/
/*! exports provided: SettingsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SettingsComponent", function() { return SettingsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/user.service */ "N74B");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../services/settings.service */ "eNjB");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../services/privileges.service */ "JdIH");





class SettingsComponent {
    constructor(router, userService, serviceSettings, privilegesService) {
        this.router = router;
        this.userService = userService;
        this.serviceSettings = serviceSettings;
        this.privilegesService = privilegesService;
        this.isMenuOpen = this.serviceSettings.getIsMenuOpen();
        this.selectedSetting = this.serviceSettings.getSelectedSetting();
        this.selectedParentSetting = this.serviceSettings.getSelectedParentSetting();
        this.settingListOpenState = this.serviceSettings.getSettingListOpenState();
        this.settings = this.serviceSettings.getSettings();
    }
    ngOnInit() {
        this.serviceSettings.init();
        this.selectedSetting = this.serviceSettings.getSelectedSetting();
        this.selectedParentSetting = this.serviceSettings.getSelectedParentSetting();
        this.settings = this.serviceSettings.getSettings();
        this.settings[this.selectedParentSetting].forEach((element) => {
            if (element['id'] == this.selectedSetting) {
                let routeToGo = element.route;
                if (routeToGo && this.privilegesService.hasPrivilege(element.privilege))
                    this.router.navigateByUrl(routeToGo).then();
            }
        });
    }
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
}
SettingsComponent.ɵfac = function SettingsComponent_Factory(t) { return new (t || SettingsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_2__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_3__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_4__["PrivilegesService"])); };
SettingsComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: SettingsComponent, selectors: [["app-panel"]], decls: 0, vars: 0, template: function SettingsComponent_Template(rf, ctx) { }, encapsulation: 2 });


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
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("disabled", !ctx.privilegesService.hasPrivilege("access_splitter"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](6, 6, "HOME.splitter"), " ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("disabled", !ctx.privilegesService.hasPrivilege("access_verifier"));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](12, 8, "HOME.verifier"), " ");
    } }, directives: [_angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCard"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterLinkWithHref"], _angular_material_card__WEBPACK_IMPORTED_MODULE_5__["MatCardSubtitle"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__["TranslatePipe"]], styles: [".disabled[_ngcontent-%COMP%] {\n  opacity: 0.3;\n  pointer-events: none !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2hvbWUuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxZQUFBO0VBQ0EsK0JBQUE7QUFDSiIsImZpbGUiOiJob21lLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmRpc2FibGVke1xuICAgIG9wYWNpdHk6IDAuMztcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZSFpbXBvcnRhbnQ7XG59Il19 */"] });


/***/ }),

/***/ "UYg5":
/*!*********************************************************************************!*\
  !*** ./src/frontend/app/settings/general/users/create/create-user.component.ts ***!
  \*********************************************************************************/
/*! exports provided: CreateUserComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CreateUserComponent", function() { return CreateUserComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../../services/user.service */ "N74B");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../../services/auth.service */ "PS2H");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/select */ "d3UM");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/core */ "FKr1");

























function CreateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r16 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function CreateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r16); const setting_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](4).$implicit; const parent_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r14.serviceSettings.changeSetting(setting_r6["id"], parent_r4["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "p", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r13.router.url.includes(action_r12["route"]))("disable_link", action_r12["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", action_r12["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r12["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 9, action_r12["label"]), " ");
} }
function CreateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, CreateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r12 = ctx.$implicit;
    const setting_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3).$implicit;
    const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("border-gray-600", !action_r12["showOnlyIfActive"])("border-t", !action_r12["showOnlyIfActive"])("w-full", !action_r12["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", (ctx_r11.privilegesService.hasPrivilege(action_r12["privilege"]) || setting_r6["privilege"] == "*") && (!action_r12["showOnlyIfActive"] || action_r12["showOnlyIfActive"] && ctx_r11.router.url.includes(action_r12["route"])));
} }
function CreateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r22 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-expansion-panel", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-expansion-panel-header", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "mat-panel-title", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "button", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function CreateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r22); const setting_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit; const parent_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r20.serviceSettings.changeSetting(setting_r6["id"], parent_r4["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "p", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](8, CreateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const parent_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("expanded", ctx_r10.router.url.includes(setting_r6["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r6["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r10.router.url == setting_r6["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r10.router.url == setting_r6["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", setting_r6["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("font-medium", ctx_r10.router.url == setting_r6["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](7, 13, setting_r6["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r10.serviceSettings.getSettingsAction(parent_r4["id"], setting_r6["id"]));
} }
function CreateUserComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, CreateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r7.privilegesService.hasPrivilege(setting_r6["privilege"]) || setting_r6["privilege"] == "*");
} }
function CreateUserComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r30 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "button", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function CreateUserComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r30); const setting_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit; const parent_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r28.serviceSettings.changeSetting(setting_r6["id"], parent_r4["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "p", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r27 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r27.router.url == setting_r6["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", setting_r6["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r6["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("font-medium", ctx_r27.router.url == setting_r6["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 9, setting_r6["label"]), " ");
} }
function CreateUserComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](0, CreateUserComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 34);
} if (rf & 2) {
    const setting_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r9.privilegesService.hasPrivilege(setting_r6["privilege"]) || setting_r6["privilege"] == "*");
} }
function CreateUserComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, CreateUserComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, CreateUserComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 23, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r6 = ctx.$implicit;
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵreference"](3);
    const parent_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("border-b", ctx_r5.privilegesService.hasPrivilege(setting_r6["privilege"]) || setting_r6["privilege"] == "*")("border-gray-400", ctx_r5.privilegesService.hasPrivilege(setting_r6["privilege"]) || setting_r6["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r5.serviceSettings.getSettingsAction(parent_r4["id"], setting_r6["id"]))("ngIfElse", _r8);
} }
function CreateUserComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-expansion-panel", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-expansion-panel-header", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, CreateUserComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r4 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r4["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 3, parent_r4["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r4["id"]]);
} }
function CreateUserComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} }
function CreateUserComponent_ng_container_20_mat_form_field_1_mat_error_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r38.getErrorMessage(field_r35.id));
} }
function CreateUserComponent_ng_container_20_mat_form_field_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-form-field", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "input", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, CreateUserComponent_ng_container_20_mat_form_field_1_mat_error_6_Template, 2, 1, "mat-error", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](3, 6, field_r35.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 8, field_r35.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("formControl", field_r35.control)("type", field_r35.type)("required", field_r35.required);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r35.control.invalid);
} }
function CreateUserComponent_ng_container_20_mat_form_field_2_mat_option_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-option", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const option_r43 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", option_r43["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](option_r43["label"]);
} }
function CreateUserComponent_ng_container_20_mat_form_field_2_mat_error_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r42 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r42.getErrorMessage(field_r35.id));
} }
function CreateUserComponent_ng_container_20_mat_form_field_2_Template(rf, ctx) { if (rf & 1) {
    const _r47 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-form-field", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "mat-select", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("valueChange", function CreateUserComponent_ng_container_20_mat_form_field_2_Template_mat_select_valueChange_4_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r47); const field_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; return field_r35.control.value = $event; });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](5, CreateUserComponent_ng_container_20_mat_form_field_2_mat_option_5_Template, 2, 2, "mat-option", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, CreateUserComponent_ng_container_20_mat_form_field_2_mat_error_6_Template, 2, 1, "mat-error", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](3, 6, field_r35.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("formControl", field_r35.control)("value", field_r35.control.value)("required", field_r35.required);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", field_r35.values);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r35.control.invalid);
} }
function CreateUserComponent_ng_container_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, CreateUserComponent_ng_container_20_mat_form_field_1_Template, 7, 10, "mat-form-field", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, CreateUserComponent_ng_container_20_mat_form_field_2_Template, 7, 8, "mat-form-field", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const field_r35 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r35.type != "select");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r35.type == "select");
} }
class CreateUserComponent {
    constructor(router, http, route, userService, formBuilder, authService, notify, translate, serviceSettings, privilegesService) {
        this.router = router;
        this.http = http;
        this.route = route;
        this.userService = userService;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.notify = notify;
        this.translate = translate;
        this.serviceSettings = serviceSettings;
        this.privilegesService = privilegesService;
        this.loading = true;
        this.roles = [];
        this.userForm = [
            {
                id: 'username',
                label: this.translate.instant('USER.username'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true,
            },
            {
                id: 'firstname',
                label: this.translate.instant('USER.firstname'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true,
            },
            {
                id: 'lastname',
                label: this.translate.instant('USER.lastname'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true
            },
            {
                id: 'password',
                label: this.translate.instant('USER.password'),
                type: 'password',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true
            },
            {
                id: 'password_check',
                label: this.translate.instant('USER.password_check'),
                type: 'password',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true
            },
            {
                id: 'role',
                label: this.translate.instant('HEADER.role'),
                type: 'select',
                values: [],
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true
            }
        ];
    }
    ngOnInit() {
        this.serviceSettings.init();
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/list', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            data.roles.forEach((element) => {
                if (element.editable) {
                    this.roles.push(element);
                }
            });
            this.userForm.forEach(element => {
                if (element.id == 'role') {
                    element.values = this.roles;
                }
            });
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
    }
    isValidForm() {
        let state = true;
        this.userForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }
    // @ts-ignore
    onSubmit() {
        if (this.isValidForm()) {
            const user = {};
            this.userForm.forEach(element => {
                user[element.id] = element.control.value;
            });
            if (user['password'] !== user['password_check']) {
                this.notify.handleErrors('USER.password_mismatch');
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            }
            this.http.post(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/users/new', user, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])(() => {
                this.notify.success(this.translate.instant('USER.created'));
                this.router.navigate(['/settings/general/users/']);
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            })).subscribe();
        }
    }
    getErrorMessage(field) {
        let error = undefined;
        this.userForm.forEach(element => {
            if (element.id == field)
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
        });
        return error;
    }
}
CreateUserComponent.ɵfac = function CreateUserComponent_Factory(t) { return new (t || CreateUserComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_7__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_9__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_11__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_12__["PrivilegesService"])); };
CreateUserComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({ type: CreateUserComponent, selectors: [["app-create-user"]], decls: 25, vars: 12, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], [1, "settings_title", "text-center"], [1, "flex", "justify-center", "items-center", "align-middle"], [1, "grid", "grid-cols-3", "gap-6", "w-full", "m-10", "text-center", 3, "ngSubmit"], [4, "ngFor", "ngForOf"], [1, "button", "col-span-3"], ["type", "submit", "mat-button", "", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300"], [3, "expanded"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"], ["class", "block", 4, "ngIf"], [1, "block"], ["matInput", "", 3, "formControl", "type", "placeholder", "required"], [3, "formControl", "value", "required", "valueChange"], [3, "value", 4, "ngFor", "ngForOf"], [3, "value"]], template: function CreateUserComponent_Template(rf, ctx) { if (rf & 1) {
        const _r49 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](8, CreateUserComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](10, CreateUserComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function CreateUserComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r49); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](14, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](15, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](17, "hr", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](18, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "form", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngSubmit", function CreateUserComponent_Template_form_ngSubmit_19_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](20, CreateUserComponent_ng_container_20_Template, 3, 2, "ng-container", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](21, "div", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](22, "button", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](23);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](24, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 8, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx.serviceSettings.getTitle());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.userForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](24, 10, "USER.create"), " ");
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_15__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_17__["MatButton"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_ba"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgForm"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanelTitle"], _angular_router__WEBPACK_IMPORTED_MODULE_5__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_19__["LoaderComponent"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_21__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlDirective"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["RequiredValidator"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatError"], _angular_material_select__WEBPACK_IMPORTED_MODULE_22__["MatSelect"], _angular_material_core__WEBPACK_IMPORTED_MODULE_23__["MatOption"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjcmVhdGUtdXNlci5jb21wb25lbnQuc2NzcyJ9 */"] });


/***/ }),

/***/ "VLDq":
/*!*********************************************************************************!*\
  !*** ./src/frontend/app/settings/general/roles/update/update-role.component.ts ***!
  \*********************************************************************************/
/*! exports provided: UpdateRoleComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UpdateRoleComponent", function() { return UpdateRoleComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/checkbox */ "bSwM");
/* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/tabs */ "wZkO");
/* harmony import */ var _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/slide-toggle */ "1jcm");


























function UpdateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r18 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "button", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function UpdateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r18); const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](4).$implicit; const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r16.serviceSettings.changeSetting(setting_r8["id"], parent_r6["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "p", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r15.router.url.includes(action_r14["route"]))("disable_link", action_r14["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", action_r14["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r14["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 9, action_r14["label"]), " ");
} }
function UpdateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, UpdateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r14 = ctx.$implicit;
    const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3).$implicit;
    const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("border-gray-600", !action_r14["showOnlyIfActive"])("border-t", !action_r14["showOnlyIfActive"])("w-full", !action_r14["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", (ctx_r13.privilegesService.hasPrivilege(action_r14["privilege"]) || setting_r8["privilege"] == "*") && (!action_r14["showOnlyIfActive"] || action_r14["showOnlyIfActive"] && ctx_r13.router.url.includes(action_r14["route"])));
} }
function UpdateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r24 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-expansion-panel", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-expansion-panel-header", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "mat-panel-title", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "button", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function UpdateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r24); const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit; const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r22.serviceSettings.changeSetting(setting_r8["id"], parent_r6["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "p", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](8, UpdateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("expanded", ctx_r12.router.url.includes(setting_r8["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r8["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r12.router.url == setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r12.router.url == setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("font-medium", ctx_r12.router.url == setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](7, 13, setting_r8["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r12.serviceSettings.getSettingsAction(parent_r6["id"], setting_r8["id"]));
} }
function UpdateRoleComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, UpdateRoleComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r9.privilegesService.hasPrivilege(setting_r8["privilege"]) || setting_r8["privilege"] == "*");
} }
function UpdateRoleComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r32 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "button", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function UpdateRoleComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r32); const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit; const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r30 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r30.serviceSettings.changeSetting(setting_r8["id"], parent_r6["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "p", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r29 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r29.router.url == setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r8["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("font-medium", ctx_r29.router.url == setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 9, setting_r8["label"]), " ");
} }
function UpdateRoleComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](0, UpdateRoleComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 38);
} if (rf & 2) {
    const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r11.privilegesService.hasPrivilege(setting_r8["privilege"]) || setting_r8["privilege"] == "*");
} }
function UpdateRoleComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, UpdateRoleComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, UpdateRoleComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 27, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r8 = ctx.$implicit;
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵreference"](3);
    const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("border-b", ctx_r7.privilegesService.hasPrivilege(setting_r8["privilege"]) || setting_r8["privilege"] == "*")("border-gray-400", ctx_r7.privilegesService.hasPrivilege(setting_r8["privilege"]) || setting_r8["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r7.serviceSettings.getSettingsAction(parent_r6["id"], setting_r8["id"]))("ngIfElse", _r10);
} }
function UpdateRoleComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-expansion-panel", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-expansion-panel-header", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, UpdateRoleComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r6 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r6["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 3, parent_r6["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r6["id"]]);
} }
function UpdateRoleComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} }
function UpdateRoleComponent_div_14_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](5, "hr", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate2"]("", ctx_r3.serviceSettings.getTitle(), " : ", ctx_r3.role["label"], " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", ctx_r3.role["label_short"], ")");
} }
function UpdateRoleComponent_ng_container_17_mat_form_field_1_mat_error_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r37 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r40.getErrorMessage(field_r37.id));
} }
function UpdateRoleComponent_ng_container_17_mat_form_field_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-form-field");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "input", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, UpdateRoleComponent_ng_container_17_mat_form_field_1_mat_error_6_Template, 2, 1, "mat-error", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r37 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](3, 7, field_r37.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 9, field_r37.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", field_r37.control.value)("formControl", field_r37.control)("type", field_r37.type)("required", field_r37.required);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r37.control.invalid);
} }
function UpdateRoleComponent_ng_container_17_mat_checkbox_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-checkbox", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r37 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("formControl", field_r37.control);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 2, field_r37.label), " ");
} }
function UpdateRoleComponent_ng_container_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, UpdateRoleComponent_ng_container_17_mat_form_field_1_Template, 7, 11, "mat-form-field", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, UpdateRoleComponent_ng_container_17_mat_checkbox_2_Template, 3, 4, "mat-checkbox", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const field_r37 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r37.type == "text");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r37.type == "checkbox");
} }
function UpdateRoleComponent_mat_tab_group_23_mat_tab_1_mat_slide_toggle_2_Template(rf, ctx) { if (rf & 1) {
    const _r49 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-slide-toggle", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("change", function UpdateRoleComponent_mat_tab_group_23_mat_tab_1_mat_slide_toggle_2_Template_mat_slide_toggle_change_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r49); const ctx_r48 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3); return ctx_r48.changePrivilege($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const privilege_r47 = ctx.$implicit;
    const ctx_r46 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("name", privilege_r47)("checked", ctx_r46.hasPrivilege(privilege_r47));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 3, "PRIVILEGES." + privilege_r47), " ");
} }
function UpdateRoleComponent_mat_tab_group_23_mat_tab_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-tab", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "div", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, UpdateRoleComponent_mat_tab_group_23_mat_tab_1_mat_slide_toggle_2_Template, 3, 5, "mat-slide-toggle", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r45 = ctx.$implicit;
    const ctx_r44 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("label", ctx_r44.translate.instant("PRIVILEGES." + parent_r45));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r44.getChildsByParent(parent_r45));
} }
function UpdateRoleComponent_mat_tab_group_23_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-tab-group", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, UpdateRoleComponent_mat_tab_group_23_mat_tab_1_Template, 3, 2, "mat-tab", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r5.privileges["parent"]);
} }
class UpdateRoleComponent {
    // End translation
    constructor(http, router, route, formBuilder, authService, userService, translate, notify, serviceSettings, privilegesService) {
        this.http = http;
        this.router = router;
        this.route = route;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.userService = userService;
        this.translate = translate;
        this.notify = notify;
        this.serviceSettings = serviceSettings;
        this.privilegesService = privilegesService;
        this.headers = this.authService.headers;
        this.loading = true;
        this.roles = [];
        this.roleForm = [
            {
                id: 'label',
                label: this.translate.instant('HEADER.label'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true,
            },
            {
                id: 'label_short',
                label: this.translate.instant('HEADER.label_short'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true,
            },
            {
                id: 'enabled',
                label: this.translate.instant('ROLE.enable'),
                type: 'checkbox',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true,
            }
        ];
        // Only used to get translation available while running the extract-translations
        this.parent_label = [
            this.translate.instant('PRIVILEGES.general'),
            this.translate.instant('PRIVILEGES.administration'),
            this.translate.instant('PRIVILEGES.verifier'),
            this.translate.instant('PRIVILEGES.splitter')
        ];
        this.privileges_label = [
            this.translate.instant('PRIVILEGES.access_verifier'),
            this.translate.instant('PRIVILEGES.access_splitter'),
            this.translate.instant('PRIVILEGES.settings'),
            this.translate.instant('PRIVILEGES.upload'),
            this.translate.instant('PRIVILEGES.users_list'),
            this.translate.instant('PRIVILEGES.add_user'),
            this.translate.instant('PRIVILEGES.update_user'),
            this.translate.instant('PRIVILEGES.roles_list'),
            this.translate.instant('PRIVILEGES.add_role'),
            this.translate.instant('PRIVILEGES.update_role'),
            this.translate.instant('PRIVILEGES.version_update'),
            this.translate.instant('PRIVILEGES.custom_fields'),
            this.translate.instant('PRIVILEGES.forms_list'),
            this.translate.instant('PRIVILEGES.form_builder')
        ];
    }
    ngOnInit() {
        this.serviceSettings.init();
        this.roleId = this.route.snapshot.params['id'];
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/getById/' + this.roleId, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            this.role = data;
            for (let field in data) {
                if (data.hasOwnProperty(field)) {
                    this.roleForm.forEach(element => {
                        if (element.id == field) {
                            element.control.setValue(data[field]);
                        }
                    });
                }
            }
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            this.router.navigate(['/settings/general/roles']).then();
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/privileges/getbyRoleId/' + this.roleId, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            this.rolePrivileges = data;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err, '/settings/general/roles');
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/privileges/list', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            this.privileges = data;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err, '/settings/general/roles');
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
    }
    isValidForm() {
        let state = true;
        this.roleForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }
    onSubmit() {
        if (this.isValidForm()) {
            const role = {};
            this.roleForm.forEach(element => {
                role[element.id] = element.control.value;
            });
            let role_privileges = [];
            this.privileges['privileges'].forEach((element) => {
                this.rolePrivileges.forEach((element2) => {
                    if (element['label'] == element2) {
                        role_privileges.push(element['id']);
                    }
                });
            });
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/update/' + this.roleId, { 'args': role }, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/roles/');
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            })).subscribe();
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/updatePrivilege/' + this.roleId, { 'privileges': role_privileges }, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])(() => {
                this.notify.success(this.translate.instant('ROLE.updated'));
                this.router.navigate(['/settings/general/roles/']);
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/roles/');
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            })).subscribe();
        }
    }
    getErrorMessage(field) {
        let error = undefined;
        this.roleForm.forEach(element => {
            if (element.id == field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }
    hasPrivilege(privilege_id) {
        let found = false;
        this.rolePrivileges.forEach((element) => {
            if (privilege_id == element) {
                found = true;
            }
        });
        return found;
    }
    getChildsByParent(parent) {
        let data = [];
        this.privileges['privileges'].forEach((element) => {
            if (parent == element['parent']) {
                data.push(element['label']);
            }
        });
        return data;
    }
    changePrivilege(event) {
        let privilege = event.source.name;
        let checked = event.checked;
        if (!checked) {
            this.rolePrivileges.forEach((element) => {
                if (privilege == element) {
                    let index = this.rolePrivileges.indexOf(privilege, 0);
                    this.rolePrivileges.splice(index, 1);
                }
            });
        }
        else {
            this.rolePrivileges.push(privilege);
        }
    }
}
UpdateRoleComponent.ɵfac = function UpdateRoleComponent_Factory(t) { return new (t || UpdateRoleComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_7__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_8__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_11__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_12__["PrivilegesService"])); };
UpdateRoleComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({ type: UpdateRoleComponent, selectors: [["app-update"]], decls: 28, vars: 16, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], ["class", "settings_title text-center", 4, "ngIf"], [1, "flex", "justify-center", "items-center"], [1, "grid", "grid-cols-3", "gap-6", "w-full", "m-10", "text-center", 3, "ngSubmit"], [4, "ngFor", "ngForOf"], [1, "w-1/2", "m-auto", "border-green-400"], [1, "text-center", "mt-10", "mb-10"], [1, "flex", "justify-center", "items-center", "ml-10", "mr-5"], ["dynamicHeight", "", 4, "ngIf"], [1, "flex", "justify-center", "items-center", "mt-10"], ["mat-button", "", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300", 3, "click"], [3, "expanded"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"], [1, "settings_title", "text-center"], ["class", "mt-4 -ml-72", 3, "formControl", 4, "ngIf"], ["matInput", "", 3, "value", "formControl", "type", "placeholder", "required"], [1, "mt-4", "-ml-72", 3, "formControl"], ["dynamicHeight", ""], [3, "label", 4, "ngFor", "ngForOf"], [3, "label"], [1, "grid", "grid-cols-4", "gap-x-60", "gap-y-10", "mt-10"], [3, "name", "checked", "change", 4, "ngFor", "ngForOf"], [3, "name", "checked", "change"]], template: function UpdateRoleComponent_Template(rf, ctx) { if (rf & 1) {
        const _r50 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](8, UpdateRoleComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](10, UpdateRoleComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function UpdateRoleComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r50); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](14, UpdateRoleComponent_div_14_Template, 6, 3, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](15, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](16, "form", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngSubmit", function UpdateRoleComponent_Template_form_ngSubmit_16_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](17, UpdateRoleComponent_ng_container_17_Template, 3, 2, "ng-container", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](18, "mat-divider", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "h4", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](20);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](21, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](22, "div", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](23, UpdateRoleComponent_mat_tab_group_23_Template, 2, 1, "mat-tab-group", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](24, "div", 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](25, "button", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function UpdateRoleComponent_Template_button_click_25_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](26);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](27, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 10, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.role);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.roleForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](21, 12, "PRIVILEGES.list"));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.privileges && ctx.rolePrivileges);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](27, 14, "ROLE.update"), " ");
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_15__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_17__["MatButton"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_ba"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgForm"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanelTitle"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_19__["LoaderComponent"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_21__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlDirective"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["RequiredValidator"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatError"], _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_22__["MatCheckbox"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_23__["MatTabGroup"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_23__["MatTab"], _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_24__["MatSlideToggle"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslatePipe"]], styles: [".mat-slide-toggle-content {\n  overflow: inherit !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3VwZGF0ZS1yb2xlLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksNEJBQUE7QUFDSiIsImZpbGUiOiJ1cGRhdGUtcm9sZS5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIjo6bmctZGVlcCAubWF0LXNsaWRlLXRvZ2dsZS1jb250ZW50e1xuICAgIG92ZXJmbG93OiBpbmhlcml0IWltcG9ydGFudDtcbn0iXX0= */"] });


/***/ }),

/***/ "VzAV":
/*!***********************************************************************************!*\
  !*** ./src/frontend/app/settings/verifier/form/builder/form-builder.component.ts ***!
  \***********************************************************************************/
/*! exports provided: FormBuilderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormBuilderComponent", function() { return FormBuilderComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/cdk/drag-drop */ "5+WD");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @biesbjerg/ngx-translate-extract-marker */ "4u49");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../../services/user.service */ "N74B");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../../services/auth.service */ "PS2H");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/core */ "FKr1");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_locale_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../../../services/locale.service */ "W2Zi");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../../../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @angular/material/slide-toggle */ "1jcm");
/* harmony import */ var ng_sortgrid__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ng-sortgrid */ "0dH1");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");
/* harmony import */ var _angular_material_menu__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @angular/material/menu */ "STbY");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! @angular/material/icon */ "NFeN");
/* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! @angular/material/tabs */ "wZkO");
/* harmony import */ var _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! @angular/material/datepicker */ "iadO");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! @angular/material/select */ "d3UM");




































function FormBuilderComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r18 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "button", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r18); const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](4).$implicit; const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](); return ctx_r16.serviceSettings.changeSetting(setting_r8["id"], parent_r6["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "p", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-green-400", ctx_r15.router.url.includes(action_r14["route"]))("disable_link", action_r14["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpropertyInterpolate"]("routerLink", action_r14["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r14["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](5, 9, action_r14["label"]), " ");
} }
function FormBuilderComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, FormBuilderComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r14 = ctx.$implicit;
    const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3).$implicit;
    const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("border-gray-600", !action_r14["showOnlyIfActive"])("border-t", !action_r14["showOnlyIfActive"])("w-full", !action_r14["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", (ctx_r13.privilegesService.hasPrivilege(action_r14["privilege"]) || setting_r8["privilege"] == "*") && (!action_r14["showOnlyIfActive"] || action_r14["showOnlyIfActive"] && ctx_r13.router.url.includes(action_r14["route"])));
} }
function FormBuilderComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r24 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "mat-expansion-panel", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "mat-expansion-panel-header", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "mat-panel-title", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "button", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r24); const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit; const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](); return ctx_r22.serviceSettings.changeSetting(setting_r8["id"], parent_r6["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "p", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](8, FormBuilderComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("expanded", ctx_r12.router.url.includes(setting_r8["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r8["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-green-400", ctx_r12.router.url == setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-green-400", ctx_r12.router.url == setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpropertyInterpolate"]("routerLink", setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("font-medium", ctx_r12.router.url == setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](7, 13, setting_r8["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r12.serviceSettings.getSettingsAction(parent_r6["id"], setting_r8["id"]));
} }
function FormBuilderComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, FormBuilderComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx_r9.privilegesService.hasPrivilege(setting_r8["privilege"]) || setting_r8["privilege"] == "*");
} }
function FormBuilderComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r32 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r32); const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit; const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r30 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](); return ctx_r30.serviceSettings.changeSetting(setting_r8["id"], parent_r6["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "p", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    const ctx_r29 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-green-400", ctx_r29.router.url == setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpropertyInterpolate"]("routerLink", setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r8["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("font-medium", ctx_r29.router.url == setting_r8["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](4, 9, setting_r8["label"]), " ");
} }
function FormBuilderComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](0, FormBuilderComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 35);
} if (rf & 2) {
    const setting_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx_r11.privilegesService.hasPrivilege(setting_r8["privilege"]) || setting_r8["privilege"] == "*");
} }
function FormBuilderComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, FormBuilderComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](2, FormBuilderComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 24, _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r8 = ctx.$implicit;
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](3);
    const parent_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("border-b", ctx_r7.privilegesService.hasPrivilege(setting_r8["privilege"]) || setting_r8["privilege"] == "*")("border-gray-400", ctx_r7.privilegesService.hasPrivilege(setting_r8["privilege"]) || setting_r8["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx_r7.serviceSettings.getSettingsAction(parent_r6["id"], setting_r8["id"]))("ngIfElse", _r10);
} }
function FormBuilderComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "mat-expansion-panel", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "mat-expansion-panel-header", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](6, FormBuilderComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r6 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r6["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](4, 3, parent_r6["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r6["id"]]);
} }
function FormBuilderComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_1_button_26_Template(rf, ctx) { if (rf & 1) {
    const _r57 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_1_button_26_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r57); const _class_r54 = ctx.$implicit; const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r55.changeClass(field_r43.id, _class_r54.id, _class_r54.label, category_r40["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const _class_r54 = ctx.$implicit;
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("bg-green-400", _class_r54.id == field_r43.class);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("id", field_r43.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 4, _class_r54.label), " ");
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_1_button_29_Template(rf, ctx) { if (rf & 1) {
    const _r63 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_1_button_29_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r63); const _color_r60 = ctx.$implicit; const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r61 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r61.changeColor(field_r43.id, _color_r60.id, category_r40["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const _color_r60 = ctx.$implicit;
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵstyleMap"]("background-color:" + _color_r60.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-white", _color_r60.id == "black" || _color_r60.id == "navy");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("id", field_r43.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 6, _color_r60.label), " ");
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    const _r68 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "mat-form-field", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "i", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_1_Template_i_click_2_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r68); const ctx_r67 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](); const index_r44 = ctx_r67.index; const field_r43 = ctx_r67.$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r66 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r66.deleteField($event, index_r44, category_r40["id"], field_r43.unit); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "mat-label", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](6, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](8, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](9, "input", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "div", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](11, "button", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "mat-icon", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13, "more_vert");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "mat-menu", null, 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](16, "button", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](18, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](19, "button", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](21, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "small", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "mat-menu", null, 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](26, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_1_button_26_Template, 3, 6, "button", 62);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "mat-menu", null, 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](29, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_1_button_29_Template, 3, 8, "button", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const _r49 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](15);
    const _r50 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](25);
    const _r52 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](28);
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r45 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matTooltipClass", "-mt-3")("matTooltip", ctx_r45.translate.instant(field_r43["label"]) + " (" + ctx_r45.translate.instant("TYPES." + field_r43["type"]) + ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matTooltip", ctx_r45.translate.instant("FORMS.delete_field"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](6, 18, field_r43.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" (", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](8, 20, "TYPES." + field_r43.type), ") ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r49)("matTooltip", ctx_r45.translate.instant("VERIFIER.field_settings"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵstyleMap"]("background-color:" + field_r43.color);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-white", field_r43.color == "black" || field_r43.color == "navy");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r52);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](18, 22, "VERIFIER.colors"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r50);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](21, 24, "VERIFIER.size"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](field_r43.class_label);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r45.classList);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r45.colorsList);
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_2_button_26_Template(rf, ctx) { if (rf & 1) {
    const _r79 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_2_button_26_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r79); const _class_r76 = ctx.$implicit; const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r77 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r77.changeClass(field_r43.id, _class_r76.id, _class_r76.label, category_r40["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const _class_r76 = ctx.$implicit;
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("bg-green-400", _class_r76.id == field_r43.class);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("id", field_r43.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 4, _class_r76.label), " ");
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_2_button_29_Template(rf, ctx) { if (rf & 1) {
    const _r85 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_2_button_29_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r85); const _color_r82 = ctx.$implicit; const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r83 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r83.changeColor(field_r43.id, _color_r82.id, category_r40["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const _color_r82 = ctx.$implicit;
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵstyleMap"]("background-color:" + _color_r82.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-white", _color_r82.id == "black" || _color_r82.id == "navy");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("id", field_r43.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 6, _color_r82.label), " ");
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    const _r90 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "mat-form-field", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "i", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_2_Template_i_click_2_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r90); const ctx_r89 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](); const index_r44 = ctx_r89.index; const field_r43 = ctx_r89.$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r88 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r88.deleteField($event, index_r44, category_r40["id"], field_r43.unit); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "mat-label", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](6, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](8, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](9, "input", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "div", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](11, "button", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "mat-icon", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13, "more_vert");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "mat-menu", null, 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](16, "button", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](18, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](19, "button", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](21, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "small", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "mat-menu", null, 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](26, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_2_button_26_Template, 3, 6, "button", 62);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "mat-menu", null, 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](29, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_2_button_29_Template, 3, 8, "button", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const _r71 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](15);
    const _r72 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](25);
    const _r74 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](28);
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r46 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matTooltipClass", "-mt-3")("matTooltip", ctx_r46.translate.instant(field_r43["label"]) + " (" + ctx_r46.translate.instant("TYPES." + field_r43["type"]) + ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matTooltip", ctx_r46.translate.instant("FORMS.delete_field"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](6, 18, field_r43.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" (", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](8, 20, "TYPES." + field_r43.type), ") ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r71)("matTooltip", ctx_r46.translate.instant("VERIFIER.field_settings"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵstyleMap"]("background-color:" + field_r43.color);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-white", field_r43.color == "black" || field_r43.color == "navy");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r74);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](18, 22, "VERIFIER.colors"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r72);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](21, 24, "VERIFIER.size"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](field_r43.class_label);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r46.classList);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r46.colorsList);
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_3_button_26_Template(rf, ctx) { if (rf & 1) {
    const _r101 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_3_button_26_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r101); const _class_r98 = ctx.$implicit; const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r99 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r99.changeClass(field_r43.id, _class_r98.id, _class_r98.label, category_r40["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const _class_r98 = ctx.$implicit;
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("bg-green-400", _class_r98.id == field_r43.class);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("id", field_r43.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 4, _class_r98.label), " ");
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_3_button_29_Template(rf, ctx) { if (rf & 1) {
    const _r107 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_3_button_29_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r107); const _color_r104 = ctx.$implicit; const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r105 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r105.changeColor(field_r43.id, _color_r104.id, category_r40["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const _color_r104 = ctx.$implicit;
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵstyleMap"]("background-color:" + _color_r104.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-white", _color_r104.id == "black" || _color_r104.id == "navy");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("id", field_r43.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 6, _color_r104.label), " ");
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_3_Template(rf, ctx) { if (rf & 1) {
    const _r112 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "mat-form-field", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "i", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_3_Template_i_click_2_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r112); const ctx_r111 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](); const index_r44 = ctx_r111.index; const field_r43 = ctx_r111.$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r110 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r110.deleteField($event, index_r44, category_r40["id"], field_r43.unit); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "mat-label", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](6, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](8, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](9, "input", 66);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "div", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](11, "button", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "mat-icon", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13, "more_vert");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "mat-menu", null, 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](16, "button", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](18, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](19, "button", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](21, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "small", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "mat-menu", null, 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](26, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_3_button_26_Template, 3, 6, "button", 62);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "mat-menu", null, 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](29, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_3_button_29_Template, 3, 8, "button", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const _r93 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](15);
    const _r94 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](25);
    const _r96 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](28);
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r47 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matTooltipClass", "-mt-3")("matTooltip", ctx_r47.translate.instant(field_r43["label"]) + " (" + ctx_r47.translate.instant("TYPES." + field_r43["type"]) + ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matTooltip", ctx_r47.translate.instant("FORMS.delete_field"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](6, 18, field_r43.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" (", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](8, 20, "TYPES." + field_r43.type), ") ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r93)("matTooltip", ctx_r47.translate.instant("VERIFIER.field_settings"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵstyleMap"]("background-color:" + field_r43.color);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-white", field_r43.color == "black" || field_r43.color == "navy");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r96);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](18, 22, "VERIFIER.colors"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r94);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](21, 24, "VERIFIER.size"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](field_r43.class_label);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r47.classList);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r47.colorsList);
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_4_button_26_Template(rf, ctx) { if (rf & 1) {
    const _r123 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_4_button_26_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r123); const _class_r120 = ctx.$implicit; const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r121 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r121.changeClass(field_r43.id, _class_r120.id, _class_r120.label, category_r40["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const _class_r120 = ctx.$implicit;
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("bg-green-400", _class_r120.id == field_r43.class);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("id", field_r43.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 4, _class_r120.label), " ");
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_4_button_29_Template(rf, ctx) { if (rf & 1) {
    const _r129 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_4_button_29_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r129); const _color_r126 = ctx.$implicit; const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r127 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r127.changeColor(field_r43.id, _color_r126.id, category_r40["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const _color_r126 = ctx.$implicit;
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵstyleMap"]("background-color:" + _color_r126.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-white", _color_r126.id == "black" || _color_r126.id == "navy");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("id", field_r43.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 6, _color_r126.label), " ");
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_4_Template(rf, ctx) { if (rf & 1) {
    const _r134 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "mat-form-field", 67);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "i", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_4_Template_i_click_2_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r134); const ctx_r133 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](); const index_r44 = ctx_r133.index; const field_r43 = ctx_r133.$implicit; const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r132 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r132.deleteField($event, index_r44, category_r40["id"], field_r43.unit); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "mat-label", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](6, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](8, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](9, "input", 66);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "div", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](11, "button", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "mat-icon", 68);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13, "more_vert");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "mat-menu", null, 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](16, "button", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](18, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](19, "button", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](21, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "small", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "mat-menu", null, 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](26, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_4_button_26_Template, 3, 6, "button", 62);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "mat-menu", null, 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](29, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_4_button_29_Template, 3, 8, "button", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const _r115 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](15);
    const _r116 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](25);
    const _r118 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](28);
    const field_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r48 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matTooltip", ctx_r48.translate.instant(field_r43["label"]) + " (" + ctx_r48.translate.instant("TYPES." + field_r43["type"]) + ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matTooltip", ctx_r48.translate.instant("FORMS.delete_field"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](6, 17, field_r43.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" (", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](8, 19, "TYPES." + field_r43.type), ") ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r115)("matTooltip", ctx_r48.translate.instant("VERIFIER.field_settings"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵstyleMap"]("background-color:" + field_r43.color);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("text-white", field_r43.color == "black" || field_r43.color == "navy");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r118);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](18, 21, "VERIFIER.colors"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("matMenuTriggerFor", _r116);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](21, 23, "VERIFIER.size"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](field_r43.class_label);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r48.classList);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r48.colorsList);
} }
function FormBuilderComponent_div_20_ng_container_11_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r139 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("sorted", function FormBuilderComponent_div_20_ng_container_11_div_6_Template_div_sorted_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r139); const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit; const ctx_r137 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r137.storeNewOrder($event, category_r40["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_1_Template, 30, 26, "ng-container", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](2, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_2_Template, 30, 26, "ng-container", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](3, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_3_Template, 30, 26, "ng-container", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](4, FormBuilderComponent_div_20_ng_container_11_div_6_ng_container_4_Template, 30, 25, "ng-container", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r43 = ctx.$implicit;
    const category_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r42 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassMap"](field_r43.class);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpropertyInterpolate"]("ngSortGridGroup", category_r40["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngSortGridItems", ctx_r42.fields[category_r40["id"]]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", field_r43.type === "text");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", field_r43.type === "textarea");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", field_r43.type === "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", field_r43.type === "select");
} }
function FormBuilderComponent_div_20_ng_container_11_Template(rf, ctx) { if (rf & 1) {
    const _r142 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "div", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "div", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("cdkDropListDropped", function FormBuilderComponent_div_20_ng_container_11_Template_div_cdkDropListDropped_5_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r142); const ctx_r141 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r141.dropFromForm($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](6, FormBuilderComponent_div_20_ng_container_11_div_6_Template, 5, 8, "div", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const category_r40 = ctx.$implicit;
    const ctx_r37 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](3, 3, category_r40["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpropertyInterpolate"]("id", category_r40["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r37.fields[category_r40["id"]]);
} }
function FormBuilderComponent_div_20_span_14_Template(rf, ctx) { if (rf & 1) {
    const _r144 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "span", 69);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_span_14_Template_span_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r144); const ctx_r143 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r143.createForm(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 1, "FORMS.create"));
} }
function FormBuilderComponent_div_20_span_15_Template(rf, ctx) { if (rf & 1) {
    const _r146 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "span", 69);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_div_20_span_15_Template_span_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r146); const ctx_r145 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r145.updateForm(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](2, 1, "FORMS.modify"));
} }
function FormBuilderComponent_div_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "mat-form-field", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](6, "input", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "div", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](8, "mat-slide-toggle", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](10, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](11, FormBuilderComponent_div_20_ng_container_11_Template, 7, 5, "ng-container", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "div", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](13, "button", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](14, FormBuilderComponent_div_20_span_14_Template, 3, 3, "span", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](15, FormBuilderComponent_div_20_span_15_Template, 3, 3, "span", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](5, 7, "FORMS.label"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("formControl", ctx_r3.form["label"].control);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("formControl", ctx_r3.form["default"].control);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](10, 9, "FORMS.is_default"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r3.fieldCategories);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx_r3.creationMode);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", !ctx_r3.creationMode);
} }
function FormBuilderComponent_mat_tab_group_27_mat_tab_1_div_3_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 75);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](2, "i", 76);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "mat-form-field", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](8, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](9, "input", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const field_r150 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](4, 2, field_r150.label), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](8, 4, "TYPES." + field_r150.type));
} }
function FormBuilderComponent_mat_tab_group_27_mat_tab_1_div_3_ng_container_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 75);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](2, "i", 76);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "mat-form-field", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](8, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](9, "input", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const field_r150 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](4, 2, field_r150.label), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](8, 4, "TYPES." + field_r150.type));
} }
function FormBuilderComponent_mat_tab_group_27_mat_tab_1_div_3_ng_container_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 75);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](2, "i", 76);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "mat-form-field", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](8, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](9, "input", 78);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](10, "mat-datepicker-toggle", 79);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const field_r150 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](4, 2, field_r150.label), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](8, 4, "TYPES." + field_r150.type));
} }
function FormBuilderComponent_mat_tab_group_27_mat_tab_1_div_3_ng_container_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 75);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](2, "i", 76);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "mat-form-field", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](8, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](9, "mat-select");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const field_r150 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](4, 2, field_r150.label), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](8, 4, "TYPES." + field_r150.type));
} }
function FormBuilderComponent_mat_tab_group_27_mat_tab_1_div_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 74);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](2, FormBuilderComponent_mat_tab_group_27_mat_tab_1_div_3_ng_container_2_Template, 10, 6, "ng-container", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](3, FormBuilderComponent_mat_tab_group_27_mat_tab_1_div_3_ng_container_3_Template, 10, 6, "ng-container", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](4, FormBuilderComponent_mat_tab_group_27_mat_tab_1_div_3_ng_container_4_Template, 11, 6, "ng-container", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](5, FormBuilderComponent_mat_tab_group_27_mat_tab_1_div_3_ng_container_5_Template, 10, 6, "ng-container", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r150 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", field_r150.type === "text");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", field_r150.type === "textarea");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", field_r150.type === "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", field_r150.type === "select");
} }
function FormBuilderComponent_mat_tab_group_27_mat_tab_1_Template(rf, ctx) { if (rf & 1) {
    const _r160 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "mat-tab", 72);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "div", 73);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("cdkDropListDropped", function FormBuilderComponent_mat_tab_group_27_mat_tab_1_Template_div_cdkDropListDropped_2_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r160); const ctx_r159 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2); return ctx_r159.dropFromAvailableFields($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](3, FormBuilderComponent_mat_tab_group_27_mat_tab_1_div_3_Template, 6, 4, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const availableFields_r148 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpropertyInterpolate"]("label", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](1, 4, availableFields_r148["label"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpropertyInterpolate"]("id", availableFields_r148["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("cdkDropListData", availableFields_r148["values"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", availableFields_r148["values"]);
} }
function FormBuilderComponent_mat_tab_group_27_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "mat-tab-group", 70);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, FormBuilderComponent_mat_tab_group_27_mat_tab_1_Template, 4, 6, "mat-tab", 71);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r5.availableFieldsParent);
} }
class FormBuilderComponent {
    constructor(http, router, route, userService, formBuilder, authService, _adapter, translate, notify, localeService, serviceSettings, privilegesService) {
        this.http = http;
        this.router = router;
        this.route = route;
        this.userService = userService;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this._adapter = _adapter;
        this.translate = translate;
        this.notify = notify;
        this.localeService = localeService;
        this.serviceSettings = serviceSettings;
        this.privilegesService = privilegesService;
        this.loading = true;
        this.form = {
            'label': {
                'control': new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
            },
            'default': {
                'control': new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
            }
        };
        this.creationMode = true;
        this.labelType = [
            Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__["marker"])('TYPES.text'),
            Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__["marker"])('TYPES.textarea'),
            Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__["marker"])('TYPES.date'),
            Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__["marker"])('TYPES.select'),
            Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_5__["marker"])('VERIFIER.field_settings'),
        ];
        this.fieldCategories = [
            {
                'id': 'accounts',
                'label': this.translate.instant('ACCOUNTS.accounts')
            },
            {
                'id': 'facturation',
                'label': this.translate.instant('FACTURATION.facturation')
            },
            {
                'id': 'other',
                'label': this.translate.instant('FORMS.other')
            }
        ];
        this.availableFieldsParent = [
            {
                'id': 'accounts_fields',
                'label': this.translate.instant('ACCOUNTS.accounts'),
                'values': [
                    {
                        id: 'name',
                        label: this.translate.instant('ACCOUNTS.name'),
                        unit: 'accounts',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                    },
                    {
                        id: 'siret',
                        label: this.translate.instant('ACCOUNTS.siret'),
                        unit: 'accounts',
                        type: 'text',
                        required: false,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'green'
                    },
                    {
                        id: 'siren',
                        label: this.translate.instant('ACCOUNTS.siren'),
                        unit: 'accounts',
                        type: 'text',
                        required: false,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'lime'
                    },
                    {
                        id: 'vat_number',
                        label: this.translate.instant('ACCOUNTS.vat_number'),
                        unit: 'accounts',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'olive'
                    },
                    {
                        id: 'address1',
                        label: this.translate.instant('ADDRESSES.address_1'),
                        unit: 'addresses',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                    },
                    {
                        id: 'address2',
                        label: this.translate.instant('ADDRESSES.address_2'),
                        unit: 'addresses',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                    },
                    {
                        id: 'postal_code',
                        label: this.translate.instant('ADDRESSES.postal_code'),
                        unit: 'addresses',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                    },
                    {
                        id: 'city',
                        label: this.translate.instant('ADDRESSES.city'),
                        unit: 'addresses',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                    },
                    {
                        id: 'country',
                        label: this.translate.instant('ADDRESSES.country'),
                        unit: 'addresses',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                    },
                ]
            },
            {
                'id': 'facturation_fields',
                'label': this.translate.instant('FACTURATION.facturation'),
                'values': [
                    {
                        id: 'order_number',
                        label: this.translate.instant('FACTURATION.order_number'),
                        unit: 'facturation',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'white'
                    },
                    {
                        id: 'delivery_number',
                        label: this.translate.instant('FACTURATION.delivery_number'),
                        unit: 'facturation',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'silver'
                    },
                    {
                        id: 'invoice_number',
                        label: this.translate.instant('FACTURATION.invoice_number'),
                        unit: 'facturation',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'red'
                    },
                    {
                        id: 'invoice_date',
                        label: this.translate.instant('FACTURATION.invoice_date'),
                        unit: 'facturation',
                        type: 'date',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'yellow'
                    },
                    {
                        id: 'invoice_due_date',
                        label: this.translate.instant('FACTURATION.invoice_due_date'),
                        unit: 'facturation',
                        type: 'date',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'blue'
                    },
                    {
                        id: 'vat_rate',
                        label: this.translate.instant('FACTURATION.vat_rate'),
                        unit: 'facturation',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'aqua'
                    },
                    {
                        id: 'no_rate_amount',
                        label: this.translate.instant('FACTURATION.no_rate_amount'),
                        unit: 'facturation',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'fuschia'
                    },
                    {
                        id: 'vat_amount',
                        label: this.translate.instant('FACTURATION.vat_amount'),
                        unit: 'facturation',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: 'teal'
                    },
                    {
                        id: 'accounting_plan',
                        label: this.translate.instant('FACTURATION.accounting_plan'),
                        unit: 'facturation',
                        type: 'select',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                    },
                    {
                        id: 'total_ttc',
                        label: this.translate.instant('FACTURATION.total_ttc'),
                        unit: 'facturation',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                    },
                    {
                        id: 'total_ht',
                        label: this.translate.instant('FACTURATION.total_ht'),
                        unit: 'facturation',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                    },
                    {
                        id: 'total_vat',
                        label: this.translate.instant('FACTURATION.total_vat'),
                        unit: 'facturation',
                        type: 'text',
                        required: true,
                        class: "w-1/3",
                        class_label: "1/33",
                        color: '',
                    },
                ]
            },
            {
                'id': 'custom_fields',
                'label': this.translate.instant('FORMS.custom_fields'),
                'values': []
            },
        ];
        this.fields = {
            'accounts': [],
            'facturation': [],
            'other': []
        };
        this.classList = [
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
            }
        ];
        this.colorsList = [
            {
                'id': 'yellow',
                'label': this.translate.instant('COLORS.yellow')
            },
            {
                'id': 'pink',
                'label': this.translate.instant('COLORS.pink')
            },
            {
                'id': 'red',
                'label': this.translate.instant('COLORS.red')
            },
            {
                'id': 'blue',
                'label': this.translate.instant('COLORS.blue')
            },
            {
                'id': 'orange',
                'label': this.translate.instant('COLORS.orange')
            },
            {
                'id': 'purple',
                'label': this.translate.instant('COLORS.purple')
            },
            {
                'id': 'black',
                'label': this.translate.instant('COLORS.black')
            },
            {
                'id': 'white',
                'label': this.translate.instant('COLORS.white')
            },
            {
                'id': 'aqua',
                'label': this.translate.instant('COLORS.aqua')
            },
            {
                'id': 'maroon',
                'label': this.translate.instant('COLORS.maroon')
            },
            {
                'id': 'teal',
                'label': this.translate.instant('COLORS.teal')
            },
            {
                'id': 'navy',
                'label': this.translate.instant('COLORS.navy')
            },
            {
                'id': 'fuchsia',
                'label': this.translate.instant('COLORS.fuchsia')
            },
            {
                'id': 'silver',
                'label': this.translate.instant('COLORS.silver')
            },
            {
                'id': 'gray',
                'label': this.translate.instant('COLORS.gray')
            },
            {
                'id': 'lime',
                'label': this.translate.instant('COLORS.lime')
            },
            {
                'id': 'green',
                'label': this.translate.instant('COLORS.green')
            },
        ];
    }
    ngOnInit() {
        this._adapter.setLocale(this.localeService.matLang);
        this.serviceSettings.init();
        this.formId = this.route.snapshot.params['id'];
        if (this.formId) {
            this.creationMode = false;
            this.http.get(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/forms/getById/' + this.formId, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
                for (let field in this.form) {
                    if (this.form.hasOwnProperty(field)) {
                        for (let info in data) {
                            if (data.hasOwnProperty(info)) {
                                if (info == field) {
                                    this.form[field].control.value = data[info];
                                }
                            }
                        }
                    }
                }
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
            })).subscribe();
            this.http.get(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/customFields/list', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
                if (data.customFields) {
                    for (let field in data.customFields) {
                        if (data.customFields.hasOwnProperty(field)) {
                            if (data.customFields[field].module == 'verifier') {
                                for (let parent in this.availableFieldsParent) {
                                    if (this.availableFieldsParent[parent].id == 'custom_fields') {
                                        this.availableFieldsParent[parent].values.push({
                                            id: 'custom_' + data.customFields[field].id,
                                            label: data.customFields[field].label,
                                            unit: 'custom',
                                            type: data.customFields[field].type,
                                            required: data.customFields[field].required,
                                            class: "w-1/3",
                                            class_label: "1/33",
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["finalize"])(() => setTimeout(() => { }, 500)), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
            })).subscribe();
            this.http.get(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/forms/getFields/' + this.formId, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
                if (data.form_fields.fields) {
                    if (data.form_fields.fields.facturation !== undefined)
                        this.fields.facturation = data.form_fields.fields.facturation;
                    if (data.form_fields.fields.accounts)
                        this.fields.accounts = data.form_fields.fields.accounts;
                    if (data.form_fields.fields.other)
                        this.fields.other = data.form_fields.fields.other;
                    for (let category in this.fields) {
                        if (this.fields.hasOwnProperty(category)) {
                            this.fields[category].forEach((current_field) => {
                                this.availableFieldsParent.forEach((parent) => {
                                    let cpt = 0;
                                    parent['values'].forEach((child_fields) => {
                                        if (current_field.id == child_fields.id) {
                                            parent['values'].splice(cpt, 1);
                                        }
                                        cpt = cpt + 1;
                                    });
                                });
                            });
                        }
                    }
                }
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["finalize"])(() => setTimeout(() => {
                this.loading = false;
            }, 500)), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
            })).subscribe();
        }
        else {
            this.loading = false;
        }
    }
    dropFromAvailableFields(event) {
        let unit = event.previousContainer.id;
        if (event.previousContainer === event.container) {
            Object(_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["moveItemInArray"])(event.container.data, event.previousIndex, event.currentIndex);
        }
        else {
            Object(_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["transferArrayItem"])(event.previousContainer.data ? event.previousContainer.data : this.fields[unit], event.container.data, event.previousIndex, event.currentIndex);
        }
    }
    changeClass(field_id, new_class, class_label, category) {
        let id = field_id;
        this.fields[category].forEach((element) => {
            if (element.id == id) {
                element.class = new_class;
                element.class_label = class_label;
            }
        });
    }
    changeColor(field_id, new_color, category) {
        let id = field_id;
        this.fields[category].forEach((element) => {
            if (element.id == id) {
                element.color = new_color;
            }
        });
    }
    dropFromForm(event) {
        let unit = event.container.id;
        let previousUnit = event.previousContainer.id;
        if (event.previousContainer === event.container) {
            Object(_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["moveItemInArray"])(event.container.data, event.previousIndex, event.currentIndex);
        }
        else {
            Object(_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["transferArrayItem"])(event.previousContainer.data ? event.previousContainer.data : this.fields[previousUnit], event.container.data ? event.container.data : this.fields[unit], event.previousIndex, event.currentIndex);
        }
    }
    deleteField(event, previousIndex, category, unit) {
        if (unit == 'addresses')
            unit = 'accounts';
        for (let parent_field in this.availableFieldsParent) {
            let id = this.availableFieldsParent[parent_field].id.split('_fields')[0];
            if (id == unit) {
                let currentIndex = this.availableFieldsParent[parent_field]['values'].length;
                Object(_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["transferArrayItem"])(this.fields[category], this.availableFieldsParent[parent_field]['values'], previousIndex, currentIndex);
            }
        }
    }
    storeNewOrder(event, category_id) {
        let tmpCurrentOrder = [];
        event.currentOrder.forEach((element) => {
            this.fields[category_id].forEach((field) => {
                if (element.id == field.id) {
                    tmpCurrentOrder.push(element);
                }
            });
        });
        this.fields[category_id] = tmpCurrentOrder;
    }
    updateForm() {
        let label = this.form.label.control.value;
        let is_default = this.form.default.control.value;
        if (label) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/forms/update/' + this.formId, { 'args': { 'label': label, '"default"': is_default } }, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])(() => {
                this.http.post(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/forms/updateFields/' + this.formId, this.fields, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
                    this.notify.success(this.translate.instant('FORMS.updated'));
                }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
                })).subscribe();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
            })).subscribe();
        }
        else {
            this.notify.error('FORMS.label_mandatory');
        }
    }
    createForm() {
        let label = this.form.label.control.value;
        let is_default = this.form.default.control.value;
        if (label) {
            this.http.post(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/forms/add', { 'args': { 'label': label, '"default"': is_default } }, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
                this.http.post(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/forms/updateFields/' + data.id, this.fields, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
                })).subscribe();
                this.notify.success(this.translate.instant('FORMS.created'));
                this.router.navigateByUrl('settings/verifier/forms').then();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
            })).subscribe();
        }
        else {
            this.notify.error('FORMS.label_mandatory');
        }
    }
}
FormBuilderComponent.ɵfac = function FormBuilderComponent_Factory(t) { return new (t || FormBuilderComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_8__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_8__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_10__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_angular_material_core__WEBPACK_IMPORTED_MODULE_11__["DateAdapter"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_13__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_locale_service__WEBPACK_IMPORTED_MODULE_14__["LocaleService"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_15__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_16__["PrivilegesService"])); };
FormBuilderComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineComponent"]({ type: FormBuilderComponent, selectors: [["app-create"]], decls: 28, vars: 13, consts: [["cdkDropListGroup", "", 1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white", "overflow-hidden"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], [1, "settings_title", "text-center"], ["mat-icon-button", "", 1, "absolute", "right-2", "top-2", 3, "click"], [1, "fas", "fa-stream", "text-2xl"], ["class", "overflow-auto", "style", "height: calc(100% - 64px)", 4, "ngIf"], ["mode", "side", "opened", "", "position", "end", 1, "available-fields", "w-1/4", "flex", "flex-col", "h-full", "border-r", "border-green-400"], ["sidenav2", ""], ["style", "height: calc(100% - 64px)", 4, "ngIf"], [3, "expanded"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"], [1, "overflow-auto", 2, "height", "calc(100% - 64px)"], [1, "flex", "flex-wrap", "justify-center", "items-center", "mx-6"], [1, "w-3/4", "mt-6"], ["matInput", "", "required", "", 3, "formControl"], [1, "w-1/4", "flex", "justify-center", "mt-1"], [3, "formControl"], [4, "ngFor", "ngForOf"], [1, "flex", "justify-center", "items-center"], ["mat-button", "", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300"], ["class", "block", 3, "click", 4, "ngIf"], [1, "relative", "text-xl", "tracking-wider", "pl-1.5", "pr-1.5", "bg-white", 2, "top", "2.5rem", "left", "2.5rem", "width", "130px"], [1, "border-green-400", "border", "rounded-lg", "mx-6", "m-7"], ["cdkDropList", "", 1, "flex", "flex-wrap", "cursor-pointer", "w-full", "my-3", 2, "min-height", "50px", 3, "id", "cdkDropListDropped"], ["class", "test flex items-center px-3 overflow-hidden", "ngSortgridItem", "", 3, "class", "ngSortGridGroup", "ngSortGridItems", "sorted", 4, "ngFor", "ngForOf"], ["ngSortgridItem", "", 1, "test", "flex", "items-center", "px-3", "overflow-hidden", 3, "ngSortGridGroup", "ngSortGridItems", "sorted"], [1, "right-0", "w-full", "form-builder", 3, "matTooltipClass", "matTooltip"], ["cdkDrag", "", 1, "fas", "fa-trash", 3, "matTooltip", "click"], [1, "border-r-2", "border-green-400", "inline-block", "overflow-ellipsis", "overflow-hidden", "whitespace-nowrap", "w-8/12"], ["matInput", "", "type", "text", "readonly", "", 1, "cursor-pointer"], [1, "absolute", "top-0", "-right-4"], ["mat-button", "", "matTooltipPosition", "above", 3, "matMenuTriggerFor", "matTooltip"], [1, "field_settings", "text-md"], ["menu", "matMenu"], ["mat-menu-item", "", 3, "matMenuTriggerFor"], [1, "ml-2"], ["size", "matMenu"], ["mat-menu-item", "", 3, "id", "bg-green-400", "click", 4, "ngFor", "ngForOf"], ["colors", "matMenu"], ["mat-menu-item", "", 3, "id", "style", "text-white", "click", 4, "ngFor", "ngForOf"], ["mat-menu-item", "", 3, "id", "click"], ["matInput", "", "readonly", "", 1, "cursor-pointer"], [1, "right-0", "w-full", "form-builder", 3, "matTooltip"], [1, "text-md"], [1, "block", 3, "click"], [2, "height", "calc(100% - 64px)"], [3, "label", 4, "ngFor", "ngForOf"], [3, "label"], ["cdkDropList", "", 1, "min-w-full", 2, "min-height", "500px", 3, "id", "cdkDropListData", "cdkDropListDropped"], ["cdkDrag", "", 1, "flex", "flex-row", "items-center", "justify-between", "m-5", "cursor-pointer"], [1, "relative", "-top-3"], [1, "relative", "fas", "fa-arrows-alt", "text-xl", "top-0.5", "mr-2", "text-green-400"], [1, "right-0", "w-5/12"], ["matInput", "", "disabled", ""], ["matSuffix", ""]], template: function FormBuilderComponent_Template(rf, ctx) { if (rf & 1) {
        const _r161 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](8, FormBuilderComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](10, FormBuilderComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r161); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](15, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](17, "hr", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](18, "button", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FormBuilderComponent_Template_button_click_18_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r161); const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](22); return _r4.toggle(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](19, "i", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](20, FormBuilderComponent_div_20_Template, 16, 11, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](21, "mat-sidenav", 16, 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](23, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](24);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](25, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](26, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](27, FormBuilderComponent_mat_tab_group_27_Template, 2, 1, "mat-tab-group", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](5, 9, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx.serviceSettings.getTitle());
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", !ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](25, 11, "FORMS.available_fields"));
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", !ctx.loading);
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_17__["MatSidenavContainer"], _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["CdkDropListGroup"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_17__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_18__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_19__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_20__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_17__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_20__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_21__["MatButton"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_22__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_22__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_22__["MatExpansionPanelTitle"], _angular_router__WEBPACK_IMPORTED_MODULE_8__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_23__["LoaderComponent"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_24__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_24__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_25__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["RequiredValidator"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlDirective"], _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_26__["MatSlideToggle"], _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["CdkDropList"], ng_sortgrid__WEBPACK_IMPORTED_MODULE_27__["NgsgItemDirective"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_28__["MatTooltip"], _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["CdkDrag"], _angular_material_menu__WEBPACK_IMPORTED_MODULE_29__["MatMenuTrigger"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_30__["MatIcon"], _angular_material_menu__WEBPACK_IMPORTED_MODULE_29__["MatMenu"], _angular_material_menu__WEBPACK_IMPORTED_MODULE_29__["MatMenuItem"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_31__["MatTabGroup"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_31__["MatTab"], _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_32__["MatDatepickerToggle"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_24__["MatSuffix"], _angular_material_select__WEBPACK_IMPORTED_MODULE_33__["MatSelect"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__["TranslatePipe"]], styles: ["i.cdk-drag[_ngcontent-%COMP%] {\n  position: absolute;\n  font-size: 0.875rem;\n  line-height: 1.25rem;\n  --tw-text-opacity: 1;\n  color: rgba(239, 68, 68, var(--tw-text-opacity));\n  margin-right: 0.5rem;\n  margin-bottom: 0.25rem;\n}\n\n  .form-builder > .mat-form-field-wrapper {\n  padding-bottom: 0.75rem;\n  padding-top: 0.75rem;\n}\n\n  .form-builder > .mat-form-field-wrapper:hover > .mat-form-field-flex > .mat-form-field-infix > i {\n  visibility: visible;\n  opacity: 1;\n}\n\n  .form-builder > .mat-form-field-wrapper:hover > .mat-form-field-flex > .mat-form-field-infix > div > button {\n  visibility: visible;\n  opacity: 1;\n  left: 0px;\n}\n\n  .form-builder > .mat-form-field-wrapper:hover > .mat-form-field-flex > .mat-form-field-infix > .mat-form-field-label-wrapper > .mat-form-field-label > mat-label {\n  padding-left: 1.5rem;\n}\n\n  .form-builder > .mat-form-field-wrapper .mat-form-field-flex {\n  height: 3.5rem;\n}\n\n  .form-builder > .mat-form-field-wrapper .mat-form-field-flex .mat-form-field-infix {\n  width: 100%;\n}\n\n  .form-builder > .mat-form-field-wrapper .mat-form-field-flex .mat-form-field-infix div > button {\n  visibility: hidden;\n  opacity: 0;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n  transition-duration: 500ms;\n  left: 2rem;\n}\n\n  .form-builder > .mat-form-field-wrapper .mat-form-field-flex .mat-form-field-infix div > button .mat-button-focus-overlay {\n  background-color: transparent;\n}\n\n  .form-builder > .mat-form-field-wrapper .mat-form-field-flex .mat-form-field-infix i {\n  visibility: hidden;\n  opacity: 0;\n  left: 0.125rem;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n  transition-duration: 500ms;\n  top: 0.125rem;\n  top: 7px;\n}\n\n  .form-builder > .mat-form-field-wrapper .mat-form-field-flex .mat-form-field-infix .mat-form-field-label-wrapper > .mat-form-field-label > mat-label {\n  margin-left: 0px;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n  transition-duration: 500ms;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Zvcm0tYnVpbGRlci5jb21wb25lbnQuc2NzcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy90YWlsd2luZGNzcy9saWIvbGliL3N1YnN0aXR1dGVDbGFzc0FwcGx5QXRSdWxlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQ0VBLGtCQUFtQjtFQUFuQixtQkFBbUI7RUFBbkIsb0JBQW1CO0VBQW5CLG9CQUFtQjtFQUFuQixnREFBbUI7RUFBbkIsb0JBQW1CO0VBQW5CLHNCQUFtQjtBREluQjs7QUFFQTtFQ05BLHVCQUFtQjtFQUFuQixvQkFBbUI7QURTbkI7O0FBQ0k7RUNWSixtQkFBbUI7RUFBbkIsVUFBbUI7QURhbkI7O0FBRUk7RUNmSixtQkFBbUI7RUFBbkIsVUFBbUI7RUFBbkIsU0FBbUI7QURrQm5COztBQUdJO0VDckJKLG9CQUFtQjtBRHFCbkI7O0FBSUk7RUN6QkosY0FBbUI7QUR3Qm5COztBQUlRO0VDNUJSLFdBQW1CO0FEMkJuQjs7QUFJWTtFQy9CWixrQkFBbUI7RUFBbkIsVUFBbUI7RUFBbkIsd0JBQW1CO0VBQW5CLHdEQUFtQjtFQUFuQiwwQkFBbUI7RUFBbkIsMEJBQW1CO0VBQW5CLFVBQW1CO0FEa0NuQjs7QUFJZ0I7RUN0Q2hCLDZCQUFtQjtBRHFDbkI7O0FBTVk7RUMzQ1osa0JBQW1CO0VBQW5CLFVBQW1CO0VBQW5CLGNBQW1CO0VBQW5CLHdCQUFtQjtFQUFuQix3REFBbUI7RUFBbkIsMEJBQW1CO0VBQW5CLDBCQUFtQjtFQUFuQixhQUFtQjtFRGtESCxRQUFBO0FBSmhCOztBQU9ZO0VDckRaLGdCQUFtQjtFQUFuQix3QkFBbUI7RUFBbkIsd0RBQW1CO0VBQW5CLDBCQUFtQjtFQUFuQiwwQkFBbUI7QURtRG5CIiwiZmlsZSI6ImZvcm0tYnVpbGRlci5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbImkuY2RrLWRyYWcge1xuICAgIEBhcHBseSBhYnNvbHV0ZTtcbiAgICBAYXBwbHkgdGV4dC1zbTtcbiAgICBAYXBwbHkgdGV4dC1yZWQtNTAwO1xuICAgIEBhcHBseSBtci0yO1xuICAgIEBhcHBseSBtYi0xO1xufVxuXG46Om5nLWRlZXAgLmZvcm0tYnVpbGRlciA+IC5tYXQtZm9ybS1maWVsZC13cmFwcGVyIHtcbiAgICBAYXBwbHkgcGItMztcbiAgICBAYXBwbHkgcHQtMztcblxuICAgICY6aG92ZXIgPiAubWF0LWZvcm0tZmllbGQtZmxleCA+IC5tYXQtZm9ybS1maWVsZC1pbmZpeCA+IGkge1xuICAgICAgICBAYXBwbHkgdmlzaWJsZTtcbiAgICAgICAgQGFwcGx5IG9wYWNpdHktMTAwO1xuICAgIH1cblxuICAgICY6aG92ZXIgPiAubWF0LWZvcm0tZmllbGQtZmxleCA+IC5tYXQtZm9ybS1maWVsZC1pbmZpeCA+IGRpdiA+IGJ1dHRvbiB7XG4gICAgICAgIEBhcHBseSB2aXNpYmxlO1xuICAgICAgICBAYXBwbHkgb3BhY2l0eS0xMDA7XG4gICAgICAgIEBhcHBseSBsZWZ0LTA7XG4gICAgfVxuXG4gICAgJjpob3ZlciA+IC5tYXQtZm9ybS1maWVsZC1mbGV4ID4gLm1hdC1mb3JtLWZpZWxkLWluZml4ID4gLm1hdC1mb3JtLWZpZWxkLWxhYmVsLXdyYXBwZXIgPiAubWF0LWZvcm0tZmllbGQtbGFiZWwgPiBtYXQtbGFiZWwge1xuICAgICAgICBAYXBwbHkgcGwtNjtcbiAgICB9XG5cbiAgICAmIC5tYXQtZm9ybS1maWVsZC1mbGV4IHtcbiAgICAgICAgQGFwcGx5IGgtMTQ7XG5cbiAgICAgICAgJiAubWF0LWZvcm0tZmllbGQtaW5maXgge1xuICAgICAgICAgICAgQGFwcGx5IHctZnVsbDtcblxuICAgICAgICAgICAgJiBkaXYgPiBidXR0b24ge1xuICAgICAgICAgICAgICAgIEBhcHBseSBpbnZpc2libGU7XG4gICAgICAgICAgICAgICAgQGFwcGx5IG9wYWNpdHktMDtcbiAgICAgICAgICAgICAgICBAYXBwbHkgdHJhbnNpdGlvbi1hbGw7XG4gICAgICAgICAgICAgICAgQGFwcGx5IGR1cmF0aW9uLTUwMDtcbiAgICAgICAgICAgICAgICBAYXBwbHkgbGVmdC04O1xuXG4gICAgICAgICAgICAgICAgJiAubWF0LWJ1dHRvbi1mb2N1cy1vdmVybGF5e1xuICAgICAgICAgICAgICAgICAgICBAYXBwbHkgYmctdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAmIGkge1xuICAgICAgICAgICAgICAgIEBhcHBseSBpbnZpc2libGU7XG4gICAgICAgICAgICAgICAgQGFwcGx5IG9wYWNpdHktMDtcbiAgICAgICAgICAgICAgICBAYXBwbHkgbGVmdC0wLjU7XG4gICAgICAgICAgICAgICAgQGFwcGx5IHRyYW5zaXRpb24tYWxsO1xuICAgICAgICAgICAgICAgIEBhcHBseSBkdXJhdGlvbi01MDA7XG4gICAgICAgICAgICAgICAgQGFwcGx5IHRvcC0wLjU7XG4gICAgICAgICAgICAgICAgdG9wOiA3cHg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICYgLm1hdC1mb3JtLWZpZWxkLWxhYmVsLXdyYXBwZXIgPiAubWF0LWZvcm0tZmllbGQtbGFiZWwgPiBtYXQtbGFiZWwge1xuICAgICAgICAgICAgICAgIEBhcHBseSBtbC0wO1xuICAgICAgICAgICAgICAgIEBhcHBseSB0cmFuc2l0aW9uLWFsbDtcbiAgICAgICAgICAgICAgICBAYXBwbHkgZHVyYXRpb24tNTAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSIsIkB0YWlsd2luZCBiYXNlO1xuQHRhaWx3aW5kIGNvbXBvbmVudHM7XG5AdGFpbHdpbmQgdXRpbGl0aWVzOyJdfQ== */"] });


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
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _app_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../app/env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _auth_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./auth.service */ "PS2H");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./notifications/notifications.service */ "IspW");









class LocaleService {
    constructor(http, authService, translate, notify) {
        this.http = http;
        this.authService = authService;
        this.translate = translate;
        this.notify = notify;
        this.currentLang = 'fra';
        this.matLang = 'fr-FR';
        this.langs = [];
    }
    changeLocale(data) {
        const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpHeaders"]().set('Authorization', 'Bearer ' + this.authService.getToken());
        this.http.get(_app_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/i18n/changeLanguage/' + data.value, { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
        this.currentLang = data.value;
        this.translate.use(data.value);
    }
    getCurrentLocale() {
        this.http.get(_app_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/i18n/getCurrentLang').pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            this.currentLang = data.lang;
            if (this.currentLang != 'fra') {
                this.matLang = 'en-GB';
            }
            this.translate.use(this.currentLang);
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
    }
    getLocales() {
        const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpHeaders"]().set('Authorization', 'Bearer ' + this.authService.getToken());
        this.http.get(_app_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/i18n/getAllLang', { headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            this.langs = data.langs;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
    }
}
LocaleService.ɵfac = function LocaleService_Factory(t) { return new (t || LocaleService)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_0__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_auth_service__WEBPACK_IMPORTED_MODULE_5__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_6__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_7__["NotificationService"])); };
LocaleService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjectable"]({ token: LocaleService, factory: LocaleService.ɵfac, providedIn: 'root' });


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
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");








class CustomMatPaginatorIntl extends _angular_material_paginator__WEBPACK_IMPORTED_MODULE_0__["MatPaginatorIntl"] {
    constructor(http, notify, translate) {
        super();
        this.http = http;
        this.notify = notify;
        this.translate = translate;
        this.getRangeLabel = (page, pageSize, length) => {
            if (length == 0 || pageSize == 0) {
                return '0 ' + this.translate.instant('PAGINATOR.of') + ` ${length}`;
            }
            length = Math.max(length, 0);
            const startIndex = page * pageSize;
            // If the start index exceeds the list length, do not try and fix the end index to the end.
            const endIndex = startIndex < length ?
                Math.min(startIndex + pageSize, length) :
                startIndex + pageSize;
            const nbPage = Math.ceil(length / pageSize);
            // return `${startIndex + 1} - ${endIndex} / ${length} (${page})`;
            return this.translate.instant('PAGINATOR.display') + ' ' + this.translate.instant('PAGINATOR.of') + ' ' +
                ` ${startIndex + 1} - ${endIndex} ` + this.translate.instant('PAGINATOR.on') + ` ${length} ` + '  |  ' +
                this.translate.instant('PAGINATOR.page') + ` ${page + 1} / ${nbPage}`;
        };
        this.getAndInitTranslations();
    }
    getAndInitTranslations() {
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/i18n/getCurrentLang').pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            this.translate.use(data.lang);
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
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
    }
}
CustomMatPaginatorIntl.ɵfac = function CustomMatPaginatorIntl_Factory(t) { return new (t || CustomMatPaginatorIntl)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_6__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_7__["TranslateService"])); };
CustomMatPaginatorIntl.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjectable"]({ token: CustomMatPaginatorIntl, factory: CustomMatPaginatorIntl.ɵfac });


/***/ }),

/***/ "X5rm":
/*!**************************************************************!*\
  !*** ./src/frontend/app/settings/settings-routing.module.ts ***!
  \**************************************************************/
/*! exports provided: SettingsRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SettingsRoutingModule", function() { return SettingsRoutingModule; });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _settings_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./settings.component */ "QrgV");
/* harmony import */ var _biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @biesbjerg/ngx-translate-extract-marker */ "4u49");
/* harmony import */ var _services_login_required_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../services/login-required.service */ "uepI");
/* harmony import */ var _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../services/has-privilege.service */ "9Fms");
/* harmony import */ var _general_users_list_users_list_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./general/users/list/users-list.component */ "6I7K");
/* harmony import */ var _general_roles_list_roles_list_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./general/roles/list/roles-list.component */ "/zY6");
/* harmony import */ var _general_users_create_create_user_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./general/users/create/create-user.component */ "UYg5");
/* harmony import */ var _general_about_us_about_us_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./general/about-us/about-us.component */ "M+yw");
/* harmony import */ var _general_users_update_update_user_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./general/users/update/update-user.component */ "xVtZ");
/* harmony import */ var _general_roles_create_create_role_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./general/roles/create/create-role.component */ "NQut");
/* harmony import */ var _general_roles_update_update_role_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./general/roles/update/update-role.component */ "VLDq");
/* harmony import */ var _general_version_update_version_update_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./general/version-update/version-update.component */ "3D8z");
/* harmony import */ var _general_custom_fields_custom_fields_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./general/custom-fields/custom-fields.component */ "878q");
/* harmony import */ var _verifier_form_builder_form_builder_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./verifier/form/builder/form-builder.component */ "VzAV");
/* harmony import */ var _verifier_form_list_form_list_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./verifier/form/list/form-list.component */ "c8hn");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/core */ "fXoL");


















const routes = [
    {
        path: 'settings', component: _settings_component__WEBPACK_IMPORTED_MODULE_1__["SettingsComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('GLOBAL.settings'), privileges: ['settings'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_4__["HasPrivilegeService"]]
    },
    // --- General
    // Users
    {
        path: 'settings/general/users', component: _general_users_list_users_list_component__WEBPACK_IMPORTED_MODULE_5__["UsersListComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SETTINGS.users_list'), privileges: ['settings', 'users_list'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_4__["HasPrivilegeService"]]
    },
    {
        path: 'settings/general/users/new', component: _general_users_create_create_user_component__WEBPACK_IMPORTED_MODULE_7__["CreateUserComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SETTINGS.create_user'), privileges: ['settings', 'add_user'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_4__["HasPrivilegeService"]]
    },
    {
        path: 'settings/general/users/update/:id', component: _general_users_update_update_user_component__WEBPACK_IMPORTED_MODULE_9__["UpdateUserComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('USER.update'), privileges: ['settings', 'update_user'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_4__["HasPrivilegeService"]]
    },
    // END Users
    // Roles
    {
        path: 'settings/general/roles', component: _general_roles_list_roles_list_component__WEBPACK_IMPORTED_MODULE_6__["RolesListComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SETTINGS.roles_list'), privileges: ['settings', 'roles_list'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_4__["HasPrivilegeService"]]
    },
    {
        path: 'settings/general/roles/new', component: _general_roles_create_create_role_component__WEBPACK_IMPORTED_MODULE_10__["CreateRoleComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SETTINGS.create_role'), privileges: ['settings', 'add_role'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_4__["HasPrivilegeService"]]
    },
    {
        path: 'settings/general/roles/update/:id', component: _general_roles_update_update_role_component__WEBPACK_IMPORTED_MODULE_11__["UpdateRoleComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('ROLE.update'), privileges: ['settings', 'update_role'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"], _services_has_privilege_service__WEBPACK_IMPORTED_MODULE_4__["HasPrivilegeService"]]
    },
    // END Roles
    {
        path: 'settings/general/about-us', component: _general_about_us_about_us_component__WEBPACK_IMPORTED_MODULE_8__["AboutUsComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SETTINGS.abouts_us') },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"]]
    },
    {
        path: 'settings/general/version-update', component: _general_version_update_version_update_component__WEBPACK_IMPORTED_MODULE_12__["VersionUpdateComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SETTINGS.version_and_update'), privileges: ['settings', 'version_update'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"]]
    },
    {
        path: 'settings/general/custom-fields', component: _general_custom_fields_custom_fields_component__WEBPACK_IMPORTED_MODULE_13__["CustomFieldsComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SETTINGS.custom_fields'), privileges: ['settings', 'custom_fields'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"]]
    },
    // --- END General
    // --- Verifier
    {
        path: 'settings/verifier/forms', component: _verifier_form_list_form_list_component__WEBPACK_IMPORTED_MODULE_15__["FormListComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SETTINGS.list_forms'), privileges: ['settings', 'forms_list'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"]]
    },
    {
        path: 'settings/verifier/forms/builder/new', component: _verifier_form_builder_form_builder_component__WEBPACK_IMPORTED_MODULE_14__["FormBuilderComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SETTINGS.form_builder'), privileges: ['settings', 'form_builder'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"]]
    },
    {
        path: 'settings/verifier/forms/builder/edit/:id', component: _verifier_form_builder_form_builder_component__WEBPACK_IMPORTED_MODULE_14__["FormBuilderComponent"],
        data: { title: Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_2__["marker"])('SETTINGS.form_update'), privileges: ['settings', 'form_builder'] },
        canActivate: [_services_login_required_service__WEBPACK_IMPORTED_MODULE_3__["LoginRequiredService"]]
    },
];
class SettingsRoutingModule {
}
SettingsRoutingModule.ɵfac = function SettingsRoutingModule_Factory(t) { return new (t || SettingsRoutingModule)(); };
SettingsRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_16__["ɵɵdefineNgModule"]({ type: SettingsRoutingModule });
SettingsRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_16__["ɵɵdefineInjector"]({ imports: [[
            _angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"].forRoot(routes, { useHash: true })
        ], _angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_16__["ɵɵsetNgModuleScope"](SettingsRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] }); })();


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
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../services/auth.service */ "PS2H");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../services/user.service */ "N74B");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_locale_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../services/locale.service */ "W2Zi");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../services/privileges.service */ "JdIH");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/card */ "Wp6s");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/select */ "d3UM");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/core */ "FKr1");





















function UserProfileComponent_div_0_span_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 1, "USER.modify_my_profile"));
} }
function UserProfileComponent_div_0_span_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate2"]("", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 2, "USER.modify_profile_of"), " ", ctx_r2.profile["username"], "");
} }
function UserProfileComponent_div_0_ng_container_7_mat_form_field_1_mat_error_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r7.getErrorMessage(field_r4.id));
} }
function UserProfileComponent_div_0_ng_container_7_mat_form_field_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-form-field", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "input", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, UserProfileComponent_div_0_ng_container_7_mat_form_field_1_mat_error_6_Template, 2, 1, "mat-error", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](3, 6, field_r4.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 8, field_r4.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("formControl", field_r4.control)("type", field_r4.type)("required", field_r4.required);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r4.control.invalid);
} }
function UserProfileComponent_div_0_ng_container_7_mat_form_field_2_mat_option_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-option", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const option_r11 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", option_r11["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](option_r11["label"]);
} }
function UserProfileComponent_div_0_ng_container_7_mat_form_field_2_Template(rf, ctx) { if (rf & 1) {
    const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-form-field", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "mat-select", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("valueChange", function UserProfileComponent_div_0_ng_container_7_mat_form_field_2_Template_mat_select_valueChange_4_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r14); const field_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; return field_r4.control.value = $event; });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](5, UserProfileComponent_div_0_ng_container_7_mat_form_field_2_mat_option_5_Template, 2, 2, "mat-option", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](3, 4, field_r4.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("disabled", ctx_r6.userService.getUserFromLocal()["privileges"] != "*")("value", field_r4.control.value);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", field_r4.values);
} }
function UserProfileComponent_div_0_ng_container_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, UserProfileComponent_div_0_ng_container_7_mat_form_field_1_Template, 7, 10, "mat-form-field", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, UserProfileComponent_div_0_ng_container_7_mat_form_field_2_Template, 6, 6, "mat-form-field", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const field_r4 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r4.type != "select");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r4.type == "select");
} }
function UserProfileComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    const _r17 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-card", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "mat-card-title", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](3, UserProfileComponent_div_0_span_3_Template, 3, 3, "span", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](4, UserProfileComponent_div_0_span_4_Template, 3, 4, "span", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "mat-card-content");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](6, "form", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngSubmit", function UserProfileComponent_div_0_Template_form_ngSubmit_6_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r17); const ctx_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r16.onSubmit(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](7, UserProfileComponent_div_0_ng_container_7_Template, 3, 2, "ng-container", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](8, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "button", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](11, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r0.userId == ctx_r0.userService.user.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r0.userId != ctx_r0.userService.user.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r0.profileForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](11, 4, "USER.modify"), " ");
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
        this.headers = this.authService.headers;
        this.roles = [];
        this.profileForm = [
            {
                id: 'firstname',
                label: this.translate.instant('USER.firstname'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true,
            },
            {
                id: 'lastname',
                label: this.translate.instant('USER.lastname'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true
            },
            {
                id: 'old_password',
                label: this.translate.instant('USER.old_password'),
                type: 'password',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: false
            },
            {
                id: 'new_password',
                label: this.translate.instant('USER.new_password'),
                type: 'password',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: false
            },
            {
                id: 'role',
                label: this.translate.instant('HEADER.role'),
                type: 'select',
                values: [],
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: false
            }
        ];
        this.loading = true;
    }
    ngOnInit() {
        this.userId = this.route.snapshot.params['id'];
        if (this.userId != this.userService.user.id) {
            if (!this.privilegeService.hasPrivilege('update_user')) {
                this.notify.error('ERROR.unauthorized');
                this.router.navigateByUrl('/home');
            }
        }
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/list', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
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
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/users/getById/' + this.userId, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            this.profile = data;
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
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
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
            this.profileForm.forEach(element => {
                user[element.id] = element.control.value;
            });
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/users/update/' + this.userId, { 'args': user }, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
                this.notify.success(this.translate.instant('USER.profile_updated'));
                if (this.userId == this.userService.user.id) {
                    this.userService.setUser(data.user);
                    this.authService.setTokenAuth(btoa(JSON.stringify(this.userService.getUser())), data.days_before_exp);
                }
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            })).subscribe();
        }
    }
    getErrorMessage(field) {
        let error = '';
        this.profileForm.forEach(element => {
            if (element.id == field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }
}
UserProfileComponent.ɵfac = function UserProfileComponent_Factory(t) { return new (t || UserProfileComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_7__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_8__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_locale_service__WEBPACK_IMPORTED_MODULE_11__["LocaleService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_12__["PrivilegesService"])); };
UserProfileComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({ type: UserProfileComponent, selectors: [["app-user-profile"]], decls: 1, vars: 1, consts: [["class", "flex justify-center items-center", "style", "height: 85vh", 4, "ngIf"], [1, "flex", "justify-center", "items-center", 2, "height", "85vh"], [1, "text-center", "w-full", "lg:w-1/4"], [1, "mb-10"], [4, "ngIf"], [3, "ngSubmit"], [4, "ngFor", "ngForOf"], [1, "button"], ["type", "submit", "mat-button", "", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300"], ["class", "block", 4, "ngIf"], [1, "block"], ["matInput", "", 3, "formControl", "type", "placeholder", "required"], [3, "disabled", "value", "valueChange"], [3, "value", 4, "ngFor", "ngForOf"], [3, "value"]], template: function UserProfileComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](0, UserProfileComponent_div_0_Template, 12, 6, "div", 0);
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", !ctx.loading);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_13__["NgIf"], _angular_material_card__WEBPACK_IMPORTED_MODULE_14__["MatCard"], _angular_material_card__WEBPACK_IMPORTED_MODULE_14__["MatCardTitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_14__["MatCardContent"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_ba"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgForm"], _angular_common__WEBPACK_IMPORTED_MODULE_13__["NgForOf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_15__["MatButton"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_16__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_16__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_17__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlDirective"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["RequiredValidator"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_16__["MatError"], _angular_material_select__WEBPACK_IMPORTED_MODULE_18__["MatSelect"], _angular_material_core__WEBPACK_IMPORTED_MODULE_19__["MatOption"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwcm9maWxlLmNvbXBvbmVudC5zY3NzIn0= */"] });


/***/ }),

/***/ "c8hn":
/*!*****************************************************************************!*\
  !*** ./src/frontend/app/settings/verifier/form/list/form-list.component.ts ***!
  \*****************************************************************************/
/*! exports provided: FormListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormListComponent", function() { return FormListComponent; });
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../services/confirm-dialog/confirm-dialog.component */ "GI+y");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../../services/user.service */ "N74B");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../../services/auth.service */ "PS2H");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_last_url_service__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../../../services/last-url.service */ "463q");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/table */ "+0xr");
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/sort */ "Dh3D");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ../../../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");





























function FormListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r27 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "button", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function FormListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r27); const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](4).$implicit; const parent_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r25.serviceSettings.changeSetting(setting_r17["id"], parent_r15["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "p", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r23 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r24.router.url.includes(action_r23["route"]))("disable_link", action_r23["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", action_r23["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r23["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 9, action_r23["label"]), " ");
} }
function FormListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, FormListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r23 = ctx.$implicit;
    const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3).$implicit;
    const ctx_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("border-gray-600", !action_r23["showOnlyIfActive"])("border-t", !action_r23["showOnlyIfActive"])("w-full", !action_r23["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", (ctx_r22.privilegesService.hasPrivilege(action_r23["privilege"]) || setting_r17["privilege"] == "*") && (!action_r23["showOnlyIfActive"] || action_r23["showOnlyIfActive"] && ctx_r22.router.url.includes(action_r23["route"])));
} }
function FormListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r33 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-expansion-panel-header", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-panel-title", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "button", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function FormListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r33); const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit; const parent_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r31.serviceSettings.changeSetting(setting_r17["id"], parent_r15["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "p", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, FormListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit;
    const parent_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", ctx_r21.router.url.includes(setting_r17["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r17["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r21.router.url == setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r21.router.url == setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("font-medium", ctx_r21.router.url == setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](7, 13, setting_r17["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r21.serviceSettings.getSettingsAction(parent_r15["id"], setting_r17["id"]));
} }
function FormListComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, FormListComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r18.privilegesService.hasPrivilege(setting_r17["privilege"]) || setting_r17["privilege"] == "*");
} }
function FormListComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r41 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function FormListComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r41); const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit; const parent_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r39 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r39.serviceSettings.changeSetting(setting_r17["id"], parent_r15["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "p", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2).$implicit;
    const ctx_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("text-green-400", ctx_r38.router.url == setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("routerLink", setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r17["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("font-medium", ctx_r38.router.url == setting_r17["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 9, setting_r17["label"]), " ");
} }
function FormListComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](0, FormListComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 41);
} if (rf & 2) {
    const setting_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r20.privilegesService.hasPrivilege(setting_r17["privilege"]) || setting_r17["privilege"] == "*");
} }
function FormListComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, FormListComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, FormListComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 30, _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r17 = ctx.$implicit;
    const _r19 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](3);
    const parent_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r16 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("border-b", ctx_r16.privilegesService.hasPrivilege(setting_r17["privilege"]) || setting_r17["privilege"] == "*")("border-gray-400", ctx_r16.privilegesService.hasPrivilege(setting_r17["privilege"]) || setting_r17["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r16.serviceSettings.getSettingsAction(parent_r15["id"], setting_r17["id"]))("ngIfElse", _r19);
} }
function FormListComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-expansion-panel", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-expansion-panel-header", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](6, FormListComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r15 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r15["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 3, parent_r15["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r15["id"]]);
} }
function FormListComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function FormListComponent_mat_header_cell_20_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "HEADER.id"), " ");
} }
function FormListComponent_mat_cell_21_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r46 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r46.id, " ");
} }
function FormListComponent_mat_header_cell_23_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "HEADER.label"), " ");
} }
function FormListComponent_mat_cell_24_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r47 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", element_r47.label, " ");
} }
function FormListComponent_mat_header_cell_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "FORMS.default"), " ");
} }
function FormListComponent_mat_cell_27_span_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "span", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function FormListComponent_mat_cell_27_span_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "span", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function FormListComponent_mat_cell_27_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, FormListComponent_mat_cell_27_span_1_Template, 3, 0, "span", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, FormListComponent_mat_cell_27_span_2_Template, 3, 0, "span", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r48 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r48.default);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !element_r48.default);
} }
function FormListComponent_mat_header_cell_29_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-header-cell", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](2, 1, "HEADER.status"), " ");
} }
function FormListComponent_mat_cell_30_span_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "span", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 1, "HEADER.active"), "");
} }
function FormListComponent_mat_cell_30_span_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 1, "HEADER.inactive"), "");
} }
function FormListComponent_mat_cell_30_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, FormListComponent_mat_cell_30_span_1_Template, 5, 3, "span", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, FormListComponent_mat_cell_30_span_2_Template, 5, 3, "span", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r51 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r51.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !element_r51.enabled);
} }
function FormListComponent_mat_header_cell_32_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-header-cell");
} }
function FormListComponent_mat_cell_33_button_1_Template(rf, ctx) { if (rf & 1) {
    const _r59 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function FormListComponent_mat_cell_33_button_1_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r59); const element_r54 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r57 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r57.disableConfirmDialog(element_r54.id, element_r54.label); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "i", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](1, 1, "FORMS.disable"));
} }
function FormListComponent_mat_cell_33_button_2_Template(rf, ctx) { if (rf & 1) {
    const _r62 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "button", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function FormListComponent_mat_cell_33_button_2_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r62); const element_r54 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit; const ctx_r60 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r60.enableConfirmDialog(element_r54.id, element_r54.label); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "i", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](1, 1, "FORMS.enable"));
} }
function FormListComponent_mat_cell_33_Template(rf, ctx) { if (rf & 1) {
    const _r64 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, FormListComponent_mat_cell_33_button_1_Template, 3, 3, "button", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, FormListComponent_mat_cell_33_button_2_Template, 3, 3, "button", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "button", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function FormListComponent_mat_cell_33_Template_button_click_3_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r64); const element_r54 = ctx.$implicit; const ctx_r63 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r63.deleteConfirmDialog(element_r54.id, element_r54.label); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](5, "i", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r54 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", element_r54.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !element_r54.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](4, 3, "FORMS.delete"));
} }
function FormListComponent_mat_header_row_34_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-header-row");
} }
function FormListComponent_mat_row_35_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "mat-row", 52);
} if (rf & 2) {
    const row_r65 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpropertyInterpolate1"]("routerLink", "/settings/verifier/forms/builder/edit/", row_r65.id, "");
} }
const _c0 = function () { return [5, 10, 15, 20, 50]; };
class FormListComponent {
    constructor(router, http, dialog, route, userService, formBuilder, authService, translate, notify, serviceSettings, routerExtService, privilegesService, localeStorageService) {
        this.router = router;
        this.http = http;
        this.dialog = dialog;
        this.route = route;
        this.userService = userService;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.translate = translate;
        this.notify = notify;
        this.serviceSettings = serviceSettings;
        this.routerExtService = routerExtService;
        this.privilegesService = privilegesService;
        this.localeStorageService = localeStorageService;
        this.loading = true;
        this.columnsToDisplay = ['id', 'label', 'default', 'enabled', 'actions'];
        this.pageSize = 10;
        this.pageIndex = 0;
        this.total = 0;
        this.offset = 0;
        this.forms = [];
    }
    ngOnInit() {
        this.serviceSettings.init();
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/verifier/forms') || lastUrl == '/') {
            if (this.localeStorageService.get('formsPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('formsPageIndex'));
            this.offset = this.pageSize * (this.pageIndex);
        }
        else
            this.localeStorageService.remove('formsPageIndex');
        this.loadForms();
    }
    onPageChange(event) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.localeStorageService.save('formsPageIndex', event.pageIndex);
        this.loadForms();
    }
    loadForms() {
        this.loading = true;
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/forms/list?limit=' + this.pageSize + '&offset=' + this.offset, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
            this.total = data.forms[0].total;
            this.forms = data.forms;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
        })).subscribe();
    }
    deleteConfirmDialog(form_id, form) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('FORMS.confirm_delete', { "form": form }),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteForm(form_id);
            }
        });
    }
    disableConfirmDialog(form_id, form) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('FORMS.confirm_disable', { "form": form }),
                confirmButton: this.translate.instant('GLOBAL.disable'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.disableForm(form_id);
            }
        });
    }
    enableConfirmDialog(form_id, form) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('FORMS.confirm_enable', { "form": form }),
                confirmButton: this.translate.instant('GLOBAL.enable'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.enableForm(form_id);
            }
        });
    }
    deleteForm(form_id) {
        if (form_id !== undefined) {
            this.http.delete(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/forms/delete/' + form_id, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])(() => {
                this.loadForms();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
            })).subscribe();
        }
    }
    disableForm(form_id) {
        if (form_id !== undefined) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/forms/disable/' + form_id, null, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])(() => {
                this.loadForms();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
            })).subscribe();
        }
    }
    enableForm(forms_id) {
        if (forms_id !== undefined) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/forms/enable/' + forms_id, null, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])(() => {
                this.loadForms();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
            })).subscribe();
        }
    }
    sortData(sort) {
        let data = this.forms.slice();
        if (!sort.active || sort.direction === '') {
            this.forms = data;
            return;
        }
        this.forms = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                case 'default': return this.compare(a.default, b.default, isAsc);
                case 'enabled': return this.compare(a.enabled, b.enabled, isAsc);
                default: return 0;
            }
        });
    }
    compare(a, b, isAsc) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
FormListComponent.ɵfac = function FormListComponent_Factory(t) { return new (t || FormListComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_8__["MatDialog"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_10__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_11__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_13__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_14__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_last_url_service__WEBPACK_IMPORTED_MODULE_15__["LastUrlService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_16__["PrivilegesService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_17__["LocalStorageService"])); };
FormListComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({ type: FormListComponent, selectors: [["app-list"]], features: [_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵProvidersFeature"]([
            { provide: _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__["MAT_FORM_FIELD_DEFAULT_OPTIONS"], useValue: { appearance: 'fill' } },
        ])], decls: 37, vars: 16, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], [1, "settings_title", "text-center"], ["matSort", "", "matSortDisableClear", "", 1, "w-full", 3, "dataSource", "matSortChange"], ["matColumnDef", "id"], ["mat-sort-header", "", 4, "matHeaderCellDef"], [4, "matCellDef"], ["matColumnDef", "label"], ["matColumnDef", "default"], ["matColumnDef", "enabled"], ["matColumnDef", "actions"], [4, "matHeaderCellDef"], [4, "matHeaderRowDef"], ["class", "cursor-pointer hover:text-green-400 hover:shadow-md transition-colors duration-300", 3, "routerLink", 4, "matRowDef", "matRowDefColumns"], ["showFirstLastButtons", "", 3, "length", "pageSize", "pageIndex", "pageSizeOptions", "page"], [3, "expanded"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"], ["mat-sort-header", ""], [1, "text-green-400", "text-6xl", "relative", "top-2", "left-10", "leading-4"], [1, "text-red-600", "text-6xl", "relative", "top-2", "left-10", "leading-4"], [1, "text-green-400", "text-4xl", "relative", "top-2", "leading-4"], [1, "text-red-600", "text-4xl", "relative", "top-2", "leading-4"], ["mat-icon-button", "", "class", "inline-block align-text-top", 3, "matTooltip", "click", 4, "ngIf"], ["mat-icon-button", "", 1, "inline-block", "align-text-top", 3, "matTooltip", "click"], [1, "btn-action-icon", "fas", "fa-trash", "fa-lg"], [1, "btn-action-icon", "fas", "fa-pause", "fa-lg"], [1, "btn-action-icon", "fas", "fa-play", "fa-lg"], [1, "cursor-pointer", "hover:text-green-400", "hover:shadow-md", "transition-colors", "duration-300", 3, "routerLink"]], template: function FormListComponent_Template(rf, ctx) { if (rf & 1) {
        const _r66 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](8, FormListComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](10, FormListComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function FormListComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r66); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](17, "hr", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "mat-table", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("matSortChange", function FormListComponent_Template_mat_table_matSortChange_18_listener($event) { return ctx.sortData($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](19, 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](20, FormListComponent_mat_header_cell_20_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](21, FormListComponent_mat_cell_21_Template, 2, 1, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](22, 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](23, FormListComponent_mat_header_cell_23_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](24, FormListComponent_mat_cell_24_Template, 2, 1, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](25, 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](26, FormListComponent_mat_header_cell_26_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](27, FormListComponent_mat_cell_27_Template, 3, 2, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](28, 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](29, FormListComponent_mat_header_cell_29_Template, 3, 3, "mat-header-cell", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](30, FormListComponent_mat_cell_30_Template, 3, 2, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerStart"](31, 20);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](32, FormListComponent_mat_header_cell_32_Template, 1, 0, "mat-header-cell", 21);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](33, FormListComponent_mat_cell_33_Template, 6, 5, "mat-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](34, FormListComponent_mat_header_row_34_Template, 1, 0, "mat-header-row", 22);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](35, FormListComponent_mat_row_35_Template, 1, 1, "mat-row", 23);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](36, "mat-paginator", 24);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("page", function FormListComponent_Template_mat_paginator_page_36_listener($event) { return ctx.onPageChange($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 13, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx.serviceSettings.getTitle());
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("dataSource", ctx.forms);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](16);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matHeaderRowDef", ctx.columnsToDisplay);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matRowDefColumns", ctx.columnsToDisplay);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("length", ctx.total)("pageSize", ctx.pageSize)("pageIndex", ctx.pageIndex)("pageSizeOptions", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](15, _c0));
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_19__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_20__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_21__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_18__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_21__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_22__["MatButton"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatTable"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_24__["MatSort"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatColumnDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatRowDef"], _angular_material_paginator__WEBPACK_IMPORTED_MODULE_25__["MatPaginator"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_26__["MatExpansionPanelTitle"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_27__["LoaderComponent"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderCell"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_24__["MatSortHeader"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatCell"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_28__["MatTooltip"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatHeaderRow"], _angular_material_table__WEBPACK_IMPORTED_MODULE_23__["MatRow"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_12__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJmb3JtLWxpc3QuY29tcG9uZW50LnNjc3MifQ== */"] });


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
/* harmony import */ var _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/autocomplete */ "/1cH");
/* harmony import */ var _angular_material_badge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/badge */ "TU8p");
/* harmony import */ var _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/bottom-sheet */ "2ChS");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/button-toggle */ "jaxi");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/card */ "Wp6s");
/* harmony import */ var _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/checkbox */ "bSwM");
/* harmony import */ var _angular_material_chips__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/chips */ "A5z7");
/* harmony import */ var _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/datepicker */ "iadO");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/grid-list */ "zkoq");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/icon */ "NFeN");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_material_menu__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/menu */ "STbY");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/progress-bar */ "bv9b");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/progress-spinner */ "Xa2L");
/* harmony import */ var _angular_material_radio__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/radio */ "QibW");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/select */ "d3UM");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/slide-toggle */ "1jcm");
/* harmony import */ var _angular_material_slider__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/slider */ "5RNC");
/* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/material/snack-bar */ "dNgK");
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @angular/material/sort */ "Dh3D");
/* harmony import */ var _angular_material_stepper__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @angular/material/stepper */ "xHqg");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @angular/material/table */ "+0xr");
/* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @angular/material/tabs */ "wZkO");
/* harmony import */ var _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! @angular/material/toolbar */ "/t3+");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");
/* harmony import */ var _angular_material_tree__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! @angular/material/tree */ "8yBR");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! @angular/core */ "fXoL");




































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
AppMaterialModule.ɵfac = function AppMaterialModule_Factory(t) { return new (t || AppMaterialModule)(); };
AppMaterialModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_33__["ɵɵdefineNgModule"]({ type: AppMaterialModule });
AppMaterialModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_33__["ɵɵdefineInjector"]({ providers: [
        { provide: _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MAT_DATE_LOCALE"], useValue: 'fr-FR' },
        { provide: _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MAT_DATE_FORMATS"], useValue: APP_DATE_FORMATS },
    ], imports: [[
            _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_7__["MatCheckboxModule"],
            _angular_material_select__WEBPACK_IMPORTED_MODULE_21__["MatSelectModule"],
            _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_23__["MatSlideToggleModule"],
            _angular_material_input__WEBPACK_IMPORTED_MODULE_14__["MatInputModule"],
            _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_31__["MatTooltipModule"],
            _angular_material_tabs__WEBPACK_IMPORTED_MODULE_29__["MatTabsModule"],
            _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_22__["MatSidenavModule"],
            _angular_material_button__WEBPACK_IMPORTED_MODULE_4__["MatButtonModule"],
            _angular_material_card__WEBPACK_IMPORTED_MODULE_6__["MatCardModule"],
            _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_5__["MatButtonToggleModule"],
            _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_19__["MatProgressSpinnerModule"],
            _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_18__["MatProgressBarModule"],
            _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_30__["MatToolbarModule"],
            _angular_material_menu__WEBPACK_IMPORTED_MODULE_16__["MatMenuModule"],
            _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_12__["MatGridListModule"],
            _angular_material_table__WEBPACK_IMPORTED_MODULE_28__["MatTableModule"],
            _angular_material_paginator__WEBPACK_IMPORTED_MODULE_17__["MatPaginatorModule"],
            _angular_material_sort__WEBPACK_IMPORTED_MODULE_26__["MatSortModule"],
            _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_9__["MatDatepickerModule"],
            _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatNativeDateModule"],
            _angular_material_expansion__WEBPACK_IMPORTED_MODULE_11__["MatExpansionModule"],
            _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_1__["MatAutocompleteModule"],
            _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_25__["MatSnackBarModule"],
            _angular_material_icon__WEBPACK_IMPORTED_MODULE_13__["MatIconModule"],
            _angular_material_dialog__WEBPACK_IMPORTED_MODULE_10__["MatDialogModule"],
            _angular_material_list__WEBPACK_IMPORTED_MODULE_15__["MatListModule"],
            _angular_material_chips__WEBPACK_IMPORTED_MODULE_8__["MatChipsModule"],
            _angular_material_stepper__WEBPACK_IMPORTED_MODULE_27__["MatStepperModule"],
            _angular_material_radio__WEBPACK_IMPORTED_MODULE_20__["MatRadioModule"],
            _angular_material_slider__WEBPACK_IMPORTED_MODULE_24__["MatSliderModule"],
            _angular_material_badge__WEBPACK_IMPORTED_MODULE_2__["MatBadgeModule"],
            _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_3__["MatBottomSheetModule"],
            _angular_material_tree__WEBPACK_IMPORTED_MODULE_32__["MatTreeModule"],
            _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatRippleModule"],
        ], _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_7__["MatCheckboxModule"],
        _angular_material_select__WEBPACK_IMPORTED_MODULE_21__["MatSelectModule"],
        _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_23__["MatSlideToggleModule"],
        _angular_material_input__WEBPACK_IMPORTED_MODULE_14__["MatInputModule"],
        _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_31__["MatTooltipModule"],
        _angular_material_tabs__WEBPACK_IMPORTED_MODULE_29__["MatTabsModule"],
        _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_22__["MatSidenavModule"],
        _angular_material_button__WEBPACK_IMPORTED_MODULE_4__["MatButtonModule"],
        _angular_material_card__WEBPACK_IMPORTED_MODULE_6__["MatCardModule"],
        _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_5__["MatButtonToggleModule"],
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_19__["MatProgressSpinnerModule"],
        _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_18__["MatProgressBarModule"],
        _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_30__["MatToolbarModule"],
        _angular_material_menu__WEBPACK_IMPORTED_MODULE_16__["MatMenuModule"],
        _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_12__["MatGridListModule"],
        _angular_material_table__WEBPACK_IMPORTED_MODULE_28__["MatTableModule"],
        _angular_material_paginator__WEBPACK_IMPORTED_MODULE_17__["MatPaginatorModule"],
        _angular_material_sort__WEBPACK_IMPORTED_MODULE_26__["MatSortModule"],
        _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_9__["MatDatepickerModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatNativeDateModule"],
        _angular_material_expansion__WEBPACK_IMPORTED_MODULE_11__["MatExpansionModule"],
        _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_1__["MatAutocompleteModule"],
        _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_25__["MatSnackBarModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_13__["MatIconModule"],
        _angular_material_dialog__WEBPACK_IMPORTED_MODULE_10__["MatDialogModule"],
        _angular_material_list__WEBPACK_IMPORTED_MODULE_15__["MatListModule"],
        _angular_material_chips__WEBPACK_IMPORTED_MODULE_8__["MatChipsModule"],
        _angular_material_stepper__WEBPACK_IMPORTED_MODULE_27__["MatStepperModule"],
        _angular_material_radio__WEBPACK_IMPORTED_MODULE_20__["MatRadioModule"],
        _angular_material_slider__WEBPACK_IMPORTED_MODULE_24__["MatSliderModule"],
        _angular_material_badge__WEBPACK_IMPORTED_MODULE_2__["MatBadgeModule"],
        _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_3__["MatBottomSheetModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatRippleModule"],
        _angular_material_tree__WEBPACK_IMPORTED_MODULE_32__["MatTreeModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_33__["ɵɵsetNgModuleScope"](AppMaterialModule, { imports: [_angular_material_checkbox__WEBPACK_IMPORTED_MODULE_7__["MatCheckboxModule"],
        _angular_material_select__WEBPACK_IMPORTED_MODULE_21__["MatSelectModule"],
        _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_23__["MatSlideToggleModule"],
        _angular_material_input__WEBPACK_IMPORTED_MODULE_14__["MatInputModule"],
        _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_31__["MatTooltipModule"],
        _angular_material_tabs__WEBPACK_IMPORTED_MODULE_29__["MatTabsModule"],
        _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_22__["MatSidenavModule"],
        _angular_material_button__WEBPACK_IMPORTED_MODULE_4__["MatButtonModule"],
        _angular_material_card__WEBPACK_IMPORTED_MODULE_6__["MatCardModule"],
        _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_5__["MatButtonToggleModule"],
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_19__["MatProgressSpinnerModule"],
        _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_18__["MatProgressBarModule"],
        _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_30__["MatToolbarModule"],
        _angular_material_menu__WEBPACK_IMPORTED_MODULE_16__["MatMenuModule"],
        _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_12__["MatGridListModule"],
        _angular_material_table__WEBPACK_IMPORTED_MODULE_28__["MatTableModule"],
        _angular_material_paginator__WEBPACK_IMPORTED_MODULE_17__["MatPaginatorModule"],
        _angular_material_sort__WEBPACK_IMPORTED_MODULE_26__["MatSortModule"],
        _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_9__["MatDatepickerModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatNativeDateModule"],
        _angular_material_expansion__WEBPACK_IMPORTED_MODULE_11__["MatExpansionModule"],
        _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_1__["MatAutocompleteModule"],
        _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_25__["MatSnackBarModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_13__["MatIconModule"],
        _angular_material_dialog__WEBPACK_IMPORTED_MODULE_10__["MatDialogModule"],
        _angular_material_list__WEBPACK_IMPORTED_MODULE_15__["MatListModule"],
        _angular_material_chips__WEBPACK_IMPORTED_MODULE_8__["MatChipsModule"],
        _angular_material_stepper__WEBPACK_IMPORTED_MODULE_27__["MatStepperModule"],
        _angular_material_radio__WEBPACK_IMPORTED_MODULE_20__["MatRadioModule"],
        _angular_material_slider__WEBPACK_IMPORTED_MODULE_24__["MatSliderModule"],
        _angular_material_badge__WEBPACK_IMPORTED_MODULE_2__["MatBadgeModule"],
        _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_3__["MatBottomSheetModule"],
        _angular_material_tree__WEBPACK_IMPORTED_MODULE_32__["MatTreeModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatRippleModule"]], exports: [_angular_material_checkbox__WEBPACK_IMPORTED_MODULE_7__["MatCheckboxModule"],
        _angular_material_select__WEBPACK_IMPORTED_MODULE_21__["MatSelectModule"],
        _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_23__["MatSlideToggleModule"],
        _angular_material_input__WEBPACK_IMPORTED_MODULE_14__["MatInputModule"],
        _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_31__["MatTooltipModule"],
        _angular_material_tabs__WEBPACK_IMPORTED_MODULE_29__["MatTabsModule"],
        _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_22__["MatSidenavModule"],
        _angular_material_button__WEBPACK_IMPORTED_MODULE_4__["MatButtonModule"],
        _angular_material_card__WEBPACK_IMPORTED_MODULE_6__["MatCardModule"],
        _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_5__["MatButtonToggleModule"],
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_19__["MatProgressSpinnerModule"],
        _angular_material_progress_bar__WEBPACK_IMPORTED_MODULE_18__["MatProgressBarModule"],
        _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_30__["MatToolbarModule"],
        _angular_material_menu__WEBPACK_IMPORTED_MODULE_16__["MatMenuModule"],
        _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_12__["MatGridListModule"],
        _angular_material_table__WEBPACK_IMPORTED_MODULE_28__["MatTableModule"],
        _angular_material_paginator__WEBPACK_IMPORTED_MODULE_17__["MatPaginatorModule"],
        _angular_material_sort__WEBPACK_IMPORTED_MODULE_26__["MatSortModule"],
        _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_9__["MatDatepickerModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatNativeDateModule"],
        _angular_material_expansion__WEBPACK_IMPORTED_MODULE_11__["MatExpansionModule"],
        _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_1__["MatAutocompleteModule"],
        _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_25__["MatSnackBarModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_13__["MatIconModule"],
        _angular_material_dialog__WEBPACK_IMPORTED_MODULE_10__["MatDialogModule"],
        _angular_material_list__WEBPACK_IMPORTED_MODULE_15__["MatListModule"],
        _angular_material_chips__WEBPACK_IMPORTED_MODULE_8__["MatChipsModule"],
        _angular_material_stepper__WEBPACK_IMPORTED_MODULE_27__["MatStepperModule"],
        _angular_material_radio__WEBPACK_IMPORTED_MODULE_20__["MatRadioModule"],
        _angular_material_slider__WEBPACK_IMPORTED_MODULE_24__["MatSliderModule"],
        _angular_material_badge__WEBPACK_IMPORTED_MODULE_2__["MatBadgeModule"],
        _angular_material_bottom_sheet__WEBPACK_IMPORTED_MODULE_3__["MatBottomSheetModule"],
        _angular_material_core__WEBPACK_IMPORTED_MODULE_0__["MatRippleModule"],
        _angular_material_tree__WEBPACK_IMPORTED_MODULE_32__["MatTreeModule"]] }); })();


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
/* harmony import */ var _app_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../app/env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _auth_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./auth.service */ "PS2H");
/* harmony import */ var _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./notifications/notifications.service */ "IspW");







class ConfigService {
    constructor(http, authService, notify) {
        this.http = http;
        this.authService = authService;
        this.notify = notify;
    }
    readConfig() {
        return new Promise((resolve) => {
            this.http.get(_app_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/config/readConfig', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
                this.setConfig(data.text);
                resolve(true);
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                resolve(false);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
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
ConfigService.ɵfac = function ConfigService_Factory(t) { return new (t || ConfigService)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_4__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_auth_service__WEBPACK_IMPORTED_MODULE_5__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_6__["NotificationService"])); };
ConfigService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjectable"]({ token: ConfigService, factory: ConfigService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ "eKNj":
/*!*********************************************************************************!*\
  !*** ./src/frontend/app/accounts/customers/create/create-customer.component.ts ***!
  \*********************************************************************************/
/*! exports provided: CreateCustomerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CreateCustomerComponent", function() { return CreateCustomerComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");

class CreateCustomerComponent {
    constructor() { }
    ngOnInit() {
    }
}
CreateCustomerComponent.ɵfac = function CreateCustomerComponent_Factory(t) { return new (t || CreateCustomerComponent)(); };
CreateCustomerComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: CreateCustomerComponent, selectors: [["app-create"]], decls: 2, vars: 0, template: function CreateCustomerComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "create works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjcmVhdGUtY3VzdG9tZXIuY29tcG9uZW50LnNjc3MifQ== */"] });


/***/ }),

/***/ "eNjB":
/*!***************************************************!*\
  !*** ./src/frontend/services/settings.service.ts ***!
  \***************************************************/
/*! exports provided: SettingsService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SettingsService", function() { return SettingsService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _last_url_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./last-url.service */ "463q");
/* harmony import */ var _local_storage_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./local-storage.service */ "/azQ");





class SettingsService {
    constructor(titleService, translate, routerExtService, localeStorageService) {
        this.titleService = titleService;
        this.translate = translate;
        this.routerExtService = routerExtService;
        this.localeStorageService = localeStorageService;
        this.isMenuOpen = true;
        this.selectedSetting = "users";
        this.selectedParentSetting = "general";
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
                    "route": '/settings/general/users',
                    "privilege": "users_list",
                    "actions": [
                        {
                            "id": 'add_user',
                            "label": this.translate.instant("USER.add"),
                            "route": "/settings/general/users/new",
                            "privilege": "add_user",
                            "icon": "fas fa-plus"
                        },
                        {
                            "id": 'update_user',
                            "label": this.translate.instant("USER.update"),
                            "route": "/settings/general/users/update/",
                            "icon": "fas fa-edit",
                            "privilege": "update_user",
                            "showOnlyIfActive": true
                        }
                    ]
                },
                {
                    "id": "roles",
                    "label": this.translate.instant("SETTINGS.roles_list"),
                    "icon": "fas fa-users",
                    "route": "/settings/general/roles",
                    "privilege": "roles_list",
                    "actions": [
                        {
                            "id": "add_role",
                            "label": this.translate.instant("ROLE.add"),
                            "route": "/settings/general/roles/new",
                            "privilege": "add_role",
                            "icon": "fas fa-plus"
                        },
                        {
                            "id": 'update_role',
                            "label": this.translate.instant("ROLE.update"),
                            "route": "/settings/general/roles/update/",
                            "icon": "fas fa-edit",
                            "privilege": "update_role",
                            "showOnlyIfActive": true
                        }
                    ]
                },
                {
                    "id": "custom-fields",
                    "label": this.translate.instant("SETTINGS.custom_fields"),
                    "route": "/settings/general/custom-fields",
                    "icon": "fas fa-code",
                    "privilege": "custom_fields",
                },
                {
                    "id": "version-update",
                    "label": this.translate.instant("SETTINGS.version_and_update"),
                    "route": "/settings/general/version-update",
                    "icon": "fas fa-sync",
                    "privilege": "update_app",
                },
                {
                    "id": "about-us",
                    "label": this.translate.instant("SETTINGS.abouts_us"),
                    "icon": "fas fa-address-card",
                    "route": "/settings/general/about-us",
                    "privilege": "*"
                }
            ],
            "verifier": [
                {
                    "id": "form_builder",
                    "label": this.translate.instant("SETTINGS.list_forms"),
                    "icon": "fab fa-wpforms",
                    "route": "/settings/verifier/forms",
                    "actions": [
                        {
                            "id": "add_form",
                            "label": this.translate.instant("SETTINGS.form_builder"),
                            "route": "/settings/verifier/forms/builder/new",
                            "privilege": "add_form",
                            "icon": "fas fa-tools"
                        },
                        {
                            "id": "update_form",
                            "label": this.translate.instant("SETTINGS.form_update"),
                            "route": "/settings/verifier/forms/builder/edit/",
                            "privilege": "update_form",
                            "icon": "fas fa-hammer",
                            "showOnlyIfActive": true
                        }
                    ]
                },
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
    init() {
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('roles') || lastUrl == '/' || lastUrl.includes('users')) {
            let selectedSettings = this.localeStorageService.get('selectedSettings');
            let selectedParentSettings = this.localeStorageService.get('selectedParentSettings');
            if (selectedSettings)
                this.setSelectedSettings(selectedSettings);
            if (selectedParentSettings)
                this.setSelectedParentSettings(selectedParentSettings);
        }
        else {
            this.localeStorageService.remove('selectedSettings');
            this.localeStorageService.remove('selectedParentSettings');
            this.setSelectedSettings("users");
            this.setSelectedParentSettings('general');
        }
    }
    getTitle() {
        let title = this.titleService.getTitle();
        title = title.split(' - ')[0];
        return title;
    }
    changeSetting(settingId, settingParentId) {
        this.setSelectedSettings(settingId);
        this.setSelectedParentSettings(settingParentId);
        this.localeStorageService.save('selectedSettings', settingId);
        this.localeStorageService.save('selectedParentSettings', settingParentId);
    }
    getIsMenuOpen() {
        return this.isMenuOpen;
    }
    getSelectedSetting() {
        return this.selectedSetting;
    }
    getSelectedParentSetting() {
        return this.selectedParentSetting;
    }
    getSettingListOpenState() {
        return this.settingListOpenState;
    }
    getSettingsParent() {
        return this.settingsParent;
    }
    getSettings() {
        return this.settings;
    }
    getSettingsAction(parent_id, setting_id) {
        let actions = undefined;
        this.settings[parent_id].forEach((element) => {
            if (element['id'] == setting_id && element['actions']) {
                actions = element['actions'];
            }
        });
        return actions;
    }
    setSelectedSettings(value) {
        this.selectedSetting = value;
    }
    setSelectedParentSettings(value) {
        this.selectedParentSetting = value;
    }
    setSettingListOpenState(value) {
        this.settingListOpenState = value;
    }
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
}
SettingsService.ɵfac = function SettingsService_Factory(t) { return new (t || SettingsService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["Title"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_2__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_last_url_service__WEBPACK_IMPORTED_MODULE_3__["LastUrlService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_local_storage_service__WEBPACK_IMPORTED_MODULE_4__["LocalStorageService"])); };
SettingsService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: SettingsService, factory: SettingsService.ɵfac, providedIn: 'root' });


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


/***/ }),

/***/ "faJs":
/*!*********************************************************************************!*\
  !*** ./src/frontend/app/accounts/suppliers/create/create-supplier.component.ts ***!
  \*********************************************************************************/
/*! exports provided: CreateSupplierComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CreateSupplierComponent", function() { return CreateSupplierComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");

class CreateSupplierComponent {
    constructor() { }
    ngOnInit() {
    }
}
CreateSupplierComponent.ɵfac = function CreateSupplierComponent_Factory(t) { return new (t || CreateSupplierComponent)(); };
CreateSupplierComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: CreateSupplierComponent, selectors: [["app-create"]], decls: 2, vars: 0, template: function CreateSupplierComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "create works!");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjcmVhdGUtc3VwcGxpZXIuY29tcG9uZW50LnNjc3MifQ== */"] });


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
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @biesbjerg/ngx-translate-extract-marker */ "4u49");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../services/auth.service */ "PS2H");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_last_url_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../services/last-url.service */ "463q");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/tabs */ "wZkO");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/select */ "d3UM");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/core */ "FKr1");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/card */ "Wp6s");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");

























function VerifierListComponent_mat_tab_7_mat_option_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-option", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const option_r6 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("value", option_r6["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", option_r6["label"], " ");
} }
function VerifierListComponent_mat_tab_7_div_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} }
function VerifierListComponent_mat_tab_7_div_17_mat_card_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-card", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "img", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "mat-card-header", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "mat-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5, "Nom du fournisseur");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "span", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](8, "i", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "mat-card-subtitle", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](11, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](12, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](14, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](15, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](16, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](18, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](19, "br");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](21, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](22, "mat-card-actions");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](23, "i", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](24, "span", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](26, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const invoice_r8 = ctx.$implicit;
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("routerLink", "/verifier/viewer/" + invoice_r8.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("matTooltip", ctx_r7.translate.instant("VERIFIER.nb_pages") + " : " + invoice_r8.nb_pages);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", invoice_r8.nb_pages, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate2"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](11, 12, "FACTURATION.invoice_number"), " : ", invoice_r8.invoice_number, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate2"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](14, 14, "FACTURATION.invoice_date"), " : ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind2"](15, 16, invoice_r8.invoice_date, "dd-MM-YYYY"), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate2"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](18, 19, "VERIFIER.register_date"), " ", invoice_r8.date, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate2"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](21, 21, "VERIFIER.original_file"), " : ", invoice_r8.original_filename, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](26, 23, "VERIFIER.delete_invoice"));
} }
function VerifierListComponent_mat_tab_7_div_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, VerifierListComponent_mat_tab_7_div_17_mat_card_2_Template, 27, 25, "mat-card", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r5.invoices);
} }
const _c0 = function () { return [4, 8, 16, 24, 48]; };
function VerifierListComponent_mat_tab_7_Template(rf, ctx) { if (rf & 1) {
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-tab", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "mat-form-field", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](6, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "input", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("keyup", function VerifierListComponent_mat_tab_7_Template_input_keyup_7_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r10); const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r9.searchInvoice($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "mat-form-field", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](11, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "mat-select", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("valueChange", function VerifierListComponent_mat_tab_7_Template_mat_select_valueChange_12_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r10); const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r11.currentStatus = $event; })("selectionChange", function VerifierListComponent_mat_tab_7_Template_mat_select_selectionChange_12_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r10); const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r12.changeStatus($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](13, VerifierListComponent_mat_tab_7_mat_option_13_Template, 2, 2, "mat-option", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "mat-paginator", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("page", function VerifierListComponent_mat_tab_7_Template_mat_paginator_page_14_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r10); const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](); return ctx_r13.onPageChange($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](15, "hr", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](16, VerifierListComponent_mat_tab_7_div_16_Template, 2, 0, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](17, VerifierListComponent_mat_tab_7_div_17_Template, 3, 1, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
} if (rf & 2) {
    const batch_r2 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("label", ctx_r1.translate.instant(batch_r2.label))("id", batch_r2.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](6, 12, "VERIFIER.search"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](11, 14, "STATUS.list"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("value", ctx_r1.currentStatus);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx_r1.status);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("length", ctx_r1.total)("pageSize", ctx_r1.pageSize)("pageIndex", ctx_r1.pageIndex)("pageSizeOptions", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](16, _c0));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx_r1.loading);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !ctx_r1.loading);
} }
class VerifierListComponent {
    constructor(http, authService, translate, notify, routerExtService, localeStorageService) {
        this.http = http;
        this.authService = authService;
        this.translate = translate;
        this.notify = notify;
        this.routerExtService = routerExtService;
        this.localeStorageService = localeStorageService;
        this.loading = true;
        this.status = [];
        this.currentStatus = 'NEW';
        this.currentTime = 'today';
        this.batchList = [
            {
                'id': 'today',
                'label': Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_3__["marker"])('BATCH.today'),
            },
            {
                'id': 'yesterday',
                'label': Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_3__["marker"])('BATCH.yesterday'),
            },
            {
                'id': 'older',
                'label': Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_3__["marker"])('BATCH.older'),
            }
        ];
        this.pageSize = 16;
        this.pageIndex = 0;
        this.total = 0;
        this.offset = 0;
        this.selectedTab = 0;
        this.invoices = [];
        this.search = '';
    }
    ngOnInit() {
        Object(_biesbjerg_ngx_translate_extract_marker__WEBPACK_IMPORTED_MODULE_3__["marker"])('VERIFIER.nb_pages'); // Needed to get the translation in the JSON file
        this.localeStorageService.save('splitter_or_verifier', 'verifier');
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('verifier/') && !lastUrl.includes('settings') || lastUrl == '/' || lastUrl == '/upload') {
            if (this.localeStorageService.get('invoicesPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('invoicesPageIndex'));
            if (this.localeStorageService.get('invoicesTimeIndex')) {
                this.selectedTab = parseInt(this.localeStorageService.get('invoicesTimeIndex'));
                this.currentTime = this.batchList[this.selectedTab].id;
            }
            this.offset = this.pageSize * (this.pageIndex);
        }
        else {
            this.localeStorageService.remove('invoicesPageIndex');
            this.localeStorageService.remove('invoicesTimeIndex');
        }
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/status/list', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
            this.status = data.status;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
        })).subscribe();
        this.loadInvoices();
    }
    loadInvoices() {
        this.loading = true;
        this.http.post(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/verifier/invoices/list', { 'status': this.currentStatus, 'time': this.currentTime, 'limit': this.pageSize, 'offset': this.offset, 'search': this.search }, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
            this.total = data.total;
            this.invoices = data.invoices;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
        })).subscribe();
    }
    changeStatus(event) {
        this.currentStatus = event.value;
        this.loadInvoices();
    }
    onTabChange(event) {
        this.selectedTab = event.index;
        this.localeStorageService.save('invoicesTimeIndex', this.selectedTab);
        this.currentTime = this.batchList[this.selectedTab].id;
        this.loadInvoices();
    }
    onPageChange(event) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.localeStorageService.save('invoicesPageIndex', event.pageIndex);
        this.loadInvoices();
    }
    searchInvoice(event) {
        this.search = event.target.value;
        this.loadInvoices();
    }
}
VerifierListComponent.ɵfac = function VerifierListComponent_Factory(t) { return new (t || VerifierListComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_7__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_8__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_9__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_last_url_service__WEBPACK_IMPORTED_MODULE_10__["LastUrlService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_11__["LocalStorageService"])); };
VerifierListComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({ type: VerifierListComponent, selectors: [["app-list"]], features: [_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵProvidersFeature"]([
            { provide: _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__["MAT_FORM_FIELD_DEFAULT_OPTIONS"], useValue: { appearance: 'fill' } },
        ])], decls: 9, vars: 6, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-white", "overflow-hidden"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 2, "z-index", "999", 3, "click"], [1, "fas", "fa-stream", "text-xl"], ["animationDuration", "0ms", 1, "batches", "overflow-auto", 3, "selectedIndex", "selectedTabChange"], [3, "label", "id", 4, "ngFor", "ngForOf"], [1, "content"], [3, "label", "id"], [1, "flex", "flex-col"], [1, "grid", "grid-cols-3", "grid-flow-row", "gap-0", "mt-4", "z-30"], ["appearance", "outline", 1, "left-4", "w-1/2"], ["matInput", "", "type", "text", 3, "keyup"], ["appearance", "outline", 1, "w-1/2", "m-auto"], [3, "value", "valueChange", "selectionChange"], [3, "value", 4, "ngFor", "ngForOf"], [3, "length", "pageSize", "pageIndex", "pageSizeOptions", "page"], [1, "w-1/2", "m-auto", "mb-4", "border-green-400", "relative", "z-30"], [4, "ngIf"], ["class", "content mx-10 mt-3", 4, "ngIf"], [3, "value"], [1, "content", "mx-10", "mt-3"], [1, "list", "grid", "grid-cols-4", "grid-flow-row", "gap-12"], ["class", "cursor-pointer", 3, "routerLink", 4, "ngFor", "ngForOf"], [1, "cursor-pointer", 3, "routerLink"], ["mat-card-image", "", "src", "assets/imgs/thumb.jpg", 1, "p-3.5", "m-auto"], [1, "leading-6"], [1, "absolute", "right-6", "text-green-400", "text-base", "badge", "badge-secondary", "badge-pill", 3, "matTooltip"], [1, "far", "fa-file-alt", "ml-1"], [1, "mt-2", "-mb-1"], [1, "fas", "fa-trash", "cursor-pointer", "text-red-500"], [1, "font-medium", "mat-typography"]], template: function VerifierListComponent_Template(rf, ctx) { if (rf & 1) {
        const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "mat-sidenav-content", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "button", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function VerifierListComponent_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r14); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](2); return _r0.toggle(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](5, "i", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "mat-tab-group", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("selectedTabChange", function VerifierListComponent_Template_mat_tab_group_selectedTabChange_6_listener($event) { return ctx.onTabChange($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](7, VerifierListComponent_mat_tab_7_Template, 18, 17, "mat-tab", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](8, "div", 8);
    } if (rf & 2) {
        const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵreference"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("transform", !_r0.opened)("rotate-180", !_r0.opened);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("selectedIndex", ctx.selectedTab);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngForOf", ctx.batchList);
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_12__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_12__["MatSidenav"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_12__["MatSidenavContent"], _angular_material_button__WEBPACK_IMPORTED_MODULE_13__["MatButton"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_14__["MatTabGroup"], _angular_common__WEBPACK_IMPORTED_MODULE_15__["NgForOf"], _angular_material_tabs__WEBPACK_IMPORTED_MODULE_14__["MatTab"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_4__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_16__["MatInput"], _angular_material_select__WEBPACK_IMPORTED_MODULE_17__["MatSelect"], _angular_material_paginator__WEBPACK_IMPORTED_MODULE_18__["MatPaginator"], _angular_common__WEBPACK_IMPORTED_MODULE_15__["NgIf"], _angular_material_core__WEBPACK_IMPORTED_MODULE_19__["MatOption"], _loader_component__WEBPACK_IMPORTED_MODULE_20__["LoaderComponent"], _angular_material_card__WEBPACK_IMPORTED_MODULE_21__["MatCard"], _angular_router__WEBPACK_IMPORTED_MODULE_22__["RouterLink"], _angular_material_card__WEBPACK_IMPORTED_MODULE_21__["MatCardImage"], _angular_material_card__WEBPACK_IMPORTED_MODULE_21__["MatCardHeader"], _angular_material_card__WEBPACK_IMPORTED_MODULE_21__["MatCardTitle"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_23__["MatTooltip"], _angular_material_card__WEBPACK_IMPORTED_MODULE_21__["MatCardSubtitle"], _angular_material_card__WEBPACK_IMPORTED_MODULE_21__["MatCardActions"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_8__["TranslatePipe"], _angular_common__WEBPACK_IMPORTED_MODULE_15__["DatePipe"]], styles: [".batches .mat-tab-header {\n  z-index: 20;\n}\n\n  .batches .mat-tab-header .mat-tab-label-container > .mat-tab-list > .mat-tab-labels > .mat-tab-label {\n  width: 33.333333%;\n  height: 4rem;\n}\n\n  .batches .mat-tab-body-wrapper > .mat-tab-body > .mat-tab-body-content {\n  height: calc(100vh - 8rem) !important;\n}\n\n  .batches .mat-tab-body-wrapper > .mat-tab-body > .mat-tab-body-content .flex > .content > .list > .mat-card:nth-last-child(-n+4) {\n  margin-bottom: 1.25rem;\n}\n\n  .list > mat-card .mat-card-image {\n  transform: scale(1);\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n  transition-duration: 500ms;\n}\n\n  .list > mat-card .mat-card-header .mat-card-title > span:first-child {\n  position: relative;\n}\n\n  .list > mat-card .mat-card-header .mat-card-title > span:first-child:after {\n  position: absolute;\n  content: \"\";\n  width: 0px;\n  height: 0.125rem;\n  --tw-bg-opacity: 1;\n  background-color: rgba(151, 191, 61, var(--tw-bg-opacity));\n  left: 50%;\n  bottom: -0.125rem;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n  transition-duration: 500ms;\n}\n\n  .list > mat-card:hover .mat-card-image {\n  transform: scale(1.1);\n}\n\n  .list > mat-card:hover .mat-card-header > .mat-card-header-text > .mat-card-title > span:first-child:after {\n  width: 100%;\n  left: 0;\n}\n\n  .list > mat-card:hover mat-card-actions {\n  visibility: visible;\n  opacity: 1;\n}\n\n  .list > mat-card mat-card-actions {\n  margin: 0 16px;\n  visibility: hidden;\n  opacity: 0;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n  transition-duration: 500ms;\n}\n\n  .list > mat-card mat-card-actions i > span {\n  visibility: hidden;\n  opacity: 0;\n  margin-left: -0.5rem;\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n  transition-duration: 500ms;\n}\n\n  .list > mat-card mat-card-actions i:hover > span {\n  visibility: visible;\n  opacity: 1;\n  margin-left: 0.5rem;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpc3QuY29tcG9uZW50LnNjc3MiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdGFpbHdpbmRjc3MvbGliL2xpYi9zdWJzdGl0dXRlQ2xhc3NBcHBseUF0UnVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0k7RUNDSixXQUFtQjtBREFuQjs7QUFDUTtFQ0RSLGlCQUFtQjtFQUFuQixZQUFtQjtBREluQjs7QUFHSTtFQUNJLHFDQUFBO0FBRFI7O0FBR1E7RUNWUixzQkFBbUI7QURVbkI7O0FBT0k7RUFDSSxtQkFBQTtFQ2xCUix3QkFBbUI7RUFBbkIsd0RBQW1CO0VBQW5CLDBCQUFtQjtFQUFuQiwwQkFBbUI7QURnQm5COztBQU9JO0VDdkJKLGtCQUFtQjtBRG1CbkI7O0FBT1E7RUMxQlIsa0JBQW1CO0VENEJQLFdBQUE7RUM1QlosVUFBbUI7RUFBbkIsZ0JBQW1CO0VBQW5CLGtCQUFtQjtFQUFuQiwwREFBbUI7RUFBbkIsU0FBbUI7RUFBbkIsaUJBQW1CO0VBQW5CLHdCQUFtQjtFQUFuQix3REFBbUI7RUFBbkIsMEJBQW1CO0VBQW5CLDBCQUFtQjtBRDhCbkI7O0FBVVE7RUFDSSxxQkFBQTtBQVJaOztBQVdRO0VBQ0ksV0FBQTtFQUNBLE9BQUE7QUFUWjs7QUFZUTtFQ2pEUixtQkFBbUI7RUFBbkIsVUFBbUI7QUR5Q25COztBQWNJO0VBQ0ksY0FBQTtFQ3hEUixrQkFBbUI7RUFBbkIsVUFBbUI7RUFBbkIsd0JBQW1CO0VBQW5CLHdEQUFtQjtFQUFuQiwwQkFBbUI7RUFBbkIsMEJBQW1CO0FEZ0RuQjs7QUFjUTtFQzlEUixrQkFBbUI7RUFBbkIsVUFBbUI7RUFBbkIsb0JBQW1CO0VBQW5CLHdCQUFtQjtFQUFuQix3REFBbUI7RUFBbkIsMEJBQW1CO0VBQW5CLDBCQUFtQjtBRHVEbkI7O0FBZVE7RUN0RVIsbUJBQW1CO0VBQW5CLFVBQW1CO0VBQW5CLG1CQUFtQjtBRDREbkIiLCJmaWxlIjoibGlzdC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIjo6bmctZGVlcCAuYmF0Y2hlcyB7XG4gICAgJiAubWF0LXRhYi1oZWFkZXJ7XG4gICAgICAgIEBhcHBseSB6LTIwO1xuICAgICAgICAmIC5tYXQtdGFiLWxhYmVsLWNvbnRhaW5lciA+IC5tYXQtdGFiLWxpc3QgPiAubWF0LXRhYi1sYWJlbHMgPiAubWF0LXRhYi1sYWJlbCB7XG4gICAgICAgICAgICBAYXBwbHkgdy0xLzM7XG4gICAgICAgICAgICBAYXBwbHkgaC0xNjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICYgLm1hdC10YWItYm9keS13cmFwcGVyID4gLm1hdC10YWItYm9keSA+IC5tYXQtdGFiLWJvZHktY29udGVudCB7XG4gICAgICAgIGhlaWdodDogY2FsYygxMDB2aCAtIDhyZW0pICFpbXBvcnRhbnQ7XG5cbiAgICAgICAgJiAuZmxleCA+IC5jb250ZW50ID4gLmxpc3QgPiAubWF0LWNhcmQ6bnRoLWxhc3QtY2hpbGQoLW4rNCkge1xuICAgICAgICAgICAgQGFwcGx5IG1iLTVcbiAgICAgICAgfVxuICAgIH1cbn1cblxuOjpuZy1kZWVwIC5saXN0ID4gbWF0LWNhcmQge1xuICAgICYgLm1hdC1jYXJkLWltYWdle1xuICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xuICAgICAgICBAYXBwbHkgdHJhbnNpdGlvbi1hbGw7XG4gICAgICAgIEBhcHBseSBkdXJhdGlvbi01MDA7XG4gICAgfVxuXG4gICAgJiAubWF0LWNhcmQtaGVhZGVyIC5tYXQtY2FyZC10aXRsZSA+IHNwYW46Zmlyc3QtY2hpbGQge1xuICAgICAgICBAYXBwbHkgcmVsYXRpdmU7XG5cbiAgICAgICAgJjphZnRlciB7XG4gICAgICAgICAgICBAYXBwbHkgYWJzb2x1dGU7XG4gICAgICAgICAgICBjb250ZW50OiBcIlwiO1xuICAgICAgICAgICAgQGFwcGx5IHctMDtcbiAgICAgICAgICAgIEBhcHBseSBoLTAuNTtcbiAgICAgICAgICAgIEBhcHBseSBiZy1ncmVlbi00MDA7XG4gICAgICAgICAgICBAYXBwbHkgbGVmdC0xLzI7XG4gICAgICAgICAgICBAYXBwbHkgLWJvdHRvbS0wLjU7XG4gICAgICAgICAgICBAYXBwbHkgdHJhbnNpdGlvbi1hbGw7XG4gICAgICAgICAgICBAYXBwbHkgZHVyYXRpb24tNTAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJjpob3ZlciB7XG4gICAgICAgICYgLm1hdC1jYXJkLWltYWdle1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjEpO1xuICAgICAgICB9XG5cbiAgICAgICAgJiAubWF0LWNhcmQtaGVhZGVyID4gLm1hdC1jYXJkLWhlYWRlci10ZXh0ID4gLm1hdC1jYXJkLXRpdGxlID4gc3BhbjpmaXJzdC1jaGlsZDphZnRlcntcbiAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgfVxuXG4gICAgICAgICYgbWF0LWNhcmQtYWN0aW9ucyB7XG4gICAgICAgICAgICBAYXBwbHkgdmlzaWJsZTtcbiAgICAgICAgICAgIEBhcHBseSBvcGFjaXR5LTEwMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICYgbWF0LWNhcmQtYWN0aW9ucyB7XG4gICAgICAgIG1hcmdpbjogMCAxNnB4O1xuICAgICAgICBAYXBwbHkgaW52aXNpYmxlO1xuICAgICAgICBAYXBwbHkgb3BhY2l0eS0wO1xuICAgICAgICBAYXBwbHkgdHJhbnNpdGlvbi1hbGw7XG4gICAgICAgIEBhcHBseSBkdXJhdGlvbi01MDA7XG5cbiAgICAgICAgJiBpID4gc3BhbiB7XG4gICAgICAgICAgICBAYXBwbHkgaW52aXNpYmxlO1xuICAgICAgICAgICAgQGFwcGx5IG9wYWNpdHktMDtcbiAgICAgICAgICAgIEBhcHBseSAtbWwtMjtcbiAgICAgICAgICAgIEBhcHBseSB0cmFuc2l0aW9uLWFsbDtcbiAgICAgICAgICAgIEBhcHBseSBkdXJhdGlvbi01MDA7XG4gICAgICAgIH1cblxuICAgICAgICAmIGk6aG92ZXIgPiBzcGFue1xuICAgICAgICAgICAgQGFwcGx5IHZpc2libGU7XG4gICAgICAgICAgICBAYXBwbHkgb3BhY2l0eS0xMDA7XG4gICAgICAgICAgICBAYXBwbHkgbWwtMjtcbiAgICAgICAgfVxuICAgIH1cblxufSIsIkB0YWlsd2luZCBiYXNlO1xuQHRhaWx3aW5kIGNvbXBvbmVudHM7XG5AdGFpbHdpbmQgdXRpbGl0aWVzOyJdfQ== */"] });


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
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ngx-file-drag-drop */ "Cqmy");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ "fXoL");
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
        this.headers = this.authService.headers;
        this.fileControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"]([], [
            ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_1__["FileValidators"].required,
            ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_1__["FileValidators"].fileExtension(['pdf'])
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
        if (this.fileControl.value.length == 0) {
            this.notify.handleErrors(this.translate.instant('UPLOAD.no_file'));
            return;
        }
        for (let i = 0; i < this.fileControl.value.length; i++) {
            if (this.fileControl.status == 'VALID') {
                formData.append(this.fileControl.value[i].name, this.fileControl.value[i]);
            }
            else {
                this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized'));
                return;
            }
        }
        console.log(formData);
        let splitter_or_verifier = this.localeStorageService.get('splitter_or_verifier');
        if (splitter_or_verifier !== undefined || splitter_or_verifier !== '') {
            this.http.post(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/' + splitter_or_verifier + '/upload', formData, {
                headers: this.authService.headers
            }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((data) => {
                this.notify.success(this.translate.instant('UPLOAD.upload_success'));
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["catchError"])((err) => {
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(false);
            })).subscribe();
        }
        else {
            this.notify.handleErrors(this.translate.instant('ERROR.unknow_error'));
            return;
        }
    }
}
UploadComponent.ɵfac = function UploadComponent_Factory(t) { return new (t || UploadComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_9__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_11__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_12__["LocalStorageService"])); };
UploadComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({ type: UploadComponent, selectors: [["app-upload"]], decls: 6, vars: 13, consts: [[3, "formControl", "activeBorderColor", "multiple", "accept", "displayFileSize", "emptyPlaceholder", "valueChanged"], [1, "flex", "justify-center", "content-center"], ["mat-flat-button", "", 1, "mt-5", "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "px-3", "py-2", "text-sm", "font-medium", "transition", "duration-300", 3, "click"]], template: function UploadComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "ngx-file-drag-drop", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("valueChanged", function UploadComponent_Template_ngx_file_drag_drop_valueChanged_0_listener($event) { return ctx.checkFile($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](1, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "button", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function UploadComponent_Template_button_click_3_listener() { return ctx.uploadFile(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMap"]("max-w-3xl h-56");
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("formControl", ctx.fileControl)("activeBorderColor", "#97BF3D")("multiple", true)("accept", "pdf")("displayFileSize", true)("emptyPlaceholder", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](1, 9, "UPLOAD.placeholder"));
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind1"](5, 11, "UPLOAD.send"), " ");
    } }, directives: [ngx_file_drag_drop__WEBPACK_IMPORTED_MODULE_1__["NgxFileDragDropComponent"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlDirective"], _angular_material_button__WEBPACK_IMPORTED_MODULE_13__["MatButton"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_10__["TranslatePipe"]], styles: [".mat-chip.mat-standard-chip.mat-chip-selected.mat-accent {\n  background-color: #97BF3D !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3VwbG9hZC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLG9DQUFBO0FBQ0oiLCJmaWxlIjoidXBsb2FkLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLm1hdC1jaGlwLm1hdC1zdGFuZGFyZC1jaGlwLm1hdC1jaGlwLXNlbGVjdGVkLm1hdC1hY2NlbnR7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzk3QkYzRCFpbXBvcnRhbnQ7XG59XG4iXX0= */"], encapsulation: 2 });


/***/ }),

/***/ "jj9e":
/*!******************************!*\
  !*** ./src/frontend/main.ts ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "G9b+");



Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["enableProdMode"])();
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"]);


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
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _app_app_material_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../app/app-material.module */ "cCsE");
/* harmony import */ var _notifications_notifications_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./notifications/notifications.service */ "IspW");
/* harmony import */ var _confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./confirm-dialog/confirm-dialog.component */ "GI+y");
/* harmony import */ var _last_url_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./last-url.service */ "463q");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ "fXoL");






class ServicesModule {
}
ServicesModule.ɵfac = function ServicesModule_Factory(t) { return new (t || ServicesModule)(); };
ServicesModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineNgModule"]({ type: ServicesModule });
ServicesModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjector"]({ providers: [_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_2__["NotificationService"], _last_url_service__WEBPACK_IMPORTED_MODULE_4__["LastUrlService"]], imports: [[
            _app_app_material_module__WEBPACK_IMPORTED_MODULE_1__["AppMaterialModule"],
            _angular_common__WEBPACK_IMPORTED_MODULE_0__["CommonModule"]
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵsetNgModuleScope"](ServicesModule, { declarations: [_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_2__["CustomSnackbarComponent"],
        _confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"]], imports: [_app_app_material_module__WEBPACK_IMPORTED_MODULE_1__["AppMaterialModule"],
        _angular_common__WEBPACK_IMPORTED_MODULE_0__["CommonModule"]] }); })();


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
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./env */ "7esm");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_locale_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../services/locale.service */ "W2Zi");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../services/local-storage.service */ "/azQ");
/* harmony import */ var _menu_menu_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./menu/menu.component */ "2jQ4");














function AppComponent_app_menu_0_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "app-menu", 1);
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("image", ctx_r0.image);
} }
class AppComponent {
    constructor(router, location, http, titleService, notify, translate, activatedRoute, localeService, localeStorageService) {
        this.router = router;
        this.location = location;
        this.http = http;
        this.titleService = titleService;
        this.notify = notify;
        this.translate = translate;
        this.activatedRoute = activatedRoute;
        this.localeService = localeService;
        this.localeStorageService = localeStorageService;
        this.title = 'Open-Capture For Invoices';
        this.image = '';
        this.loading = true;
    }
    ngOnInit() {
        const appTitle = this.titleService.getTitle();
        this.router.events.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["filter"])(event => event instanceof _angular_router__WEBPACK_IMPORTED_MODULE_0__["NavigationEnd"]), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["map"])(() => {
            let child = this.activatedRoute.firstChild;
            let child_image = 'assets/imgs/logo_opencapture.png';
            if (child) {
                while (child.firstChild) {
                    child = child.firstChild;
                }
                if (this.router.url != '/home' && !this.router.url.includes('settings')) {
                    let splitter_or_verifier = this.localeStorageService.get('splitter_or_verifier');
                    if (splitter_or_verifier != undefined) {
                        if (splitter_or_verifier == 'splitter') {
                            child_image = 'assets/imgs/logo_splitter.png';
                        }
                        else {
                            child_image = 'assets/imgs/logo_verifier.png';
                        }
                    }
                }
                if (child.snapshot.data['title']) {
                    return [child.snapshot.data['title'], child_image];
                }
            }
            return [appTitle, child_image];
        })).subscribe((data) => {
            let ttl = data[0];
            this.image = data[1];
            if (this.translate.currentLang == undefined) {
                this.http.get(_env__WEBPACK_IMPORTED_MODULE_2__["API_URL"] + '/ws/i18n/getCurrentLang').pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
                    this.translate.use(data.lang);
                    this.translate.get(ttl).subscribe((data) => {
                        this.titleService.setTitle(data + ' - ' + this.title);
                    });
                    this.loading = false;
                }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
                })).subscribe();
            }
            else {
                this.translate.get(ttl).subscribe((data) => {
                    this.titleService.setTitle(data + ' - ' + this.title);
                });
                this.loading = false;
            }
        });
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_0__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_common__WEBPACK_IMPORTED_MODULE_5__["Location"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_platform_browser__WEBPACK_IMPORTED_MODULE_7__["Title"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_8__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_0__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_locale_service__WEBPACK_IMPORTED_MODULE_10__["LocaleService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_11__["LocalStorageService"])); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 2, vars: 1, consts: [[3, "image", 4, "ngIf"], [3, "image"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](0, AppComponent_app_menu_0_Template, 1, 1, "app-menu", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "router-outlet");
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.location.path() !== "/login" && ctx.location.path() !== "/404" && ctx.loading == ctx.loading);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"], _angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterOutlet"], _menu_menu_component__WEBPACK_IMPORTED_MODULE_12__["MenuComponent"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhcHAuY29tcG9uZW50LnNjc3MifQ== */"] });


/***/ }),

/***/ "sUWp":
/*!**********************************************!*\
  !*** ./src/frontend/app/loader.component.ts ***!
  \**********************************************/
/*! exports provided: LoaderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoaderComponent", function() { return LoaderComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");

class LoaderComponent {
    ngOnInit() {
    }
}
LoaderComponent.ɵfac = function LoaderComponent_Factory(t) { return new (t || LoaderComponent)(); };
LoaderComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: LoaderComponent, selectors: [["app-loader"]], decls: 9, vars: 0, consts: [["id", "preloader", 1, "fixed", "inset-0", "bg-white", "z-10"], ["id", "status", 1, "flex", "absolute", "items-center", "justify-center", "w-full", "h-0", "top-1/2"], ["xmlns", "http://www.w3.org/2000/svg", "x", "0px", "y", "0px", "viewBox", "0 0 74.4 81.9", "width", "300", "height", "300", 0, "xml", "space", "preserve"], ["id", "fill", "x1", "0.5", "y1", "1", "x2", "0.5", "y2", "0"], ["offset", "0%", "stop-color", "#76B442"], ["attributeName", "stop-color", "values", "#76B442; #A7A8AA; #76B442", "dur", "1s", "repeatCount", "indefinite"], ["offset", "100%", "stop-color", "#A7A8AA"], ["attributeName", "stop-color", "values", "#A7A8AA; #76B442; #A7A8AA", "dur", "1s", "repeatCount", "indefinite"], ["fill", "url(#fill)", "d", "M1.9,79.4c-1.5-1.5,0.3-4.7,8.2-14.2c4.8-5.7,10.1-12.3,11.9-14.6l3.3-4.1l-1.6-1.7                        c-7.2-7.4-8.6-20.6-3-29.7C27.9,3.4,43.8-1.4,56.8,4.2c6,2.6,11.8,8,14.4,13.5c2.7,5.6,2.5,15.4-0.4,21.1                        c-6.6,13-22.8,18.9-36.3,13.3c-2.2-1-4.1-1.3-4.4-1c-0.3,0.4-5.8,7-12.2,14.8C8.8,76.8,5.7,80,4.3,80C3.3,80,2.1,79.7,1.9,79.4                        L1.9,79.4z M53.5,48.8c5.7-2,10.7-6.3,13.4-11.3c2.8-5.2,2.9-13.8,0.1-18.9c-4.5-8.4-12-12.8-21.9-12.8c-26.3,0-33.2,33.2-9,42.7                        C42.2,50.9,47.3,51,53.5,48.8L53.5,48.8z"]], template: function LoaderComponent_Template(rf, ctx) { if (rf & 1) {
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
    } }, encapsulation: 2 });


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
        if (!this.authService.getToken()) {
            this.translate.get('AUTH.not_connected').subscribe((translated) => {
                this.authService.setCachedUrl(state.url.replace(/^\//g, ''));
                this.notify.error(translated);
                this.authService.logout();
            });
            return false;
        }
        return true;
    }
}
LoginRequiredService.ɵfac = function LoginRequiredService_Factory(t) { return new (t || LoginRequiredService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_auth_service__WEBPACK_IMPORTED_MODULE_1__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_2__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_3__["TranslateService"])); };
LoginRequiredService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: LoginRequiredService, factory: LoginRequiredService.ɵfac, providedIn: 'root' });


/***/ }),

/***/ "wiki":
/*!******************************************************************************!*\
  !*** ./src/frontend/app/accounts/suppliers/list/suppliers-list.component.ts ***!
  \******************************************************************************/
/*! exports provided: SuppliersListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SuppliersListComponent", function() { return SuppliersListComponent; });
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../services/confirm-dialog/confirm-dialog.component */ "GI+y");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/dialog */ "0IaG");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../services/user.service */ "N74B");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../services/auth.service */ "PS2H");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_last_url_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../../services/last-url.service */ "463q");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _services_local_storage_service__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../../services/local-storage.service */ "/azQ");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/table */ "+0xr");
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/sort */ "Dh3D");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/paginator */ "M9IT");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/tooltip */ "Qu3c");

























function SuppliersListComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} }
function SuppliersListComponent_mat_header_cell_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-header-cell", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 1, "HEADER.id"), " ");
} }
function SuppliersListComponent_mat_cell_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r17 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", element_r17.id, " ");
} }
function SuppliersListComponent_mat_header_cell_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-header-cell", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 1, "USER.username"), " ");
} }
function SuppliersListComponent_mat_cell_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r18 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", element_r18.username, " ");
} }
function SuppliersListComponent_mat_header_cell_15_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-header-cell", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 1, "USER.firstname"), " ");
} }
function SuppliersListComponent_mat_cell_16_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r19 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", element_r19.firstname, " ");
} }
function SuppliersListComponent_mat_header_cell_18_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-header-cell", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 1, "USER.lastname"), " ");
} }
function SuppliersListComponent_mat_cell_19_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r20 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", element_r20.lastname, " ");
} }
function SuppliersListComponent_mat_header_cell_21_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-header-cell", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 1, "HEADER.role"), " ");
} }
function SuppliersListComponent_mat_cell_22_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r21 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", element_r21.role_label, " ");
} }
function SuppliersListComponent_mat_header_cell_24_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-header-cell", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](2, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](2, 1, "HEADER.status"), " ");
} }
function SuppliersListComponent_mat_cell_25_span_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 1, "HEADER.active"), "");
} }
function SuppliersListComponent_mat_cell_25_span_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 1, "HEADER.inactive"), "");
} }
function SuppliersListComponent_mat_cell_25_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SuppliersListComponent_mat_cell_25_span_1_Template, 5, 3, "span", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, SuppliersListComponent_mat_cell_25_span_2_Template, 5, 3, "span", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r22 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", element_r22.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", !element_r22.enabled);
} }
function SuppliersListComponent_mat_header_cell_27_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "mat-header-cell");
} }
function SuppliersListComponent_mat_cell_28_button_1_Template(rf, ctx) { if (rf & 1) {
    const _r30 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "button", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function SuppliersListComponent_mat_cell_28_button_1_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r30); const element_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r28.disableConfirmDialog(element_r25.id, element_r25.username); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "i", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](1, 1, "USER.disable"));
} }
function SuppliersListComponent_mat_cell_28_button_2_Template(rf, ctx) { if (rf & 1) {
    const _r33 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "button", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function SuppliersListComponent_mat_cell_28_button_2_Template_button_click_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r33); const element_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r31.enableConfirmDialog(element_r25.id, element_r25.username); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](1, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "i", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](1, 1, "USER.enable"));
} }
function SuppliersListComponent_mat_cell_28_Template(rf, ctx) { if (rf & 1) {
    const _r35 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-cell");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, SuppliersListComponent_mat_cell_28_button_1_Template, 3, 3, "button", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, SuppliersListComponent_mat_cell_28_button_2_Template, 3, 3, "button", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "button", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function SuppliersListComponent_mat_cell_28_Template_button_click_3_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r35); const element_r25 = ctx.$implicit; const ctx_r34 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); $event.stopPropagation(); return ctx_r34.deleteConfirmDialog(element_r25.id, element_r25.username); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](5, "i", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const element_r25 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", element_r25.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", !element_r25.enabled);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("matTooltip", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 3, "GLOBAL.delete"));
} }
function SuppliersListComponent_mat_header_row_29_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "mat-header-row");
} }
function SuppliersListComponent_mat_row_30_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "mat-row", 28);
} if (rf & 2) {
    const row_r36 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate1"]("routerLink", "/settings/general/users/update/", row_r36.id, "");
} }
const _c0 = function () { return [5, 10, 15, 20, 50]; };
class SuppliersListComponent {
    constructor(router, http, dialog, route, userService, formBuilder, authService, translate, notify, serviceSettings, routerExtService, privilegesService, localeStorageService) {
        this.router = router;
        this.http = http;
        this.dialog = dialog;
        this.route = route;
        this.userService = userService;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.translate = translate;
        this.notify = notify;
        this.serviceSettings = serviceSettings;
        this.routerExtService = routerExtService;
        this.privilegesService = privilegesService;
        this.localeStorageService = localeStorageService;
        this.headers = this.authService.headers;
        this.loading = true;
        this.columnsToDisplay = ['id', 'name', 'vat_number', 'siret', 'siren', 'typology', 'actions'];
        this.suppliers = [];
        this.pageSize = 10;
        this.pageIndex = 0;
        this.total = 0;
        this.offset = 0;
    }
    ngOnInit() {
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('accounts/suppliers') || lastUrl == '/') {
            if (this.localeStorageService.get('suppliersPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('suppliersPageIndex'));
            this.offset = this.pageSize * (this.pageIndex);
        }
        else
            this.localeStorageService.remove('suppliersPageIndex');
        this.loadSuppliers();
    }
    loadSuppliers() {
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/accounts/suppliers/list?limit=' + this.pageSize + '&offset=' + this.offset, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])((data) => {
            this.suppliers = data.suppliers;
            if (this.suppliers.length !== 0) {
                console.log(this.suppliers);
                this.total = data.suppliers[0].total;
            }
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
        })).subscribe();
    }
    onPageChange(event) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.localeStorageService.save('suppliersPageIndex', event.pageIndex);
        this.loadSuppliers();
    }
    deleteConfirmDialog(supplier_id, supplier) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('ACCOUNTS.confirm_delete_supplier', { "supplier": supplier }),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteSupplier(supplier_id);
            }
        });
    }
    disableConfirmDialog(supplier_id, supplier) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('ACCOUNTS.confirm_disable_supplier', { "supplier": supplier }),
                confirmButton: this.translate.instant('GLOBAL.disable'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.disableSupplier(supplier_id);
            }
        });
    }
    enableConfirmDialog(supplier_id, supplier) {
        const dialogRef = this.dialog.open(_services_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_3__["ConfirmDialogComponent"], {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('ACCOUNTS.confirm_enable_supplier', { "supplier": supplier }),
                confirmButton: this.translate.instant('GLOBAL.enable'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.enableSupplier(supplier_id);
            }
        });
    }
    deleteSupplier(supplier_id) {
        if (supplier_id !== undefined) {
            this.http.delete(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/accounts/supppliers/delete/' + supplier_id, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])(() => {
                this.loadSuppliers();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
            })).subscribe();
        }
    }
    disableSupplier(supplier_id) {
        if (supplier_id !== undefined) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/accounts/suppplier/disable/' + supplier_id, null, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])(() => {
                this.loadSuppliers();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
            })).subscribe();
        }
    }
    enableSupplier(supplier_id) {
        if (supplier_id !== undefined) {
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_0__["API_URL"] + '/ws/users/enable/' + supplier_id, null, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["tap"])(() => {
                this.loadSuppliers();
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["of"])(false);
            })).subscribe();
        }
    }
    sortData(sort) {
        let data = this.suppliers.slice();
        if (!sort.active || sort.direction === '') {
            this.suppliers = data;
            return;
        }
        this.suppliers = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'name': return this.compare(a.name, b.name, isAsc);
                case 'vat_number': return this.compare(a.vat_number, b.vat_number, isAsc);
                case 'siret': return this.compare(a.siret, b.siret, isAsc);
                case 'siren': return this.compare(a.siren, b.siren, isAsc);
                case 'typology': return this.compare(a.typology, b.typology, isAsc);
                default: return 0;
            }
        });
    }
    compare(a, b, isAsc) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
SuppliersListComponent.ɵfac = function SuppliersListComponent_Factory(t) { return new (t || SuppliersListComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_material_dialog__WEBPACK_IMPORTED_MODULE_7__["MatDialog"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_8__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_9__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_10__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_11__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_12__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_13__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_last_url_service__WEBPACK_IMPORTED_MODULE_14__["LastUrlService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_15__["PrivilegesService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_local_storage_service__WEBPACK_IMPORTED_MODULE_16__["LocalStorageService"])); };
SuppliersListComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({ type: SuppliersListComponent, selectors: [["app-list"]], decls: 32, vars: 10, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], [1, "text-center"], [1, "border-green-400"], ["matSort", "", 1, "w-full", 3, "dataSource", "matSortChange"], ["matColumnDef", "id"], ["mat-sort-header", "", 4, "matHeaderCellDef"], [4, "matCellDef"], ["matColumnDef", "name"], ["matColumnDef", "vat_number"], ["matColumnDef", "siret"], ["matColumnDef", "siren"], ["matColumnDef", "typology"], ["matColumnDef", "actions"], [4, "matHeaderCellDef"], [4, "matHeaderRowDef"], ["class", "cursor-pointer hover:text-green-400 hover:shadow-md transition-colors duration-300", 3, "routerLink", 4, "matRowDef", "matRowDefColumns"], ["showFirstLastButtons", "", 3, "length", "pageSize", "pageIndex", "pageSizeOptions", "page"], ["mat-sort-header", ""], [1, "text-green-400", "text-4xl", "relative", "top-2", "leading-4"], [1, "text-red-600", "text-4xl", "relative", "top-2", "leading-4"], ["mat-icon-button", "", "class", "inline-block align-text-top", 3, "matTooltip", "click", 4, "ngIf"], ["mat-icon-button", "", 1, "inline-block", "align-text-top", 3, "matTooltip", "click"], [1, "btn-action-icon", "fas", "fa-trash", "fa-lg"], [1, "btn-action-icon", "fas", "fa-pause", "fa-lg"], [1, "btn-action-icon", "fas", "fa-play", "fa-lg"], [1, "cursor-pointer", "hover:text-green-400", "hover:shadow-md", "transition-colors", "duration-300", 3, "routerLink"]], template: function SuppliersListComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-sidenav-content", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, SuppliersListComponent_div_2_Template, 2, 0, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "h3", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](6, "hr", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "mat-table", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("matSortChange", function SuppliersListComponent_Template_mat_table_matSortChange_7_listener($event) { return ctx.sortData($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](8, 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](9, SuppliersListComponent_mat_header_cell_9_Template, 3, 3, "mat-header-cell", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](10, SuppliersListComponent_mat_cell_10_Template, 2, 1, "mat-cell", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](11, 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](12, SuppliersListComponent_mat_header_cell_12_Template, 3, 3, "mat-header-cell", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](13, SuppliersListComponent_mat_cell_13_Template, 2, 1, "mat-cell", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](14, 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](15, SuppliersListComponent_mat_header_cell_15_Template, 3, 3, "mat-header-cell", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](16, SuppliersListComponent_mat_cell_16_Template, 2, 1, "mat-cell", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](17, 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](18, SuppliersListComponent_mat_header_cell_18_Template, 3, 3, "mat-header-cell", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](19, SuppliersListComponent_mat_cell_19_Template, 2, 1, "mat-cell", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](20, 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](21, SuppliersListComponent_mat_header_cell_21_Template, 3, 3, "mat-header-cell", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](22, SuppliersListComponent_mat_cell_22_Template, 2, 1, "mat-cell", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](23, 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](24, SuppliersListComponent_mat_header_cell_24_Template, 3, 3, "mat-header-cell", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](25, SuppliersListComponent_mat_cell_25_Template, 3, 2, "mat-cell", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](26, 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](27, SuppliersListComponent_mat_header_cell_27_Template, 1, 0, "mat-header-cell", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](28, SuppliersListComponent_mat_cell_28_Template, 6, 5, "mat-cell", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](29, SuppliersListComponent_mat_header_row_29_Template, 1, 0, "mat-header-row", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](30, SuppliersListComponent_mat_row_30_Template, 1, 1, "mat-row", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](31, "mat-paginator", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("page", function SuppliersListComponent_Template_mat_paginator_page_31_listener($event) { return ctx.onPageChange($event); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx.serviceSettings.getTitle());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("dataSource", ctx.suppliers);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](22);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("matHeaderRowDef", ctx.columnsToDisplay);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("matRowDefColumns", ctx.columnsToDisplay);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("length", ctx.total)("pageSize", ctx.pageSize)("pageIndex", ctx.pageIndex)("pageSizeOptions", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpureFunction0"](9, _c0));
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_17__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_17__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_18__["NgIf"], _angular_material_table__WEBPACK_IMPORTED_MODULE_19__["MatTable"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_20__["MatSort"], _angular_material_table__WEBPACK_IMPORTED_MODULE_19__["MatColumnDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_19__["MatHeaderCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_19__["MatCellDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_19__["MatHeaderRowDef"], _angular_material_table__WEBPACK_IMPORTED_MODULE_19__["MatRowDef"], _angular_material_paginator__WEBPACK_IMPORTED_MODULE_21__["MatPaginator"], _loader_component__WEBPACK_IMPORTED_MODULE_22__["LoaderComponent"], _angular_material_table__WEBPACK_IMPORTED_MODULE_19__["MatHeaderCell"], _angular_material_sort__WEBPACK_IMPORTED_MODULE_20__["MatSortHeader"], _angular_material_table__WEBPACK_IMPORTED_MODULE_19__["MatCell"], _angular_material_button__WEBPACK_IMPORTED_MODULE_23__["MatButton"], _angular_material_tooltip__WEBPACK_IMPORTED_MODULE_24__["MatTooltip"], _angular_material_table__WEBPACK_IMPORTED_MODULE_19__["MatHeaderRow"], _angular_material_table__WEBPACK_IMPORTED_MODULE_19__["MatRow"], _angular_router__WEBPACK_IMPORTED_MODULE_5__["RouterLink"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_11__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzdXBwbGllcnMtbGlzdC5jb21wb25lbnQuc2NzcyJ9 */"] });


/***/ }),

/***/ "xVtZ":
/*!*********************************************************************************!*\
  !*** ./src/frontend/app/settings/general/users/update/update-user.component.ts ***!
  \*********************************************************************************/
/*! exports provided: UpdateUserComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UpdateUserComponent", function() { return UpdateUserComponent; });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/forms */ "3Pt+");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../env */ "7esm");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../../services/user.service */ "N74B");
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../../services/auth.service */ "PS2H");
/* harmony import */ var _ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ngx-translate/core */ "sYmb");
/* harmony import */ var _services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../../services/notifications/notifications.service */ "IspW");
/* harmony import */ var _services_settings_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../../services/settings.service */ "eNjB");
/* harmony import */ var _services_privileges_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../../services/privileges.service */ "JdIH");
/* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/sidenav */ "XhcP");
/* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/divider */ "f0Cb");
/* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/list */ "MutI");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/button */ "bTqV");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/expansion */ "7EHt");
/* harmony import */ var _loader_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../../loader.component */ "sUWp");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/form-field */ "kmnG");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/input */ "qFsG");
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/select */ "d3UM");
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/core */ "FKr1");

























function UpdateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r17 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function UpdateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r17); const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](4).$implicit; const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r15.serviceSettings.changeSetting(setting_r7["id"], parent_r5["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "p", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r14.router.url.includes(action_r13["route"]))("disable_link", action_r13["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", action_r13["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute text-lg w-10 h-10 rounded-full flex items-center justify-center ", action_r13["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 9, action_r13["label"]), " ");
} }
function UpdateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, UpdateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_div_1_Template, 6, 11, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const action_r13 = ctx.$implicit;
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3).$implicit;
    const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("border-gray-600", !action_r13["showOnlyIfActive"])("border-t", !action_r13["showOnlyIfActive"])("w-full", !action_r13["showOnlyIfActive"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", (ctx_r12.privilegesService.hasPrivilege(action_r13["privilege"]) || setting_r7["privilege"] == "*") && (!action_r13["showOnlyIfActive"] || action_r13["showOnlyIfActive"] && ctx_r12.router.url.includes(action_r13["route"])));
} }
function UpdateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template(rf, ctx) { if (rf & 1) {
    const _r23 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-expansion-panel", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-expansion-panel-header", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "mat-panel-title", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](3, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "button", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function UpdateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template_button_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r23); const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit; const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r21.serviceSettings.changeSetting(setting_r7["id"], parent_r5["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "p", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](7, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](8, UpdateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_div_8_Template, 2, 7, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("expanded", ctx_r11.router.url.includes(setting_r7["route"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute text-lg left-4 w-10 h-10 rounded-full flex items-center justify-center ", setting_r7["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r11.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r11.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("font-medium", ctx_r11.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](7, 13, setting_r7["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r11.serviceSettings.getSettingsAction(parent_r5["id"], setting_r7["id"]));
} }
function UpdateUserComponent_mat_expansion_panel_8_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, UpdateUserComponent_mat_expansion_panel_8_div_6_div_1_mat_expansion_panel_1_Template, 9, 15, "mat-expansion-panel", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r8.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*");
} }
function UpdateUserComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r31 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "button", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function UpdateUserComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r31); const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit; const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; const ctx_r29 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](); return ctx_r29.serviceSettings.changeSetting(setting_r7["id"], parent_r5["id"]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "i");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "p", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("text-green-400", ctx_r28.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("routerLink", setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMapInterpolate1"]("absolute left-4 w-10 h-10 rounded-full flex items-center justify-center fa-lg ", setting_r7["icon"], "");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("font-medium", ctx_r28.router.url == setting_r7["route"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 9, setting_r7["label"]), " ");
} }
function UpdateUserComponent_mat_expansion_panel_8_div_6_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](0, UpdateUserComponent_mat_expansion_panel_8_div_6_ng_template_2_button_0_Template, 5, 11, "button", 34);
} if (rf & 2) {
    const setting_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r10.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*");
} }
function UpdateUserComponent_mat_expansion_panel_8_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, UpdateUserComponent_mat_expansion_panel_8_div_6_div_1_Template, 2, 1, "div", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, UpdateUserComponent_mat_expansion_panel_8_div_6_ng_template_2_Template, 1, 1, "ng-template", null, 23, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplateRefExtractor"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const setting_r7 = ctx.$implicit;
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵreference"](3);
    const parent_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("border-b", ctx_r6.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*")("border-gray-400", ctx_r6.privilegesService.hasPrivilege(setting_r7["privilege"]) || setting_r7["privilege"] == "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx_r6.serviceSettings.getSettingsAction(parent_r5["id"], setting_r7["id"]))("ngIfElse", _r9);
} }
function UpdateUserComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-expansion-panel", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-expansion-panel-header", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](4, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, UpdateUserComponent_mat_expansion_panel_8_div_6_Template, 4, 6, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const parent_r5 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("expanded", ctx_r1.router.url.includes(parent_r5["id"]));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](4, 3, parent_r5["label"]), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx_r1.serviceSettings.getSettings()[parent_r5["id"]]);
} }
function UpdateUserComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "app-loader");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} }
function UpdateUserComponent_div_14_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](5, "hr", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate3"]("", ctx_r3.serviceSettings.getTitle(), " : ", ctx_r3.user["firstname"], " ", ctx_r3.user["lastname"], " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("(", ctx_r3.user["username"], ")");
} }
function UpdateUserComponent_ng_container_17_mat_form_field_1_mat_error_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r39 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r39.getErrorMessage(field_r36.id));
} }
function UpdateUserComponent_ng_container_17_mat_form_field_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-form-field", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](4, "input", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, UpdateUserComponent_ng_container_17_mat_form_field_1_mat_error_6_Template, 2, 1, "mat-error", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](3, 7, field_r36.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpropertyInterpolate"]("placeholder", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 9, field_r36.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("readonly", field_r36.id == "username")("formControl", field_r36.control)("type", field_r36.type)("required", field_r36.required);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r36.control.invalid);
} }
function UpdateUserComponent_ng_container_17_mat_form_field_2_mat_option_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-option", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const option_r44 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", option_r44["id"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](option_r44["label"]);
} }
function UpdateUserComponent_ng_container_17_mat_form_field_2_mat_error_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r43.getErrorMessage(field_r36.id));
} }
function UpdateUserComponent_ng_container_17_mat_form_field_2_Template(rf, ctx) { if (rf & 1) {
    const _r48 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-form-field", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](3, "translate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "mat-select", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("valueChange", function UpdateUserComponent_ng_container_17_mat_form_field_2_Template_mat_select_valueChange_4_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r48); const field_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit; return field_r36.control.value = $event; });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](5, UpdateUserComponent_ng_container_17_mat_form_field_2_mat_option_5_Template, 2, 2, "mat-option", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](6, UpdateUserComponent_ng_container_17_mat_form_field_2_mat_error_6_Template, 2, 1, "mat-error", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
} if (rf & 2) {
    const field_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](3, 6, field_r36.label));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("formControl", field_r36.control)("value", field_r36.control.value)("required", field_r36.required);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", field_r36.values);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r36.control.invalid);
} }
function UpdateUserComponent_ng_container_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, UpdateUserComponent_ng_container_17_mat_form_field_1_Template, 7, 11, "mat-form-field", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](2, UpdateUserComponent_ng_container_17_mat_form_field_2_Template, 7, 8, "mat-form-field", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const field_r36 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r36.type != "select");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", field_r36.type == "select");
} }
class UpdateUserComponent {
    constructor(router, http, route, userService, formBuilder, authService, translate, notify, serviceSettings, privilegesService) {
        this.router = router;
        this.http = http;
        this.route = route;
        this.userService = userService;
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.translate = translate;
        this.notify = notify;
        this.serviceSettings = serviceSettings;
        this.privilegesService = privilegesService;
        this.headers = this.authService.headers;
        this.loading = true;
        this.roles = [];
        this.userForm = [
            {
                id: 'username',
                label: this.translate.instant('USER.username'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true,
            },
            {
                id: 'firstname',
                label: this.translate.instant('USER.firstname'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true,
            },
            {
                id: 'lastname',
                label: this.translate.instant('USER.lastname'),
                type: 'text',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true
            },
            {
                id: 'password',
                label: this.translate.instant('USER.password'),
                type: 'password',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: false
            },
            {
                id: 'password_check',
                label: this.translate.instant('USER.password_check'),
                type: 'password',
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: false
            },
            {
                id: 'role',
                label: this.translate.instant('HEADER.role'),
                type: 'select',
                values: [],
                control: new _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControl"](),
                required: true
            }
        ];
    }
    ngOnInit() {
        this.serviceSettings.init();
        this.userId = this.route.snapshot.params['id'];
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/roles/list', { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
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
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
        this.http.get(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/users/getById/' + this.userId, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])((data) => {
            this.user = data;
            for (let field in data) {
                if (data.hasOwnProperty(field)) {
                    this.userForm.forEach(element => {
                        if (element.id == field) {
                            element.control.setValue(data[field]);
                            if (element.id == 'role') {
                                element.values = this.roles;
                            }
                        }
                    });
                }
            }
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["finalize"])(() => this.loading = false), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
            console.debug(err);
            this.notify.handleErrors(err);
            return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
        })).subscribe();
    }
    isValidForm() {
        let state = true;
        this.userForm.forEach(element => {
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
            this.userForm.forEach(element => {
                user[element.id] = element.control.value;
            });
            this.http.put(_env__WEBPACK_IMPORTED_MODULE_1__["API_URL"] + '/ws/users/update/' + this.userId, { 'args': user }, { headers: this.authService.headers }).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])(() => {
                this.notify.success(this.translate.instant('USER.updated'));
                this.router.navigate(['/settings/general/users/']);
            }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])((err) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/users/');
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["of"])(false);
            })).subscribe();
        }
    }
    getErrorMessage(field) {
        let error = undefined;
        this.userForm.forEach(element => {
            if (element.id == field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }
}
UpdateUserComponent.ɵfac = function UpdateUserComponent_Factory(t) { return new (t || UpdateUserComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_7__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormBuilder"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_8__["AuthService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslateService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_notifications_notifications_service__WEBPACK_IMPORTED_MODULE_10__["NotificationService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_settings_service__WEBPACK_IMPORTED_MODULE_11__["SettingsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_privileges_service__WEBPACK_IMPORTED_MODULE_12__["PrivilegesService"])); };
UpdateUserComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({ type: UpdateUserComponent, selectors: [["app-update"]], decls: 22, vars: 12, consts: [[1, "absolute", "left-0", "right-0", "bottom-0", 2, "top", "4.1rem"], ["mode", "side", "opened", "", 1, "w-1/6", "flex", "flex-col", "h-full", "border-r", "border-green-400", 2, "top", "0.1rem"], ["sidenav", ""], [1, "bg-green-400", "bg-opacity-60", "text-center", "text-gray-900", "m-0", "pb-4", 2, "padding-top", "0.9rem"], [1, "border-green-400"], [1, "pt-0"], [3, "expanded", 4, "ngFor", "ngForOf"], [1, "bg-white"], [4, "ngIf"], [1, "settings_header"], ["mat-icon-button", "", 1, "absolute", "left-2", "top-2", 3, "click"], [1, "fas", "fa-arrow-left", "text-2xl"], ["class", "settings_title text-center", 4, "ngIf"], [1, "flex", "justify-center", "items-center", "align-middle"], [1, "grid", "grid-cols-3", "gap-6", "w-full", "m-10", "text-center", 3, "ngSubmit"], [4, "ngFor", "ngForOf"], [1, "button", "col-span-3"], ["type", "submit", "mat-button", "", 1, "border-solid", "border-green-400", "border", "hover:bg-green-400", "hover:text-white", "transition", "duration-300"], [3, "expanded"], [1, "border-t", "border-green-400", "z-30", 2, "box-shadow", "0 1px 5px 4px gray"], [1, "w-full", "border-t-2", "border-gray-600"], [3, "border-b", "border-gray-400", 4, "ngFor", "ngForOf"], [4, "ngIf", "ngIfElse"], ["noActions", ""], [3, "expanded", 4, "ngIf"], [1, "font-normal", "w-full", "h-20"], [1, "font-normal", "justify-center", "items-center", "text-center"], ["mat-button", "", 1, "font-normal", "w-full", "h-20", "flex", "justify-center", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0"], [3, "border-gray-600", "border-t", "w-full", 4, "ngFor", "ngForOf"], ["class", "border-b border-gray-400", 4, "ngIf"], [1, "border-b", "border-gray-400"], ["mat-button", "", 1, "font-normal", "w-full", "h-12", "ml-12", "flex", "items-center", "text-center", 3, "routerLink", "click"], [1, "m-0", "ml-12", 2, "margin-top", "2.5px!important"], ["mat-button", "", "class", "font-normal w-full h-20 flex justify-center items-center text-center", 3, "text-green-400", "routerLink", "click", 4, "ngIf"], [1, "settings_title", "text-center"], ["class", "block", 4, "ngIf"], [1, "block"], ["matInput", "", 3, "readonly", "formControl", "type", "placeholder", "required"], [3, "formControl", "value", "required", "valueChange"], [3, "value", 4, "ngFor", "ngForOf"], [3, "value"]], template: function UpdateUserComponent_Template(rf, ctx) { if (rf & 1) {
        const _r50 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "mat-sidenav-container", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "mat-sidenav", 1, 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "h3", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](5, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](6, "mat-divider", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "mat-nav-list", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](8, UpdateUserComponent_mat_expansion_panel_8_Template, 7, 5, "mat-expansion-panel", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "mat-sidenav-content", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](10, UpdateUserComponent_div_10_Template, 2, 0, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](12, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function UpdateUserComponent_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r50); const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵreference"](2); _r0.toggle(); return ctx.serviceSettings.toggleMenu(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](13, "i", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](14, UpdateUserComponent_div_14_Template, 6, 4, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](15, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](16, "form", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("ngSubmit", function UpdateUserComponent_Template_form_ngSubmit_16_listener() { return ctx.onSubmit(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](17, UpdateUserComponent_ng_container_17_Template, 3, 2, "ng-container", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](18, "div", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "button", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](20);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](21, "translate");
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](5, 8, "SETTINGS.administration"));
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.serviceSettings.getSettingsParent());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.loading);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("fa-arrow-right", !ctx.serviceSettings.getIsMenuOpen());
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngIf", ctx.user);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngForOf", ctx.userForm);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind1"](21, 10, "USER.update"), " ");
    } }, directives: [_angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenavContainer"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenav"], _angular_material_divider__WEBPACK_IMPORTED_MODULE_14__["MatDivider"], _angular_material_list__WEBPACK_IMPORTED_MODULE_15__["MatNavList"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgForOf"], _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_13__["MatSidenavContent"], _angular_common__WEBPACK_IMPORTED_MODULE_16__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_17__["MatButton"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["ɵangular_packages_forms_forms_ba"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatusGroup"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgForm"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_18__["MatExpansionPanelTitle"], _angular_router__WEBPACK_IMPORTED_MODULE_5__["RouterLink"], _loader_component__WEBPACK_IMPORTED_MODULE_19__["LoaderComponent"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_21__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["FormControlDirective"], _angular_forms__WEBPACK_IMPORTED_MODULE_0__["RequiredValidator"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_20__["MatError"], _angular_material_select__WEBPACK_IMPORTED_MODULE_22__["MatSelect"], _angular_material_core__WEBPACK_IMPORTED_MODULE_23__["MatOption"]], pipes: [_ngx_translate_core__WEBPACK_IMPORTED_MODULE_9__["TranslatePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ1cGRhdGUtdXNlci5jb21wb25lbnQuc2NzcyJ9 */"] });


/***/ }),

/***/ "zn8P":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
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
webpackEmptyAsyncContext.id = "zn8P";

/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main-es2015.js.map