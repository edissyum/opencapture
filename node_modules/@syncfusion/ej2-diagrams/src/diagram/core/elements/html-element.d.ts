import { DiagramElement } from './diagram-element';
import { AnnotationConstraints } from '../../enum/enum';
/**
 * HTMLElement defines the basic html elements
 */
export declare class DiagramHtmlElement extends DiagramElement {
    /**
     * set the id for each element \
     *
     * @returns { void }set the id for each element\
     * @param {string} nodeId - provide the x value.
     * @param {string} diagramId - provide the y value.
     * @param {string} annotationId - provide the id value.
     * @param {string} nodeTemplate - provide the id value.
     *
     * @private
     */
    constructor(nodeId: string, diagramId: string, annotationId?: string, nodeTemplate?: string);
    /**
     * getNodeTemplate method \
     *
     * @returns { Function } getNodeTemplate method .\
     *
     * @private
     */
    getNodeTemplate(): Function;
    private templateFn;
    private data;
    /**
     * Gets the node id for the element
     */
    nodeId: string;
    /**
     * check whether it is html element or not
     *
     * @private
     */
    isTemplate: boolean;
    /**
     * defines the id of the annotation on rendering template on label.
     * @private
     */
    annotationId: string;
    /**
     * defines the constraints of the annotation on rendering template on label.
     *
     * @private
     */
    constraints: AnnotationConstraints;
    /**
     * Gets the diagram id for the html element
     */
    diagramId: string;
    /**
     * Specifies whether the getcontent has to be executed or not.
     */
    private canReset;
    /**
     * Gets or sets the geometry of the html element \
     *
     * @returns { string | HTMLElement } Gets or sets the geometry of the html element \
     *
     * @private
     */
    /**
    * Gets or sets the value of the html element \
    *
    * @returns { void }Gets or sets the value of the html element\
    * @param {string | HTMLElement} value - provide the value value.
    *
    * @private
    */
    content: string | HTMLElement;
    /**
     * defines geometry of the html element
     *
     * @private
     */
    template: HTMLElement;
}
