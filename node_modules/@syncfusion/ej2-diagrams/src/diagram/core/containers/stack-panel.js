var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Container } from './container';
import { rotateSize } from '../../utility/base-util';
/**
 * StackPanel module is used to arrange its children in a line
 */
var StackPanel = /** @class */ (function (_super) {
    __extends(StackPanel, _super);
    function StackPanel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Gets/Sets the orientation of the stack panel
         */
        _this.orientation = 'Vertical';
        /**
         * Not applicable for canvas
         * to avoid the child size updation with respect to parent ser true
         *
         * @private
         */
        _this.measureChildren = undefined;
        /**
         * Sets or gets whether the padding of the element needs to be measured
         *
         * @private
         */
        _this.considerPadding = true;
        return _this;
    }
    /**
     * Measures the minimum space that the panel needs \
     *
     * @returns { Size } Measures the minimum space that the panel needs.\
     * @param {Size} availableSize - provide the id value.
     *
     * @private
     */
    StackPanel.prototype.measure = function (availableSize) {
        var updateSize = this.orientation === 'Horizontal' ? this.updateHorizontalStack : this.updateVerticalStack;
        this.desiredSize = this.measureStackPanel(availableSize, updateSize);
        return this.desiredSize;
    };
    /**
     * Arranges the child elements of the stack panel \
     *
     * @returns { Size } Arranges the child elements of the stack panel.\
     * @param {Size} desiredSize - provide the id value.
     *
     * @private
     */
    StackPanel.prototype.arrange = function (desiredSize) {
        var updateSize = this.orientation === 'Horizontal' ? this.arrangeHorizontalStack : this.arrangeVerticalStack;
        this.actualSize = this.arrangeStackPanel(desiredSize, updateSize);
        this.updateBounds();
        return this.actualSize;
    };
    /**
     * Measures the minimum space that the panel needs \
     *
     * @returns { Size } Measures the minimum space that the panel needs.\
     * @param {Size} availableSize - provide the id value.
     * @param {Function} updateSize - provide the id value.
     *
     * @private
     */
    StackPanel.prototype.measureStackPanel = function (availableSize, updateSize) {
        var desired = undefined;
        if (this.children !== undefined && this.children.length > 0) {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                child.parentTransform = this.rotateAngle + this.parentTransform;
                //Measure children
                if (this.measureChildren) {
                    child.measure(child.desiredSize);
                }
                else {
                    child.measure(availableSize);
                }
                var childSize = child.desiredSize.clone();
                //Consider Child's margin
                this.applyChildMargin(child, childSize);
                //Consider children's rotation
                if (child.rotateAngle !== 0) {
                    childSize = rotateSize(childSize, child.rotateAngle);
                }
                //Measure stack panel
                if (desired === undefined) {
                    desired = childSize;
                }
                else {
                    if (!child.preventContainer) {
                        updateSize(childSize, desired);
                    }
                }
            }
        }
        desired = _super.prototype.validateDesiredSize.call(this, desired, availableSize);
        this.stretchChildren(desired);
        //Considering padding values
        if (this.considerPadding) {
            this.applyPadding(desired);
        }
        return desired;
    };
    StackPanel.prototype.arrangeStackPanel = function (desiredSize, updatePosition) {
        if (this.children !== undefined && this.children.length > 0) {
            var x = void 0;
            var y = void 0;
            x = this.offsetX - desiredSize.width * this.pivot.x + this.padding.left;
            y = this.offsetY - desiredSize.height * this.pivot.y + this.padding.top;
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                var childSize = child.desiredSize.clone();
                var rotatedSize = childSize;
                if (this.orientation === 'Vertical') {
                    y += child.margin.top;
                }
                else {
                    x += child.margin.left;
                }
                if (child.rotateAngle !== 0) {
                    rotatedSize = rotateSize(childSize, child.rotateAngle);
                }
                var center = updatePosition(x, y, child, this, desiredSize, rotatedSize);
                _super.prototype.findChildOffsetFromCenter.call(this, child, center);
                child.arrange(childSize, true);
                if (this.orientation === 'Vertical') {
                    y += rotatedSize.height + child.margin.bottom;
                }
                else {
                    x += rotatedSize.width + child.margin.right;
                }
            }
        }
        return desiredSize;
    };
    StackPanel.prototype.updateHorizontalStack = function (child, parent) {
        parent.height = Math.max(child.height, parent.height);
        parent.width += child.width;
    };
    StackPanel.prototype.updateVerticalStack = function (child, parent) {
        parent.width = Math.max(child.width, parent.width);
        parent.height += child.height;
    };
    StackPanel.prototype.arrangeHorizontalStack = function (x, y, child, parent, parenBounds, childBounds) {
        var centerY = 0;
        if (child.verticalAlignment === 'Top') {
            centerY = y + child.margin.top + childBounds.height / 2;
        }
        else if (child.verticalAlignment === 'Bottom') {
            var parentBottom = parent.offsetY + parenBounds.height * (1 - parent.pivot.y);
            centerY = parentBottom - parent.padding.bottom - child.margin.bottom - childBounds.height / 2;
        }
        else {
            centerY = parent.offsetY - parenBounds.height * parent.pivot.y + parenBounds.height / 2;
            if (child.margin.top) {
                centerY = y + child.margin.top + childBounds.height / 2;
            }
        }
        return { x: x + childBounds.width / 2, y: centerY };
    };
    StackPanel.prototype.arrangeVerticalStack = function (x, y, child, parent, parentSize, childSize) {
        var centerX = 0;
        if (child.horizontalAlignment === 'Left') {
            centerX = x + child.margin.left + childSize.width / 2;
        }
        else if (child.horizontalAlignment === 'Right') {
            var parentRight = parent.offsetX + parentSize.width * (1 - parent.pivot.x);
            centerX = parentRight - parent.padding.right - child.margin.right - childSize.width / 2;
        }
        else {
            centerX = parent.offsetX - parentSize.width * parent.pivot.x + parentSize.width / 2;
            if (child.margin.left) {
                centerX = x + child.margin.left + childSize.width / 2;
            }
        }
        return { x: centerX, y: y + childSize.height / 2 };
    };
    StackPanel.prototype.stretchChildren = function (size) {
        if (this.children !== undefined && this.children.length > 0) {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                if (this.orientation === 'Vertical') {
                    if (child.horizontalAlignment === 'Stretch') {
                        child.desiredSize.width = size.width - (child.margin.left + child.margin.right);
                    }
                }
                else {
                    if (child.verticalAlignment === 'Stretch') {
                        child.desiredSize.height = size.height - (child.margin.top + child.margin.bottom);
                    }
                }
            }
        }
    };
    StackPanel.prototype.applyChildMargin = function (child, size) {
        size.height += child.margin.top + child.margin.bottom;
        size.width += child.margin.left + child.margin.right;
    };
    return StackPanel;
}(Container));
export { StackPanel };
