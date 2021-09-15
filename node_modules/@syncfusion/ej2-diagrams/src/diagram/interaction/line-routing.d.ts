import { Diagram } from '../diagram';
import { Connector } from '../objects/connector';
/**
 * Line Routing
 */
export declare class LineRouting {
    private size;
    private startGrid;
    private noOfRows;
    private noOfCols;
    private width;
    private height;
    private diagramStartX;
    private diagramStartY;
    private intermediatePoints;
    private gridCollection;
    private startNode;
    private targetNode;
    private targetGrid;
    private startArray;
    private targetGridCollection;
    private sourceGridCollection;
    private considerWalkable;
    /**
     * lineRouting method \
     *
     * @returns { void }     lineRouting method .\
     * @param {Diagram} diagram - provide the source value.
     *
     * @private
     */
    lineRouting(diagram: Diagram): void;
    /** @private */
    /**
     * renderVirtualRegion method \
     *
     * @returns { void }     renderVirtualRegion method .\
     * @param {Diagram} diagram - provide the source value.
     * @param {boolean} isUpdate - provide the target value.
     *
     * @private
     */
    renderVirtualRegion(diagram: Diagram, isUpdate?: boolean): void;
    private findNodes;
    private updateNodesInVirtualRegion;
    private intersectRect;
    private findEndPoint;
    /**
     * refreshConnectorSegments method \
     *
     * @returns { void }     refreshConnectorSegments method .\
     * @param {Diagram} diagram - provide the diagram value.
     * @param {Connector} connector - provide the connector value.
     * @param {boolean} isUpdate - provide the diagram value.
     *
     * @private
     */
    refreshConnectorSegments(diagram: Diagram, connector: Connector, isUpdate: boolean): void;
    private checkChildNodes;
    private findEdgeBoundary;
    private checkObstacles;
    private contains;
    private getEndvalue;
    private changeValue;
    private getIntermediatePoints;
    private updateConnectorSegments;
    private findPath;
    private sorting;
    private octile;
    private manhattan;
    private findNearestNeigbours;
    private neigbour;
    private resetGridColl;
    private isWalkable;
    private findIntermediatePoints;
    /**
     * Constructor for the line routing module
     *
     * @private
     */
    constructor();
    /**
     *To destroy the line routing
     *
     * @returns {void} To destroy the line routing
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
/** @private */
export interface VirtualBoundaries {
    x: number;
    y: number;
    width: number;
    height: number;
    gridX: number;
    gridY: number;
    walkable: boolean;
    tested: boolean;
    nodeId: string[];
    previousDistance?: number;
    afterDistance?: number;
    totalDistance?: number;
    parent?: VirtualBoundaries;
    parentNodeId?: string;
}
