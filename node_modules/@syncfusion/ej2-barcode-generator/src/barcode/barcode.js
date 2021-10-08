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
import { BarcodeEvent } from './enum/enum';
import { BarcodeRenderer } from './rendering/renderer';
import { BarcodeCanvasRenderer } from './rendering/canvas-renderer';
import { Code128B } from './one-dimension/code128B';
import { Code128C } from './one-dimension/code128C';
import { DisplayText } from './primitives/displaytext';
import { Margin } from './primitives/margin';
import { Code39 } from './one-dimension/code39';
import { CodaBar } from './one-dimension/codabar';
import { Code128A } from './one-dimension/code128A';
import { Code128 } from './one-dimension/code128';
import { Ean8 } from './one-dimension/ean8';
import { Ean13 } from './one-dimension/ean13';
import { UpcE } from './one-dimension/upcE';
import { UpcA } from './one-dimension/upcA';
import { Code11 } from './one-dimension/code11';
import { Code93 } from './one-dimension/code93';
import { Code93Extension } from './one-dimension/code93Extension';
import { Code32 } from './one-dimension/code32';
import { Code39Extension } from './one-dimension/code39Extension';
import { removeChildElements, exportAsImage } from './utility/barcode-util';
/**
 * Represents the Barcode control
 * ```html
 * <div id='barcode'/>
 * ```
 * ```typescript
 * let barcode: Barcode = new Barcode({
 * width:'1000px', height:'500px' });
 * barcode.appendTo('#barcode');
 * ```
 */
