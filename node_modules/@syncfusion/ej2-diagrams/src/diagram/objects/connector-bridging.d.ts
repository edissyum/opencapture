import { PointModel } from '../primitives/point-model';
import { BridgeDirection } from '../enum/enum';
import { Diagram } from '../diagram';
import { BridgeSegment } from '../utility/connector';
import { ArcSegment } from '../utility/connector';
import { Connector } from './connector';
/**
 * ConnectorBridging defines the bridging behavior
 */
/** @private */
export declare class ConnectorBridging {
    /**
     * @param {Connector}conn - provide the target  value.
     * @param {Diagram}diagram - provide the target  value.
     * @private
     */
    updateBridging(conn: Connector, diagram: Diagram): void;
    /**
     * @param {BridgeSegment[]}bridgeList - provide the bridgeList  value.
     * @param {Connector}connector - provide the connector  value.
     * @param {number}bridgeSpacing - provide the bridgeSpacing  value.
     * @private
     */
    firstBridge(bridgeList: BridgeSegment[], connector: Connector, bridgeSpacing: number): void;
    /**
     * @returns { ArcSegment } checkSourcePointInTarget method .\
     * @param {PointModel}st- provide the st  value.
     * @param {PointModel}end- provide the end  value.
     * @param {number}angle- provide the angle  value.
     * @param {BridgeDirection}direction- provide the direction  value.
     * @param {number}index- provide the index  value.
     * @param {Connector}conn- provide the conn  value.
     * @param {Diagram} diagram- provide the diagram  value.
     * @private
     */
    createSegment(st: PointModel, end: PointModel, angle: number, direction: BridgeDirection, index: number, conn: Connector, diagram: Diagram): ArcSegment;
    /**
     * @param {PointModel}startPt- provide the startPt  value.
     * @param {PointModel}endPt- provide the endPt  value.
     * @param {number}angle- provide the angle  value.
     * @param {number}bridgeSpace- provide the bridgeSpace  value.
     * @param {number}sweep- provide the sweep  value.
     * @private
     */
    createBridgeSegment(startPt: PointModel, endPt: PointModel, angle: number, bridgeSpace: number, sweep: number): string;
    /**
     * @param {number}angle- provide the source value.
     * @param {BridgeDirection}bridgeDirection- provide the source value.
     * @param {Connector}connector- provide the source value.
     * @param {Diagram}diagram- provide the source value.
     * @private
     */
    sweepDirection(angle: number, bridgeDirection: BridgeDirection, connector: Connector, diagram: Diagram): number;
    /** @private */
    getPointAtLength(length: number, pts: PointModel[]): PointModel;
    /**
     * @param {PointModel[]}connector- provide the source value.
     * @private
     */
    protected getPoints(connector: Connector): PointModel[];
    private intersectsRect;
    /**
     * @param {PointModel[]}points1- provide the source value.
     * @param {PointModel[]}points2- provide the source value.
     * @param {boolean}self- provide the source value.
     * @param {BridgeDirection}bridgeDirection- provide the source value.
     * @param {PointModel[]}zOrder- provide the source value.
     * @private
     */
    intersect(points1: PointModel[], points2: PointModel[], self: boolean, bridgeDirection: BridgeDirection, zOrder: boolean): PointModel[];
    /**
     * @param {PointModel}startPt- provide the target  value.
     * @param {PointModel}endPt- provide the target  value.
     * @param {PointModel[]}pts- provide the target  value.
     * @param {boolean}zOrder- provide the target  value.
     * @param {BridgeDirection}bridgeDirection- provide the target  value.
     * @private
     */
    inter1(startPt: PointModel, endPt: PointModel, pts: PointModel[], zOrder: boolean, bridgeDirection: BridgeDirection): PointModel[];
    private checkForHorizontalLine;
    private isEmptyPoint;
    private getLengthAtFractionPoint;
    private getSlope;
    /**
     * @param {PointModel}startPt- provide the target  value.
     * @param {PointModel}endPt- provide the target  value.
     * @private
     */
    angleCalculation(startPt: PointModel, endPt: PointModel): number;
    private lengthCalculation;
    /**
     * Constructor for the bridging module
     *
     * @private
     */
    constructor();
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
