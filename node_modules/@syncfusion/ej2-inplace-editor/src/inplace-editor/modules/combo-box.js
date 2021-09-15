import { ComboBox as EJ2ComboBox } from '@syncfusion/ej2-dropdowns';
import { Base } from './base-module';
/**
 * The `ComboBox` module is used configure the properties of Combo box type editor.
 */
var ComboBox = /** @class */ (function () {
    function ComboBox(parent) {
        this.compObj = undefined;
        this.parent = parent;
        this.parent.comboBoxModule = this;
        this.base = new Base(this.parent, this);
    }
    ComboBox.prototype.render = function (e) {
        this.compObj = new EJ2ComboBox(this.parent.model);
        this.compObj.appendTo(e.target);
    };
    ComboBox.prototype.focus = function () {
        this.compObj.element.focus();
    };
    /**
     * @hidden
     * @returns {void}
     */
    ComboBox.prototype.showPopup = function () {
        this.compObj.focusIn();
        this.compObj.showPopup();
    };
    /**
     * Destroys the module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    ComboBox.prototype.destroy = function () {
        this.base.destroy();
    };
    ComboBox.prototype.updateValue = function (e) {
        if (this.compObj && e.type === 'ComboBox') {
            this.parent.setProperties({ value: this.compObj.value }, true);
            this.parent.extendModelValue(this.compObj.value);
        }
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string
     */
    ComboBox.prototype.getModuleName = function () {
        return 'combo-box';
    };
    return ComboBox;
}());
export { ComboBox };
