/**
 * Angular Utility Module
 */
export declare function applyMixins(derivedClass: any, baseClass: any[]): void;
export declare function ComponentMixins(baseClass: Function[]): ClassDecorator;
/**
 * @private
 */
export declare function registerEvents(eventList: string[], obj: any, direct?: boolean): void;
/**
 * @private
 */
export declare function clearTemplate(_this: any, templateNames?: string[], index?: any): void;
/**
 * To set value for the nameSpace in desired object.
 * @param {string} nameSpace - String value to the get the inner object
 * @param {any} value - Value that you need to set.
 * @param {any} obj - Object to get the inner object value.
 * @return {void}
 * @private
 */
export declare function setValue(nameSpace: string, value: any, object: any): any;
export interface PropertyCollectionInfo {
    props: PropertyDetails[];
    complexProps: PropertyDetails[];
    colProps: PropertyDetails[];
    events: PropertyDetails[];
    propNames: string[];
    complexPropNames: string[];
    colPropNames: string[];
    eventNames: string[];
}
export interface PropertyDetails {
    propertyName: string;
    type: FunctionConstructor | Object;
    defaultValue: Object;
}
