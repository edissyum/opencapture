import { Chart } from '../chart';
import { AccumulationChart } from '../../accumulation-chart';
import { RangeNavigator } from '../../range-navigator';
import { PdfPageOrientation } from '@syncfusion/ej2-pdf-export';
import { ExportType } from '../../common/utils/enum';
import { StockChart } from '../../stock-chart';
import { IPDFArgs } from '../../common/model/interface';
/**
 * `ExportModule` module is used to print and export the rendered chart.
 */
export declare class Export {
    private chart;
    /**
     * Constructor for export module.
     *
     * @private
     */
    constructor(chart: Chart);
    /**
     * Handles the export method for chart control.
     */
    export(type: ExportType, fileName: string, orientation?: PdfPageOrientation, controls?: (Chart | AccumulationChart | RangeNavigator | StockChart)[], width?: number, height?: number, isVertical?: boolean, header?: IPDFArgs, footer?: IPDFArgs): void;
    /**
     * To get data url for charts.
     */
    getDataUrl(chart: Chart | AccumulationChart): {
        element: HTMLCanvasElement;
        dataUrl?: string;
        blobUrl?: string;
    };
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the chart.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
