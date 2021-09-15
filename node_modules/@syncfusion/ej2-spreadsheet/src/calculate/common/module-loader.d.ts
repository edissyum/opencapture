export interface ModuleDeclaration {
    args: Object[];
    member: string;
    isProperty?: boolean;
}
export interface IParent {
    [key: string]: any;
}
/**
 * To get nameSpace value from the desired object.
 *
 * @param {string} nameSpace - String value to the get the inner object
 * @param {any} obj - Object to get the inner object value.
 * @returns {any} - To get nameSpace value from the desired object.
 * @private
 */
export declare function getValue(nameSpace: string, obj: any): any;
/**
 * To set value for the nameSpace in desired object.
 *
 * @param {string} nameSpace - String value to get the inner object
 * @param {any} value - Value that you need to set.
 * @param {any} obj - Object to get the inner object value.
 * @returns {void} - To set value for the nameSpace in desired object.
 * @private
 */
export declare function setValue(nameSpace: string, value: any, obj: any): any;
export declare class ModuleLoader {
    private parent;
    private loadedModules;
    constructor(parent: IParent);
    /**
     * Inject required modules in component library
     *
     * @param {ModuleDeclaration[]} requiredModules -  specify the required modules
     * @param {Function[]} moduleList - specify the module list
     * @returns {void} - Inject required modules in component library
     * @hidden
     */
    inject(requiredModules: ModuleDeclaration[], moduleList: Function[]): void;
    /**
     * Create Instance from constructor function with desired parameters.
     *
     * @param {Function} classFunction - Class function to which need to create instance
     * @param {any[]} params - Parameters need to passed while creating instance
     * @returns {any} - Create Instance from constructor function with desired parameters.
     * @private
     */
    private createInstance;
    /**
     * To remove the created object while control is destroyed
     *
     * @hidden
     * @returns {void} - To remove the created object while control is destroyed
     */
    clean(): void;
    /**
     * Removes all unused modules
     *
     * @param {ModuleDeclaration[]} moduleListName -  specify the module list name
     * @returns {void} - Removes all unused modules
     */
    private clearUnusedModule;
    /**
     * To get the name of the member.
     *
     * @param {string} name - specify the name
     * @returns {string} - To get the name of the member.
     */
    private getMemberName;
    /**
     * Delete an item from Object
     *
     * @param {any} obj - Object in which we need to delete an item.
     * @param {string} key - String value to the get the inner object
     * @returns {void} - Delete an item from Object
     * @private
     */
    private deleteObject;
    /**
     * Returns boolean based on whether the module specified is loaded or not
     *
     * @param {string} modName - specify the name
     * @returns {boolean} - Returns boolean value
     */
    private isModuleLoaded;
}
