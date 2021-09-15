import { TreeView as BaseTreeView } from '@syncfusion/ej2-navigations';
import { Touch } from '@syncfusion/ej2-base';
import { IFileManager } from '../base/interface';
/**
 * NavigationPane module
 */
export declare class NavigationPane {
    private parent;
    treeObj: BaseTreeView;
    activeNode: Element;
    private keyboardModule;
    private keyConfigs;
    private expandNodeTarget;
    removeNodes: string[];
    moveNames: string[];
    touchClickObj: Touch;
    private expandTree;
    private isDrag;
    private dragObj;
    private isPathDragged;
    private isRenameParent;
    private isRightClick;
    private renameParent;
    /**
     * Constructor for the TreeView module
     *
     * @param {IFileManager} parent - specifies the parent element.
     * @hidden
     */
    constructor(parent?: IFileManager);
    private onInit;
    private addDragDrop;
    dragHelper(args: {
        element: HTMLElement;
        sender: MouseEvent & TouchEvent;
    }): HTMLElement;
    private getDragPath;
    private getDropPath;
    private onDrowNode;
    private addChild;
    private onNodeSelected;
    private onPathDrag;
    private onNodeExpand;
    private onNodeExpanded;
    private onNodeClicked;
    private onNodeEditing;
    private onPathChanged;
    private updateTree;
    private updateTreeNode;
    private removeChildNodes;
    private onOpenEnd;
    private onOpenInit;
    private onInitialEnd;
    private onFinalizeEnd;
    private onCreateEnd;
    private onSelectedData;
    private onDeleteInit;
    private onDeleteEnd;
    private onRefreshEnd;
    private onRenameInit;
    private onRenameEndParent;
    private onRenameEnd;
    private onPropertyChanged;
    private onDownLoadInit;
    private onSelectionChanged;
    private onClearPathInit;
    private onDragEnd;
    private getMoveNames;
    private onCutEnd;
    private selectResultNode;
    private onDropPath;
    private onpasteEnd;
    private checkDropPath;
    private onpasteInit;
    private oncutCopyInit;
    private addEventListener;
    private removeEventListener;
    private onDetailsInit;
    private onMenuItemData;
    private onDragging;
    private onDropInit;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the module name.
     * @private
     */
    private getModuleName;
    destroy(): void;
    private wireEvents;
    private unWireEvents;
    private keyDown;
    private getTreeData;
    private updateRenameData;
    private updateItemData;
    private updateActionData;
    private doDownload;
}
