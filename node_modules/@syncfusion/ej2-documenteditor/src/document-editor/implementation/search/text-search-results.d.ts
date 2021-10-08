import { TextSearchResult } from './text-search-result';
import { DocumentEditor } from '../../document-editor';
/**
 * @private
 */
export declare class TextSearchResults {
    innerList: TextSearchResult[];
    currentIndex: number;
    private owner;
    readonly length: number;
    readonly currentSearchResult: TextSearchResult;
    constructor(owner: DocumentEditor);
    addResult(): TextSearchResult;
    clearResults(): void;
    indexOf(result: TextSearchResult): number;
    destroy(): void;
}
