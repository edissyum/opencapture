import { PivotView } from '../../pivotview/base/pivotview';
import { IAction } from '../../common/base/interface';
/**
 * Module for Field List rendering
 */
/** @hidden */
export declare class FieldList implements IAction {
    /**
     * Module declarations
     */
    private parent;
    private element;
    private handlers;
    private timeOutObj;
    /** Constructor for Field List module */
    constructor(parent: PivotView);
    /**
     * For internal use only - Get the module name.
     * @private
     */
    protected getModuleName(): string;
    private initiateModule;
    private updateControl;
    private update;
    /**
     * @hidden
     */
    addEventListener(): void;
    /**
     * @hidden
     */
    removeEventListener(): void;
    /**
     * To destroy the Field List.
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
