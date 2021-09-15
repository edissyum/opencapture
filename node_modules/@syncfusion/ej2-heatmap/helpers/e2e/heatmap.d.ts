import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * E2E test helpers for Heatmap to easily interact and the test the component
 */
export declare class HeatMapHelper extends TestHelper {
    id: string;
    wrapperFn: Function;
    constructor(id: string, wrapperFn: Function);
    /**
    * Used to get container of the Heatmap component
    */
    getHeatMapContainer(): any;
    /**
    * Used to get tootip element of the Heatmap component
    */
    getTooltipElement(): any;
    /**
     * Used to get Axis tooltip,Legend tooltip,Title tooltip of Heatmap component.
     */
    getSecondaryElement(): any;
    /**
     * Used to get Legend element of Heatmap component
     */
    getLegendElement(): any;
    /**
     * Used to get Axis element of Heatmap component
     */
    getAxisElement(): any;
    /**
     * Used to get Series element of Heatmap component
     */
    getSeriesElement(): any;
}
