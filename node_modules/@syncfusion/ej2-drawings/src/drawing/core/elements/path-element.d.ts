import { Size } from '../../primitives/size';
import { DrawingElement } from './drawing-element';
import { Rect } from '../../primitives/rect';
/**
 * PathElement takes care of how to align the path based on offsetX and offsetY
 */
export declare class PathElement extends DrawingElement {
    /**
     * set the id for each element
     */
    constructor();
    /**
     * Gets or sets the geometry of the path element
     */
    private pathData;
    /**
     * Gets the geometry of the path element
     */
    /**
    * Sets the geometry of the path element
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
     * Measures the minimum space that is required to render the element
     * @param availableSize
     */
    measure(availableSize: Size): Size;
    /**
     * Arranges the path element
     * @param desiredSize
     */
    arrange(desiredSize: Size): Size;
    /**
     * Translates the path to 0,0 and scales the path based on the actual size
     * @param pathData
     * @param bounds
     * @param actualSize
     */
    updatePath(pathData: string, bounds: Rect, actualSize: Size): string;
}
