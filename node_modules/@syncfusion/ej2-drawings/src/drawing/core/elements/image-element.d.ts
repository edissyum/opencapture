import { Size } from '../../primitives/size';
import { DrawingElement } from './drawing-element';
import { Stretch, Scale, ImageAlignment } from '../../enum/enum';
/**
 * ImageElement defines a basic image elements
 */
export declare class ImageElement extends DrawingElement {
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
    * Sets the source for the image element
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
     * Measures minimum space that is required to render the image
     * @param availableSize
     */
    measure(availableSize: Size): Size;
    /**
     * Arranges the image
     * @param desiredSize
     */
    arrange(desiredSize: Size): Size;
}
