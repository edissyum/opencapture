/* eslint-disable jsdoc/require-returns */
/* eslint-disable valid-jsdoc */
import { Point } from '../primitives/point';
import { Rect } from '../primitives/rect';
import { intersect2 } from '../utility/diagram-util';
import { canBridge } from '../utility/constraints-util';
/**
 * ConnectorBridging defines the bridging behavior
 */
/** @private */
var ConnectorBridging = /** @class */ (function () {
    /**
     * Constructor for the bridging module
     *
     * @private
     */
    function ConnectorBridging() {
        //constructs the bridging module
    }
    /**
     * @param {Connector}conn - provide the target  value.
     * @param {Diagram}diagram - provide the target  value.
     * @private
     */
    ConnectorBridging.prototype.updateBridging = function (conn, diagram) {
        var lastBridge = [];
        var bounds;
        conn.bridges = [];
        if (canBridge(conn, diagram)) {
            // if (this.canBridge(conn, diagram)) {
            var points1 = this.getPoints(conn);
            bounds = Rect.toBounds(points1);
            var bridgeSpacing = conn.bridgeSpace;
            var bgedir = diagram.bridgeDirection;
            var count = -1;
            var quads = diagram.connectors;
            for (var q = 0; q < quads.length; q++) {
                var connector1 = quads[q];
                if (conn && connector1 && conn.id !== connector1.id) {
                    var points2 = this.getPoints(connector1);
                    var bounds1 = Rect.toBounds(points2);
                    if (this.intersectsRect(bounds, bounds1)) {
                        var intersectPts = this.intersect(points1, points2, false, bgedir, true);
                        if (intersectPts.length > 0) {
                            for (var i = 0; i < intersectPts.length; i++) {
                                var fullLength = 0;
                                var length_1 = 0;
                                var segmentIndex = 0;
                                var pointIndex = 0;
                                var obj = this.getLengthAtFractionPoint(conn, intersectPts[i]);
                                if (obj.pointIndex !== -1) {
                                    length_1 = obj.lengthFractionIndex;
                                    fullLength = obj.fullLength;
                                    segmentIndex = obj.segmentIndex;
                                    pointIndex = obj.pointIndex;
                                    var stBridge = this.getPointAtLength((length_1 - (bridgeSpacing / 2)), points1);
                                    var enBridge = this.getPointAtLength((length_1 + (bridgeSpacing / 2)), points1);
                                    var fractLength = (length_1 - (bridgeSpacing / 2)) / fullLength;
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    fractLength = (length_1 + (bridgeSpacing / 2)) / fullLength;
                                    if (this.isEmptyPoint(enBridge)) {
                                        enBridge = stBridge;
                                    }
                                    var end = void 0;
                                    var start = conn.sourcePoint;
                                    if (conn.type === 'Straight') {
                                        end = conn.targetPoint;
                                    }
                                    else {
                                        end = conn.intermediatePoints[pointIndex];
                                    }
                                    var angle = this.angleCalculation(start, end);
                                    if (lastBridge.length) {
                                        var fixedPoint = conn.sourcePoint;
                                        var fix = Math.abs(this.lengthCalculation(fixedPoint, enBridge));
                                        var var1 = 0;
                                        var insertAt = -1;
                                        count = -1;
                                        for (var k = 0; k < lastBridge[segmentIndex].bridges.length; k++) {
                                            count++;
                                            var arcSeg = lastBridge[segmentIndex].bridges[k];
                                            var1 = Math.abs(this.lengthCalculation(fixedPoint, arcSeg.endPoint));
                                            if (fix < var1) {
                                                insertAt = count;
                                                break;
                                            }
                                        }
                                        if (insertAt >= 0) {
                                            //let paths: ArcSegment;
                                            // eslint-disable-next-line max-len
                                            var paths = this.createSegment(stBridge, enBridge, angle, bgedir, pointIndex, conn, diagram);
                                            paths.target = connector1.id;
                                            lastBridge[segmentIndex].bridges.splice(insertAt, 0, paths);
                                            lastBridge[segmentIndex].bridges.join();
                                            lastBridge[segmentIndex].bridgeStartPoint.splice(insertAt, 0, stBridge);
                                            lastBridge[segmentIndex].bridgeStartPoint.join();
                                            lastBridge[segmentIndex].segmentIndex = segmentIndex;
                                        }
                                        else {
                                            //let paths: ArcSegment;
                                            // eslint-disable-next-line max-len
                                            var paths = this.createSegment(stBridge, enBridge, angle, bgedir, pointIndex, conn, diagram);
                                            paths.target = connector1.id;
                                            lastBridge[segmentIndex].bridges.push(paths);
                                            lastBridge[segmentIndex].bridgeStartPoint.push(stBridge);
                                            lastBridge[segmentIndex].segmentIndex = segmentIndex;
                                        }
                                    }
                                    else {
                                        if (!isNaN(stBridge.x) && !isNaN(stBridge.y) && !this.isEmptyPoint(enBridge)) {
                                            //let arcs: ArcSegment;
                                            var bges = [];
                                            var bgept = [];
                                            // eslint-disable-next-line max-len
                                            var arcs = this.createSegment(stBridge, enBridge, angle, bgedir, pointIndex, conn, diagram);
                                            var bgseg = {
                                                bridges: bges, bridgeStartPoint: bgept, segmentIndex: segmentIndex
                                            };
                                            arcs.target = connector1.id;
                                            var stPoints = [];
                                            var edPoints = [];
                                            stPoints.push(stBridge);
                                            edPoints.push(enBridge);
                                            lastBridge[segmentIndex] = bgseg;
                                            lastBridge[segmentIndex].bridges.push(arcs);
                                            lastBridge[segmentIndex].bridgeStartPoint = stPoints;
                                            lastBridge[segmentIndex].segmentIndex = segmentIndex;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (lastBridge.length !== 0) {
                this.firstBridge(lastBridge, conn, bridgeSpacing);
            }
        }
    };
    /**
     * @param {BridgeSegment[]}bridgeList - provide the bridgeList  value.
     * @param {Connector}connector - provide the connector  value.
     * @param {number}bridgeSpacing - provide the bridgeSpacing  value.
     * @private
     */
    ConnectorBridging.prototype.firstBridge = function (bridgeList, connector, bridgeSpacing) {
        for (var i = 0; i < bridgeList.length; i++) {
            var bridge = bridgeList[i];
            for (var k = 1; k < bridge.bridges.length; k++) {
                if (Point.findLength(bridge.bridges[k].endPoint, bridge.bridges[k - 1].endPoint) < bridgeSpacing) {
                    bridge.bridges[k - 1].endPoint = bridge.bridges[k].endPoint;
                    var subBridge = bridge.bridges[k - 1];
                    var arc = this.createBridgeSegment(subBridge.startPoint, subBridge.endPoint, subBridge.angle, bridgeSpacing, subBridge.sweep);
                    bridge.bridges[k - 1].path = arc;
                    bridge.bridges.splice(k, 1);
                    bridge.bridgeStartPoint.splice(k, 1);
                    k--;
                }
            }
            var pre = connector.sourcePoint;
            for (var j = 0; j < bridge.bridges.length; j++) {
                var subBridge = bridge.bridges[j]; //const preventChecking: boolean = true;
                pre = subBridge.endPoint;
                connector.bridges.push(subBridge);
            }
        }
    };
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
    ConnectorBridging.prototype.createSegment = function (st, end, angle, direction, index, conn, diagram) {
        //let arc: string;
        //let sweep: number;
        var path = {
            angle: 0, endPoint: { x: 0, y: 0 }, target: '', path: '',
            segmentPointIndex: -1, startPoint: { x: 0, y: 0 }, sweep: 1, rendered: false
        };
        var sweep = this.sweepDirection(angle, direction, conn, diagram);
        var arc = this.createBridgeSegment(st, end, angle, conn.bridgeSpace, sweep);
        path.path = arc;
        path.startPoint = st;
        path.endPoint = end;
        path.angle = angle;
        path.segmentPointIndex = index;
        path.sweep = sweep;
        return path;
    };
    /**
     * @param {PointModel}startPt- provide the startPt  value.
     * @param {PointModel}endPt- provide the endPt  value.
     * @param {number}angle- provide the angle  value.
     * @param {number}bridgeSpace- provide the bridgeSpace  value.
     * @param {number}sweep- provide the sweep  value.
     * @private
     */
    ConnectorBridging.prototype.createBridgeSegment = function (startPt, endPt, angle, bridgeSpace, sweep) {
        var path = 'A ' + bridgeSpace / 2 + ' ' + bridgeSpace / 2 + ' ' + angle + ' , 1 ' + sweep + ' ' + endPt.x + ',' + endPt.y;
        return path;
    };
    /**
     * @param {number}angle- provide the source value.
     * @param {BridgeDirection}bridgeDirection- provide the source value.
     * @param {Connector}connector- provide the source value.
     * @param {Diagram}diagram- provide the source value.
     * @private
     */
    ConnectorBridging.prototype.sweepDirection = function (angle, bridgeDirection, connector, diagram) {
        var angle1 = Math.abs(angle);
        var sweep;
        switch (bridgeDirection) {
            case 'Top':
            case 'Bottom':
                sweep = 1;
                if (angle1 >= 0 && angle1 <= 90) {
                    sweep = 0;
                }
                break;
            case 'Left':
            case 'Right':
                sweep = 1;
                if (angle < 0 && angle >= -180) {
                    sweep = 0;
                }
                break;
        }
        if (bridgeDirection === 'Right' || bridgeDirection === 'Bottom') {
            if (sweep === 0) {
                sweep = 1;
            }
            else {
                sweep = 0;
            }
        }
        return sweep;
    };
    /** @private */
    ConnectorBridging.prototype.getPointAtLength = function (length, pts) {
        var run = 0;
        var pre;
        var found = { x: 0, y: 0 };
        for (var i = 0; i < pts.length; i++) {
            var pt = pts[i];
            if (!pre) {
                pre = pt;
                continue;
            }
            else {
                var l = this.lengthCalculation(pre, pt);
                if (run + l > length) {
                    var r = length - run;
                    var deg = Point.findAngle(pre, pt);
                    var x = r * Math.cos(deg * Math.PI / 180);
                    var y = r * Math.sin(deg * Math.PI / 180);
                    found = { x: pre.x + x, y: pre.y + y };
                    break;
                }
                else {
                    run += l;
                }
            }
            pre = pt;
        }
        return found;
    };
    /**
     * @param {PointModel[]}connector- provide the source value.
     * @private
     */
    ConnectorBridging.prototype.getPoints = function (connector) {
        var points = [];
        if (connector.intermediatePoints && (connector.type === 'Straight' || connector.type === 'Orthogonal')) {
            for (var j = 0; j < connector.intermediatePoints.length; j++) {
                points.push(connector.intermediatePoints[j]);
            }
        }
        return points;
    };
    ConnectorBridging.prototype.intersectsRect = function (rect1, rect2) {
        return ((((rect2.x < (rect1.x + rect1.width)) && (rect1.x < (rect2.x + rect2.width)))
            && (rect2.y < (rect1.y + rect1.height))) && (rect1.y < (rect2.y + rect2.height)));
    };
    /**
     * @param {PointModel[]}points1- provide the source value.
     * @param {PointModel[]}points2- provide the source value.
     * @param {boolean}self- provide the source value.
     * @param {BridgeDirection}bridgeDirection- provide the source value.
     * @param {PointModel[]}zOrder- provide the source value.
     * @private
     */
    ConnectorBridging.prototype.intersect = function (points1, points2, self, bridgeDirection, zOrder) {
        if (self && points2.length >= 2) {
            points2.splice(0, 1);
            points2.splice(0, 1);
        }
        var points = [];
        for (var i = 0; i < points1.length - 1; i++) {
            var pt = this.inter1(points1[i], points1[i + 1], points2, zOrder, bridgeDirection);
            if (pt.length > 0) {
                for (var k = 0; k < pt.length; k++) {
                    points.push(pt[k]);
                }
            }
            if (self && points2.length >= 1) {
                points2.splice(0, 1);
            }
        }
        return points;
    };
    /**
     * @param {PointModel}startPt- provide the target  value.
     * @param {PointModel}endPt- provide the target  value.
     * @param {PointModel[]}pts- provide the target  value.
     * @param {boolean}zOrder- provide the target  value.
     * @param {BridgeDirection}bridgeDirection- provide the target  value.
     * @private
     */
    ConnectorBridging.prototype.inter1 = function (startPt, endPt, pts, zOrder, bridgeDirection) {
        var points1 = [];
        for (var i = 0; i < pts.length - 1; i++) {
            var point = intersect2(startPt, endPt, pts[i], pts[i + 1]);
            if (!this.isEmptyPoint(point)) {
                var angle = this.angleCalculation(startPt, endPt);
                var angle1 = this.angleCalculation(pts[i], pts[i + 1]);
                angle = this.checkForHorizontalLine(angle);
                angle1 = this.checkForHorizontalLine(angle1);
                switch (bridgeDirection) {
                    case 'Left':
                    case 'Right':
                        if (angle > angle1) {
                            points1.push(point);
                        }
                        break;
                    case 'Top':
                    case 'Bottom':
                        if (angle < angle1) {
                            points1.push(point);
                        }
                        break;
                }
                if (angle === angle1 && zOrder) {
                    points1.push(point);
                }
            }
        }
        return points1;
    };
    ConnectorBridging.prototype.checkForHorizontalLine = function (angle) {
        var temp = 0;
        var roundedAngle = Math.abs(angle);
        if (roundedAngle > 90) {
            temp = 180 - roundedAngle;
        }
        else {
            temp = roundedAngle;
        }
        return temp;
    };
    ConnectorBridging.prototype.isEmptyPoint = function (point) {
        return point.x === 0 && point.y === 0;
    };
    ConnectorBridging.prototype.getLengthAtFractionPoint = function (connector, pointAt) {
        var confirm = 100;
        var pointIndex = -1;
        var fullLength = 0;
        var segmentIndex = -1;
        var count = 0;
        var lengthAtFractionPt = 0;
        var pt1 = connector.sourcePoint;
        var previouspt2 = pt1;
        var points = [];
        for (var i = 0; i < connector.intermediatePoints.length; i++) {
            var point2 = connector.intermediatePoints[i];
            points.push(point2);
        }
        for (var j = 0; j < points.length; j++) {
            var pt2 = points[j];
            var suspect = this.getSlope(pt2, pt1, pointAt, connector);
            if (suspect < confirm) {
                confirm = suspect;
                lengthAtFractionPt = fullLength + this.lengthCalculation(pointAt, previouspt2);
                segmentIndex = count;
                pointIndex = j;
            }
            fullLength += Point.findLength(pt2, pt1);
            pt1 = pt2;
            previouspt2 = pt2;
        }
        count++;
        var lengthFraction = {
            lengthFractionIndex: lengthAtFractionPt, fullLength: fullLength,
            segmentIndex: segmentIndex, pointIndex: pointIndex
        };
        return lengthFraction;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ConnectorBridging.prototype.getSlope = function (startPt, endPt, point, connector) {
        var three = 3.0;
        var delX = Math.abs(startPt.x - endPt.x);
        var delY = Math.abs(startPt.y - endPt.y);
        var lhs = ((point.y - startPt.y) / (endPt.y - startPt.y));
        var rhs = ((point.x - startPt.x) / (endPt.x - startPt.x));
        if (!isFinite(lhs) || !isFinite(rhs) || isNaN(lhs) || isNaN(rhs)) {
            if (startPt.x === endPt.x) {
                if (startPt.y === endPt.y) {
                    return 10000;
                }
                else if (((startPt.y > point.y) && (point.y > endPt.y)) || ((startPt.y < point.y) && (point.y < endPt.y))) {
                    return Math.abs(startPt.x - point.x);
                }
            }
            else if (startPt.y === endPt.y) {
                if (((startPt.x > point.x) && (point.x > endPt.x)) || ((startPt.x < point.x) && (point.x < endPt.x))) {
                    return Math.abs(startPt.y - point.y);
                }
            }
        }
        else {
            if ((startPt.x >= point.x && point.x >= endPt.x) || (startPt.x <= point.x && point.x <= endPt.x) || delX < three) {
                if ((startPt.y >= point.y && point.y >= endPt.y) || (startPt.y <= point.y && point.y <= endPt.y) || delY < three) {
                    return Math.abs(lhs - rhs);
                }
            }
        }
        return 10000;
    };
    /**
     * @param {PointModel}startPt- provide the target  value.
     * @param {PointModel}endPt- provide the target  value.
     * @private
     */
    ConnectorBridging.prototype.angleCalculation = function (startPt, endPt) {
        var xDiff = startPt.x - endPt.x;
        var yDiff = startPt.y - endPt.y;
        return Math.atan2(yDiff, xDiff) * (180 / Math.PI);
    };
    ConnectorBridging.prototype.lengthCalculation = function (startPt, endPt) {
        //removed a try catch from here
        var len = Math.sqrt(((startPt.x - endPt.x) * (startPt.x - endPt.x)) + ((startPt.y - endPt.y) * (startPt.y - endPt.y)));
        return len;
    };
    /**
     *To destroy the ruler
     *
     * @returns {void} To destroy the ruler
     */
    ConnectorBridging.prototype.destroy = function () {
        /**
         * Destroys the bridging module
         */
    };
    /**
     * Core method to return the component name.
     *
     * @returns {string}  Core method to return the component name.
     * @private
     */
    ConnectorBridging.prototype.getModuleName = function () {
        /**
         * Returns the module name
         */
        return 'Bridging';
    };
    return ConnectorBridging;
}());
export { ConnectorBridging };
