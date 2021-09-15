import { Container } from '../core/containers/container';
import { DiagramEvent, RealAction, DiagramConstraints } from '../enum/enum';
import { cloneObject as clone } from '../utility/base-util';
import { cloneBlazorObject } from '../utility/diagram-util';
/**
 * Layout Animation function to enable or disable layout animation
 */
var LayoutAnimation = /** @class */ (function () {
    function LayoutAnimation() {
        this.protectChange = false;
    }
    /**
     * Layout expand function for animation of expand and collapse \
     *
     * @returns {  void }   Layout expand function for animation of expand and collapse .\
     * @param {boolean} animation - provide the angle value.
     * @param {ILayout} objects - provide the angle value.
     * @param {Node} node - provide the angle value.
     * @param {Diagram} diagram - provide the angle value.
     * @private
     */
    LayoutAnimation.prototype.expand = function (animation, objects, node, diagram) {
        var _this = this;
        var setIntervalObject = {};
        var i = 0;
        var j = 0;
        diagram.realActions = diagram.realActions | RealAction.AnimationClick;
        setIntervalObject[i] = setInterval(function () {
            j++;
            return _this.layoutAnimation(objects, setIntervalObject, j === 6, diagram, node);
        }, 20);
        if (node.isExpanded) {
            var opacity_1 = .2;
            var protect = 'isProtectedOnChange';
            this.protectChange = diagram[protect];
            diagram.protectPropertyChange(false);
            //let objects: ILayout = diagram.doLayout();
            var setIntervalObjects_1 = {};
            var x = 0;
            if (animation) {
                this.updateOpacity(node, opacity_1, diagram);
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                var current = this;
                setIntervalObjects_1[x] = setInterval(function () {
                    diagram.allowServerDataBinding = false;
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    opacity_1 <= 1 ? _this.updateOpacity(node, opacity_1, diagram) : clearInterval(setIntervalObjects_1[0]);
                    opacity_1 += .2;
                    diagram.allowServerDataBinding = true;
                }, 20);
            }
        }
    };
    /**
     * Setinterval and Clear interval for layout animation \
     *
     * @returns {  void }   Setinterval and Clear interval for layout animation .\
     * @param {ILayout} objValue - provide the angle value.
     * @param {Object} layoutTimer - provide the angle value.
     * @param {ILayout} stop - provide the angle value.
     * @param {Diagram} diagram - provide the angle value.
     * @param {NodeModel} node - provide the angle value.
     * @private
     */
    LayoutAnimation.prototype.layoutAnimation = function (objValue, layoutTimer, stop, diagram, node) {
        if (!stop) {
            for (var k = 0; k < objValue.objects.length; k++) {
                var node_1 = diagram.nameTable[objValue.objects[k].id];
                node_1.offsetX += objValue.objects[k].differenceX / 5;
                node_1.offsetY += objValue.objects[k].differenceY / 5;
            }
        }
        if (stop) {
            clearInterval(layoutTimer[0]);
            diagram.realActions = diagram.realActions & ~RealAction.AnimationClick;
            diagram.refreshCanvasLayers();
            diagram.protectPropertyChange(true);
            diagram.triggerEvent(DiagramEvent.animationComplete, undefined);
            diagram.organizationalChartModule.isAnimation = false;
            diagram.layout.fixedNode = '';
            diagram.protectPropertyChange(this.protectChange);
            var arg = {
                element: cloneBlazorObject(clone(node)), state: (node.isExpanded) ? true : false
            };
            diagram.triggerEvent(DiagramEvent.expandStateChange, arg);
            if (diagram.lineRoutingModule && diagram.constraints & DiagramConstraints.LineRouting) {
                diagram.resetSegments();
            }
        }
    };
    /**
     *update the node opacity for the node and connector once the layout animation starts \
     *
     * @returns {  void }    update the node opacity for the node and connector once the layout animation starts .\
     * @param {Node} source - provide the source value.
     * @param {number} value - provide the value.
     * @param {Diagram} diagram - provide the diagram value.
     * @private
     */
    LayoutAnimation.prototype.updateOpacity = function (source, value, diagram) {
        for (var i = 0; i < source.outEdges.length; i++) {
            var connector = diagram.nameTable[source.outEdges[i]];
            var target = diagram.nameTable[connector.targetID];
            connector.style.opacity = value;
            for (var j = 0; j < connector.wrapper.children.length; j++) {
                connector.wrapper.children[j].style.opacity = value;
                target.style.opacity = value;
                if (target.wrapper instanceof Container) {
                    diagram.updateNodeProperty(target.wrapper, undefined, value);
                }
            }
            this.updateOpacity(target, value, diagram);
        }
    };
    /**
     *To destroy the ruler
     *
     * @returns {void} To destroy the ruler
     */
    LayoutAnimation.prototype.destroy = function () {
        /**
         * Destroys the LayoutAnimate module
         */
    };
    /**
     * Core method to return the component name.
     *
     * @returns {string}  Core method to return the component name.
     * @private
     */
    LayoutAnimation.prototype.getModuleName = function () {
        /**
         * Returns the module name
         */
        return 'LayoutAnimate';
    };
    return LayoutAnimation;
}());
export { LayoutAnimation };
