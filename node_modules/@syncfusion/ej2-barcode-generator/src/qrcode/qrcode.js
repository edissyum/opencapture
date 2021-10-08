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
import { removeChildElements, refreshCanvasBarcode, exportAsImage } from '../barcode/utility/barcode-util';
import { Complex, Property, Component, L10n, Event } from '@syncfusion/ej2-base';
import { ErrorCorrectionLevel, BarcodeEvent } from '../barcode/enum/enum';
import { DisplayText } from '../barcode/primitives/displaytext';
import { Margin } from '../barcode/primitives/margin';
import { BarcodeRenderer } from '../barcode/rendering/renderer';
import { QRCode } from './qr-code-util';
/**
 * Represents the Qrcode control
 * ```
 */
var QRCodeGenerator = /** @class */ (function (_super) {
    __extends(QRCodeGenerator, _super);
    /**
     *  Constructor for creating the widget
     *
     * @param {QRCodeGeneratorModel} options - Provide the instance.
     * @param {HTMLElement} element - Provide the element .
     */
    function QRCodeGenerator(options, element) {
        var _this = _super.call(this, options, element) || this;
        _this.widthChange = false;
        _this.heightChange = false;
        return _this;
    }
    /**
     * Renders the barcode control .
     *
     * @returns {void}
     */
    QRCodeGenerator.prototype.render = function () {
        this.notify('initial-load', {});
        /**
         * Used to load context menu
         */
        this.trigger('load');
        this.notify('initial-end', {});
        this.renderElements();
        this.renderComplete();
    };
    QRCodeGenerator.prototype.triggerEvent = function (eventName, message) {
        var arg = {
            message: message
        };
        this.trigger(BarcodeEvent[eventName], arg);
    };
    QRCodeGenerator.prototype.renderElements = function () {
        var barCode = new QRCode();
        barCode.text = this.value;
        barCode.XDimension = this.xDimension;
        barCode.mIsUserMentionedErrorCorrectionLevel = (this.errorCorrectionLevel !== undefined) ? true : false;
        barCode.mErrorCorrectionLevel = (this.errorCorrectionLevel !== undefined) ? this.errorCorrectionLevel : ErrorCorrectionLevel.Medium;
        barCode.version = (this.version !== undefined) ? this.version : undefined;
        barCode.mIsUserMentionedVersion = (this.version !== undefined) ? true : false;
        var mode = (this.mode === 'SVG') ? true : false;
        var validInput = barCode.draw(this.value, this.barcodeCanvas, this.element.offsetHeight, this.element.offsetWidth, this.margin, this.displayText, mode, this.foreColor);
        if (this.mode === 'Canvas') {
            this.barcodeCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
            this.barcodeCanvas.getContext('2d').scale(1.5, 1.5);
        }
        if (!validInput) {
            var encoding = 'Invalid Input';
            this.triggerEvent(BarcodeEvent.invalid, encoding);
        }
        if (this.mode === 'Canvas') {
            this.barcodeCanvas.style.transform = 'scale(' + (2 / 3) + ')';
            this.barcodeCanvas.style.transformOrigin = '0 0';
        }
    };
    QRCodeGenerator.prototype.setCulture = function () {
        this.localeObj = new L10n(this.getModuleName(), this.defaultLocale, this.locale);
    };
    // eslint-disable-next-line
    QRCodeGenerator.prototype.getElementSize = function (real, rulerSize) {
        //this method will return the size of the qrcode
        var value;
        if (real.toString().indexOf('px') > 0 || real.toString().indexOf('%') > 0) {
            value = real.toString();
        }
        else {
            value = real.toString() + 'px';
        }
        return value;
    };
    QRCodeGenerator.prototype.initialize = function () {
        //Initialize the height of qrcode generator
        this.element.style.height = this.getElementSize(this.height);
        //Initialize the width of qrcode generator
        this.element.style.width = this.getElementSize(this.width);
        this.barcodeCanvas = this.barcodeRenderer.renderRootElement({
            id: this.element.id + 'content',
            height: this.mode === 'SVG' ? this.element.offsetHeight : this.element.offsetHeight * 1.5,
            width: this.mode === 'SVG' ? this.element.offsetWidth : this.element.offsetWidth * 1.5
        }, this.backgroundColor, this.element.offsetWidth, this.element.offsetHeight);
        this.element.appendChild(this.barcodeCanvas);
    };
    QRCodeGenerator.prototype.preRender = function () {
        this.element.classList.add('e-qrcode');
        this.barcodeRenderer = new BarcodeRenderer(this.element.id, this.mode === 'SVG');
        this.initialize();
        this.initializePrivateVariables();
        this.setCulture();
    };
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} Get the properties to be maintained in the persisted state.
     */
    QRCodeGenerator.prototype.getPersistData = function () {
        var keyEntity = ['loaded'];
        return this.addOnPersist(keyEntity);
    };
    /**
     * Returns the module name of the barcode
     *
     * @returns {string}  Returns the module name of the barcode
     */
    QRCodeGenerator.prototype.getModuleName = function () {
        return 'QRCodeGenerator';
    };
    /**
     * It is used to destroy the Barcode component.
     *
     * @function destroy
     * @returns {void}
     */
    QRCodeGenerator.prototype.destroy = function () {
        this.notify('destroy', {});
        _super.prototype.destroy.call(this);
    };
    QRCodeGenerator.prototype.initializePrivateVariables = function () {
        this.defaultLocale = {};
    };
    /**
     * Export the barcode as an image in the specified image type and downloads it in the browser.
     *
     * @returns {void} Export the barcode as an image in the specified image type and downloads it in the browser.
     *  @param {string} filename - Specifies the filename of the barcode image to be download.
     *  @param {BarcodeExportType} barcodeExportType - Defines the format of the barcode to be exported
     */
    QRCodeGenerator.prototype.exportImage = function (filename, barcodeExportType) {
        exportAsImage(barcodeExportType, filename, this.element, false, this);
    };
    /**
     * Export the barcode as an image in the specified image type and returns it as base64 string.
     *
     * @returns {string} Export the barcode as an image in the specified image type and returns it as base64 string.
     *  @param {BarcodeExportType} barcodeExportType - Defines the format of the barcode to be exported
     */
    QRCodeGenerator.prototype.exportAsBase64Image = function (barcodeExportType) {
        var returnValue = exportAsImage(barcodeExportType, '', this.element, true, this);
        return returnValue;
    };
    // eslint-disable-next-line
    QRCodeGenerator.prototype.onPropertyChanged = function (newProp, oldProp) {
        var width;
        var height;
        if (this.mode === 'Canvas' && newProp.mode !== 'Canvas') {
            refreshCanvasBarcode(this, this.barcodeCanvas);
        }
        else {
            this.barcodeRenderer = removeChildElements(newProp, this.barcodeCanvas, this.mode, this.element.id);
        }
        if (newProp.width) {
            if (this.mode === 'Canvas' && newProp.mode !== 'Canvas') {
                this.widthChange = true;
            }
            width = (this.mode === 'Canvas' && newProp.mode !== 'Canvas') ? ((newProp.width * 1.5)) : newProp.width;
            this.barcodeCanvas.setAttribute('width', String(width));
        }
        if (newProp.height) {
            if (this.mode === 'Canvas' && newProp.mode !== 'Canvas') {
                this.heightChange = true;
            }
            height = (this.mode === 'Canvas' && newProp.mode !== 'Canvas') ? ((newProp.height * 1.5)) : newProp.height;
            this.barcodeCanvas.setAttribute('height', String(height));
        }
        for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'width':
                    this.element.style.width = this.getElementSize(width);
                    this.barcodeCanvas.setAttribute('width', String(this.element.offsetWidth));
                    break;
                case 'height':
                    this.element.style.height = this.getElementSize(height);
                    this.barcodeCanvas.setAttribute('height', String(this.element.offsetHeight));
                    break;
                case 'backgroundColor':
                    this.barcodeCanvas.setAttribute('style', 'background:' + newProp.backgroundColor);
                    break;
                case 'mode':
                    this.initialize();
            }
        }
        this.renderElements();
    };
    __decorate([
        Property('100%')
    ], QRCodeGenerator.prototype, "height", void 0);
    __decorate([
        Property('100%')
    ], QRCodeGenerator.prototype, "width", void 0);
    __decorate([
        Property('SVG')
    ], QRCodeGenerator.prototype, "mode", void 0);
    __decorate([
        Property(1)
    ], QRCodeGenerator.prototype, "xDimension", void 0);
    __decorate([
        Property()
    ], QRCodeGenerator.prototype, "errorCorrectionLevel", void 0);
    __decorate([
        Complex({}, Margin)
    ], QRCodeGenerator.prototype, "margin", void 0);
    __decorate([
        Property('white')
    ], QRCodeGenerator.prototype, "backgroundColor", void 0);
    __decorate([
        Event()
    ], QRCodeGenerator.prototype, "invalid", void 0);
    __decorate([
        Property('black')
    ], QRCodeGenerator.prototype, "foreColor", void 0);
    __decorate([
        Complex({}, DisplayText)
    ], QRCodeGenerator.prototype, "displayText", void 0);
    __decorate([
        Property()
    ], QRCodeGenerator.prototype, "version", void 0);
    __decorate([
        Property(undefined)
    ], QRCodeGenerator.prototype, "value", void 0);
    return QRCodeGenerator;
}(Component));
export { QRCodeGenerator };
