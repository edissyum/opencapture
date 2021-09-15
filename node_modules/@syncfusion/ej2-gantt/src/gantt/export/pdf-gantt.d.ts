import { PdfGanttTaskbarCollection } from './pdf-taskbar';
import { PageDetail } from '../base/interface';
import { PdfLayoutResult, PdfColor } from '@syncfusion/ej2-pdf-export';
import { Gantt } from '../base/gantt';
import { PdfTreeGrid } from './pdf-treegrid';
import { PdfTimeline } from './pdf-timeline';
import { PdfGanttPredecessor } from './pdf-connector-line';
/**
 *
 */
export declare class PdfGantt extends PdfTreeGrid {
    taskbarCollection: PdfGanttTaskbarCollection[];
    predecessorCollection: PdfGanttPredecessor[];
    private taskbars;
    private totalPages;
    private exportProps;
    private perColumnPages;
    private headerDetails;
    pdfPageDetail: PageDetail[];
    result: PdfLayoutResult;
    timelineStartDate: Date;
    private startPoint;
    private startPageIndex;
    borderColor: PdfColor;
    predecessor: PdfGanttPredecessor;
    chartHeader: PdfTimeline;
    chartPageIndex: number;
    parent: Gantt;
    constructor(parent: Gantt);
    readonly taskbar: PdfGanttTaskbarCollection;
    drawChart(result: PdfLayoutResult): void;
    private calculateRange;
    private drawPageBorder;
    private drawGantttChart;
}
