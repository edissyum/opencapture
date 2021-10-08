import { createInstance, isUndefined, merge, extend, getValue } from './util';
/**
 * Returns the Class Object
 *
 * @param {ClassObject} instance - instance of ClassObject
 * @param {string} curKey - key of the current instance
 * @param {Object} defaultValue - default Value
 * @param {Object[]} type ?
 * @returns {ClassObject} ?
 */
// eslint-disable-next-line
function getObject(instance, curKey, defaultValue, type) {
    // eslint-disable-next-line
    if (!instance.properties.hasOwnProperty(curKey) || !(instance.properties[curKey] instanceof type)) {
        instance.properties[curKey] = createInstance(type, [instance, curKey, defaultValue]);
    }
    return instance.properties[curKey];
}
/**
 * Returns object array
 *
 * @param {ClassObject} instance ?
 * @param {string} curKey ?
 * @param {Object[]} defaultValue ?
 * @param {Object} type ?
 * @param {boolean} isSetter ?
 * @param {boolean} isFactory ?
 * @returns {Object[]} ?
 */
// eslint-disable-next-line
function getObjectArray(instance, curKey, defaultValue, type, isSetter, isFactory) {
    var result = [];
    var len = defaultValue ? defaultValue.length : 0;
    for (var i = 0; i < len; i++) {
        var curType = type;
        if (isFactory) {
            curType = type(defaultValue[i], instance);
        }
        if (isSetter) {
            var inst = createInstance(curType, [instance, curKey, {}, true]);
            inst.setProperties(defaultValue[i], true);
            result.push(inst);
        }
        else {
            result.push(createInstance(curType, [instance, curKey, defaultValue[i], false]));
        }
    }
    return result;
}
/**
 * Returns the properties of the object
 *
 * @param {Object} defaultValue ?
 * @param {string} curKey ?
 * @returns {void} ?
 */
function propertyGetter(defaultValue, curKey) {
    return function () {
        // eslint-disable-next-line
        if (!this.properties.hasOwnProperty(curKey)) {
            this.properties[curKey] = defaultValue;
        }
        return this.properties[curKey];
    };
}
/**
 * Set the properties for the object
 *
 * @param {Object} defaultValue ?
 * @param {string} curKey ?
 * @returns {void} ?
 */
function propertySetter(defaultValue, curKey) {
    return function (newValue) {
        if (this.properties[curKey] !== newValue) {
            // eslint-disable-next-line
            var oldVal = this.properties.hasOwnProperty(curKey) ? this.properties[curKey] : defaultValue;
            this.saveChanges(curKey, newValue, oldVal);
            this.properties[curKey] = newValue;
        }
    };
}
/**
 * Returns complex objects
 *
 * @param {Object} defaultValue ?
 * @param {string} curKey ?
 * @param {Object[]} type ?
 * @returns {void} ?
 */
// eslint-disable-next-line
function complexGetter(defaultValue, curKey, type) {
    return function () {
        return getObject(this, curKey, defaultValue, type);
    };
}
/**
 * Sets complex objects
 *
 * @param {Object} defaultValue ?
 * @param {string} curKey ?
 * @param {Object[]} type ?
 * @returns {void} ?
 */
function complexSetter(defaultValue, curKey, type) {
    return function (newValue) {
        getObject(this, curKey, defaultValue, type).setProperties(newValue);
    };
}
/**
 *
 * @param {Object} defaultValue ?
 * @param {string} curKey ?
 * @param {FunctionConstructor} type ?
 * @returns {void} ?
 */
// eslint-disable-next-line
function complexFactoryGetter(defaultValue, curKey, type) {
    return function () {
        var curType = type({});
        // eslint-disable-next-line
        if (this.properties.hasOwnProperty(curKey)) {
            return this.properties[curKey];
        }
        else {
            return getObject(this, curKey, defaultValue, curType);
        }
    };
}
/**
 *
 * @param {Object} defaultValue ?
 * @param {string} curKey ?
 * @param {Object[]} type ?
 * @returns {void} ?
 */
function complexFactorySetter(defaultValue, curKey, type) {
    return function (newValue) {
        var curType = type(newValue, this);
        getObject(this, curKey, defaultValue, curType).setProperties(newValue);
    };
}
/**
 *
 * @param {Object[]} defaultValue ?
 * @param {string} curKey ?
 * @param {Object[]} type ?
 * @returns {void} ?
 */
