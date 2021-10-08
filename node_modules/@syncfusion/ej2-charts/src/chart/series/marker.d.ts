import { Chart } from '../chart';
import { Series } from './chart-series';
import { MarkerExplode } from './marker-explode';
/**
 * Marker module used to render the marker for line type series.
 */
export declare class Marker extends MarkerExplode {
    /**
     * Constructor for the marker module.
     *
     * @private
     */
    constructor(chart: Chart);
    /**
     * Render the marker for series.
     *
     * @returns {void}
     * @private
     */
    render(series: Series): void;
    private renderMarker;
    createElement(series: Series, redraw: boolean): void;
    private getRangeLowPoint;
    /**
     * Animates the marker.
     *
     * @returns {void}
     * @private
     */
    doMarkerAnimation(series: Series): void;
}
