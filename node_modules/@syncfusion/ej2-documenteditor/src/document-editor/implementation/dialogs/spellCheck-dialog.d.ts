import { L10n } from '@syncfusion/ej2-base';
import { ElementBox } from '../viewer/page';
import { DocumentHelper } from '../viewer';
/**
 * Spell check dialog
 */
export declare class SpellCheckDialog {
    private target;
    private elementBox;
    /**
     * @private
     */
    localValue: L10n;
    private errorText;
    private spellingListView;
    private suggestionListView;
    private selectedText;
    documentHelper: DocumentHelper;
    private isSpellChecking;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    private readonly parent;
    private getModuleName;
    /**
     * @param {SelectEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    private selectHandler;
    /**
     * @private
     * @returns {void}
     */
    onCancelButtonClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    onIgnoreClicked: () => void;
    private removeErrors;
    /**
     * @private
     * @returns {void}
     */
    onIgnoreAllClicked: () => void;
    /**
     * @private
     * @returns {void}
     */
    addToDictClicked: () => void;
    /**
     * @private
     * @returns {void}
     */
    changeButtonClicked: () => void;
    /**
     * @private
     * @returns {void}
     */
    changeAllButtonClicked: () => void;
    /**
     * @private
     * @param {string} error - Specifies error element box.
     * @param {ElementBox} elementbox - Specifies the element box.
     * @returns {void}
     */
    show(error?: string, elementbox?: ElementBox): void;
    /**
     * @private
     * @param {string} error - Specifies error element box.
     * @param {ElementBox} elementbox - Specifies the element box.
     * @returns {void}
     */
    updateSuggestionDialog(error: string, elementBox: ElementBox): void;
    private handleRetrievedSuggestion;
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value.
     * @param {string} error - Specifies the error text.
     * @param {string[]} suggestion - Specifies the suggestion.
     * @returns {void}
     */
    initSpellCheckDialog(localValue: L10n, error?: string, suggestion?: string[]): void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
