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
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable valid-jsdoc */
import { Container } from './container';
import { rotateSize } from '../../utility/base-util';
import { Transform, ElementAction } from '../../enum/enum';
import { Size } from '../../primitives/size';
import { Rect } from '../../primitives/rect';
import { TextElement } from '../elements/text-element';
/**
 * Canvas module is used to define a plane(canvas) and to arrange the children based on margin
 */
var Canvas = /** @class */ (function (_super) {
    __extends(Canvas, _super);
    function Canvas() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Not applicable for canvas
         *
         *  @private
         */
        _this.measureChildren = undefined;
        return _this;
    }
    /**
     * Measures the minimum space that the canvas requires \
     *
     * @returns { Size } Measures the minimum space that the canvas requires .\
     * @param {string} id - provide the id value.
     * @param {Function} callback - provide the Connector value.
     *
     * @private
     */
    Canvas.prototype.measure = function (availableSize, id, callback) {
        var desired = undefined;
        var desiredBounds = undefined;
        if (this.hasChildren()) {
            //Measuring the children
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                if (child instanceof TextElement) {
                    if (child.canMeasure) {
                        availableSize.width = availableSize.width || this.maxWidth || this.minWidth;
                        child.measure(availableSize);
                    }
                }
                else if (!(child instanceof TextElement)) {
                    child.measure(availableSize, id, callback);
                }
                var childSize = child.desiredSize.clone();
                if (child.rotateAngle !== 0) {
                    childSize = rotateSize(childSize, child.rotateAngle);
                }
                var right = childSize.width + child.margin.right;
                var bottom = childSize.height + child.margin.bottom;
                var childBounds = new Rect(child.margin.left, child.margin.top, right, bottom);
                if (child.float) {
                    var position = child.getAbsolutePosition(childSize);
                    if (position !== undefined) {
                        continue;
                    }
                }
                if ((!(child instanceof TextElement)) || (child instanceof TextElement && child.canConsiderBounds)) {
                    if (desiredBounds === undefined) {
                        desiredBounds = childBounds;
                    }
                    else {
                        desiredBounds.uniteRect(childBounds);
                    }
                }
            }
            if (desiredBounds) {
                var leftMargin = 0;
                var topMargin = 0;
                leftMargin = Math.max(desiredBounds.left, 0);
                topMargin = Math.max(desiredBounds.top, 0);
                desired = new Size(desiredBounds.width + leftMargin, desiredBounds.height + topMargin);
            }
        }
        desired = _super.prototype.validateDesiredSize.call(this, desired, availableSize);
        _super.prototype.stretchChildren.call(this, desired);
        //Considering padding values
        desired.width += this.padding.left + this.padding.right;
        desired.height += this.padding.top + this.padding.bottom;
        this.desiredSize = desired;
        return desired;
    };
    /**
     * Arranges the child elements of the canvas
     */
    Canvas.prototype.arrange = function (desiredSize, isStack) {
        this.outerBounds = new Rect();
        if (this.hasChildren()) {
            //let y: number;
            //let x: number;
            var y = this.offsetY - desiredSize.height * this.pivot.y + this.padding.top;
            var x = this.offsetX - desiredSize.width * this.pivot.x + this.padding.left;
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                if ((child.transform & Transform.Parent) !== 0) {
                    child.parentTransform = this.parentTransform + this.rotateAngle;
                    if (this.flip !== 'None' || this.elementActions & ElementAction.ElementIsGroup) {
                        child.parentTransform = (this.flip === 'Horizontal' || this.flip === 'Vertical') ?
                            -child.parentTransform : child.parentTransform;
                    }
                    var childSize = child.desiredSize.clone();
                    var topLeft = void 0;
                    var center = { x: 0, y: 0 };
                    var childX = x;
                    var childY = y;
                    if (child.relativeMode === 'Point') {
                        var position = child.getAbsolutePosition(desiredSize);
                        if (position !== undefined) {
                            childX += position.x;
                            childY += position.y;
                        }
                    }
                    if (child.relativeMode === 'Object') {
                        topLeft = this.alignChildBasedOnParent(child, childSize, desiredSize, childX, childY);
                    }
                    else {
                        topLeft = this.alignChildBasedOnaPoint(child, childX, childY);
                    }
                    center = { x: topLeft.x + childSize.width / 2, y: topLeft.y + childSize.height / 2 };
                    _super.prototype.findChildOffsetFromCenter.call(this, child, center);
                }
                if (isStack && (child.horizontalAlignment === 'Stretch' || child.verticalAlignment === 'Stretch')) {
                    child.arrange(desiredSize);
                }
                else {
                    if (child instanceof TextElement && child.canMeasure) {
                        child.arrange(child.desiredSize);
                        this.outerBounds.uniteRect(child.outerBounds);
                    }
                    else if (!(child instanceof TextElement)) {
                        child.arrange(child.desiredSize);
                        this.outerBounds.uniteRect(child.outerBounds);
                    }
                }
            }
        }
        this.actualSize = desiredSize;
        this.updateBounds();
        this.outerBounds.uniteRect(this.bounds);
        return desiredSize;
    };
    //Aligns the child element based on its parent
    Canvas.prototype.alignChildBasedOnParent = function (child, childSize, parentSize, x, y) {
        switch (child.horizontalAlignment) {
            case 'Auto':
            case 'Left':
                x += child.margin.left;
                break;
            case 'Right':
                x += parentSize.width - childSize.width - child.margin.right;
                break;
            case 'Stretch':
            case 'Center':
                x += parentSize.width / 2 - childSize.width / 2;
                break;
        }
        switch (child.verticalAlignment) {
            case 'Auto':
            case 'Top':
                y += child.margin.top;
                break;
            case 'Bottom':
                y += parentSize.height - childSize.height - child.margin.bottom;
                break;
            case 'Stretch':
            case 'Center':
                y += parentSize.height / 2 - childSize.height / 2;
                break;
        }
        return { x: x, y: y };
    };
    //Aligns the child elements based on a point
    Canvas.prototype.alignChildBasedOnaPoint = function (child, x, y) {
        x += child.margin.left - child.margin.right;
        y += child.margin.top - child.margin.bottom;
        switch (child.horizontalAlignment) {
            case 'Auto':
            case 'Left':
                x = child.inversedAlignment ? x : (x - child.desiredSize.width);
                break;
            case 'Stretch':
            case 'Center':
                x -= child.desiredSize.width * child.pivot.x;
                break;
            case 'Right':
                x = child.inversedAlignment ? (x - child.desiredSize.width) : x;
                break;
        }
        switch (child.verticalAlignment) {
            case 'Auto':
            case 'Top':
                y = child.inversedAlignment ? y : (y - child.desiredSize.height);
                break;
            case 'Stretch':
            case 'Center':
                y -= child.desiredSize.height * child.pivot.y;
                break;
            case 'Bottom':
                y = child.inversedAlignment ? (y - child.desiredSize.height) : y;
                break;
        }
        return { x: x, y: y };
    };
    return Canvas;
}(Container));
export { Canvas };
