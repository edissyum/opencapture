/**
 * Barcode util
 */
import { BarcodeRenderer } from './../../barcode/rendering/renderer';
import { BarcodeCanvasRenderer } from './../../barcode/rendering/canvas-renderer';
/**
 * Draw the root element for the barcode.\
 *
 * @returns {BarcodeRenderer} Draw the barcode SVG .
 * @param {QRCodeGeneratorModel} newProp - Provide the new property element .
 * @param {HTMLElement} barcodeCanvas - Provide the canvas element .
 * @param {RenderingMode} mode - Provide rendering mode .
 * @param {string} id - Provide id for the element .
 * @private
 */
export function removeChildElements(newProp, barcodeCanvas, mode, id) {
    var barCodeSVG = barcodeCanvas;
    if (mode === 'SVG' && !newProp.mode) {
        barCodeSVG.innerHTML = '';
    }
    else if (newProp.mode) {
        barCodeSVG.parentNode.removeChild(barCodeSVG);
    }
    return new BarcodeRenderer(id, mode === 'SVG');
}
/**
 * Get the attributes for the barcodes.\
 *
 * @returns {BaseAttributes} Get the attributes for the barcodes .
 * @param {QRCodeGeneratorModel} width - Provide the canvas element .
 * @param {number} height - Provide the height of the  element .
 * @param {number} offSetX - Provide the offset X for the  element .
 * @param {number} offsetY - Provide the offset X for the element .
 * @param {string} color - Provide the color for the element .
 * @param {string} strokeColor - Provide the stroke color for the element .
 * @private
 */
export function getBaseAttributes(width, height, offSetX, offsetY, color, strokeColor) {
    var options = {
        width: width, height: height, x: offSetX, y: offsetY, color: color, strokeColor: strokeColor
    };
    return options;
}
/**
 * Clear the canvas element.\
 *
 * @returns {void} Clear the canvas element .
 * @param {QRCodeGenerator} view - Provide the view .
 * @param {HTMLCanvasElement} barcodeCanvas - Provide the canvas element .
 * @private
 */
export function clearCanvas(view, barcodeCanvas) {
    var width = view.element.offsetWidth * 1.5;
    var height = view.element.offsetHeight * 1.5;
    var ctx = BarcodeCanvasRenderer.getContext(barcodeCanvas);
    ctx.clearRect(0, 0, width, height);
}
/**
 * Refresh the canvas barcode.\
 *
 * @returns {void} Refresh the canvas barcode .
 * @param {QRCodeGenerator} qrCodeGenerator - Provide the qr code element .
 * @param {HTMLCanvasElement} barcodeCanvas - Provide the canvas element .
 * @private
 */
export function refreshCanvasBarcode(qrCodeGenerator, barcodeCanvas) {
    clearCanvas(qrCodeGenerator, barcodeCanvas);
}
/**
 * Will download the barode .\
 *
 * @returns {void} Will download the barode as image .
 * @param {QRCodeGenerator} type - Provide the qr code element .
 * @param {HTMLCanvasElement} fileName - Provide the canvas element .
 * @param {HTMLCanvasElement} url - Provide the url string value .
 * @private
 */
export function triggerDownload(type, fileName, url) {
    var anchorElement = document.createElement('a');
    anchorElement.download = fileName + '.' + type.toLocaleLowerCase();
    anchorElement.href = url;
    anchorElement.click();
}
/**
 * Will export the barode .\
 *
 * @returns {string} Will download the barode as image .
 * @param {QRCodeGenerator} exportType - Provide the export type .
 * @param {HTMLCanvasElement} fileName - Provide the file name .
 * @param {HTMLCanvasElement} element - Provide the url string value .
 * @param {HTMLCanvasElement} isReturnBase64 - Provide the url string value .
 * @param {HTMLCanvasElement} code - Provide the url string value .
 * @private
 */
export function exportAsImage(exportType, fileName, element, isReturnBase64, code) {
    var returnValue = imageExport(exportType, fileName, element, isReturnBase64, code);
    if (returnValue instanceof Promise) {
        returnValue.then(function (data) {
            return data;
        });
    }
    return returnValue;
}
/**
 * Will export the barode as image.\
 *
 * @returns {string} Will download the barode as image .
 * @param {QRCodeGenerator} type - Provide the export type .
 * @param {HTMLCanvasElement} fileName - Provide the file name .
 * @param {HTMLCanvasElement} element - Provide the url string value .
 * @param {HTMLCanvasElement} isReturnBase64 - Provide the url string value .
 * @param {HTMLCanvasElement} code - Provide the url string value .
 * @private
 */
export function imageExport(type, fileName, element, isReturnBase64, code) {
    // eslint-disable-next-line
    var promise = new Promise(function (resolve, reject) {
        // eslint-disable-next-line
        var canvas = element.children[0];
        /* tslint:enable */
        var serializer = 'XMLSerializer';
        var canvasElement = document.createElement('canvas');
        canvasElement.height = element.clientHeight;
        canvasElement.width = element.clientWidth;
        var context = canvasElement.getContext('2d');
        var image = new Image();
        image.onload = function () {
            context.drawImage(image, 0, 0);
            if (!isReturnBase64) {
                triggerDownload(type, fileName, canvasElement.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
                resolve(null);
            }
            else {
                var base64String = (type === 'JPG') ? canvasElement.toDataURL('image/jpg') :
                    canvasElement.toDataURL('image/png');
                resolve(base64String);
            }
        };
        if (code.mode === 'Canvas') {
            image.src = (type === 'JPG') ? canvas.toDataURL('image/jpg') : canvas.toDataURL('image/png');
            canvasElement.height = element.clientHeight * 1.5;
            canvasElement.width = element.clientWidth * 1.5;
            context.scale(2 / 3, 2 / 3);
        }
        else {
            image.src = window.URL.createObjectURL(new Blob([new window[serializer]().serializeToString(element.children[0])], { type: 'image/svg+xml' }));
        }
    });
    return promise;
}
