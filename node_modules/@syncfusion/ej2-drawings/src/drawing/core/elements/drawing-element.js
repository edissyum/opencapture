import { RotateTransform, ElementAction } from '../../enum/enum';
import { Size } from '../../primitives/size';
import { Rect } from '../../primitives/rect';
import { getBounds } from '../../utility/base-util';
/**
 * DiagramElement module defines the basic unit of diagram
 */
var DrawingElement = /** @class */ (function () {
    function DrawingElement() {
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
        this.pivot = { x: 0.5, y: 0.5 };
        this.rotateValue = { x: 0, y: 0, angle: 0 };
        /**
         * Sets or gets whether the content of the element needs to be measured
         */
        this.isDirt = true;
        /**
         * Sets/Gets the x-coordinate of the element
         */
        this.offsetX = 0;
        /**
         * Sets/Gets the y-coordinate of the element
         */
        this.offsetY = 0;
        /**
         * Set the corner of the element
         */
        this.cornerRadius = 0;
        /**
         * Sets/Gets the minimum height of the element
         */
        this.minHeight = undefined;
        /**
         * Sets/Gets the minimum width of the element
         */
        this.minWidth = undefined;
        /**
         * Sets/Gets the maximum width of the element
         */
        this.maxWidth = undefined;
        /**
         * Sets/Gets the maximum height of the element
         */
        this.maxHeight = undefined;
        /**
         * Sets/Gets the width of the element
         */
        this.width = undefined;
        /**
         * Sets/Gets the height of the element
         */
        this.height = undefined;
        /**
         * Sets/Gets how the element has to be horizontally arranged with respect to its immediate parent
         * * Stretch - Stretches the diagram element throughout its immediate parent
         * * Left - Aligns the diagram element at the left of its immediate parent
         * * Right - Aligns the diagram element at the right of its immediate parent
         * * Center - Aligns the diagram element at the center of its immediate parent
         * * Auto - Aligns the diagram element based on the characteristics of its immediate parent
         */
        this.horizontalAlignment = 'Auto';
        /**
         * Sets/Gets how the element has to be vertically arranged with respect to its immediate parent
         * * Stretch - Stretches the diagram element throughout its immediate parent
         * * Top - Aligns the diagram element at the top of its immediate parent
         * * Bottom - Aligns the diagram element at the bottom of its immediate parent
         * * Center - Aligns the diagram element at the center of its immediate parent
         * * Auto - Aligns the diagram element based on the characteristics of its immediate parent
         */
        this.verticalAlignment = 'Auto';
        /**
         * Sets or gets whether the content of the element to be visible
         */
        this.visible = true;
        /**
         * Sets/Gets the rotate angle of the element
         */
        this.rotateAngle = 0;
        /**
         * Sets/Gets the margin of the element
         */
        this.margin = { left: 0, right: 0, top: 0, bottom: 0 };
        /**
         * Sets whether the element has to be aligned with respect to a point/with respect to its immediate parent
         * * Point - Diagram elements will be aligned with respect to a point
         * * Object - Diagram elements will be aligned with respect to its immediate parent
         */
        this.relativeMode = 'Point';
        /**
         * Sets whether the element has to be transformed based on its parent or not
         * * Self - Sets the transform type as Self
         * * Parent - Sets the transform type as Parent
         */
        /** @private */
        this.transform = RotateTransform.Self | RotateTransform.Parent;
        /**
         * Sets the style of the element
         */
        this.style = { fill: 'white', strokeColor: 'black', opacity: 1, strokeWidth: 1 };
        /**
         * Gets the minimum size that is required by the element
         */
        this.desiredSize = new Size();
        /**
         * Gets the size that the element will be rendered
         */
        this.actualSize = new Size();
        /**
         * Gets the rotate angle that is set to the immediate parent of the element
         */
        this.parentTransform = 0;
        /** @private */
        this.preventContainer = false;
        /**
         * Gets/Sets the boundary of the element
         */
        this.bounds = new Rect(0, 0, 0, 0);
        /**
         * Defines whether the element has to be measured or not
         */
        this.staticSize = false;
        /**
         * check whether the element is rect or not
         */
        /** @private */
        this.isRectElement = false;
        /** @private */
        this.isCalculateDesiredSize = true;
        /**
         * Defines whether the element is group or port
         */
        /** @private */
        this.elementActions = ElementAction.None;
        //private variables
        this.position = undefined;
        this.unitMode = undefined;
        /**   @private  */
        this.float = false;
        this.floatingBounds = undefined;
    }
    // public constructor() {
    //     this.id = randomId();
    // }
    /**
     * Sets the offset of the element with respect to its parent
     * @param x
     * @param y
     * @param mode
     */
    DrawingElement.prototype.setOffsetWithRespectToBounds = function (x, y, mode) {
        this.unitMode = mode;
        this.position = { x: x, y: y };
    };
    /**
     * Gets the position of the element with respect to its parent
     * @param size
     */
    DrawingElement.prototype.getAbsolutePosition = function (size) {
        if (this.position !== undefined) {
            if (this.unitMode === 'Absolute') {
                return this.position;
            }
            else {
                return {
                    x: this.position.x * size.width, y: this.position.y * size.height
                };
            }
        }
        return undefined;
    };
    Object.defineProperty(DrawingElement.prototype, "outerBounds", {
        get: function () {
            return this.floatingBounds || this.bounds;
        },
        /**
         * used to set the outer bounds value
         * @private
         */
        set: function (bounds) {
            this.floatingBounds = bounds;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Measures the minimum space that the element requires
     * @param availableSize
     */
    DrawingElement.prototype.measure = function (availableSize) {
        var width = this.width !== undefined ? this.width : (availableSize.width || 0) - this.margin.left - this.margin.right;
        var height = this.height !== undefined ? this.height : (availableSize.height || 0) - this.margin.top - this.margin.bottom;
        this.desiredSize = new Size(width, height);
        if (this.isCalculateDesiredSize) {
            this.desiredSize = this.validateDesiredSize(this.desiredSize, availableSize);
        }
        return this.desiredSize;
    };
    /**
     * Arranges the element
     * @param desiredSize
     */
    DrawingElement.prototype.arrange = function (desiredSize) {
        this.actualSize = desiredSize;
        this.updateBounds();
        return this.actualSize;
    };
    /**
     * Updates the bounds of the element
     */
    DrawingElement.prototype.updateBounds = function () {
        this.bounds = getBounds(this);
    };
    /**
     * Validates the size of the element with respect to its minimum and maximum size
     * @param desiredSize
     * @param availableSize
     */
    DrawingElement.prototype.validateDesiredSize = function (desiredSize, availableSize) {
        //Empty canvas
        if (this.isRectElement && !this.width && !this.minWidth && !this.maxWidth) {
            desiredSize.width = 50;
        }
        if (this.isRectElement && !this.height && !this.minHeight && !this.maxHeight) {
            desiredSize.height = 50;
        }
        if (desiredSize === undefined || this.width !== undefined &&
            this.height !== undefined) {
            desiredSize = desiredSize || new Size();
            desiredSize.width = this.width === undefined ? (availableSize.width || 0)
                - this.margin.left - this.margin.right : this.width;
            desiredSize.height = this.height === undefined ? (availableSize.height || 0)
                - this.margin.top - this.margin.bottom : this.height;
        }
        //Considering min values
        if (this.minWidth !== undefined) {
            desiredSize.width = Math.max(desiredSize.width, this.minWidth);
        }
        if (this.minHeight !== undefined) {
            desiredSize.height = Math.max(desiredSize.height, this.minHeight);
        }
        //Considering max values
        if (this.maxWidth !== undefined) {
            desiredSize.width = Math.min(desiredSize.width, this.maxWidth);
        }
        if (this.maxHeight !== undefined) {
            desiredSize.height = Math.min(desiredSize.height, this.maxHeight);
        }
        return desiredSize;
    };
    return DrawingElement;
}());
export { DrawingElement };
