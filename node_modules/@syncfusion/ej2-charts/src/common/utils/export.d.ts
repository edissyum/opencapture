import { Chart } from '../../chart/chart';
import { AccumulationChart } from '../../accumulation-chart/accumulation';
import { ExportType } from '../utils/enum';
import { PdfPageOrientation } from '@syncfusion/ej2-pdf-export';
import { RangeNavigator } from '../..';
import { StockChart } from '../../stock-chart/stock-chart';
import { BulletChart } from '../../bullet-chart/bullet-chart';
import { IPDFArgs } from '../../common/model/interface';
export declare class ExportUtils {
    private control;
    private printWindow;
    /**
     * Constructor for chart and accumulation annotation
     *
     * @param control
     */
    constructor(control: Chart | AccumulationChart | RangeNavigator | StockChart | BulletChart);
    /**
     * To print the accumulation and chart elements
     *
     * @param elements
     */
    print(elements?: string[] | string | Element): void;
    /**
     * To get the html string of the chart and accumulation
     *
     * @param elements
     * @private
     */
    getHTMLContent(elements?: string[] | string | Element): Element;
    /**
     * To export the file as image/svg format
     *
     * @param type
     * @param fileName
     */
    export(type: ExportType, fileName: string, orientation?: PdfPageOrientation, controls?: (Chart | AccumulationChart | RangeNavigator | StockChart | BulletChart)[], width?: number, height?: number, isVertical?: boolean, header?: IPDFArgs, footer?: IPDFArgs): void;
    /**
     * To get data url for charts.
     *
     * @param chart
     */
    getDataUrl(chart: Chart | AccumulationChart): {
        element: HTMLCanvasElement;
        dataUrl?: string;
        blobUrl?: string;
    };
    /**
     * To trigger the download element
     *
     * @param fileName
     * @param type
     * @param url
     */
    triggerDownload(fileName: string, type: ExportType, url: string, isDownload: boolean): void;
    /**
     * To get the maximum size value
     *
     * @param controls
     * @param name
     */
    private getControlsValue;
    private createCanvas;
    /**
     * To convert svg chart into canvas chart to fix export issue in IE
     * We cant export svg to other formats in IE
     *
     * @param enableCanvas
     * @param chart
     * @param enableCanvas
     * @param chart
     */
    private canvasRender;
    private exportPdf;
    private doexport;
    private exportImage;
}
