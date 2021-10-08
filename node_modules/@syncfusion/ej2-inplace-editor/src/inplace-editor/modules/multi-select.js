var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { closest } from '@syncfusion/ej2-base';
import { MultiSelect as EJ2MultiSelect } from '@syncfusion/ej2-dropdowns';
import { Base } from './base-module';
/**
 * The `MultiSelect` module is used configure the properties of Multi select type editor.
 */
var MultiSelect = /** @class */ (function () {
    function MultiSelect(parent) {
        this.isPopOpen = false;
        this.compObj = undefined;
        this.parent = parent;
        this.parent.multiSelectModule = this;
        this.base = new Base(this.parent, this);
    }
    MultiSelect.prototype.render = function (e) {
        var compModel = __assign({}, this.parent.model);
        this.openEvent = compModel.open;
        this.closeEvent = compModel.close;
        compModel.open = this.openHandler.bind(this);
        compModel.close = this.closeHandler.bind(this);
        this.compObj = new EJ2MultiSelect(compModel);
        this.compObj.appendTo(e.target);
    };
    MultiSelect.prototype.openHandler = function (e) {
        this.isPopOpen = true;
        if (this.openEvent) {
            this.compObj.setProperties({ open: this.openEvent }, true);
            this.compObj.trigger('open', e);
        }
    };
    MultiSelect.prototype.closeHandler = function (e) {
        this.isPopOpen = false;
        if (this.closeEvent) {
            this.compObj.setProperties({ close: this.closeEvent }, true);
            this.compObj.trigger('close', e);
        }
    };
    MultiSelect.prototype.focus = function () {
        if (!this.isPopOpen) {
            var evt = document.createEvent('MouseEvent');
            evt.initEvent('mousedown', true, true);
            closest(this.compObj.element, '.e-multi-select-wrapper').dispatchEvent(evt);
        }
    };
    MultiSelect.prototype.updateValue = function (e) {
        if (this.compObj && e.type === 'MultiSelect') {
            this.parent.setProperties({ value: this.compObj.value }, true);
            this.parent.extendModelValue(this.compObj.value);
        }
    };
    MultiSelect.prototype.getRenderValue = function () {
        this.parent.printValue = this.compObj.text;
    };
    /**
     * Destroys the module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    MultiSelect.prototype.destroy = function () {
        this.base.destroy();
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string
     */
    MultiSelect.prototype.getModuleName = function () {
        return 'multi-select';
    };
    return MultiSelect;
}());
export { MultiSelect };
