/**
 * Ruler component
 */
import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * Represents the Ruler helpers.
 */
export declare class RulerHelper extends TestHelper {
    /**
     * Specifies the ID of the ruler.
     */
    id: string;
    /**
     * Specifies the current helper function of the ruler.
     */
    wrapperFn: Function;
    /**
     * Constructor for creating the helper object for ruler component.
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Gets the root element of the ruler component.
     */
    getElement(): any;
    /**
     * Returns ruler element of the ruler component. It may be either horizontal or vertical.
     * @param ID Defines the ID of the ruler component.
     * @param isVertical Specifies whether ruler required element is vertical ruler element or not.
     */
    getRulerElement(id: string, isVertical: boolean): any;
    /**
     * Returns the marker element of the ruler component. It may be either horizontal or vertical.
     * @param ID Defines the ID of the ruler component.
     * @param isVertical Specifies whether ruler required element is vertical ruler element or not.
     */
    getMarkerElement(id: string, isVertical: boolean): any;
}
