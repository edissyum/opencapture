import { IGrid, IAction } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
/**
 * Group lazy load class
 */
export declare class LazyLoadGroup implements IAction {
    private parent;
    private serviceLocator;
    /**
     * Constructor for Grid group lazy load module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {ServiceLocator} serviceLocator - specifies the ServiceLocator
     * @hidden
     */
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator);
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    protected getModuleName(): string;
    /**
     * @returns {void}
     * @hidden
     */
    addEventListener(): void;
    /**
     * @returns {void}
     * @hidden
     */
    removeEventListener(): void;
    private instantiateRenderer;
    /**
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
