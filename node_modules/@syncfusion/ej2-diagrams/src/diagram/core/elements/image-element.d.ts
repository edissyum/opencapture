import { Size } from '../../primitives/size';
import { DiagramElement } from './diagram-element';
import { Stretch, Scale, ImageAlignment } from '../../enum/enum';
/**
 * ImageElement defines a basic image elements
 */
export declare class ImageElement extends DiagramElement {
    /**
     * set the id for each element
     */
    constructor();
    /**
     * sets or gets the image source
     */
    private imageSource;
    /**
     * Gets the source for the image element
     */
    /**
     * Gets the source for the image element \
     *
     * @returns { void }Gets the source for the image element.\
     *
     * @private
     */
    /**
    * Sets the source for the image element \
    *
    * @returns { void }Sets the source for the image element.\
    * @param {string} value - provide the id value.
    *
    * @private
    */
    source: string;
    /**
     * sets scaling factor of the image
     */
    imageScale: Scale;
    /**
     * sets the alignment of the image
     */
    imageAlign: ImageAlignment;
    /**
     * Sets how to stretch the image
     */
    stretch: Stretch;
    /**
     * Saves the actual size of the image
     */
    contentSize: Size;
    /**
     * Measures minimum space that is required to render the image \
     *
     * @returns { Size }Measures minimum space that is required to render the image.\
     * @param {Size} availableSize - provide the id value.
     * @param {Object} id - provide the id value.
     * @param {Function} callback - provide the id value.
     *
     * @private
     */
    measure(availableSize: Size, id?: string, callback?: Function): Size;
    /**
     * Arranges the image
     * @param {Size} desiredSize
     */
    /**
     * Arranges the image \
     *
     * @returns { Size }Arranges the image.\
     * @param {Size} desiredSize - provide the id value.
     *
     * @private
     */
    arrange(desiredSize: Size): Size;
}
