import { L10n } from '@syncfusion/ej2-base';
import { SelectEventArgs, ChangeEventArgs } from '@syncfusion/ej2-dropdowns';
import { WCharacterFormat, WParagraphFormat } from '../index';
import { DocumentHelper } from '../viewer';
/**
 * The Style dialog is used to create or modify styles.
 */
export declare class StyleDialog {
    documentHelper: DocumentHelper;
    private target;
    private styleType;
    private styleBasedOn;
    private styleParagraph;
    private onlyThisDocument;
    private template;
    private isEdit;
    private editStyleName;
    private style;
    private abstractList;
    private numberingBulletDialog;
    private okButton;
    private styleNameElement;
    private isUserNextParaUpdated;
    private fontFamily;
    private fontSize;
    private characterFormat;
    private paragraphFormat;
    private localObj;
    private bold;
    private italic;
    private underline;
    private fontColor;
    private leftAlign;
    private rightAlign;
    private centerAlign;
    private justify;
    private singleLineSpacing;
    private doubleLineSpacing;
    private onePointFiveLineSpacing;
    private styleDropdwn;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    /**
     * @private
     * @returns {string} Returns module name
     */
    getModuleName(): string;
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    initStyleDialog(localValue: L10n, isRtl?: boolean): void;
    private createFormatDropdown;
    /**
     *
     * @param {DropDownButtonMenuEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    private openDialog;
    private createFontOptions;
    /**
     * @private
     * @returns {void}
     */
    private setBoldProperty;
    /**
     * @private
     * @returns {void}
     */
    private setItalicProperty;
    /**
     * @private
     * @returns {void}
     */
    private setUnderlineProperty;
    /**
     * @private
     * @returns {void}
     */
    private fontButtonClicked;
    /**
     * @private
     * @param {ChangeEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    private fontSizeUpdate;
    /**
     * @private
     * @param {ChangeEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    private fontFamilyChanged;
    /**
     * @private
     * @param {ColorPickerEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    private fontColorUpdate;
    private createParagraphOptions;
    /**
     * @private
     * @returns {void}
     */
    private setLeftAlignment;
    /**
     * @private
     * @returns {void}
     */
    private setRightAlignment;
    /**
     * @private
     * @returns {void}
     */
    private setCenterAlignment;
    /**
     * @private
     * @returns {void}
     */
    private setJustifyAlignment;
    private createButtonElement;
    /**
     * @private
     * @returns {void}
     */
    private increaseBeforeAfterSpacing;
    /**
     * @private
     * @returns {void}
     */
    private decreaseBeforeAfterSpacing;
    private toggleDisable;
    /**
     * @private
     * @returns {void}
     */
    updateNextStyle: (args: FocusEvent) => void;
    /**
     * @private
     * @returns {void}
     */
    updateOkButton: () => void;
    /**
     * @private
     * @param {ChangeEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    styleTypeChange: (args: ChangeEventArgs) => void;
    /**
     * @returns {void}
     */
    private styleBasedOnChange;
    /**
     * @private
     * @param {SelectEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    styleParagraphChange: (args: SelectEventArgs) => void;
    /**
     * @private
     * @returns {void}
     */
    showFontDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    showParagraphDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    showNumberingBulletDialog: () => void;
    /**
     * @private
     * @param {string} styleName - Specifies the style name.
     * @param {string} header - Specifies the header.
     * @returns {void}
     */
    show(styleName?: string, header?: string): void;
    /**
     * @private
     * @returns {void}
     */
    onOkButtonClick: () => void;
    private updateList;
    private createLinkStyle;
    /**
     * @private
     * @returns {void}
     */
    private loadStyleDialog;
    /**
     * @private
     * @param {L10n} characterFormat - Specifies the character format
     * @returns {void}
     */
    updateCharacterFormat(characterFormat?: WCharacterFormat): void;
    /**
     * @private
     * @returns {void}
     */
    updateParagraphFormat(paragraphFOrmat?: WParagraphFormat): void;
    private enableOrDisableOkButton;
    private getTypeValue;
    private updateStyleNames;
    private getStyle;
    /**
     * @private
     * @returns {void}
     */
    onCancelButtonClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    closeStyleDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
