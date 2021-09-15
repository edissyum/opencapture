import { PdfViewer } from '../index';
/**
 * @param {ClientRect} bounds - Specified the bounds of the annotation.
 * @param {string} commonStyle  - Specified the annotation styles.
 * @param {HTMLElement} cavas  - Specified the annotation canvas element.
 * @param {number} index - Specified the page index value.
 * @param {PdfViewer} pdfViewer - Specified the pdfviewer element.
 * @hidden
 * @returns {void}
 */
export declare function renderAdornerLayer(bounds: ClientRect, commonStyle: string, cavas: HTMLElement, index: number, pdfViewer: PdfViewer): void;
/**
 * @param {string} id - Specified the Id of the svg element.
 * @param {string | number} width - Specified the width of the svg element.
 * @param {string | number} height - Specified the height of the svg element.
 * @hidden
 * @returns {SVGElement} - Returns the svg element.
 */
export declare function createSvg(id: string, width: string | number, height: string | number): SVGElement;
