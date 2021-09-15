var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { ExcelFilterBase } from '../common/excel-filter-base';
import { CheckBoxFilter } from './checkbox-filter';
import * as events from '../base/constant';
/**
 * @hidden
 * `ExcelFilter` module is used to handle filtering action.
 */
var ExcelFilter = /** @class */ (function (_super) {
    __extends(ExcelFilter, _super);
    /**
     * Constructor for excelbox filtering module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {FilterSettings} filterSettings - specifies the Filtersettings
     * @param {ServiceLocator} serviceLocator - specifies the serviceLocator
     * @param {object} customFltrOperators - specifies the customFltrOperators
     * @hidden
     */
    function ExcelFilter(parent, filterSettings, serviceLocator, customFltrOperators) {
        var _this = _super.call(this, parent, filterSettings, serviceLocator) || this;
        _this.parent = parent;
        _this.isresetFocus = true;
        _this.excelFilterBase = new ExcelFilterBase(parent, customFltrOperators);
        return _this;
    }
    /**
     * To destroy the excel filter.
     *
     * @returns {void}
     * @hidden
     */
    ExcelFilter.prototype.destroy = function () {
        this.excelFilterBase.closeDialog();
    };
    ExcelFilter.prototype.openDialog = function (options) {
        this.excelFilterBase.openDialog(options);
    };
    ExcelFilter.prototype.closeDialog = function () {
        this.excelFilterBase.closeDialog();
        if (this.isresetFocus) {
            this.parent.notify(events.restoreFocus, {});
        }
    };
    ExcelFilter.prototype.clearCustomFilter = function (col) {
        this.excelFilterBase.clearFilter(col);
    };
    ExcelFilter.prototype.closeResponsiveDialog = function (isCustomFilter) {
        if (isCustomFilter) {
            this.excelFilterBase.removeDialog();
        }
        else {
            this.closeDialog();
        }
    };
    ExcelFilter.prototype.applyCustomFilter = function (args) {
        if (!args.isCustomFilter) {
            this.excelFilterBase.fltrBtnHandler();
            this.excelFilterBase.closeDialog();
        }
        else {
            this.excelFilterBase.filterBtnClick(args.col.field);
        }
    };
    ExcelFilter.prototype.filterByColumn = function (fieldName, firstOperator, firstValue, predicate, matchCase, ignoreAccent, secondOperator, secondValue) {
        this.excelFilterBase.filterByColumn(fieldName, firstOperator, firstValue, predicate, matchCase, ignoreAccent, secondOperator, secondValue);
    };
    /**
     * @returns {FilterUI} returns the filterUI
     * @hidden
     */
    ExcelFilter.prototype.getFilterUIInfo = function () {
        return this.excelFilterBase.getFilterUIInfo();
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    ExcelFilter.prototype.getModuleName = function () {
        return 'excelFilter';
    };
    return ExcelFilter;
}(CheckBoxFilter));
export { ExcelFilter };
