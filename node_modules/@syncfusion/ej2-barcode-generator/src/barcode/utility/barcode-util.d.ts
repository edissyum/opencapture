/**
 * Barcode util
 */
import { BarcodeRenderer } from './../../barcode/rendering/renderer';
import { QRCodeGeneratorModel } from '../../qrcode/qrcode-model';
import { DataMatrixGeneratorModel } from '../../datamatrix/datamatrix-model';
import { QRCodeGenerator } from '../../qrcode/qrcode';
import { DataMatrixGenerator } from '../../datamatrix/datamatrix';
import { RenderingMode } from '../enum/enum';
import { BaseAttributes } from './../../barcode/rendering/canvas-interface';
import { BarcodeGenerator } from '../barcode';
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
export declare function removeChildElements(newProp: QRCodeGeneratorModel | DataMatrixGeneratorModel, barcodeCanvas: HTMLElement, mode: RenderingMode, id: string): BarcodeRenderer;
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
export declare function getBaseAttributes(width: number, height: number, offSetX: number, offsetY: number, color: string, strokeColor?: string): BaseAttributes;
/**
 * Clear the canvas element.\
 *
 * @returns {void} Clear the canvas element .
 * @param {QRCodeGenerator} view - Provide the view .
 * @param {HTMLCanvasElement} barcodeCanvas - Provide the canvas element .
 * @private
 */
export declare function clearCanvas(view: QRCodeGenerator | DataMatrixGenerator, barcodeCanvas: HTMLCanvasElement): void;
/**
 * Refresh the canvas barcode.\
 *
 * @returns {void} Refresh the canvas barcode .
 * @param {QRCodeGenerator} qrCodeGenerator - Provide the qr code element .
 * @param {HTMLCanvasElement} barcodeCanvas - Provide the canvas element .
 * @private
 */
export declare function refreshCanvasBarcode(qrCodeGenerator: QRCodeGenerator | DataMatrixGenerator, barcodeCanvas: HTMLCanvasElement): void;
/**
 * Will download the barode .\
 *
 * @returns {void} Will download the barode as image .
 * @param {QRCodeGenerator} type - Provide the qr code element .
 * @param {HTMLCanvasElement} fileName - Provide the canvas element .
 * @param {HTMLCanvasElement} url - Provide the url string value .
 * @private
 */
export declare function triggerDownload(type: string, fileName: string, url: string): void;
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
export declare function exportAsImage(exportType: string, fileName: string, element: Element, isReturnBase64: boolean, code: BarcodeGenerator | QRCodeGenerator | DataMatrixGenerator): Promise<string>;
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
export declare function imageExport(type: string, fileName: string, element: Element, isReturnBase64: boolean, code: BarcodeGenerator | QRCodeGenerator | DataMatrixGenerator): Promise<string>;
