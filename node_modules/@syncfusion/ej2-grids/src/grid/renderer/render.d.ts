import { IGrid, NotifyArgs } from '../base/interface';
import { ReturnType } from '../base/type';
import { Data } from '../actions/data';
import { ServiceLocator } from '../services/service-locator';
/**
 * Content module is used to render grid content
 *
 * @hidden
 */
export declare class Render {
    private isColTypeDef;
    private parent;
    private locator;
    private headerRenderer;
    private contentRenderer;
    private l10n;
    data: Data;
    private ariaService;
    private renderer;
    private emptyGrid;
    private isLayoutRendered;
    private counter;
    /**
     * Constructor for render module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {ServiceLocator} locator - specifies the serviceLocator
     */
    constructor(parent?: IGrid, locator?: ServiceLocator);
    /**
     * To initialize grid header, content and footer rendering
     *
     * @returns {void}
     */
    render(): void;
    /**
     * Refresh the entire Grid.
     *
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     */
    refresh(e?: NotifyArgs): void;
    /**
     * @returns {void}
     * @hidden
     */
    resetTemplates(): void;
    private refreshComplete;
    /**
     * The function is used to refresh the dataManager
     *
     * @param {NotifyArgs} args - specifies the args
     * @returns {void}
     */
    private refreshDataManager;
    private getFData;
    private isNeedForeignAction;
    private foreignKey;
    private sendBulkRequest;
    private dmSuccess;
    private dmFailure;
    /**
     * Render empty row to Grid which is used at the time to represent to no records.
     *
     * @returns {void}
     * @hidden
     */
    renderEmptyRow(): void;
    emptyRow(isTrigger?: boolean): void;
    private dynamicColumnChange;
    private updateColumnType;
    /**
     * @param {ReturnType} e - specifies the return type
     * @param {NotifyArgs} args - specifies the Notifyargs
     * @returns {void}
     * @hidden
     */
    dataManagerSuccess(e: ReturnType, args?: NotifyArgs): void;
    /**
     * @param {object} e - specifies the object
     * @param {Object[]} e.result - specifies the result
     * @param {NotifyArgs} args - specifies the args
     * @returns {void}
     * @hidden
     */
    dataManagerFailure(e: {
        result: Object[];
    }, args: NotifyArgs): void;
    private setRowCount;
    private isInfiniteEnd;
    private updatesOnInitialRender;
    private iterateComplexColumns;
    private buildColumns;
    private instantiateRenderer;
    private addEventListener;
    /**
     * @param {ReturnType} e - specifies the Return type
     * @returns {Promise<Object>} returns the object
     * @hidden
     */
    validateGroupRecords(e: ReturnType): Promise<Object>;
    private getPredicate;
    private updateGroupInfo;
}
