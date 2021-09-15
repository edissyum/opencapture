import { IGrid, IAction } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
/**
 * `Freeze` module is used to handle Frozen rows and columns.
 *
 * @hidden
 */
export declare class Freeze implements IAction {
    private locator;
    private parent;
    constructor(parent: IGrid, locator?: ServiceLocator);
    getModuleName(): string;
    addEventListener(): void;
    private instantiateRenderer;
    removeEventListener(): void;
    destroy(): void;
}