function complexArrayGetter(defaultValue, curKey, type) {
    return function () {
        var _this = this;
        // eslint-disable-next-line
        if (!this.properties.hasOwnProperty(curKey)) {
            var defCollection = getObjectArray(this, curKey, defaultValue, type, false);
            this.properties[curKey] = defCollection;
        }
        var ignore = ((this.controlParent !== undefined && this.controlParent.ignoreCollectionWatch)
            || this.ignoreCollectionWatch);
        // eslint-disable-next-line
        if (!this.properties[curKey].hasOwnProperty('push') && !ignore) {
            ['push', 'pop'].forEach(function (extendFunc) {
                var descriptor = {
                    value: complexArrayDefinedCallback(extendFunc, curKey, type, _this.properties[curKey]).bind(_this),
                    configurable: true
                };
                Object.defineProperty(_this.properties[curKey], extendFunc, descriptor);
            });
        }
        // eslint-disable-next-line
        if (!this.properties[curKey].hasOwnProperty('isComplexArray')) {
            Object.defineProperty(this.properties[curKey], 'isComplexArray', { value: true });
        }
        return this.properties[curKey];
    };
}
/**
 *
 * @param {Object[]} defaultValue ?
 * @param {string} curKey ?
 * @param {Object[]} type ?
 * @returns {void} ?
 */
function complexArraySetter(defaultValue, curKey, type) {
    return function (newValue) {
        this.isComplexArraySetter = true;
        var oldValueCollection = getObjectArray(this, curKey, defaultValue, type, false);
        var newValCollection = getObjectArray(this, curKey, newValue, type, true);
        this.isComplexArraySetter = false;
        this.saveChanges(curKey, newValCollection, oldValueCollection);
        this.properties[curKey] = newValCollection;
    };
}
/**
 *
 * @param {Object[]} defaultValue ?
 * @param {string} curKey ?
 * @param {Object[]} type ?
 * @returns {void} ?
 */
function complexArrayFactorySetter(defaultValue, curKey, type) {
    return function (newValue) {
        // eslint-disable-next-line
        var oldValueCollection = this.properties.hasOwnProperty(curKey) ? this.properties[curKey] : defaultValue;
        var newValCollection = getObjectArray(this, curKey, newValue, type, true, true);
        this.saveChanges(curKey, newValCollection, oldValueCollection);
        this.properties[curKey] = newValCollection;
    };
}
/**
 *
 * @param {Object[]} defaultValue ?
 * @param {string} curKey ?
 * @param {FunctionConstructor} type ?
 * @returns {void} ?
 */
function complexArrayFactoryGetter(defaultValue, curKey, type) {
    return function () {
        var curType = type({});
        // eslint-disable-next-line
        if (!this.properties.hasOwnProperty(curKey)) {
            var defCollection = getObjectArray(this, curKey, defaultValue, curType, false);
            this.properties[curKey] = defCollection;
        }
        return this.properties[curKey];
    };
}
/**
 *
 * @param {string} dFunc ?
 * @param {string} curKey ?
 * @param {Object} type ?
 * @param {Object} prop ?
 * @returns {Object} ?
 */
function complexArrayDefinedCallback(dFunc, curKey, type, prop) {
    /* tslint:disable no-function-expression */
    return function () {
        var newValue = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            newValue[_i] = arguments[_i];
        }
        var keyString = this.propName ? this.getParentKey() + '.' + curKey + '-' : curKey + '-';
        switch (dFunc) {
            case 'push':
                for (var i = 0; i < newValue.length; i++) {
                    Array.prototype[dFunc].apply(prop, [newValue[i]]);
                    var model_1 = getArrayModel(keyString + (prop.length - 1), newValue[i], !this.controlParent, dFunc);
                    this.serverDataBind(model_1, newValue[i], false, dFunc);
                }
                break;
            case 'pop':
                Array.prototype[dFunc].apply(prop);
                // eslint-disable-next-line
                var model = getArrayModel(keyString + prop.length, null, !this.controlParent, dFunc);
                this.serverDataBind(model, { ejsAction: 'pop' }, false, dFunc);
                break;
        }
        return prop;
    };
}
/**
 *
 * @param {string} keyString ?
 * @param {Object} value ?
 * @param {boolean} isControlParent ?
 * @param {string} arrayFunction ?
 * @returns {Object} ?
 */
