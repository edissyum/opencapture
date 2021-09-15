import { TextStyleModel } from '../appearance-model';
import { Size } from '../../primitives/size';
import { DrawingElement } from './drawing-element';
import { SubTextElement, TextBounds } from '../../rendering/canvas-interface';
/**
 * TextElement is used to display text/annotations
 */
export declare class TextElement extends DrawingElement {
    /**
     * set the id for each element
     */
    constructor();
    /**
     * sets or gets the image source
     */
    private textContent;
    /** @private */
    canMeasure: boolean;
    /** @private */
    canConsiderBounds: boolean;
    /** @private */
    doWrap: boolean;
    /**
     * gets the content for the text element
     */
    /**
    * sets the content for the text element
    */
    content: string;
    private textNodes;
    /**
     * sets the content for the text element
     */
    /**
    * gets the content for the text element
    */
    childNodes: SubTextElement[];
    private textWrapBounds;
    /**
     * gets the wrapBounds for the text
     */
    /**
    * sets the wrapBounds for the text
    */
    wrapBounds: TextBounds;
    /** @private */
    refreshTextElement(): void;
    /**
     * Defines the appearance of the text element
     */
    style: TextStyleModel;
    /**
     * Measures the minimum size that is required for the text element
     * @param availableSize
     */
    measure(availableSize: Size): Size;
    /**
     * Arranges the text element
     * @param desiredSize
     */
    arrange(desiredSize: Size): Size;
}
