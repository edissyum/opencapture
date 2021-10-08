import { INode, IConnector, Layout } from './layout-base';
import { PointModel } from '../primitives/point-model';
import { LineDistribution, MatrixCellGroupObject } from '../interaction/line-distribution';
/**
 * Connects diagram objects with layout algorithm
 */
export declare class ComplexHierarchicalTree {
    /**
     * Constructor for the hierarchical tree layout module
     *
     * @private
     */
    constructor();
    /**
     * To destroy the hierarchical tree module
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
    /**
     * Core method to return the component name.
     *
     * @returns {string}  Core method to return the component name.
     * @private
     */
    protected getModuleName(): string;
    /**
     * doLayout method\
     *
     * @returns {  void }    doLayout method .\
     * @param {INode[]} nodes - provide the nodes value.
     * @param {{}} nameTable - provide the nameTable value.
     * @param {Layout} layout - provide the layout value.
     * @param {PointModel} viewPort - provide the viewPort value.
     * @param {LineDistribution} lineDistribution - provide the lineDistribution value.
     * @private
     */
    doLayout(nodes: INode[], nameTable: {}, layout: Layout, viewPort: PointModel, lineDistribution: LineDistribution): void;
    getLayoutNodesCollection(nodes: INode[]): INode[];
}
/**
 * Utility that arranges the nodes in hierarchical structure
 */
