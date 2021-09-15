import { ServiceLocator } from '../services/service-locator';
import { IGrid, IAction } from '../base/interface';
import { ShowHide } from './show-hide';
/**
 * The `ColumnChooser` module is used to show or hide columns dynamically.
 */
export declare class ColumnChooser implements IAction {
    private parent;
    private serviceLocator;
    private l10n;
    private dlgObj;
    private searchValue;
    private flag;
    private timer;
    getShowHideService: ShowHide;
    private showColumn;
    private hideColumn;
    private changedColumns;
    private unchangedColumns;
    private mainDiv;
    private innerDiv;
    private ulElement;
    private isDlgOpen;
    private initialOpenDlg;
    private stateChangeColumns;
    private changedStateColumns;
    private dlgDiv;
    private isInitialOpen;
    private isCustomizeOpenCC;
    private cBoxTrue;
    private cBoxFalse;
    private searchBoxObj;
    private searchOperator;
    private targetdlg;
    private prevShowedCols;
    private hideDialogFunction;
    /**
     * Constructor for the Grid ColumnChooser module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {ServiceLocator} serviceLocator - specifies the serviceLocator
     * @hidden
     */
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator);
    private destroy;
    private rtlUpdate;
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
    private render;
    private clickHandler;
    private hideDialog;
    /**
     * To render columnChooser when showColumnChooser enabled.
     *
     * @param {number} x - specifies the position x
     * @param {number} y - specifies the position y
     * @param {Element} target - specifies the target
     * @returns {void}
     * @hidden
     */
    renderColumnChooser(x?: number, y?: number, target?: Element): void;
    /**
     * Column chooser can be displayed on screen by given position(X and Y axis).
     *
     * @param  {number} X - Defines the X axis.
     * @param  {number} Y - Defines the Y axis.
     * @return {void}
     */
    openColumnChooser(X?: number, Y?: number): void;
    private enableAfterRenderEle;
    private keyUpHandler;
    private customDialogOpen;
    private customDialogClose;
    private getColumns;
    private renderDlgContent;
    private renderChooserList;
    private confirmDlgBtnClick;
    private onResetColumns;
    resetColumnState(): void;
    private changedColumnState;
    private columnStateChange;
    private clearActions;
    private clearBtnClick;
    private checkstatecolumn;
    private columnChooserSearch;
    private wireEvents;
    private unWireEvents;
    private checkBoxClickHandler;
    private updateIntermediateBtn;
    private updateSelectAll;
    private refreshCheckboxButton;
    private refreshCheckboxList;
    private refreshCheckboxState;
    private checkState;
    private createCheckBox;
    private renderCheckbox;
    private columnChooserManualSearch;
    private startTimer;
    private stopTimer;
    private addcancelIcon;
    private removeCancelIcon;
    private mOpenDlg;
    private getModuleName;
    private hideOpenedDialog;
    private beforeOpenColumnChooserEvent;
}
