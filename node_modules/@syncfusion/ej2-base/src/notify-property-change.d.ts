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
export declare function Property<T>(defaultValue?: T | Object): PropertyDecorator;
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
export declare function Complex<T>(defaultValue: T, type: Function): PropertyDecorator;
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
export declare function ComplexFactory(type: Function): PropertyDecorator;
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
export declare function Collection<T>(defaultValue: T[], type: Function): PropertyDecorator;
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
export declare function CollectionFactory(type: Function): PropertyDecorator;
/**
 * Method used to create event property. General syntax below.
 *
 * @returns {PropertyDecorator} ?
 * ```
 * @Event(()=>{return true;})
 * ```
 * @private
 */
export declare function Event(): PropertyDecorator;
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
export declare function NotifyPropertyChanges(classConstructor: Function): void;
/**
 * Interface to notify the changed properties
 */
export interface INotifyPropertyChanged {
    onPropertyChanged(newProperties: Object, oldProperties?: Object): void;
}
/**
 * Method used to create builder for the components
 *
 * @param {any} component -specifies the target component for which builder to be created.
 * @returns {Object} ?
 * @private
 */
export declare function CreateBuilder<T>(component: T): Object;
