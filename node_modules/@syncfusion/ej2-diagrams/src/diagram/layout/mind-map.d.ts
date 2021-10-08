import { Layout, INode } from './layout-base';
import { PointModel } from '../primitives/point-model';
/**
 * Layout for mind-map tree
 */
export declare class MindMap {
    /**
     * Constructor for the organizational chart module.
     *
     * @private
     */
    constructor();
    /**
     * To destroy the organizational chart
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
    /**
     * Defines the layout animation
     *
     */
    isAnimation: boolean;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * @param nodes
     * @param nameTable
     * @param layoutProp
     * @param viewPort
     * @param uniqueId
     * @param root
     * @private
     */
    updateLayout(nodes: INode[], nameTable: Object, layoutProp: Layout, viewPort: PointModel, uniqueId: string, root?: string): void;
    private checkRoot;
    private updateMindMapBranch;
    private getBranch;
    private excludeFromLayout;
    private findFirstLevelNodes;
}
