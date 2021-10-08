import { Spreadsheet } from '../index';
/**
 * `Sort` module is used to handle the sort action in Spreadsheet.
 */
export declare class Sort {
    private parent;
    /**
     * Constructor for sort module.
     *
     * @param {Spreadsheet} parent - Specifies the Spreadsheet instance.
     */
    constructor(parent: Spreadsheet);
    /**
     * To destroy the sort module.
     *
     * @returns {void}
     */
    protected destroy(): void;
    private addEventListener;
    private removeEventListener;
    /**
     * Gets the module name.
     *
     * @returns {string} - Gets the module name.
     */
    protected getModuleName(): string;
    /**
     * Validates the range and returns false when invalid.
     *
     * @returns {boolean} - Validates the range and returns false when invalid.
     */
    private isValidSortRange;
    /**
     * sort while importing.
     *
     * @param {any} args - Specifies the args
     * @param {number} args.sheetIdx - Specifies the sheet index
     * @returns {void}
     */
    private sortImport;
    /**
     * Shows the range error alert dialog.
     *
     * @param {object} args - specify the args
     * @param {string} args.error - range error string.
     * @returns {void}
     */
    private sortRangeAlertHandler;
    /**
     * Initiates the custom sort dialog.
     *
     * @returns {void}
     */
    private initiateCustomSortHandler;
    /**
     * Validates the errors of the sort criteria and displays the error.
     *
     * @param {Object} json - listview datasource.
     * @param {HTMLElement} dialogElem - dialog content element.
     * @param {HTMLElement} errorElem - element to display error.
     * @returns {boolean} - Return boolean value.
     */
    private validateError;
    /**
     * Creates all the elements and generates the dialog content element.
     *
     * @returns {HTMLElement} - Returns the dialog element.
     */
    private customSortContent;
    /**
     * Gets the fields data from the selected range.
     *
     * @returns {Object} - Gets the fields data from the selected range.
     */
    private getFields;
    /**
     * Creates the header tab for the custom sort dialog.
     *
     * @param {HTMLElement} dialogElem - dialog content element.
     * @param {ListView} listviewObj - listview instance.
     * @param {Object} fields - fields data.
     * @returns {void} - set header tab.
     */
    private setHeaderTab;
    /**
     * Creates a listview instance.
     *
     * @param {string} listId - unique id of the list item.
     * @returns {void}
     */
    private getCustomListview;
    /**
     * Triggers the click event for delete icon.
     *
     * @param {Element} element - current list item element.
     * @param {ListView} listviewObj - listview instance.
     * @returns {void}
     */
    private deleteHandler;
    /**
     * Renders the dropdown and radio button components inside list item.
     *
     * @param {string} id - unique id of the list item.
     * @param {ListView} lvObj - listview instance.
     * @param {boolean} containsHeader - data contains header.
     * @param {string} fields - fields data.
     * @param {boolean} btn - boolean value.
     * @returns {void}
     */
    private renderListItem;
    /**
     * Sets the new value of the radio button.
     *
     * @param {ListView} listviewObj - listview instance.
     * @param {string} id - unique id of the list item.
     * @param {string} value - new value.
     * @returns {void}
     */
    private setRadioBtnValue;
    /**
     *
     * Clears the error from the dialog.
     *
     * @returns {void}
     */
    private clearError;
    /**
     * Triggers sort events and applies sorting.
     *
     * @param {Object} args - Specifies the args.
     * @param {SortOptions} args.sortOptions - Specifies the sort options.
     * @param {string} args.range - Specifies the range.
     * @returns {void}
     */
    private applySortHandler;
    /**
     *
     * Invoked when the sort action is completed.
     *
     * @param {SortEventArgs} args - Specifies the range and sort options.
     * @returns {void}
     */
    private sortCompleteHandler;
}
