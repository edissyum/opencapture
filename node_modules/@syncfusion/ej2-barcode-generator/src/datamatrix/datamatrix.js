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
import { Component, Property, L10n } from '@syncfusion/ej2-base';
import { Complex, Event } from '@syncfusion/ej2-base';
import { BarcodeEvent, DataMatrixSize } from '../barcode/enum/enum';
import { DisplayText } from '../barcode/primitives/displaytext';
import { Margin } from '../barcode/primitives/margin';
import { BarcodeRenderer } from '../barcode/rendering/renderer';
import { removeChildElements, refreshCanvasBarcode, exportAsImage } from '../barcode/utility/barcode-util';
import { DataMatrix } from './datamatrix-util';
/**
 * Represents the Datamatrix control
 * ```
 */
var DataMatrixGenerator = /** @class */ (function (_super) {
    __extends(DataMatrixGenerator, _super);
    /**
     * Constructor for creating the widget
     *
     * @param {DataMatrixGeneratorModel} options The barcode model.
     * @param {HTMLElement | string} element The barcode element.
     */
    function DataMatrixGenerator(options, element) {
        return _super.call(this, options, element) || this;
    }
    /**
     * It is used to destroy the Barcode component.
     *
     * @function destroy
     * @returns {void}
     */
    DataMatrixGenerator.prototype.destroy = function () {
        this.notify('destroy', {});
        _super.prototype.destroy.call(this);
    };
    DataMatrixGenerator.prototype.initializePrivateVariables = function () {
        this.defaultLocale = {};
    };
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} Get the properties to be maintained in the persisted state.
     */
    DataMatrixGenerator.prototype.getPersistData = function () {
        var keyEntity = ['loaded'];
        return this.addOnPersist(keyEntity);
    };
    /**
     * Returns the module name of the barcode
     *
     * @returns {string}  Returns the module name of the barcode
     */
    DataMatrixGenerator.prototype.getModuleName = function () {
        return 'DataMatrixGenerator';
    };
    DataMatrixGenerator.prototype.setCulture = function () {
        this.localeObj = new L10n(this.getModuleName(), this.defaultLocale, this.locale);
    };
    // eslint-disable-next-line
    DataMatrixGenerator.prototype.getElementSize = function (real, rulerSize) {
        //this method will return the size of the datamatrix
        var value;
        if (real.toString().indexOf('px') > 0 || real.toString().indexOf('%') > 0) {
            value = real.toString();
        }
        else {
            value = real.toString() + 'px';
        }
        return value;
    };
    DataMatrixGenerator.prototype.initialize = function () {
        //Initialize the width of the datamatrix generator
        this.element.style.width = this.getElementSize(this.width);
        //Initialize the hieght of the datamatrix generator
        this.element.style.height = this.getElementSize(this.height);
        //set height and width of the canvas element
        var height = this.mode === 'SVG' ? this.element.offsetHeight : this.element.offsetHeight * 1.5;
        var width = this.mode === 'SVG' ? this.element.offsetWidth : this.element.offsetWidth * 1.5;
        //initialize the canvas element
        this.barcodeCanvas = this.barcodeRenderer.renderRootElement({
            id: this.element.id + 'content',
            height: height, width: width
        }, this.backgroundColor, width, height);
        this.element.appendChild(this.barcodeCanvas);
    };
    DataMatrixGenerator.prototype.triggerEvent = function (eventName, message) {
        var arg = {
            message: message
        };
        this.trigger(BarcodeEvent[eventName], arg);
    };
    DataMatrixGenerator.prototype.preRender = function () {
        this.element.classList.add('e-datamatrix');
        //initialize the data matrix renderer
        this.barcodeRenderer = new BarcodeRenderer(this.element.id, this.mode === 'SVG');
        this.initialize();
        //initialize the data matrix renderer private variables
        this.initializePrivateVariables();
        this.setCulture();
        //set class data matrix renderer
    };
    // eslint-disable-next-line
    DataMatrixGenerator.prototype.onPropertyChanged = function (newProp, oldProp) {
        var width;
        var height;
        if (this.mode === 'Canvas' && newProp.mode !== 'Canvas') {
            refreshCanvasBarcode(this, this.barcodeCanvas);
        }
        else {
            this.barcodeRenderer = removeChildElements(newProp, this.barcodeCanvas, this.mode, this.element.id);
        }
        if (newProp.width) {
            width = (this.mode === 'Canvas' && newProp.mode !== 'Canvas') ? ((newProp.width * 1.5)) : newProp.width;
            this.barcodeCanvas.setAttribute('width', String(width));
        }
        if (newProp.height) {
            height = (this.mode === 'Canvas' && newProp.mode !== 'Canvas') ? ((newProp.height * 1.5)) : newProp.height;
            this.barcodeCanvas.setAttribute('height', String(height));
        }
        for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'mode':
                    this.initialize();
                    break;
                case 'height':
                    this.element.style.height = this.getElementSize(height);
                    this.barcodeCanvas.setAttribute('height', String(this.element.offsetHeight));
                    break;
                case 'width':
                    this.element.style.width = this.getElementSize(width);
                    this.barcodeCanvas.setAttribute('width', String(this.element.offsetWidth));
                    break;
                case 'backgroundColor':
                    this.barcodeCanvas.setAttribute('style', 'background:' + newProp.backgroundColor);
                    break;
            }
        }
        this.renderElements();
    };
    DataMatrixGenerator.prototype.checkdata = function (value) {
        var validData = false;
        for (var i = 0; i < value.length; i++) {
            // eslint-disable-next-line
            var number = 0;
            if ((value.charCodeAt(i) >= 32 && value.charCodeAt(i) <= 126) || (value.charCodeAt(i) === 10 || value.charCodeAt(i) === 13)) {
                validData = true;
            }
        }
        return validData;
    };
    /**
     * Export the barcode as an image in the specified image type and downloads it in the browser.
     *
     * @returns {void} Export the barcode as an image in the specified image type and downloads it in the browser.
     *  @param {string} fileName - Specifies the filename of the barcode image to be download.
     *  @param {BarcodeExportType} exportType - Defines the format of the barcode to be exported
     */
    DataMatrixGenerator.prototype.exportImage = function (fileName, exportType) {
        exportAsImage(exportType, fileName, this.element, false, this);
    };
    /**
     * Export the barcode as an image in the specified image type and returns it as base64 string.
     *
     * @returns {string} Export the barcode as an image in the specified image type and returns it as base64 string.
     *  @param {BarcodeExportType} barcodeExportType - Defines the format of the barcode to be exported
     */
    DataMatrixGenerator.prototype.exportAsBase64Image = function (barcodeExportType) {
        var returnValue = exportAsImage(barcodeExportType, '', this.element, true, this);
        return returnValue;
    };
    DataMatrixGenerator.prototype.renderElements = function () {
        var dataMatrix = new DataMatrix();
        dataMatrix.encodingValue = this.encoding;
        dataMatrix.size = this.size;
        dataMatrix.value = this.value;
        dataMatrix.width = this.barcodeCanvas.getAttribute('width');
        dataMatrix.height = this.barcodeCanvas.getAttribute('height');
        dataMatrix.XDimension = this.xDimension;
        dataMatrix.isSvgMode = this.mode === 'SVG' ? true : false;
        dataMatrix.margin = this.margin;
        dataMatrix.displayText = this.displayText;
        dataMatrix.foreColor = this.foreColor;
        var checkOtherLanguage = this.checkdata(this.value);
        var encoding = (dataMatrix.BuildDataMatrix());
        if (isNaN(encoding[0])) {
            this.triggerEvent(BarcodeEvent.invalid, encoding);
        }
        else if (!checkOtherLanguage) {
            this.triggerEvent(BarcodeEvent.invalid, 'Invalid input');
        }
        else {
            dataMatrix.draw(this.barcodeCanvas);
        }
        if (this.mode === 'Canvas') {
            this.barcodeCanvas.style.transform = 'scale(' + (2 / 3) + ')';
            this.barcodeCanvas.style.transformOrigin = '0 0';
        }
    };
    /**
     * Renders the barcode control
     *
     * @returns {void}
     */
    DataMatrixGenerator.prototype.render = function () {
        this.notify('initial-load', {});
        /**
         * Used to load context menu
         */
        this.trigger('load');
        this.notify('initial-end', {});
        this.renderElements();
        this.renderComplete();
    };
    __decorate([
        Property('Auto')
    ], DataMatrixGenerator.prototype, "encoding", void 0);
    __decorate([
        Property(DataMatrixSize.Auto)
    ], DataMatrixGenerator.prototype, "size", void 0);
    __decorate([
        Property('SVG')
    ], DataMatrixGenerator.prototype, "mode", void 0);
    __decorate([
        Property(undefined)
    ], DataMatrixGenerator.prototype, "value", void 0);
    __decorate([
        Property('100%')
    ], DataMatrixGenerator.prototype, "height", void 0);
    __decorate([
        Property('100%')
    ], DataMatrixGenerator.prototype, "width", void 0);
    __decorate([
        Complex({}, DisplayText)
    ], DataMatrixGenerator.prototype, "displayText", void 0);
    __decorate([
        Complex({}, Margin)
    ], DataMatrixGenerator.prototype, "margin", void 0);
    __decorate([
        Property('white')
    ], DataMatrixGenerator.prototype, "backgroundColor", void 0);
    __decorate([
        Event()
    ], DataMatrixGenerator.prototype, "invalid", void 0);
    __decorate([
        Property('black')
    ], DataMatrixGenerator.prototype, "foreColor", void 0);
    __decorate([
        Property(1)
    ], DataMatrixGenerator.prototype, "xDimension", void 0);
    return DataMatrixGenerator;
}(Component));
export { DataMatrixGenerator };
