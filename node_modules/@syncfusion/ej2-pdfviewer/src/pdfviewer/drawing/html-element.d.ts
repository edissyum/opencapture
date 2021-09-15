import { DrawingElement } from '@syncfusion/ej2-drawings';
/**
 * HTMLElement defines the basic html elements
 */
export declare class DiagramHtmlElement extends DrawingElement {
    /**
     * set the id for each element
     *
     * @param {string} nodeTemplate - Set the id for each element.
     * @returns {void}
     *
     * @private
     */
    constructor(nodeTemplate?: string);
    templateCompiler(template: string): Function;
    /**
     * getNodeTemplate method \
     *
     * @returns { Function } getNodeTemplate method .\
     *
     * @private
     */
    getNodeTemplate(): Function;
    private templateFn;
    /**
     * check whether it is html element or not
     *
     * @private
     */
    isTemplate: boolean;
    /**
     * defines geometry of the html element
     *
     * @private
     */
    template: HTMLElement;
}
