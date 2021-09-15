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
import { DiagramElement } from './diagram-element';
import { getContent } from '../../utility/dom-util';
import { templateCompiler } from '../../utility/base-util';
/**
 * HTMLElement defines the basic html elements
 */
var DiagramHtmlElement = /** @class */ (function (_super) {
    __extends(DiagramHtmlElement, _super);
    /**
     * set the id for each element \
     *
     * @returns { void }set the id for each element\
     * @param {string} nodeId - provide the x value.
     * @param {string} diagramId - provide the y value.
     * @param {string} annotationId - provide the id value.
     * @param {string} nodeTemplate - provide the id value.
     *
     * @private
     */
    function DiagramHtmlElement(nodeId, diagramId, annotationId, nodeTemplate) {
        var _this = _super.call(this) || this;
        _this.data = '';
        /**
         * Gets the node id for the element
         */
        _this.nodeId = '';
        /**
         * defines the id of the annotation on rendering template on label.
         * @private
         */
        _this.annotationId = '';
        /**
         * Gets the diagram id for the html element
         */
        _this.diagramId = '';
        _this.diagramId = diagramId;
        _this.nodeId = nodeId;
        _this.annotationId = annotationId;
        _this.templateFn = templateCompiler(nodeTemplate);
        return _this;
    }
    /**
     * getNodeTemplate method \
     *
     * @returns { Function } getNodeTemplate method .\
     *
     * @private
     */
    DiagramHtmlElement.prototype.getNodeTemplate = function () {
        return this.templateFn;
    };
    Object.defineProperty(DiagramHtmlElement.prototype, "content", {
        /**
         * Gets or sets the geometry of the html element \
         *
         * @returns { string | HTMLElement } Gets or sets the geometry of the html element \
         *
         * @private
         */
        get: function () {
            return this.data;
        },
        /**
         * Gets or sets the value of the html element \
         *
         * @returns { void }Gets or sets the value of the html element\
         * @param {string | HTMLElement} value - provide the value value.
         *
         * @private
         */
        set: function (value) {
            this.data = value;
            if (!this.canReset) {
                this.canReset = true;
                if (!this.isTemplate) {
                    this.template = getContent(this, true);
                }
                this.canReset = false;
                this.isDirt = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    return DiagramHtmlElement;
}(DiagramElement));
export { DiagramHtmlElement };
