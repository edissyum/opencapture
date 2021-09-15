import { createElement, isNullOrUndefined, Browser, print as printWindow } from '@syncfusion/ej2-base';
import { PdfPageOrientation, PdfDocument, PdfBitmap } from '@syncfusion/ej2-pdf-export';
import { SvgRenderer } from '@syncfusion/ej2-svg-base';
import { removeElement } from '../utils/helper';
import { SizeF } from '@syncfusion/ej2-pdf-export';
var ExportUtils = /** @class */ (function () {
    /**
     * Constructor for Heatmap
     *
     * @param  {HeatMap} control - specifies the control
     *
     */
    function ExportUtils(control) {
        this.control = control;
    }
    /**
     * To export the file as image/svg format
     *
     * @param type
     * @param fileName
     * @private
     */
    ExportUtils.prototype.export = function (type, fileName, orientation) {
        var _this = this;
        var controlValue = this.getControlsValue();
        var width = controlValue.width;
        var height = controlValue.height;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var element = this.control.svgObject;
        var isCanvas = this.control.enableCanvasRendering;
        var image;
        if (!isCanvas) {
            element = createElement('canvas', {
                id: 'ej2-canvas',
                attrs: {
                    'width': width.toString(),
                    'height': height.toString()
                }
            });
        }
        var isDownload = !(Browser.userAgent.toString().indexOf('HeadlessChrome') > -1);
        orientation = isNullOrUndefined(orientation) ? PdfPageOrientation.Landscape : orientation;
        var svgData = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
            controlValue.svg.outerHTML +
            '</svg>';
        var url = window.URL.createObjectURL(new Blob(type === 'SVG' ? [svgData] :
            [(new XMLSerializer()).serializeToString(controlValue.svg)], { type: 'image/svg+xml' }));
        if (type === 'SVG') {
            if (Browser.info.name === 'msie') {
                var svg = new Blob([(new XMLSerializer()).serializeToString(controlValue.svg)], { type: 'application/octet-stream' });
                window.navigator.msSaveOrOpenBlob(svg, fileName + '.' + type.toLocaleLowerCase());
            }
            else {
                this.triggerDownload(fileName, type, url, isDownload);
            }
        }
        else if (Browser.info.name === 'msie') {
            var canvas = element;
            if (!isCanvas) {
                canvas = this.createCanvas();
            }
            image = canvas.toDataURL(type);
            if (type === 'PDF') {
                this.exportPdf(canvas, orientation, width, height, isDownload, fileName);
            }
            else {
                this.doExport(type, image, fileName);
            }
        }
        else {
            var image_1 = new Image();
            var ctx_1 = element.getContext('2d');
            image_1.onload = (function () {
                ctx_1.drawImage(image_1, 0, 0);
                window.URL.revokeObjectURL(url);
                if (type === 'PDF') {
                    _this.exportPdf(element, orientation, width, height, isDownload, fileName);
                }
                else {
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(element.msToBlob(), fileName + '.' + type.toLocaleLowerCase());
                    }
                    else {
                        _this.triggerDownload(fileName, type, element.toDataURL('image/png').replace('image/png', 'image/octet-stream'), isDownload);
                    }
                }
            });
            image_1.src = url;
        }
        if (!isCanvas) {
            var id = document.getElementById(this.control.element.id);
            removeElement(id + '_canvas');
        }
    };
    /**
     * To trigger the download element
     *
     * @param fileName
     * @param type
     * @param url
     * @private
     */
    ExportUtils.prototype.triggerDownload = function (fileName, type, url, isDownload) {
        createElement('a', {
            attrs: {
                'download': fileName + '.' + type.toLocaleLowerCase(),
                'href': url
            }
        }).dispatchEvent(new MouseEvent(isDownload ? 'click' : 'move', {
            view: window,
            bubbles: false,
            cancelable: true
        }));
    };
    /**
     * To get the maximum size value
     *
     * @param controls
     * @param name
     */
    ExportUtils.prototype.getControlsValue = function () {
        var width = 0;
        var height = 0;
        var isCanvas = this.control.enableCanvasRendering;
        var svgObject = new SvgRenderer('').createSvg({
            id: 'Svg_Export_Element',
            width: 200, height: 200
        });
        var svg = this.control.svgObject.cloneNode(true);
        var groupEle = this.control.renderer.createGroup({
            style: 'transform: translateY(' + height + 'px)'
        });
        if (!isCanvas) {
            groupEle.appendChild(svg);
        }
        width = Math.max(this.control.availableSize.width, width);
        height = height + this.control.availableSize.height;
        if (!isCanvas) {
            svgObject.appendChild(groupEle);
        }
        if (!isCanvas) {
            svgObject.setAttribute('width', width + '');
            svgObject.setAttribute('height', height + '');
        }
        return {
            'width': width,
            'height': height,
            'svg': svgObject
        };
    };
    ExportUtils.prototype.createCanvas = function () {
        var heatmap = this.control;
        var renderMode = heatmap.renderingMode;
        heatmap.renderingMode = 'Canvas';
        heatmap.refresh();
        var canvas = heatmap.svgObject;
        heatmap.renderingMode = renderMode;
        heatmap.refresh();
        return canvas;
    };
    ExportUtils.prototype.exportPdf = function (element, orientation, width, height, isDownload, fileName) {
        var document = new PdfDocument();
        var margin = document.pageSettings.margins;
        var pdfDefaultWidth = document.pageSettings.width;
        var pdfDefaultHeight = document.pageSettings.height;
        var imageString = element.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');
        document.pageSettings.orientation = orientation;
        var exactWidth = (pdfDefaultWidth < width) ? (width + margin.left + margin.right) : pdfDefaultWidth;
        var exactHeight = (pdfDefaultHeight < height) ? (height + margin.top + margin.bottom) : pdfDefaultHeight;
        document.pageSettings.size = new SizeF(exactWidth, exactHeight);
        imageString = imageString.slice(imageString.indexOf(',') + 1);
        document.pages.add().graphics.drawImage(new PdfBitmap(imageString), 0, 0, width, height);
        if (isDownload) {
            document.save(fileName + '.pdf');
            document.destroy();
        }
    };
    ExportUtils.prototype.doExport = function (type, image, fileName) {
        var images = [];
        var fileType = type || 'JPG';
        images = [image];
        this.exportImage(images, fileName, fileType, image);
    };
    ExportUtils.prototype.exportImage = function (images, fileName, fileType, image) {
        var buffers = [];
        var length = (!(images instanceof HTMLElement)) ? images.length : 0;
        for (var g = 0; g < length; g++) {
            image = images[g];
            image = image.replace(/^data:[a-z]*;,/, '');
            var image1 = image.split(',');
            var byteString = atob(image1[1]);
            var buffer = new ArrayBuffer(byteString.length);
            var intArray = new Uint8Array(buffer);
            for (var i = 0; i < byteString.length; i++) {
                intArray[i] = byteString.charCodeAt(i);
            }
            buffers.push(buffer);
        }
        for (var j = 0; j < buffers.length; j++) {
            var b = new Blob([buffers[j]], { type: 'application/octet-stream' });
            if (Browser.info.name === 'msie') {
                window.navigator.msSaveOrOpenBlob(b, fileName + '.' + fileType.toLocaleLowerCase());
            }
        }
    };
    /**
     * To print the heatmap elements.
     *
     * @param elements
     * @private
     */
    ExportUtils.prototype.print = function () {
        this.printWindow = window.open('', 'print', 'height=' + window.outerHeight + ',width=' + window.outerWidth + ',tabbar=no');
        this.printWindow.moveTo(0, 0);
        this.printWindow.resizeTo(screen.availWidth, screen.availHeight);
        if (this.control.renderingMode === 'SVG') {
            printWindow(this.getHTMLContent(), this.printWindow);
        }
        else {
            var element = this.control.svgObject;
            var dataUrl = element.toDataURL();
            var image_2 = new Image();
            var ctx_2 = element.getContext('2d');
            image_2.onload = (function () {
                ctx_2.drawImage(image_2, 0, 0);
            });
            image_2.src = dataUrl;
            printWindow(image_2, this.printWindow);
        }
    };
    /**
     * To get the html string of the heatmap.
     *
     * @param elements
     * @private
     */
    ExportUtils.prototype.getHTMLContent = function () {
        var div = createElement('div');
        div.appendChild(this.control.element.cloneNode(true));
        return div;
    };
    return ExportUtils;
}());
export { ExportUtils };
