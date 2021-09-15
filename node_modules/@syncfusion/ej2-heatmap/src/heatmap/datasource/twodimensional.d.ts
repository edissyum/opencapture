/**
 * HeatMap TwoDimensional file
 */
import { HeatMap } from '../heatmap';
export declare class TwoDimensional {
    private heatMap;
    private completeDataSource;
    private tempSizeArray;
    private tempColorArray;
    constructor(heatMap?: HeatMap);
    /**
     * To reconstruct proper two dimensional dataSource depends on min and max values.
     *
     *  @private
     */
    processDataSource(dataSource: Object): void;
    /**
     * To process and create a proper data array.
     *
     *  @private
     */
    private processDataArray;
    /**
     * To get minimum and maximum value
     *
     *  @private
     */
    private getMinMaxValue;
    /**
     * To get minimum value
     *
     *  @private
     */
    private getMinValue;
    /**
     * To get maximum value
     *
     *  @private
     */
    private getMaxValue;
    /**
     * To perform sort operation.
     *
     *  @private
     */
    private performSort;
    /**
     * To get minimum value
     *
     *  @private
     */
    private checkmin;
}
