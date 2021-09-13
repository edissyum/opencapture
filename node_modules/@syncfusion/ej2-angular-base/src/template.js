import { setTemplateEngine, getTemplateEngine } from '@syncfusion/ej2-base';
import { setValue, getValue } from '@syncfusion/ej2-base';
var stringCompiler = getTemplateEngine();
/**
 * Angular Template Compiler
 */
export function compile(templateEle, helper) {
    if (typeof templateEle === 'string') {
        return stringCompiler(templateEle, helper);
    }
    else {
        var contRef_1 = templateEle.elementRef.nativeElement._viewContainerRef;
        var pName_1 = templateEle.elementRef.nativeElement.propName;
        //tslint:disable-next-line        
        return function (data, component, propName) {
            var context = { $implicit: data };
            /* istanbul ignore next */
            var conRef = contRef_1 ? contRef_1 : component.viewContainerRef;
            var viewRef = conRef.createEmbeddedView(templateEle, context);
            viewRef.markForCheck();
            /* istanbul ignore next */
            var viewCollection = (component && component.registeredTemplate) ?
                component.registeredTemplate : getValue('currentInstance.registeredTemplate', conRef);
            propName = (propName && component.registeredTemplate) ? propName : pName_1;
            if (typeof viewCollection[propName] === 'undefined') {
                viewCollection[propName] = [];
            }
            viewCollection[propName].push(viewRef);
            return viewRef.rootNodes;
        };
    }
}
/**
 * Property decorator for angular.
 */
export function Template(defaultValue) {
    return function (target, key) {
        var propertyDescriptor = {
            set: setter(key),
            get: getter(key, defaultValue),
            enumerable: true,
            configurable: true
        };
        Object.defineProperty(target, key, propertyDescriptor);
    };
}
function setter(key) {
    return function (val) {
        if (val === undefined) {
            return;
        }
        setValue(key + 'Ref', val, this);
        if (typeof val !== 'string') {
            val.elementRef.nativeElement._viewContainerRef = this.viewContainerRef;
            val.elementRef.nativeElement.propName = key;
        }
        else {
            if (this.saveChanges) {
                this.saveChanges(key, val, undefined);
                this.dataBind();
            }
        }
    };
}
function getter(key, defaultValue) {
    return function () {
        /* istanbul ignore next */
        return getValue(key + 'Ref', this) || defaultValue;
    };
}
//tslint:disable-next-line
setTemplateEngine({ compile: compile });
