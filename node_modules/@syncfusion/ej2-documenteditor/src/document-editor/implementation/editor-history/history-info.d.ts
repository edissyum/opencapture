import { DocumentEditor } from '../../document-editor';
import { BaseHistoryInfo } from './base-history-info';
import { EditRangeStartElementBox } from '../viewer/page';
import { DocumentHelper } from '../viewer';
/**
 * EditorHistory preservation class
 */
/**
 * @private
 */
export declare class HistoryInfo extends BaseHistoryInfo {
    documentHelper: DocumentHelper;
    /**
     * @private
     */
    modifiedActions: BaseHistoryInfo[];
    private isChildHistoryInfo;
    editRangeStart: EditRangeStartElementBox;
    readonly hasAction: boolean;
    constructor(node: DocumentEditor, isChild: boolean);
    addModifiedAction(baseHistoryInfo: BaseHistoryInfo): void;
    revert(): void;
    destroy(): void;
}
