import { PdfColor } from '@syncfusion/ej2-pdf-export';
import { IGanttStyle } from './../base/interface';
import { Gantt } from './../base/gantt';
import { PdfGantt } from './pdf-gantt';
/**
 * @hidden
 */
export declare class PdfGanttPredecessor {
    parentLeft?: number;
    childLeft?: number;
    parentWidth?: number;
    childWidth?: number;
    parentIndex?: number;
    childIndex?: number;
    rowHeight?: number;
    type?: string;
    milestoneParent?: boolean;
    milestoneChild?: boolean;
    lineWidth?: number;
    connectorLineColor?: PdfColor;
    pdfGantt?: PdfGantt;
    parent?: Gantt;
    ganttStyle: IGanttStyle;
    /**
     * @returns {PdfGanttPredecessor} .
     * @hidden
     */
    add(): PdfGanttPredecessor;
    constructor(parent?: Gantt, pdfGantt?: PdfGantt);
    /**
     * Calculate the predecesor line point and draw the predecessor
     *
     * @param {PdfGantt} pdfGantt .
     * @returns {void}
     * @private
     */
    drawPredecessor(pdfGantt: PdfGantt): void;
    /**
     * Method to draw the predecessor lines with calculated connector points
     *
     * @private
     */
    private connectLines;
    /**
     * Method to check the predecessor line  occurs within the page
     *
     * @param {RectangleF} rect .
     * @param {number} x .
     * @param {number} y .
     * @returns {boolean} .
     * @private
     */
    private contains;
    /**
     * Find the PDF page index of given point
     *
     * @param {PointF} point .
     * @returns {number} .
     * @private
     */
    private findPageIndex;
    /**
     * Draw predecessor line
     *
     * @param {PdfPage} page .
     * @param {PointF} startPoint .
     * @param {PointF} endPoint .
     * @returns {void} .
     * @private
     */
    private drawLine;
    /**
     * Draw predecessor arrow
     *
     * @param {PdfPage} page .
     * @param {PdfGanttTaskbarCollection} childTask .
     * @param {number} midPoint .
     * @returns {void} .
     * @private
     */
    private drawArrow;
}
