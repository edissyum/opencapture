import { Diagram } from '../diagram';
import { Node } from '../objects/node';
import { ILayout } from '../layout/layout-base';
import { NodeModel } from '../objects/node-model';
/**
 * Layout Animation function to enable or disable layout animation
 */
export declare class LayoutAnimation {
    private protectChange;
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
    expand(animation: boolean, objects: ILayout, node: Node, diagram: Diagram): void;
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
    layoutAnimation(objValue: ILayout, layoutTimer: Object, stop: boolean, diagram: Diagram, node?: NodeModel): void;
    /**
     *update the node opacity for the node and connector once the layout animation starts \
     *
     * @returns {  void }    update the node opacity for the node and connector once the layout animation starts .\
     * @param {Node} source - provide the source value.
     * @param {number} value - provide the value.
     * @param {Diagram} diagram - provide the diagram value.
     * @private
     */
    updateOpacity(source: Node, value: number, diagram: Diagram): void;
    /**
     *To destroy the ruler
     *
     * @returns {void} To destroy the ruler
     */
    destroy(): void;
    /**
     * Core method to return the component name.
     *
     * @returns {string}  Core method to return the component name.
     * @private
     */
    protected getModuleName(): string;
}
