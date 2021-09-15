import { Rect } from '../primitives/rect';
import { getFunction } from '../utility/base-util';
import { HierarchicalTree } from './hierarchical-tree';
/**
 * Layout for mind-map tree
 */
var MindMap = /** @class */ (function () {
    /**
     * Constructor for the organizational chart module.
     *
     * @private
     */
    function MindMap() {
        /**
         * Defines the layout animation
         *
         */
        this.isAnimation = false;
        //constructs the layout module
    }
    /**
     * To destroy the organizational chart
     *
     * @returns {void}
     * @private
     */
    MindMap.prototype.destroy = function () {
        /**
         * Destroy method performed here
         */
    };
    /**
     * Get module name.
     */
    MindMap.prototype.getModuleName = function () {
        /**
         * Returns the module name of the layout
         */
        return 'MindMapChart';
    };
    /**
     * @param nodes
     * @param nameTable
     * @param layoutProp
     * @param viewPort
     * @param uniqueId
     * @param root
     * @private
     */
    MindMap.prototype.updateLayout = function (nodes, nameTable, layoutProp, viewPort, uniqueId, root) {
        var isRoot = this.checkRoot(nodes, layoutProp, uniqueId, root, nameTable);
        if (isRoot) {
            layoutProp.fixedNode = isRoot;
        }
        else {
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                if (!node.excludeFromLayout) {
                    if (!node.inEdges || !node.inEdges.length) {
                        layoutProp.fixedNode = node.id;
                        break;
                    }
                }
            }
        }
        var rootNode = nameTable[layoutProp.fixedNode];
        var fistLevelNodes = this.findFirstLevelNodes(rootNode, layoutProp, nameTable);
        var leftNodes = [];
        var rightNodes = [];
        var getMindmapBranch = getFunction(layoutProp.getBranch);
        getMindmapBranch = getMindmapBranch || getFunction(this.getBranch);
        for (var _a = 0, fistLevelNodes_1 = fistLevelNodes; _a < fistLevelNodes_1.length; _a++) {
            var node = fistLevelNodes_1[_a];
            var align = getMindmapBranch(node, fistLevelNodes);
            align = node && node.branch ? node.branch : align;
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (align === 'Left') ? leftNodes.push(node) : rightNodes.push(node);
        }
        var viewPortBounds = new Rect(0, 0, viewPort.x, viewPort.y);
        nameTable[layoutProp.fixedNode].offsetX = viewPortBounds.x + viewPortBounds.width / 2;
        nameTable[layoutProp.fixedNode].offsetY = viewPortBounds.y + viewPortBounds.height / 2;
        if (leftNodes.length) {
            this.updateMindMapBranch(nodes, rightNodes, nameTable, layoutProp, viewPort, uniqueId, 'Left');
        }
        if (rightNodes.length) {
            this.updateMindMapBranch(nodes, leftNodes, nameTable, layoutProp, viewPort, uniqueId, 'Right');
        }
    };
    MindMap.prototype.checkRoot = function (nodes, layoutProp, uniqueId, root, nameTable) {
        for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
            var node = nodes_2[_i];
            if (!node.excludeFromLayout) {
                if (node.data && (node.data[uniqueId].toString() === root || node.data[uniqueId].toString()
                    === layoutProp.root)) {
                    return node.id;
                }
                else if (!node.data && node.id === layoutProp.root) {
                    return node.id;
                }
            }
        }
        return '';
    };
    MindMap.prototype.updateMindMapBranch = function (nodes, excludeNodes, nameTable, layoutProp, viewPort, uniqueId, side) {
        var layout = {
            type: 'HierarchicalTree',
            horizontalSpacing: layoutProp.verticalSpacing, verticalSpacing: layoutProp.horizontalSpacing,
            verticalAlignment: layoutProp.verticalAlignment, horizontalAlignment: layoutProp.horizontalAlignment,
            fixedNode: layoutProp.fixedNode, getLayoutInfo: getFunction(layoutProp.getLayoutInfo),
            layoutInfo: layoutProp.layoutInfo, margin: layoutProp.margin,
            root: layoutProp.fixedNode
        };
        layout.orientation = (side === 'Left') ? 'LeftToRight' : 'RightToLeft';
        this.excludeFromLayout(excludeNodes, nameTable, true);
        var mapLayout = new HierarchicalTree();
        mapLayout.updateLayout(nodes, nameTable, layout, viewPort, uniqueId);
        this.excludeFromLayout(excludeNodes, nameTable, false);
    };
    MindMap.prototype.getBranch = function (obj, firstLevelNodes) {
        var side;
        var i = firstLevelNodes.indexOf(obj);
        if (i % 2 === 0) {
            side = 'Left';
        }
        else {
            side = 'Right';
        }
        return side;
    };
    MindMap.prototype.excludeFromLayout = function (newCollection, nameTable, exclude) {
        for (var _i = 0, newCollection_1 = newCollection; _i < newCollection_1.length; _i++) {
            var newcol = newCollection_1[_i];
            var node = nameTable[newcol.id];
            node.excludeFromLayout = exclude;
        }
    };
    MindMap.prototype.findFirstLevelNodes = function (node, layout, nameTable) {
        var parentNode;
        var fistLevelNodes = [];
        if (node && node.outEdges.length) {
            for (var _i = 0, _a = node.outEdges; _i < _a.length; _i++) {
                var outEdge = _a[_i];
                fistLevelNodes.push(nameTable[nameTable[outEdge].targetID]);
            }
        }
        return fistLevelNodes;
    };
    return MindMap;
}());
export { MindMap };
