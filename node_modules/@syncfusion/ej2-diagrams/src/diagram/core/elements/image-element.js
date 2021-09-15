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
import { DiagramElement } from './diagram-element';
import { measureImage } from './../../utility/dom-util';
/**
 * ImageElement defines a basic image elements
 */
var ImageElement = /** @class */ (function (_super) {
    __extends(ImageElement, _super);
    /**
     * set the id for each element
     */
    function ImageElement() {
        var _this = _super.call(this) || this;
        /**
         * sets or gets the image source
         */
        _this.imageSource = '';
        /**
         * sets scaling factor of the image
         */
        _this.imageScale = 'None';
        /**
         * sets the alignment of the image
         */
        _this.imageAlign = 'None';
        /**
         * Sets how to stretch the image
         */
        _this.stretch = 'Stretch';
        return _this;
    }
    Object.defineProperty(ImageElement.prototype, "source", {
        /**
         * Gets the source for the image element
         */
        /**
         * Gets the source for the image element \
         *
         * @returns { void }Gets the source for the image element.\
         *
         * @private
         */
        get: function () {
            return this.imageSource;
        },
        /**
         * Sets the source for the image element \
         *
         * @returns { void }Sets the source for the image element.\
         * @param {string} value - provide the id value.
         *
         * @private
         */
        set: function (value) {
            this.imageSource = value;
            this.isDirt = true;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Measures minimum space that is required to render the image \
     *
     * @returns { Size }Measures minimum space that is required to render the image.\
     * @param {Size} availableSize - provide the id value.
     * @param {Object} id - provide the id value.
     * @param {Function} callback - provide the id value.
     *
     * @private
     */
    ImageElement.prototype.measure = function (availableSize, id, callback) {
        if (this.isDirt && (this.stretch !== 'Stretch' || this.width === undefined && this.height === undefined)) {
            this.contentSize = measureImage(this.source, this.contentSize, id, callback);
            this.isDirt = false;
        }
        if (this.width !== undefined && this.height !== undefined) {
            this.desiredSize = new Size(this.width, this.height);
            this.contentSize = this.desiredSize;
        }
        else {
            this.desiredSize = this.contentSize;
        }
        this.desiredSize = this.validateDesiredSize(this.desiredSize, availableSize);
        return this.desiredSize;
    };
    /**
     * Arranges the image
     * @param {Size} desiredSize
     */
    /**
     * Arranges the image \
     *
     * @returns { Size }Arranges the image.\
     * @param {Size} desiredSize - provide the id value.
     *
     * @private
     */
    ImageElement.prototype.arrange = function (desiredSize) {
        this.actualSize = new Size(this.desiredSize.width, this.desiredSize.height);
        this.updateBounds();
        return this.actualSize;
    };
    return ImageElement;
}(DiagramElement));
export { ImageElement };
