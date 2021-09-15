import { TextBox } from '@syncfusion/ej2-inputs';
import { IFileManager } from '../base/interface';
/**
 * BreadCrumbBar module
 */
export declare class BreadCrumbBar {
    private parent;
    addressPath: string;
    addressBarLink: string;
    searchObj: TextBox;
    private subMenuObj;
    private keyboardModule;
    private searchTimer;
    private keyConfigs;
    private searchWrapWidth;
    /**
     * constructor for addressbar module
     *
     * @hidden
     * @param {IFileManager} parent - specifies parent element.
     * @private
     *
     */
    constructor(parent?: IFileManager);
    private onPropertyChanged;
    private render;
    onPathChange(): void;
    private updateBreadCrumbBar;
    private onFocus;
    private onKeyUp;
    private onBlur;
    private subMenuSelectOperations;
    private addSubMenuAttributes;
    private searchEventBind;
    private searchChangeHandler;
    private addressPathClickHandler;
    private triggerFileOpen;
    private onShowInput;
    private updatePath;
    private onUpdatePath;
    private onCreateEnd;
    private onRenameEnd;
    private onDeleteEnd;
    private removeSearchValue;
    private onResize;
    private onPasteEnd;
    private addEventListener;
    private keyActionHandler;
    private removeEventListener;
    private onDropInit;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the module name
     * @private
     */
    private getModuleName;
    destroy(): void;
    private onSearchTextChange;
}
