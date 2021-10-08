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
import { measureNativeContent, getContent, measureNativeSvg } from './../../utility/dom-util';
/**
 * NativeElement defines the basic native elements
 */
var DiagramNativeElement = /** @class */ (function (_super) {
    __extends(DiagramNativeElement, _super);
    /**
     *  set the id for each element \
     *
     * @returns { void } set the id for each element.\
     * @param {string} nodeId - provide the id value.
     * @param {string} diagramId - provide the id value.
     *
     * @private
     */
    function DiagramNativeElement(nodeId, diagramId) {
        var _this = _super.call(this) || this;
        _this.data = '';
        /**
         * set the node id
         */
        _this.nodeId = '';
        /**
         * set the diagram id
         */
        _this.diagramId = '';
        /**
         * sets scaling factor of the Native Element
         */
        _this.scale = 'Stretch';
        _this.diagramId = diagramId;
        _this.nodeId = nodeId;
        return _this;
    }
    Object.defineProperty(DiagramNativeElement.prototype, "content", {
        /**
         *  get the id for each element \
         *
         * @returns { string | SVGElement } get the id for each element.\
         *
         * @private
         */
        get: function () {
            return this.data;
        },
        /**
         *  sets the geometry of the native element \
         *
         * @returns { void } sets the geometry of the native element.\
         * @param {string | SVGElement} value - provide the id value.
         *
         * @private
         */
        set: function (value) {
            this.data = value;
            if (!this.canReset) {
                this.canReset = true;
                this.template = getContent(this, false);
                this.canReset = false;
                this.isDirt = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     *Measures minimum space that is required to render the Native Element \
     *
     * @returns { Size }Measures minimum space that is required to render the Native Element.\
     * @param {Size} availableSize - provide the id value.
     *
     * @private
     */
    DiagramNativeElement.prototype.measure = function (availableSize) {
        if (this.isDirt) {
            var rect = measureNativeContent(this.template);
            this.contentSize = new Size();
            this.contentSize.width = rect.width;
            this.contentSize.height = rect.height;
            var x = rect.x;
            var y = rect.y;
            this.templatePosition = { x: x, y: y };
            this.isDirt = false;
        }
        if (this.width === undefined || this.height === undefined) {
            var getAvailableSize = measureNativeSvg(this.template);
            this.desiredSize = new Size(getAvailableSize.width, getAvailableSize.height);
        }
        else {
            this.desiredSize = new Size(this.width, this.height);
        }
        this.desiredSize = this.validateDesiredSize(this.desiredSize, availableSize);
        return this.desiredSize;
    };
    /**
     *Arranges the Native Element \
     *
     * @returns { Size }Arranges the Native Element.\
     * @param {Size} desiredSize - provide the id value.
     *
     * @private
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DiagramNativeElement.prototype.arrange = function (desiredSize) {
        this.actualSize = new Size(this.desiredSize.width, this.desiredSize.height);
        this.updateBounds();
        return this.actualSize;
    };
    return DiagramNativeElement;
}(DiagramElement));
export { DiagramNativeElement };