var BarcodeGenerator = /** @class */ (function (_super) {
    __extends(BarcodeGenerator, _super);
    /**
     * Constructor for creating the widget
     *
     * @param {BarcodeGeneratorModel} options The barcode model.
     * @param {HTMLElement | string} element The barcode element.
     */
    function BarcodeGenerator(options, element) {
        return _super.call(this, options, element) || this;
    }
    BarcodeGenerator.prototype.triggerEvent = function (eventName, message) {
        var arg = {
            message: message
        };
        this.trigger(BarcodeEvent[eventName], arg);
    };
    // eslint-disable-next-line
    BarcodeGenerator.prototype.onPropertyChanged = function (newProp, oldProp) {
        if (this.mode === 'Canvas' && newProp.mode !== 'Canvas') {
            this.refreshCanvasBarcode();
        }
        else {
            this.barcodeRenderer = removeChildElements(newProp, this.barcodeCanvas, this.mode, this.element.id);
        }
        if (newProp.width) {
            this.barcodeCanvas.setAttribute('width', String(newProp.width));
        }
        for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'width':
                    this.element.style.width = this.getElementSize(this.width);
                    this.barcodeCanvas.setAttribute('width', String(this.element.offsetWidth));
                    break;
                case 'height':
                    this.element.style.height = this.getElementSize(this.height);
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
    BarcodeGenerator.prototype.initialize = function () {
        //Initialize the height of the barcode generator
        this.element.style.height = this.getElementSize(this.height);
        //Initialize the width of the barcode generator
        this.element.style.width = this.getElementSize(this.width);
        var height = this.mode === 'SVG' ? this.element.offsetHeight : this.element.offsetHeight * 1.5;
        var width = this.mode === 'SVG' ? this.element.offsetWidth : this.element.offsetWidth * 1.5;
        this.barcodeCanvas = this.barcodeRenderer.renderRootElement({
            id: this.element.id + 'content',
            height: height, width: width
        }, this.backgroundColor, width, height);
        this.element.appendChild(this.barcodeCanvas);
    };
    /**
     * Export the barcode as an image in the specified image type and downloads it in the browser.
     *
     * @returns {void} Export the barcode as an image in the specified image type and downloads it in the browser.
     *  @param {string} filename - Specifies the filename of the barcode image to be download.
     *  @param {BarcodeExportType} exportType - Defines the format of the barcode to be exported
     */
    BarcodeGenerator.prototype.exportImage = function (filename, exportType) {
        exportAsImage(exportType, filename, this.element, false, this);
    };
    /**
     * Export the barcode as an image in the specified image type and returns it as base64 string.
     *
     * @returns {string} Export the barcode as an image in the specified image type and returns it as base64 string.
     *  @param {BarcodeExportType} exportType - Defines the format of the barcode to be exported
     */
    BarcodeGenerator.prototype.exportAsBase64Image = function (exportType) {
        var returnValue = exportAsImage(exportType, '', this.element, true, this);
        return returnValue;
    };
    BarcodeGenerator.prototype.renderElements = function () {
        var barCode;
        switch (this.type) {
            case 'Code39Extension':
                barCode = new Code39Extension;
                break;
            case 'Code39':
                barCode = new Code39();
                break;
            case 'Codabar':
                barCode = new CodaBar();
                break;
            case 'Code128A':
                barCode = new Code128A();
                break;
            case 'Code128B':
                barCode = new Code128B();
                break;
            case 'Code128C':
                barCode = new Code128C();
                break;
            case 'Code128':
                barCode = new Code128();
                break;
            case 'Ean8':
                barCode = new Ean8();
                break;
            case 'Ean13':
                barCode = new Ean13();
                break;
            case 'UpcA':
                barCode = new UpcA();
                break;
            case 'UpcE':
                barCode = new UpcE();
                break;
            case 'Code11':
                barCode = new Code11();
                break;
            case 'Code93':
                barCode = new Code93();
                break;
            case 'Code93Extension':
                barCode = new Code93Extension();
                break;
            case 'Code32':
                barCode = new Code32();
                break;
        }
        if (this.mode === 'Canvas') {
            this.barcodeCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
            this.barcodeCanvas.getContext('2d').scale(1.5, 1.5);
        }
        barCode.width = this.barcodeCanvas.getAttribute('width');
        if ((this.type === 'Ean8' || this.type === 'Ean13' || this.type === 'UpcA') && this.displayText.text.length > 0) {
            this.triggerEvent(BarcodeEvent.invalid, 'Invalid Display Text');
        }
        barCode.value = this.value;
        barCode.margin = this.margin;
        barCode.type = this.type;
        barCode.height = this.barcodeCanvas.getAttribute('height');
        barCode.foreColor = this.foreColor;
        barCode.isSvgMode = this.mode === 'SVG' ? true : false;
        barCode.displayText = this.displayText;
        barCode.enableCheckSum = this.enableCheckSum;
        var validateMessage = barCode.validateInput(this.value);
        if (validateMessage === undefined) {
            if (this.type === 'Code39Extension') {
                barCode.drawCode39(this.barcodeCanvas);
            }
            else if (this.type === 'Code93Extension') {
                barCode.drawCode93(this.barcodeCanvas);
            }
            else {
                barCode.draw(this.barcodeCanvas);
            }
        }
        else {
            this.triggerEvent(BarcodeEvent.invalid, validateMessage);
        }
        if (this.mode === 'Canvas') {
            this.barcodeCanvas.style.transform = 'scale(' + (2 / 3) + ')';
            this.barcodeCanvas.style.transformOrigin = '0 0';
        }
    };
    BarcodeGenerator.prototype.refreshCanvasBarcode = function () {
        this.clearCanvas(this);
    };
    BarcodeGenerator.prototype.clearCanvas = function (view) {
        var width = view.element.offsetWidth;
        var height = view.element.offsetHeight;
        if (view.mode !== 'SVG') {
            var ctx = BarcodeCanvasRenderer.getContext(this.barcodeCanvas);
            ctx.clearRect(0, 0, width, height);
        }
    };
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} Get the properties to be maintained in the persisted state.
     */
    BarcodeGenerator.prototype.getPersistData = function () {
        var keyEntity = ['loaded'];
        return this.addOnPersist(keyEntity);
    };
    /**
     * @private
     * @param real
     */
    // eslint-disable-next-line
    BarcodeGenerator.prototype.getElementSize = function (real, rulerSize) {
        var value;
        if (real.toString().indexOf('px') > 0 || real.toString().indexOf('%') > 0) {
            value = real.toString();
        }
        else {
            value = real.toString() + 'px';
        }
        return value;
    };
    BarcodeGenerator.prototype.preRender = function () {
        this.element.classList.add('e-barcode');
        this.barcodeRenderer = new BarcodeRenderer(this.element.id, this.mode === 'SVG');
        this.initialize();
        this.initializePrivateVariables();
        this.setCulture();
        var measureElement = document.getElementsByClassName('barcodeMeasureElement');
        if (measureElement.length > 0) {
            for (var i = measureElement.length - 1; i >= 0; i--) {
                measureElement[i].parentNode.removeChild(measureElement[i]);
            }
            var element = 'barcodeMeasureElement';
            window[element] = null;
        }
    };
    BarcodeGenerator.prototype.initializePrivateVariables = function () {
        this.defaultLocale = {};
    };
    /**
     * Method to set culture for chart
     */
    BarcodeGenerator.prototype.setCulture = function () {
        this.localeObj = new L10n(this.getModuleName(), this.defaultLocale, this.locale);
    };
    /**
     * Renders the barcode control with nodes and connectors
     *
     * @returns {void}
     */
    BarcodeGenerator.prototype.render = function () {
        this.notify('initial-load', {});
        /**
         * Used to load context menu
         */
        this.trigger('load');
        this.notify('initial-end', {});
        this.renderElements();
        this.renderComplete();
    };
    /**
     * Returns the module name of the barcode
     *
     * @returns {string}  Returns the module name of the barcode
     */
    BarcodeGenerator.prototype.getModuleName = function () {
        return 'barcode';
    };
    /**
     *To provide the array of modules needed for control rendering
     *
     * @function destroy
     * @returns {ModuleDeclaration[]} To provide the array of modules needed for control rendering
     * @private
     */
    BarcodeGenerator.prototype.requiredModules = function () {
        var modules = [];
        return modules;
    };
    /**
     * It is used to destroy the Barcode component.
     *
     * @function destroy
     * @returns {void}
     */
    BarcodeGenerator.prototype.destroy = function () {
        this.notify('destroy', {});
        _super.prototype.destroy.call(this);
    };
    __decorate([
        Property('100%')
    ], BarcodeGenerator.prototype, "width", void 0);
    __decorate([
        Property('100px')
    ], BarcodeGenerator.prototype, "height", void 0);
    __decorate([
        Property('SVG')
    ], BarcodeGenerator.prototype, "mode", void 0);
    __decorate([
        Property('Code128')
    ], BarcodeGenerator.prototype, "type", void 0);
    __decorate([
        Property(undefined)
    ], BarcodeGenerator.prototype, "value", void 0);
    __decorate([
        Property(true)
    ], BarcodeGenerator.prototype, "enableCheckSum", void 0);
    __decorate([
        Complex({}, DisplayText)
    ], BarcodeGenerator.prototype, "displayText", void 0);
    __decorate([
        Complex({}, Margin)
    ], BarcodeGenerator.prototype, "margin", void 0);
    __decorate([
        Property('white')
    ], BarcodeGenerator.prototype, "backgroundColor", void 0);
    __decorate([
        Property('black')
    ], BarcodeGenerator.prototype, "foreColor", void 0);
    __decorate([
        Event()
    ], BarcodeGenerator.prototype, "invalid", void 0);
    return BarcodeGenerator;
}(Component));
export { BarcodeGenerator };
