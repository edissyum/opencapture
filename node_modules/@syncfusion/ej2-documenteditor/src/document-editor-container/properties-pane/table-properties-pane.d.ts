import { L10n } from '@syncfusion/ej2-base';
import { Tab } from '@syncfusion/ej2-navigations';
import { TextProperties } from './text-properties-pane';
import { ImageProperties } from './image-properties-pane';
import { ItemModel, DropDownButton } from '@syncfusion/ej2-splitbuttons';
import { DocumentEditorContainer } from '../document-editor-container';
/**
 * Represents table properties
 *
 * @private
 */
export declare class TableProperties {
    private container;
    private tableProperties;
    propertiesTab: Tab;
    private elementId;
    tableTextProperties: TextProperties;
    imageProperty: ImageProperties;
    private shadingBtn;
    private borderBtn;
    private borderSize;
    private tableOutlineBorder;
    private tableAllBorder;
    private tableCenterBorder;
    private tableLeftBorder;
    private tableCenterVerticalBorder;
    private tableRightBorder;
    private tableTopBorder;
    private tableCenterHorizontalBorder;
    private tableBottomBorder;
    private horizontalMerge;
    private insertRowAbove;
    private insertRowBelow;
    private insertColumnLeft;
    private insertColumnRight;
    private deleteRow;
    private deleteColumn;
    private topMargin;
    private bottomMargin;
    private leftMargin;
    private rightMargin;
    private alignBottom;
    private alignCenterHorizontal;
    private alignTop;
    private borderSizeColorElement;
    element: HTMLElement;
    private prevContext;
    private textProperties;
    private isTopMarginApply;
    private isRightMarginApply;
    private isBottomMarginApply;
    private isLeftMarginApply;
    private borderColor;
    private parentElement;
    localObj: L10n;
    private isRtl;
    private groupButtonClass;
    private readonly documentEditor;
    constructor(container: DocumentEditorContainer, imageProperty: ImageProperties, textProperties: TextProperties, isRtl?: boolean);
    private initializeTablePropPane;
    /**
     * @private
     * @param {boolean} enable - enable/disable table properties pane.
     * @returns {void}
     */
    enableDisableElements(enable: boolean): void;
    private addTablePropertyTab;
    private onTabSelection;
    private wireEvent;
    private getBorder;
    private onOutlineBorder;
    private onAllBorder;
    private onInsideBorder;
    private onLeftBorder;
    private onVerticalBorder;
    private onRightBorder;
    private onTopBorder;
    private onHorizontalBorder;
    private onBottomBorder;
    private onTopMargin;
    private onBottomMargin;
    private onLeftMargin;
    private onRightMargin;
    private applyTopMargin;
    private applyBottomMargin;
    private applyLeftMargin;
    private applyRightMargin;
    private applyAlignTop;
    private applyAlignBottom;
    private applyAlignCenterHorizontal;
    private onMergeCell;
    private onInsertRowAbove;
    private onInsertRowBelow;
    private onInsertColumnLeft;
    private onInsertColumnRight;
    private onDeleteRow;
    private onDeleteColumn;
    onSelectionChange(): void;
    private changeBackgroundColor;
    private initFillColorDiv;
    private initBorderStylesDiv;
    private initCellDiv;
    private initInsertOrDelCell;
    private initCellMargin;
    private initAlignText;
    private createCellMarginTextBox;
    private createBorderSizeDropDown;
    private onBorderSizeChange;
    private createDropdownOption;
    createDropDownButton(id: string, styles: string, parentDiv: HTMLElement, iconCss: string, content: string, items?: ItemModel[], target?: HTMLElement): DropDownButton;
    private createButtonTemplate;
    private createColorPickerTemplate;
    showTableProperties(isShow: boolean): void;
    destroy(): void;
}
