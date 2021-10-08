import { SortSettings } from '../base/grid';
import { IGrid, IAction, NotifyArgs } from '../base/interface';
import { SortDirection } from '../base/enum';
import { ServiceLocator } from '../services/service-locator';
import { ResponsiveDialogRenderer } from '../renderer/responsive-dialog-renderer';
/**
 *
 * The `Sort` module is used to handle sorting action.
 */
export declare class Sort implements IAction {
    private columnName;
    private direction;
    private isMultiSort;
    private lastSortedCol;
    private sortSettings;
    private enableSortMultiTouch;
    private contentRefresh;
    private isRemove;
    private sortedColumns;
    private isModelChanged;
    private aria;
    private focus;
    private lastSortedCols;
    private lastCols;
    private evtHandlers;
    /** @hidden */
    parent: IGrid;
    private currentTarget;
    /** @hidden */
    responsiveDialogRenderer: ResponsiveDialogRenderer;
    /** @hidden */
    serviceLocator: ServiceLocator;
    /**
     * Constructor for Grid sorting module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {SortSettings} sortSettings - specifies the SortSettings
     * @param {string[]} sortedColumns - specifies the string
     * @param {ServiceLocator} locator - specifies the ServiceLocator
     * @hidden
     */
    constructor(parent?: IGrid, sortSettings?: SortSettings, sortedColumns?: string[], locator?: ServiceLocator);
    /**
     * The function used to update sortSettings
     *
     * @returns {void}
     * @hidden
     */
    updateModel(): void;
    /**
     * The function used to trigger onActionComplete
     *
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    onActionComplete(e: NotifyArgs): void;
    /**
     * Sorts a column with the given options.
     *
     * @param {string} columnName - Defines the column name to sort.
     * @param {SortDirection} direction - Defines the direction of sorting field.
     * @param {boolean} isMultiSort - Specifies whether the previously sorted columns are to be maintained.
     * @returns {void}
     */
    sortColumn(columnName: string, direction: SortDirection, isMultiSort?: boolean): void;
    private setFullScreenDialog;
    private backupSettings;
    private restoreSettings;
    private updateSortedCols;
    /**
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    onPropertyChanged(e: NotifyArgs): void;
    private refreshSortSettings;
    /**
     * Clears all the sorted columns of the Grid.
     *
     * @returns {void}
     */
    clearSorting(): void;
    private isActionPrevent;
    /**
     * Remove sorted column by field name.
     *
     * @param {string} field - Defines the column field name to remove sort.
     * @returns {void}
     * @hidden
     */
    removeSortColumn(field: string): void;
    private getSortedColsIndexByField;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    protected getModuleName(): string;
    private initialEnd;
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
    /**
     * To destroy the sorting
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    private cancelBeginEvent;
    private clickHandler;
    private keyPressed;
    private initiateSort;
    private showPopUp;
    private popUpClickHandler;
    private addSortIcons;
    private removeSortIcons;
    private getSortColumnFromField;
    private updateAriaAttr;
    private refreshSortIcons;
    /**
     * To show the responsive custom sort dialog
     *
     * @param {boolean} enable - specifes dialog open
     * @returns {void}
     * @hidden
     */
    showCustomSort(enable: boolean): void;
}
