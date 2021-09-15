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
import { compile as baseTemplateComplier } from '@syncfusion/ej2-base';
import { DrawingElement } from '@syncfusion/ej2-drawings';
/**
 * HTMLElement defines the basic html elements
 */
var DiagramHtmlElement = /** @class */ (function (_super) {
    __extends(DiagramHtmlElement, _super);
    /**
     * set the id for each element
     *
     * @param {string} nodeTemplate - Set the id for each element.
     * @returns {void}
     *
     * @private
     */
    function DiagramHtmlElement(nodeTemplate) {
        var _this = _super.call(this) || this;
        _this.templateFn = _this.templateCompiler(nodeTemplate);
        return _this;
    }
    DiagramHtmlElement.prototype.templateCompiler = function (template) {
        if (template) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            var e = void 0;
            try {
                if (document.querySelectorAll(template).length) {
                    return baseTemplateComplier(document.querySelector(template).innerHTML.trim());
                }
            }
            catch (e) {
                return baseTemplateComplier(template);
            }
        }
        return undefined;
    };
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
    return DiagramHtmlElement;
}(DrawingElement));
export { DiagramHtmlElement };
