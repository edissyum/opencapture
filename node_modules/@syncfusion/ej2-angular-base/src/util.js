import { EventEmitter } from '@angular/core';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * Angular Utility Module
 */
/* tslint:disable */
export function applyMixins(derivedClass, baseClass) {
    baseClass.forEach(function (baseClass) {
        Object.getOwnPropertyNames(baseClass.prototype).forEach(function (name) {
            if (!derivedClass.prototype.hasOwnProperty(name) || baseClass.isFormBase) {
                derivedClass.prototype[name] = baseClass.prototype[name];
            }
        });
    });
}
/* tslint:disable */
export function ComponentMixins(baseClass) {
    return function (derivedClass) {
        applyMixins(derivedClass, baseClass);
    };
}
/**
 * @private
 */
export function registerEvents(eventList, obj, direct) {
    var ngEventsEmitter = {};
    if (eventList && eventList.length) {
        for (var _i = 0, eventList_1 = eventList; _i < eventList_1.length; _i++) {
            var event_1 = eventList_1[_i];
            if (direct === true) {
                obj.propCollection[event_1] = new EventEmitter(false);
                obj[event_1] = obj.propCollection[event_1];
            }
            else {
                ngEventsEmitter[event_1] = new EventEmitter(false);
            }
        }
        if (direct !== true) {
            obj.setProperties(ngEventsEmitter, true);
        }
    }
}
/**
 * @private
 */
export function clearTemplate(_this, templateNames, index) {
    var regTemplates = Object.keys(_this.registeredTemplate);
    if (regTemplates.length) {
        /* istanbul ignore next */
        var regProperties = templateNames && templateNames.filter(function (val) {
            return (/\./g.test(val) ? false : true);
        });
        for (var _i = 0, _a = (regProperties && regProperties || regTemplates); _i < _a.length; _i++) {
            var registeredTemplate = _a[_i];
            /* istanbul ignore next */
            if (index && index.length) {
                for (var e = 0; e < index.length; e++) {
                    for (var m = 0; m < _this.registeredTemplate.template.length; m++) {
                        var value = _this.registeredTemplate.template[m].rootNodes[0];
                        if (value === index[e]) {
                            var rt = _this.registeredTemplate[registeredTemplate];
                            rt[m].destroy();
                        }
                    }
                }
            }
            else {
                if (_this.registeredTemplate[registeredTemplate]) {
                    for (var _b = 0, _c = _this.registeredTemplate[registeredTemplate]; _b < _c.length; _b++) {
                        var rt = _c[_b];
                        if (!rt.destroyed) {
                            if (rt._view) {
                                var pNode = rt._view.renderer.parentNode(rt.rootNodes[0]);
                                if (!isNullOrUndefined(pNode)) {
                                    for (var m = 0; m < rt.rootNodes.length; m++) {
                                        pNode.appendChild(rt.rootNodes[m]);
                                    }
                                }
                            }
                            rt.destroy();
                        }
                    }
                }
            }
            delete _this.registeredTemplate[registeredTemplate];
        }
    }
    var _loop_1 = function (tagObject) {
        if (tagObject.instance) {
            /* istanbul ignore next */
            tagObject.instance.clearTemplate((templateNames && templateNames.filter(function (val) {
                return (new RegExp(tagObject.name).test(val) ? true : false);
            })));
        }
    };
    for (var _d = 0, _e = _this.tagObjects; _d < _e.length; _d++) {
        var tagObject = _e[_d];
        _loop_1(tagObject);
    }
}
/**
 * To set value for the nameSpace in desired object.
 * @param {string} nameSpace - String value to the get the inner object
 * @param {any} value - Value that you need to set.
 * @param {any} obj - Object to get the inner object value.
 * @return {void}
 * @private
 */
export function setValue(nameSpace, value, object) {
    var keys = nameSpace.replace(/\[/g, '.').replace(/\]/g, '').split('.');
    /* istanbul ignore next */
    var fromObj = object || {};
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (i + 1 === keys.length) {
            fromObj[key] = value === undefined ? {} : value;
        }
        else if (fromObj[key] === undefined) {
            fromObj[key] = {};
        }
        fromObj = fromObj[key];
    }
    return fromObj;
}
