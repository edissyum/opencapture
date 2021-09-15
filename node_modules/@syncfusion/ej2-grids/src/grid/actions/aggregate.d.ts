import { IAction, IGrid, NotifyArgs } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
import { AggregateRowModel } from '../models/models';
/**
 * Summary Action controller.
 */
export declare class Aggregate implements IAction {
    private parent;
    private locator;
    private footerRenderer;
    constructor(parent: IGrid, locator?: ServiceLocator);
    getModuleName(): string;
    private initiateRender;
    /**
     * @returns {void}
     * @hidden
     */
    prepareSummaryInfo(): void;
    onPropertyChanged(e: NotifyArgs): void;
    addEventListener(): void;
    removeEventListener(): void;
    destroy(): void;
    refresh(data: Object): void;
}
/**
 * @param {AggregateRowModel[]} aggregates - specifies the AggregateRowModel
 * @param {Function} callback - specifies the Function
 * @returns {void}
 * @private
 */
export declare function summaryIterator(aggregates: AggregateRowModel[], callback: Function): void;
