import { IGrid, IRenderer, NotifyArgs, VirtualInfo, IModelGenerator } from '../base/interface';
import { Column } from '../models/column';
import { Row } from '../models/row';
import { ContentRender } from './content-renderer';
import { HeaderRender } from './header-renderer';
import { ServiceLocator } from '../services/service-locator';
import { InterSectionObserver } from '../services/intersection-observer';
import { VirtualRowModelGenerator } from '../services/virtual-row-model-generator';
/**
 * VirtualContentRenderer
 *
 * @hidden
 */
export declare class VirtualContentRenderer extends ContentRender implements IRenderer {
    private count;
    private maxPage;
    private maxBlock;
    private prevHeight;
    /** @hidden */
    observer: InterSectionObserver;
    /**
     * @hidden
     */
    vgenerator: VirtualRowModelGenerator;
    /** @hidden */
    header: VirtualHeaderRenderer;
    /** @hidden */
    startIndex: number;
    private preStartIndex;
    private preEndIndex;
    /** @hidden */
    startColIndex: number;
    /** @hidden */
    endColIndex: number;
    private locator;
    private preventEvent;
    private actions;
    /** @hidden */
    content: HTMLElement;
    /** @hidden */
    movableContent: HTMLElement;
    /** @hidden */
    offsets: {
        [x: number]: number;
    };
    private tmpOffsets;
    /** @hidden */
    virtualEle: VirtualElementHandler;
    private offsetKeys;
    private isFocused;
    private isSelection;
    private selectedRowIndex;
    private isBottom;
    private rndrCount;
    /** @hidden */
    activeKey: string;
    /** @hidden */
    rowIndex: number;
    /** @hidden */
    blzRowIndex: number;
    /** @hidden */
    blazorDataLoad: boolean;
    private cellIndex;
    private empty;
    private isAdd;
    private isCancel;
    /** @hidden */
    requestType: string;
    private editedRowIndex;
    private requestTypes;
    private isNormaledit;
    /** @hidden */
    virtualData: Object;
    private emptyRowData;
    private vfColIndex;
    private frzIdx;
    private initialRowTop;
    private isContextMenuOpen;
    private selectRowIndex;
    private isSelectionScroll;
    private validationCheck;
    private validationCol;
    constructor(parent: IGrid, locator?: ServiceLocator);
    renderTable(): void;
    renderEmpty(tbody: HTMLElement): void;
    getReorderedFrozenRows(args: NotifyArgs): Row<Column>[];
    private scrollListener;
    private block;
    private getInfoFromView;
    private setKeyboardNavIndex;
    ensureBlocks(info: VirtualInfo): number[];
    appendContent(target: HTMLElement, newChild: DocumentFragment | HTMLElement, e: NotifyArgs): void;
    private validationScrollLeft;
    private ensureSelectedRowPosition;
    private checkFirstBlockColIndexes;
    private focusCell;
    private restoreEdit;
    private getVirtualEditedData;
    private restoreAdd;
    protected onDataReady(e?: NotifyArgs): void;
    /**
     * @param {number} height - specifies the height
     * @returns {void}
     * @hidden
     */
    setVirtualHeight(height?: number): void;
    private getPageFromTop;
    protected getTranslateY(sTop: number, cHeight: number, info?: VirtualInfo, isOnenter?: boolean): number;
    getOffset(block: number): number;
    private onEntered;
    private dataBound;
    private rowSelected;
    private isLastBlockRow;
    private refreshMaxPage;
    private setVirtualPageQuery;
    eventListener(action: string): void;
    private scrollToEdit;
    private refreshCells;
    private resetVirtualFocus;
    /**
     * @param {Object} data - specifies the data
     * @param {Object} data.virtualData -specifies the data
     * @param {boolean} data.isAdd - specifies isAdd
     * @param {boolean} data.isCancel - specifies boolean in cancel
     * @param {boolean} data.isScroll - specifies boolean for scroll
     * @returns {void}
     * @hidden
     */
    getVirtualData(data: {
        virtualData: Object;
        isAdd: boolean;
        isCancel: boolean;
        isScroll: boolean;
    }): void;
    private selectRowOnContextOpen;
    private editCancel;
    private editSuccess;
    private updateCurrentViewData;
    private actionBegin;
    private virtualCellFocus;
    private editActionBegin;
    private refreshCache;
    private actionComplete;
    private resetIsedit;
    private scrollAfterEdit;
    private createEmptyRowdata;
    private addActionBegin;
    /**
     * @param {number} index - specifies the index
     * @returns {Object} returns the object
     * @hidden
     */
    getRowObjectByIndex(index: number): Object;
    getBlockSize(): number;
    getBlockHeight(): number;
    isEndBlock(index: number): boolean;
    getGroupedTotalBlocks(): number;
    getTotalBlocks(): number;
    getColumnOffset(block: number): number;
    getModelGenerator(): IModelGenerator<Column>;
    private resetScrollPosition;
    private onActionBegin;
    getRows(): Row<Column>[];
    getRowByIndex(index: number): Element;
    getMovableVirtualRowByIndex(index: number): Element;
    getFrozenRightVirtualRowByIndex(index: number): Element;
    getRowCollection(index: number, isMovable: boolean, isRowObject?: boolean, isFrozenRight?: boolean): Element | Object;
    getVirtualRowIndex(index: number): number;
    /**
     * @returns {void}
     * @hidden */
    refreshOffsets(): void;
    refreshVirtualElement(): void;
    setVisible(columns?: Column[]): void;
    private selectVirtualRow;
    private isRowInView;
}
/**
 * @hidden
 */
export declare class VirtualHeaderRenderer extends HeaderRender implements IRenderer {
    virtualEle: VirtualElementHandler;
    /** @hidden */
    gen: VirtualRowModelGenerator;
    movableTbl: Element;
    private isMovable;
    constructor(parent: IGrid, locator: ServiceLocator);
    renderTable(): void;
    appendContent(table: Element): void;
    refreshUI(): void;
    setVisible(columns?: Column[]): void;
    private setFrozenTable;
    private setDisplayNone;
}
/**
 * @hidden
 */
export declare class VirtualElementHandler {
    wrapper: HTMLElement;
    placeholder: HTMLElement;
    content: HTMLElement;
    table: HTMLElement;
    movableWrapper: HTMLElement;
    movablePlaceholder: HTMLElement;
    movableTable: HTMLElement;
    movableContent: HTMLElement;
    renderWrapper(height?: number): void;
    renderPlaceHolder(position?: string): void;
    renderFrozenWrapper(height?: number): void;
    renderFrozenPlaceHolder(): void;
    renderMovableWrapper(height?: number): void;
    renderMovablePlaceHolder(): void;
    adjustTable(xValue: number, yValue: number): void;
    adjustMovableTable(xValue: number, yValue: number): void;
    setMovableWrapperWidth(width: string, full?: boolean): void;
    setMovableVirtualHeight(height?: number, width?: string): void;
    setWrapperWidth(width: string, full?: boolean): void;
    setVirtualHeight(height?: number, width?: string): void;
    setFreezeWrapperWidth(wrapper: HTMLElement, width: string, full?: boolean): void;
}
