import { PivotView } from '../../pivotview/base/pivotview';
import { IAction } from '../../common/base/interface';
/**
 * Module for PivotCommon rendering
 */
/** @hidden */
export declare class Common implements IAction {
    private parent;
    private handlers;
    constructor(parent: PivotView);
    /**
     * For internal use only - Get the module name.
     * @private
     */
    protected getModuleName(): string;
    private initiateCommonModule;
    /**
     * @hidden
     */
    addEventListener(): void;
    /**
     * @hidden
     */
    removeEventListener(): void;
    /**
     * To destroy the groupingbar
     * @returns {void}
     * @hidden
     */
    destroy(): void;
}
