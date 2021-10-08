import { Container } from './container';
import { Size } from '../../primitives/size';
/**
 * Canvas module is used to define a plane(canvas) and to arrange the children based on margin
 */
export declare class Canvas extends Container {
    /**
     * Not applicable for canvas
     *  @private
     */
    measureChildren: boolean;
    /**
     * Measures the minimum space that the canvas requires
     * @param availableSize
     */
    measure(availableSize: Size): Size;
    /**
     * Arranges the child elements of the canvas
     */
    arrange(desiredSize: Size): Size;
    /**
     * Aligns the child element based on its parent
     * @param child
     * @param childSize
     * @param parentSize
     * @param x
     * @param y
     */
    private alignChildBasedOnParent;
    /**
     * Aligns the child elements based on a point
     * @param child
     * @param x
     * @param y
     */
    private alignChildBasedOnaPoint;
}
