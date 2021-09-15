import { isNullOrUndefined, getEnumValue } from '@syncfusion/ej2-base';
import { RenderType } from '../base/enum';
/**
 * RendererFactory
 *
 * @hidden

 */
var RendererFactory = /** @class */ (function () {
    function RendererFactory() {
        this.rendererMap = {};
    }
    /**
     * addRenderer method
     *
     * @param {RenderType} name - specifies the render type
     * @param {IRenderer} type - specifies the renderer.
     * @returns {void}
     * @hidden

     */
    RendererFactory.prototype.addRenderer = function (name, type) {
        var rName = getEnumValue(RenderType, name);
        if (isNullOrUndefined(this.rendererMap[rName])) {
            this.rendererMap[rName] = type;
        }
    };
    /**
     * getRenderer method
     *
     * @param {RenderType} name - specifies the render type
     * @returns {void}
     * @hidden

     */
    RendererFactory.prototype.getRenderer = function (name) {
        var rName = getEnumValue(RenderType, name);
        if (isNullOrUndefined(this.rendererMap[rName])) {
            // eslint-disable-next-line
            throw "The renderer " + rName + " is not found";
        }
        else {
            return this.rendererMap[rName];
        }
    };
    return RendererFactory;
}());
export { RendererFactory };
