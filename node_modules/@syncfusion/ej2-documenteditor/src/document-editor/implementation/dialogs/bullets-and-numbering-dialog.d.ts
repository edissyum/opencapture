import { L10n } from '@syncfusion/ej2-base';
import { WAbstractList } from '../list/abstract-list';
import { WListFormat } from '../../implementation/format/list-format';
import { DocumentHelper } from '../viewer';
/**
 * The Bullets and Numbering dialog is used to apply list format for a paragraph style.
 */
export declare class BulletsAndNumberingDialog {
    documentHelper: DocumentHelper;
    private target;
    private isBullet;
    private symbol;
    private fontFamily;
    private numberFormat;
    private listLevelPattern;
    private listFormat;
    private abstractList;
    private tabObj;
    /**
     * @private
     */
    numberListDiv: HTMLElement;
    /**
     * @private
     */
    bulletListDiv: HTMLElement;
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
     * @param {L10n} locale - Specifies the locale.
     * @returns {void}
     */
    initNumberingBulletDialog(locale: L10n): void;
    private onTabSelect;
    private createNumberList;
    private createNumberListTag;
    private createNumberNoneListTag;
    private createBulletListTag;
    private createBulletList;
    /**
     * @private
     * @param {WListFormat} listFormat - Specifies the list format.
     * @param {WAbstractList} abstractList - Specifies the abstract list.
     * @returns {void}
     */
    showNumberBulletDialog(listFormat: WListFormat, abstractList: WAbstractList): void;
    /**
     * @param args
     * @private
     */
    numberListClick: (args: any) => void;
    private setActiveElement;
    /**
     * @param args
     * @private
     */
    bulletListClick: (args: any) => void;
    /**
     * @private
     * @returns {void}
     */
    loadNumberingBulletDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    closeNumberingBulletDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    onCancelButtonClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    onOkButtonClick: () => void;
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
