import { AutoComplete as EJ2AutoComplete } from '@syncfusion/ej2-dropdowns';
import { Base } from './base-module';
/**
 * The `AutoComplete` module is used configure the properties of Auto complete type editor.
 */
var AutoComplete = /** @class */ (function () {
    function AutoComplete(parent) {
        this.compObj = undefined;
        this.parent = parent;
        this.parent.atcModule = this;
        this.base = new Base(this.parent, this);
    }
    AutoComplete.prototype.render = function (e) {
        this.compObj = new EJ2AutoComplete(this.parent.model);
        this.compObj.appendTo(e.target);
    };
    /**
     * @hidden
     * @returns {void}
     */
    AutoComplete.prototype.showPopup = function () {
        this.compObj.focusIn();
        this.compObj.showPopup();
    };
    AutoComplete.prototype.focus = function () {
        this.compObj.element.focus();
    };
    AutoComplete.prototype.updateValue = function (e) {
        if (this.compObj && e.type === 'AutoComplete') {
            this.parent.setProperties({ value: this.compObj.value }, true);
            this.parent.extendModelValue(this.compObj.value);
        }
    };
    /**
     * Destroys the module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    AutoComplete.prototype.destroy = function () {
        this.base.destroy();
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string
     */
    AutoComplete.prototype.getModuleName = function () {
        return 'auto-complete';
    };
    return AutoComplete;
}());
export { AutoComplete };
