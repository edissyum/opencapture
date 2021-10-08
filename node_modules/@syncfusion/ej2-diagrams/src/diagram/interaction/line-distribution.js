import { OrthogonalSegment } from '../objects/connector';
import { Rect } from '../primitives/rect';
import { findDistance, findPort, getConnectorDirection, intersect2 } from '../utility/diagram-util';
import { randomId } from '../utility/base-util';
import { Point } from '../primitives/point';
import { PointPort } from '../objects/port';
/**
 * Line Distribution
 * @private
 */
var LineDistribution = /** @class */ (function () {
    /**
     * Constructor for the line distribution module
     * @private
     */
    function LineDistribution() {
        //constructs the line distribution module
    }
    /**
     * To destroy the line distribution module
     * @returns {void}
     * @private
     */
    LineDistribution.prototype.destroy = function () {
        /**
         * Destroys the line distribution module
         */
    };
    /**
     * Core method to return the component name.
     *
     * @returns {string}  Core method to return the component name.
     * @private
     */
    LineDistribution.prototype.getModuleName = function () {
        /**
         * Returns the module name
         */
        return 'LineDistribution';
    };
    /** @private */
    LineDistribution.prototype.initLineDistribution = function (graph, diagram) {
        var srcDirection = 'Bottom';
        this.diagram = diagram;
        if (diagram.layout.connectionPointOrigin === 'DifferentPoint' || diagram.layout.enableRouting) {
            var tarDirection = 'Top';
            if (graph.orientation === 'BottomToTop') {
                srcDirection = 'Top';
                tarDirection = 'Bottom';
            }
            else if (graph.orientation === 'RightToLeft') {
                srcDirection = 'Left';
                tarDirection = 'Right';
            }
            else if (graph.orientation === 'LeftToRight') {
                srcDirection = 'Right';
                tarDirection = 'Left';
            }
            var graphnodes = diagram.nodes;
            if (graphnodes.length > 0) {
                for (var i = 0; i < graphnodes.length; i++) {
                    var node = diagram.nameTable[graphnodes[i].id];
                    this.addDynamicPortandDistrrbuteLine(graph, node, srcDirection, tarDirection, diagram);
                }
            }
        }
    };
    LineDistribution.prototype.ObstacleSegment = function (options) {
        options.direction = getConnectorDirection(options.startpt, options.endpt);
        options.distance = Point.findLength(options.startpt, options.endpt);
        options.orientation = options.direction === 'Left' || options.direction === 'Right' ? 'horizontal' : 'vertical';
        // eslint-disable-next-line no-self-assign
        options.id = options.id;
        if (options.orientation === 'horizontal') {
            options.coord = options.startpt.y;
            if (options.direction === 'Left') {
                options.start = options.endpt.x;
                options.end = options.startpt.x;
            }
            else {
                options.start = options.startpt.x;
                options.end = options.endpt.x;
            }
        }
        else {
            options.coord = options.startpt.x;
            if (options.direction === 'Top') {
                options.start = options.endpt.y;
                options.end = options.startpt.y;
            }
            else {
                options.start = options.startpt.y;
                options.end = options.endpt.y;
            }
        }
        return options;
    };
    /** @private */
    LineDistribution.prototype.distributeLines = function (layout, diagram) {
        var isHorizontal = layout.orientation === 'LeftToRight'
            || layout.orientation === 'RightToLeft';
        var inversespacing = !isHorizontal ? layout.verticalSpacing : layout.horizontalSpacing;
        var srcdecoratorSize = 8.0;
        var obstacleCollection = 'obstaclePointCollection';
        var tardecoratorSize = 10.0;
        var avaibaleSpace = inversespacing - srcdecoratorSize - tardecoratorSize;
        var graph = [];
        var connectorObstacles = [];
        var globalConnectors = diagram.connectors;
        for (var i = 0; i < globalConnectors.length; i++) {
            var connector = globalConnectors[i];
            var pts = [];
            for (var key = 0; key < connector.segments.length; key++) {
                var seg = connector.segments[key];
                for (var k = 0; k < seg.points.length; k++) {
                    var pt = seg.points[k];
                    if (pts.length === 0 || !(Point.equals(pt, pts[pts.length - 1]))) {
                        pts.push(pt);
                    }
                }
            }
            var obssegments = [];
            for (var j = 1; j < pts.length; j++) {
                var obstacle = this.ObstacleSegment({ startpt: pts[j - 1], endpt: pts[j], id: connector.id });
                obssegments.push(obstacle);
            }
            var connectorObstacle = { wrapper: connector, segments: obssegments };
            var segments = [];
            if (!isHorizontal) {
                for (var key = 0; key < connectorObstacle.segments.length; key++) {
                    var obstacle = connectorObstacle.segments[key];
                    if (obstacle.orientation === 'horizontal') {
                        segments.push(obstacle);
                    }
                }
            }
            else {
                for (var key = 0; key < connectorObstacle.segments.length; key++) {
                    var obstacle = connectorObstacle.segments[key];
                    if (obstacle.orientation === 'vertical') {
                        segments.push(obstacle);
                    }
                }
            }
            for (var j = 0; j < segments.length; j++) {
                var obstacleSegment = segments[j];
                if (!this.containsValue(graph, obstacleSegment.coord)) {
                    graph.push({ key: obstacleSegment.coord, value: [] });
                }
                var index = void 0;
                for (var k = 0; k < graph.length; k++) {
                    var key = graph[k].key;
                    if (Number(key) === obstacleSegment.coord) {
                        index = k;
                        break;
                    }
                }
                graph[index].value.push(obstacleSegment);
            }
            connectorObstacles.push(connectorObstacle);
        }
        var modifiedgrap = [];
        for (var m = 0; m < graph.length; m++) {
            var row = graph[m];
            var sortedrow = row.value;
            sortedrow.sort();
            var groupby = void 0;
            groupby = [];
            var index = 0;
            var maxEnd = Number.MIN_VALUE;
            groupby.push([]);
            for (var n = 0; n < sortedrow.length; n++) {
                var obstacleSegment = sortedrow[n];
                if (!(groupby[index].length > 0) || maxEnd >= obstacleSegment.start) {
                    groupby[index].push(obstacleSegment);
                    maxEnd = Math.max(maxEnd, groupby[index][groupby[index].length - 1].end);
                }
                else {
                    index++;
                    groupby.push([]);
                    groupby[index].push(obstacleSegment);
                    maxEnd = groupby[index][groupby[index].length - 1].end;
                }
            }
            for (var n = 0; n < groupby.length; n++) {
                var group = groupby[n];
                var sortedGroup = [];
                for (var j = 0; j < group.length; j++) {
                    var e = group[j];
                    if (e.start) {
                        sortedGroup.push(e);
                    }
                }
                var comparingDir = isHorizontal ? 'Bottom' : 'Right';
                var directed = [];
                for (var j = 0; j < sortedGroup.length; j++) {
                    var e = sortedGroup[j];
                    if (e.direction === comparingDir) {
                        directed.push(e);
                    }
                }
                var reversedirected = [];
                for (var j = 0; j < sortedGroup.length; j++) {
                    var e = sortedGroup[j];
                    if (e.direction !== comparingDir) {
                        reversedirected.push(e);
                    }
                }
                var mutual = [];
                if (directed.length > 0) {
                    var temp = directed[0].start;
                    var j = 0;
                    while (j < reversedirected.length) {
                        if (reversedirected[j].end > temp) {
                            mutual.push(reversedirected[j]);
                            reversedirected.splice(j, 1);
                        }
                        else {
                            j++;
                        }
                    }
                }
                var mutualRow = [];
                mutualRow = this.updateSegmentRow(mutual, mutualRow);
                var directedRow = [];
                directedRow = [];
                directedRow = this.updateSegmentRow(reversedirected, directedRow);
                directed.reverse();
                directedRow = this.updateSegmentRow(directed, directedRow);
                if (!(mutualRow[mutualRow.length - 1].length > 0)) {
                    mutualRow.splice(mutualRow.length - 1, 1);
                }
                if (!(directedRow[directedRow.length - 1].length > 0)) {
                    directedRow.splice(directedRow.length - 1, 1);
                }
                var subrow = [];
                var descAdding = mutual.length > 0 && (sortedGroup[0].direction === mutual[0].direction
                    || sortedGroup[sortedGroup.length - 1].direction === mutual[mutual.length - 1].direction);
                if (descAdding) {
                    subrow = directedRow;
                    for (var p = 0; p < mutualRow.length; p++) {
                        var obj = mutualRow[p];
                        subrow[subrow.length] = obj;
                    }
                }
                else {
                    subrow = mutualRow;
                    for (var p = 0; p < directedRow.length; p++) {
                        var obj = directedRow[p];
                        subrow[subrow.length] = obj;
                    }
                }
                if (subrow.length > 1) {
                    var directionModifier = 1;
                    if (layout.orientation === 'BottomToTop'
                        || layout.orientation === 'RightToLeft') {
                        directionModifier = -1;
                    }
                    var startCoord = row.key - (directionModifier * avaibaleSpace / 2.0);
                    var diff = avaibaleSpace / subrow.length;
                    for (var i = 0; i < subrow.length; i++) {
                        var newcoord = startCoord + (i * diff * directionModifier);
                        for (var p = 0; p < subrow[i].length; p++) {
                            var obstacleSegment = subrow[i][p];
                            obstacleSegment.coord = newcoord;
                            if (!this.containsValue(modifiedgrap, obstacleSegment.coord)) {
                                modifiedgrap.push({ key: obstacleSegment.coord, value: [] });
                            }
                            var index_1 = void 0;
                            for (var k = 0; k < modifiedgrap.length; k++) {
                                var keyCheck = modifiedgrap[k].key;
                                if (keyCheck === obstacleSegment.coord) {
                                    index_1 = k;
                                    break;
                                }
                            }
                            modifiedgrap[index_1].value.push(obstacleSegment);
                        }
                    }
                }
            }
        }
        for (var m = 0; m < connectorObstacles.length; m++) {
            var connectorObstacle = connectorObstacles[m];
            var pts = [];
            for (var i = 0; i < connectorObstacle.segments.length; i++) {
                if (i === 0) {
                    pts.push(this.getObstacleStartPoint(connectorObstacle.segments[i]));
                }
                else if (isHorizontal) {
                    if (connectorObstacle.segments[i].orientation === 'vertical') {
                        pts[pts.length - 1] = this.getObstacleStartPoint(connectorObstacle.segments[i]);
                    }
                }
                else if (!isHorizontal) {
                    if (connectorObstacle.segments[i].orientation === 'horizontal') {
                        pts[pts.length - 1] = this.getObstacleStartPoint(connectorObstacle.segments[i]);
                    }
                }
                pts.push(this.getObstacleEndPoint(connectorObstacle.segments[i]));
            }
            /* tslint:disable */
            connectorObstacle.wrapper[obstacleCollection] = [];
            for (var j = 0; j < pts.length; j++) {
                var point = pts[j];
                if (j === 0 || (j > 0 && !(Point.equals(point, pts[j - 1])))) {
                    connectorObstacle.wrapper[obstacleCollection].push(this.getPointvalue(point.x, point.y));
                }
            }
            /* tslint:enable */
            this.resetConnectorPoints(connectorObstacle.wrapper, diagram);
        }
    };
    LineDistribution.prototype.inflate = function (rect, x, y) {
        rect.x -= x;
        rect.y -= y;
        rect.width += 2 * x;
        rect.height += 2 * y;
        return rect;
    };
    LineDistribution.prototype.updateConnectorPoints = function (connectorPoints, startSegmentSize, intermediatePoint, bounds, orientation) {
        var layoutBounds = bounds;
        var isHorizontal = orientation === 'LeftToRight' || orientation === 'RightToLeft';
        var pts = connectorPoints;
        if (pts.length > 2) {
            var newPt = Point.transform(pts[0], Point.findAngle(pts[0], pts[1]), startSegmentSize);
            var nextPt = Point.transform(newPt, Point.findAngle(pts[1], pts[2]), Point.findLength(pts[1], pts[2]));
            pts.splice(1, 2, newPt, nextPt);
            if (intermediatePoint != null) {
                var index = 2;
                var ptsCount = pts.length;
                var newPt1 = Point.transform(pts[ptsCount - 1], Point.findAngle(pts[ptsCount - 1], pts[ptsCount - 2]), startSegmentSize);
                pts.splice(ptsCount - 1, 0, newPt1);
                while (index < (pts.length - 2)) {
                    pts.splice(index, 1);
                }
                var edgePt = intermediatePoint;
                this.inflate(layoutBounds, layoutBounds.width, layoutBounds.height);
                var line1 = [];
                line1[0] = this.getPointvalue(edgePt.x, layoutBounds.y);
                line1[1] = this.getPointvalue(edgePt.x, layoutBounds.y + layoutBounds.height);
                var line2 = [];
                line2[0] = this.getPointvalue(layoutBounds.x, pts[1].y);
                line2[1] = this.getPointvalue(layoutBounds.x + layoutBounds.width, pts[1].y);
                var line3 = [];
                line3[0] = this.getPointvalue(layoutBounds.x, newPt1.y);
                line3[1] = this.getPointvalue(layoutBounds.x + layoutBounds.width, newPt1.y);
                if (isHorizontal) {
                    line1[0] = this.getPointvalue(layoutBounds.x, edgePt.y);
                    line1[1] = this.getPointvalue(layoutBounds.x + layoutBounds.width, edgePt.y);
                    line2[0] = this.getPointvalue(pts[1].x, layoutBounds.y);
                    line2[1] = this.getPointvalue(pts[1].x, layoutBounds.y + layoutBounds.height);
                    line3[0] = this.getPointvalue(newPt1.x, layoutBounds.y);
                    line2[1] = this.getPointvalue(newPt1.x, layoutBounds.y + layoutBounds.height);
                }
                var intercepts1 = [intersect2(line1[0], line1[1], line2[0], line2[1])];
                var intercepts2 = [intersect2(line1[0], line1[1], line3[0], line3[1])];
                if (intercepts2.length > 0) {
                    pts.splice(2, 0, intercepts2[0]);
                }
                if (intercepts1.length > 0) {
                    pts.splice(2, 0, intercepts1[0]);
                }
            }
        }
        var i = 1;
        while (i < pts.length - 1) {
            if (Point.equals(pts[i - 1], pts[i])) {
                pts.splice(i, 1);
            }
            else if (Point.findAngle(pts[i - 1], pts[i]) === Point.findAngle(pts[i], pts[i + 1])) {
                pts.splice(i, 1);
            }
            else {
                i++;
            }
        }
        return pts;
    };
    /* tslint:disable */
    LineDistribution.prototype.resetConnectorPoints = function (edge, diagram) {
        var obstacleCollection = 'obstaclePointCollection';
        if (edge.segments[0].points
            && edge.segments[0].points.length > 0 && edge[obstacleCollection]) {
            var connector = edge;
            connector.sourcePoint = edge[obstacleCollection][0];
            connector.targetPoint = edge[obstacleCollection][edge[obstacleCollection].length - 1];
            var segments = void 0;
            segments = [];
            for (var i = 0; i < edge[obstacleCollection].length - 1; i++) {
                var point1 = edge[obstacleCollection][i];
                var point2 = edge[obstacleCollection][i + 1];
                var length_1 = findDistance(point1, point2);
                var direction = getConnectorDirection(point1, point2);
                if (i === edge[obstacleCollection].length - 2) {
                    if ((diagram.layout.orientation === 'RightToLeft' && direction === 'Left')
                        || (diagram.layout.orientation === 'LeftToRight' && direction === 'Right')
                        || (diagram.layout.orientation === 'TopToBottom' && direction === 'Bottom')
                        || (diagram.layout.orientation === 'BottomToTop' && direction === 'Top')) {
                        length_1 = length_1 / 2;
                    }
                }
                /* tslint:enable */
                var tempSegment = new OrthogonalSegment(edge, 'segments', { type: 'Orthogonal' }, true);
                tempSegment.length = length_1;
                tempSegment.direction = direction;
                segments.push(tempSegment);
            }
            connector.segments = segments;
            connector.type = 'Orthogonal';
            diagram.connectorPropertyChange(connector, {}, {
                type: 'Orthogonal',
                segments: connector.segments
            });
        }
    };
    LineDistribution.prototype.getObstacleEndPoint = function (segment) {
        if (segment.orientation === 'horizontal') {
            if (segment.direction === 'Left') {
                return this.getPointvalue(segment.start, segment.coord);
            }
            return this.getPointvalue(segment.end, segment.coord);
        }
        if (segment.direction === 'Top') {
            return this.getPointvalue(segment.coord, segment.start);
        }
        return this.getPointvalue(segment.coord, segment.end);
    };
    LineDistribution.prototype.getObstacleStartPoint = function (segment) {
        if (segment.orientation === 'horizontal') {
            if (segment.direction === 'Left') {
                return this.getPointvalue(segment.end, segment.coord);
            }
            return this.getPointvalue(segment.start, segment.coord);
        }
        if (segment.direction === 'Top') {
            return this.getPointvalue(segment.coord, segment.end);
        }
        return this.getPointvalue(segment.coord, segment.start);
    };
    LineDistribution.prototype.updateSegmentRow = function (obstacleSegments, segmentRow) {
        var k = 0;
        if (!(segmentRow.length > 0)) {
            segmentRow[0] = [];
        }
        for (var i = 0; i < obstacleSegments.length; i++) {
            var obstacleSegment = obstacleSegments[i];
            while (k < segmentRow.length) {
                if (k === segmentRow.length - 1) {
                    segmentRow[k + 1] = [];
                }
                if (!(segmentRow[k].length > 0)
                    || segmentRow[k][segmentRow[k].length - 1].end < obstacleSegment.start) {
                    segmentRow[k].push(obstacleSegment);
                    break;
                }
                k++;
            }
        }
        return segmentRow;
    };
    LineDistribution.prototype.portOffsetCalculation = function (port, length, direction, i) {
        if (direction === 'Top') {
            port.offset = { x: (i + 1) * (1.0 / (length + 1)), y: 0 };
        }
        if (direction === 'Bottom') {
            port.offset = { x: (i + 1) * (1.0 / (length + 1)), y: 1 };
        }
        if (direction === 'Left') {
            port.offset = { x: 0, y: (i + 1) * (1.0 / (length + 1)) };
        }
        if (direction === 'Right') {
            port.offset = { x: 1, y: (i + 1) * (1.0 / (length + 1)) };
        }
    };
    LineDistribution.prototype.addDynamicPortandDistrrbuteLine = function (layout, node, sourceDirection, targetDirection, diagram) {
        if ((node.ports && node.ports.length > 0)) {
            var port = node.ports;
            diagram.removePorts(node, port);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        var existingPorts = node.ports;
        var outConnectors = node.outEdges;
        var inConnectors = node.inEdges;
        this.initPort(outConnectors, diagram, node, sourceDirection, false);
        this.initPort(inConnectors, diagram, node, targetDirection, true);
    };
    /* tslint:disable */
    LineDistribution.prototype.initPort = function (connectors, diagram, node, targetDirection, inConnectors) {
        var obstacleCollection = 'obstaclePointCollection';
        for (var i = 0; i <= connectors.length - 1; i++) {
            var internalConnector = diagram.nameTable[connectors[i]];
            internalConnector[obstacleCollection] = [];
            var newPort = findPort(node, inConnectors ? internalConnector.targetPortID : internalConnector.sourcePortID);
            var direction = targetDirection;
            if (newPort === undefined) {
                newPort = new PointPort(node, 'ports', '', true);
                newPort.id = randomId() + '_LineDistribution';
                if (inConnectors) {
                    internalConnector.targetPortID = newPort.id;
                }
                else {
                    internalConnector.sourcePortID = newPort.id;
                }
            }
            this.portOffsetCalculation(newPort, connectors.length, direction, i);
            node.ports.push(newPort);
            var portWrapper = node.initPortWrapper(node.ports[node.ports.length - 1]);
            node.wrapper.children.push(portWrapper);
            diagram.connectorPropertyChange(internalConnector, inConnectors ? { targetPortID: '' } : { sourcePortID: '' }, 
            // eslint-disable-next-line
            inConnectors ? { targetPortID: newPort.id } : { sourcePortID: newPort.id });
        }
    };
    /* tslint:enable */
    LineDistribution.prototype.shiftMatrixCells = function (value, startingCell, shiftChildren, parentCell, matrixModel) {
        if (!(value === 0)) {
            var matrix = matrixModel.matrix;
            var matrixRow = matrix[startingCell.level].value;
            var index = matrixRow.indexOf(startingCell);
            for (var i = index; i < matrixRow.length; i++) {
                matrixRow[i].offset += value;
            }
            if (shiftChildren) {
                if (startingCell.visitedChildren.length > 0) {
                    this.shiftMatrixCells(value, startingCell.visitedChildren[0], true, startingCell, matrixModel);
                }
                else {
                    var i = 1;
                    var nextSibilingwithChild = null;
                    while (index + i < matrixRow.length) {
                        var nextCell = matrixRow[index + i];
                        if (parentCell != null && this.containsValue(nextCell.visitedParents, parentCell)) {
                            if (nextCell.visitedChildren.length > 0) {
                                nextSibilingwithChild = nextCell;
                            }
                            else {
                                i++;
                                continue;
                            }
                        }
                        break;
                    }
                    if (nextSibilingwithChild != null) {
                        this.shiftMatrixCells(value, nextSibilingwithChild.visitedChildren[0], true, nextSibilingwithChild, matrixModel);
                    }
                }
            }
        }
    };
    LineDistribution.prototype.arrangeMatrix = function (cell, parent, matrixModel) {
        var layoutSettings = matrixModel.model.layout;
        var isHorizontal = layoutSettings.orientation === 'LeftToRight'
            || layoutSettings.orientation === 'RightToLeft';
        var spacing = isHorizontal ? layoutSettings.verticalSpacing : layoutSettings.horizontalSpacing;
        var matrix = matrixModel.matrix;
        var matrixRow = matrix[cell.level].value;
        var matrixIndex = matrixRow.indexOf(cell);
        if (cell.visitedParents.length > 0) {
            if (cell.visitedParents.length === 1) {
                cell.initialOffset = cell.offset;
            }
            if (matrixIndex + 1 < matrixRow.length) {
                var nextCell = matrixRow[matrixIndex + 1];
                if (nextCell.visitedParents.length > 0) {
                    if (!this.containsValue(cell.visitedParents, parent)) {
                        cell.visitedParents.push(parent);
                        parent.ignoredChildren.push(cell);
                        return;
                    }
                }
            }
        }
        if (!(cell.children.length > 0)) {
            var validOffset = cell.offset;
            if (matrixIndex > 0) {
                var prevCell = matrixRow[matrixIndex - 1];
                validOffset = prevCell.offset + (prevCell.size / 2) + spacing + (cell.size / 2);
            }
            this.shiftMatrixCells(validOffset - cell.offset, cell, false, null, matrixModel);
        }
        else {
            for (var i = 0; i < cell.children.length; i++) {
                var matrixCellChild = cell.children[i];
                if (!this.containsValue(cell.visitedChildren, matrixCellChild)) {
                    this.arrangeMatrix(matrixCellChild, cell, matrixModel);
                    cell.visitedChildren.push(matrixCellChild);
                }
            }
            if (cell.visitedChildren.length > 0) {
                var children = cell.visitedChildren.slice();
                for (var i = 0; i < cell.ignoredChildren.length; i++) {
                    //let cellIgnoredChild: MatrixCellGroupObject = cell.ignoredChildren[i];
                    children.splice(0, 1);
                    cell.visitedChildren.splice(0, 1);
                }
                if (children.length > 0) {
                    var firstChild = cell.visitedChildren[0];
                    var lastChild = cell.visitedChildren[cell.visitedChildren.length - 1];
                    var x1 = firstChild.offset - (firstChild.size / 2);
                    var x2 = lastChild.offset + (lastChild.size / 2);
                    var newoffset = (x1 + x2) / 2;
                    if (newoffset < cell.offset) {
                        this.shiftMatrixCells(cell.offset - newoffset, firstChild, true, cell, matrixModel);
                    }
                    else if (newoffset > cell.offset) {
                        this.shiftMatrixCells(newoffset - cell.offset, cell, false, null, matrixModel);
                    }
                }
            }
        }
        if (!this.containsValue(cell.visitedParents, parent)) {
            cell.visitedParents.push(parent);
        }
    };
    LineDistribution.prototype.getFixedTerminalPoint = function () {
        var pt = null;
        return pt;
    };
    LineDistribution.prototype.setAbsoluteTerminalPoint = function (point, isSource, edge) {
        var absolutePoints = 'absolutePoints';
        if (isSource) {
            if (edge[absolutePoints] == null) {
                edge[absolutePoints] = [];
            }
            if (edge[absolutePoints].length === 0) {
                edge[absolutePoints].push(point);
            }
            else {
                edge[absolutePoints][0] = point;
            }
        }
        else {
            if (edge[absolutePoints] == null) {
                edge[absolutePoints] = [];
                edge[absolutePoints].push(null);
                edge[absolutePoints].push(point);
            }
            else if (edge[absolutePoints].length === 1) {
                edge[absolutePoints].push(point);
            }
            else {
                edge[absolutePoints][edge[absolutePoints].length - 1] = point;
            }
        }
    };
    LineDistribution.prototype.updateFixedTerminalPoint = function (edge, source) {
        this.setAbsoluteTerminalPoint(this.getFixedTerminalPoint(), source, edge);
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    LineDistribution.prototype.updateFixedTerminalPoints = function (connectors, diagram) {
        this.updateFixedTerminalPoint(connectors, true);
        this.updateFixedTerminalPoint(connectors, false);
    };
    LineDistribution.prototype.updatePoints = function (edge, points) {
        var absolutePoints = 'absolutePoints';
        if (edge != null) {
            var pts = [];
            pts.push(edge[absolutePoints][0]);
            for (var i = 0; i < points.length; i++) {
                if (points[i] != null) {
                    var pt = points[i];
                    pts.push(pt);
                }
            }
            var tmp = edge[absolutePoints];
            pts.push(tmp[tmp.length - 1]);
            edge[absolutePoints] = pts;
        }
    };
    LineDistribution.prototype.updateFloatingTerminalPoint = function (edge, start, end, source) {
        this.setAbsoluteTerminalPoint(this.getFloatingTerminalPoint(edge, start, end, source), source, edge);
    };
    LineDistribution.prototype.getNextPoint = function (edge, opposite, source) {
        var absolutePoints = 'absolutePoints';
        var pts = edge[absolutePoints];
        var point = null;
        if (pts != null && pts.length >= 2) {
            var count = pts.length;
            point = pts[(source) ? Math.min(1, count - 1) : Math.max(0, count - 2)];
        }
        return point;
    };
    LineDistribution.prototype.getCenterX = function (start) {
        if (start.offsetX) {
            return start.offsetX + start.width;
        }
        else {
            return start.x + start.width;
        }
    };
    LineDistribution.prototype.getCenterY = function (start) {
        if (start.offsetY) {
            return start.offsetY + start.height;
        }
        else {
            return start.y + start.height;
        }
    };
    LineDistribution.prototype.getPerimeterBounds = function (border) {
        //let newBounds: Rect;
        var newBounds = border.wrapper.outerBounds;
        return newBounds;
    };
    LineDistribution.prototype.getPerimeterFunction = function (bounds, next, orthogonal) {
        var cx = this.getCenterX(bounds);
        var cy = this.getCenterY(bounds);
        var dx = next.x - cx;
        var dy = next.y - cy;
        var alpha = Math.atan2(dy, dx);
        var point = this.getPointvalue(0, 0);
        var pi = Math.PI;
        var pi2 = Math.PI / 2;
        var beta = pi2 - alpha;
        var t = Math.atan2(bounds.height, bounds.width);
        if (alpha < -pi + t || alpha > pi - t) {
            // Left edge
            point.x = bounds.x;
            point.y = cy - bounds.width * Math.tan(alpha) / 2;
        }
        else if (alpha < -t) {
            // Top Edge
            point.y = bounds.y;
            point.x = cx - bounds.height * Math.tan(beta) / 2;
        }
        else if (alpha < t) {
            // Right Edge
            point.x = bounds.x + bounds.width;
            point.y = cy + bounds.width * Math.tan(alpha) / 2;
        }
        else {
            // Bottom Edge
            point.y = bounds.y + bounds.height;
            point.x = cx + bounds.height * Math.tan(beta) / 2;
        }
        if (orthogonal) {
            if (next.x >= bounds.x &&
                next.x <= bounds.x + bounds.width) {
                point.x = next.x;
            }
            else if (next.y >= bounds.y &&
                next.y <= bounds.y + bounds.height) {
                point.y = next.y;
            }
            if (next.x < bounds.x) {
                point.x = bounds.x;
            }
            else if (next.x > bounds.x + bounds.width) {
                point.x = bounds.x + bounds.width;
            }
            if (next.y < bounds.y) {
                point.y = bounds.y;
            }
            else if (next.y > bounds.y + bounds.height) {
                point.y = bounds.y + bounds.height;
            }
        }
        return point;
    };
    LineDistribution.prototype.getPerimeterPoint = function (terminal, next, orthogonal) {
        var point = null;
        if (terminal != null) {
            if (next != null) {
                var bounds = this.getPerimeterBounds(terminal);
                if (bounds.width > 0 || bounds.height > 0) {
                    point = this.getPointvalue(next.x, next.y);
                    point = this.getPerimeterFunction(bounds, point, orthogonal);
                }
            }
        }
        return point;
    };
    LineDistribution.prototype.getFloatingTerminalPoint = function (edge, start, end, source) {
        start = start;
        var next = this.getNextPoint(edge, end, source);
        var orth = 1;
        var alpha = 0;
        var pt = this.getPerimeterPoint(start, next, alpha === 0 && orth);
        return pt;
    };
    LineDistribution.prototype.updateFloatingTerminalPoints = function (state, source, target) {
        var absolutePoints = 'absolutePoints';
        var pts = state[absolutePoints];
        var p0 = pts[0];
        var pe = pts[pts.length - 1];
        if (pe == null && target != null) {
            this.updateFloatingTerminalPoint(state, target, source, false);
        }
        if (p0 == null && source != null) {
            this.updateFloatingTerminalPoint(state, source, target, true);
        }
    };
    LineDistribution.prototype.getConnectorPoints = function (connectors, diagram) {
        var absolutePoints = 'absolutePoints';
        var geometry = 'geometry';
        this.updateFixedTerminalPoints(connectors, diagram);
        this.updatePoints(connectors, connectors[geometry].points);
        this.updateFloatingTerminalPoints(connectors, diagram.nameTable[connectors.sourceID], diagram.nameTable[connectors.targetID]);
        connectors[absolutePoints][0].y = connectors.sourcePoint.y;
        connectors[absolutePoints][connectors[absolutePoints].length - 1].y = connectors.targetPoint.y;
    };
    LineDistribution.prototype.adjustSegmentPoints = function (temppoints, points, diagram) {
        if (diagram.layout.orientation === 'TopToBottom' || diagram.layout.orientation === 'BottomToTop') {
            temppoints[0].x = points[0].x;
            temppoints[1].x = points[1].x;
            temppoints[temppoints.length - 1].x = points[points.length - 1].x;
            temppoints[temppoints.length - 2].x = points[points.length - 2].x;
            if (diagram.layout.orientation === 'TopToBottom') {
                temppoints[temppoints.length - 2].y = temppoints[temppoints.length - 1].y - diagram.layout.verticalSpacing / 2;
                temppoints[1].y = temppoints[0].y + diagram.layout.verticalSpacing / 2;
            }
            else {
                temppoints[1].y = temppoints[0].y - diagram.layout.verticalSpacing / 2;
                temppoints[temppoints.length - 2].y = temppoints[temppoints.length - 1].y + diagram.layout.verticalSpacing / 2;
            }
            temppoints[2].y = temppoints[1].y;
            temppoints[temppoints.length - 3].y = temppoints[temppoints.length - 2].y;
        }
        if (diagram.layout.orientation === 'RightToLeft' || diagram.layout.orientation === 'LeftToRight') {
            temppoints[0] = points[0];
            temppoints[1] = points[1];
            temppoints[temppoints.length - 1] = points[points.length - 1];
            temppoints[temppoints.length - 2] = points[points.length - 2];
            if (diagram.layout.orientation === 'RightToLeft') {
                temppoints[1].x = temppoints[0].x - diagram.layout.verticalSpacing / 2;
            }
            if (diagram.layout.orientation === 'LeftToRight') {
                temppoints[1].x = temppoints[0].x + diagram.layout.verticalSpacing / 2;
            }
            temppoints[2].x = temppoints[1].x;
            if (diagram.layout.orientation === 'RightToLeft') {
                temppoints[temppoints.length - 2].x = temppoints[temppoints.length - 1].x + diagram.layout.verticalSpacing / 2;
            }
            if (diagram.layout.orientation === 'LeftToRight') {
                temppoints[temppoints.length - 2].x = temppoints[temppoints.length - 1].x - diagram.layout.verticalSpacing / 2;
            }
            temppoints[temppoints.length - 3].x = temppoints[temppoints.length - 2].x;
        }
    };
    LineDistribution.prototype.updateConnectorSegmentPoints = function (temppoints, diagram) {
        if (temppoints.length > 1) {
            if ((diagram.layout.orientation === 'TopToBottom' || diagram.layout.orientation === 'BottomToTop')) {
                for (var i = 1; i < temppoints.length - 1; i = i + 2) {
                    if (temppoints[i].y !== temppoints[i + 1].y && (diagram.layout.orientation === 'TopToBottom'
                        || diagram.layout.orientation === 'BottomToTop')) {
                        temppoints[i + 1].y = temppoints[i].y;
                    }
                }
            }
            else {
                var check = false;
                for (var i = temppoints.length - 1; i > 1; i = i = i - 2) {
                    if (diagram.layout.orientation === 'RightToLeft' || diagram.layout.orientation === 'LeftToRight') {
                        if (!check) {
                            temppoints[i - 1].x = temppoints[i - 2].x;
                            check = true;
                        }
                        else {
                            temppoints[i - 2].x = temppoints[i - 1].x;
                            check = false;
                        }
                    }
                    else {
                        temppoints[i + 1].x = temppoints[i].x;
                    }
                }
            }
        }
    };
    LineDistribution.prototype.updateConnectorSegmentPoint = function (connector, diagram) {
        var absolutePoints = 'absolutePoints';
        var segments = [];
        for (var i = 0; i < connector[absolutePoints].length - 1; i++) {
            var point1 = connector[absolutePoints][i];
            var point2 = connector[absolutePoints][i + 1];
            var length_2 = findDistance(point1, point2);
            var direction = getConnectorDirection(point1, point2);
            if (i === connector[absolutePoints].length - 2) {
                if ((diagram.layout.orientation === 'TopToBottom' && direction === 'Bottom')
                    || (diagram.layout.orientation === 'RightToLeft' && direction === 'Left')
                    || (diagram.layout.orientation === 'LeftToRight' && direction === 'Right')
                    || (diagram.layout.orientation === 'BottomToTop' && direction === 'Top')) {
                    length_2 = length_2 / 2;
                }
            }
            var tempSegment = new OrthogonalSegment(connector, 'segments', { type: 'Orthogonal' }, true);
            tempSegment.length = length_2;
            tempSegment.direction = direction;
            segments.push(tempSegment);
        }
        connector.segments = segments;
        connector.type = 'Orthogonal';
        diagram.connectorPropertyChange(connector, {}, {
            type: 'Orthogonal',
            segments: connector.segments
        });
    };
    /** @private */
    LineDistribution.prototype.resetConnectorSegments = function (connector) {
        var segements = connector.segments;
        for (var i = segements.length; i > 1; i--) {
            segements.splice(i - 1, 1);
        }
    };
    /* tslint:disable */
    /** @private */
    LineDistribution.prototype.resetRoutingSegments = function (connector, diagram, points) {
        if (connector['levelSkip']) {
            var absolutePoints = 'absolutePoints';
            //let temppoints: PointModel[];
            this.getConnectorPoints(connector, diagram);
            var temppoints = connector[absolutePoints];
            this.updateConnectorSegmentPoints(temppoints, diagram);
            this.adjustSegmentPoints(temppoints, points, diagram);
            this.updateConnectorSegmentPoint(connector, diagram);
        }
    };
    /* tslint:enable */
    /** @private */
    LineDistribution.prototype.arrangeElements = function (matrixModel, layout) {
        var layoutSettings = matrixModel.model.layout;
        var isHorizontal;
        if (layout.orientation === 'LeftToRight' || layout.orientation === 'RightToLeft') {
            isHorizontal = true;
        }
        else {
            isHorizontal = false;
        }
        var spacing = isHorizontal ? layoutSettings.verticalSpacing : layoutSettings.horizontalSpacing;
        //let spacingInverse: number = !isHorizontal ? layoutSettings.verticalSpacing : layoutSettings.horizontalSpacing;
        // Need to group element before
        this.groupLayoutCells(matrixModel);
        this.createMatrixCells(matrixModel);
        for (var j = 0; j < matrixModel.matrix.length; j++) {
            var matrixKey = matrixModel.matrix[j].key;
            var matrixrow = matrixModel.matrix[matrixKey].value;
            for (var i = 1; i < matrixrow.length; i++) {
                var cell = matrixrow[i];
                var prevCell = matrixrow[i - 1];
                cell.offset += prevCell.offset + (prevCell.size / 2) + spacing + (cell.size / 2);
            }
        }
        for (var j = 0; j < matrixModel.matrix[0].value.length; j++) {
            var root = matrixModel.matrix[0].value[j];
            this.arrangeMatrix(root, null, matrixModel);
        }
        for (var k = 0; k < matrixModel.matrix.length; k++) {
            var row = matrixModel.matrix[k].value;
            for (var i = 0; i < row.length; i++) {
                var cell = row[i];
                if (cell.visitedParents.length > 1) {
                    var firstParent = cell.visitedParents[0];
                    var lastParent = cell.visitedParents[cell.visitedParents.length - 1];
                    var firstVertexParent = this.findParentVertexCellGroup(firstParent);
                    var lastVertexParent = this.findParentVertexCellGroup(lastParent);
                    if (firstParent !== firstVertexParent && firstVertexParent.offset < firstParent.offset) {
                        firstParent = firstVertexParent;
                    }
                    if (lastParent !== lastVertexParent && lastVertexParent.offset > lastParent.offset) {
                        lastParent = firstVertexParent;
                    }
                    var newoffset = (firstParent.offset + lastParent.offset) / 2;
                    var availOffsetMin = cell.initialOffset;
                    var availOffsetMax = cell.offset;
                    if (!(availOffsetMax === availOffsetMin)) {
                        if (newoffset >= availOffsetMin && newoffset <= availOffsetMax) {
                            this.translateMatrixCells(newoffset - cell.offset, cell);
                        }
                        else if (newoffset < availOffsetMin) {
                            this.translateMatrixCells(availOffsetMin - cell.offset, cell);
                        }
                    }
                }
            }
        }
        this.setXYforMatrixCell(matrixModel);
    };
    LineDistribution.prototype.findParentVertexCellGroup = function (cell) {
        if (cell.cells[0]) {
            return cell;
        }
        if (cell.parents.length > 0) {
            return this.findParentVertexCellGroup(cell.parents[0]);
        }
        return cell;
    };
    LineDistribution.prototype.setXYforMatrixCell = function (matrixModel) {
        var layoutSettings = matrixModel.model.layout;
        var isHorizontal = layoutSettings.orientation === 'LeftToRight'
            || layoutSettings.orientation === 'RightToLeft';
        var spacing = isHorizontal ? layoutSettings.verticalSpacing : layoutSettings.horizontalSpacing;
        for (var i = 0; i < matrixModel.matrix.length; i++) {
            var matrixrow1 = matrixModel.matrix[i].value;
            for (var j = 0; j < matrixrow1.length; j++) {
                var matrixCell = matrixrow1[j];
                var start = matrixCell.offset - (matrixCell.size / 2);
                for (var k = 0; k < matrixCell.cells.length; k++) {
                    var cell = matrixCell.cells[k];
                    var type = this.getType(cell.type);
                    if (type === 'internalVertex') {
                        var internalVertex = cell;
                        var width = internalVertex.cell.geometry.width;
                        var height = internalVertex.cell.geometry.height;
                        if (isHorizontal) {
                            internalVertex.cell.geometry = new Rect(matrixModel.rowOffset[matrixCell.level] - (width / 2), start, width, height);
                        }
                        else {
                            internalVertex.cell.geometry = new Rect(start, matrixModel.rowOffset[matrixCell.level] - (height / 2), width, height);
                        }
                        start += (isHorizontal ? height : width) + spacing;
                    }
                    else if (type === 'internalEdge') {
                        var internalEdges = cell;
                        var parent_1 = matrixCell.visitedParents[0];
                        var isContainSibilingVertex = false;
                        if (parent_1) {
                            for (var l = 0; l < parent_1.visitedChildren.length; l++) {
                                var children = parent_1.visitedChildren[l];
                                var cells = [];
                                for (var m = 0; m < children.cells.length; m++) {
                                    var cell_1 = children.cells[m];
                                    var type_1 = this.getType(cell_1.type);
                                    if (type_1 === 'internalVertex') {
                                        cells.push(cell_1);
                                    }
                                }
                                if (cells.length > 0) {
                                    isContainSibilingVertex = true;
                                    break;
                                }
                            }
                        }
                        // Need to updated line width
                        var lineWidth = 1;
                        var edgeSpacing = 5;
                        for (var m = 0; m < internalEdges.edges.length; m++) {
                            var internalConnector = internalEdges.edges[m];
                            var pt = this.getPointvalue(start + (lineWidth / 2.0), matrixModel.rowOffset[matrixCell.level]);
                            if (isHorizontal) {
                                pt = this.getPointvalue(matrixModel.rowOffset[matrixCell.level], start + (lineWidth / 2.0));
                            }
                            if (this.containsValue(this.getEdgeMapper(), internalConnector)) {
                                var key = void 0;
                                for (var l = 0; l < this.getEdgeMapper().length; l++) {
                                    if ((this.getEdgeMapper())[l].key === internalConnector) {
                                        key = l;
                                        break;
                                    }
                                }
                                (this.getEdgeMapper())[key].value.push(pt);
                            }
                            start += lineWidth + edgeSpacing;
                        }
                        start += spacing;
                    }
                }
            }
        }
    };
    LineDistribution.prototype.getEdgeMapper = function () {
        return this.edgeMapper;
    };
    /** @private */
    LineDistribution.prototype.setEdgeMapper = function (value) {
        this.edgeMapper.push(value);
    };
    LineDistribution.prototype.translateMatrixCells = function (value, cell) {
        if (!(value === 0)) {
            cell.offset += value;
            if (cell.visitedChildren.length > 0) {
                for (var i = 0; i < cell.visitedChildren.length; i++) {
                    var cellVisitedChild = cell.visitedChildren[i];
                    this.translateMatrixCells(value, cellVisitedChild);
                }
            }
        }
    };
    LineDistribution.prototype.groupLayoutCells = function (matrixModel) {
        var ranks = matrixModel.model.ranks;
        for (var j = ranks.length - 1; j >= 0; j--) {
            var vertices = [];
            for (var v = 0; v < ranks[j].length; v++) {
                var rank = ranks[j][v];
                var type = this.getType(rank.type);
                if (type === 'internalVertex') {
                    vertices.push(ranks[j][v]);
                }
            }
            var edges = [];
            for (var e = 0; e < ranks[j].length; e++) {
                var rank = ranks[j][e];
                var type = this.getType(rank.type);
                if (type === 'internalEdge') {
                    edges.push(rank);
                }
            }
            while (vertices.length > 1) {
                var vertex1 = vertices[0];
                var parentset1 = this.selectIds(vertex1.connectsAsTarget, true);
                var childset1 = this.selectIds(vertex1.connectsAsSource, false);
                while (vertices.length > 1) {
                    var vertex2 = vertices[1];
                    var parentset2 = this.selectIds(vertex2.connectsAsTarget, true);
                    var childset2 = this.selectIds(vertex2.connectsAsSource, false);
                    var parentequals = this.compareLists(parentset1, parentset2);
                    var childequals = this.compareLists(childset1, childset2);
                    if (parentequals && childequals) {
                        this.updateMutualSharing(vertices[0], vertex2.id);
                        this.updateMutualSharing(vertices[1], vertex1.id);
                        vertices.splice(1, 1);
                        continue;
                    }
                    break;
                }
                vertices.splice(0, 1);
            }
            while (edges.length > 1) {
                var internalEdge = edges[0];
                var parentset = internalEdge.source;
                var childset = internalEdge.target;
                if (parentset.identicalSibiling != null) {
                    var groupedges = [];
                    for (var i = 0; i < edges.length; i++) {
                        var edge = edges[i];
                        if (edge.target === childset) {
                            groupedges.push(edge);
                        }
                    }
                    for (var i = 0; i < groupedges.length; i++) {
                        var internalEdgese = groupedges[i];
                        if (this.containsValue(parentset.identicalSibiling, internalEdgese.source.id)) {
                            internalEdgese.source.identicalSibiling = null;
                        }
                    }
                    internalEdge.source.identicalSibiling = null;
                }
                edges.splice(0, 1);
            }
        }
    };
    LineDistribution.prototype.getType = function (type) {
        if (type === 'internalVertex') {
            return 'internalVertex';
        }
        else {
            return 'internalEdge';
        }
    };
    LineDistribution.prototype.selectIds = function (node, source) {
        var returnIds = [];
        for (var i = 0; i < node.length; i++) {
            var connector = node[i];
            if (source) {
                {
                    returnIds.push(connector.source.id);
                }
            }
            else {
                returnIds.push(connector.target.id);
            }
        }
        return returnIds;
    };
    LineDistribution.prototype.compareLists = function (list1, list2) {
        var newList1 = list1.slice();
        var newList2 = list2.slice();
        if (newList1.length === newList2.length) {
            if (newList1.length === 0) {
                return true;
            }
            else {
                var isSame = true;
                for (var i = 0; i < newList2.length; i++) {
                    var o = newList2[i];
                    for (var j = i; j < newList1.length; j++) {
                        if (!(newList1[j] === o)) {
                            isSame = false;
                            break;
                        }
                    }
                }
                return isSame;
            }
        }
        return false;
    };
    LineDistribution.prototype.updateMutualSharing = function (cell, id) {
        if (cell.identicalSibiling != null) {
            cell.identicalSibiling.push(id);
        }
        else {
            cell.identicalSibiling = [];
            cell.identicalSibiling.push(id);
        }
    };
    LineDistribution.prototype.matrixCellGroup = function (options) {
        options.level = options.level;
        options.parents = options.parents;
        options.children = options.children;
        options.visitedChildren = options.visitedChildren;
        options.visitedParents = options.visitedParents;
        options.ignoredChildren = options.ignoredChildren;
        options.cells = options.cells;
        options.offset = options.offset;
        options.initialOffset = options.initialOffset;
        return options;
    };
    LineDistribution.prototype.getPointvalue = function (x, y) {
        return { 'x': Number(x) || 0, 'y': Number(y) || 0 };
    };
    LineDistribution.prototype.containsValue = function (list, keyValue) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].key === keyValue || list[i] === keyValue) {
                return true;
            }
        }
        return false;
    };
    /* tslint:disable */
    LineDistribution.prototype.createMatrixCells = function (matrixModel) {
        var layoutSettings = matrixModel.model.layout;
        var isHorizontal = layoutSettings.orientation === 'LeftToRight'
            || layoutSettings.orientation === 'RightToLeft';
        var spacing = isHorizontal ? layoutSettings.verticalSpacing : layoutSettings.horizontalSpacing;
        var spacingInverse = !isHorizontal ? layoutSettings.verticalSpacing : layoutSettings.horizontalSpacing;
        var ranks = matrixModel.model.ranks;
        var matrixCellMapper = [];
        var rowoffset = -spacingInverse;
        for (var j = ranks.length - 1; j >= 0; j--) {
            var maxDimension = 0.0;
            var index = (ranks.length - 1) - j;
            var rank = ranks[j].slice(); //.ToList();
            // Creating new row and adding it to matrix
            var matrixRow = [];
            matrixModel.matrix.push({ key: index, value: matrixRow });
            // Creating new row mapper
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var tempMatrixRow = [];
            matrixCellMapper.push({ index: index, value: tempMatrixRow });
            while (rank.length > 0) //.Any())
             {
                var layoutCell = rank[0];
                // eslint-disable-next-line max-len
                var matrixCell = this.matrixCellGroup({ level: index, parents: [], children: [], visitedParents: [], visitedChildren: [], ignoredChildren: [], cells: [], size: 0, offset: 0, initialOffset: 0 });
                matrixRow.push(matrixCell);
                var type = this.getType(layoutCell.type);
                if (type === 'internalVertex') {
                    matrixCell.cells.push(layoutCell);
                    if (layoutCell.identicalSibiling != null) {
                        for (var i = 0; i < rank.length; i++) {
                            var internalVertex = rank[i];
                            var type_2 = this.getType(internalVertex.type);
                            if (type_2 === 'internalVertex' && this.containsValue(layoutCell.identicalSibiling, internalVertex.id)) {
                                matrixCell.cells.push(internalVertex);
                                if (matrixCell.cells.length > layoutCell.identicalSibiling.length) {
                                    break;
                                }
                            }
                        }
                    }
                    for (var i = 0; i < matrixCell.cells.length; i++) {
                        var internalVertex = matrixCell.cells[i];
                        var type_3 = this.getType(internalVertex.type);
                        if (type_3 === 'internalVertex') {
                            var geometry = internalVertex.cell.geometry;
                            matrixCell.size += isHorizontal ? geometry.height : geometry.width;
                            maxDimension = Math.max(maxDimension, !isHorizontal ? geometry.height : geometry.width);
                            tempMatrixRow.push({ key: internalVertex.id, value: matrixCell });
                            if (internalVertex.connectsAsTarget.length > 0) {
                                for (var k = 0; k < internalVertex.connectsAsTarget.length; k++) {
                                    var internalEdgese = internalVertex.connectsAsTarget[k];
                                    var key = null;
                                    if (this.containsValue(matrixCellMapper[index - 1].value, internalEdgese.ids)) {
                                        key = internalEdgese.ids;
                                    }
                                    else if (this.containsValue(matrixCellMapper[index - 1].value, internalEdgese.source.id)) {
                                        key = internalEdgese.source.id;
                                    }
                                    if (key != null) {
                                        var parentcellValue = matrixCellMapper[index - 1].value;
                                        var parentMartixCell = void 0;
                                        for (var v = 0; v < parentcellValue.length; v++) {
                                            if (parentcellValue[v].key === key) {
                                                parentMartixCell = parentcellValue[v].value;
                                                break;
                                            }
                                        }
                                        if (!this.containsValue(matrixCell.parents, parentMartixCell)) {
                                            matrixCell.parents.push(parentMartixCell);
                                        }
                                        if (!this.containsValue(parentMartixCell.children, matrixCell)) {
                                            parentMartixCell.children.push(matrixCell);
                                        }
                                    }
                                }
                            }
                            rank.reverse();
                            rank.pop();
                            rank.reverse();
                        }
                    }
                    matrixCell.size += (matrixCell.cells.length - 1) * spacing;
                }
                else if (type === 'internalEdge') {
                    matrixCell.cells.push(layoutCell);
                    for (var i = 0; i < matrixCell.cells.length; i++) {
                        var internalEdge = matrixCell.cells[i];
                        var type1 = this.getType(internalEdge.type);
                        if (type1 === 'internalEdge' && internalEdge.edges != null) {
                            // need to spacing based on its source and target Node
                            var edgeSpacing = 5;
                            var cellSize = -edgeSpacing;
                            for (var k = 0; k < internalEdge.edges.length; k++) {
                                //const internalConnector = internalEdge.edges[k];
                                // need to summ up the line width
                                cellSize += 1 + edgeSpacing;
                            }
                            matrixCell.size += cellSize;
                        }
                        tempMatrixRow.push({ key: internalEdge.ids, value: matrixCell });
                        var key = null;
                        if (this.containsValue(matrixCellMapper[index - 1].value, internalEdge.ids)) {
                            key = internalEdge.ids;
                        }
                        else if (this.containsValue(matrixCellMapper[index - 1].value, internalEdge.source.id)) {
                            key = internalEdge.source.id;
                        }
                        if (key != null) {
                            var parentcell = matrixCellMapper[index - 1].value;
                            var parentMartixCell = void 0;
                            for (var v = 0; v < parentcell.length; v++) {
                                if (parentcell[v].key === key) {
                                    parentMartixCell = parentcell[v].value;
                                    break;
                                }
                            }
                            if (!this.containsValue(matrixCell.parents, parentMartixCell)) {
                                matrixCell.parents.push(parentMartixCell);
                            }
                            if (!this.containsValue(parentMartixCell.children, matrixCell)) {
                                parentMartixCell.children.push(matrixCell);
                            }
                        }
                        rank.reverse();
                        rank.pop();
                        rank.reverse();
                    }
                    matrixCell.size += (matrixCell.cells.length - 1) * spacing;
                }
            }
            matrixModel.rowOffset.push(rowoffset + (maxDimension / 2) + spacingInverse);
            rowoffset += maxDimension + spacingInverse;
        }
    };
    /* eslint-disable */
    /** @private */
    LineDistribution.prototype.updateLayout = function (viewPort, modelBounds, layoutProp, layout, nodeWithMultiEdges, nameTable) {
        {
            var trnsX = ((viewPort.x - modelBounds.width) / 2) - modelBounds.x;
            var trnsY = ((viewPort.y - modelBounds.height) / 2) - modelBounds.y;
            trnsX = Math.round(trnsX);
            trnsY = Math.round(trnsY);
            var modifiedConnectors = [];
            var transModelBounds = new Rect(modelBounds.x + trnsX, modelBounds.y + trnsY, modelBounds.width, modelBounds.height);
            var margin = layoutProp.margin;
            var isHorizontal = layout.orientation === 'RightToLeft' || layout.orientation === 'LeftToRight';
            var inversespacing = !isHorizontal ? layout.verticalSpacing : layout.horizontalSpacing;
            for (var i = 0; i < nodeWithMultiEdges.length; i++) {
                var node = nodeWithMultiEdges[i];
                if (node.outEdges != null && node.outEdges.length > 0) {
                    var count = node.outEdges.length;
                    for (var j = 0; j < count; j++) {
                        var internalConnector = nameTable[node.outEdges[j]];
                        internalConnector['pointCollection'] = [];
                        if (count > 1) {
                            var segmentsize = inversespacing / 2.0;
                            var intermediatePoint = null;
                            var key = void 0;
                            var edgeMapper = this.getEdgeMapper();
                            for (var k = 0; k < edgeMapper.length; k++) {
                                if (edgeMapper[k].key === internalConnector) {
                                    key = k;
                                    break;
                                }
                            }
                            if (edgeMapper[key].value.length > 0) {
                                var edgePoint = edgeMapper[key].value[0];
                                var dxValue1 = edgePoint.x + margin.left;
                                var dyValue1 = edgePoint.y + margin.top;
                                var x1 = dxValue1;
                                var y1 = dyValue1;
                                if (layout.orientation === 'BottomToTop') {
                                    y1 = modelBounds.height - dyValue1;
                                }
                                else if (layout.orientation === 'RightToLeft') {
                                    x1 = modelBounds.width - dxValue1;
                                }
                                x1 += trnsX;
                                y1 += trnsY;
                                intermediatePoint = this.getPointvalue(x1, y1);
                            }
                            var pts = [];
                            for (var i_1 = 0; i_1 < internalConnector.segments.length; i_1++) {
                                var pt = internalConnector.segments[i_1].points;
                                // eslint-disable-next-line guard-for-in
                                for (var temp in pt) {
                                    pts.push(pt[temp]);
                                }
                            }
                            // eslint-disable-next-line max-len
                            pts = this.updateConnectorPoints(pts, segmentsize, intermediatePoint, transModelBounds, layout.orientation);
                            for (var p = 0; p < pts.length; p++) {
                                var pt = pts[p];
                                internalConnector['pointCollection'].push(this.getPointvalue(pt.x, pt.y));
                            }
                            this.resetConnectorPoints(internalConnector, this.diagram);
                        }
                        modifiedConnectors.push(internalConnector);
                    }
                }
                if (node.inEdges != null && node.inEdges.length > 1) {
                    var count = node.inEdges.length;
                    var edgeMapper = this.getEdgeMapper();
                    for (var j = 0; j < count; j++) {
                        var internalConnector = nameTable[node.inEdges[j]];
                        if (!this.containsValue(modifiedConnectors, internalConnector)) {
                            internalConnector['pointCollection'] = [];
                        }
                        if (count > 1) {
                            var segmentsize = inversespacing / 2.0;
                            var intermediatePoint = null;
                            var key = void 0;
                            var k = void 0;
                            for (k = 0; k < edgeMapper.length; k++) {
                                if (edgeMapper[k].key === internalConnector) {
                                    key = k;
                                    break;
                                }
                            }
                            if (edgeMapper[key].value.length > 0
                                && !this.containsValue(modifiedConnectors, internalConnector)) {
                                var edgePt = edgeMapper[k].value[0];
                                var dx1 = edgePt.x + margin.left;
                                var dy1 = edgePt.y + margin.top;
                                // eslint-disable-next-line one-var
                                var x1 = dx1, y1 = dy1;
                                if (layout.orientation === 'BottomToTop') {
                                    y1 = modelBounds.height - dy1;
                                }
                                else if (layout.orientation === 'RightToLeft') {
                                    x1 = modelBounds.width - dx1;
                                }
                                x1 += trnsX;
                                y1 += trnsY;
                                intermediatePoint = this.getPointvalue(x1, y1);
                            }
                            var pts = [];
                            for (var p = 0; p < internalConnector.segments.length; p++) {
                                var pt = internalConnector.segments[p].points;
                                // eslint-disable-next-line guard-for-in
                                for (var temp in pt) {
                                    pts.push(pt[temp]);
                                }
                            }
                            pts.reverse();
                            // eslint-disable-next-line
                            pts = this.updateConnectorPoints(pts, segmentsize, intermediatePoint, transModelBounds, layoutProp.orientation);
                            pts.reverse();
                            internalConnector['pointCollection'] = [];
                            for (var p = 0; p < pts.length; p++) {
                                var pt = pts[p];
                                internalConnector['pointCollection'].push(this.getPointvalue(pt.x, pt.y));
                            }
                            this.resetConnectorPoints(internalConnector, this.diagram);
                        }
                    }
                }
            }
        }
    };
    return LineDistribution;
}());
export { LineDistribution };
