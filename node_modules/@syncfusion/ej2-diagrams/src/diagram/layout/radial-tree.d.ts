import { INode, Layout, Bounds } from './layout-base';
import { PointModel } from '../primitives/point-model';
import { HorizontalAlignment, VerticalAlignment } from '../enum/enum';
import { Rect } from '../primitives/rect';
import { MarginModel } from '../core/appearance-model';
/**
 * Radial Tree
 */
export declare class RadialTree {
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
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * @param nodes
     * @param nameTable
     * @param layoutProp
     * @param viewport
     * @private
     */
    updateLayout(nodes: INode[], nameTable: Object, layoutProp: Layout, viewport: PointModel): void;
    private doLayout;
    private updateEdges;
    private depthFirstAllignment;
    private populateLevels;
    private transformToCircleLayout;
    private updateAnchor;
    private updateNodes;
    private setUpLayoutInfo;
}
/**
 * Defines the properties of layout
 *
 * @private
 */
export interface IRadialLayout {
    anchorX?: number;
    anchorY?: number;
    maxLevel?: number;
    nameTable?: Object;
    firstLevelNodes?: INode[];
    layoutNodes?: INodeInfo[];
    centerNode?: INode;
    type?: string;
    orientation?: string;
    graphNodes?: {};
    verticalSpacing?: number;
    horizontalSpacing?: number;
    levels?: LevelBoundary[];
    horizontalAlignment?: HorizontalAlignment;
    verticalAlignment?: VerticalAlignment;
    fixedNode?: string;
    bounds?: Rect;
    level?: number;
    margin?: MarginModel;
    objects?: INode[];
    root?: string;
}
/**
 * Defines the node arrangement in radial manner
 *
 * @private
 */
export interface INodeInfo {
    level?: number;
    visited?: boolean;
    children?: INode[];
    x?: number;
    y?: number;
    min?: number;
    max?: number;
    width?: number;
    height?: number;
    segmentOffset?: number;
    actualCircumference?: number;
    radius?: number;
    circumference?: number;
    nodes?: INode[];
    ratio?: number;
}
/** @private */
export interface LevelBoundary {
    rBounds: Bounds;
    radius: number;
    height: number;
    nodes: INode[];
    node: INodeInfo;
}
