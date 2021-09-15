/**
 * Diagram component
 */
import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * Represents the Diagram helpers.
 */
export declare class DiagramHelper extends TestHelper {
    /**
     * Specifies the ID of the diagram.
     */
    id: string;
    /**
     * Specifies the current helper function of the diagram.
     */
    wrapperFn: Function;
    /**
     * Constructor for creating the helper object for diagram component.
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Gets the root element of the diagram component.
     */
    getElement(): any;
    /**
     * Gets the background layer element of the diagram component.
     */
    getBackgroundLayerElement(): any;
    /**
     * Gets the grid layer element of the diagram component.
     */
    getGridLineLayerElement(): any;
    /**
     * Gets the diagram element, which will have the diagram objects like nodes, connectors, and more.
     */
    getDiagramLayerElement(): any;
    /**
     * Gets the native layer element of the diagram component, which will have the native node content.
     */
    getNativeLayerElement(): any;
    /**
     * Gets the HTML layer element of the diagram component, which will have the HTML node content.
     */
    getHTMLLayerElement(): HTMLElement;
    /**
     * Gets the adorner layer element of the diagram component, which will have the selector elements and user handle elements.
     */
    getAdornerLayerElement(): any;
    /**
     * Gets the adorner layer element of the diagram component, which will have the selector elements.
     */
    getSelectorElment(): any;
    /**
     * Returns specific node element.
     * @param ID Defines the ID of the node object.
     */
    getNodeElement(id: string): any;
    /**
     * Returns specific port element.
     * @param parentId Defines node ID, which will have the multiple ports.
     * @param portId Defines port ID.
     */
    getPortElement(parentId: string, portId: string): any;
    /**
     * Returns specific icons element.
     * @param parentId Defines node ID, which will have the multiple icons
     */
    getIconElement(parentId: string): any;
    /**
     * Returns specific connector element.
     * @param ID Defines the ID of the connector object.
     */
    getConnecorElement(id: string): any;
    /**
     * Returns specific decorator element.
     * @param connectorId Defines the ID of the connector object.
     * @param isTargetDecorator Defines whether the decorator is source or target.
     */
    getDecoratorElement(connectorId: string, isTargetDecorator: boolean): any;
    /**
     * Returns specific node element.
     * @param parentId Defines node ID, which will have the multiple labels.
     * @param portId Defines label ID.
     */
    getAnnotationElement(parentId: string, annotationId: string): any;
}
