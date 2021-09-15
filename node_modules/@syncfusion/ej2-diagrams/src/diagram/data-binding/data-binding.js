import { Node } from '../objects/node';
import { Connector } from '../objects/connector';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { randomId, getFunction } from '../utility/base-util';
import { cloneBlazorObject } from '../utility/diagram-util';
import { updateDefaultValues } from '../utility/diagram-util';
import { isBlazor } from '@syncfusion/ej2-base';
/**
 * data source defines the basic unit of diagram
 */
var DataBinding = /** @class */ (function () {
    /**
     * Constructor for the data binding module.
     * @private
     */
    function DataBinding() {
        /**   @private  */
        this.dataTable = {};
        //constructs the data binding module
    }
    /**
     * To destroy the data binding module
     *
     * @returns {void}
     * @private
     */
    DataBinding.prototype.destroy = function () {
        /**
         * Destroy method performed here
         */
    };
    /**
     * Core method to return the component name.
     *
     * @returns {string}  Core method to return the component name.
     * @private
     */
    DataBinding.prototype.getModuleName = function () {
        /**
         * Returns the module name
         */
        return 'DataBinding';
    };
    /**
     * Initialize nodes and connectors when we have a data as JSON
     *
     * @param {DataSourceModel} data
     * @param {Diagram} diagram
     * @private
     */
    DataBinding.prototype.initData = function (data, diagram) {
        var dataSource;
        var dataProp = 'data';
        var jsonProp = 'json';
        var dataManager = data.dataManager || data.dataSource || {};
        dataSource = dataManager[dataProp] || dataManager[jsonProp] ||
            (dataManager.dataSource ? dataManager.dataSource.json : undefined);
        if (dataSource && dataSource.length === 0 && dataManager.dataSource.data) {
            dataSource = dataManager.dataSource.data;
        }
        if (dataSource && dataSource.length) {
            this.applyDataSource(data, dataSource, diagram);
            diagram.trigger('dataLoaded', { diagram: (isBlazor()) ? null : cloneBlazorObject(diagram) });
        }
    };
    /**
     * Initialize nodes and connector when we have a data as remote url
     *
     * @param {DataSourceModel} data
     * @param {Diagram} diagram
     * @private
     */
    DataBinding.prototype.initSource = function (data, diagram) {
        var _this = this;
        var dataSource = data;
        var result;
        var mapper = data;
        if (dataSource.dataManager instanceof DataManager || dataSource.dataSource instanceof DataManager) {
            var tempObj = mapper.dataManager || mapper.dataSource;
            var query = tempObj.defaultQuery || new Query();
            var dataManager = data.dataManager || data.dataSource;
            dataManager.executeQuery(query).then(function (e) {
                var prop = 'result';
                result = e[prop];
                if (!diagram.isDestroyed) {
                    diagram.protectPropertyChange(true);
                    _this.applyDataSource(data, result, diagram);
                    diagram.refreshDiagram();
                    diagram.protectPropertyChange(false);
                    diagram.trigger('dataLoaded', { diagram: (isBlazor()) ? null : cloneBlazorObject(diagram) });
                }
            });
        }
    };
    DataBinding.prototype.applyDataSource = function (mapper, data, diagram) {
        this.dataTable = {};
        var obj;
        var firstNode;
        var node;
        var rootNodes = [];
        var firstLevel = [];
        var item;
        var nextLevel;
        if (data !== undefined) {
            for (var r = 0; r < data.length; r++) {
                obj = data[r];
                if (obj[mapper.parentId] === undefined || obj[mapper.parentId] === null ||
                    typeof obj[mapper.parentId] !== 'object') {
                    if (rootNodes[obj[mapper.parentId]] !== undefined) {
                        rootNodes[obj[mapper.parentId]].items.push(obj);
                    }
                    else {
                        rootNodes[obj[mapper.parentId]] = { items: [obj] };
                    }
                }
                else {
                    rootNodes = this.updateMultipleRootNodes(obj, rootNodes, mapper, data);
                }
                if (mapper.root === obj[mapper.id]) {
                    firstNode = { items: [obj] };
                }
            }
            if (firstNode) {
                firstLevel.push(firstNode);
            }
            else {
                for (var _i = 0, _a = Object.keys(rootNodes); _i < _a.length; _i++) {
                    var n = _a[_i];
                    if (!n || n === 'undefined' || n === '\'\'' || n === 'null') {
                        firstLevel.push(rootNodes[n]);
                    }
                }
            }
            for (var i = 0; i < firstLevel.length; i++) {
                for (var j = 0; j < firstLevel[i].items.length; j++) {
                    item = firstLevel[i].items[j];
                    node = this.applyNodeTemplate(mapper, item, diagram);
                    diagram.nodes.push(node);
                    this.dataTable[item[mapper.id]] = node;
                    nextLevel = rootNodes[node.data[mapper.id]];
                    if (nextLevel !== undefined) {
                        this.renderChildNodes(mapper, nextLevel, node.id, rootNodes, diagram);
                    }
                }
            }
        }
        this.dataTable = null;
    };
    /**
     * updateMultipleRootNodes method is used  to update the multiple Root Nodes
     *
     * @param {Object} object
     * @param {Object[]} rootnodes
     * @param {DataSourceModel} mapper
     * @param {Object[]} data
     */
    DataBinding.prototype.updateMultipleRootNodes = function (obj, rootNodes, mapper, data) {
        var parents = obj[mapper.parentId];
        var parent;
        for (var i = 0; i < parents.length; i++) {
            parent = parents[i];
            if (rootNodes[parent]) {
                rootNodes[parent].items.push(obj);
            }
            else {
                rootNodes[parent] = { items: [obj] };
            }
        }
        return rootNodes;
    };
    /**
     *  Get the node values\
     *
     * @returns { Node }    Get the node values.\
     * @param {DataSourceModel} mapper - provide the id value.
     * @param {Object} item - provide the id value.
     * @param {Diagram} diagram - provide the id value.
     *
     * @private
     */
    DataBinding.prototype.applyNodeTemplate = function (mapper, item, diagram) {
        //const root: Object = item;
        var id = randomId();
        //const blazor: string = 'Blazor';
        var nodeModel = { id: id, data: item };
        // eslint-disable-next-line @typescript-eslint/ban-types
        var doBinding = getFunction(mapper.doBinding);
        if (doBinding) {
            doBinding(nodeModel, item, diagram);
        }
        var obj = new Node(diagram, 'nodes', nodeModel, true);
        updateDefaultValues(obj, nodeModel, diagram.nodeDefaults);
        if (mapper.dataMapSettings) {
            var index = void 0;
            var arrayProperty = [];
            var innerProperty = [];
            for (var i = 0; i < mapper.dataMapSettings.length; i++) {
                if (mapper.dataMapSettings[i].property.indexOf('.') !== -1) {
                    innerProperty = this.splitString(mapper.dataMapSettings[i].property);
                    for (var p = 0; p < innerProperty.length; p++) {
                        if (innerProperty[p].indexOf('[') !== -1) {
                            index = innerProperty[p].indexOf('[');
                            arrayProperty = innerProperty[p].split('[');
                        }
                    }
                    if (index) {
                        if (innerProperty[2]) {
                            obj[arrayProperty[0]][innerProperty[0].charAt(index + 1)][innerProperty[1]][innerProperty[2]] =
                                item[mapper.dataMapSettings[i].field];
                        }
                        else {
                            var value = item[mapper.dataMapSettings[i].field];
                            obj[arrayProperty[0]][innerProperty[0].charAt(index + 1)][innerProperty[1]] = value;
                        }
                    }
                    else {
                        if (innerProperty[2]) {
                            obj[innerProperty[0]][innerProperty[1]][innerProperty[2]] = item[mapper.dataMapSettings[i].field];
                        }
                        else {
                            obj[innerProperty[0]][innerProperty[1]] = item[mapper.dataMapSettings[i].field];
                        }
                    }
                }
                else {
                    var property = mapper.dataMapSettings[i].property;
                    property = property.charAt(0).toLowerCase() + property.slice(1);
                    obj[property] = item[mapper.dataMapSettings[i].field];
                }
                index = 0;
                arrayProperty = [];
                innerProperty = [];
            }
        }
        if (!this.collectionContains(obj, diagram, mapper.id, mapper.parentId)) {
            return obj;
        }
        else {
            return this.dataTable[item[mapper.id]];
        }
    };
    DataBinding.prototype.splitString = function (property) {
        var temp = [];
        temp = property.split('.');
        for (var i = 0; i < temp.length; i++) {
            temp[i] = temp[i].charAt(0).toLowerCase() + temp[i].slice(1);
        }
        return temp;
    };
    DataBinding.prototype.renderChildNodes = function (mapper, parent, value, rtNodes, diagram) {
        var child;
        var nextLevel;
        var node;
        for (var j = 0; j < parent.items.length; j++) {
            child = parent.items[j];
            node = this.applyNodeTemplate(mapper, child, diagram);
            var canBreak = false;
            if (!this.collectionContains(node, diagram, mapper.id, mapper.parentId)) {
                this.dataTable[child[mapper.id]] = node;
                diagram.nodes.push(node);
            }
            else {
                canBreak = true;
            }
            if (!this.containsConnector(diagram, value, node.id)) {
                diagram.connectors.push(this.applyConnectorTemplate(value, node.id, diagram));
            }
            if (!canBreak) {
                nextLevel = rtNodes[node.data[mapper.id]];
                if (nextLevel !== undefined) {
                    this.renderChildNodes(mapper, nextLevel, node.id, rtNodes, diagram);
                }
            }
        }
    };
    DataBinding.prototype.containsConnector = function (diagram, sourceNode, targetNode) {
        if (sourceNode !== '' && targetNode !== '') {
            for (var i = 0; i < diagram.connectors.length; i++) {
                var connector = diagram.connectors[i];
                if (connector !== undefined && (connector.sourceID === sourceNode && connector.targetID === targetNode)) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     *  collectionContains method is used to  check wthear the node is already present in collection or not
     *
     * @param {Node} node
     * @param {Diagram} diagram
     * @param {string} id
     * @param {string} parentId
     */
    DataBinding.prototype.collectionContains = function (node, diagram, id, parentId) {
        var obj = this.dataTable[node.data[id]];
        if (obj !== undefined && obj.data[id] === node.data[id] && obj.data[parentId] === node.data[parentId]) {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Get the Connector values
     *
     * @param {string} sNode
     * @param {string} tNode
     * @param {Diagram} diagram
     */
    DataBinding.prototype.applyConnectorTemplate = function (sNode, tNode, diagram) {
        var connModel = {
            id: randomId(), sourceID: sNode, targetID: tNode
        };
        var obj = new Connector(diagram, 'connectors', connModel, true);
        updateDefaultValues(obj, connModel, diagram.connectorDefaults);
        return obj;
    };
    return DataBinding;
}());
export { DataBinding };