declare class HierarchicalLayoutUtil {
    private nameTable;
    /**
     * Holds the collection vertices, that are equivalent to nodes to be arranged
     */
    private vertices;
    private crossReduction;
    /**
     * The preferred vertical offset between edges exiting a vertex Default is 2.
     */
    private previousEdgeOffset;
    /**
     * The preferred horizontal distance between edges exiting a vertex Default is 5.
     */
    private previousEdgeDistance;
    /**
     * Holds the collection vertices, that are equivalent to nodes to be arranged
     */
    private jettyPositions;
    /**
     * Internal cache of bottom-most value of Y for each rank
     */
    private rankBottomY;
    /**
     * Internal cache of bottom-most value of X for each rank
     */
    private limitX;
    /**
     * Internal cache of top-most values of Y for each rank
     */
    private rankTopY;
    /**
     * The minimum parallelEdgeSpacing value is 12.
     */
    private parallelEdgeSpacing;
    /**
     * The minimum distance for an edge jetty from a vertex Default is 12.
     */
    private minEdgeJetty;
    private createVertex;
    /**
     * Initializes the edges collection of the vertices\
     *
     * @returns {  IConnector[] }    Initializes the edges collection of the vertices\
     * @param {Vertex} node - provide the node value.
     * @private
     */
    getEdges(node: Vertex): IConnector[];
    private findRoots;
    /**
     * Returns the source/target vertex of the given connector \
     *
     * @returns {  Vertex }    Returns the source/target vertex of the given connector \
     * @param {IConnector} edge - provide the node value.
     * @param {boolean} source - provide the node value.
     * @private
     */
    getVisibleTerminal(edge: IConnector, source: boolean): Vertex;
    /**
     * Traverses each sub tree, ensures there is no cycle in traversing \
     *
     * @returns {  {} }    Traverses each sub tree, ensures there is no cycle in traversing .\
     * @param {Vertex} vertex - provide the vertex value.
     * @param {boolean} directed - provide the directed value.
     * @param {IConnector} edge - provide the edge value.
     * @param {{}} currentComp - provide the currentComp value.
     * @param {{}[]} hierarchyVertices - provide the hierarchyVertices value.
     * @param {{}} filledVertices - provide the filledVertices value.
     * @private
     */
    traverse(vertex: Vertex, directed: boolean, edge: IConnector, currentComp: {}, hierarchyVertices: {}[], filledVertices: {}): {};
    private getModelBounds;
    /**
     *  Initializes the layouting process \
     *
     * @returns {  Vertex }     Initializes the layouting process \
     * @param {INode[]} nodes - provide the node value.
     * @param {{}} nameTable - provide the nameTable value.
     * @param {Layout} layoutProp - provide the layoutProp value.
     * @param {PointModel} viewPort - provide the viewPort value.
     * @param {LineDistribution} lineDistribution - provide the lineDistribution value.
     * @private
     */
    doLayout(nodes: INode[], nameTable: {}, layoutProp: Layout, viewPort: PointModel, lineDistribution: LineDistribution): void;
    private setEdgeXY;
    private resetOffsetXValue;
    private setEdgePosition;
    private getPointvalue;
    private updateEdgeSetXYValue;
    private getPreviousLayerConnectedCells;
    private compare;
    private localEdgeProcessing;
    private updateMultiOutEdgesPoints;
    private getNextLayerConnectedCells;
    private getX;
    private getGeometry;
    private setEdgePoints;
    private assignRankOffset;
    private rankCoordinatesAssigment;
    private getType;
    private updateRankValuess;
    private setVertexLocationValue;
    private matrixModel;
    private calculateRectValue;
    private isNodeOverLap;
    private isIntersect;
    private updateMargin;
    private placementStage;
    private coordinateAssignment;
    private calculateWidestRank;
    /**
     * Sets the temp position of the node on the layer \
     *
     * @returns {  void }  Sets the temp position of the node on the layer \
     * @param {IVertex} node - provide the nodes value.
     * @param {number} layer - provide the layer value.
     * @param {number} value - provide the value value.
     * @private
     */
    setTempVariable(node: IVertex, layer: number, value: number): void;
    /**
     * setXY method \
     *
     * @returns { void }     setXY method .\
     * @param {IVertex} node - provide the source value.
     * @param {number} layer - provide the target value.
     * @param {number} value - provide the layoutOrientation value.
     * @param {boolean} isY - provide the layoutOrientation value.
     * @param {IVertex[][]} ranks - provide the layoutOrientation value.
     * @param {number} spacing - provide the layoutOrientation value.
     *
     * @private
     */
    setXY(node: IVertex, layer: number, value: number, isY: boolean, ranks?: IVertex[][], spacing?: number): void;
    private rankCoordinates;
    private initialCoords;
    /**
     *  Checks whether the given node is an ancestor \
     *
     * @returns {  boolean }  Checks whether the given node is an ancestor \
     * @param {IVertex} node - provide the nodes value.
     * @param {IVertex} otherNode - provide the layer value.
     * @private
     */
    isAncestor(node: IVertex, otherNode: IVertex): boolean;
    private weightedCellSorter;
    private minNode;
    private updateNodeList;
    private medianXValue;
    private placementStageExecute;
    private setCellLocations;
    private garphModelsetVertexLocation;
    private setVertexLocation;
    /**
     *  get the specific value from the key value pair \
     *
     * @returns {  {}[] }  get the specific value from the key value pair \
     * @param {VertexMapper} mapper - provide the mapper value.
     * @private
     */
    private getValues;
    /**
     *Checks and reduces the crosses in between line segments \
     *
     * @returns { void }    Checks and reduces the crosses in between line segments.\
     * @param {End} model - provide the model value.
     *
     * @private
     */
    private crossingStage;
    private layeringStage;
    private initialRank;
    private fixRanks;
    private cycleStage;
    /**
     * removes the edge from the given collection \
     *
     * @returns {  IEdge }    removes the edge from the given collection .\
     * @param {IEdge} obj - provide the angle value.
     * @param { IEdge[]} array - provide the angle value.
     * @private
     */
    remove(obj: IEdge, array: IEdge[]): IEdge;
    /**
     * Inverts the source and target of an edge \
     *
     * @returns {  void }    Inverts the source and target of an edge .\
     * @param {IEdge} connectingEdge - provide the angle value.
     * @param { number} layer - provide the angle value.
     * @private
     */
    invert(connectingEdge: IEdge, layer: number): void;
    /**
     * used to get the edges between the given source and target  \
     *
     * @returns {  IConnector[] }    used to get the edges between the given source and target  .\
     * @param {Vertex} source - provide the angle value.
     * @param { Vertex} target - provide the angle value.
     * @param { boolean} directed - provide the angle value.
     * @private
     */
    getEdgesBetween(source: Vertex, target: Vertex, directed: boolean): IConnector[];
}
/**
 * Handles position the objects in a hierarchical tree structure
 */
