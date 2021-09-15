import { BodyWidget, TableWidget, TableRowWidget, ElementBox, Page } from '../viewer/page';
import { TextPosition } from '../selection/selection-helper';
import { isNullOrUndefined, L10n } from '@syncfusion/ej2-base';
import { WSectionFormat } from '../format/section-format';
import { XmlHttpRequestHandler, actionCompleteEvent } from '../../base/index';
import { HistoryInfo } from '../editor-history/index';
import { DialogUtility } from '@syncfusion/ej2-popups';
import { showSpinner, hideSpinner } from '@syncfusion/ej2-popups';
import { WCharacterFormat, WRowFormat } from '../format/index';
/**
 * Collaborative editing module
 */
var CollaborativeEditing = /** @class */ (function () {
    function CollaborativeEditing(editor) {
        this.version = 0;
        this.owner = editor;
    }
    Object.defineProperty(CollaborativeEditing.prototype, "documentHelper", {
        //private lockEnd: string = '';
        get: function () {
            return this.owner.documentHelper;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollaborativeEditing.prototype, "selection", {
        get: function () {
            return this.owner.selection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollaborativeEditing.prototype, "collaborativeEditingSettings", {
        get: function () {
            return this.owner.documentEditorSettings.collaborativeEditingSettings;
        },
        enumerable: true,
        configurable: true
    });
    CollaborativeEditing.prototype.getModuleName = function () {
        return 'CollaborativeEditing';
    };
    /**
     * To update the action which need to perform.
     *
     * @param {CollaborativeEditingEventArgs} data - Specifies the data.
     * @returns {void}
     */
    CollaborativeEditing.prototype.updateAction = function (data) {
        if (!Array.isArray(data)) {
            data = [data];
        }
        for (var i = 0; i < data.length; i++) {
            var documentData = data[i];
            switch (documentData.action) {
                case 'LockContent':
                    // Transform position
                    this.transFormLockRegion(documentData);
                    this.lockRegion(documentData.selectionInfo.start, documentData.selectionInfo.end, documentData.author);
                    break;
                case 'SaveContent':
                    this.version = documentData.version;
                    this.updateRegion(documentData.author, documentData.data);
                    break;
                case 'UnlockContent':
                    this.version = documentData.version;
                    this.updateRegion(documentData.author, documentData.data);
                    this.removeEditRange(documentData.author);
                    break;
            }
        }
    };
    CollaborativeEditing.prototype.transFormLockRegion = function (data) {
        var previousLockInfo = data.selectionInfo.previousLockInfo;
        if (!isNullOrUndefined(previousLockInfo)) {
            var author = previousLockInfo.author;
            var sectionDiff = 0;
            var blockDiff = 0;
            if (this.documentHelper.editRanges.containsKey(author)) {
                var editRange = this.documentHelper.editRanges.get(author);
                if (editRange.length > 0) {
                    var position = this.selection.getPosition(editRange[0]);
                    var endOffset = this.selection.getHierarchicalIndexByPosition(position.endPosition).split(';');
                    var previousOffset = previousLockInfo.end.split(';');
                    sectionDiff = parseInt(endOffset[0], 10) - parseInt(previousOffset[0], 10);
                    blockDiff = parseInt(endOffset[1], 10) - parseInt(previousOffset[1], 10);
                    // Same section
                    if (data.selectionInfo.start.split(';')[0] === previousLockInfo.end.split(';')[0]) {
                        data.selectionInfo.start = this.tranformPosition(data.selectionInfo.start, sectionDiff, blockDiff);
                        data.selectionInfo.end = this.tranformPosition(data.selectionInfo.end, sectionDiff, blockDiff);
                    }
                    else {
                        data.selectionInfo.start = this.tranformPosition(data.selectionInfo.start, sectionDiff, 0);
                        data.selectionInfo.end = this.tranformPosition(data.selectionInfo.end, sectionDiff, 0);
                    }
                }
            }
        }
    };
    /**
     * Lock selected region from editing by other users.
     *
     * @param {string} user - Specifies the user.
     * @returns {void}
     */
    CollaborativeEditing.prototype.lockContent = function (user) {
        var _this = this;
        if (this.canLock()) {
            var start = this.owner.selection.start;
            var end = this.owner.selection.end;
            if (!this.owner.selection.isForward) {
                start = this.owner.selection.end;
                end = this.owner.selection.start;
            }
            if (start.paragraph.isInsideTable) {
                var table = this.owner.documentHelper.layout.getParentTable(start.paragraph);
                var firstPara = this.owner.selection.getFirstParagraphBlock(table);
                start.setPosition(firstPara.childWidgets[0], true);
            }
            else {
                start.paragraphStartInternal(this.owner.selection, false);
            }
            if (end.paragraph.isInsideTable) {
                var table = this.owner.documentHelper.layout.getParentTable(end.paragraph);
                var lastPara = this.owner.selection.getLastParagraphBlock(table);
                var offset = lastPara.lastChild.getEndOffset();
                end.setPositionParagraph(lastPara.lastChild, offset);
            }
            else {
                end.moveToParagraphEndInternal(this.owner.selection, false);
            }
            var startOffset = this.owner.selection.getHierarchicalIndexByPosition(start);
            var endOffset = this.owner.selection.getHierarchicalIndexByPosition(end);
            var selectionInfo_1 = {
                start: startOffset,
                end: endOffset,
                roomName: this.owner.documentEditorSettings.collaborativeEditingSettings.roomName,
                author: isNullOrUndefined(user) ? this.owner.currentUser : user,
                version: this.version
            };
            var startInfo_1 = this.selection.getParagraphInfo(start);
            var endInfo_1 = this.selection.getParagraphInfo(end);
            this.owner.selection.select(startOffset, endOffset);
            var ajax = new XmlHttpRequestHandler();
            ajax.url = this.owner.serviceUrl + this.owner.serverActionSettings.canLock;
            ajax.contentType = 'application/json;charset=UTF-8';
            ajax.onSuccess = function (result) {
                _this.successHandler(result, selectionInfo_1, startInfo_1, endInfo_1);
            };
            ajax.onFailure = this.failureHandler.bind(this);
            ajax.onError = this.failureHandler.bind(this);
            ajax.customHeaders = this.owner.headers;
            ajax.send(selectionInfo_1);
        }
    };
    /**
     * @private
     * @returns {boolean} - Returns can lock.
     */
    CollaborativeEditing.prototype.canLock = function () {
        var editRanges = this.documentHelper.editRanges;
        if (editRanges.containsKey(this.owner.currentUser)) {
            return false;
        }
        var userNames = editRanges.keys;
        for (var i = 0; i < userNames.length; i++) {
            var range = editRanges.get(userNames[i]);
            if (!isNullOrUndefined(range) && range.length > 0) {
                if (this.isSelectionInEditableRange(range[0])) {
                    return false;
                }
            }
        }
        return true;
    };
    CollaborativeEditing.prototype.getPreviousLockedRegion = function () {
        var editRanges = this.documentHelper.editRanges;
        if (editRanges.containsKey(this.owner.currentUser)) {
            return undefined;
        }
        var previous;
        var userNames = editRanges.keys;
        for (var i = 0; i < userNames.length; i++) {
            var range = editRanges.get(userNames[i])[0];
            var startPosition = this.selection.getPosition(range).startPosition;
            if (startPosition.isExistBefore(this.selection.start)) {
                if (isNullOrUndefined(previous)) {
                    previous = range;
                }
                else if (startPosition.isExistAfter(this.selection.getPosition(previous).startPosition)) {
                    previous = range;
                }
            }
        }
        return previous;
    };
    /**
     * @private
     * @param {string} user - Specifies the user.
     * @returns {void}
     */
    CollaborativeEditing.prototype.unlockContent = function (user) {
        if (this.documentHelper.editRanges.containsKey(user)) {
            if (this.saveTimer) {
                clearTimeout(this.saveTimer);
            }
            var sfdtContent = JSON.stringify(this.serializeEditableRegion(user));
            var saveObject = {
                action: 'UnlockContent',
                author: user,
                version: this.version,
                data: sfdtContent,
                selectionInfo: {
                    start: '',
                    end: '',
                    roomName: this.collaborativeEditingSettings.roomName,
                    author: this.owner.currentUser,
                    version: this.version
                },
                roomName: this.collaborativeEditingSettings.roomName
            };
            this.removeEditRange(user);
            this.owner.editorHistory.clearHistory();
            this.owner.fireContentChange();
            // Todo: selection tranformation
            this.owner.trigger(actionCompleteEvent, saveObject);
        }
    };
    CollaborativeEditing.prototype.removeEditRange = function (user) {
        if (this.documentHelper.editRanges.containsKey(user)) {
            this.updateLockRegion(user, false);
            this.owner.editor.removeUserRestrictionsInternal(this.documentHelper.editRanges.get(user)[0]);
            this.documentHelper.clearContent();
            this.selection.updateEditRangeCollection();
            this.documentHelper.owner.viewer.updateScrollBars();
        }
    };
    /**
     * Save locked content to other clients.
     *
     * @private
     * @returns {void}
     */
    CollaborativeEditing.prototype.saveContent = function () {
        var _this = this;
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        var timeOut = this.collaborativeEditingSettings.saveTimeout;
        if (isNullOrUndefined(timeOut)) {
            timeOut = 3000;
        }
        this.saveTimer = setTimeout(function () {
            _this.saveContentInternal();
        }, timeOut);
    };
    CollaborativeEditing.prototype.saveContentInternal = function () {
        if (this.documentHelper.editRanges.containsKey(this.owner.currentUser)) {
            var editRangeStart = this.documentHelper.editRanges.get(this.owner.currentUser)[0];
            var position = this.selection.getPosition(editRangeStart);
            var saveObject = {
                action: 'SaveContent',
                author: this.owner.currentUser,
                version: this.version,
                data: JSON.stringify(this.serializeEditableRegion(this.owner.currentUser)),
                selectionInfo: {
                    'start': this.selection.getHierarchicalIndexByPosition(position.startPosition),
                    'end': this.selection.getHierarchicalIndexByPosition(position.endPosition),
                    roomName: this.collaborativeEditingSettings.roomName,
                    author: this.owner.currentUser,
                    version: this.version
                },
                roomName: this.collaborativeEditingSettings.roomName
            };
            this.owner.trigger(actionCompleteEvent, saveObject);
        }
    };
    CollaborativeEditing.prototype.serializeEditableRegion = function (user) {
        var startElement = this.documentHelper.editRanges.get(user)[0];
        var endElement = startElement.editRangeEnd;
        var start = new TextPosition(this.owner);
        start.setPosition(startElement.line, true);
        var end = new TextPosition(this.owner);
        end.setPosition(endElement.line, false);
        this.owner.sfdtExportModule.isPartialExport = true;
        /* eslint-disable-next-line max-len */
        var sfdtContent = this.owner.sfdtExportModule.write(start.currentWidget, start.offset, end.currentWidget, end.offset, false);
        this.owner.sfdtExportModule.isPartialExport = false;
        return sfdtContent;
    };
    /* eslint-disable-next-line max-len */
    CollaborativeEditing.prototype.successHandler = function (result, selectionInfo, startInfo, endInfo) {
        var canLock = JSON.parse(result.data).canLock;
        if (canLock) {
            selectionInfo.start = this.selection.getHierarchicalIndex(startInfo.paragraph, startInfo.offset.toString());
            selectionInfo.end = this.selection.getHierarchicalIndex(endInfo.paragraph, endInfo.offset.toString());
            var previousEditRange = this.getPreviousLockedRegion();
            if (previousEditRange) {
                var position = this.selection.getPosition(previousEditRange);
                selectionInfo.previousLockInfo = {
                    start: this.selection.getHierarchicalIndexByPosition(position.startPosition),
                    end: this.selection.getHierarchicalIndexByPosition(position.endPosition),
                    author: previousEditRange.user,
                    roomName: '',
                    version: 0
                };
            }
            var lockObject = {
                action: 'LockContent',
                selectionInfo: selectionInfo,
                author: this.owner.currentUser,
                version: this.version,
                data: '',
                roomName: this.collaborativeEditingSettings.roomName
            };
            this.owner.trigger(actionCompleteEvent, lockObject);
        }
        else {
            var localizeValue = new L10n('documenteditor', this.owner.defaultLocale);
            localizeValue.setLocale(this.owner.locale);
            DialogUtility.alert({
                content: localizeValue.getConstant('Already locked'),
                closeOnEscape: true, showCloseIcon: true, position: { X: 'Center', Y: 'Center' }
            });
        }
    };
    CollaborativeEditing.prototype.failureHandler = function () {
        var localizeValue = new L10n('documenteditor', this.owner.defaultLocale);
        localizeValue.setLocale(this.owner.locale);
        DialogUtility.alert({
            content: localizeValue.getConstant('Error in establishing connection with web server'),
            closeOnEscape: true, showCloseIcon: true, position: { X: 'Center', Y: 'Center' }
        });
    };
    /**
     * Locker specified region for specified user.
     *
     * @private
     * @param {string} start - Specified the selection start.
     * @param {string} end - Specifies the selection end.
     * @param {string} user - Specifies the user
     * @returns {void}
     */
    CollaborativeEditing.prototype.lockRegion = function (start, end, user) {
        var startPosition = this.selection.getTextPosBasedOnLogicalIndex(start);
        var endPosition = this.selection.getTextPosBasedOnLogicalIndex(end);
        this.lockRegionInternal(startPosition, endPosition, user);
    };
    CollaborativeEditing.prototype.lockRegionInternal = function (start, end, user) {
        var editStart = this.owner.editor.addEditElement(user);
        var editEnd = editStart.editRangeEnd;
        this.insertElements(start, end, [editEnd], [editStart]);
        this.updateLockInfo(editStart.paragraph, editEnd.paragraph, user, true);
        this.owner.viewer.updateScrollBars();
    };
    CollaborativeEditing.prototype.insertElements = function (start, end, endElements, startElements) {
        if (!isNullOrUndefined(startElements)) {
            this.insertElementsInternal(start, startElements);
        }
        if (!isNullOrUndefined(endElements)) {
            this.insertElementsInternal(end, endElements);
        }
    };
    CollaborativeEditing.prototype.insertElementsInternal = function (position, elements) {
        var indexInInline = 0;
        if (position.paragraph.isEmpty()) {
            var paragraph = position.paragraph;
            paragraph.childWidgets[0].children.push(elements[0]);
            elements[0].line = paragraph.childWidgets[0];
            this.documentHelper.layout.reLayoutParagraph(paragraph, 0, 0);
        }
        else {
            var inlineObj = position.currentWidget.getInline(position.offset, indexInInline);
            var curInline = inlineObj.element;
            indexInInline = inlineObj.index;
            var firstElement = elements[0];
            this.insertElementInternal(curInline, firstElement, indexInInline);
            var index = firstElement.indexInOwner;
            var lastElement = firstElement;
            for (var i = 1; i < elements.length; i++) {
                lastElement = elements[i];
                firstElement.line.children.splice(index + i, 0, lastElement);
            }
        }
    };
    CollaborativeEditing.prototype.insertElementInternal = function (element, newElement, index) {
        var line = element.line;
        var paragraph = line.paragraph;
        var insertIndex = element.indexInOwner;
        var isBidi = paragraph.paragraphFormat.bidi && element.isRightToLeft;
        if (index === element.length) {
            // Add new Element in current
            if (!isBidi) {
                insertIndex++;
            }
            line.children.splice(insertIndex, 0, newElement);
        }
        else if (index === 0) {
            if (isNullOrUndefined(element.previousNode)) {
                line.children.splice(0, 0, newElement);
                insertIndex = 0;
            }
            else {
                line.children.splice(insertIndex, 0, newElement);
            }
        }
        newElement.line = element.line;
    };
    //#region Save content
    CollaborativeEditing.prototype.setEditableRegion = function () {
        if (this.documentHelper.editRanges.containsKey(this.owner.currentUser)) {
            var editRanges = this.documentHelper.editRanges.get(this.owner.currentUser);
            var editRangeStart = editRanges[0];
            var firstBlock = this.getParentBlock(editRangeStart.paragraph);
            this.lockStart = this.owner.selection.getHierarchicalIndex(firstBlock, '0').split(';');
        }
    };
    CollaborativeEditing.prototype.isSelectionInEditableRange = function (editRange) {
        var _a;
        if (!isNullOrUndefined(this.owner.selection)) {
            var start = this.owner.selection.start;
            var end = this.owner.selection.end;
            if (!this.owner.selection.isForward) {
                _a = [end, start], start = _a[0], end = _a[1];
            }
            var position = this.owner.selection.getPosition(editRange);
            if ((start.isExistAfter(position.startPosition) || start.isAtSamePosition(position.startPosition))
                && (end.isExistBefore(position.endPosition) || end.isAtSamePosition(position.endPosition)) ||
                ((position.startPosition.isExistAfter(start) || position.startPosition.isAtSamePosition(start))
                    && (position.endPosition.isExistBefore(end) || position.endPosition.isAtSamePosition(end))) ||
                (position.startPosition.isExistAfter(start) && position.startPosition.isExistBefore(end)
                    && (end.isExistAfter(position.endPosition) || end.isExistBefore(position.endPosition))) ||
                (position.endPosition.isExistBefore(end) && position.endPosition.isExistAfter(start)
                    && (start.isExistBefore(position.startPosition) || start.isExistAfter(position.startPosition)))) {
                return true;
            }
        }
        return false;
    };
    /**
     * Updated modified content from remote user
     *
     * @returns {void}
     */
    /* eslint-disable  */
    CollaborativeEditing.prototype.updateRegion = function (user, content) {
        if (this.documentHelper.editRanges.containsKey(user)) {
            var editRanges = this.documentHelper.editRanges.get(user);
            if (editRanges.length === 1) {
                // Remove exisiting range  from collection.
                // New range will get inserted while updating the content.
                this.documentHelper.editRanges.remove(user);
                editRanges[0].removeEditRangeMark();
            }
            // Preserve hierachical position for history position tranformation
            this.setEditableRegion();
            var startElement = editRanges[0];
            var endElement = startElement.editRangeEnd;
            var firstBlock = this.getParentBlock(startElement.paragraph);
            var lastBlock = this.getParentBlock(endElement.paragraph);
            var isInEditRange = this.isSelectionInEditableRange(startElement);
            var startParagrahInfo = void 0;
            var endParagrahInfo = void 0;
            this.owner.editor.isRemoveRevision = true;
            if (!isInEditRange) {
                startParagrahInfo = this.owner.selection.getParagraphInfo(this.owner.selection.start);
                endParagrahInfo = this.owner.selection.getParagraphInfo(this.owner.selection.end);
            }
            var sections = [];
            while (lastBlock !== firstBlock) {
                var currentBlock = lastBlock.combineWidget(this.owner.viewer);
                lastBlock = currentBlock.previousRenderedWidget;
                if (lastBlock.bodyWidget.index !== currentBlock.bodyWidget.index) {
                    sections.push(currentBlock.bodyWidget);
                }
                var removedBlock = currentBlock.containerWidget.childWidgets[currentBlock.indexInOwner];
                this.removeDuplicateCollection(removedBlock);
                currentBlock.containerWidget.removeChild(currentBlock.indexInOwner);
            }
            if (!isNullOrUndefined(firstBlock)) {
                var lastBockIndex = firstBlock.index;
                var containerWidget = firstBlock.containerWidget;
                sections.push(containerWidget);
                var lastInsertIndex = firstBlock.containerWidget.childWidgets.indexOf(firstBlock);
                var removedBlock = containerWidget.childWidgets[lastInsertIndex];
                containerWidget.removeChild(lastInsertIndex);
                this.removeDuplicateCollection(removedBlock);
                var comments = [];
                var blocks = [];
                var revision = [];
                this.owner.editor.isPasteListUpdated = false;
                this.owner.editor.getBlocks(JSON.parse(content), false, blocks, comments, revision);
                if (sections.length !== blocks.length) {
                    if (sections.length === 1) {
                        var bodyWidget = sections[0];
                        sections.unshift(this.owner.editor.splitBodyWidget(bodyWidget, blocks[blocks.length - 2].sectionFormat, bodyWidget.childWidgets[lastInsertIndex - 1]));
                    }
                    if (sections.length < blocks.length) {
                        for (var m = 1; m < blocks.length - 1; m++) {
                            var page = new Page(this.owner.documentHelper);
                            var bodyWidget = new BodyWidget();
                            page.bodyWidgets.push(bodyWidget);
                            bodyWidget.page = page;
                            sections.splice(m, 0, bodyWidget);
                            bodyWidget.index = sections[m - 1].index;
                            bodyWidget.sectionFormat = new WSectionFormat(bodyWidget);
                            bodyWidget.sectionFormat.copyFormat(blocks[m].sectionFormat);
                            var pageIndex = sections[m - 1].page.index;
                            this.documentHelper.insertPage(pageIndex, page);
                            //Todo: update section index
                            this.owner.editor.updateSectionIndex(sections[m - 1].sectionFormat, sections[m - 1], true);
                            if (sections.length === blocks.length) {
                                break;
                            }
                        }
                    }
                }
                for (var z = 0; z < sections.length; z++) {
                    var containerWidget_1 = sections[z];
                    var blockIndex = 0;
                    var insertIndex = 0;
                    if (z === sections.length - 1) {
                        blockIndex = lastBockIndex;
                        insertIndex = lastInsertIndex;
                    }
                    var block = blocks[z].childWidgets;
                    for (var i = 0; i < block.length; i++) {
                        block[i].containerWidget = containerWidget_1;
                        block[i].index = blockIndex;
                        containerWidget_1.childWidgets.splice(insertIndex, 0, block[i]);
                        insertIndex++;
                        blockIndex++;
                    }
                    lastBlock = block[block.length - 1];
                    if (lastBlock.nextRenderedWidget && lastBlock.nextRenderedWidget.index !== lastBlock.index) {
                        //Todo: update block index properly
                        this.updateNextBlocksIndex(lastBlock, true);
                    }
                    this.documentHelper.layout.layoutBodyWidgetCollection(block[0].index, containerWidget_1, undefined, false);
                }
                for (var k = 0; k < comments.length; k++) {
                    var comment = comments[k];
                    this.owner.editor.addCommentWidget(comment, false, this.owner.showComments, false);
                    if (comment.replyComments.length > 0) {
                        for (var z = 0; z < comment.replyComments.length; z++) {
                            this.owner.commentReviewPane.addReply(comment.replyComments[z], false, false);
                        }
                    }
                }
                if (revision.length > 0) {
                    this.updateRevisionCollection(revision);
                }
                this.owner.trackChangesPane.updateTrackChanges();
                var editRanges_1 = this.documentHelper.editRanges.get(user);
                // update content
                if (!isInEditRange) {
                    this.tranformSelection(startParagrahInfo, endParagrahInfo);
                }
                else {
                    if (editRanges_1.length > 0) {
                        var positionInfo = this.selection.getPosition(editRanges_1[0]);
                        // We can't able to predic the modified content inside editable region
                        // So, it not possible to transform the position relativly.
                        // So, move the selection to editable region end.
                        this.selection.selectPosition(positionInfo.endPosition, positionInfo.endPosition);
                    }
                }
                this.tranformHistoryPosition();
                this.selection.updateEditRangeCollection();
                this.updateLockRegion(user);
                this.documentHelper.removeEmptyPages();
                this.owner.viewer.updateScrollBars();
                this.owner.editor.isRemoveRevision = false;
            }
        }
    };
    CollaborativeEditing.prototype.updateRevisionCollection = function (revision) {
        var insertIndex = 0;
        var revisionStart = this.getRevisionTextPosition(revision[0]);
        var isInsert = false;
        if (this.owner.revisionsInternal.changes.length > 0 &&
            !isNullOrUndefined(revisionStart)) {
            for (var i = 0; i < this.owner.revisionsInternal.changes.length; i++) {
                var textPosition = this.getRevisionTextPosition(this.owner.revisionsInternal.changes[i]);
                if (textPosition.isExistAfter(revisionStart)) {
                    insertIndex = i;
                    isInsert = true;
                    break;
                }
            }
        }
        for (var j = 0; j < revision.length; j++) {
            if (isInsert) {
                this.owner.revisionsInternal.changes.splice(insertIndex, 0, revision[j]);
                insertIndex++;
            }
            else {
                this.owner.revisionsInternal.changes.push(revision[j]);
            }
        }
    };
    /* eslint-disable @typescript-eslint/no-explicit-any */
    CollaborativeEditing.prototype.getRevisionTextPosition = function (revision) {
        if (revision.range.length > 0) {
            var range = revision.range[0];
            if (range instanceof ElementBox) {
                return this.selection.getElementPosition(range).startPosition;
            }
            else if (range instanceof WRowFormat) {
                var block = range.ownerBase.firstChild.firstChild;
                if (block.bodyWidget) {
                    return this.selection.getTextPosBasedOnLogicalIndex(this.selection.getHierarchicalIndex(block, '0'));
                }
            }
            else if (range instanceof WCharacterFormat) {
                var paraWidget = range.ownerBase;
                if (paraWidget.lastChild.paragraph.bodyWidget) {
                    var offset = paraWidget.getLength();
                    var startPosition = new TextPosition(this.owner);
                    startPosition.setPositionParagraph(paraWidget.lastChild, offset);
                    return startPosition;
                }
            }
        }
        return undefined;
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
    CollaborativeEditing.prototype.tranformSelection = function (startParagrahInfo, endParagraphInfo) {
        this.documentHelper.skipScrollToPosition = true;
        var startIndex = this.selection.getHierarchicalIndex(startParagrahInfo.paragraph, startParagrahInfo.offset.toString());
        var endIndex = this.selection.getHierarchicalIndex(endParagraphInfo.paragraph, endParagraphInfo.offset.toString());
        this.selection.select(startIndex, endIndex);
    };
    CollaborativeEditing.prototype.tranformHistoryPosition = function () {
        if (this.documentHelper.editRanges.containsKey(this.owner.currentUser)) {
            var editRanges = this.documentHelper.editRanges.get(this.owner.currentUser);
            var startElement = editRanges[0];
            var startBlock = this.getParentBlock(startElement.paragraph);
            var startOffset = this.selection.getHierarchicalIndex(startBlock, '0').split(';');
            if (!isNullOrUndefined(this.lockStart) && this.lockStart.length > 1) {
                var sectionDiff = parseInt(startOffset[0], 10) - parseInt(this.lockStart[0], 10);
                var blockDiff = parseInt(startOffset[1], 10) - parseInt(this.lockStart[1], 10);
                this.transformHistory(sectionDiff, blockDiff);
            }
        }
    };
    CollaborativeEditing.prototype.transformHistory = function (sectionDiff, blockDiff) {
        if (this.owner.enableEditorHistory) {
            var undoStack = this.owner.editorHistory.undoStack;
            if (!isNullOrUndefined(undoStack)) {
                for (var i = 0; i < undoStack.length; i++) {
                    this.transformBaseHistoryInfo(undoStack[i], sectionDiff, blockDiff);
                }
            }
            var redoStack = this.owner.editorHistory.redoStack;
            if (!isNullOrUndefined(redoStack)) {
                for (var i = 0; i < redoStack.length; i++) {
                    this.transformBaseHistoryInfo(redoStack[i], sectionDiff, blockDiff);
                }
            }
        }
    };
    CollaborativeEditing.prototype.transformBaseHistoryInfo = function (baseHistoryInfo, sectionDiff, blockDiff) {
        if (baseHistoryInfo.endPosition) {
            baseHistoryInfo.endPosition = this.tranformPosition(baseHistoryInfo.endPosition, sectionDiff, blockDiff);
        }
        if (baseHistoryInfo.insertPosition) {
            baseHistoryInfo.insertPosition = this.tranformPosition(baseHistoryInfo.insertPosition, sectionDiff, blockDiff);
        }
        if (baseHistoryInfo.selectionStart) {
            baseHistoryInfo.selectionStart = this.tranformPosition(baseHistoryInfo.selectionStart, sectionDiff, blockDiff);
        }
        if (baseHistoryInfo.selectionEnd) {
            baseHistoryInfo.selectionEnd = this.tranformPosition(baseHistoryInfo.selectionEnd, sectionDiff, blockDiff);
        }
        if (baseHistoryInfo instanceof HistoryInfo) {
            var modifiedActions = baseHistoryInfo.modifiedActions;
            for (var j = 0; j < modifiedActions.length; j++) {
                this.transformBaseHistoryInfo(modifiedActions[j], sectionDiff, blockDiff);
            }
        }
    };
    CollaborativeEditing.prototype.tranformPosition = function (position, sectionDiff, blockDiff) {
        var index = position.split(';');
        index[0] = (parseInt(index[0], 10) + sectionDiff).toString();
        index[1] = (parseInt(index[1], 10) + blockDiff).toString();
        return index.join(';');
    };
    CollaborativeEditing.prototype.getParentBlock = function (block) {
        if (block.isInsideTable) {
            block = this.owner.documentHelper.layout.getParentTable(block);
        }
        return block.combineWidget(this.owner.viewer);
    };
    //#endregion
    //#region Remove existing items in locked region
    CollaborativeEditing.prototype.removeDuplicateCollection = function (removedBlock) {
        this.removeFieldInBlock(removedBlock, false, false);
        this.removeFieldInBlock(removedBlock, true, false);
        this.removeFieldInBlock(removedBlock, false, true);
        if (removedBlock instanceof TableWidget) {
            for (var i = 0; i < removedBlock.childWidgets.length; i++) {
                if (removedBlock.childWidgets[i] instanceof TableRowWidget) {
                    var tableDelete = removedBlock.childWidgets[i];
                    this.owner.editor.removeDeletedCellRevision(tableDelete);
                }
            }
        }
        else {
            this.owner.editor.removeRevisionForBlock(removedBlock, undefined, false, false);
        }
    };
    CollaborativeEditing.prototype.removeFieldInBlock = function (block, isBookmark, contentControl) {
        if (block instanceof TableWidget) {
            this.removeFieldTable(block, isBookmark, contentControl);
        }
        else {
            this.owner.editor.removeField(block, isBookmark, contentControl);
            this.removeComment(block);
        }
    };
    CollaborativeEditing.prototype.removeFieldTable = function (table, isBookmark, contentControl) {
        for (var i = 0; i < table.childWidgets.length; i++) {
            var rowWidget = table.childWidgets[i];
            for (var j = 0; j < rowWidget.childWidgets.length; j++) {
                var widget = rowWidget.childWidgets[j];
                for (var i_1 = 0; i_1 < widget.childWidgets.length; i_1++) {
                    this.removeFieldInBlock(widget.childWidgets[i_1], isBookmark, contentControl);
                }
            }
        }
    };
    CollaborativeEditing.prototype.removeComment = function (block) {
        if (this.documentHelper.comments.length > 0) {
            for (var i = 0; i < this.documentHelper.comments.length; i++) {
                var comment = this.documentHelper.comments[i];
                if (comment.commentStart.line.paragraph === block) {
                    this.documentHelper.comments.splice(i, 1);
                    this.owner.commentReviewPane.deleteComment(comment);
                    i--;
                }
            }
        }
    };
    //#endregion
    CollaborativeEditing.prototype.updateNextBlocksIndex = function (block, increaseIndex) {
        var nextBlock = block.getSplitWidgets().pop().nextRenderedWidget;
        var incrementCount = 1;
        if (nextBlock.bodyWidget.index === block.bodyWidget.index) {
            incrementCount = block.index - nextBlock.index + 1;
        }
        var nextIndex = block.containerWidget.childWidgets.indexOf(block) + 1;
        if (block.containerWidget instanceof BodyWidget) {
            var sectionIndex = block.containerWidget.index;
            var pageIndex = this.documentHelper.pages.indexOf(block.containerWidget.page);
            for (var j = pageIndex; j < this.documentHelper.pages.length; j++) {
                var page = this.documentHelper.pages[j];
                if (page.bodyWidgets[0].index === sectionIndex) {
                    for (var k = nextIndex; k < page.bodyWidgets[0].childWidgets.length; k++) {
                        var childWidget = page.bodyWidgets[0].childWidgets[k];
                        childWidget.index += incrementCount;
                    }
                    nextIndex = 0;
                }
                else {
                    return;
                }
            }
        }
    };
    /**
     * Update locked region highlight.
     *
     * @private
     * @param {string} user - Specified the user.
     * @param {boolean} isLocked - Specifies the isLocked.
     * @returns {void}
     */
    CollaborativeEditing.prototype.updateLockRegion = function (user, isLocked) {
        if (isNullOrUndefined(user)) {
            user = this.owner.currentUser;
        }
        isLocked = isNullOrUndefined(isLocked) ? true : isLocked;
        if (this.documentHelper.editRanges.containsKey(user)) {
            var editRanges = this.documentHelper.editRanges.get(user);
            if (editRanges.length === 1 && !isNullOrUndefined(editRanges[0].editRangeEnd)) {
                var editStart = editRanges[0];
                this.updateLockInfo(editStart.paragraph, editStart.editRangeEnd.paragraph, user, isLocked);
            }
        }
    };
    CollaborativeEditing.prototype.updateLockInfo = function (startBlock, endBlock, user, locked) {
        if (startBlock.isInsideTable) {
            startBlock = this.documentHelper.layout.getParentTable(startBlock);
        }
        if (endBlock.isInsideTable) {
            endBlock = this.documentHelper.layout.getParentTable(endBlock);
        }
        do {
            if (locked) {
                startBlock.lockedBy = user;
                startBlock.locked = locked;
            }
            else {
                startBlock.lockedBy = undefined;
                startBlock.locked = locked;
            }
            if (startBlock === endBlock) {
                break;
            }
            startBlock = startBlock.nextRenderedWidget;
            if (isNullOrUndefined(startBlock)) {
                break;
            }
        } while (startBlock);
    };
    /**
     * Pull pending actions from server.
     *
     * @returns {void}
     */
    CollaborativeEditing.prototype.pullAction = function () {
        var _this = this;
        /* eslint-disable @typescript-eslint/no-explicit-any */
        if (this.owner) {
            var ajax = new XmlHttpRequestHandler();
            ajax.url = this.owner.serviceUrl + this.owner.serverActionSettings.getPendingActions;
            ajax.contentType = 'application/json;charset=UTF-8';
            ajax.onSuccess = function (result) {
                _this.updateAction(JSON.parse(result.data));
                hideSpinner(_this.owner.element);
            };
            ajax.onFailure = this.failureHandler.bind(this);
            ajax.onError = this.failureHandler.bind(this);
            ajax.customHeaders = this.owner.headers;
            showSpinner(this.owner.element);
            ajax.send(({ 'roomName': this.collaborativeEditingSettings.roomName, version: this.version }));
        }
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
    /**
     * Destroy collaborative editing module.
     *
     * @returns {void}
     */
    CollaborativeEditing.prototype.destroy = function () {
        this.owner = undefined;
    };
    return CollaborativeEditing;
}());
export { CollaborativeEditing };
