import { Toolbar as tool } from '@syncfusion/ej2-navigations';
import { IRichTextEditor, IRenderer } from '../base/interface';
import { IUpdateItemsModel } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
import { RendererFactory } from '../services/renderer-factory';
import { BaseToolbar } from './base-toolbar';
import { RichTextEditorModel } from '../base/rich-text-editor-model';
/**
 * `Toolbar` module is used to handle Toolbar actions.
 */
export declare class Toolbar {
    toolbarObj: tool;
    private editPanel;
    private isToolbar;
    private editableElement;
    private tbItems;
    baseToolbar: BaseToolbar;
    private tbElement;
    private tbWrapper;
    protected parent: IRichTextEditor;
    protected locator: ServiceLocator;
    private isTransformChild;
    private contentRenderer;
    protected toolbarRenderer: IRenderer;
    private dropDownModule;
    private toolbarActionModule;
    protected renderFactory: RendererFactory;
    private keyBoardModule;
    private tools;
    constructor(parent?: IRichTextEditor, serviceLocator?: ServiceLocator);
    private initializeInstance;
    private toolbarBindEvent;
    private toolBarKeyDown;
    private createToolbarElement;
    private getToolbarMode;
    private checkToolbarResponsive;
    private checkIsTransformChild;
    private toggleFloatClass;
    private renderToolbar;
    /**
     * addFixedTBarClass method
     *
     * @returns {void}
     * @hidden

     */
    addFixedTBarClass(): void;
    /**
     * removeFixedTBarClass method
     *
     * @returns {void}
     * @hidden

     */
    removeFixedTBarClass(): void;
    private showFixedTBar;
    private hideFixedTBar;
    /**
     * updateItem method
     *
     * @param {IUpdateItemsModel} args - specifies the arguments.
     * @returns {void}
     * @hidden

     */
    updateItem(args: IUpdateItemsModel): void;
    private updateToolbarStatus;
    private fullScreen;
    private hideScreen;
    /**
     * getBaseToolbar method
     *
     * @returns {void}
     * @hidden

     */
    getBaseToolbar(): BaseToolbar;
    /**
     * addTBarItem method
     *
     * @param {IUpdateItemsModel} args - specifies the arguments.
     * @param {number} index - specifies the index value.
     * @returns {void}
     * @hidden

     */
    addTBarItem(args: IUpdateItemsModel, index: number): void;
    /**
     * enableTBarItems method
     *
     * @param {BaseToolbar} baseToolbar - specifies the toolbar.
     * @param {string} items - specifies the string value.
     * @param {boolean} isEnable - specifies the boolean value.
     * @param {boolean} muteToolbarUpdate - specifies the toolbar.
     * @returns {void}
     * @hidden

     */
    enableTBarItems(baseToolbar: BaseToolbar, items: string | string[], isEnable: boolean, muteToolbarUpdate?: boolean): void;
    /**
     * removeTBarItems method
     *
     * @param {string} items - specifies the string value.
     * @returns {void}
     * @hidden

     */
    removeTBarItems(items: string | string[]): void;
    /**
     * getExpandTBarPopHeight method
     *
     * @returns {void}
     * @hidden

     */
    getExpandTBarPopHeight(): number;
    /**
     * getToolbarHeight method
     *
     * @returns {void}
     * @hidden

     */
    getToolbarHeight(): number;
    /**
     * getToolbarElement method
     *
     * @returns {void}
     * @hidden

     */
    getToolbarElement(): Element;
    /**
     * refreshToolbarOverflow method
     *
     * @returns {void}
     * @hidden

     */
    refreshToolbarOverflow(): void;
    private isToolbarDestroyed;
    private destroyToolbar;
    /**
     * Destroys the ToolBar.
     *
     * @function destroy
     * @returns {void}
     * @hidden

     */
    destroy(): void;
    private scrollHandler;
    private getDOMVisibility;
    private mouseDownHandler;
    private focusChangeHandler;
    private dropDownBeforeOpenHandler;
    private tbFocusHandler;
    private tbKeydownHandler;
    private toolbarClickHandler;
    protected wireEvents(): void;
    protected unWireEvents(): void;
    protected addEventListener(): void;
    protected removeEventListener(): void;
    private onRefresh;
    /**
     * Called internally if any of the property value changed.
     *
     * @param {RichTextEditorModel} e - specifies the string value
     * @returns {void}
     * @hidden

     */
    protected onPropertyChanged(e: {
        [key: string]: RichTextEditorModel;
    }): void;
    private refreshToolbar;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {void}
     * @hidden
     */
    private getModuleName;
}
