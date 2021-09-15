import { DocumentEditor } from '../../document-editor';
import { CollaborativeEditingEventArgs } from './editor-helper';
/**
 * Collaborative editing module
 */
export declare class CollaborativeEditing {
    private owner;
    private version;
    private lockStart;
    private saveTimer;
    private readonly documentHelper;
    private readonly selection;
    private readonly collaborativeEditingSettings;
    constructor(editor: DocumentEditor);
    private getModuleName;
    /**
     * To update the action which need to perform.
     *
     * @param {CollaborativeEditingEventArgs} data - Specifies the data.
     * @returns {void}
     */
    updateAction(data: CollaborativeEditingEventArgs | CollaborativeEditingEventArgs[]): void;
    private transFormLockRegion;
    /**
     * Lock selected region from editing by other users.
     *
     * @param {string} user - Specifies the user.
     * @returns {void}
     */
    lockContent(user: string): void;
    /**
     * @private
     * @returns {boolean} - Returns can lock.
     */
    canLock(): boolean;
    private getPreviousLockedRegion;
    /**
     * @private
     * @param {string} user - Specifies the user.
     * @returns {void}
     */
    unlockContent(user: string): void;
    private removeEditRange;
    /**
     * Save locked content to other clients.
     *
     * @private
     * @returns {void}
     */
    saveContent(): void;
    private saveContentInternal;
    private serializeEditableRegion;
    private successHandler;
    private failureHandler;
    /**
     * Locker specified region for specified user.
     *
     * @private
     * @param {string} start - Specified the selection start.
     * @param {string} end - Specifies the selection end.
     * @param {string} user - Specifies the user
     * @returns {void}
     */
    lockRegion(start: string, end: string, user: string): void;
    private lockRegionInternal;
    private insertElements;
    private insertElementsInternal;
    private insertElementInternal;
    private setEditableRegion;
    private isSelectionInEditableRange;
    /**
     * Updated modified content from remote user
     *
     * @returns {void}
     */
    updateRegion(user: string, content: string): void;
    private updateRevisionCollection;
    private getRevisionTextPosition;
    private tranformSelection;
    private tranformHistoryPosition;
    private transformHistory;
    private transformBaseHistoryInfo;
    private tranformPosition;
    private getParentBlock;
    private removeDuplicateCollection;
    private removeFieldInBlock;
    private removeFieldTable;
    private removeComment;
    private updateNextBlocksIndex;
    /**
     * Update locked region highlight.
     *
     * @private
     * @param {string} user - Specified the user.
     * @param {boolean} isLocked - Specifies the isLocked.
     * @returns {void}
     */
    updateLockRegion(user?: string, isLocked?: boolean): void;
    private updateLockInfo;
    /**
     * Pull pending actions from server.
     *
     * @returns {void}
     */
    pullAction(): void;
    /**
     * Destroy collaborative editing module.
     *
     * @returns {void}
     */
    destroy(): void;
}
