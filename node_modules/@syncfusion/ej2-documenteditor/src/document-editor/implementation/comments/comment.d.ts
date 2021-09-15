import { L10n } from '@syncfusion/ej2-base';
import { DocumentEditor } from '../../document-editor';
import { CommentElementBox, CommentCharacterElementBox } from '../../implementation/viewer/page';
import { DropDownButton } from '@syncfusion/ej2-splitbuttons';
import { Button } from '@syncfusion/ej2-buttons';
import { Toolbar, Tab } from '@syncfusion/ej2-navigations';
import { Dictionary, ReviewTabType } from '../../base/index';
/**
 * @private
 */
export declare class CommentReviewPane {
    owner: DocumentEditor;
    reviewPane: HTMLElement;
    closeButton: HTMLElement;
    toolbarElement: HTMLElement;
    toolbar: Toolbar;
    commentPane: CommentPane;
    headerContainer: HTMLElement;
    previousSelectedCommentInt: CommentElementBox;
    isNewComment: boolean;
    private confirmDialog;
    reviewTab: Tab;
    parentPaneElement: HTMLElement;
    element: HTMLElement;
    isCommentTabVisible: boolean;
    /**
     * @private
     */
    selectedTab: number;
    previousSelectedComment: CommentElementBox;
    constructor(owner: DocumentEditor);
    showHidePane(show: boolean, tab: ReviewTabType): void;
    reviewPaneHelper(args: any): void;
    updateTabHeaderWidth(): void;
    initReviewPane(localValue: L10n): void;
    private addReviewTab;
    /**
     * @param {SelectEventArgs} arg - Specify the selection event args.
     * @returns {void}
     */
    private onTabSelection;
    initPaneHeader(localValue: L10n): HTMLElement;
    closePane(): void;
    private discardButtonClick;
    private closeDialogUtils;
    initToolbar(localValue: L10n): HTMLElement;
    insertComment(): void;
    addComment(comment: CommentElementBox, isNewComment: boolean, selectComment: boolean): void;
    deleteComment(comment: CommentElementBox): void;
    selectComment(comment: CommentElementBox): void;
    resolveComment(comment: CommentElementBox): void;
    reopenComment(comment: CommentElementBox): void;
    addReply(comment: CommentElementBox, newComment: boolean, selectComment: boolean): void;
    navigatePreviousComment(): void;
    navigateNextComment(): void;
    enableDisableItems(): void;
    enableDisableToolbarItem(): void;
    initCommentPane(): void;
    layoutComments(): void;
    clear(): void;
    discardComment(comment: CommentElementBox): void;
    destroy(): void;
}
/**
 * @private
 */
export declare class CommentPane {
    private owner;
    parentPane: CommentReviewPane;
    noCommentIndicator: HTMLElement;
    parent: HTMLElement;
    comments: Dictionary<CommentElementBox, CommentView>;
    commentPane: HTMLElement;
    private isEditModeInternal;
    currentEditingComment: CommentView;
    isInsertingReply: boolean;
    isEditMode: boolean;
    constructor(owner: DocumentEditor, pane: CommentReviewPane);
    initCommentPane(): void;
    addComment(comment: CommentElementBox): void;
    updateHeight(): void;
    insertReply(replyComment: CommentElementBox): void;
    insertComment(comment: CommentElementBox): void;
    removeSelectionMark(className: string): void;
    selectComment(comment: CommentElementBox): void;
    getCommentStart(comment: CommentElementBox): CommentCharacterElementBox;
    private getFirstCommentInLine;
    deleteComment(comment: CommentElementBox): void;
    resolveComment(comment: CommentElementBox): void;
    reopenComment(comment: CommentElementBox): void;
    updateCommentStatus(): void;
    clear(): void;
    removeChildElements(): void;
    destroy(): void;
}
/**
 * @private
 */
export declare class CommentView {
    private owner;
    comment: CommentElementBox;
    commentPane: CommentPane;
    parentElement: HTMLElement;
    menuBar: HTMLElement;
    commentView: HTMLElement;
    commentText: HTMLElement;
    commentDate: HTMLElement;
    isReply: boolean;
    textAreaContainer: HTMLElement;
    textArea: HTMLTextAreaElement;
    postButton: Button;
    cancelButton: Button;
    dropDownButton: DropDownButton;
    drawerElement: HTMLElement;
    drawerAction: HTMLElement;
    drawerSpanElement: HTMLSpanElement;
    isDrawerExpand: boolean;
    replyViewContainer: HTMLElement;
    replyViewTextBox: HTMLTextAreaElement;
    replyPostButton: Button;
    replyCancelButton: Button;
    replyFooter: HTMLElement;
    reopenButton: Button;
    deleteButton: Button;
    constructor(owner: DocumentEditor, commentPane: CommentPane, comment: CommentElementBox);
    layoutComment(isReply: boolean): HTMLElement;
    private initCommentHeader;
    private selectComment;
    private initCommentView;
    private initEditView;
    private initDateView;
    private initDrawer;
    private initReplyView;
    private initResolveOption;
    private reopenButtonClick;
    private deleteComment;
    private updateReplyTextAreaHeight;
    private enableDisableReplyPostButton;
    private enableReplyView;
    private postReply;
    cancelReply(): void;
    private updateTextAreaHeight;
    showMenuItems(): void;
    hideMenuItemOnMouseLeave(): void;
    hideMenuItems(): void;
    enableDisablePostButton(): void;
    editComment(): void;
    resolveComment(): void;
    reopenComment(): void;
    postComment(): void;
    showCommentView(): void;
    cancelEditing(): void;
    showOrHideDrawer(): void;
    hideDrawer(): void;
    showDrawer(): void;
    private userOptionSelectEvent;
    unwireEvent(): void;
    destroy(): void;
}
