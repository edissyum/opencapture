import { IGrid, IAction } from '../base/interface';
/**
 * The `Scroll` module is used to handle scrolling behaviour.
 */
export declare class Scroll implements IAction {
    private parent;
    private previousValues;
    private oneTimeReady;
    private content;
    private header;
    private widthService;
    private pageXY;
    private parentElement;
    /**
     * Constructor for the Grid scrolling.
     *
     * @param {IGrid} parent - specifies the IGrid
     * @hidden
     */
    constructor(parent?: IGrid);
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    protected getModuleName(): string;
    /**
     * @param {boolean} uiupdate - specifies the uiupdate
     * @returns {void}
     * @hidden
     */
    setWidth(uiupdate?: boolean): void;
    /**
     * @returns {void}
     * @hidden
     */
    setHeight(): void;
    /**
     * @returns {void}
     * @hidden
     */
    setPadding(): void;
    /**
     * @param {boolean} rtl - specifies the rtl
     * @returns {void}
     * @hidden
     */
    removePadding(rtl?: boolean): void;
    /**
     * Refresh makes the Grid adoptable with the height of parent container.
     *
     * > The [`height`](grid/#height/) must be set to 100%.
     *
     * @returns {void}
     */
    refresh(): void;
    private getThreshold;
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
    private setScrollLeft;
    private onFrozenContentScroll;
    private onContentScroll;
    private onCustomScrollbarScroll;
    private onTouchScroll;
    private setPageXY;
    private getPointXY;
    private getScrollbleParent;
    /**
     * @param {boolean} isAdd - specifies whether adding/removing the event
     * @returns {void}
     * @hidden
     */
    addStickyListener(isAdd: boolean): void;
    private wireEvents;
    /**
     * @param {boolean} rtl - specifies the rtl
     * @returns {ScrollCss} returns the ScrollCss
     * @hidden
     */
    getCssProperties(rtl?: boolean): ScrollCss;
    private ensureOverflow;
    private onPropertyChanged;
    private makeStickyHeader;
    private setSticky;
    /**
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    /**
     * Function to get the scrollbar width of the browser.
     *
     * @returns {number} return the width
     * @hidden
     */
    static getScrollBarWidth(): number;
}
/**
 * @hidden
 */
export interface ScrollCss {
    padding?: string;
    border?: string;
}
