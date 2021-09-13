import { ElementRef } from '@angular/core';
/**
 * Angular Template Compiler
 */
export declare function compile(templateEle: AngularElementType, helper?: Object): (data: Object | JSON, component?: any, propName?: any) => Object;
/**
 * Property decorator for angular.
 */
export declare function Template<T>(defaultValue?: Object): PropertyDecorator;
export interface AngularElementType {
    elementRef: ElementRef;
}
