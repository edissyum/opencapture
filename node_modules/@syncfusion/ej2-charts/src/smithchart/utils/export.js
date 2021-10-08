/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable valid-jsdoc */
import { print as smithchartPrint, createElement, isNullOrUndefined, Browser } from '@syncfusion/ej2-base';
import { getElement } from '../utils/helper';
import { smithchartBeforePrint } from '../utils/enum';
import { PdfPageOrientation, PdfDocument, PdfBitmap } from '@syncfusion/ej2-pdf-export';
/**
 * Annotation Module handles the Annotation for Maps
 */
var ExportUtils = /** @class */ (function () {
    /**
     * Constructor for Maps
     *
     * @param {Smithchart} control smithchart instance
     */
    function ExportUtils(control) {
        this.control = control;
    }
    /**
     * To print the Maps
     *
     * @param {string} elements html element
     * @returns {void}
     */
    ExportUtils.prototype.print = function (elements) {
        this.smithchartPrint = window.open('', 'print', 'height=' + window.outerHeight + ',width=' + window.outerWidth + ',tabbar=no');
        this.smithchartPrint.moveTo(0, 0);
        this.smithchartPrint.resizeTo(screen.availWidth, screen.availHeight);
        var argsData = {
            cancel: false,
            htmlContent: this.getHTMLContent(elements),
            name: smithchartBeforePrint
        };
        this.control.trigger(smithchartBeforePrint, argsData);
        if (!argsData.cancel) {
            smithchartPrint(argsData.htmlContent, this.smithchartPrint);
        }
    };
    /**
     * To get the html string of the Maps
     *
     * @param {string} svgElements svg element
     * @private
     * @returns {Element} content of the html element
     */
    ExportUtils.prototype.getHTMLContent = function (svgElements) {
        var div = createElement('div');
        if (svgElements) {
            if (svgElements instanceof Array) {
                svgElements.forEach(function (value) {
                    div.appendChild(getElement(value).cloneNode(true));
                });
            }
            else if (svgElements instanceof Element) {
                div.appendChild(svgElements.cloneNode(true));
            }
            else {
                div.appendChild(getElement(svgElements).cloneNode(true));
            }
        }
        else {
            div.appendChild(this.control.element.cloneNode(true));
        }
        return div;
    };
    /**
     * To export the file as image/svg format
     *
     * @param {SmithchartExportType} exportType export type
     * @param {string} fileName export file name
     * @param {PdfPageOrientation} orientation orientation of the page
     * @returns {void}
     */
    ExportUtils.prototype.export = function (exportType, fileName, orientation) {
        var _this = this;
        var canvas = createElement('canvas', {
            id: 'ej2-canvas',
            attrs: {
                'width': this.control.availableSize.width.toString(),
                'height': this.control.availableSize.height.toString()
            }
        });
        var isDownload = !(Browser.userAgent.toString().indexOf('HeadlessChrome') > -1);
        orientation = isNullOrUndefined(orientation) ? PdfPageOrientation.Landscape : orientation;
        var svgData = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
            this.control.svgObject.outerHTML +
            '</svg>';
        var url = window.URL.createObjectURL(new Blob(exportType === 'SVG' ? [svgData] :
            [(new XMLSerializer()).serializeToString(this.control.svgObject)], { type: 'image/svg+xml' }));
        if (exportType === 'SVG') {
            this.triggerDownload(fileName, exportType, url, isDownload);
        }
        else {
            var image_1 = new Image();
            var ctx_1 = canvas.getContext('2d');
            image_1.onload = (function () {
                ctx_1.drawImage(image_1, 0, 0);
                window.URL.revokeObjectURL(url);
                if (exportType === 'PDF') {
                    var document_1 = new PdfDocument();
                    var imageString = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');
                    document_1.pageSettings.orientation = orientation;
                    imageString = imageString.slice(imageString.indexOf(',') + 1);
                    document_1.pages.add().graphics.drawImage(new PdfBitmap(imageString), 0, 0, (_this.control.availableSize.width - 60), _this.control.availableSize.height);
                    if (isDownload) {
                        document_1.save(fileName + '.pdf');
                        document_1.destroy();
                    }
                }
                else {
                    _this.triggerDownload(fileName, exportType, canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'), isDownload);
                }
            });
            image_1.src = url;
        }
    };
    /**
     * To trigger the download element
     *
     * @param {string} fileName export file name
     * @param {SmithchartExportType} exportType export type
     * @param {string} url file url
     * @param {boolean} isDownload download
     */
    ExportUtils.prototype.triggerDownload = function (fileName, exportType, url, isDownload) {
        createElement('a', {
            attrs: {
                'download': fileName + '.' + exportType.toLocaleLowerCase(),
                'href': url
            }
        }).dispatchEvent(new MouseEvent(isDownload ? 'click' : 'move', {
            view: window,
            bubbles: false,
            cancelable: true
        }));
    };
    return ExportUtils;
}());
export { ExportUtils };
