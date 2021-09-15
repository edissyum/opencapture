import { ContextElementInfo, ElementInfo, ErrorInfo, WCharacterFormat, SpecialCharacterInfo, SpaceCharacterInfo, TextSearchResult, MatchResults, WordSpellInfo } from '../index';
import { Dictionary } from '../../base/dictionary';
import { ElementBox, TextElementBox, ErrorTextElementBox, Page } from '../viewer/page';
import { BaselineAlignment } from '../../base/types';
import { DocumentHelper } from '../viewer';
/**
 * The spell checker module
 */
export declare class SpellChecker {
    private langIDInternal;
    /**
     * Specifies whether spell check has to be performed or not.
     */
    private enableSpellCheckInternal;
    /**
     * @private
     */
    uniqueSpelledWords: any;
    private spellSuggestionInternal;
    /**
     * @private
     */
    errorWordCollection: Dictionary<string, ElementBox[]>;
    /**
     * @private
     */
    ignoreAllItems: string[];
    /**
     * @private
     */
    documentHelper: DocumentHelper;
    /**
     * @private
     */
    currentContextInfo: ContextElementInfo;
    /**
     * @private
     */
    uniqueKey: string;
    private removeUnderlineInternal;
    private spellCheckSuggestion;
    /**
     * @default 1000
     */
    private uniqueWordsCountInternal;
    /**
     * @private
     */
    errorSuggestions: Dictionary<string, string[]>;
    private performOptimizedCheck;
    private textSearchResults;
    /**
     * Gets module name.
     */
    private getModuleName;
    /**
     * Gets the boolean indicating whether optimized spell check to be performed.
     *
     * @aspType bool
     * @returns {boolean} Returns enableOptimizedSpellCheck
     */
    /**
    * Sets the boolean indicating whether optimized spell check to be performed.
    *
    * @aspType bool
    */
    enableOptimizedSpellCheck: boolean;
    /**
     * Gets the spell checked Unique words.
     *
     * @aspType int
     */
    /**
    * Sets the spell checked Unique words.
    *
    * @aspType int
    */
    uniqueWordsCount: number;
    /**
     * Gets the languageID.
     *
     * @aspType int
     */
    /**
    * Sets the languageID.
    *
    * @aspType int
    */
    languageID: number;
    /**
     * Getter indicates whether suggestion enabled.
     *
     * @aspType bool
     */
    /**
    * Setter to enable or disable suggestion
    *
    * @aspType bool
    */
    allowSpellCheckAndSuggestion: boolean;
    /**
     * Getter indicates whether underline removed for mis-spelled word.
     *
     * @aspType bool
     */
    /**
    * Setter to enable or disable underline for mis-spelled word
    *
    * @aspType bool
    */
    removeUnderline: boolean;
    /**
     * Getter indicates whether spell check has to be performed or not.
     *
     * @aspType bool
     */
    /**
    * Setter to enable or disable spell check has to be performed or not
    *
    * @aspType bool
    */
    enableSpellCheck: boolean;
    constructor(documentHelper: DocumentHelper);
    private readonly viewer;
    /**
     * Method to manage replace logic
     *
     * @private
     */
    manageReplace(content: string, dialogElement?: ElementBox): void;
    /**
     * Method to handle replace logic
     *
     * @private
     */
    handleReplace(content: string): void;
    /**
     * Method to retrieve exact element info
     *
     * @private
     */
    retrieveExactElementInfo(startInlineObj: ElementInfo): void;
    /**
     * Method to handle to ignore error Once
     *
     * @private
     */
    handleIgnoreOnce(startInlineObj: ElementInfo): void;
    /**
     * Method to handle ignore all items
     *
     * @private
     */
    handleIgnoreAllItems(contextElement?: ContextElementInfo): void;
    /**
     * Method to handle dictionary
     *
     * @private
     */
    handleAddToDictionary(contextElement?: ContextElementInfo): void;
    /**
     * Method to append/remove special characters
     *
     * @private
     */
    manageSpecialCharacters(exactText: string, replaceText: string, isRemove?: boolean): string;
    /**
     * Method to remove errors
     *
     * @private
     */
    removeErrorsFromCollection(contextItem: ContextElementInfo): void;
    /**
     * Method to retrieve exact text
     *
     * @private
     */
    retriveText(): ContextElementInfo;
    /**
     * Method to handle suggestions
     *
     * @private
     */
    handleSuggestions(allsuggestions: any): string[];
    /**
     * Method to check whether text element has errors
     *
     * @private
     */
    checktextElementHasErrors(text: string, element: any, left: number): ErrorInfo;
    private updateStatusForGlobalErrors;
    /**
     * Method to handle document error collection.
     *
     * @param {string} errorInElement
     * @private
     */
    handleErrorCollection(errorInElement: TextElementBox): boolean;
    private constructInlineMenu;
    /**
     * Method to retrieve error element text
     *
     * @private
     */
    findCurretText(): ContextElementInfo;
    private addErrorCollection;
    private compareErrorTextElement;
    /**
     * Method to compare text elements
     *
     * @private
     */
    compareTextElement(errorElement: TextElementBox, errorCollection: ElementBox[]): boolean;
    /**
     * Method to handle Word by word spell check
     *
     * @private
     */
    handleWordByWordSpellCheck(jsonObject: any, elementBox: TextElementBox, left: number, top: number, underlineY: number, baselineAlignment: BaselineAlignment, isSamePage: boolean): void;
    /**
     * Method to check errors for combined elements
     *
     * @private
     */
    checkElementCanBeCombined(elementBox: TextElementBox, underlineY: number, beforeIndex: number, callSpellChecker: boolean, textToCombine?: string, isNext?: boolean, isPrevious?: boolean, canCombine?: boolean): boolean;
    private lookThroughPreviousLine;
    private lookThroughNextLine;
    /**
     * Method to handle combined elements
     *
     * @param {TextElementBox} elementBox
     * @param {string} currentText
     * @param {number} underlineY
     * @param {number} beforeIndex
     * @private
     */
    handleCombinedElements(elementBox: TextElementBox, currentText: string, underlineY: number, beforeIndex: number): void;
    /**
     * Method to check error element collection has unique element
     *
     * @param {ErrorTextElementBox[]} errorCollection
     * @param {ErrorTextElementBox} elementToCheck
     * @private
     */
    checkArrayHasSameElement(errorCollection: ErrorTextElementBox[], elementToCheck: ErrorTextElementBox): boolean;
    /**
     * @private
     */
    handleSplitWordSpellCheck(jsonObject: any, currentText: string, elementBox: TextElementBox, isSamePage: boolean, underlineY: number, iteration: number, markIndex: number, isLastItem?: boolean): void;
    private handleMatchedResults;
    /**
     * Calls the spell checker service
     * @private
     */
    callSpellChecker(languageID: number, word: string, checkSpelling: boolean, checkSuggestion: boolean, addWord?: boolean, isByPage?: boolean): Promise<any>;
    private setCustomHeaders;
    /**
     * Method to check for next error
     *
     * @private
     * @returns {void}
     */
    checkForNextError(): void;
    /**
     * Method to create error element with matched results
     *
     * @param {TextSearchResult} result
     * @param {ElementBox} errorElement
     * @private
     */
    createErrorElementWithInfo(result: TextSearchResult, errorElement: ElementBox): ErrorTextElementBox;
    /**
     * Method to get matched results from element box
     *
     * @private
     * @param {ElementBox} errorElement - Specifies the error element box.
     * @param {string} currentText - Specifies the current text
     * @returns {MatchResults} - Returns match results info.
     */
    getMatchedResultsFromElement(errorElement: ElementBox, currentText?: string): MatchResults;
    /**
     * Method to update error element information
     *
     * @private
     * @param {string} error - Specifies the error word.
     * @param {ErrorTextElementBox} errorElement - Specifies the error element box.
     * @returns {void}
     */
    updateErrorElementTextBox(error: string, errorElement: ErrorTextElementBox): void;
    /**
     * Method to retrieve space information in a text
     *
     * @private
     * @param {string} text - Specifies the text
     * @param {WCharacterFormat} characterFormat - Specifies the character format.
     * @returns {SpecialCharacterInfo} - Returs special character info.
     */
    getWhiteSpaceCharacterInfo(text: string, characterFormat: WCharacterFormat): SpaceCharacterInfo;
    /**
     * Retrieve Special character info
     *
     * @private
     * @param {string} text - Specifies the text
     * @param {WCharacterFormat} characterFormat - Specifies the character format.
     * @returns {SpecialCharacterInfo} - Returs special character info.
     */
    getSpecialCharactersInfo(text: string, characterFormat: WCharacterFormat): SpecialCharacterInfo;
    /**
     * Method to retrieve next available combined element
     *
     * @private
     * @param {ElementBox} element - Specified the element.
     * @returns {ElementBox} - Returns combined element.
     */
    getCombinedElement(element: ElementBox): ElementBox;
    private checkCombinedElementsBeIgnored;
    /**
     * Method to update error collection
     *
     * @private
     * @param {TextElementBox} currentElement - Specifies current element.
     * @param {TextElementBox} splittedElement - Specifies splitted element.
     * @returns {void}
     */
    updateSplittedElementError(currentElement: TextElementBox, splittedElement: TextElementBox): void;
    /**
     * @private
     * @param {Page} page - Specifies the page.
     * @returns {string} - Returns page content.
     */
    getPageContent(page: Page): string;
    /**
     * @private
     * @param {any[]} spelledWords - Specifies spelledWords
     * @returns {void}
     */
    updateUniqueWords(spelledWords: any[]): void;
    private checkForUniqueWords;
    /**
     * Method to clear cached words for spell check
     *
     * @returns {void}
     */
    clearCache(): void;
    private createGuid;
    /**
     * Check spelling in page data
     *
     * @private
     * @param {string} wordToCheck - Specifies wordToCheck
     * @returns {WordSpellInfo} - Retruns WordSpellInfo
     */
    checkSpellingInPageInfo(wordToCheck: string): WordSpellInfo;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
