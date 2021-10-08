import { DocumentEditor } from '../../document-editor';
import { Toolbar } from '@syncfusion/ej2-navigations';
import { Revision } from './track-changes';
import { CommentReviewPane } from '../comments';
import { Dictionary } from '../../base/index';
/**
 * Track changes pane
 */
export declare class TrackChangesPane {
    /***
     * @private
     */
    isChangesTabVisible: boolean;
    private owner;
    private trackChangeDiv;
    private toolbarElement;
    private noChangeDivElement;
    /**
     * @private
     */
    toolbar: Toolbar;
    changesInfoDiv: HTMLElement;
    private locale;
    private commentReviewPane;
    private userDropDownitems;
    private userDropDownButton;
    private viewTypeDropDownButton;
    private userDropDown;
    private selectedUser;
    private selectedType;
    private users;
    private menuoptionEle;
    private menuDropDownButton;
    private enableButtons;
    private currentSelectedRevisionInternal;
    private viewTypeitems;
    changes: Dictionary<Revision, ChangesSingleView>;
    revisions: Revision[];
    private sortedRevisions;
    private noChangesVisibleInternal;
    isTrackingPageBreak: boolean;
    setNoChangesVisibility: boolean;
    currentSelectedRevision: Revision;
    constructor(owner: DocumentEditor, commentReviewPane: CommentReviewPane);
    private initTrackChangePane;
    private initPaneHeader;
    private beforeDropDownItemRender;
    private onUserOpen;
    private enableDisableToolbarItem;
    private getSpanView;
    private onMenuSelect;
    onSelection(revision: Revision): void;
    private onUserSelect;
    private onTypeSelect;
    private updateMenuOptions;
    private sortCollectionToDisplay;
    enableDisableButton(enableButton: boolean): void;
    updateTrackChanges(show?: boolean): void;
    updateUsers(): void;
    updateHeight(): void;
    private removeAllChanges;
    /**
     * @private
     */
    clear(): void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
    private addChanges;
    private navigatePreviousChanges;
    private navigateNextChanges;
}
export declare class ChangesSingleView {
    private trackChangesPane;
    private locale;
    private owner;
    outerSingleDiv: HTMLElement;
    user: string;
    revisionType: string;
    revision: Revision;
    singleInnerDiv: HTMLElement;
    acceptButtonElement: HTMLButtonElement;
    rejectButtonElement: HTMLButtonElement;
    constructor(owner: DocumentEditor, trackChangesPane: TrackChangesPane);
    createSingleChangesDiv(revision: Revision): HTMLElement;
    private selectRevision;
    private layoutElementText;
    private addSpan;
    private acceptButtonClick;
    private rejectButtonClick;
    private removeFromParentCollec;
}
