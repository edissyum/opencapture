import { Spreadsheet } from '../index';
import { AutoComplete } from '@syncfusion/ej2-dropdowns';
/**
 * @hidden
 * The `Formula` module is used to handle the formulas and its functionalities in Spreadsheet.
 */
export declare class Formula {
    private parent;
    private isFormulaBar;
    private isFormula;
    private isPopupOpened;
    private isPreventClose;
    private isSubFormula;
    autocompleteInstance: AutoComplete;
    /**
     * Constructor for formula module in Spreadsheet.
     *
     * @private
     * @param {Spreadsheet} parent - Constructor for formula module in Spreadsheet.
     */
    constructor(parent: Spreadsheet);
    /**
     * Get the module name.
     *
     * @returns {string} - Get the module name.
     * @private
     */
    getModuleName(): string;
    /**
     * To destroy the formula module.
     *
     * @returns {void} - To destroy the formula module.
     * @hidden
     */
    destroy(): void;
    private addEventListener;
    private removeEventListener;
    private performFormulaOperation;
    private renderAutoComplete;
    private onSuggestionOpen;
    private onSuggestionClose;
    private onSelect;
    private onSuggestionComplete;
    private refreshFormulaDatasource;
    private keyUpHandler;
    private keyDownHandler;
    private formulaClick;
    private refreshFormulaSuggestion;
    private endEdit;
    private hidePopUp;
    private getSuggestionKeyFromFormula;
    private getRelateToElem;
    private getEditingValue;
    private isNavigationKey;
    private triggerKeyDownEvent;
    private getArgumentSeparator;
    private getNames;
    private getNameFromRange;
    private addDefinedName;
}
