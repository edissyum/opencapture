import { DrawingElement } from '../elements/drawing-element';
import { Size } from '../../primitives/size';
import { PointModel } from '../../primitives/point-model';
/**
 * Container module is used to group related objects
 */
export declare class Container extends DrawingElement {
    /**
     * Gets/Sets the collection of child elements
     */
    children: DrawingElement[];
    private desiredBounds;
    /** @private */
    measureChildren: boolean;
    /**
     * returns whether the container has child elements or not
     */
    hasChildren(): boolean;
    /**   @private  */
    prevRotateAngle: number;
    /**
     * Measures the minimum space that the container requires
     *
     * @param availableSize
     */
    measure(availableSize: Size): Size;
    /**
     * Arranges the container and its children
     * @param desiredSize
     */
    arrange(desiredSize: Size): Size;
    /**
     * Stretches the child elements based on the size of the container
     * @param size
     */
    protected stretchChildren(size: Size): void;
    /**
     * Finds the offset of the child element with respect to the container
     * @param child
     * @param center
     */
    protected findChildOffsetFromCenter(child: DrawingElement, center: PointModel): void;
    private GetChildrenBounds;
}
