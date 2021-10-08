import { HorizontalAlignment, VerticalAlignment, UnitMode, RotateTransform, RelativeMode, ElementAction } from '../../enum/enum';
import { ShapeStyleModel, MarginModel } from '../appearance-model';
import { Size } from '../../primitives/size';
import { PointModel } from '../../primitives/point-model';
import { Rect } from '../../primitives/rect';
import { IRotateValue } from '../../objects/interface/IElement';
/**
 * DiagramElement module defines the basic unit of diagram
 */
export declare class DrawingElement {
    /**
     * Sets the unique id of the element
     */
    id: string;
    /**
     * Sets/Gets the reference point of the element
     * ```html
     * <div id='diagram'></div>
     * ```
     * ```typescript
     * let stackPanel: StackPanel = new StackPanel();
     * stackPanel.offsetX = 300; stackPanel.offsetY = 200;
     * stackPanel.width = 100; stackPanel.height = 100;
     * stackPanel.style.fill = 'red';
     * stackPanel.pivot = { x: 0.5, y: 0.5 };
     * let diagram: Diagram = new Diagram({
     * ...
     * basicElements: [stackPanel],
     * ...
     * });
     * diagram.appendTo('#diagram');
     * ```
     */
    pivot: PointModel;
    rotateValue: IRotateValue;
    /**
     * Sets or gets whether the content of the element needs to be measured
     */
    isDirt: boolean;
    /**
     * Sets/Gets the x-coordinate of the element
     */
    offsetX: number;
    /**
     * Sets/Gets the y-coordinate of the element
     */
    offsetY: number;
    /**
     * Set the corner of the element
     */
    cornerRadius: number;
    /**
     * Sets/Gets the minimum height of the element
     */
    minHeight: number;
    /**
     * Sets/Gets the minimum width of the element
     */
    minWidth: number;
    /**
     * Sets/Gets the maximum width of the element
     */
    maxWidth: number;
    /**
     * Sets/Gets the maximum height of the element
     */
    maxHeight: number;
    /**
     * Sets/Gets the width of the element
     */
    width: number;
    /**
     * Sets/Gets the height of the element
     */
    height: number;
    /**
     * Sets/Gets how the element has to be horizontally arranged with respect to its immediate parent
     * * Stretch - Stretches the diagram element throughout its immediate parent
     * * Left - Aligns the diagram element at the left of its immediate parent
     * * Right - Aligns the diagram element at the right of its immediate parent
     * * Center - Aligns the diagram element at the center of its immediate parent
     * * Auto - Aligns the diagram element based on the characteristics of its immediate parent
     */
    horizontalAlignment: HorizontalAlignment;
    /**
     * Sets/Gets how the element has to be vertically arranged with respect to its immediate parent
     * * Stretch - Stretches the diagram element throughout its immediate parent
     * * Top - Aligns the diagram element at the top of its immediate parent
     * * Bottom - Aligns the diagram element at the bottom of its immediate parent
     * * Center - Aligns the diagram element at the center of its immediate parent
     * * Auto - Aligns the diagram element based on the characteristics of its immediate parent
     */
    verticalAlignment: VerticalAlignment;
    /**
     * Sets or gets whether the content of the element to be visible
     */
    visible: boolean;
    /**
     * Sets/Gets the rotate angle of the element
     */
    rotateAngle: number;
    /**
     * Sets/Gets the margin of the element
     */
    margin: MarginModel;
    /**
     * Sets whether the element has to be aligned with respect to a point/with respect to its immediate parent
     * * Point - Diagram elements will be aligned with respect to a point
     * * Object - Diagram elements will be aligned with respect to its immediate parent
     */
    relativeMode: RelativeMode;
    /**
     * Sets whether the element has to be transformed based on its parent or not
     * * Self - Sets the transform type as Self
     * * Parent - Sets the transform type as Parent
     */
    /** @private */
    transform: RotateTransform;
    /**
     * Sets the style of the element
     */
    style: ShapeStyleModel;
    /**
     * Gets the minimum size that is required by the element
     */
    desiredSize: Size;
    /**
     * Gets the size that the element will be rendered
     */
    actualSize: Size;
    /**
     * Gets the rotate angle that is set to the immediate parent of the element
     */
    parentTransform: number;
    /** @private */
    preventContainer: boolean;
    /**
     * Gets/Sets the boundary of the element
     */
    bounds: Rect;
    /**
     * Gets/Sets the corners of the rectangular bounds
     */
    /** @private */
    corners: Corners;
    /**
     * Defines whether the element has to be measured or not
     */
    staticSize: boolean;
    /**
     * check whether the element is rect or not
     */
    /** @private */
    isRectElement: boolean;
    /** @private */
    isCalculateDesiredSize: boolean;
    /**
     * Defines whether the element is group or port
     */
    /** @private */
    elementActions: ElementAction;
    /**
     * Sets the offset of the element with respect to its parent
     * @param x
     * @param y
     * @param mode
     */
    setOffsetWithRespectToBounds(x: number, y: number, mode: UnitMode): void;
    /**
     * Gets the position of the element with respect to its parent
     * @param size
     */
    getAbsolutePosition(size: Size): PointModel;
    private position;
    private unitMode;
    /**   @private  */
    float: boolean;
    /**
    * used to set the outer bounds value
    * @private
    */
    outerBounds: Rect;
    private floatingBounds;
    /**
     * Measures the minimum space that the element requires
     * @param availableSize
     */
    measure(availableSize: Size): Size;
    /**
     * Arranges the element
     * @param desiredSize
     */
    arrange(desiredSize: Size): Size;
    /**
     * Updates the bounds of the element
     */
    updateBounds(): void;
    /**
     * Validates the size of the element with respect to its minimum and maximum size
     * @param desiredSize
     * @param availableSize
     */
    protected validateDesiredSize(desiredSize: Size, availableSize: Size): Size;
}
/** @private */
export interface Corners {
    topLeft: PointModel;
    topCenter: PointModel;
    topRight: PointModel;
    middleLeft: PointModel;
    center: PointModel;
    middleRight: PointModel;
    bottomLeft: PointModel;
    bottomCenter: PointModel;
    bottomRight: PointModel;
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
}
