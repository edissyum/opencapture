/* eslint-disable valid-jsdoc */
import { createElement, Browser } from '@syncfusion/ej2-base';
import { triggerDownload } from '../utils/helper';
/**
 * Represent the print and export for gauge.
 *
 * @hidden
 */
var ImageExport = /** @class */ (function () {
    /**
     * Constructor for gauge
     *
     * @param control
     */
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    function ImageExport(control) {
        this.control = control;
    }
    /**
     * To export the file as image/svg format
     *
     * @param type
     * @param fileName
     * @private
     */
    ImageExport.prototype.export = function (type, fileName, allowDownload) {
        var _this = this;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var promise = new Promise(function (resolve, reject) {
            var element = createElement('canvas', {
                id: 'ej2-canvas',
                attrs: {
                    'width': _this.control.availableSize.width.toString(),
                    'height': _this.control.availableSize.height.toString()
                }
            });
            var isDownload = !(Browser.userAgent.toString().indexOf('HeadlessChrome') > -1);
            var svgData = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                _this.control.svgObject.outerHTML +
                '</svg>';
            var url = window.URL.createObjectURL(new Blob(type === 'SVG' ? [svgData] :
                [(new XMLSerializer()).serializeToString(_this.control.svgObject)], { type: 'image/svg+xml' }));
            if (type === 'SVG') {
                if (allowDownload) {
                    triggerDownload(fileName, type, url, isDownload);
                }
                else {
                    resolve(null);
                }
            }
            else {
                var image_1 = new Image();
                var context_1 = element.getContext('2d');
                image_1.onload = (function () {
                    context_1.drawImage(image_1, 0, 0);
                    window.URL.revokeObjectURL(url);
                    if (allowDownload) {
                        triggerDownload(fileName, type, element.toDataURL('image/png').replace('image/png', 'image/octet-stream'), isDownload);
                    }
                    else {
                        if (type === 'JPEG') {
                            resolve(element.toDataURL('image/jpeg'));
                        }
                        else if (type === 'PNG') {
                            resolve(element.toDataURL('image/png'));
                        }
                    }
                });
                image_1.src = url;
            }
        });
        return promise;
    };
    /**
     * Get module name.
     */
    ImageExport.prototype.getModuleName = function () {
        return 'ImageExport';
    };
    /**
     * To destroy the ImageExport.
     *
     * @return {void}
     * @private
     */
    ImageExport.prototype.destroy = function (control) {
        /**
         * Destroy method performed here
         */
    };
    return ImageExport;
}());
export { ImageExport };
