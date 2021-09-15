import { Size } from '../../primitives/size';
import { DiagramElement } from './diagram-element';
import { Rect } from '../../primitives/rect';
import { PointModel } from '../../primitives/point-model';
/**
 * PathElement takes care of how to align the path based on offsetX and offsetY
 */
export declare class PathElement extends DiagramElement {
    /**
     * set the id for each element
     */
    constructor();
    /**
     * Gets or sets the geometry of the path element
     */
    private pathData;
    /**
     *   Gets the geometry of the path element\
     *
     * @returns { string | SVGElement }  Gets the geometry of the path element.\
     *
     * @private
     */
    /**
    *  Sets the geometry of the path element \
    *
    * @returns { void } Sets the geometry of the path element.\
    * @param {string} value - provide the id value.
    *
    * @private
    */
    data: string;
    /**
     * Gets/Sets whether the path has to be transformed to fit the given x,y, width, height
     */
    transformPath: boolean;
    /**
     * Gets/Sets the equivalent path, that will have the origin as 0,0
     */
    absolutePath: string;
    /**   @private  */
    canMeasurePath: boolean;
    /**   @private  */
    absoluteBounds: Rect;
    private points;
    private pointTimer;
    /**
     * getPoints methods  \
     *
     * @returns { PointModel[] } Sets the geometry of the path element.\
     *
     * @private
     */
    getPoints(): PointModel[];
    /**
     * Measures the minimum space that is required to render the element  \
     *
     * @returns { Size } Measures the minimum space that is required to render the element.\
     * @param {Size} availableSize - provide the id value.
     *
     * @private
     */
    measure(availableSize: Size): Size;
    /**
     * Arranges the path element  \
     *
     * @returns { Size } Arranges the path element.\
     * @param {Size} desiredSize - provide the id value.
     *
     * @private
     */
    arrange(desiredSize: Size): Size;
    /**
     *  Translates the path to 0,0 and scales the path based on the actual size  \
     *
     * @returns { Size } Arranges the path element.\
     * @param {string} pathData - provide the id value.
     * @param {Rect} bounds - provide the id value.
     * @param {Size} actualSize - provide the id value.
     *
     * @private
     */
    updatePath(pathData: string, bounds: Rect, actualSize: Size): string;
}
