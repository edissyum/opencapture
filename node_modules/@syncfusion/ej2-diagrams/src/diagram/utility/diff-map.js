import { TextElement } from '../core/elements/text-element';
import { Node } from '../objects/node';
import { getIndex, cloneObject } from './base-util';
import { isBlazor } from '@syncfusion/ej2-base';
/**
 * Defines the behavior of commands
 */
/* eslint-disable */
var DeepDiffMapper = /** @class */ (function () {
    function DeepDiffMapper() {
        this.valueCreated = 'created';
        this.valueUpdated = "updated";
        this.valueDeleted = "deleted";
        this.valueUnchanged = "unchanged";
        /** @private */
        this.newNodeObject = [];
        /** @private */
        this.newConnectorObject = [];
        /**   @private  */
        this.diagramObject = {};
        /* eslint-enable */
    }
    /** @private */
    DeepDiffMapper.prototype.updateObjectCollection = function (layers, diagram) {
        for (var i = 0; i < layers.length; i++) {
            if (layers[i]['objects']) {
                layers[i]['objects'] = (diagram.layers[i].objects);
            }
            else {
                layers[i]['objects'] = [];
                layers[i]['objects'] = diagram.layers[i].objects;
            }
        }
    };
    /**   @private  */
    DeepDiffMapper.prototype.getOldObject = function (id, isNode, diagram) {
        var oldObject = isNode ? diagram.oldNodeObjects : diagram.oldConnectorObjects;
        for (var i = 0; i < oldObject.length; i++) {
            if (oldObject[i].id === id) {
                return oldObject[i];
            }
        }
        return undefined;
    };
    /** @private */
    DeepDiffMapper.prototype.changeSegments = function (diff, newObject) {
        for (var _i = 0, _a = Object.keys(diff); _i < _a.length; _i++) {
            var prop = _a[_i];
            if (prop === 'segments') {
                var seg = this.removeNullValues(newObject[prop]);
                diff[prop] = seg;
            }
        }
        return diff;
    };
    DeepDiffMapper.prototype.removeNullValues = function (segments) {
        var newSegments = [];
        var seg = {};
        for (var i = 0; i < segments.length; i++) {
            seg = this.removeNullObjectValues(segments[i]);
            newSegments.push(seg);
        }
        return newSegments;
    };
    ;
    /** @private */
    DeepDiffMapper.prototype.removeNullObjectValues = function (segment) {
        var newSegObject = {};
        for (var _i = 0, _a = Object.keys(segment); _i < _a.length; _i++) {
            var prop = _a[_i];
            if (segment[prop] !== undefined) {
                newSegObject[prop] = (segment[prop] instanceof Object) ? this.removeNullObjectValues(segment[prop]) : segment[prop];
            }
        }
        return newSegObject;
    };
    ;
    /** @private */
    DeepDiffMapper.prototype.getDifferenceValues = function (selectedObject, args, labelDrag, diagram) {
        var diffValue;
        var diff;
        var result;
        var isNode = selectedObject instanceof Node;
        var oldObject;
        if (selectedObject) {
            oldObject = isNode ? this.getOldObject(selectedObject.id, true, diagram) : this.getOldObject(selectedObject.id, false, diagram);
            if (oldObject) {
                var newObject = cloneObject(selectedObject);
                result = this.map(newObject, oldObject);
                diffValue = this.frameObject({}, result);
                diff = this.removeEmptyValues(diffValue);
                diff = this.changeSegments(diff, newObject);
                if (diff.children) {
                    diff.children = cloneObject(selectedObject).children;
                }
                if (diff.ports && diff.ports.length) {
                    for (var i = 0; i < diff.ports.length; i++) {
                        if (newObject.ports[i].outEdges) {
                            diff.ports[i].outEdges = newObject.ports[i].outEdges;
                        }
                        if (newObject.ports[i].inEdges) {
                            diff.ports[i].inEdges = newObject.ports[i].inEdges;
                        }
                    }
                }
                return this.getDiagramObjects(diff, selectedObject.id, isNode, args, labelDrag, diagram);
            }
        }
    };
    /** @private */
    DeepDiffMapper.prototype.getLayerObject = function (oldDiagram, temp, diagram) {
        if (isBlazor()) {
            var diffLayers = {};
            diffLayers['layers'] = [];
            var newDiagram = {};
            newDiagram['layers'] = [];
            for (var i = 0; i < diagram.layers.length; i++) {
                newDiagram['layers'].push(cloneObject(diagram.layers[i]));
            }
            var result = void 0;
            for (var i = 0; i < newDiagram['layers'].length; i++) {
                if (!temp) {
                    result = this.map(cloneObject(newDiagram['layers'][i]), oldDiagram['layers'][i]);
                }
                else {
                    result = this.map(oldDiagram['layers'][i], cloneObject(newDiagram['layers'][i]));
                }
                var diffValue = this.frameObject({}, result);
                var diff = this.removeEmptyValues(diffValue);
                diffLayers['layers'][i] = diff;
            }
            this.updateObjectCollection(diffLayers['layers'], diagram);
            return diffLayers;
        }
    };
    /** @private */
    DeepDiffMapper.prototype.getDiagramObjects = function (diffValue, object, isNode, args, labelDrag, diagram) {
        var index = 0;
        index = getIndex(diagram, object);
        diffValue.sfIndex = index;
        if (isNode) {
            this.newNodeObject.push(diffValue);
        }
        else {
            this.newConnectorObject.push(diffValue);
        }
        if (args && (((args.sourceWrapper instanceof TextElement) && labelDrag) || args.portId)) {
            var tempObject = void 0;
            var objectValue = void 0;
            if (isNode) {
                objectValue = args.portId ? this.newNodeObject[0].ports : this.newNodeObject[0].annotations;
            }
            else {
                objectValue = this.newConnectorObject[0].annotations || [];
            }
            for (var i = 0; i < objectValue.length; i++) {
                if (Object.keys(objectValue[i]).length > 0) {
                    var selectedObject = diagram.nameTable[object];
                    tempObject = objectValue[i];
                    if (args.portId) {
                        this.newNodeObject[0].ports = [tempObject];
                    }
                    else {
                        for (var j = 0; j < selectedObject.annotations.length; j++) {
                            if (args.sourceWrapper.id === selectedObject.id + "_" + selectedObject.annotations[j].id) {
                                tempObject.sfIndex = j;
                            }
                        }
                        if (isNode) {
                            this.newNodeObject[0].annotations = [tempObject];
                        }
                        else {
                            this.newConnectorObject[0].annotations = [tempObject];
                        }
                    }
                }
            }
        }
        this.diagramObject = { nodes: this.newNodeObject, connectors: this.newConnectorObject };
        //return returnValue;
    };
    DeepDiffMapper.prototype.removeArrayValues = function (obj) {
        var newObj = [];
        var value = JSON.stringify(obj);
        if (!(value === JSON.stringify({ 'data': [] }))) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i] instanceof Object) {
                    var newValue = this.removeEmptyValues(obj[i]);
                    newObj.push(newValue);
                }
                else {
                    newObj.push(obj[i]);
                }
            }
        }
        return newObj;
    };
    /** @private */
    DeepDiffMapper.prototype.removeEmptyValues = function (frame) {
        var newObj = {};
        for (var _i = 0, _a = Object.keys(frame); _i < _a.length; _i++) {
            var prop = _a[_i];
            if (prop !== 'wrapper' && (prop !== 'data' || (prop === 'data' && !(frame[prop] instanceof Array)))) {
                var obj = frame[prop];
                var value = JSON.stringify(obj);
                if (obj instanceof Array) {
                    var newValue = this.removeArrayValues(obj);
                    if (JSON.stringify(newValue) !== '[]') {
                        newObj[prop] = newValue;
                    }
                }
                else {
                    if (obj instanceof Object) {
                        if (!(value === JSON.stringify({ 'data': [] }))) {
                            var newValue = this.removeEmptyValues(obj);
                            if (JSON.stringify(newValue) !== '{}') {
                                newObj[prop] = newValue;
                            }
                        }
                    }
                    else {
                        if (!(value === JSON.stringify(['data']) || value === JSON.stringify('data')
                            || value === JSON.stringify({ 'data': [] }))) {
                            if (prop !== 'version' && prop !== 'ejsAction') {
                                newObj[prop] = frame[prop];
                            }
                        }
                    }
                }
            }
        }
        return newObj;
    };
    DeepDiffMapper.prototype.map = function (obj1, obj2, arrayName) {
        if (this.isFunction(obj1) || this.isFunction(obj2)) {
            throw 'Invalid argument. Function given, object expected.';
        }
        if (this.isValue(obj1) || this.isValue(obj2)) {
            return {
                type: this.compareValues(obj1, obj2),
                data: obj1 === undefined ? obj2 : obj1
            };
        }
        var diff = {};
        if (this.isArray(obj1)) {
            for (var i_1 = 0; i_1 < obj1.length; i_1++) {
                if (!diff[arrayName]) {
                    diff[arrayName] = [];
                }
                var ss = this.map(obj1[i_1], obj2[i_1]);
                diff[arrayName].push(ss);
            }
        }
        else {
            for (var key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }
                var value2 = undefined;
                if (obj2[key] !== undefined) {
                    value2 = obj2[key];
                }
                var kk = this.map(obj1[key], value2, this.isArray(value2) ? key : undefined);
                if (this.isArray(value2)) {
                    diff[key] = kk[key];
                }
                else {
                    diff[key] = kk;
                }
            }
        }
        if (this.isArray(obj2)) {
            for (var i = obj2.length - 1; i >= 0; i--) {
                if (!diff[arrayName]) {
                    diff[arrayName] = [];
                }
                if (this.isFunction(obj2[i]) || diff[arrayName][i] !== undefined) {
                    if (diff[arrayName][i].type && diff[arrayName][i].type !== this.valueUpdated) {
                        delete diff[arrayName];
                    }
                    continue;
                }
                var ss = this.map(undefined, obj2[i]);
                diff[arrayName][i] = ss;
            }
        }
        else {
            for (var key in obj2) {
                if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
                    if (diff[key].type && ((diff[key].type !== this.valueUpdated) && (diff[key].type !== this.valueDeleted))) {
                        delete diff[key];
                    }
                    continue;
                }
                var kk = this.map(undefined, obj2[key]);
                diff[key] = kk;
            }
        }
        return diff;
    };
    DeepDiffMapper.prototype.compareValues = function (value1, value2) {
        if (value1 === value2) {
            return this.valueUnchanged;
        }
        if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
            return this.valueUnchanged;
        }
        if (value1 === undefined) {
            return this.valueCreated;
        }
        if (value2 === undefined) {
            return this.valueDeleted;
        }
        return this.valueUpdated;
    };
    DeepDiffMapper.prototype.isFunction = function (x) {
        return Object.prototype.toString.call(x) === '[object Function]';
    };
    DeepDiffMapper.prototype.isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
    };
    DeepDiffMapper.prototype.isDate = function (x) {
        return Object.prototype.toString.call(x) === '[object Date]';
    };
    DeepDiffMapper.prototype.isObject = function (x) {
        return Object.prototype.toString.call(x) === '[object Object]';
    };
    DeepDiffMapper.prototype.isValue = function (x) {
        return !this.isObject(x) && !this.isArray(x);
    };
    DeepDiffMapper.prototype.frameObject = function (final, obj) {
        for (var key in obj) {
            if (this.isArray(obj[key])) {
                if (!final[key]) {
                    final[key] = [];
                }
                for (var i = 0; i < obj[key].length; i++) {
                    var kk = this.frameObject({}, obj[key][i]);
                    final[key].push(kk);
                }
            }
            else {
                if ((key != 'type') || (key == 'type' && (obj[key] !== this.valueUpdated && obj[key] !== this.valueUnchanged && obj[key] !== this.valueDeleted && obj[key] !== this.valueCreated))) {
                    if (this.isFunction(obj[key])) {
                        continue;
                    }
                    if (this.isValue(obj[key])) {
                        return obj['data'];
                    }
                    else {
                        var kk = this.frameObject({}, obj[key]);
                        if (this.isValue(kk) || Object.keys(kk).length > 0) {
                            final[key] = kk;
                        }
                    }
                }
            }
        }
        return final;
    };
    return DeepDiffMapper;
}());
export { DeepDiffMapper };
