import { Grid } from '@syncfusion/ej2-grids';
import { FileManager } from '../base/file-manager';
import { RecordDoubleClickEventArgs } from '@syncfusion/ej2-grids';
/**
 * DetailsView module
 */
export declare class DetailsView {
    element: HTMLElement;
    private parent;
    private keyboardModule;
    private keyboardDownModule;
    private keyConfigs;
    private sortItem;
    private isInteracted;
    private interaction;
    private isPasteOperation;
    private isColumnRefresh;
    private clickObj;
    private sortSelectedNodes;
    private emptyArgs;
    private dragObj;
    private startIndex;
    private firstItemIndex;
    private isSelectionUpdate;
    private currentSelectedItem;
    private count;
    private isRendered;
    private isLoaded;
    private isNameWidth;
    gridObj: Grid;
    pasteOperation: boolean;
    uploadOperation: boolean;
    /**
     * Constructor for the GridView module
     *
     * @param {FileManager} parent - specifies the parent.
     * @hidden
     */
    constructor(parent?: FileManager);
    private render;
    private checkNameWidth;
    private adjustWidth;
    private getColumns;
    private adjustHeight;
    private renderCheckBox;
    private onRowDataBound;
    private onActionBegin;
    private onHeaderCellInfo;
    private onBeforeDataBound;
    private onDataBound;
    private selectRecords;
    private addSelection;
    private onSortColumn;
    private onPropertyChanged;
    private onPathChanged;
    private updatePathColumn;
    private checkEmptyDiv;
    private onOpenInit;
    DblClickEvents(args: RecordDoubleClickEventArgs): void;
    openContent(data: Object): void;
    private onLayoutChange;
    private onSearchFiles;
    private removePathColumn;
    private onFinalizeEnd;
    private onCreateEnd;
    private onRenameInit;
    private onSelectedData;
    private onDeleteInit;
    private onDeleteEnd;
    private onRefreshEnd;
    private onHideLayout;
    private onSelectAllInit;
    private onClearAllInit;
    private onSelectionChanged;
    private onLayoutRefresh;
    private onBeforeRequest;
    private onAfterRequest;
    private onUpdateSelectionData;
    private addEventListener;
    private removeEventListener;
    private onActionFailure;
    private onMenuItemData;
    private onPasteInit;
    private onDetailsInit;
    dragHelper(args: {
        element: HTMLElement;
        sender: MouseEvent & TouchEvent;
    }): HTMLElement;
    private onDetailsResize;
    private onDetailsResizeHandler;
    private createDragObj;
    private onDropInit;
    private oncutCopyInit;
    private onpasteEnd;
    private onDropPath;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns modules name.
     * @private
     */
    private getModuleName;
    destroy(): void;
    private updateType;
    private onSelection;
    private onSelected;
    private onPathColumn;
    private selectedRecords;
    private onDeSelection;
    private triggerSelect;
    private wireEvents;
    private unWireEvents;
    private wireClickEvent;
    private removeSelection;
    private removeFocus;
    private getFocusedItemIndex;
    private keydownHandler;
    private keyupHandler;
    gridSelectNodes(): Object[];
    private doDownload;
    private performDelete;
    private performRename;
    private updateRenameData;
    private shiftMoveMethod;
    private moveFunction;
    private spaceSelection;
    private ctrlMoveFunction;
    private checkRowsKey;
    private InnerItems;
    private shiftSelectFocusItem;
    private addFocus;
    private getFocusedItem;
    private isSelected;
    private shiftSelectedItem;
    private onMethodCall;
    private getRecords;
    private deleteFiles;
    private downloadFiles;
    private openFile;
    private renameFile;
}
