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
import { GetResourceEventHandler } from './../pdf-graphics';
import { PdfBrush } from './pdf-brush';
import { PointF, SizeF, RectangleF, Rectangle } from './../../drawing/pdf-drawing';
import { DictionaryProperties } from './../../input-output/pdf-dictionary-properties';
import { PdfArray } from './../../primitives/pdf-array';
import { PdfNumber } from './../../primitives/pdf-number';
import { PdfGraphics } from './../pdf-graphics';
import { PdfResources } from './../pdf-resources';
import { PdfStream } from './../../primitives/pdf-stream';
import { PdfPage } from './../../pages/pdf-page';
/**
 * `PdfTilingBrush` Implements a colored tiling brush.
 */
var PdfTilingBrush = /** @class */ (function (_super) {
    __extends(PdfTilingBrush, _super);
    /**
     * Initializes a new instance of the `PdfTilingBrush` class.
     * @public
     */
    function PdfTilingBrush(arg1, arg2) {
        var _this = _super.call(this) || this;
        /**
         * Local variable to store Stroking.
         * @private
         */
        _this.mStroking = false;
        /**
         * Local variable to store the tile start location.
         * @private
         */
        _this.mLocation = new PointF(0, 0);
        /**
         * Local variable to store the dictionary properties.
         * @private
         */
        _this.mDictionaryProperties = new DictionaryProperties();
        var rect = null;
        if (arg1 instanceof Rectangle) {
            rect = arg1;
        }
        else if (arg1 instanceof SizeF) {
            rect = new Rectangle(0, 0, arg1.width, arg1.height);
        }
        if (arg2 !== null && arg2 instanceof PdfPage) {
            _this.mPage = arg2;
        }
        _this.brushStream = new PdfStream();
        _this.mResources = new PdfResources();
        _this.brushStream.items.setValue(_this.mDictionaryProperties.resources, _this.mResources);
        _this.setBox(rect);
        _this.setObligatoryFields();
        if (arg2 !== null && arg2 instanceof PdfPage) {
            _this.mPage = arg2;
            _this.graphics.colorSpace = arg2.document.colorSpace;
        }
        return _this;
    }
    /**
     * Initializes a new instance of the `PdfTilingBrush` class.
     * @private
     * @param rectangle The size of the smallest brush cell.
     * @param page The Current Page Object.
     * @param location The Tile start location.
     * @param matrix The matrix.
     */
    PdfTilingBrush.prototype.initialize = function (rectangle, page, location, matrix) {
        this.mPage = page;
        this.mLocation = location;
        this.mTransformationMatrix = matrix;
        this.tempBrushStream = this.brushStream;
        this.brushStream = new PdfStream();
        var tempResource = new PdfResources();
        this.brushStream.items.setValue(this.mDictionaryProperties.resources, tempResource);
        this.setBox(rectangle);
        this.setObligatoryFields();
        return this;
    };
    Object.defineProperty(PdfTilingBrush.prototype, "location", {
        //Properties
        /**
         * Location representing the start position of the tiles.
         * @public
         */
        get: function () {
            return this.mLocation;
        },
        set: function (value) {
            this.mLocation = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets the obligatory fields.
     * @private
     */
    PdfTilingBrush.prototype.setObligatoryFields = function () {
        this.brushStream.items.setValue(this.mDictionaryProperties.patternType, new PdfNumber(1));
        //  Tiling brush.
        this.brushStream.items.setValue(this.mDictionaryProperties.paintType, new PdfNumber(1));
        //  Coloured.
        this.brushStream.items.setValue(this.mDictionaryProperties.tilingType, new PdfNumber(1));
        //  Constant spacing.
        this.brushStream.items.setValue(this.mDictionaryProperties.xStep, new PdfNumber((this.mBox.right - this.mBox.left)));
        this.brushStream.items.setValue(this.mDictionaryProperties.yStep, new PdfNumber((this.mBox.bottom - this.mBox.top)));
        if ((this.mPage != null) && (this.mLocation != null)) {
            if ((this.mTransformationMatrix == null && typeof this.mTransformationMatrix === 'undefined')) {
                // Transform the tile origin to fit the location
                var tileTransform = (this.mPage.size.height % this.rectangle.size.height) - (this.mLocation.y);
                /* tslint:disable-next-line:max-line-length */
                this.brushStream.items.setValue(this.mDictionaryProperties.matrix, new PdfArray([1, 0, 0, 1, this.mLocation.x, tileTransform]));
            }
            else {
                var tileTransform = 0;
                // Transform the tile origin to fit the location
                var elements = this.mTransformationMatrix.matrix.elements;
                if ((this.mPage.size.height > this.rectangle.size.height)) {
                    tileTransform = (this.mTransformationMatrix.matrix.offsetY
                        - (this.mPage.size.height % this.rectangle.size.height));
                }
                else {
                    tileTransform = ((this.mPage.size.height % this.rectangle.size.height) + this.mTransformationMatrix.matrix.offsetY);
                }
                this.brushStream.items.setValue(this.mDictionaryProperties.matrix, new PdfArray([
                    elements[0], elements[1], elements[2], elements[3], elements[4], tileTransform
                ]));
            }
        }
    };
    /**
     * Sets the BBox coordinates.
     * @private
     */
    PdfTilingBrush.prototype.setBox = function (box) {
        this.mBox = box;
        var rect = new RectangleF(this.mBox.left, this.mBox.top, this.mBox.right, this.mBox.bottom);
        this.brushStream.items.setValue(this.mDictionaryProperties.bBox, PdfArray.fromRectangle(rect));
    };
    Object.defineProperty(PdfTilingBrush.prototype, "rectangle", {
        //Properties
        /**
         * Gets the boundary box of the smallest brush cell.
         * @public
         */
        get: function () {
            return this.mBox;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTilingBrush.prototype, "size", {
        /**
         * Gets the size of the smallest brush cell.
         * @public
         */
        get: function () {
            return this.mBox.size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTilingBrush.prototype, "graphics", {
        /**
         * Gets Graphics context of the brush.
         */
        get: function () {
            if ((this.mGraphics == null && typeof this.mGraphics === 'undefined')) {
                var gr = new GetResourceEventHandler(this);
                var g = new PdfGraphics(this.size, gr, this.brushStream);
                this.mGraphics = g;
                this.mResources = this.getResources();
                this.mGraphics.initializeCoordinates();
            }
            return this.mGraphics;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the resources and modifies the template dictionary.
     * @public
     */
    PdfTilingBrush.prototype.getResources = function () {
        return this.mResources;
    };
    Object.defineProperty(PdfTilingBrush.prototype, "stroking", {
        /**
         * Gets or sets a value indicating whether this PdfTilingBrush
         * is used for stroking operations.
         */
        get: function () {
            return this.mStroking;
        },
        set: function (value) {
            this.mStroking = value;
        },
        enumerable: true,
        configurable: true
    });
    //PdfBrush methods
    /**
     * Creates a new copy of a brush.
     * @public
     */
    PdfTilingBrush.prototype.clone = function () {
        var brush = this.initialize(this.rectangle, this.mPage, this.location, this.mTransformationMatrix);
        if ((this.mTransformationMatrix != null) && (this.mTransformationMatrix.matrix != null)) {
            /* tslint:disable-next-line:max-line-length */
            brush.brushStream.items.setValue(this.mDictionaryProperties.matrix, new PdfArray(this.mTransformationMatrix.matrix.elements));
        }
        brush.brushStream.data = this.tempBrushStream.data;
        brush.mResources = new PdfResources(this.mResources);
        brush.brushStream.items.setValue(this.mDictionaryProperties.resources, brush.mResources);
        return brush;
    };
    /**
     * Monitors the changes of the brush and modify PDF state respectfully.
     * @param brush The brush
     * @param streamWriter The stream writer
     * @param getResources The get resources delegate.
     * @param saveChanges if set to true the changes should be saved anyway.
     * @param currentColorSpace The current color space.
     */
    /* tslint:disable-next-line:max-line-length */
    PdfTilingBrush.prototype.monitorChanges = function (brush, streamWriter, getResources, saveChanges, currentColorSpace) {
        var diff = false;
        if (brush !== this) {
            //  Set the Pattern colour space.
            streamWriter.setColorSpace('Pattern', this.mStroking);
            //  Set the pattern for non-stroking operations.
            var resources1 = getResources.getResources();
            var name1 = resources1.getName(this);
            streamWriter.setColourWithPattern(null, name1, this.mStroking);
            diff = true;
        }
        else if (brush instanceof PdfTilingBrush) {
            //  Set the /Pattern colour space.
            streamWriter.setColorSpace('Pattern', this.mStroking);
            //  Set the pattern for non-stroking operations.
            var resources = getResources.getResources();
            var name_1 = resources.getName(this);
            streamWriter.setColourWithPattern(null, name_1, this.mStroking);
            diff = true;
        }
        return diff;
    };
    /**
     * Resets the changes, which were made by the brush.
     * In other words resets the state to the initial one.
     * @param streamWriter The stream writer.
     */
    PdfTilingBrush.prototype.resetChanges = function (streamWriter) {
        //  We shouldn't do anything to reset changes.
        //  All changes will be reset automatically by setting a new colour space.
    };
    Object.defineProperty(PdfTilingBrush.prototype, "element", {
        /* tslint:enable */
        // IPdfWrapper Members
        /**
         * Gets the `element`.
         * @public
         */
        get: function () {
            return this.brushStream;
        },
        enumerable: true,
        configurable: true
    });
    return PdfTilingBrush;
}(PdfBrush));
export { PdfTilingBrush };
