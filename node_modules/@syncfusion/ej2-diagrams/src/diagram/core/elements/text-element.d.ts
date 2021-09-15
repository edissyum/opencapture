import { TextStyleModel } from '../appearance-model';
import { Size } from '../../primitives/size';
import { DiagramElement } from './diagram-element';
import { HyperlinkModel } from './../../objects/annotation-model';
import { AnnotationConstraints } from '../../enum/enum';
import { SubTextElement, TextBounds } from '../../rendering/canvas-interface';
/**
 * TextElement is used to display text/annotations
 */
export declare class TextElement extends DiagramElement {
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
    isLaneOrientation: boolean;
    /** @private */
    canConsiderBounds: boolean;
    /**
     * sets the constraints for the text element
     */
    constraints: AnnotationConstraints;
    /**
     * sets the hyperlink color to blue
     */
    hyperlink: HyperlinkModel;
    /** @private */
    doWrap: boolean;
    /**
     *   gets the content for the text element \
     *
     * @returns { string | SVGElement }  gets the content for the text element.\
     *
     * @private
     */
    /**
    *   sets the content for the text element \
    *
    * @returns { void }  sets the content for the text element.\
    * @param {string} value - provide the id value.
    *
    * @private
    */
    content: string;
    private textNodes;
    /**
     *   gets the content for the text element \
     *
     * @returns { string | SVGElement }  gets the content for the text element.\
     *
     * @private
     */
    /**
    *   sets the content for the text element \
    *
    * @returns { void }  sets the content for the text element.\
    * @param {SubTextElement[]} value - provide the id value.
    *
    * @private
    */
    childNodes: SubTextElement[];
    private textWrapBounds;
    /**
     *   gets the wrapBounds for the text \
     *
     * @returns { string | SVGElement }  gets the wrapBounds for the text.\
     *
     * @private
     */
    /**
    *    sets the wrapBounds for the text \
    *
    * @returns { void }   sets the wrapBounds for the text.\
    * @param {TextBounds} value - provide the id value.
    *
    * @private
    */
    wrapBounds: TextBounds;
    /**
     *    sets the wrapBounds for the text \
     *
     * @returns { void }   sets the wrapBounds for the text.\
     *
     * @private
     */
    refreshTextElement(): void;
    /**
     * Defines the appearance of the text element
     */
    style: TextStyleModel;
    /**
     *Measures the minimum size that is required for the text element\
     *
     * @returns { Size }  Measures the minimum size that is required for the text element.\
     * @param {Size} availableSize - provide the id value.
     *
     * @private
     */
    measure(availableSize: Size): Size;
    /**
     * Arranges the text element\
     *
     * @returns { Size }   Arranges the text element.\
     * @param {Size} desiredSize - provide the id value.
     *
     * @private
     */
    arrange(desiredSize: Size): Size;
}
