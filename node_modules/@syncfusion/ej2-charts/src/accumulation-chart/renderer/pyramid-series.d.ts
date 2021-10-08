/**
 * Defines the behavior of a pyramid series
 */
import { AccPoints, AccumulationSeries } from '../model/acc-base';
import { TriangularBase } from './triangular-base';
/**
 * PyramidSeries module used to render `Pyramid` Series.
 */
export declare class PyramidSeries extends TriangularBase {
    /**
     * Defines the path of a pyramid segment
     */
    private getSegmentData;
    /**
     * Initializes the size of the pyramid segments
     *
     * @private
     */
    protected initializeSizeRatio(points: AccPoints[], series: AccumulationSeries): void;
    /**
     * Defines the size of the pyramid segments, the surface of that will reflect the values
     */
    private calculateSurfaceSegments;
    /**
     * Finds the height of pyramid segment
     */
    private getSurfaceHeight;
    /**
     * Solves quadratic equation
     */
    private solveQuadraticEquation;
    /**
     * Renders a pyramid segment
     */
    private renderPoint;
    /**
     * To get the module name of the Pyramid series.
     */
    protected getModuleName(): string;
    /**
     * To destroy the pyramid series
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
