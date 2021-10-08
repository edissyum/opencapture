import { Container } from './container';
import { Size } from '../../primitives/size';
/**
 * Canvas module is used to define a plane(canvas) and to arrange the children based on margin
 */
export declare class Canvas extends Container {
    /**
     * Not applicable for canvas
     *
     *  @private
     */
    measureChildren: boolean;
    /**
     * Measures the minimum space that the canvas requires \
     *
     * @returns { Size } Measures the minimum space that the canvas requires .\
     * @param {string} id - provide the id value.
     * @param {Function} callback - provide the Connector value.
     *
     * @private
     */
    measure(availableSize: Size, id?: string, callback?: Function): Size;
    /**
     * Arranges the child elements of the canvas
     */
    arrange(desiredSize: Size, isStack?: boolean): Size;
    private alignChildBasedOnParent;
    private alignChildBasedOnaPoint;
}
