import { Rect } from '../primitives/rect';
import { cloneObject } from '../utility/base-util';
var GraphForceNode = /** @class */ (function () {
    function GraphForceNode(gnNode) {
        /**
         * @private
         */
        this.velocityX = 0;
        /**
         * @private
         */
        this.velocityY = 0;
        /**
         * @private
         */
        this.nodes = [];
        this.graphNode = gnNode;
        var nNode = this.graphNode;
        var bounds = getGraphBounds(nNode);
        this.location = bounds.center;
        this.nodes = [];
        if (!gnNode.treeInfo.parents) {
            gnNode.treeInfo.parents = [];
        }
        if (!gnNode.treeInfo.children) {
            gnNode.treeInfo.children = [];
        }
        this.nodes = (gnNode.treeInfo.parents).concat(gnNode.treeInfo.children);
    }
    /**
     * applyChanges method\
     *
     * @returns {  void }    applyChanges method .\
     * @private
     */
    GraphForceNode.prototype.applyChanges = function () {
        this.graphNode.treeInfo.center = this.location;
    };
    return GraphForceNode;
}());
export { GraphForceNode };
/**
 * SymmetricalLayout
 */
var SymmetricLayout = /** @class */ (function () {
    function SymmetricLayout() {
        this.cdCOEF = 0.442;
        this.cfMAXVELOCITY = 50;
        this.cnMAXITERACTION = 1000;
        this.cnSPRINGLENGTH = 100;
        this.mszMaxForceVelocity = { width: this.cfMAXVELOCITY, height: this.cfMAXVELOCITY };
        /**
         * @private
         */
        this.springLength = 0;
        /**
         * @private
         */
        this.springFactor = this.cdCOEF;
        /**
         * @private
         */
        this.maxIteration = this.cnMAXITERACTION;
        this.springLength = this.cnSPRINGLENGTH;
    }
    /**
     *To destroy the layout
     *
     * @returns {void} To destroy the layout
     */
    SymmetricLayout.prototype.destroy = function () {
        /**
         * Destroys symmetricLayout
         */
    };
    SymmetricLayout.prototype.getModuleName = function () {
        return 'SymmetricalLayout';
    };
    SymmetricLayout.prototype.doGraphLayout = function (graphLayoutManager) {
        var graph = this.selectedNode;
        graph.treeInfo.Bounds = graphLayoutManager.getModelBounds(graphLayoutManager.nodes);
        var lstGraphNodes = graph.treeInfo.GraphNodes;
        var lstNodes = this.convertGraphNodes(lstGraphNodes);
        var count = lstNodes.length;
        count = Math.min(this.maxIteration, count * count * count);
        this.preLayoutNodes(lstNodes, graph.treeInfo.Bounds);
        for (var i = 0, nLenght = count; i < nLenght; i++) {
            this.makeSymmetricLayout(lstNodes);
            this.appendForces(lstNodes);
        }
        this.resetGraphPosition(lstNodes, graph);
    };
    SymmetricLayout.prototype.preLayoutNodes = function (lstNodes, rcBounds) {
        var fMaxSize = Math.max(rcBounds ? rcBounds.width : 25, rcBounds ? rcBounds.height : 25);
        var ptCenter = { x: fMaxSize / 2, y: fMaxSize / 2 };
        var dRotateAngle = 2 * Math.PI / lstNodes.length;
        var dAngle = dRotateAngle;
        for (var i = 0; i < lstNodes.length; i++) {
            var gnNode = lstNodes[i];
            var forceNode = this.getForceNode(gnNode);
            forceNode.location = {
                x: ptCenter.x + fMaxSize * Number((Math.cos(dAngle)).toFixed(2)),
                y: ptCenter.y + fMaxSize * Number(Math.sin(dAngle).toFixed(2))
            };
            dAngle -= dRotateAngle;
        }
    };
    /**
     * doLayout method\
     *
     * @returns {  void }    doLayout method .\
     * @param {GraphLayoutManager} graphLayoutManager - provide the angle value.
     * @private
     */
    SymmetricLayout.prototype.doLayout = function (graphLayoutManager) {
        this.selectedNode = graphLayoutManager.selectedNode;
        this.doGraphLayout(graphLayoutManager);
    };
    SymmetricLayout.prototype.makeSymmetricLayout = function (lstNodes) {
        var forceNode;
        var force;
        for (var k = 0; k < lstNodes.length; k++) {
            var gnNode = lstNodes[k];
            forceNode = this.getForceNode(gnNode);
            var nodes = forceNode.nodes;
            for (var l = 0; l < nodes.length; l++) {
                var gnChild = nodes[l];
                if (collectionContains(gnChild.id, lstNodes)) {
                    this.calcNodesForce(forceNode, this.getForceNode(gnChild));
                }
            }
            for (var i = 0, length_1 = nodes.length; i < length_1; i++) {
                if (length_1 < 2) {
                    break;
                }
                var vtx1 = this.getForceNode(nodes[i]);
                var vtx2 = (i + 1 >= length_1) ? this.getForceNode(nodes[0]) : this.getForceNode((nodes[i + 1]));
                var angle = (360 / nodes.length / 2) * Math.PI / 180;
                var normalDistance = 2 * this.springLength * Math.sin(angle);
                this.calcRelatesForce(vtx1, vtx2, normalDistance);
            }
            for (var s = 0; s < lstNodes.length; s++) {
                var gnChild = lstNodes[s];
                if (!collectionContains(gnChild.id, nodes) && gnChild.id !== gnNode.id) {
                    force = this.getForceNode(gnChild);
                    this.updateNeigbour(forceNode, force);
                }
            }
        }
    };
    SymmetricLayout.prototype.appendForces = function (lstNodes) {
        var gfnNode = null;
        for (var k = 0; k < lstNodes.length; k++) {
            var gnNode = lstNodes[k];
            gfnNode = this.getForceNode(gnNode);
            var ptPoint = gfnNode.location;
            ptPoint.x += Math.min(gfnNode.velocityX, this.mszMaxForceVelocity.width);
            ptPoint.y += Math.min(gfnNode.velocityY, this.mszMaxForceVelocity.height);
            gfnNode.velocityX = 0;
            gfnNode.velocityY = 0;
            gfnNode.location = ptPoint;
        }
    };
    SymmetricLayout.prototype.resetGraphPosition = function (lstNodes, graph) {
        var szMin = { width: Number.MAX_VALUE, height: Number.MAX_VALUE };
        var gfnNode = null;
        var gnNode;
        for (var k = 0; k < lstNodes.length; k++) {
            gnNode = lstNodes[k];
            gfnNode = this.getForceNode(gnNode);
            var ptLocation = {
                x: gfnNode.location.x - gnNode.actualSize.width / 2,
                y: gfnNode.location.y - gnNode.actualSize.height / 2
            };
            szMin.width = Math.min(szMin.width, ptLocation.x);
            szMin.height = Math.min(szMin.height, ptLocation.y);
        }
        for (var k = 0; k < lstNodes.length; k++) {
            gnNode = lstNodes[k];
            gfnNode = this.getForceNode(gnNode);
            var ptLocation = gfnNode.location;
            ptLocation.x -= szMin.width - (graph.treeInfo.location ? graph.treeInfo.location.x : 0);
            ptLocation.y -= szMin.height - (graph.treeInfo.location ? graph.treeInfo.location.y : 0);
            gfnNode.location = ptLocation;
            gfnNode.applyChanges();
        }
    };
    SymmetricLayout.prototype.convertGraphNodes = function (lstNodes) {
        var lstToReturn = [];
        var keys = Object.keys(lstNodes);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var k = keys_1[_i];
            if (lstNodes[k]) {
                var gnNode = lstNodes[k];
                var forceNode = new GraphForceNode(gnNode);
                gnNode.treeInfo.tag = forceNode;
                lstToReturn.push(gnNode);
            }
        }
        return lstToReturn;
    };
    /**
     * getForceNode method\
     *
     * @returns {  GraphForceNode }    getForceNode method .\
     * @param {IGraphObject} gnNode - provide the angle value.
     * @private
     */
    SymmetricLayout.prototype.getForceNode = function (gnNode) {
        return gnNode.treeInfo.tag;
    };
    SymmetricLayout.prototype.updateNeigbour = function (vtSource, vtTarget) {
        if (vtTarget == null || vtSource == null) {
            return;
        }
        var distance = this.pointDistance(vtSource.location, vtTarget.location);
        var angle = this.lineAngle(vtSource.location, vtTarget.location);
        var normalDistance = (this.springLength * 0.9);
        if (distance < normalDistance) {
            this.calcForce(distance, normalDistance, angle, vtTarget);
        }
    };
    SymmetricLayout.prototype.lineAngle = function (pt1, pt2) {
        var radians = 0;
        var vx = pt2.x - pt1.x;
        var vy = pt2.y - pt1.y;
        if (vx === 0) {
            if (vy <= 0) {
                radians = (3.0 * Math.PI) / 2.0;
            }
            else {
                radians = Math.PI / 2.0;
            }
        }
        else if (vy === 0) {
            if (vx < 0) {
                radians = Math.PI;
            }
            else {
                radians = 0;
            }
        }
        else {
            radians = Math.atan(vy / vx);
            if (vx < 0 && vy > 0) {
                radians = Math.PI + radians;
            }
            else if (vx < 0 && vy < 0) {
                radians = Math.PI + radians;
            }
            else if (vx > 0 && vy < 0) {
                radians = 2.0 * Math.PI + radians;
            }
        }
        return radians;
    };
    SymmetricLayout.prototype.pointDistance = function (pt1, pt2) {
        var d = 0;
        var dx = pt2.x - pt1.x;
        var dy = pt2.y - pt1.y;
        var t = (dx * dx) + (dy * dy);
        if (t > 0) {
            d = Math.sqrt(t);
        }
        return d;
    };
    SymmetricLayout.prototype.calcRelatesForce = function (vtSource, vtTarget, normalDistance) {
        var distance = this.pointDistance(vtSource.location, vtTarget.location);
        var angle = this.lineAngle(vtSource.location, vtTarget.location);
        if (distance < normalDistance) {
            this.calcForce(distance, normalDistance, angle, vtTarget);
        }
    };
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
    SymmetricLayout.prototype.updateLayout = function (nodeCollection, connectors, symmetricLayout, nameTable, layout, viewPort) {
        var layoutManager = new GraphLayoutManager();
        layoutManager.updateLayout(nodeCollection, connectors, symmetricLayout, nameTable, layout, viewPort);
    };
    SymmetricLayout.prototype.calcNodesForce = function (vtSource, vtTarget) {
        var distance = this.pointDistance(vtSource.location, vtTarget.location);
        var angle = this.lineAngle(vtSource.location, vtTarget.location);
        if (distance > this.springLength || distance < this.springLength) {
            this.calcForce(distance, this.springLength, angle, vtTarget);
        }
    };
    SymmetricLayout.prototype.calcForce = function (distance, minDist, angle, vtTarget) {
        var count = vtTarget.nodes.length;
        var length = distance - minDist;
        var factor = this.springFactor / (count * count) * Math.sqrt(count);
        if (length !== 0) {
            var fVelocity = length * factor;
            var fOffset = fVelocity;
            var offsetX = Math.cos(angle) * fOffset;
            var offsetY = Math.sin(angle) * fOffset;
            vtTarget.velocityX -= offsetX;
            vtTarget.velocityY -= offsetY;
        }
    };
    return SymmetricLayout;
}());
export { SymmetricLayout };
var GraphLayoutManager = /** @class */ (function () {
    function GraphLayoutManager() {
        this.visitedStack = [];
        this.cycleEdgesCollection = [];
        this.graphObjects = [];
        this.passedNodes = [];
    }
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
    GraphLayoutManager.prototype.updateLayout = function (nodeCollection, connectors, symmetricLayout, nameTable, layout, viewPort) {
        this.nameTable = nameTable;
        this.nodes = nodeCollection;
        this.connectors = connectors;
        var selectionList = nodeCollection;
        if (selectionList.length > 0) {
            this.mhelperSelectedNode = cloneObject(selectionList[0]);
        }
        for (var _i = 0, nodeCollection_1 = nodeCollection; _i < nodeCollection_1.length; _i++) {
            var node = nodeCollection_1[_i];
            var nodeGraphObject = node;
            nodeGraphObject.treeInfo = {};
            nodeGraphObject.treeInfo.graphType = 'Node';
            this.graphObjects.push(nodeGraphObject);
        }
        for (var _a = 0, connectors_1 = connectors; _a < connectors_1.length; _a++) {
            var connector = connectors_1[_a];
            var connectorGraphObject = connector;
            connectorGraphObject.treeInfo = {};
            connectorGraphObject.treeInfo.graphType = 'Connector';
            this.graphObjects.push(connectorGraphObject);
        }
        this.updateLayout1(this.graphObjects, symmetricLayout);
        var modelBounds = this.getModelBounds(selectionList);
        for (var i = 0; i < selectionList.length; i++) {
            var node = selectionList[i];
            var trnsX = (viewPort.x - modelBounds.width) / 2;
            var margin = layout.margin || {};
            //let marginX: number; let marginY: number;
            margin.left = margin.left || 0;
            margin.right = margin.right || 0;
            margin.top = margin.top || 0;
            margin.bottom = margin.bottom || 0;
            if (layout.margin.left) {
                margin.left = layout.margin.left;
            }
            if (layout.margin.top) {
                margin.top = layout.margin.top;
            }
            var dx = (node.treeInfo.tag.location.x - (node.offsetX - (node.actualSize.width / 2)) -
                modelBounds.x + trnsX + margin.left);
            var dy = (node.treeInfo.tag.location.y - (node.offsetY - (node.actualSize.height / 2)) - modelBounds.y + margin.top);
            node.offsetX += dx;
            node.offsetY += dy;
            delete node.treeInfo;
        }
        return true;
    };
    /**
     * getModelBounds method\
     *
     * @returns {  Rect }    getModelBounds method .\
     * @param {IGraphObject[]} lNodes - provide the angle value.
     * @private
     */
    GraphLayoutManager.prototype.getModelBounds = function (lNodes) {
        lNodes = lNodes.slice();
        var rect = null;
        var rect1 = null;
        var node;
        for (var i = 0; i < lNodes.length; i++) {
            node = lNodes[i];
            var bounds = getGraphBounds(node);
            rect = new Rect(node.treeInfo.tag ? node.treeInfo.tag.location.x : bounds.x, node.treeInfo.tag ? node.treeInfo.tag.location.y : bounds.y, node.actualSize.width, node.actualSize.height);
            if (rect1) {
                rect1 = rect1.uniteRect(rect);
            }
            else {
                rect1 = rect;
            }
        }
        return rect1;
    };
    GraphLayoutManager.prototype.updateLayout1 = function (nodesToLayout, symmetricLayout) {
        this.detectCyclesInGraph(nodesToLayout);
        var nodesCount = nodesToLayout.length;
        if (nodesCount > 0) {
            var cycleConnColln = [];
            var nodes = [];
            var nodeSymbols = [];
            for (var s = 0; s < nodesToLayout.length; s++) {
                var nd = nodesToLayout[s];
                if (nd.treeInfo.isCycleEdge === undefined) {
                    nd.treeInfo.isCycleEdge = false;
                }
                if (nd.treeInfo.graphType === 'Connector' && !nd.treeInfo.isCycleEdge) {
                    nodes.push(nd);
                }
                else if (nd.treeInfo.graphType === 'Connector') {
                    cycleConnColln.push(nd);
                }
                else {
                    nodeSymbols.push(nd);
                }
            }
            nodes = nodes.concat(nodeSymbols);
            nodes = cycleConnColln.concat(nodes);
            while (nodesCount > this.dictionaryLength(this.passedNodes)) {
                this.getNodesToPosition(nodes);
                if (this.selectedNode == null) {
                    continue;
                }
                symmetricLayout.doLayout(this);
                this.selectedNode = null;
                this.visitedStack = [];
                for (var _i = 0, _a = this.cycleEdgesCollection; _i < _a.length; _i++) {
                    var connector = _a[_i];
                    connector.treeInfo.isCycleEdge = false;
                }
            }
            this.passedNodes = null;
            this.selectedNode = null;
        }
        return false;
    };
    GraphLayoutManager.prototype.getNodesToPosition = function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (!collectionContains(node.id, this.passedNodes)) {
                if (node) {
                    this.selectNodes(node);
                }
                break;
            }
        }
    };
    GraphLayoutManager.prototype.selectNodes = function (node) {
        var nodeGraph = node;
        if (node.treeInfo.graphType === 'Connector') {
            this.exploreGraphEdge(node);
        }
        else if (nodeGraph != null) {
            if (this.addNode(node, 'passed')) {
                this.addNode(node, 'selected');
                if (this.isConnectedToAnotherNode(nodeGraph)) {
                    this.selectedNode = { treeInfo: {} };
                    this.selectedNode.treeInfo.LeftMargin = 10;
                    this.selectedNode.treeInfo.TopMargin = 10;
                    this.selectConnectedNodes(nodeGraph);
                }
                else {
                    this.selectedNode = node;
                }
            }
        }
    };
    GraphLayoutManager.prototype.selectConnectedNodes = function (nodeGraph) {
        var graph = this.selectedNode;
        if (!graph.treeInfo.GraphNodes) {
            graph.treeInfo.GraphNodes = {};
        }
        var node = nodeGraph;
        if (node != null && this.addNode(node, 'passed')) {
            var nodeName = node.id;
            if (!this.dictionaryContains(graph.treeInfo.GraphNodes, node)) {
                var gnNode = this.addGraphNode(node);
                this.getConnectedRelatives(gnNode);
                this.exploreRelatives(nodeGraph);
            }
            else {
                var graphNode = graph.treeInfo.GraphNodes[nodeName];
                if (graphNode.treeInfo.Added) {
                    graphNode.treeInfo.Added = false;
                    this.getConnectedRelatives(graphNode);
                    this.exploreRelatives(nodeGraph);
                }
            }
        }
    };
    GraphLayoutManager.prototype.exploreRelatives = function (nodeGraph) {
        this.exploreRelatives1(nodeGraph, 'Parents');
        this.exploreRelatives1(nodeGraph, 'Children');
    };
    GraphLayoutManager.prototype.exploreRelatives1 = function (nodeGraph, relativesToExplore) {
        var edges = [];
        if (relativesToExplore === 'Parents') {
            edges = nodeGraph.inEdges;
        }
        else if (relativesToExplore === 'Children') {
            edges = nodeGraph.outEdges;
        }
        for (var i = 0; i < edges.length; i++) {
            var edge = this.nameTable[edges[i]];
            if (this.addNode(edge, 'passed')) {
                var fromNode = this.nameTable[edge.sourceID];
                var toNode = this.nameTable[edge.targetID];
                if (relativesToExplore === 'Parents' && fromNode != null &&
                    collectionContains(fromNode.id, this.nodes)) {
                    this.selectConnectedNodes(this.nameTable[edge.sourceID]);
                }
                else if (relativesToExplore === 'Children' && toNode != null &&
                    collectionContains(toNode.id, this.nodes)) {
                    this.selectConnectedNodes(this.nameTable[edge.targetID]);
                }
            }
        }
    };
    GraphLayoutManager.prototype.getConnectedRelatives = function (graphNode) {
        this.getConnectedParents(graphNode);
        this.getConnectedChildren(graphNode);
    };
    GraphLayoutManager.prototype.dictionaryContains = function (obj, keyObj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] === keyObj.id) {
                return true;
            }
        }
        return false;
    };
    GraphLayoutManager.prototype.dictionaryLength = function (obj) {
        var keys = Object.keys(obj);
        return keys.length;
    };
    GraphLayoutManager.prototype.getConnectedChildren = function (graphNode) {
        var graph = this.selectedNode;
        var nodeGraph = graphNode;
        for (var s = 0; s < nodeGraph.outEdges.length; s++) {
            var edge = this.nameTable[nodeGraph.outEdges[s]];
            if (!edge.treeInfo.isCycleEdge) {
                var node = this.nameTable[edge.targetID];
                if (collectionContains(node.id, this.nodes) && node != null && node.visible) {
                    var gnNodeChildren = void 0;
                    if (!this.dictionaryContains(graph.treeInfo.GraphNodes, node)) {
                        gnNodeChildren = this.addGraphNode(node);
                        gnNodeChildren.treeInfo.Added = true;
                    }
                    else {
                        gnNodeChildren = graph.treeInfo.GraphNodes[node.id];
                    }
                    if (!graphNode.treeInfo.children) {
                        graphNode.treeInfo.children = [];
                    }
                    if (!gnNodeChildren.treeInfo.parents) {
                        gnNodeChildren.treeInfo.parents = [];
                    }
                    this.setNode(gnNodeChildren.treeInfo.parents, graphNode);
                    if (this.findNode(graphNode.treeInfo.children, gnNodeChildren.id) < 0) {
                        graphNode.treeInfo.children.push(gnNodeChildren);
                    }
                }
            }
        }
    };
    GraphLayoutManager.prototype.getConnectedParents = function (graphNode) {
        var graph = this.selectedNode;
        var nodeGraph = graphNode;
        for (var s = 0; s < nodeGraph.inEdges.length; s++) {
            var edge = this.nameTable[nodeGraph.inEdges[s]];
            if (!edge.treeInfo.isCycleEdge) {
                var node = this.nameTable[edge.sourceID];
                if (collectionContains(node.id, this.nodes) && node != null && node.visible) {
                    var gnNode = void 0;
                    if (!this.dictionaryContains(graph.treeInfo.GraphNodes, node)) {
                        gnNode = this.addGraphNode(node);
                        gnNode.treeInfo.Added = true;
                    }
                    else {
                        gnNode = graph.treeInfo.GraphNodes[node.id];
                    }
                    if (!graphNode.treeInfo.parents) {
                        graphNode.treeInfo.parents = [];
                    }
                    if (!gnNode.treeInfo.children) {
                        gnNode.treeInfo.children = [];
                    }
                    this.setNode(gnNode.treeInfo.children, graphNode);
                    if (this.findNode(graphNode.treeInfo.parents, gnNode.id) < 0) {
                        graphNode.treeInfo.parents.push(gnNode);
                    }
                }
            }
        }
    };
    GraphLayoutManager.prototype.setNode = function (list, node) {
        var nIndex = this.findNode(list, node.id);
        if (nIndex >= 0 && nIndex < list.length) {
            list[nIndex] = node;
        }
        else {
            list.push(node);
        }
    };
    GraphLayoutManager.prototype.findNode = function (list, fullName) {
        var nIndex = -1;
        if (list != null && fullName !== '') {
            for (var i = 0, nLength = list.length; i < nLength; i++) {
                var gnNode = list[i];
                if (typeof (gnNode) === 'string' && gnNode === fullName) {
                    nIndex = i;
                    break;
                }
                else if (gnNode != null && gnNode.id === fullName) {
                    nIndex = i;
                    break;
                }
            }
        }
        return nIndex;
    };
    GraphLayoutManager.prototype.addGraphNode = function (node) {
        var graph = this.selectedNode;
        if (!graph.treeInfo.GraphNodes) {
            graph.treeInfo.GraphNodes = {};
        }
        var gnNode = node;
        if (graph != null) {
            graph.treeInfo.GraphNodes[gnNode.id] = gnNode;
            var nodeHelper = this.mhelperSelectedNode;
            if (nodeHelper != null && node.id === nodeHelper.id) {
                this.mhelperSelectedNode = gnNode;
            }
        }
        return gnNode;
    };
    GraphLayoutManager.prototype.isConnectedToAnotherNode = function (gnNode) {
        var bFoundConnectedNode = false;
        var edges = (gnNode.inEdges).concat(gnNode.outEdges);
        if (edges.length > 0) {
            if ((gnNode.inEdges != null) && (gnNode.inEdges.length > 0)) {
                bFoundConnectedNode = this.searchEdgeCollection(gnNode.inEdges, 'FromNode');
            }
            if ((!bFoundConnectedNode) && (gnNode.outEdges != null) && (gnNode.outEdges.length > 0)) {
                bFoundConnectedNode = this.searchEdgeCollection(gnNode.outEdges, 'ToNode');
            }
        }
        return bFoundConnectedNode;
    };
    GraphLayoutManager.prototype.searchEdgeCollection = function (edgesToSearchThrough, connectionDirection) {
        var bFoundConnectedNode = false;
        for (var i = 0; i < edgesToSearchThrough.length - 1; i++) {
            var edge = this.nameTable[edgesToSearchThrough[i]];
            if (!this.addNode(edge, 'passed')) {
                continue;
            }
            if (!edge.treeInfo.isCycleEdge && ((connectionDirection === 'FromNode' && this.nameTable[edge.sourceID] != null)
                || (connectionDirection === 'ToNode' && this.nameTable[edge.targetID] != null))) {
                bFoundConnectedNode = true;
                break;
            }
        }
        return bFoundConnectedNode;
    };
    GraphLayoutManager.prototype.exploreGraphEdge = function (node) {
        var nodeLink = node;
        if (nodeLink != null && !nodeLink.treeInfo.isCycleEdge && this.addNode(node, 'passed')) {
            this.addNode(node, 'selected');
            var fromNode = this.nameTable[nodeLink.sourceID];
            var toNode = this.nameTable[nodeLink.targetID];
            if (fromNode != null) {
                this.selectNodes(fromNode);
            }
            else if (toNode != null) {
                this.selectNodes(toNode);
            }
            else {
                this.selectedNode = node;
            }
        }
    };
    GraphLayoutManager.prototype.addNode = function (nodeToAdd, collectionToAdd) {
        var bResult = true;
        var node = nodeToAdd;
        if (collectionToAdd === 'passed' || !node.visible) {
            if (!this.dictionaryContains(this.passedNodes, node)) {
                this.passedNodes[node.id] = node;
            }
        }
        if (!node.visible) {
            return false;
        }
        return bResult;
    };
    GraphLayoutManager.prototype.detectCyclesInGraph = function (nodes) {
        var vertex = [];
        var currentStack = [];
        for (var k = 0; k < nodes.length; k++) {
            if (!(nodes[k].treeInfo.graphType === 'Connector')) {
                vertex.push(nodes[k]);
            }
        }
        if (vertex.length > 0) {
            currentStack.push(vertex[0]);
            this.visitedStack.push(vertex[0]);
            while (currentStack.length > 0) {
                var top_1 = currentStack[currentStack.length - 1];
                var childNodes = this.getUnVisitedChildNodes(top_1);
                if (childNodes.length > 0) {
                    var child = childNodes[0];
                    var currentEdge = childNodes[childNodes.length - 1];
                    if (collectionContains(child.id, this.visitedStack)) {
                        currentEdge.treeInfo.isCycleEdge = true;
                        this.cycleEdgesCollection.push(currentEdge);
                    }
                    else {
                        currentStack.push(child);
                        this.visitedStack.splice(0, 0, child);
                    }
                }
                else {
                    currentStack.pop();
                }
            }
        }
    };
    GraphLayoutManager.prototype.getUnVisitedChildNodes = function (top) {
        var childNodes = [];
        if (top.outEdges.length > 0) {
            for (var i = 0; i < top.outEdges.length; i++) {
                var con = this.nameTable[top.outEdges[i]];
                if (!collectionContains(con.id, this.visitedStack)) {
                    var toNode = this.nameTable[con.targetID];
                    if (toNode != null) {
                        childNodes.push(toNode);
                    }
                    childNodes.push(con);
                    this.visitedStack.splice(0, 0, con);
                    return childNodes;
                }
            }
            return childNodes;
        }
        return childNodes;
    };
    return GraphLayoutManager;
}());
export { GraphLayoutManager };
/**
 * getGraphBounds method\
 *
 * @returns {  void }    getGraphBounds method .\
 * @param {IGraphObject} node - provide the angle value.
 * @private
 */
function getGraphBounds(node) {
    var x = node.offsetX - node.actualSize.width * node.pivot.x;
    var y = node.offsetY - node.actualSize.height * node.pivot.y;
    return new Rect(x, y, node.actualSize.width, node.actualSize.height);
}
/**
 * @param id
 * @param coll
 */
/**
 * collectionContains method\
 *
 * @returns {  boolean }    collectionContains method .\
 * @param {string} id - provide the id value.
 * @param {IGraphObject[]} coll - provide the id value.
 * @private
 */
function collectionContains(id, coll) {
    for (var i = 0; i < coll.length; i++) {
        if (coll[i].id === id) {
            return true;
        }
    }
    return false;
}
