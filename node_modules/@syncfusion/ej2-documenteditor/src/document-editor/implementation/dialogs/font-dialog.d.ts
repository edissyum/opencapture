import { Selection } from '../index';
import { L10n } from '@syncfusion/ej2-base';
import { WCharacterFormat } from '../format/character-format';
import { DocumentHelper } from '../viewer';
/**
 * The Font dialog is used to modify formatting of selected text.
 */
export declare class FontDialog {
    private fontStyleInternal;
    documentHelper: DocumentHelper;
    private target;
    private fontNameList;
    private fontStyleText;
    private fontSizeText;
    private colorPicker;
    private fontColorDiv;
    private underlineDrop;
    private strikethroughBox;
    private doublestrikethrough;
    private superscript;
    private subscript;
    private allcaps;
    private bold;
    private italic;
    private underline;
    private strikethrough;
    private baselineAlignment;
    private fontSize;
    private fontFamily;
    private fontColor;
    private allCaps;
    /**
     * @private
     */
    characterFormat: WCharacterFormat;
    /**
     * @private
     * @returns {string} returns font style
     */
    /**
    * @private
    * @param {string} value Specifies font style
    */
    fontStyle: string;
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
    private createInputElement;
    /**
     * @private
     * @param {L10n} locale - Specifies the locale.
     * @param {boolean} isRtl - Specifies is rtl.
     * @returns {void}
     */
    initFontDialog(locale: L10n, isRtl?: boolean): void;
    private getFontSizeDiv;
    private getFontDiv;
    /**
     * @param characterFormat
     * @private
     */
    showFontDialog(characterFormat?: WCharacterFormat): void;
    /**
     * @private
     * @returns {void}
     */
    loadFontDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    closeFontDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    onCancelButtonClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    onInsertFontFormat: () => void;
    /**
     * @private
     * @param {Selection} selection Specifies the selection
     * @param {WCharacterFormat} format Specifies the character format
     * @returns {void}
     */
    onCharacterFormat(selection: Selection, format: WCharacterFormat): void;
    private enableCheckBoxProperty;
    /**
     * @private
     * @returns {void}
     */
    private fontSizeUpdate;
    /**
     * @private
     * @returns {void}
     */
    private fontStyleUpdate;
    /**
     * @private
     * @returns {void}
     */
    private fontFamilyUpdate;
    /**
     * @private
     * @returns {void}
     */
    private underlineUpdate;
    /**
     * @private
     * @returns {void}
     */
    private fontColorUpdate;
    /**
     * @private
     * @returns {void}
     */
    private singleStrikeUpdate;
    /**
     * @private
     * @returns {void}
     */
    private doubleStrikeUpdate;
    /**
     * @private
     * @returns {void}
     */
    private superscriptUpdate;
    /**
     * @private
     * @returns {void}
     */
    private subscriptUpdate;
    /**
     * @private
     * @returns {void}
     */
    private allcapsUpdate;
    /**
     * @private
     * @returns {void}
     */
    unWireEventsAndBindings(): void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
