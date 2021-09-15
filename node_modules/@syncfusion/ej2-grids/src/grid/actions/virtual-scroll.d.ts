import { IGrid, IAction } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
/**
 * Virtual Scrolling class
 */
export declare class VirtualScroll implements IAction {
    private parent;
    private blockSize;
    private locator;
    constructor(parent: IGrid, locator?: ServiceLocator);
    getModuleName(): string;
    private instantiateRenderer;
    ensurePageSize(): void;
    addEventListener(): void;
    removeEventListener(): void;
    private getCurrentEditedData;
    private createVirtualValidationForm;
    private virtualEditFormValidation;
    private scrollToEdit;
    private setEditedDataToValidationForm;
    private refreshVirtualElement;
    destroy(): void;
}
