import { PdfGantt } from './pdf-gantt';
import { PointF, PdfPage } from '@syncfusion/ej2-pdf-export';
import { TimelineDetails, TimelineFormat } from '../base/interface';
import { Gantt } from '../base/gantt';
/**
 */
export declare class PdfTimeline {
    parent: Gantt;
    private gantt;
    topTier: TimelineFormat[];
    bottomTier: TimelineFormat[];
    width: number;
    height: number;
    topTierCellWidth: number;
    bottomTierCellWidth: number;
    topTierHeight: number;
    bottomTierHeight: number;
    private topTierPoint;
    private bottomTierPoint;
    private topTierIndex;
    private bottomTierIndex;
    private prevTopTierIndex;
    private prevBottomTierIndex;
    constructor(gantt?: PdfGantt);
    /**
     * @private
     * @param {PdfPage} page .
     * @param {PointF} startPoint .
     * @param {TimelineDetails} detail .
     * @returns {void}
     */
    drawTimeline(page: PdfPage, startPoint: PointF, detail: TimelineDetails): void;
    /**
     *
     * @param {PdfPage} page .
     * @param {PointF} startPoint .
     * @param {TimelineDetails}  detail .
     * @returns {void} .
     * Draw the specific gantt chart side header when the taskbar exceeds the page
     * @private
     */
    drawPageTimeline(page: PdfPage, startPoint: PointF, detail: TimelineDetails): void;
    /**
     * Method to trigger pdf query timelinecell event
     */
    private triggerQueryTimelinecell;
}
