import * as events from '../base/constant';
import { isActionPrevent } from '../base/util';
import { CheckBoxFilterBase } from '../common/checkbox-filter-base';
/**
 * @hidden
 * `CheckBoxFilter` module is used to handle filtering action.
 */
var CheckBoxFilter = /** @class */ (function () {
    /**
     * Constructor for checkbox filtering module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {FilterSettings} filterSettings - specifies the filtersettings
     * @param {ServiceLocator} serviceLocator - specifies the ServiceLocator
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function CheckBoxFilter(parent, filterSettings, serviceLocator) {
        this.parent = parent;
        this.isresetFocus = true;
        this.checkBoxBase = new CheckBoxFilterBase(parent);
        this.addEventListener();
    }
    /**
     * To destroy the check box filter.
     *
     * @returns {void}
     * @hidden
     */
    CheckBoxFilter.prototype.destroy = function () {
        this.removeEventListener();
        this.checkBoxBase.closeDialog();
    };
    CheckBoxFilter.prototype.openDialog = function (options) {
        this.checkBoxBase.openDialog(options);
        this.parent.log('column_type_missing', { column: options.column });
    };
    CheckBoxFilter.prototype.closeDialog = function () {
        this.destroy();
        if (this.isresetFocus) {
            this.parent.notify(events.restoreFocus, {});
        }
    };
    CheckBoxFilter.prototype.closeResponsiveDialog = function () {
        this.checkBoxBase.closeDialog();
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the module name
     * @private
     */
    CheckBoxFilter.prototype.getModuleName = function () {
        return 'checkboxFilter';
    };
    CheckBoxFilter.prototype.actionBegin = function (args) {
        this.parent.trigger(events.actionBegin, args);
    };
    CheckBoxFilter.prototype.actionComplete = function (args) {
        this.parent.trigger(events.actionComplete, args);
    };
    CheckBoxFilter.prototype.actionPrevent = function (args) {
        if (isActionPrevent(this.parent)) {
            this.parent.notify(events.preventBatch, args);
            args.cancel = true;
        }
    };
    CheckBoxFilter.prototype.clearCustomFilter = function (col) {
        this.checkBoxBase.clearFilter(col);
    };
    CheckBoxFilter.prototype.applyCustomFilter = function () {
        this.checkBoxBase.fltrBtnHandler();
        this.checkBoxBase.closeDialog();
    };
    CheckBoxFilter.prototype.addEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.on(events.cBoxFltrBegin, this.actionBegin, this);
        this.parent.on(events.cBoxFltrComplete, this.actionComplete, this);
        this.parent.on(events.fltrPrevent, this.actionPrevent, this);
    };
    CheckBoxFilter.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off(events.cBoxFltrBegin, this.actionBegin);
        this.parent.off(events.cBoxFltrComplete, this.actionComplete);
        this.parent.off(events.fltrPrevent, this.actionPrevent);
    };
    return CheckBoxFilter;
}());
export { CheckBoxFilter };
