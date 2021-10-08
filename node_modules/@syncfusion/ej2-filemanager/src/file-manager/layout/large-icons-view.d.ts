import { ListBaseOptions } from '@syncfusion/ej2-lists';
import { TouchEventArgs, MouseEventArgs, KeyboardEventArgs } from '@syncfusion/ej2-base';
import { IFileManager } from '../base/interface';
/**
 * LargeIconsView module
 */
export declare class LargeIconsView {
    private parent;
    element: HTMLElement;
    listObj: ListBaseOptions;
    private keyboardModule;
    private keyboardDownModule;
    private keyConfigs;
    private isInteraction;
    private itemList;
    private items;
    private clickObj;
    private perRow;
    private startItem;
    private multiSelect;
    listElements: HTMLElement;
    uploadOperation: boolean;
    private count;
    private isRendered;
    private tapCount;
    private tapEvent;
    private isPasteOperation;
    private dragObj;
    private isInteracted;
    /**
     * Constructor for the LargeIcons module.
     *
     * @param {IFileManager} parent - specifies the parent element.
     * @hidden
     */
    constructor(parent?: IFileManager);
    private render;
    private preventImgDrag;
    private createDragObj;
    dragHelper(args: {
        element: HTMLElement;
        sender: MouseEvent & TouchEvent;
    }): HTMLElement;
    private onDropInit;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the module name.
     * @private
     */
    private getModuleName;
    private adjustHeight;
    private onItemCreated;
    private renderCheckbox;
    private onLayoutChange;
    private checkItem;
    private renderList;
    private onFinalizeEnd;
    private onCreateEnd;
    private onSelectedData;
    private onDeleteInit;
    private onDeleteEnd;
    private onRefreshEnd;
    private onRenameInit;
    private onPathChanged;
    private onOpenInit;
    private onHideLayout;
    private onSelectAllInit;
    private onClearAllInit;
    private onBeforeRequest;
    private onAfterRequest;
    private onSearch;
    private onLayoutRefresh;
    private onUpdateSelectionData;
    private onPathColumn;
    private removeEventListener;
    private addEventListener;
    private onActionFailure;
    private onMenuItemData;
    private onDetailsInit;
    private onpasteInit;
    private oncutCopyInit;
    private onpasteEnd;
    private onDropPath;
    private onPropertyChanged;
    destroy(): void;
    private wireEvents;
    private unWireEvents;
    private onMouseOver;
    private wireClickEvent;
    private doTapAction;
    private clickHandler;
    /**
     *
     * @param {Element} target - specifies the target element.
     * @param {TouchEventArgs | MouseEventArgs | KeyboardEventArgs} e - specifies event arguements.
     * @returns {void}
     * @hidden
     */
    doSelection(target: Element, e: TouchEventArgs | MouseEventArgs | KeyboardEventArgs): void;
    private dblClickHandler;
    private clearSelection;
    private resetMultiSelect;
    private doOpenAction;
    private updateType;
    private keydownActionHandler;
    private keyActionHandler;
    private doDownload;
    private performDelete;
    private performRename;
    private updateRenameData;
    private getVisitedItem;
    private getFocusedItem;
    private getActiveItem;
    private getFirstItem;
    private getLastItem;
    private navigateItem;
    private navigateDown;
    private navigateRight;
    private getNextItem;
    private setFocus;
    private spaceKey;
    private ctrlAKey;
    private csEndKey;
    private csHomeKey;
    private csDownKey;
    private csLeftKey;
    private csRightKey;
    private csUpKey;
    private addActive;
    private removeActive;
    private getDataName;
    private addFocus;
    private checkState;
    private clearSelect;
    private resizeHandler;
    private splitterResizeHandler;
    private getItemCount;
    private triggerSelection;
    private triggerSelect;
    private selectItems;
    private getIndexes;
    private getItemObject;
    private addSelection;
    private updateSelectedData;
    private onMethodCall;
    private getItemsIndex;
    private deleteFiles;
    private downloadFiles;
    private openFile;
    private renameFile;
}
