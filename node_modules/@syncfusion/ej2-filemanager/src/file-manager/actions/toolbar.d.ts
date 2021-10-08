import { Toolbar as BaseToolbar } from '@syncfusion/ej2-navigations';
import { IFileManager } from '../base/interface';
/**
 * Toolbar module
 */
export declare class Toolbar {
    private parent;
    private items;
    private buttonObj;
    private layoutBtnObj;
    private default;
    private single;
    private multiple;
    private selection;
    toolbarObj: BaseToolbar;
    /**
     * Constructor for the Toolbar module
     *
     * @hidden
     * @param {IFileManager} parent - specifies the parent element.
     * @private
     */
    constructor(parent?: IFileManager);
    private render;
    getItemIndex(item: string): number;
    private getItems;
    private onClicked;
    private toolbarCreateHandler;
    private updateSortByButton;
    private getPupupId;
    private layoutChange;
    private toolbarItemData;
    private getId;
    private addEventListener;
    private reRenderToolbar;
    private onSelectionChanged;
    private hideItems;
    private hideStatus;
    private showPaste;
    private hidePaste;
    private onLayoutChange;
    private removeEventListener;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns module name.
     * @private
     */
    private getModuleName;
    private onPropertyChanged;
    destroy(): void;
    enableItems(items: string[], isEnable?: boolean): void;
}
