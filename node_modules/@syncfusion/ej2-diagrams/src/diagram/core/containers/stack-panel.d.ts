import { Container } from './container';
import { Orientation } from '../../enum/enum';
import { Size } from '../../primitives/size';
/**
 * StackPanel module is used to arrange its children in a line
 */
export declare class StackPanel extends Container {
    /**
     * Gets/Sets the orientation of the stack panel
     */
    orientation: Orientation;
    /**
     * Not applicable for canvas
     * to avoid the child size updation with respect to parent ser true
     *
     * @private
     */
    measureChildren: boolean;
    /**
     * Sets or gets whether the padding of the element needs to be measured
     *
     * @private
     */
    considerPadding: boolean;
    /**
     * Measures the minimum space that the panel needs \
     *
     * @returns { Size } Measures the minimum space that the panel needs.\
     * @param {Size} availableSize - provide the id value.
     *
     * @private
     */
    measure(availableSize: Size): Size;
    /**
     * Arranges the child elements of the stack panel \
     *
     * @returns { Size } Arranges the child elements of the stack panel.\
     * @param {Size} desiredSize - provide the id value.
     *
     * @private
     */
    arrange(desiredSize: Size): Size;
    /**
     * Measures the minimum space that the panel needs \
     *
     * @returns { Size } Measures the minimum space that the panel needs.\
     * @param {Size} availableSize - provide the id value.
     * @param {Function} updateSize - provide the id value.
     *
     * @private
     */
    private measureStackPanel;
    private arrangeStackPanel;
    private updateHorizontalStack;
    private updateVerticalStack;
    private arrangeHorizontalStack;
    private arrangeVerticalStack;
    protected stretchChildren(size: Size): void;
    private applyChildMargin;
}
