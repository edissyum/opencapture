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
import { Size } from '../../primitives/size';
import { DrawingElement } from './drawing-element';
import { Rect } from '../../primitives/rect';
import { measurePath } from './../../utility/dom-util';
import { processPathData, splitArrayCollection, transformPath, getPathString } from '../../utility/path-util';
/**
 * PathElement takes care of how to align the path based on offsetX and offsetY
 */
var PathElement = /** @class */ (function (_super) {
    __extends(PathElement, _super);
    /**
     * set the id for each element
     */
    function PathElement() {
        var _this = _super.call(this) || this;
        /**
         * Gets or sets the geometry of the path element
         */
        _this.pathData = '';
        /**
         * Gets/Sets whether the path has to be transformed to fit the given x,y, width, height
         */
        _this.transformPath = true;
        /**
         * Gets/Sets the equivalent path, that will have the origin as 0,0
         */
        _this.absolutePath = '';
        /**   @private  */
        _this.canMeasurePath = false;
        //Private variables
        /**   @private  */
        _this.absoluteBounds = new Rect();
        return _this;
    }
    Object.defineProperty(PathElement.prototype, "data", {
        /**
         * Gets the geometry of the path element
         */
        get: function () {
            return this.pathData;
        },
        /**
         * Sets the geometry of the path element
         */
        set: function (value) {
            if (this.pathData !== value) {
                this.pathData = value;
                this.isDirt = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Measures the minimum space that is required to render the element
     * @param availableSize
     */
    PathElement.prototype.measure = function (availableSize) {
        //Performance issue - Avoiding measuring the connector path
        if (this.staticSize && this.width !== undefined && this.height !== undefined) {
            this.absoluteBounds = new Rect(this.offsetX - this.width * this.pivot.x, this.offsetY - this.height * this.pivot.y, this.width, this.height);
        }
        else if (this.isDirt && (this.transformPath || (this.width === undefined || this.height === undefined))
            && (!this.absoluteBounds || this.absoluteBounds.height === 0) || this.canMeasurePath) {
            //Measure the element only whent the path data is changed/ size is not specified
            this.absoluteBounds = measurePath(this.data ? this.data : '');
        }
        if (this.width === undefined) {
            this.desiredSize = new Size(this.absoluteBounds.width, this.height || this.absoluteBounds.height);
        }
        else if (this.height === undefined) {
            this.desiredSize = new Size(this.width || this.absoluteBounds.width, this.absoluteBounds.height);
        }
        else {
            this.desiredSize = new Size(this.width, this.height);
        }
        this.desiredSize = this.validateDesiredSize(this.desiredSize, availableSize);
        this.canMeasurePath = false;
        return this.desiredSize;
    };
    /**
     * Arranges the path element
     * @param desiredSize
     */
    PathElement.prototype.arrange = function (desiredSize) {
        if (this.isDirt || this.actualSize.width !== desiredSize.width || this.actualSize.height !== desiredSize.height) {
            this.isDirt = true;
            this.absolutePath = this.updatePath(this.data, this.absoluteBounds, desiredSize);
            if (!this.staticSize) {
                this.points = null;
            }
        }
        this.actualSize = this.desiredSize;
        this.updateBounds();
        this.isDirt = false;
        return this.actualSize;
    };
    /**
     * Translates the path to 0,0 and scales the path based on the actual size
     * @param pathData
     * @param bounds
     * @param actualSize
     */
    PathElement.prototype.updatePath = function (pathData, bounds, actualSize) {
        var isScale = false;
        var newPathString = '';
        var scaleX = -bounds.x;
        var scaleY = -bounds.y;
        var arrayCollection = [];
        if (actualSize.width !== bounds.width || actualSize.height !== bounds.height) {
            scaleX = actualSize.width / Number(bounds.width ? bounds.width : 1);
            scaleY = actualSize.height / Number(bounds.height ? bounds.height : 1);
            isScale = true;
        }
        arrayCollection = processPathData(pathData);
        arrayCollection = splitArrayCollection(arrayCollection);
        if ((isScale || this.isDirt) && this.transformPath) {
            newPathString = transformPath(arrayCollection, scaleX, scaleY, isScale, bounds.x, bounds.y, 0, 0);
        }
        else {
            newPathString = getPathString(arrayCollection);
        }
        isScale = false;
        return newPathString;
    };
    return PathElement;
}(DrawingElement));
export { PathElement };
