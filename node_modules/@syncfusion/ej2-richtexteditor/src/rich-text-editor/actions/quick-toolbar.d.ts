import { RenderType } from '../base/enum';
import { IRichTextEditor, IToolbarItems } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
import { BaseQuickToolbar } from './base-quick-toolbar';
import { BaseToolbar } from './base-toolbar';
import { RichTextEditorModel } from '../base/rich-text-editor-model';
/**
 * `Quick toolbar` module is used to handle Quick toolbar actions.
 */
export declare class QuickToolbar {
    private offsetX;
    private offsetY;
    private deBouncer;
    private target;
    private locator;
    private parent;
    private contentRenderer;
    linkQTBar: BaseQuickToolbar;
    textQTBar: BaseQuickToolbar;
    imageQTBar: BaseQuickToolbar;
    tableQTBar: BaseQuickToolbar;
    inlineQTBar: BaseQuickToolbar;
    private renderFactory;
    constructor(parent?: IRichTextEditor, locator?: ServiceLocator);
    private formatItems;
    private getQTBarOptions;
    /**
     * createQTBar method
     *
     * @param {string} popupType - specifies the string value
     * @param {string} mode - specifies the string value.
     * @param {string} items - specifies the string.
     * @param {RenderType} type - specifies the render type.
     * @returns {BaseQuickToolbar} - specifies the quick toolbar
     * @hidden

     */
    createQTBar(popupType: string, mode: string, items: (string | IToolbarItems)[], type: RenderType): BaseQuickToolbar;
    private initializeQuickToolbars;
    private onMouseDown;
    private renderQuickToolbars;
    private renderInlineQuickToolbar;
    /**
     * Method for showing the inline quick toolbar
     *
     * @param {number} x -specifies the value of x.
     * @param {number} y - specifies the y valu.
     * @param {HTMLElement} target - specifies the target element.
     * @returns {void}
     * @hidden

     */
    showInlineQTBar(x: number, y: number, target: HTMLElement): void;
    /**
     * Method for hidding the inline quick toolbar
     *
     * @returns {void}
     * @hidden

     */
    hideInlineQTBar(): void;
    /**
     * Method for hidding the quick toolbar
     *
     * @returns {void}
     * @hidden

     */
    hideQuickToolbars(): void;
    private deBounce;
    private mouseUpHandler;
    private keyDownHandler;
    private inlineQTBarMouseDownHandler;
    private keyUpHandler;
    private selectionChangeHandler;
    private onSelectionChange;
    /**
     * getInlineBaseToolbar method
     *
     * @returns {void}
     * @hidden

     */
    getInlineBaseToolbar(): BaseToolbar;
    /**
     * Destroys the ToolBar.
     *
     * @function destroy
     * @returns {void}
     * @hidden

     */
    destroy(): void;
    private wireInlineQTBarEvents;
    private unWireInlineQTBarEvents;
    private toolbarUpdated;
    /**
     * addEventListener
     *
     * @returns {void}
     * @hidden

     */
    addEventListener(): void;
    private onKeyDown;
    private onIframeMouseDown;
    private setRtl;
    /**
     * removeEventListener
     *
     * @returns {void}
     * @hidden

     */
    removeEventListener(): void;
    /**
     * Called internally if any of the property value changed.
     *
     * @param {RichTextEditorModel} e - specifies the element.
     * @returns {void}
     * @hidden

     */
    protected onPropertyChanged(e: {
        [key: string]: RichTextEditorModel;
    }): void;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {void}
     * @hidden
     */
    private getModuleName;
}
