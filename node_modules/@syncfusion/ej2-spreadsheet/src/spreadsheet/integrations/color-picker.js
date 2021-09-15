import { ColorPicker as ColorPickerComponent } from '@syncfusion/ej2-inputs';
import { addClass } from '@syncfusion/ej2-base';
import { spreadsheetDestroyed, fontColor, fillColor, beforeRibbonCreate, locale, focus } from '../common/index';
import { setCellFormat } from '../../workbook/common/index';
/**
 * `Color Picker` module is used to handle ColorPicker functionality.
 *
 * @hidden
 */
var ColorPicker = /** @class */ (function () {
    function ColorPicker(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    ColorPicker.prototype.render = function () {
        var _this = this;
        var id = this.parent.element.id;
        var input = this.parent.createElement('input', { attrs: { 'type': 'color' } });
        this.fontColorPicker = new ColorPickerComponent({
            value: '#000000ff',
            mode: 'Palette',
            showButtons: false,
            presetColors: fontColor,
            enableOpacity: false,
            beforeClose: function () { return _this.beforeCloseHandler(_this.fontColorPicker); },
            open: this.openHandler.bind(this),
            beforeModeSwitch: function (args) { return _this.beforeModeSwitch(_this.fontColorPicker, args); },
            change: function (args) {
                var color = _this.fontColorPicker.getValue(args.currentValue.rgba);
                var eventArgs = { style: { color: color }, onActionUpdate: true };
                _this.parent.notify(setCellFormat, eventArgs);
                if (eventArgs.cancel) {
                    _this.fontColorPicker.setProperties({ 'value': _this.fontColorPicker.getValue(args.previousValue.rgba, 'HEXA') }, true);
                }
                else {
                    _this.updateSelectedColor(eventArgs.style.color, _this.fontColorPicker.element);
                }
                focus(_this.parent.element);
            },
            created: function () { return _this.wireFocusEvent(_this.fontColorPicker.element, '#000000'); }
        });
        this.fontColorPicker.createElement = this.parent.createElement;
        this.parent.element.appendChild(input);
        this.fontColorPicker.appendTo(input);
        input.parentElement.id = id + "_font_color_picker";
        addClass([input.nextElementSibling.getElementsByClassName('e-selected-color')[0]], ['e-icons', 'e-font-color']);
        input = this.parent.createElement('input', { attrs: { 'type': 'color' } });
        this.filColorPicker = new ColorPickerComponent({
            value: '#ffff00ff',
            mode: 'Palette',
            presetColors: fillColor,
            showButtons: false,
            enableOpacity: false,
            open: this.openHandler.bind(this),
            beforeClose: function () { return _this.beforeCloseHandler(_this.filColorPicker); },
            beforeModeSwitch: function (args) { return _this.beforeModeSwitch(_this.filColorPicker, args); },
            change: function (args) {
                var color = _this.filColorPicker.getValue(args.currentValue.rgba);
                var eventArgs = { style: { backgroundColor: color }, onActionUpdate: true };
                _this.parent.notify(setCellFormat, eventArgs);
                if (eventArgs.cancel) {
                    _this.filColorPicker.setProperties({ 'value': _this.filColorPicker.getValue(args.previousValue.rgba, 'HEXA') }, true);
                }
                else {
                    _this.updateSelectedColor(eventArgs.style.backgroundColor, _this.filColorPicker.element);
                }
                focus(_this.parent.element);
            },
            created: function () { return _this.wireFocusEvent(_this.filColorPicker.element, '#ffff00'); }
        });
        this.filColorPicker.createElement = this.parent.createElement;
        this.parent.element.appendChild(input);
        this.filColorPicker.appendTo(input);
        input.parentElement.id = id + "_fill_color_picker";
        addClass([input.nextElementSibling.getElementsByClassName('e-selected-color')[0]], ['e-icons', 'e-fill-color']);
    };
    ColorPicker.prototype.updateSelectedColor = function (color, ele) {
        ele.nextElementSibling.querySelector('.e-selected-color').style.borderBottomColor = color;
    };
    ColorPicker.prototype.wireFocusEvent = function (element, color) {
        var _this = this;
        this.updateSelectedColor(color, element);
        element = element.parentElement.querySelector('.e-split-colorpicker');
        element.addEventListener('focus', function () {
            focus(_this.parent.element);
        });
    };
    ColorPicker.prototype.openHandler = function (args) {
        args.element.querySelector('.e-mode-switch-btn').title =
            this.parent.serviceLocator.getService(locale).getConstant('MoreColors');
    };
    ColorPicker.prototype.beforeCloseHandler = function (inst) {
        if (!inst.modeSwitcher) {
            inst.setProperties({ modeSwitcher: true }, true);
        }
        if (inst.showButtons) {
            inst.setProperties({ showButtons: false }, true);
        }
    };
    ColorPicker.prototype.beforeModeSwitch = function (inst, args) {
        var l10n = this.parent.serviceLocator.getService(locale);
        if (args.mode === 'Picker') {
            inst.showButtons = true;
            inst.dataBind();
            args.element.querySelector('.e-apply').title = l10n.getConstant('Apply');
            args.element.querySelector('.e-cancel').title = l10n.getConstant('Cancel');
            args.element.querySelector('.e-mode-switch-btn').title = l10n.getConstant('StandardColors');
        }
        else {
            inst.showButtons = false;
            inst.dataBind();
            args.element.querySelector('.e-mode-switch-btn').title = l10n.getConstant('MoreColors');
        }
    };
    ColorPicker.prototype.destroy = function () {
        if (this.parent) {
            this.removeEventListener();
            this.fontColorPicker.destroy();
            this.fontColorPicker = null;
            this.filColorPicker.destroy();
            this.filColorPicker = null;
            this.parent = null;
        }
    };
    ColorPicker.prototype.addEventListener = function () {
        this.parent.on(beforeRibbonCreate, this.render, this);
        this.parent.on('destroyRibbonComponents', this.destroy, this);
        this.parent.on(spreadsheetDestroyed, this.destroy, this);
    };
    ColorPicker.prototype.removeEventListener = function () {
        this.parent.off(beforeRibbonCreate, this.render);
        this.parent.off('destroyRibbonComponents', this.destroy);
        this.parent.on(spreadsheetDestroyed, this.destroy, this);
    };
    return ColorPicker;
}());
export { ColorPicker };
