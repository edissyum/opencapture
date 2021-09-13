import { getValue, setValue, isNullOrUndefined } from '@syncfusion/ej2-base';
import { clearTemplate, registerEvents } from './util';
var refRegex = /Ref$/;
var ComplexBase = /** @class */ (function () {
    function ComplexBase() {
        this.hasChanges = false;
        this.propCollection = {};
        this.dataSource = {};
        this.tags = [];
        this.tagObjects = [];
    }
    ComplexBase.prototype.ngOnInit = function () {
        this.registeredTemplate = {};
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            var objInstance = getValue('child' + tag.substring(0, 1).toUpperCase() + tag.substring(1), this);
            if (objInstance) {
                this.tagObjects.push({ instance: objInstance, name: tag });
            }
        }
        var templateProperties = Object.keys(this);
        templateProperties = templateProperties.filter(function (val) {
            return /Ref$/i.test(val);
        });
        for (var _b = 0, templateProperties_1 = templateProperties; _b < templateProperties_1.length; _b++) {
            var tempName = templateProperties_1[_b];
            var propName = tempName.replace('Ref', '');
            setValue(propName.replace('_', '.'), getValue(propName, this), this.propCollection);
        }
        // Angular 9 compatibility to overcome ngOnchange not get triggered issue
        // To Update properties to "this.propCollection"
        var propList = Object.keys(this);
        /* istanbul ignore next */
        if (this.directivePropList) {
            for (var k = 0; k < this.directivePropList.length; k++) {
                var dirPropName = this.directivePropList[k];
                if (propList.indexOf(dirPropName) !== -1) {
                    setValue(dirPropName, getValue(dirPropName, this), this.propCollection);
                }
            }
            this.hasChanges = true;
        }
        this.isInitChanges = true;
    };
    ComplexBase.prototype.registerEvents = function (eventList) {
        registerEvents(eventList, this, true);
    };
    ComplexBase.prototype.ngOnChanges = function (changes) {
        for (var _i = 0, _a = Object.keys(changes); _i < _a.length; _i++) {
            var propName = _a[_i];
            var changedVal = changes[propName];
            this.propCollection[propName] = changedVal.currentValue;
        }
        this.isUpdated = false;
        this.hasChanges = true;
    };
    /* istanbul ignore next */
    ComplexBase.prototype.clearTemplate = function (templateNames) {
        clearTemplate(this, templateNames);
    };
    ComplexBase.prototype.getProperties = function () {
        /* istanbul ignore next */
        for (var _i = 0, _a = this.tagObjects; _i < _a.length; _i++) {
            var tagObject = _a[_i];
            this.propCollection[tagObject.name] = tagObject.instance.getProperties();
        }
        return this.propCollection;
    };
    ComplexBase.prototype.isChanged = function () {
        var result = this.hasChanges;
        if (!isNullOrUndefined(this.propCollection[this.property])) {
            var tempProps = this.propCollection[this.property];
            var props = Object.keys(tempProps[0]);
            for (var d = 0; d < props.length; d++) {
                if (!isNullOrUndefined(this.propCollection[props[d]])) {
                    var val = getValue(props[d], this);
                    var propVal = this.propCollection[this.property][0][props[d]];
                    if (!isNullOrUndefined(val) && this.propCollection[props[d]] !== val
                        && propVal !== val) {
                        setValue(props[d], val, this.propCollection[this.property][0]);
                        setValue(props[d], val, this.propCollection);
                        this.hasChanges = true;
                        this.isUpdated = false;
                    }
                }
            }
        }
        /* istanbul ignore next */
        for (var _i = 0, _a = this.tagObjects; _i < _a.length; _i++) {
            var item = _a[_i];
            result = result || item.instance.hasChanges;
        }
        return result || this.hasChanges;
    };
    ComplexBase.prototype.ngAfterContentChecked = function () {
        this.hasChanges = this.isChanged();
        if (this.isInitChanges || this.hasChanges) {
            var templateProperties = Object.keys(this);
            templateProperties = templateProperties.filter(function (val) {
                return refRegex.test(val);
            });
            for (var _i = 0, templateProperties_2 = templateProperties; _i < templateProperties_2.length; _i++) {
                var tempName = templateProperties_2[_i];
                var propName = tempName.replace('Ref', '');
                setValue(propName.replace('_', '.'), getValue(propName, this), this.propCollection);
            }
        }
    };
    ComplexBase.prototype.ngAfterViewChecked = function () {
        /* istanbul ignore next */
        if (this.isUpdated) {
            this.hasChanges = false;
        }
    };
    ComplexBase.prototype.ngAfterViewInit = function () {
        /* istanbul ignore next */
        this.isInitChanges = false;
    };
    ComplexBase.prototype.ngOnDestroy = function () {
        /* istanbul ignore next */
        this.directivePropList = [];
    };
    return ComplexBase;
}());
export { ComplexBase };
var ArrayBase = /** @class */ (function () {
    function ArrayBase(propertyName) {
        this.list = [];
        this.hasChanges = false;
        this.propertyName = propertyName;
    }
    ArrayBase.prototype.ngOnInit = function () {
        this.isInitChanges = true;
    };
    ArrayBase.prototype.ngAfterContentInit = function () {
        var _this = this;
        var index = 0;
        /* istanbul ignore next */
        this.list = this.children.map(function (child) {
            child.dirIndex = index++;
            child.property = _this.propertyName;
            return child;
        });
        this.hasChanges = true;
    };
    ArrayBase.prototype.getProperties = function () {
        var onlyProp = [];
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var item = _a[_i];
            onlyProp.push(item.getProperties());
        }
        return onlyProp;
    };
    ArrayBase.prototype.isChanged = function () {
        var _this = this;
        var result = false;
        var index = 0;
        var isSourceChanged = false;
        // tslint:disable-next-line
        var childrenDataSource = this.children.map(function (child) {
            return child;
        });
        /* istanbul ignore next */
        if (this.list.length === this.children.length) {
            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i].propCollection.dataSource) {
                    if (this.list[i].dataSource && this.list[i].propCollection.dataSource !== this.list[i].dataSource) {
                        this.list[i].propCollection.dataSource = this.list[i].dataSource;
                        this.list[i].hasChanges = true;
                    }
                    isSourceChanged = (JSON.stringify(this.list[i].propCollection.dataSource) !==
                        JSON.stringify(childrenDataSource[i].propCollection.dataSource));
                }
            }
        }
        this.hasNewChildren = (this.list.length !== this.children.length || isSourceChanged) ? true : null;
        if (this.hasNewChildren) {
            this.list = this.children.map(function (child) {
                child.dirIndex = index++;
                child.property = _this.propertyName;
                return child;
            });
        }
        /* istanbul ignore end */
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var item = _a[_i];
            result = result || item.hasChanges;
        }
        return !!this.list.length && result;
    };
    ArrayBase.prototype.clearTemplate = function (templateNames) {
        var _this = this;
        /* istanbul ignore next */
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var item = _a[_i];
            item.clearTemplate(templateNames && templateNames.map(function (val) {
                return new RegExp(_this.propertyName).test(val) ? val.replace(_this.propertyName + '.', '') : val;
            }));
        }
    };
    ArrayBase.prototype.ngAfterContentChecked = function () {
        this.hasChanges = this.isChanged();
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].isUpdated = true;
        }
    };
    ArrayBase.prototype.ngAfterViewInit = function () {
        this.isInitChanges = false;
    };
    ArrayBase.prototype.ngOnDestroy = function () {
        this.list = [];
    };
    return ArrayBase;
}());
export { ArrayBase };
