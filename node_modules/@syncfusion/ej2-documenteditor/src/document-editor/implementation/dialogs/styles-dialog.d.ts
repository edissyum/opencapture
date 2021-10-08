import { L10n } from '@syncfusion/ej2-base';
import { DocumentHelper } from '../viewer';
/**
 * The Styles dialog is used to create or modify styles.
 */
export declare class StylesDialog {
    /**
     * @private
     */
    documentHelper: DocumentHelper;
    private target;
    private listviewInstance;
    private styleName;
    private localValue;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    private getModuleName;
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value.
     * @param {string[]} styles - Specifies the styles.
     * @param {boolean} isRtl - Specifies the is rtl.
     * @returns {void}
     */
    initStylesDialog(localValue: L10n, styles: string[], isRtl?: boolean): void;
    /**
     * @private
     * @returns {void}
     */
    show(): void;
    private updateStyleNames;
    private defaultStyleName;
    /**
     * @private
     * @returns {void}
     */
    private modifyStyles;
    /**
     * @param {SelectEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    private selectHandler;
    /**
     * @private
     * @returns {void}
     */
    private hideObjects;
    /**
     * @private
     * @returns {void}
     */
    private addNewStyles;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
