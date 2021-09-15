import { Toolbar as EJ2Toolbar } from '@syncfusion/ej2-navigations';
import { Button } from '@syncfusion/ej2-buttons';
import { DocumentEditorContainer } from '../document-editor-container';
import { ToolbarItem } from '../../document-editor/base';
import { XmlHttpRequestHandler } from '../../document-editor/base/index';
import { CustomToolbarItemModel } from '../../document-editor/base/events-helper';
/**
 * Toolbar Module
 */
export declare class Toolbar {
    /**
     * @private
     */
    toolbar: EJ2Toolbar;
    /**
     * @private
     */
    container: DocumentEditorContainer;
    /**
     * @private
     */
    filePicker: HTMLInputElement;
    /**
     * @private
     */
    imagePicker: HTMLInputElement;
    /**
     * @private
     */
    propertiesPaneButton: Button;
    /**
     * @private
     */
    importHandler: XmlHttpRequestHandler;
    /**
     * @private
     */
    isCommentEditing: boolean;
    private restrictDropDwn;
    private imgDropDwn;
    private breakDropDwn;
    private formFieldDropDown;
    private toolbarItems;
    private toolbarTimer;
    private buttonElement;
    private readonly documentEditor;
    /**
     * @private
     * @param {DocumentEditorContainer} container - DocumentEditorContainer object.
     */
    constructor(container: DocumentEditorContainer);
    private getModuleName;
    /**
     * Enables or disables the specified Toolbar item.
     *
     * @param  {number} itemIndex - Index of the toolbar items that need to be enabled or disabled.
     * @param  {boolean} isEnable  - Boolean value that determines whether the toolbar item should be enabled or disabled. By default, `isEnable` is set to true.
     * @returns {void}
     */
    enableItems(itemIndex: number, isEnable: boolean): void;
    /**
     * @private
     * @param {CustomToolbarItemModel|ToolbarItem} items - Toolbar items
     * @returns {void}
     */
    initToolBar(items: (CustomToolbarItemModel | ToolbarItem)[]): void;
    private renderToolBar;
    private initToolbarDropdown;
    private onBeforeRenderRestrictDropdown;
    private toggleRestrictIcon;
    private showHidePropertiesPane;
    private onWrapText;
    private wireEvent;
    private initToolbarItems;
    /**
     * @private
     * @param {CustomToolbarItemModel|ToolbarItem} items - Toolbar items
     * @returns {void}
     */
    reInitToolbarItems(items: (CustomToolbarItemModel | ToolbarItem)[]): void;
    private getToolbarItems;
    private clickHandler;
    private toggleLocalPaste;
    private toggleEditing;
    private toggleButton;
    private toggleTrackChangesInternal;
    private togglePropertiesPane;
    private onDropDownButtonSelect;
    private onFileChange;
    private convertToSfdt;
    private failureHandler;
    private successHandler;
    private onImageChange;
    private insertImage;
    private enableDisableFormField;
    /**
     * @private
     * @param {boolean} enable - Emable/Disable insert comment toolbar item.
     * @returns {void}
     */
    enableDisableInsertComment(enable: boolean): void;
    /**
     * @private
     * @param {boolean} enable - Emable/Disable track changes toolbar item.
     * @returns {void}
     */
    toggleTrackChanges(enable: boolean): void;
    /**
     * @private
     * @param {boolean} enable - Enable/Diable toolbar items.
     * @param {boolean} isProtectedContent - Define whether document is protected.
     * @returns {void}
     */
    enableDisableToolBarItem(enable: boolean, isProtectedContent: boolean): void;
    private containsItem;
    /**
     * @private
     * @returns {void}
     */
    enableDisableUndoRedo(): void;
    private onToc;
    /**
     * @private
     * @param {boolean} isShow - show/hide property pane.
     * @returns {void}
     */
    enableDisablePropertyPaneButton(isShow: boolean): void;
    /**
     * @private
     * @returns { void }
     */
    destroy(): void;
}
