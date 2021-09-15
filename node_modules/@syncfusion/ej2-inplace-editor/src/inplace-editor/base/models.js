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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChildProperty, Property } from '@syncfusion/ej2-base';
/**
 * Configures the popup settings of the In-place editor.
 */
var PopupSettings = /** @class */ (function (_super) {
    __extends(PopupSettings, _super);
    function PopupSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], PopupSettings.prototype, "title", void 0);
    __decorate([
        Property(null)
    ], PopupSettings.prototype, "model", void 0);
    return PopupSettings;
}(ChildProperty));
export { PopupSettings };
/**
 * @hidden
 */
export var modulesList = {
    /* eslint-disable */
    'AutoComplete': 'auto-complete',
    'Color': 'color-picker',
    'ComboBox': 'combo-box',
    'DateRange': 'date-range-picker',
    'MultiSelect': 'multi-select',
    'RTE': 'rte',
    'Slider': 'slider',
    'Time': 'time-picker'
    /* eslint-enable */
};
/**
 * @hidden
 */
// eslint-disable-next-line
export var localeConstant = {
    /* eslint-disable */
    'Click': { 'editAreaClick': 'Click to edit' },
    'DblClick': { 'editAreaDoubleClick': 'Double click to edit' },
    'EditIconClick': { 'editAreaClick': 'Click to edit' }
    /* eslint-enable */
};
