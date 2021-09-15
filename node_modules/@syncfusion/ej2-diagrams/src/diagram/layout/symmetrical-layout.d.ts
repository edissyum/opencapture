import { Layout } from './layout-base';
import { Rect } from '../primitives/rect';
import { PointModel } from '../primitives/point-model';
import { INode, IConnector } from './layout-base';
export declare class GraphForceNode {
    /**
     * @private
     */
    velocityX: number;
    /**
     * @private
     */
    velocityY: number;
    /**
     * @private
     */
    location: PointModel;
    /**
     * @private
     */
    nodes: IGraphObject[];
    /**
     * @private
     */
    graphNode: IGraphObject;
    constructor(gnNode: IGraphObject);
    /**
     * applyChanges method\
     *
     * @returns {  void }    applyChanges method .\
     * @private
     */
    applyChanges(): void;
}
/**
 * SymmetricalLayout
 */
export declare class SymmetricLayout {
    private cdCOEF;
    private cfMAXVELOCITY;
    private cnMAXITERACTION;
    private cnSPRINGLENGTH;
    private mszMaxForceVelocity;
    /**
     * @private
     */
    springLength: number;
    /**
     * @private
     */
    springFactor: number;
    /**
     * @private
     */
    maxIteration: number;
    private selectedNode;
    constructor();
    /**
     *To destroy the layout
     *
     * @returns {void} To destroy the layout
     */
    destroy(): void;
    protected getModuleName(): string;
    private doGraphLayout;
    private preLayoutNodes;
    /**
     * doLayout method\
     *
     * @returns {  void }    doLayout method .\
     * @param {GraphLayoutManager} graphLayoutManager - provide the angle value.
     * @private
     */
    doLayout(graphLayoutManager: GraphLayoutManager): void;
    private makeSymmetricLayout;
    private appendForces;
    private resetGraphPosition;
    private convertGraphNodes;
    /**
     * getForceNode method\
     *
     * @returns {  GraphForceNode }    getForceNode method .\
     * @param {IGraphObject} gnNode - provide the angle value.
     * @private
     */
    getForceNode(gnNode: IGraphObject): GraphForceNode;
    private updateNeigbour;
    private lineAngle;
    private pointDistance;
    private calcRelatesForce;
    /**
     * @param nodeCollection
     * @param connectors
     * @param symmetricLayout
     * @param nameTable
     * @param layout
     * @param viewPort
     * @private
     */
    /**
     * updateLayout method\
     *
     * @returns {  void }    updateLayout method .\
     * @param {IGraphObject[]} nodeCollection - provide the angle value.
     * @param {IGraphObject[]} connectors - provide the connectors value.
     * @param {SymmetricLayout} symmetricLayout - provide the symmetricLayout value.
     * @param {Object} nameTable - provide the nameTable value.
     * @param {Layout} layout - provide the layout value.
     * @param {PointModel} viewPort - provide the viewPort value.
     * @private
     */
    updateLayout(nodeCollection: IGraphObject[], connectors: IGraphObject[], symmetricLayout: SymmetricLayout, nameTable: Object, layout: Layout, viewPort: PointModel): void;
    private calcNodesForce;
    private calcForce;
}
export declare class GraphLayoutManager {
    private mhelperSelectedNode;
    private visitedStack;
    private cycleEdgesCollection;
    private nameTable;
    /**
     * @private
     */
    nodes: IGraphObject[];
    private graphObjects;
    private connectors;
    private passedNodes;
    /**
     * @private
     */
    selectedNode: IGraphObject;
    /**
     * @param nodeCollection
     * @param connectors
     * @param symmetricLayout
     * @param nameTable
     * @param layout
     * @param viewPort
     * @private
     */
    /**
     * updateLayout method\
     *
     * @returns {  boolean }    updateLayout method .\
     * @param {IGraphObject[]} nodeCollection - provide the nodeCollection value.
     * @param {IGraphObject[]} connectors - provide the nodeCollection value.
     * @param {SymmetricLayout} symmetricLayout - provide the nodeCollection value.
     * @param {Object} nameTable - provide the nodeCollection value.
     * @param {Layout} layout - provide the nodeCollection value.
     * @param {PointModel} viewPort - provide the nodeCollection value.
     * @private
     */
    updateLayout(nodeCollection: IGraphObject[], connectors: IGraphObject[], symmetricLayout: SymmetricLayout, nameTable: Object, layout: Layout, viewPort: PointModel): boolean;
    /**
     * getModelBounds method\
     *
     * @returns {  Rect }    getModelBounds method .\
     * @param {IGraphObject[]} lNodes - provide the angle value.
     * @private
     */
    getModelBounds(lNodes: IGraphObject[]): Rect;
    private updateLayout1;
    private getNodesToPosition;
    private selectNodes;
    private selectConnectedNodes;
    private exploreRelatives;
    private exploreRelatives1;
    private getConnectedRelatives;
    private dictionaryContains;
    private dictionaryLength;
    private getConnectedChildren;
    private getConnectedParents;
    private setNode;
    private findNode;
    private addGraphNode;
    private isConnectedToAnotherNode;
    private searchEdgeCollection;
    private exploreGraphEdge;
    private addNode;
    private detectCyclesInGraph;
    private getUnVisitedChildNodes;
}
export interface ITreeInfo extends INode, IConnector {
    graphType?: GraphObjectType;
    parents?: IGraphObject[];
    children?: IGraphObject[];
    tag?: GraphForceNode;
    center?: PointModel;
    Added?: boolean;
    isCycleEdge: boolean;
    visible?: boolean;
    GraphNodes?: {};
    LeftMargin?: number;
    TopMargin?: number;
    location?: PointModel;
    Bounds?: Rect;
}
export interface IGraphObject extends INode, IConnector {
    treeInfo?: ITreeInfo;
}
export declare type GraphObjectType = 'Node' | 'Connector';