function getArrayModel(keyString, value, isControlParent, arrayFunction) {
    var modelObject = keyString;
    if (isControlParent) {
        modelObject = {};
        modelObject[keyString] = value;
        if (value && typeof value === 'object') {
            var action = 'ejsAction';
            modelObject[keyString][action] = arrayFunction;
        }
    }
    return modelObject;
}
// eslint-disable-next-line
/**
 * Method used to create property. General syntax below.
 *
 * @param {Object} defaultValue - Specifies the default value of property.
 * @returns {PropertyDecorator} ?
 * ```
 * @Property('TypeScript')
 * propertyName: Type;
 * ```
 * @private
 */
export function Property(defaultValue) {
    return function (target, key) {
        var propertyDescriptor = {
            set: propertySetter(defaultValue, key),
            get: propertyGetter(defaultValue, key),
            enumerable: true,
            configurable: true
        };
        //new property creation
        Object.defineProperty(target, key, propertyDescriptor);
        addPropertyCollection(target, key, 'prop', defaultValue);
    };
}
/**
 * Method used to create complex property. General syntax below.
 *
 * @param  {any} defaultValue - Specifies the default value of property.
 * @param  {Function} type - Specifies the class type of complex object.
 * @returns {PropertyDecorator} ?
 * ```
 * @Complex<Type>({},Type)
 * propertyName: Type;
 * ```
 * @private
 */
export function Complex(defaultValue, type) {
    return function (target, key) {
        var propertyDescriptor = {
            set: complexSetter(defaultValue, key, type),
            get: complexGetter(defaultValue, key, type),
            enumerable: true,
            configurable: true
        };
        //new property creation
        Object.defineProperty(target, key, propertyDescriptor);
        addPropertyCollection(target, key, 'complexProp', defaultValue, type);
    };
}
/**
 * Method used to create complex Factory property. General syntax below.
 *
 * @param  {Function} type - Specifies the class factory type of complex object.
 * @returns {PropertyDecorator} ?
 * ```
 * @ComplexFactory(defaultType, factoryFunction)
 * propertyName: Type1 | Type2;
 * ```
 * @private
 */
export function ComplexFactory(type) {
    return function (target, key) {
        var propertyDescriptor = {
            set: complexFactorySetter({}, key, type),
            get: complexFactoryGetter({}, key, type),
            enumerable: true,
            configurable: true
        };
        //new property creation
        Object.defineProperty(target, key, propertyDescriptor);
        addPropertyCollection(target, key, 'complexProp', {}, type);
    };
}
/**
 * Method used to create complex array property. General syntax below.
 *
 * @param  {any} defaultValue - Specifies the default value of property.
 * @param  {Function} type - Specifies the class type of complex object.
 * @returns {PropertyDecorator} ?
 * ```
 * @Collection([], Type);
 * propertyName: Type;
 * ```
 * @private
 */
export function Collection(defaultValue, type) {
    return function (target, key) {
        var propertyDescriptor = {
            set: complexArraySetter(defaultValue, key, type),
            get: complexArrayGetter(defaultValue, key, type),
            enumerable: true,
            configurable: true
        };
        //new property creation
        Object.defineProperty(target, key, propertyDescriptor);
        addPropertyCollection(target, key, 'colProp', defaultValue, type);
    };
}
/**
 * Method used to create complex factory array property. General syntax below.
 *
 * @param  {Function} type - Specifies the class type of complex object.
 * @returns {PropertyCollectionInfo} ?
 * ```
 * @Collection([], Type);
 * propertyName: Type;
 * ```
 * @private
 */
export function CollectionFactory(type) {
    return function (target, key) {
        var propertyDescriptor = {
            set: complexArrayFactorySetter([], key, type),
            get: complexArrayFactoryGetter([], key, type),
            enumerable: true,
            configurable: true
        };
        //new property creation
        Object.defineProperty(target, key, propertyDescriptor);
        addPropertyCollection(target, key, 'colProp', {}, type);
    };
}
/**
 * Method used to create event property. General syntax below.
 *
 * @returns {PropertyDecorator} ?
 * ```
 * @Event(()=>{return true;})
 * ```
 * @private
 */
