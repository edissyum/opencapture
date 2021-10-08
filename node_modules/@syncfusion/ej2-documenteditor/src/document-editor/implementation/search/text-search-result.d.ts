import { TextPosition } from '../selection/selection-helper';
import { DocumentHelper } from '../index';
import { DocumentEditor } from '../../document-editor';
/**
 * @private
 */
export declare class TextSearchResult {
    documentHelper: DocumentHelper;
    private startIn;
    private endIn;
    private owner;
    /**
     * @private
     */
    isHeader: boolean;
    /**
     * @private
     */
    isFooter: boolean;
    start: TextPosition;
    end: TextPosition;
    readonly text: string;
    constructor(owner: DocumentEditor);
    destroy(): void;
}
