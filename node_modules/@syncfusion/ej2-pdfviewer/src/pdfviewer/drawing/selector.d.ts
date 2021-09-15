import { ChildProperty } from '@syncfusion/ej2-base';
import { IElement, ThumbsConstraints } from '@syncfusion/ej2-drawings';
import { Container } from '@syncfusion/ej2-drawings';
import { PointModel } from '@syncfusion/ej2-drawings';
import { PdfAnnotationBaseModel, PdfFormFieldBaseModel } from './pdf-annotation-model';
/**
 * Defines the size and position of selected items and defines the appearance of selector
 *
 * @hidden
 */
export declare class Selector extends ChildProperty<Selector> implements IElement {
    /**
     * Defines the size and position of the container
     *
     * @default null
     */
    wrapper: Container;
    /**
     * Defines the collection of selected nodes
     */
    annotations: PdfAnnotationBaseModel[];
    /**
     * Defines the collection of selected form Fields
     */
    formFields: PdfFormFieldBaseModel[];
    /**
     * Sets/Gets the width of the container
     *
     * @aspDefaultValueIgnore
     * @default undefined
     */
    width: number;
    /**
     * Sets/Gets the height of the container
     *
     * @aspDefaultValueIgnore
     * @default undefined
     */
    height: number;
    /**
     * Sets the rotate angle of the container
     *
     * @default 0
     */
    rotateAngle: number;
    /**
     * Sets the positionX of the container
     *
     * @default 0
     */
    offsetX: number;
    /**
     * Sets the positionY of the container
     *
     * @default 0
     */
    offsetY: number;
    /**
     * Sets the pivot of the selector
     *
     * @default { x: 0.5, y: 0.5 }
     */
    pivot: PointModel;
    /**
     * set the constraint of the container
     * * Rotate - Enable Rotate Thumb
     * * ConnectorSource - Enable Connector source point
     * * ConnectorTarget - Enable Connector target point
     * * ResizeNorthEast - Enable ResizeNorthEast Resize
     * * ResizeEast - Enable ResizeEast Resize
     * * ResizeSouthEast - Enable ResizeSouthEast Resize
     * * ResizeSouth - Enable ResizeSouth Resize
     * * ResizeSouthWest - Enable ResizeSouthWest Resize
     * * ResizeWest - Enable ResizeWest Resize
     * * ResizeNorthWest - Enable ResizeNorthWest Resize
     * * ResizeNorth - Enable ResizeNorth Resize
     *
     * @private
     * @aspNumberEnum
     */
    thumbsConstraints: ThumbsConstraints;
    /**
     * Initializes the UI of the container
     *
     * @param  {any} diagram - diagram element.
     * @returns {Container} - Returns the container element.
     */
    init(diagram: any): Container;
}