export function Event() {
    return function (target, key) {
        var eventDescriptor = {
            set: function (newValue) {
                var oldValue = this.properties[key];
                if (oldValue !== newValue) {
                    var finalContext = getParentContext(this, key);
                    if (isUndefined(oldValue) === false) {
                        finalContext.context.removeEventListener(finalContext.prefix, oldValue);
                    }
                    finalContext.context.addEventListener(finalContext.prefix, newValue);
                    this.properties[key] = newValue;
                }
            },
            get: propertyGetter(undefined, key),
            enumerable: true,
            configurable: true
        };
        Object.defineProperty(target, key, eventDescriptor);
        addPropertyCollection(target, key, 'event');
    };
}
/**
 * NotifyPropertyChanges is triggers the call back when the property has been changed.
 *
 * @param {Function} classConstructor ?
 * @returns {void} ?
 * ```
 *  @NotifyPropertyChanges
 * class DemoClass implements INotifyPropertyChanged {
 *
 *     @Property()
 *     property1: string;
 *
 *     dataBind: () => void;
 *
 *     constructor() { }
 *
 *     onPropertyChanged(newProp: any, oldProp: any) {
 *         // Called when property changed
 *     }
 * }
 * ```
 * @private
 */
// eslint-disable-next-line
export function NotifyPropertyChanges(classConstructor) {
    /** Need to code */
}
/**
 * Method  used to create the builderObject for the target component.
 *
 * @param {BuildInfo} target ?
 * @param {string} key ?
 * @param {string} propertyType ?
 * @param {Object} defaultValue ?
 * @param {Function} type ?
 * @returns {void} ?
 * @private
 */
function addPropertyCollection(target, key, propertyType, defaultValue, type) {
    if (isUndefined(target.propList)) {
        target.propList = {
            props: [],
            complexProps: [],
            colProps: [],
            events: [],
            propNames: [],
            complexPropNames: [],
            colPropNames: [],
            eventNames: []
        };
    }
    // eslint-disable-next-line
    target.propList[propertyType + 's'].push({
        propertyName: key,
        defaultValue: defaultValue,
        type: type
    });
    // eslint-disable-next-line
    target.propList[propertyType + 'Names'].push(key);
}
/**
 * Returns an object containing the builder properties
 *
 * @param {Function} component ?
 * @returns {Object} ?
 * @private
 */
function getBuilderProperties(component) {
    if (isUndefined(component.prototype.builderObject)) {
        component.prototype.builderObject = {
            properties: {}, propCollections: [], add: function () {
                this.isPropertyArray = true;
                this.propCollections.push(extend({}, this.properties, {}));
            }
        };
        var rex = /complex/;
        for (var _i = 0, _a = Object.keys(component.prototype.propList); _i < _a.length; _i++) {
            var key = _a[_i];
            var _loop_1 = function (prop) {
                if (rex.test(key)) {
                    component.prototype.builderObject[prop.propertyName] = function (value) {
                        var childType = {};
                        merge(childType, getBuilderProperties(prop.type));
                        value(childType);
                        var tempValue;
                        if (!childType.isPropertyArray) {
                            tempValue = extend({}, childType.properties, {});
                        }
                        else {
                            tempValue = childType.propCollections;
                        }
                        this.properties[prop.propertyName] = tempValue;
                        childType.properties = {};
                        childType.propCollections = [];
                        childType.isPropertyArray = false;
                        return this;
                    };
                }
                else {
                    component.prototype.builderObject[prop.propertyName] = function (value) {
                        this.properties[prop.propertyName] = value;
                        return this;
                    };
                }
            };
            for (var _b = 0, _c = component.prototype.propList[key]; _b < _c.length; _b++) {
                var prop = _c[_b];
                _loop_1(prop);
            }
        }
    }
    return component.prototype.builderObject;
}
/**
 * Method used to create builder for the components
 *
 * @param {any} component -specifies the target component for which builder to be created.
 * @returns {Object} ?
 * @private
 */
export function CreateBuilder(component) {
    var builderFunction = function (element) {
        this.element = element;
        return this;
    };
    var instanceFunction = function (element) {
        // eslint-disable-next-line
        if (!builderFunction.prototype.hasOwnProperty('create')) {
            builderFunction.prototype = getBuilderProperties(component);
            builderFunction.prototype.create = function () {
                var temp = extend({}, {}, this.properties);
                this.properties = {};
                return new component(temp, this.element);
            };
        }
        return new builderFunction(element);
    };
    return instanceFunction;
}
/**
 * Returns parent options for the object
 *
 * @param {Object} context ?
 * @param {string} prefix ?
 * @returns {ParentOption} ?
 * @private
 */
function getParentContext(context, prefix) {
    // eslint-disable-next-line
    if (context.hasOwnProperty('parentObj') === false) {
        return { context: context, prefix: prefix };
    }
    else {
        var curText = getValue('propName', context);
        if (curText) {
            prefix = curText + '-' + prefix;
        }
        return getParentContext(getValue('parentObj', context), prefix);
    }
}