declare class MultiParentModel {
    /** @private */
    roots: Vertex[];
    /** @private */
    vertexMapper: VertexMapper;
    /** @private */
    edgeMapper: VertexMapper;
    /** @private */
    layout: LayoutProp;
    /** @private */
    maxRank: number;
    private hierarchicalLayout;
    private multiObjectIdentityCounter;
    /** @private */
    ranks: IVertex[][];
    private dfsCount;
    /** @private */
    startNodes: IVertex[];
    private hierarchicalUtil;
    constructor(layout: HierarchicalLayoutUtil, vertices: Vertex[], roots: Vertex[], dlayout: LayoutProp);
    private resetEdge;
    private createInternalCells;
    /**
     * used to set the optimum value of each vertex on the layout \
     *
     * @returns {  void }   used to set the optimum value of each vertex on the layout .\
     * @private
     */
    fixRanks(): void;
    private updateMinMaxRank;
    private setDictionary;
    /**
     * used to store the value of th given key on the objectt \
     *
     * @returns {  IVertex }   used to store the value of th given key on the object .\
     * @param {VertexMapper} dic - provide the angle value.
     * @param {IVertex} key - provide the angle value.
     * @param {WeightedCellSorter} value - provide the angle value.
     * @param {boolean} flag - provide the angle value.
     * @private
     */
    setDictionaryForSorter(dic: VertexMapper, key: IVertex, value: WeightedCellSorter, flag: boolean): IVertex;
    /**
     * used to get the value of the given key \
     *
     * @returns {  IVertex }  used to get the value of the given key .\
     * @param {VertexMapper} dic - provide the angle value.
     * @param {IVertex} key - provide the angle value.
     * @private
     */
    getDictionary(dic: VertexMapper, key: Vertex): IVertex;
    /**
     * used to get the value of the given key \
     *
     * @returns {  IVertex }  used to get the value of the given key .\
     * @param {VertexMapper} dic - provide the angle value.
     * @param {IVertex} key - provide the angle value.
     * @private
     */
    getDictionaryForSorter(dic: VertexMapper, key: IVertex): WeightedCellSorter;
    /**
     * used to get all the values of the dictionary object \
     *
     * @returns {  IVertex[] }  used to get all the values of the dictionary object .\
     * @param {VertexMapper} dic - provide the angle value.
     * @private
     */
    getDictionaryValues(dic: VertexMapper): IVertex[];
    /**
     * used to visit all the entries on the given dictionary with given function \
     *
     * @returns { void }  used to visit all the entries on the given dictionary with given function .\
     * @param {string} visitor - provide the visitor value.
     * @param {IVertex[]} dfsRoots - provide the dfsRoots value.
     * @param {boolean} trackAncestors - provide the trackAncestors value.
     * @param {{}} seenNodes - provide the seenNodes value.
     * @param {TraverseData} data - provide the data value.
     * @private
     */
    visit(visitor: string, dfsRoots: IVertex[], trackAncestors: boolean, seenNodes: {}, data: TraverseData): void;
    private depthFirstSearch;
    private updateConnectionRank;
    private removeConnectionEdge;
    private extendedDfs;
    /**
     * used to clone the specified object ignoring all fieldnames in the given array of transient fields \
     *
     * @returns { void }    used to clone the specified object ignoring all fieldnames in the given array of transient fields .\
     * @param {Object} obj - provide the source value.
     * @param {string[]} transients - provide the target value.
     * @param {boolean} shallow - provide the shallow value.
     *
     * @private
     */
    clone(obj: Object, transients: string[], shallow: boolean): Object;
}
/**
 * Each vertex means a node object in diagram
 */
export interface Vertex {
    value: string;
    geometry: Rect;
    name: string;
    vertex: boolean;
    inEdges: string[];
    outEdges: string[];
    layoutObjectId?: string;
}
/** @private */
export interface MatrixModelObject {
    model: MultiParentModel;
    matrix: MatrixObject[];
    rowOffset: number[];
}
/** @private */
export interface MatrixObject {
    key: number;
    value: MatrixCellGroupObject[];
}
/**
 * Defines the edge that is used to maintain the relationship between internal vertices
 *
 * @private
 */
export interface IEdge {
    x?: number[];
    y?: number[];
    temp?: number[];
    edges?: IConnector[];
    ids?: string[];
    source?: IVertex;
    target?: IVertex;
    maxRank?: number;
    minRank?: number;
    isReversed?: boolean;
    previousLayerConnectedCells?: IVertex[][];
    nextLayerConnectedCells?: IVertex[][];
    width?: number;
    height?: number;
}
/**
 * Defines the internal vertices that are used in positioning the objects
 *
 * @private
 */
export interface IVertex {
    x?: number[];
    y?: number[];
    temp?: number[];
    cell?: Vertex;
    edges?: IConnector[];
    id?: string;
    connectsAsTarget?: IEdge[];
    connectsAsSource?: IEdge[];
    hashCode?: number[];
    maxRank?: number;
    minRank?: number;
    width?: number;
    height?: number;
    source?: IVertex;
    target?: IVertex;
    layoutObjectId?: string;
    ids?: string[];
    type?: string;
    identicalSibiling?: string[];
}
interface VertexMapper {
    map: {};
}
/**
 * Defines weighted cell sorter
 */
interface WeightedCellSorter {
    cell?: IVertex;
    weightedValue?: number;
    visited?: boolean;
    rankIndex?: number;
}
/**
 * Defines an object that is used to maintain data in traversing
 */
interface TraverseData {
    seenNodes: {};
    unseenNodes: {};
    rankList?: IVertex[][];
    parent?: IVertex;
    root?: IVertex;
    edge?: IEdge;
}
/**
 * Defines the properties of layout
 *
 * @private
 */
export interface LayoutProp {
    orientation?: string;
    horizontalSpacing?: number;
    verticalSpacing?: number;
    marginX: number;
    marginY: number;
    enableLayoutRouting: boolean;
}
interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    right?: number;
    bottom?: number;
    left?: number;
}
export {};
