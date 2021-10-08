import { Slider as EJ2Slider } from '@syncfusion/ej2-inputs';
import { Base } from './base-module';
/**
 * The `Slider` module is used configure the properties of Slider type editor.
 */
var Slider = /** @class */ (function () {
    function Slider(parent) {
        this.compObj = undefined;
        this.parent = parent;
        this.parent.sliderModule = this;
        this.base = new Base(this.parent, this);
    }
    Slider.prototype.render = function (e) {
        this.compObj = new EJ2Slider(this.parent.model);
        this.compObj.appendTo(e.target);
    };
    Slider.prototype.focus = function () {
        this.compObj.element.focus();
    };
    Slider.prototype.updateValue = function (e) {
        if (this.compObj && e.type === 'Slider') {
            this.parent.setProperties({ value: this.compObj.value }, true);
            this.parent.extendModelValue(this.compObj.value);
        }
    };
    Slider.prototype.refresh = function () {
        this.compObj.refresh();
    };
    /**
     * Destroys the slider module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    Slider.prototype.destroy = function () {
        this.base.destroy();
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string
     */
    Slider.prototype.getModuleName = function () {
        return 'slider';
    };
    return Slider;
}());
export { Slider };
