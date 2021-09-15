/**
 * Radial Tree
 */
var RadialTree = /** @class */ (function () {
    /**
     * Constructor for the organizational chart module.
     *
     * @private
     */
    function RadialTree() {
        //constructs the layout module
    }
    /**
     * To destroy the organizational chart
     *
     * @returns {void}
     * @private
     */
    RadialTree.prototype.destroy = function () {
        /**
         * Destroy method performed here
         */
    };
    /**
     * Get module name.
     */
    RadialTree.prototype.getModuleName = function () {
        /**
         * Returns the module name of the layout
         */
        return 'RadialTree';
    };
    /**
     * @param nodes
     * @param nameTable
     * @param layoutProp
     * @param viewport
     * @private
     */
    RadialTree.prototype.updateLayout = function (nodes, nameTable, layoutProp, viewport) {
        var layout = {
            type: layoutProp.type,
            nameTable: nameTable, anchorX: 0, anchorY: 0,
            firstLevelNodes: [], centerNode: null, levels: [], maxLevel: 0, graphNodes: {}, layoutNodes: [],
            orientation: layoutProp.orientation,
            horizontalSpacing: layoutProp.horizontalSpacing, verticalSpacing: layoutProp.verticalSpacing,
            verticalAlignment: layoutProp.verticalAlignment, horizontalAlignment: layoutProp.horizontalAlignment,
            fixedNode: layoutProp.fixedNode, margin: layoutProp.margin,
            bounds: layoutProp.bounds, objects: [], root: layoutProp.root
        };
        this.doLayout(layout, nodes, nameTable, viewport);
    };
    RadialTree.prototype.doLayout = function (layout, nodes, nameTable, viewport) {
        var node;
        for (var i = 0; i < nodes.length; i++) {
            node = nodes[i];
            if (!node.excludeFromLayout) {
                layout.graphNodes[node.id] = this.setUpLayoutInfo(layout, node);
                if (!node.inEdges || !node.inEdges.length) {
                    layout.firstLevelNodes.push(node);
                }
            }
        }
        if (layout.root && nameTable[layout.root]) {
            layout.centerNode = nameTable[layout.root];
        }
        else if (layout.firstLevelNodes.length) {
            layout.centerNode = layout.firstLevelNodes[0];
            layout.root = layout.centerNode.id;
        }
        if (layout.centerNode) {
            this.updateEdges(layout, layout.centerNode, 0, nameTable);
            this.depthFirstAllignment(layout, layout.centerNode, 0, 0);
            this.populateLevels(layout);
            this.transformToCircleLayout(layout);
            this.updateAnchor(layout, viewport);
            this.updateNodes(layout, layout.centerNode, nameTable);
        }
    };
    RadialTree.prototype.updateEdges = function (layout, node, depth, nameTable) {
        var nodeInfo = layout.graphNodes[node.id];
        layout.layoutNodes.push(nodeInfo);
        nodeInfo.level = depth;
        nodeInfo.visited = true;
        layout.maxLevel = Math.max(layout.maxLevel, depth);
        for (var j = 0; j < node.outEdges.length; j++) {
            var edge = nameTable[nameTable[node.outEdges[j]].targetID];
            if (!edge.excludeFromLayout && !edge.visited) {
                nodeInfo.children.push(edge);
                this.updateEdges(layout, edge, depth + 1, nameTable);
            }
        }
    };
    RadialTree.prototype.depthFirstAllignment = function (layout, node, x, y) {
        var newValue;
        var nodeInfo = layout.graphNodes[node.id];
        if (nodeInfo.children.length) {
            y += 300;
            for (var i = 0; i < nodeInfo.children.length; i++) {
                newValue = this.depthFirstAllignment(layout, nodeInfo.children[i], x, y);
                x = newValue.x;
                y = newValue.y;
            }
            nodeInfo.children = nodeInfo.children.sort(function (obj1, obj2) {
                return layout.graphNodes[obj1.id].x - layout.graphNodes[obj2.id].x;
            });
            var min = layout.graphNodes[nodeInfo.children[0].id].min;
            var max = layout.graphNodes[nodeInfo.children[nodeInfo.children.length - 1].id].max;
            nodeInfo.x = min + (max - min) / 2;
            x = max + layout.horizontalSpacing;
            nodeInfo.segmentOffset = max + layout.horizontalSpacing;
            nodeInfo.x -= nodeInfo.width / 2;
            nodeInfo.y -= nodeInfo.height / 2;
            nodeInfo.min = min;
            nodeInfo.max = max;
            if (nodeInfo.x < min && nodeInfo.visited) {
                nodeInfo.x = min;
                x = nodeInfo.x + nodeInfo.width / 2 - (max - min) / 2;
                nodeInfo.visited = false;
                for (var i = 0; i < nodeInfo.children.length; i++) {
                    newValue = this.depthFirstAllignment(layout, nodeInfo.children[i], x, y);
                }
                nodeInfo.visited = true;
                x = nodeInfo.x + nodeInfo.width + layout.horizontalSpacing;
            }
            max = layout.graphNodes[nodeInfo.children[nodeInfo.children.length - 1].id].segmentOffset;
            x = x < max ? max : x;
            y -= 300;
            nodeInfo.y = y;
        }
        else {
            nodeInfo.x = x;
            nodeInfo.y = y;
            nodeInfo.min = x;
            nodeInfo.max = x + nodeInfo.width;
            x += nodeInfo.width + layout.horizontalSpacing;
        }
        return { x: x, y: y };
    };
    RadialTree.prototype.populateLevels = function (layout) {
        var stages = [];
        // eslint-disable-next-line prefer-spread
        var min = Math.min.apply(Math, layout.layoutNodes.map(function (nodeInfo) { return nodeInfo.x; }));
        // eslint-disable-next-line prefer-spread
        var max = Math.max.apply(Math, layout.layoutNodes.map(function (nodeInfo) {
            return nodeInfo.x + nodeInfo.width + layout.horizontalSpacing;
        }));
        var full = max - min;
        layout.levels = [];
        var _loop_1 = function (i) {
            stages = layout.layoutNodes.filter(function (nodeInfo) {
                if (nodeInfo.level === i) {
                    return nodeInfo;
                }
                else {
                    return null;
                }
            });
            var newlevel = {};
            stages = stages.sort(function (nodeInfo1, nodeInfo2) { return nodeInfo1.x - nodeInfo2.x; });
            newlevel.min = stages[0].x;
            newlevel.max = stages[stages.length - 1].x + stages[stages.length - 1].width + layout.horizontalSpacing;
            newlevel.actualCircumference = 0;
            newlevel.height = 0;
            for (var k = 0; k < stages.length; k++) {
                if (stages[k].height > newlevel.height) {
                    newlevel.height = stages[k].height;
                }
                newlevel.actualCircumference += Math.max(stages[k].width, stages[k].height);
                if (k !== stages.length - 1) {
                    newlevel.actualCircumference += layout.horizontalSpacing;
                }
            }
            newlevel.circumference = newlevel.max - newlevel.min;
            if (newlevel.actualCircumference < newlevel.circumference) {
                newlevel.circumference = (newlevel.circumference + newlevel.actualCircumference) / 2;
            }
            newlevel.radius = newlevel.circumference / (2 * Math.PI) + newlevel.height;
            newlevel.nodes = [];
            if (i > 1) {
                if (layout.levels[i - 1].radius + layout.levels[i - 1].height >= newlevel.radius) {
                    newlevel.radius = layout.levels[i - 1].radius + layout.levels[i - 1].height;
                }
            }
            for (var j = 0; j < stages.length; j++) {
                stages[j].ratio = Math.abs(stages[j].x + stages[j].width / 2 - min) / full;
                newlevel.nodes.push(stages[j]);
            }
            layout.levels.push(newlevel);
        };
        for (var i = 0; i <= layout.maxLevel; i++) {
            _loop_1(i);
        }
    };
    RadialTree.prototype.transformToCircleLayout = function (layout) {
        var root = layout.graphNodes[layout.centerNode.id];
        root.x = 0;
        root.y = 0;
        for (var i = 1; i < layout.levels.length; i++) {
            for (var j = 0; j < layout.levels[i].nodes.length; j++) {
                var nodeInfo = layout.levels[i].nodes[j];
                nodeInfo.x = Math.cos(nodeInfo.ratio * 360 * Math.PI / 180) * (layout.levels[i].radius + layout.verticalSpacing * i);
                nodeInfo.y = Math.sin(nodeInfo.ratio * 360 * Math.PI / 180) * (layout.levels[i].radius + layout.verticalSpacing * i);
                layout.anchorX = Math.min(layout.anchorX, nodeInfo.x);
                layout.anchorY = Math.min(layout.anchorY, nodeInfo.y);
            }
        }
    };
    RadialTree.prototype.updateAnchor = function (layout, viewPort) {
        layout.anchorX = layout.centerNode.offsetX || viewPort.x / 2;
        layout.anchorY = layout.centerNode.offsetY || viewPort.y / 2;
    };
    RadialTree.prototype.updateNodes = function (layout, node, nameTable) {
        var nodeInfo = layout.graphNodes[node.id];
        var offsetX = nodeInfo.x + layout.anchorX;
        var offsetY = nodeInfo.y + layout.anchorY;
        node.offsetX += offsetX;
        node.offsetY += offsetY;
        for (var i = 0; i < nodeInfo.children.length; i++) {
            var childInfo = nodeInfo.children[i];
            this.updateNodes(layout, nameTable[childInfo.id], nameTable);
        }
    };
    RadialTree.prototype.setUpLayoutInfo = function (layout, item) {
        var info = {};
        info.name = item.id;
        info.x = 0;
        info.y = 0;
        info.min = 0;
        info.max = 0;
        info.width = item.actualSize.width;
        info.height = item.actualSize.height;
        info.children = [];
        info.level = 0;
        info.ratio = 0;
        info.visited = false;
        return info;
    };
    return RadialTree;
}());
export { RadialTree };
