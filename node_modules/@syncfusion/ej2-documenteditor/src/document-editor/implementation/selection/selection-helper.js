import { Widget, BodyWidget, TableRowWidget, TableWidget, LineWidget, ElementBox, TextElementBox, ListTextElementBox, ImageElementBox, ParagraphWidget, TableCellWidget, FieldElementBox, BlockContainer, BookmarkElementBox, CommentCharacterElementBox } from '../index';
import { HelperMethods } from '../index';
import { Point } from '../index';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/* eslint-disable */
/**
 * @private
 */
var TextPosition = /** @class */ (function () {
    function TextPosition(owner) {
        /**
         * @private
         */
        this.location = new Point(0, 0);
        /**
         * @private
         */
        this.isUpdateLocation = true;
        this.owner = owner;
        this.documentHelper = this.owner.documentHelper;
    }
    Object.defineProperty(TextPosition.prototype, "paragraph", {
        /**
         * @private
         */
        get: function () {
            return this.currentWidget.paragraph;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextPosition.prototype, "isAtParagraphStart", {
        /**
         * @private
         */
        get: function () {
            return this.offset === this.owner.selection.getStartOffset(this.paragraph);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextPosition.prototype, "isAtParagraphEnd", {
        /**
         * @private
         */
        get: function () {
            return this.owner.selection.isParagraphLastLine(this.currentWidget)
                && this.offset === this.owner.selection.getLineLength(this.currentWidget);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextPosition.prototype, "isCurrentParaBidi", {
        /**
         * @private
         */
        get: function () {
            if (!isNullOrUndefined(this.currentWidget.paragraph)) {
                return this.currentWidget.paragraph.paragraphFormat.bidi;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextPosition.prototype, "selection", {
        /**
         * @private
         */
        get: function () {
            return this.owner.selection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextPosition.prototype, "hierarchicalPosition", {
        /**
         * Gets the hierarchical position of logical text position in the document
         *
         * @returns {string}
         */
        get: function () {
            return this.getHierarchicalIndexInternal();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextPosition.prototype, "viewer", {
        get: function () {
            return this.owner.viewer;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Return clone of current text position
     *
     * @private
     */
    TextPosition.prototype.clone = function () {
        var textPosition = new TextPosition(this.owner);
        textPosition.currentWidget = this.currentWidget;
        textPosition.offset = this.offset;
        textPosition.location = this.location;
        return textPosition;
    };
    /**
     * @private
     */
    TextPosition.prototype.containsRtlText = function (widget) {
        for (var i = 0; i < widget.children.length; i++) {
            if (widget.children[i].isRightToLeft) {
                return true;
            }
        }
        return false;
    };
    /**
     * Set text position for paragraph and inline
     *
     * @private
     */
    TextPosition.prototype.setPositionForSelection = function (line, element, index, physicalLocation) {
        //Set the start end position
        var isParagraphEnd = false;
        if (isNullOrUndefined(element)) {
            this.currentWidget = line;
        }
        else {
            this.currentWidget = element.line;
            if (element.nextNode instanceof FieldElementBox && index > element.length) {
                isParagraphEnd = this.selection.isLastRenderedInline(element, element.length);
            }
        }
        this.location = physicalLocation;
        if (isParagraphEnd) {
            this.offset = this.selection.getParagraphLength(this.currentWidget.paragraph) + 1;
        }
        else {
            this.offset = this.currentWidget.getOffset(element, index);
        }
    };
    /**
     * Set text position
     *
     * @private
     */
    TextPosition.prototype.setPositionFromLine = function (line, offset, location) {
        this.currentWidget = line;
        this.offset = offset;
        if (location instanceof Point) {
            this.location.copy(location);
        }
    };
    /**
     * Set text position
     *
     * @private
     */
    TextPosition.prototype.setPosition = function (line, positionAtStart) {
        this.currentWidget = line;
        this.offset = positionAtStart ? this.selection.getStartOffset(line.paragraph)
            : line.paragraph.lastChild.getEndOffset() + 1;
        this.updatePhysicalPosition(true);
    };
    /**
     * Set position for text position
     *
     * @private
     */
    TextPosition.prototype.setPositionInternal = function (textPosition) {
        this.currentWidget = textPosition.currentWidget;
        this.offset = textPosition.offset;
        this.location = textPosition.location;
    };
    /**
     * Set position for current index
     *
     * @private
     */
    TextPosition.prototype.setPositionForCurrentIndex = function (hierarchicalIndex) {
        var index = { index: hierarchicalIndex };
        var paragraph = this.getParagraphWidget(index); //ref hierarchicalIndex
        this.offset = parseFloat(index.index);
        this.setPositionParagraph(paragraph, this.offset);
    };
    /**
     * Get Page
     *
     */
    TextPosition.prototype.getPage = function (position) {
        var page;
        var index = position.index.indexOf(';');
        var newValue = '0';
        if (index >= 0) {
            newValue = position.index.substring(0, index);
            position.index = position.index.substring(index).replace(';', '');
        }
        index = parseInt(newValue, 10);
        page = this.documentHelper.pages[index];
        return page;
    };
    /**
     * @private
     */
    TextPosition.prototype.getParagraphWidget = function (position) {
        if (isNullOrUndefined(position.index)) {
            return undefined;
        }
        var page = this.getPage(position);
        var child = this.getLineWidget(undefined, position, page);
        return child;
    };
    /**
     * @private
     */
    TextPosition.prototype.getLineWidget = function (widget, position, page) {
        if (isNullOrUndefined(position.index)) {
            return undefined;
        }
        var index = position.index.indexOf(';');
        var value = '0';
        if (index >= 0) {
            value = position.index.substring(0, index);
            position.index = position.index.substring(index).replace(';', '');
        }
        if (value === 'H' || value === 'F') {
            if (value === 'H') {
                widget = page.headerWidget;
            }
            else {
                widget = page.footerWidget;
            }
        }
        else if (value === 'FN' || value === 'EN') {
            if (value === 'FN') {
                widget = page.footnoteWidget;
            }
            else {
                widget = page.endnoteWidget;
            }
        }
        else if (!isNullOrUndefined(page)) {
            widget = page.bodyWidgets[0];
        }
        index = parseInt(value, 10);
        if (widget instanceof BlockContainer) {
            index = position.index.indexOf(';');
            value = '0';
            value = position.index.substring(0, index);
            position.index = position.index.substring(index).replace(';', '');
            index = parseInt(value, 10);
        }
        if (widget instanceof TableRowWidget && index >= widget.childWidgets.length) {
            position.index = '0;0';
            index = widget.childWidgets.length - 1;
        }
        if (index >= 0 && index < widget.childWidgets.length) {
            var child = widget.childWidgets[index];
            if (child instanceof LineWidget) {
                if (position.index.indexOf(';') > 0) {
                    position.index = '0';
                }
                return child;
            }
            if (child instanceof Widget) {
                if (position.index.indexOf(';') > 0) {
                    return this.getLineWidget(child, position);
                }
                else {
                    //If table is shifted to previous text position then return the first paragraph within table.
                    if (child instanceof TableWidget) {
                        return this.getLineWidget(this.selection.getFirstParagraphInFirstCell(child), position);
                    }
                    else if (child instanceof TableRowWidget && position.index.indexOf(';') === -1) {
                        return this.selection.getFirstParagraphInFirstCell(child.ownerTable).childWidgets[0];
                    }
                    return undefined;
                }
            }
        }
        else if (widget.nextRenderedWidget instanceof Widget) {
            position.index = '0';
            if (widget.nextRenderedWidget instanceof TableWidget) {
                return this.selection.getFirstParagraphInFirstCell(widget.nextRenderedWidget).firstChild;
            }
            return this.getLineWidget(widget.nextRenderedWidget, position);
        }
        return undefined;
    };
    /**
     * Update physical location of paragraph
     *
     * @private
     */
    TextPosition.prototype.updatePhysicalPosition = function (moveNextLine) {
        if (this.currentWidget && this.owner.isLayoutEnabled && this.isUpdateLocation) {
            this.location = this.selection.getPhysicalPositionInternal(this.currentWidget, this.offset, moveNextLine);
        }
    };
    /**
     * Return true if text position are in same paragraph and offset
     *
     * @private
     */
    TextPosition.prototype.isAtSamePosition = function (textPosition) {
        return this.currentWidget === textPosition.currentWidget
            && this.offset === textPosition.offset;
    };
    /**
     * Return true if text position is in same paragraph index
     * @private
     */
    TextPosition.prototype.isInSameParagraphIndex = function (textPosition) {
        if (isNullOrUndefined(textPosition)) {
            throw new Error('textPosition is undefined.');
        }
        return this.paragraph.index === textPosition.paragraph.index;
    };
    /**
     * Return true if text position is in same paragraph
     *
     * @private
     */
    TextPosition.prototype.isInSameParagraph = function (textPosition) {
        if (isNullOrUndefined(textPosition)) {
            throw new Error('textPosition is undefined.');
        }
        return this.paragraph === textPosition.paragraph;
    };
    /**
     * Return true is current text position exist before given text position
     *
     * @private
     */
    TextPosition.prototype.isExistBefore = function (textPosition) {
        if (isNullOrUndefined(textPosition)) {
            throw new Error('textPosition is undefined.');
        }
        if (this.currentWidget === textPosition.currentWidget) {
            return this.offset < textPosition.offset;
        }
        var currentParagraph = this.currentWidget.paragraph;
        var paragraph = textPosition.currentWidget.paragraph;
        if (currentParagraph === paragraph) {
            return currentParagraph.childWidgets.indexOf(this.currentWidget) < paragraph.childWidgets.indexOf(textPosition.currentWidget);
        }
        if (currentParagraph.containerWidget === paragraph.containerWidget) {
            if (currentParagraph.isInsideTable) {
                return currentParagraph.associatedCell.childWidgets.indexOf(currentParagraph) <
                    paragraph.associatedCell.childWidgets.indexOf(paragraph);
                //handle after header footer implementation
                // } else if ((this.currentParagraph).owner instanceof WHeaderFooter) {
                //     return ((this.currentParagraph).owner as WHeaderFooter).blocks.indexOf((this.currentParagraph)) <
                //         ((textPosition.currentParagraph).owner as WHeaderFooter).blocks.indexOf((textPosition.currentParagraph));
            }
            else {
                return (currentParagraph.containerWidget.childWidgets.indexOf(currentParagraph)) <
                    (paragraph.containerWidget.childWidgets.indexOf(paragraph));
            }
        }
        return this.owner.selection.isExistBefore(currentParagraph, paragraph);
    };
    /**
     * Return true is current text position exist after given text position
     *
     * @private
     */
    TextPosition.prototype.isExistAfter = function (textPosition) {
        if (isNullOrUndefined(textPosition)) {
            throw new Error('textPosition is undefined.');
        }
        if (this.currentWidget === textPosition.currentWidget) {
            return this.offset > textPosition.offset;
        }
        if (this.currentWidget.paragraph === textPosition.currentWidget.paragraph) {
            return this.currentWidget.paragraph.childWidgets.indexOf(this.currentWidget) >
                textPosition.currentWidget.paragraph.childWidgets.indexOf(textPosition.currentWidget);
        }
        var startParagraph = this.currentWidget.paragraph;
        var endParagraph = textPosition.currentWidget.paragraph;
        if (startParagraph.containerWidget instanceof BodyWidget && endParagraph.containerWidget instanceof BodyWidget &&
            startParagraph.containerWidget === endParagraph.containerWidget) {
            if (startParagraph.isInsideTable && endParagraph.isInsideTable) {
                return startParagraph.associatedCell.childWidgets.indexOf(startParagraph) >
                    endParagraph.associatedCell.childWidgets.indexOf(endParagraph);
                // } else if ((this.currentParagraph).owner instanceof WHeaderFooter) {
                //     return ((this.currentParagraph).owner as WHeaderFooter).blocks.indexOf((this.currentParagraph)) >
                //         ((textPosition.currentParagraph).owner as WHeaderFooter).blocks.indexOf((textPosition.currentParagraph));
            }
            else {
                return (startParagraph.containerWidget.childWidgets.indexOf(startParagraph) >
                    (endParagraph.containerWidget.childWidgets.indexOf(endParagraph)));
            }
        }
        return this.owner.selection.isExistAfter(startParagraph, endParagraph);
    };
    /**
     * Return hierarchical index of current text position
     *
     * @private
     */
    TextPosition.prototype.getHierarchicalIndexInternal = function () {
        return this.getHierarchicalIndex(this.currentWidget, this.offset.toString());
    };
    /**
     * @private
     */
    TextPosition.prototype.getHierarchicalIndex = function (line, hierarchicalIndex) {
        var node = line;
        if (node) {
            return node.getHierarchicalIndex(hierarchicalIndex);
        }
        return hierarchicalIndex;
    };
    /**
     * @private
     */
    TextPosition.prototype.setPositionParagraph = function (line, offsetInLine) {
        this.currentWidget = line;
        this.offset = offsetInLine;
        this.updatePhysicalPosition(true);
    };
    /**
     * @private
     */
    TextPosition.prototype.setPositionForLineWidget = function (lineWidget, offset) {
        var lineLength = this.selection.getLineLength(lineWidget);
        var lineIndex = lineWidget.paragraph.childWidgets.indexOf(lineWidget);
        if (lineWidget.isLastLine()) {
            if (!isNullOrUndefined(lineWidget.paragraph.footNoteReference)) {
                lineLength = lineLength + lineWidget.paragraph.footNoteReference.text.length;
            }
            else {
                lineLength = lineLength + 1;
            }
        }
        if (offset > lineLength) {
            var nextLineWidget = void 0;
            if (lineIndex >= lineWidget.paragraph.childWidgets.length - 1) {
                var nextBlock = this.selection.getNextRenderedBlock(lineWidget.paragraph);
                if (nextBlock && nextBlock.index === lineWidget.paragraph.index) {
                    nextLineWidget = nextBlock.firstChild;
                }
            }
            else {
                nextLineWidget = lineWidget.paragraph.childWidgets[lineIndex + 1];
            }
            this.setPositionForLineWidget(nextLineWidget, offset - lineLength);
            return;
        }
        else if (offset < 0) {
            var prevLine = lineWidget.paragraph.childWidgets[lineIndex - 1];
            var currentOffSet = this.selection.getLineLength(prevLine) + offset;
            this.setPositionForLineWidget(prevLine, currentOffSet);
            return;
        }
        else {
            this.currentWidget = lineWidget;
            this.offset = offset;
        }
        this.updatePhysicalPosition(true);
    };
    /**
     * move to next text position
     *
     * @private
     */
    TextPosition.prototype.moveNextPosition = function (isNavigate) {
        if (isNullOrUndefined(isNavigate)) {
            isNavigate = true;
        }
        var inline = this.selection.getNextStartInline(this.currentWidget, this.offset);
        if (inline instanceof FieldElementBox && inline.fieldType === 0 && !isNullOrUndefined(inline.fieldEnd)) {
            if (isNavigate) {
                this.moveNextPositionInternal(inline);
                this.moveNextPosition();
                return;
            }
            else {
                var line = inline.fieldEnd.line;
                var fieldEnd = inline.fieldEnd;
                var fieldEndOffset = line.getOffset(fieldEnd, 1);
                var fieldEndIndex = this.getHierarchicalIndex(line, fieldEndOffset.toString());
                if (TextPosition.isForwardSelection(this.selection.end.getHierarchicalIndexInternal(), fieldEndIndex)) {
                    //If field end is after selection end, extend selection end to field end.
                    this.selection.end.moveToInline(inline.fieldEnd, 1);
                    return;
                }
                this.moveToInline(inline.fieldEnd, 1);
            }
        }
        var nextOffset = this.selection.getNextValidOffset(this.currentWidget, this.offset);
        var lineIndex = this.paragraph.childWidgets.indexOf(this.currentWidget);
        var index = 0;
        if (nextOffset > this.offset) {
            this.offset = nextOffset;
            var info = this.currentWidget.getInline(this.offset, index);
            inline = info.element;
            index = info.index;
            if (!isNullOrUndefined(inline) && index === inline.length && (inline.nextNode instanceof FieldElementBox
                || inline.nextNode instanceof BookmarkElementBox)) {
                var nextValidInline = this.selection.getNextValidElement(inline.nextNode);
                //Moves to field end mark or Bookmark end.
                if (nextValidInline instanceof FieldElementBox && nextValidInline.fieldType === 1
                    || nextValidInline instanceof BookmarkElementBox && nextValidInline.bookmarkType === 1) {
                    inline = nextValidInline;
                    this.currentWidget = inline.line;
                    this.offset = this.currentWidget.getOffset(inline, this.documentHelper.isFormFillProtectedMode ? 0 : 1);
                }
            }
        }
        else if (lineIndex + 1 < this.paragraph.childWidgets.length) {
            var nextLineWidget = this.paragraph.childWidgets[lineIndex + 1];
            if (nextLineWidget) {
                this.currentWidget = nextLineWidget;
                this.offset = this.selection.getStartLineOffset(this.currentWidget);
            }
            var inlineObj = this.currentWidget.getInline(this.offset, index);
            inline = inlineObj.element;
            index = inlineObj.index;
            if (inline instanceof FieldElementBox && inline.fieldType === 0) {
                this.offset++;
            }
        }
        else {
            this.updateOffsetToNextParagraph(index, false);
        }
        //Gets physical position in current page.
        this.updatePhysicalPosition(true);
    };
    /**
     * Move text position to previous paragraph inside table
     *
     * @private
     */
    TextPosition.prototype.moveToPreviousParagraphInTable = function (selection) {
        var previousParagraph;
        var currentPara = this.currentWidget.paragraph;
        if (currentPara.isInsideTable) {
            previousParagraph = selection.getPreviousSelectionCell(currentPara.associatedCell);
        }
        else {
            previousParagraph = selection.getPreviousParagraphBlock(currentPara);
        }
        if (isNullOrUndefined(previousParagraph)) {
            return;
        }
        this.currentWidget = previousParagraph.childWidgets[previousParagraph.childWidgets.length - 1];
        this.offset = this.currentWidget.getEndOffset() + 1;
    };
    TextPosition.prototype.updateOffsetToNextParagraph = function (indexInInline, isHighlight) {
        //Moves to owner and get next paragraph.
        var inline;
        var positionAtStart = false;
        var nextParagraph = undefined;
        var lineIndex = this.paragraph.childWidgets.indexOf(this.currentWidget);
        if (!isHighlight) {
            nextParagraph = this.selection.getNextParagraphBlock(this.paragraph);
        }
        else if (lineIndex + 1 < this.paragraph.childWidgets.length) {
            var nextLineWidget = this.paragraph.childWidgets[lineIndex + 1];
            if (nextLineWidget) {
                this.currentWidget = nextLineWidget;
                this.offset = 1;
            }
        }
        else {
            nextParagraph = this.selection.getNextSelectionBlock(this.paragraph);
            if (!isNullOrUndefined(nextParagraph)) {
                if (nextParagraph.containerWidget instanceof TableCellWidget) {
                    if (this.selection.start.paragraph.isInsideTable) {
                        var containerCell = this.selection.getContainerCellOf(this.selection.start.paragraph.associatedCell, nextParagraph.associatedCell);
                        positionAtStart = !containerCell.ownerTable.contains(nextParagraph.associatedCell);
                    }
                    else {
                        positionAtStart = true;
                    }
                }
            }
        }
        if (!isNullOrUndefined(nextParagraph) && nextParagraph.childWidgets.length > 0) {
            if (!positionAtStart) {
                this.currentWidget = nextParagraph.firstChild;
                this.offset = isHighlight ? 1 : this.selection.getStartLineOffset(this.currentWidget);
            }
            else {
                this.currentWidget = nextParagraph.childWidgets[nextParagraph.childWidgets.length - 1];
                this.offset = this.selection.getLineLength(this.currentWidget) + 1;
            }
        }
        var inlineObj = this.currentWidget.getInline(this.offset, indexInInline);
        inline = inlineObj.element;
        indexInInline = inlineObj.index;
        if (inline instanceof FieldElementBox && inline.fieldType === 0) {
            this.offset++;
        }
    };
    TextPosition.prototype.updateOffsetToPrevPosition = function (index, isHighlight) {
        var inlineInfo;
        var inline;
        var lineIndex = this.paragraph.childWidgets.indexOf(this.currentWidget);
        var prevOffset = this.selection.getPreviousValidOffset(this.currentWidget.paragraph, this.offset);
        if (this.offset > prevOffset) {
            this.offset = prevOffset;
        }
        else if (lineIndex > 0) {
            var prevLineWidget = this.paragraph.childWidgets[lineIndex - 1];
            if (prevLineWidget) {
                this.currentWidget = prevLineWidget;
                var endOffset = this.currentWidget.getEndOffset();
                this.offset = endOffset > 0 ? endOffset - 1 : endOffset;
            }
        }
        else {
            //Moves to owner and get previous paragraph.
            var previousParagraph = undefined;
            var positionAtStart = false;
            if (!isHighlight) {
                previousParagraph = this.selection.getPreviousParagraphBlock(this.paragraph);
            }
            else {
                previousParagraph = this.selection.getPreviousSelectionBlock(this.paragraph);
                if (!isNullOrUndefined(previousParagraph)) {
                    if (previousParagraph.containerWidget instanceof TableCellWidget) {
                        if (this.selection.start.paragraph.isInsideTable) {
                            var containerCell = this.selection.getContainerCellOf(this.selection.start.paragraph.associatedCell, previousParagraph.associatedCell);
                            positionAtStart = !containerCell.ownerTable.contains(previousParagraph.associatedCell);
                        }
                        else {
                            positionAtStart = true;
                        }
                    }
                }
            }
            if (!isNullOrUndefined(previousParagraph)) {
                if (!positionAtStart) {
                    this.currentWidget = previousParagraph.childWidgets[previousParagraph.childWidgets.length - 1];
                    // line end with page break and updating offset before page break.
                    this.offset = this.currentWidget.isEndsWithPageBreak ? this.currentWidget.getEndOffset() - 1 : this.currentWidget.getEndOffset();
                }
                else {
                    this.currentWidget = previousParagraph.firstChild;
                    this.offset = this.selection.getStartLineOffset(this.currentWidget);
                }
            }
        }
        index = 0;
        inlineInfo = this.currentWidget.getInline(this.offset, index);
        inline = inlineInfo.element;
        index = inlineInfo.index;
        if (inline instanceof FieldElementBox && inline.fieldType === 0) {
            this.offset++;
        }
        if (inline instanceof FieldElementBox) {
            //Checks if field character is part of rendered field, otherwise moves to previous rendered content.
            var previousInline = this.selection.getPreviousValidElement(inline);
            if (!isNullOrUndefined(previousInline)) {
                inline = previousInline;
                this.currentWidget = inline.line;
                this.offset = this.currentWidget.getOffset(inline, inline.length);
                if (inline instanceof FieldElementBox && inline.fieldType === 0) {
                    this.offset--;
                }
            }
        }
        //Gets physical position in current page.
        this.updatePhysicalPosition(true);
    };
    /**
     * Moves the text position to start of the next paragraph.
     */
    TextPosition.prototype.moveToNextParagraphStartInternal = function () {
        var paragraph = this.currentWidget.paragraph;
        if (!isNullOrUndefined(this.selection.getNextParagraphBlock(paragraph))) {
            this.currentWidget = this.selection.getNextParagraphBlock(paragraph).firstChild;
            this.offset = this.selection.getStartOffset(paragraph);
            this.updatePhysicalPosition(true);
        }
    };
    /**
     * Move to previous position
     *
     * @private
     */
    TextPosition.prototype.movePreviousPosition = function () {
        var index = 0;
        var inlineInfo = this.currentWidget.getInline(this.offset, index);
        var inline = inlineInfo.element;
        index = inlineInfo.index;
        var lineIndex = this.paragraph.childWidgets.indexOf(this.currentWidget);
        if (inline instanceof FieldElementBox && inline.fieldType === 1 && !isNullOrUndefined(inline.fieldBegin)
            || inline instanceof BookmarkElementBox && inline.bookmarkType === 1) {
            this.movePreviousPositionInternal(inline);
        }
        this.updateOffsetToPrevPosition(index, false);
    };
    /**
     * Move to next position
     *
     * @private
     */
    TextPosition.prototype.moveNextPositionInternal = function (fieldBegin) {
        var inline;
        if (isNullOrUndefined(fieldBegin.fieldSeparator)) {
            inline = fieldBegin.fieldEnd;
        }
        else {
            inline = fieldBegin.fieldSeparator;
            this.currentWidget = inline.line;
            if (this.currentWidget === fieldBegin.fieldEnd.line && !this.selection.hasValidInline(this.paragraph, inline, fieldBegin.fieldEnd)) {
                inline = fieldBegin.fieldEnd;
            }
        }
        this.currentWidget = inline.line;
        this.offset = this.currentWidget.getOffset(inline, 1);
    };
    /**
     * Move text position backward
     *
     * @private
     */
    TextPosition.prototype.moveBackward = function () {
        var indexInInline = 0;
        var inlineObj = this.currentWidget.getInline(this.offset, indexInInline);
        var inline = inlineObj.element;
        indexInInline = inlineObj.index;
        if (!this.owner.selection.isEmpty && !isNullOrUndefined(inline)) {
            var nextInline = this.selection.getNextRenderedElementBox(inline, indexInInline);
            if (nextInline instanceof FieldElementBox && nextInline.fieldType === 0) {
                var hierarchicalIndex = this.owner.selection.start.getHierarchicalIndexInternal();
                var fieldEndOffset = nextInline.fieldEnd.line.getOffset(nextInline.fieldEnd, 1);
                var fieldEndIndex = this.getHierarchicalIndex(nextInline.fieldEnd.line, fieldEndOffset.toString());
                if (!TextPosition.isForwardSelection(fieldEndIndex, hierarchicalIndex)) {
                    //If field end is after selection start, move selection start to field end.
                    this.owner.selection.start.setPositionParagraph(nextInline.fieldEnd.line, fieldEndOffset);
                    return;
                }
            }
        }
        if (inline instanceof FieldElementBox && inline.fieldType === 1 && !isNullOrUndefined(inline.fieldBegin)) {
            var hierarchicalIndex = this.owner.selection.start.getHierarchicalIndexInternal();
            var fieldEndOffset = inline.line.getOffset(inline, 1);
            var fieldEndIndex = this.getHierarchicalIndex(inline.line, fieldEndOffset.toString());
            if (!TextPosition.isForwardSelection(hierarchicalIndex, fieldEndIndex)) {
                //If field end is after selection start, extend selection end to field begin.
                var fieldBeginOffset = inline.fieldBegin.line.getOffset(inline.fieldBegin, 0);
                this.currentWidget = inline.fieldBegin.line;
                this.offset = fieldBeginOffset;
                //Updates physical position in current page.
                this.updatePhysicalPosition(true);
                return;
            }
            this.movePreviousPositionInternal(inline);
        }
        this.updateOffsetToPrevPosition(indexInInline, true);
    };
    /**
     * Move text position forward
     *
     * @private
     */
    TextPosition.prototype.moveForward = function () {
        var indexInInline = 0;
        var inlineObj = this.currentWidget.getInline(this.offset, indexInInline);
        var inline = inlineObj.element;
        indexInInline = inlineObj.index;
        if (!isNullOrUndefined(inline)) {
            if (!this.owner.selection.isEmpty && indexInInline === inline.length && inline instanceof FieldElementBox
                && inline.fieldType === 1) {
                var hierarchicalIndex = this.owner.selection.start.getHierarchicalIndexInternal();
                var fieldBeginOffset = inline.fieldBegin.line.getOffset(inline.fieldBegin, 0);
                var fieldBeginIndex = this.getHierarchicalIndex(inline.fieldBegin.line, fieldBeginOffset.toString());
                if (!TextPosition.isForwardSelection(hierarchicalIndex, fieldBeginIndex)) {
                    //If field begin is before selection start, move selection start to field begin.
                    this.owner.selection.start.setPositionParagraph(inline.fieldBegin.line, fieldBeginOffset);
                    return;
                }
            }
            inline = this.selection.getNextRenderedElementBox(inline, indexInInline);
        }
        if (inline instanceof FieldElementBox && !isNullOrUndefined(inline.fieldEnd)) {
            var selectionStartParagraph = this.owner.selection.start.paragraph;
            var selectionStartIndex = 0;
            var selectionStartInlineObj = selectionStartParagraph.getInline(this.owner.selection.start.offset, selectionStartIndex);
            var selectionStartInline = selectionStartInlineObj.element;
            selectionStartIndex = selectionStartInlineObj.index;
            var nextRenderInline = this.selection.getNextRenderedElementBox(selectionStartInline, selectionStartIndex);
            if (nextRenderInline === inline) {
                this.moveNextPositionInternal(inline);
            }
            else {
                //If selection start is before field begin, extend selection end to field end.
                inline = inline.fieldEnd;
                this.currentWidget = inline.line;
                this.offset = this.currentWidget.getOffset(inline, 1);
                //Updates physical position in current page.
                this.updatePhysicalPosition(true);
                return;
            }
        }
        else if ((inline instanceof FieldElementBox)
            && (inline.fieldType === 0 || inline.fieldType === 1)) {
            this.currentWidget = inline.line;
            this.offset = this.currentWidget.getOffset(inline, 1);
        }
        indexInInline = 0;
        var nextOffset = this.selection.getNextValidOffset(this.currentWidget, this.offset);
        var length = this.selection.getLineLength(this.currentWidget);
        var isParagraphEnd = this.selection.isParagraphLastLine(this.currentWidget);
        if (this.offset < nextOffset) {
            this.offset = nextOffset;
            var inlineObj_1 = this.currentWidget.getInline(this.offset, indexInInline);
            inline = inlineObj_1.element;
            indexInInline = inlineObj_1.index;
            if (!isNullOrUndefined(inline) && indexInInline === inline.length && inline.nextNode instanceof FieldElementBox) {
                var nextValidInline = this.selection.getNextValidElement(inline.nextNode);
                //Moves to field end mark.
                if (nextValidInline instanceof FieldElementBox && nextValidInline.fieldType === 1) {
                    inline = nextValidInline;
                    this.offset = this.currentWidget.getOffset(inline, 1);
                }
            }
        }
        else if (this.offset === nextOffset && inline instanceof FieldElementBox && inline.fieldType === 1 &&
            inline.previousNode instanceof ImageElementBox) {
            this.offset = nextOffset;
        }
        else if (this.offset === nextOffset && this.offset < length + 1 && isParagraphEnd) {
            this.offset = length + 1;
        }
        else {
            this.updateOffsetToNextParagraph(indexInInline, true);
        }
        //Gets physical position in current page.
        this.updatePhysicalPosition(true);
    };
    /**
     * Move to given inline
     *
     * @private
     */
    TextPosition.prototype.moveToInline = function (inline, index) {
        this.currentWidget = inline.line;
        this.offset = this.currentWidget.getOffset(inline, index);
        //Updates physical position in current page.
        this.updatePhysicalPosition(true);
    };
    /**
     * Return true is start element exist before end element
     *
     * @private
     */
    TextPosition.isForwardSelection = function (start, end) {
        if (start === end) {
            return true;
        }
        start = start.replace(/C;/g, '');
        end = end.replace(/C;/g, '');
        start = start.replace(/H;/g, '');
        end = end.replace(/H;/g, '');
        start = start.replace(/F;/g, '');
        end = end.replace(/F;/g, '');
        var selectionStart = start.split(';');
        var selectionEnd = end.split(';');
        var length = selectionStart.length;
        if (length > selectionEnd.length) {
            length = selectionEnd.length - 1;
        }
        for (var i = 0; i < length; i++) {
            var startOffset = parseFloat(selectionStart[i]);
            var endOffset = parseFloat(selectionEnd[i]);
            if (startOffset !== endOffset) {
                return startOffset < endOffset;
            }
        }
        return false;
    };
    /**
     * Move to previous position offset
     *
     * @param fieldEnd
     * @private
     */
    TextPosition.prototype.movePreviousPositionInternal = function (fieldEnd) {
        var inline;
        if (fieldEnd instanceof FieldElementBox && isNullOrUndefined(fieldEnd.fieldSeparator)) {
            inline = this.selection.getPreviousValidElement(fieldEnd.fieldBegin);
        }
        else {
            inline = this.selection.getPreviousValidElement(fieldEnd);
        }
        this.currentWidget = inline.line;
        var index = inline instanceof FieldElementBox || inline instanceof BookmarkElementBox && inline.bookmarkType === 1 ? 0 : inline.length;
        this.offset = this.currentWidget.getOffset(inline, index);
    };
    /**
     * Moves the text position to start of the word.
     *
     * @param type
     * @private
     */
    TextPosition.prototype.moveToWordStartInternal = function (type) {
        var endOffset = this.currentWidget.getEndOffset();
        var currentPara = this.currentWidget.paragraph;
        var selection = this.selection;
        if (type === 2 && (this.offset === endOffset || this.offset === endOffset + 1)) {
            return;
        }
        if (this.offset === endOffset + 1) {
            this.offset = endOffset;
        }
        else if (this.offset === selection.getStartOffset(currentPara) && this.currentWidget === currentPara.childWidgets[0]) {
            var previousParagraph = selection.getPreviousParagraphBlock(currentPara);
            if (isNullOrUndefined(previousParagraph)) {
                return;
            }
            this.currentWidget = previousParagraph.childWidgets[previousParagraph.childWidgets.length - 1];
            this.offset = this.currentWidget.getEndOffset();
        }
        else {
            if (this.offset === selection.getStartLineOffset(this.currentWidget)) {
                var lineIndex = currentPara.childWidgets.indexOf(this.currentWidget);
                if (lineIndex - 1 >= 0) {
                    this.currentWidget = currentPara.childWidgets[lineIndex - 1];
                    this.offset = this.currentWidget.getEndOffset();
                }
            }
            var isStarted = false;
            var endSelection = false;
            var indexInInline = 0;
            var inlineObj = this.currentWidget.getInline(this.offset, indexInInline);
            var inline = inlineObj.element;
            indexInInline = inlineObj.index;
            this.getPreviousWordOffset(inline, selection, indexInInline, type, (inline instanceof FieldElementBox && inline.fieldType === 1), isStarted, endSelection, this);
        }
        if (type === 1) {
            this.calculateOffset();
        }
        this.updatePhysicalPosition(true);
    };
    TextPosition.prototype.getNextWordOffset = function (inline, indexInInline, type, isInField, endSelection, endPosition, excludeSpace) {
        if (inline instanceof TextElementBox) {
            this.getNextWordOffsetSpan(inline, indexInInline, type, isInField, endSelection, endPosition, excludeSpace);
        }
        else if (inline instanceof ImageElementBox) {
            this.getNextWordOffsetImage(inline, indexInInline, type, isInField, endSelection, endPosition, excludeSpace);
        }
        else if (inline instanceof FieldElementBox && inline.fieldType === 0) {
            this.getNextWordOffsetFieldBegin(inline, indexInInline, type, isInField, endSelection, endPosition, excludeSpace);
        }
        else if (inline instanceof FieldElementBox && inline.fieldType === 2 || inline instanceof BookmarkElementBox) {
            this.getNextWordOffsetFieldSeparator(inline, indexInInline, type, isInField, endSelection, endPosition, excludeSpace);
        }
        else if (inline instanceof FieldElementBox && inline.fieldType === 1) {
            this.getNextWordOffsetFieldEnd(inline, indexInInline, type, isInField, endSelection, endPosition, excludeSpace);
        }
        else if (inline instanceof CommentCharacterElementBox) {
            this.getNextWordOffsetComment(inline, indexInInline, type, isInField, endSelection, endPosition, excludeSpace);
        }
    };
    TextPosition.prototype.getNextWordOffsetFieldBegin = function (fieldBegin, indexInInline, type, isInField, endSelection, endPosition, excludeSpace) {
        var startOffset = fieldBegin.line.getOffset(fieldBegin, 0);
        var endOffset = startOffset + fieldBegin.length;
        if (isNullOrUndefined(fieldBegin.fieldSeparator)) {
            this.getNextWordOffsetFieldEnd(fieldBegin.fieldEnd, 0, type, isInField, endSelection, endPosition, excludeSpace);
        }
        else if (type === 0) {
            this.getNextWordOffsetFieldSeparator(fieldBegin.fieldSeparator, 0, type, isInField, endSelection, endPosition, excludeSpace);
        }
        else if (!isNullOrUndefined(fieldBegin.fieldEnd)) {
            var inline = fieldBegin.fieldSeparator;
            if (inline.line.paragraph === fieldBegin.fieldEnd.line.paragraph && !this.selection.hasValidInline(inline.line.paragraph, inline, fieldBegin.fieldEnd)) {
                inline = fieldBegin.fieldEnd;
            }
            this.getNextWordOffset(inline, 0, type, !(endPosition.paragraph === fieldBegin.line.paragraph && endPosition.offset === startOffset), endSelection, endPosition, excludeSpace);
            if (endSelection && !isNullOrUndefined(fieldBegin.fieldSeparator) && (endPosition.paragraph === fieldBegin.line.paragraph) && (endPosition.offset === fieldBegin.fieldSeparator.line.getOffset(fieldBegin.fieldSeparator, fieldBegin.fieldSeparator.length))) {
                endPosition.setPositionParagraph(fieldBegin.line, startOffset);
                return;
            }
            if (!endSelection) {
                endPosition.setPositionParagraph(fieldBegin.fieldEnd.line, fieldBegin.fieldEnd.line.getOffset(fieldBegin.fieldEnd, fieldBegin.fieldEnd.length));
            }
        }
    };
    TextPosition.prototype.getNextWordOffsetImage = function (image, indexInInline, type, isInField, endSelection, endPosition, excludeSpace) {
        if (isInField) {
            endPosition.setPositionParagraph(image.line, image.line.getOffset(image, indexInInline));
            endSelection = false;
            return;
        }
        if (indexInInline === 0) {
            var startOffset = image.line.getOffset(image, 0);
            endSelection = true;
            if (endPosition.offset === startOffset) {
                if (isNullOrUndefined(image.nextNode)) {
                    endPosition.setPositionParagraph(image.line, startOffset + image.length);
                }
                else {
                    this.getNextWordOffset(image.nextNode, 0, type, isInField, endSelection, endPosition, excludeSpace);
                }
            }
            else {
                endPosition.setPositionParagraph(image.line, startOffset);
            }
        }
        else if (!isNullOrUndefined(image.nextNode)) {
            this.getNextWordOffset(image.nextNode, 0, type, isInField, endSelection, endPosition, excludeSpace);
        }
    };
    TextPosition.prototype.getNextWordOffsetSpan = function (span, indexInInline, type, isInField, endSelection, endPosition, excludeSpace) {
        if (span.text === '\t' || span.text === '\v') {
            if (isInField) {
                endPosition.setPositionParagraph(span.line, span.line.getOffset(span, indexInInline));
                endSelection = false;
                return;
            }
            if (indexInInline === 0) {
                endSelection = true;
                var startOffset = span.line.getOffset(span, 0);
                if (endPosition.offset === startOffset) {
                    endPosition.setPositionParagraph(span.line, startOffset + span.length);
                }
                else {
                    endPosition.setPositionParagraph(span.line, startOffset);
                }
            }
            else if (!isNullOrUndefined(span.nextNode)) {
                this.getNextWordOffset(span.nextNode, 0, type, isInField, endSelection, endPosition, excludeSpace);
            }
        }
        else {
            var wordEndIndex = 0;
            if (indexInInline === 0 && endSelection && (HelperMethods.wordSplitCharacters.indexOf(span.text[0]) === -1)) {
                endPosition.setPositionParagraph(span.line, span.line.getOffset(span, indexInInline));
                if (isInField) {
                    return;
                }
            }
            else if (indexInInline < span.length) {
                var txt = indexInInline > 0 && span.text.length - 1 >= indexInInline ? span.text.slice(indexInInline, span.length) : span.text;
                wordEndIndex = HelperMethods.indexOfAny(txt, HelperMethods.wordSplitCharacters);
                if (wordEndIndex === -1 && span.nextNode instanceof CommentCharacterElementBox &&
                    isNullOrUndefined(span.nextNode.nextNode)) {
                    wordEndIndex = span.length;
                }
                if (wordEndIndex !== -1) {
                    if (isInField) {
                        endSelection = false;
                        return;
                    }
                    var offset = span.line.getOffset(span, wordEndIndex + indexInInline);
                    if ((excludeSpace || txt[wordEndIndex] !== ' ') && !endSelection && span.line.paragraph === endPosition.paragraph && offset !== endPosition.offset) {
                        endSelection = true;
                        endPosition.setPositionParagraph(span.line, offset);
                        return;
                    }
                    wordEndIndex++;
                    while (wordEndIndex < txt.length && HelperMethods.wordSplitCharacters.indexOf(txt[wordEndIndex]) !== -1) {
                        if (txt[wordEndIndex] !== ' ' && txt[wordEndIndex] !== '　') {
                            break;
                        }
                        wordEndIndex++;
                    }
                    endSelection = true;
                    if (wordEndIndex < txt.length) {
                        endPosition.setPositionParagraph(span.line, span.line.getOffset(span, wordEndIndex + indexInInline));
                    }
                    else if (!isNullOrUndefined(span.nextNode)) {
                        this.getNextWordOffset(span.nextNode, 0, type, isInField, endSelection, endPosition, excludeSpace);
                    }
                    else {
                        endPosition.setPositionParagraph(span.line, span.line.getOffset(span, wordEndIndex + indexInInline));
                    }
                }
                else if (!isNullOrUndefined(span.nextNode)) {
                    this.getNextWordOffset(span.nextNode, 0, type, isInField, endSelection, endPosition, excludeSpace);
                }
                else {
                    endPosition.setPositionParagraph(span.line, span.line.getEndOffset());
                }
            }
            else if (!isNullOrUndefined(span.nextNode)) {
                this.getNextWordOffset(span.nextNode, 0, type, isInField, endSelection, endPosition, excludeSpace);
            }
        }
    };
    TextPosition.prototype.getNextWordOffsetFieldSeparator = function (fieldSeparator, indexInInline, type, isInField, endSelection, endPosition, excludeSpace) {
        if (!isNullOrUndefined(fieldSeparator.nextNode)) {
            this.getNextWordOffset(fieldSeparator.nextNode, 0, type, isInField, endSelection, endPosition, excludeSpace);
        }
    };
    TextPosition.prototype.getNextWordOffsetComment = function (comment, indexInInline, type, isInField, endSelection, endPosition, excludeSpace) {
        if (!isNullOrUndefined(comment.nextNode)) {
            this.getNextWordOffset(comment.nextNode, 0, type, isInField, endSelection, endPosition, excludeSpace);
        }
    };
    TextPosition.prototype.getNextWordOffsetFieldEnd = function (fieldEnd, indexInInline, type, isInField, endSelection, endPosition, excludeSpace) {
        var startOffset = fieldEnd.line.getOffset(fieldEnd, 0);
        var endOffset = startOffset + fieldEnd.length;
        if (endPosition.offset === startOffset) {
            endPosition.setPositionParagraph(fieldEnd.line, endOffset);
            if (isNullOrUndefined(fieldEnd.nextNode)) {
                return;
            }
        }
        if (!isNullOrUndefined(fieldEnd.nextNode)) {
            this.getNextWordOffset(fieldEnd.nextNode, 0, type, false, endSelection, endPosition, excludeSpace);
            if (endPosition.offset === endOffset) {
                endPosition.setPositionParagraph(fieldEnd.line, startOffset);
            }
        }
        else {
            endPosition.setPositionParagraph(fieldEnd.line, startOffset);
        }
        endSelection = true;
    };
    TextPosition.prototype.getPreviousWordOffset = function (inline, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition) {
        if (inline instanceof TextElementBox) {
            this.getPreviousWordOffsetSpan(inline, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
        }
        else if (inline instanceof ImageElementBox) {
            this.getPreviousWordOffsetImage(inline, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
        }
        else if (inline instanceof FieldElementBox && inline.fieldType === 0) {
            this.getPreviousWordOffsetFieldBegin(inline, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
        }
        else if (inline instanceof FieldElementBox && inline.fieldType === 2) {
            this.getPreviousWordOffsetFieldSeparator(inline, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
        }
        else if (inline instanceof FieldElementBox && inline.fieldType === 1) {
            this.getPreviousWordOffsetFieldEnd(inline, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
        }
        else if (inline instanceof BookmarkElementBox) {
            this.getPreviousWordOffsetBookMark(inline, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
        }
        else if (inline instanceof ListTextElementBox && inline.previousNode) {
            this.getPreviousWordOffsetSpan(inline.previousNode, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
        }
        else if (inline instanceof CommentCharacterElementBox) {
            this.getPreviousWordOffsetComment(inline, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
        }
    };
    TextPosition.prototype.getPreviousWordOffsetBookMark = function (bookmark, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition) {
        if (bookmark.previousNode) {
            if (bookmark.previousNode instanceof TextElementBox) {
                var inline = bookmark.previousNode;
                if (HelperMethods.lastIndexOfAny(inline.text, HelperMethods.wordSplitCharacters) !== inline.text.length - 1) {
                    this.getPreviousWordOffset(inline, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
                }
                else {
                    endPosition.setPositionParagraph(bookmark.line, bookmark.line.getOffset(bookmark, 0));
                }
            }
        }
        else {
            endPosition.setPositionParagraph(bookmark.line, selection.getStartLineOffset(bookmark.line));
        }
    };
    TextPosition.prototype.getPreviousWordOffsetFieldEnd = function (fieldEnd, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition) {
        var startOffset = fieldEnd.line.getOffset(fieldEnd, 0);
        var endOffset = startOffset + fieldEnd.length;
        if (isNullOrUndefined(fieldEnd.fieldSeparator)) {
            this.getPreviousWordOffsetFieldBegin(fieldEnd.fieldBegin, selection, 0, type, isInField, isStarted, endSelection, endPosition);
        }
        else if (type === 0 && !isNullOrUndefined(fieldEnd.previousNode)) {
            var inline = fieldEnd.previousNode;
            this.getPreviousWordOffset(inline, selection, inline.length, type, (inline instanceof FieldElementBox && inline.fieldType === 1), isStarted, endSelection, endPosition);
        }
        else if (!isNullOrUndefined(fieldEnd.fieldBegin) && type !== 0) {
            var inline = fieldEnd.previousNode;
            if (isNullOrUndefined(inline) || (inline.line.paragraph === fieldEnd.fieldBegin.line.paragraph && !selection.hasValidInline(inline.line.paragraph, inline, fieldEnd.fieldBegin))) {
                inline = fieldEnd.fieldBegin;
            }
            this.getPreviousWordOffset(inline, selection, inline.length, type, !(endPosition.paragraph === fieldEnd.line.paragraph && endPosition.offset === endOffset), isStarted, endSelection, endPosition);
            if (endSelection && endPosition.paragraph === fieldEnd.line.paragraph
                && endPosition.offset === startOffset) {
                endPosition.setPositionParagraph(fieldEnd.line, endOffset);
                return;
            }
            if (!endSelection) {
                endPosition.setPositionParagraph(fieldEnd.fieldBegin.line, fieldEnd.fieldBegin.line.getOffset(fieldEnd.fieldBegin, 0));
            }
        }
    };
    TextPosition.prototype.getPreviousWordOffsetFieldSeparator = function (fieldSeparator, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition) {
        this.getPreviousWordOffsetFieldBegin(fieldSeparator.fieldBegin, selection, fieldSeparator.fieldBegin.length, type, isInField, isStarted, endSelection, endPosition);
    };
    /* get previous word offset from comment
    * @private
    */
    TextPosition.prototype.getPreviousWordOffsetComment = function (comment, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition) {
        if (comment.previousNode) {
            var inline = comment.previousNode;
            if (comment.previousNode instanceof TextElementBox
                && HelperMethods.lastIndexOfAny(inline.text, HelperMethods.wordSplitCharacters) !== inline.text.length - 1) {
                this.getPreviousWordOffset(inline, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
            }
            else {
                this.getPreviousWordOffset(comment.previousNode, selection, comment.previousNode.length, type, isInField, isStarted, endSelection, endPosition);
            }
        }
        else {
            endPosition.setPositionParagraph(comment.line, selection.getStartLineOffset(comment.line));
        }
    };
    TextPosition.prototype.getPreviousWordOffsetFieldBegin = function (fieldBegin, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition) {
        var startOffset = fieldBegin.line.getOffset(fieldBegin, 0);
        var endOffset = startOffset + fieldBegin.length;
        if (endPosition.offset === endOffset) {
            endPosition.setPositionParagraph(fieldBegin.line, startOffset);
        }
        if (!isNullOrUndefined(fieldBegin.previousNode)) {
            this.getPreviousWordOffset(fieldBegin.previousNode, selection, fieldBegin.previousNode.length, type, false, isStarted, endSelection, endPosition);
            if (endPosition.offset === startOffset) {
                if (type !== 0 && !isNullOrUndefined(fieldBegin.fieldSeparator)) {
                    endPosition.setPositionParagraph(fieldBegin.line, fieldBegin.fieldSeparator.line.getOffset(fieldBegin.fieldSeparator, fieldBegin.fieldSeparator.length));
                }
            }
        }
        else {
            if (fieldBegin.fieldSeparator) {
                endPosition.setPositionParagraph(fieldBegin.line, fieldBegin.fieldSeparator.line.getOffset(fieldBegin.fieldSeparator, fieldBegin.fieldSeparator.length));
            }
            else {
                endPosition.setPositionParagraph(fieldBegin.line, selection.getStartLineOffset(fieldBegin.line));
            }
        }
    };
    TextPosition.prototype.getPreviousWordOffsetImage = function (image, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition) {
        if (isInField) {
            endPosition.setPositionParagraph(image.line, image.line.getOffset(image, indexInInline));
            endSelection = false;
            return;
        }
        if (indexInInline === image.length) {
            var endOffset = image.line.getOffset(image, image.length);
            if (endOffset === endPosition.offset) {
                endPosition.setPositionParagraph(image.line, endOffset - image.length);
            }
            else {
                endPosition.setPositionParagraph(image.line, endOffset);
            }
        }
        else if (!isNullOrUndefined(image.previousNode)) {
            this.getPreviousWordOffset(image.previousNode, selection, image.previousNode.length, type, isInField, isStarted, endSelection, endPosition);
        }
    };
    TextPosition.prototype.getPreviousWordOffsetSpan = function (span, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition) {
        if (span.text === '\t' || span.text === '\v') {
            if (isInField) {
                endSelection = false;
                return;
            }
            if (indexInInline === span.length) {
                endSelection = true;
                var endOffset = span.line.getOffset(span, span.length);
                if (endOffset === endPosition.offset) {
                    endPosition.setPositionParagraph(span.line, endOffset - span.length);
                }
                else {
                    endPosition.setPositionParagraph(span.line, endOffset);
                }
            }
            else if (!isNullOrUndefined(span.previousNode)) {
                this.getPreviousWordOffset(span.previousNode, selection, span.previousNode.length, type, isInField, isStarted, endSelection, endPosition);
            }
        }
        else {
            var wordStartIndex = 0;
            if (!isStarted) {
                while (indexInInline > 0 && span.text[indexInInline - 1] === ' ') {
                    indexInInline--;
                }
                endPosition.setPositionParagraph(span.line, span.line.getOffset(span, indexInInline));
            }
            if (indexInInline > 0) {
                isStarted = true;
                if (indexInInline === 0 && endSelection && (HelperMethods.wordSplitCharacters.indexOf(span.text[0])) === -1) {
                    endPosition.setPositionParagraph(span.line, span.line.getOffset(span, indexInInline));
                    endSelection = true;
                    return;
                }
                var txt = span.text.length > indexInInline ? span.text.slice(0, indexInInline) : span.text;
                wordStartIndex = HelperMethods.lastIndexOfAny(txt, HelperMethods.wordSplitCharacters);
                if (wordStartIndex === -1 && span.previousElement instanceof CommentCharacterElementBox && isNullOrUndefined(span.previousNode.previousNode)) {
                    wordStartIndex = span.length;
                }
                if (wordStartIndex !== -1) {
                    if (isInField) {
                        endSelection = false;
                        return;
                    }
                    while (wordStartIndex > 0 && endSelection && txt[wordStartIndex] !== ' '
                        && (HelperMethods.wordSplitCharacters.indexOf(txt[wordStartIndex - 1])) !== -1) {
                        wordStartIndex--;
                    }
                    if (txt[wordStartIndex] === ' ' || txt[wordStartIndex] === '　' || !endSelection) {
                        wordStartIndex++;
                    }
                    endSelection = true;
                    if (wordStartIndex > 0) {
                        var offset = span.line.getOffset(span, wordStartIndex);
                        if (span.line.paragraph === endPosition.paragraph && offset === endPosition.offset) {
                            this.getPreviousWordOffsetSpan(span, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
                        }
                        else {
                            endPosition.setPositionParagraph(span.line, offset);
                        }
                    }
                    else if (span.previousNode instanceof TextElementBox) {
                        this.getPreviousWordOffset(span.previousNode, selection, span.previousNode.length, type, isInField, isStarted, endSelection, endPosition);
                    }
                    else {
                        endPosition.setPositionParagraph(span.line, span.line.getOffset(span, 0));
                    }
                }
                else {
                    this.setPreviousWordOffset(span, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
                }
            }
            else {
                this.setPreviousWordOffset(span, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition);
            }
        }
    };
    TextPosition.prototype.setPreviousWordOffset = function (span, selection, indexInInline, type, isInField, isStarted, endSelection, endPosition) {
        if (span.previousNode instanceof ElementBox && span.line === span.previousNode.line) {
            this.getPreviousWordOffset(span.previousNode, selection, span.previousNode.length, type, isInField, isStarted, endSelection, endPosition);
        }
        else {
            endPosition.setPositionParagraph(span.line, selection.getStartLineOffset(span.line));
        }
    };
    /**
     * Validate if text position is in field forward
     *
     * @private
     */
    TextPosition.prototype.validateForwardFieldSelection = function (currentIndex, selectionEndIndex) {
        var textPosition = new TextPosition(this.owner);
        textPosition.setPositionForCurrentIndex(currentIndex);
        textPosition.isUpdateLocation = false;
        var isPositionMoved = false;
        if (this.selection.start.paragraph !== this.selection.end.paragraph
            || this.selection.start.offset === this.selection.getStartOffset(this.selection.start.paragraph)) {
            // To select Paragraph mark similar to MS WORD
            if (this.selection.end.offset === this.selection.end.currentWidget.getEndOffset()
                && this.selection.isParagraphLastLine(this.selection.end.currentWidget)) {
                this.selection.end.setPositionParagraph(this.selection.end.currentWidget, this.selection.end.offset + 1);
            }
        }
        while (currentIndex !== selectionEndIndex && TextPosition.isForwardSelection(currentIndex, selectionEndIndex)) {
            if (!isPositionMoved) {
                textPosition.moveNextPosition(false);
                var nextIndex = textPosition.getHierarchicalIndexInternal();
                //Handled specifically to break infinite looping, if selection ends at last paragraph mark.
                if (currentIndex === nextIndex) {
                    break;
                }
            }
            var indexInInline = 0;
            var inlineObj = textPosition.currentWidget.getInline(textPosition.offset, indexInInline);
            var inline = inlineObj.element;
            indexInInline = inlineObj.index;
            if (!isNullOrUndefined(inline)) {
                var selectionStartIndex = this.selection.start.getHierarchicalIndexInternal();
                if (indexInInline === inline.length && inline instanceof FieldElementBox && inline.fieldType === 1) {
                    if (inline.line.getOffset(inline, 0) === this.offset) {
                        return;
                    }
                    var lineWidget = inline.fieldBegin.line;
                    var fieldBeginOffset = lineWidget.getOffset(inline.fieldBegin, 0);
                    var fieldBeginIndex = this.getHierarchicalIndex(lineWidget, fieldBeginOffset.toString());
                    if (!TextPosition.isForwardSelection(selectionStartIndex, fieldBeginIndex)) {
                        this.selection.start.setPositionParagraph(lineWidget, fieldBeginOffset);
                    }
                }
                var nextInline = this.selection.getNextRenderedElementBox(inline, indexInInline);
                if (!isNullOrUndefined(nextInline) && nextInline instanceof ElementBox) {
                    inline = nextInline;
                }
            }
            isPositionMoved = (inline instanceof FieldElementBox && inline.fieldType === 0 && !isNullOrUndefined(inline.fieldEnd));
            if (isPositionMoved) {
                if (inline.line.getOffset(inline, 0) === this.offset) {
                    return;
                }
                var fieldEnd = inline.fieldEnd;
                var paragraph = fieldEnd.line.paragraph;
                var fieldEndOffset = fieldEnd.line.getOffset(fieldEnd, 1);
                var fieldEndIndex = this.getHierarchicalIndex(fieldEnd.line, fieldEndOffset.toString());
                if (!TextPosition.isForwardSelection(fieldEndIndex, selectionEndIndex)) {
                    //If selection end is after field begin, extend selection end to field end.
                    this.moveToInline(inline.fieldEnd, 1);
                    return;
                }
                textPosition.moveToInline(inline.fieldEnd, 1);
            }
            currentIndex = textPosition.getHierarchicalIndexInternal();
        }
    };
    /**
     * Validate if text position is in field backward
     *
     * @private
     */
    TextPosition.prototype.validateBackwardFieldSelection = function (currentIndex, selectionEndIndex) {
        var textPosition = new TextPosition(this.owner);
        textPosition.setPositionForCurrentIndex(currentIndex);
        textPosition.isUpdateLocation = false;
        var isSelectParaMark = false;
        if ((this.selection.start.paragraph !== this.selection.end.paragraph
            && this.selection.end.offset !== this.selection.getStartOffset(this.selection.start.paragraph)) ||
            (this.documentHelper.isSelectionChangedOnMouseMoved && this.selection.isParagraphFirstLine(this.selection.end.currentWidget)
                && this.selection.end.offset === this.selection.getStartOffset(this.selection.start.paragraph))) {
            isSelectParaMark = true;
        }
        // To select Paragraph mark similar to MS WORD
        if (isSelectParaMark && this.selection.start.offset === this.selection.start.currentWidget.getEndOffset()
            && this.selection.isParagraphLastLine(this.selection.start.currentWidget)) {
            this.selection.start.setPositionParagraph(this.selection.start.currentWidget, this.selection.start.offset + 1);
        }
        var selectionStartIndex = this.selection.start.getHierarchicalIndexInternal();
        while (currentIndex !== selectionEndIndex && TextPosition.isForwardSelection(selectionEndIndex, currentIndex)) {
            var indexInInline = 0;
            var inlineObj = textPosition.currentWidget.getInline(textPosition.offset, indexInInline);
            var inline = inlineObj.element;
            indexInInline = inlineObj.index;
            if (!isNullOrUndefined(inline)) {
                var nextInline = this.selection.getNextRenderedElementBox(inline, indexInInline);
                if (nextInline instanceof FieldElementBox && nextInline.fieldType === 0) {
                    var paragraph = nextInline.fieldEnd.line;
                    var fieldEndOffset = paragraph.getOffset(nextInline.fieldEnd, 1);
                    var fieldEndIndex = this.getHierarchicalIndex(paragraph, fieldEndOffset.toString());
                    if (!TextPosition.isForwardSelection(fieldEndIndex, selectionStartIndex)) {
                        this.selection.start.setPositionParagraph(paragraph, fieldEndOffset);
                        selectionStartIndex = fieldEndIndex;
                    }
                }
            }
            if (inline instanceof FieldElementBox && inline.fieldType === 1 && !isNullOrUndefined(inline.fieldBegin)) {
                var line = inline.fieldBegin.line;
                var fieldBegin = inline.fieldBegin;
                var fieldBeginOffset = line.getOffset(fieldBegin, 0);
                var fieldBeginIndex = this.getHierarchicalIndex(line, fieldBeginOffset.toString());
                if (!TextPosition.isForwardSelection(selectionEndIndex, fieldBeginIndex)) {
                    //If field begin is before selection end, extend selection end to field begin.
                    this.moveToInline(inline.fieldBegin, 0);
                    return;
                }
                textPosition.moveToInline(inline.fieldBegin, 0);
            }
            else {
                textPosition.movePreviousPosition();
            }
            currentIndex = textPosition.getHierarchicalIndexInternal();
        }
    };
    /**
     * @private
     */
    TextPosition.prototype.paragraphStartInternal = function (selection, moveToPreviousParagraph) {
        var offset = selection.getStartLineOffset(this.currentWidget);
        if (this.offset === offset && moveToPreviousParagraph) {
            var startParagraph = this.moveToNextParagraphInTableCheck();
            if (startParagraph) {
                this.moveToPreviousParagraphInTable(selection);
            }
            else if (!isNullOrUndefined(selection.getPreviousParagraphBlock(this.currentWidget.paragraph))) {
                var paragraphValue = selection.getPreviousParagraphBlock(this.currentWidget.paragraph);
                this.currentWidget = paragraphValue.childWidgets[0];
                this.offset = selection.getStartLineOffset(this.currentWidget);
            }
        }
        else {
            this.currentWidget = this.currentWidget.paragraph.getSplitWidgets()[0].childWidgets[0];
            this.offset = offset;
        }
        this.calculateOffset();
    };
    /**
     * @private
     */
    TextPosition.prototype.calculateOffset = function () {
        var selectionStartIndex = this.owner.selection.start.getHierarchicalIndexInternal();
        var selectionEndIndex = this.getHierarchicalIndexInternal();
        if (selectionStartIndex !== selectionEndIndex) {
            this.validateBackwardFieldSelection(selectionStartIndex, selectionEndIndex);
        }
        this.updatePhysicalPosition(true);
    };
    /**
     * Moves the text position to start of the paragraph.
     *
     * @private
     */
    TextPosition.prototype.moveToParagraphStartInternal = function (selection, moveToPreviousParagraph) {
        var splittedParagraph = this.currentWidget.paragraph;
        while (splittedParagraph.previousSplitWidget) {
            splittedParagraph = splittedParagraph.previousSplitWidget;
        }
        var startOffset = selection.getStartOffset(splittedParagraph);
        if (this.offset === startOffset && moveToPreviousParagraph) {
            var paragraphstart = this.moveToNextParagraphInTableCheck();
            if (paragraphstart) {
                this.moveToPreviousParagraphInTable(selection);
            }
            else if (!isNullOrUndefined(selection.getPreviousParagraphBlock(this.paragraph))) {
                this.currentWidget = selection.getPreviousParagraphBlock(this.paragraph).firstChild;
                this.offset = selection.getStartOffset(this.paragraph);
            }
        }
        else {
            this.currentWidget = splittedParagraph.firstChild;
            this.offset = selection.getStartLineOffset(this.currentWidget);
        }
        var selectionStartIndex = this.owner.selection.start.getHierarchicalIndexInternal();
        var selectionEndIndex = this.getHierarchicalIndexInternal();
        if (selectionStartIndex !== selectionEndIndex) {
            this.validateBackwardFieldSelection(selectionStartIndex, selectionEndIndex);
        }
        this.updatePhysicalPosition(false);
    };
    /**
     * Moves the text position to end of the paragraph.
     *
     * @private
     */
    TextPosition.prototype.moveToParagraphEndInternal = function (selection, moveToNextParagraph) {
        var splittedParagraph = this.currentWidget.paragraph;
        while (splittedParagraph.nextSplitWidget) {
            splittedParagraph = splittedParagraph.nextSplitWidget;
        }
        this.currentWidget = splittedParagraph.childWidgets[splittedParagraph.childWidgets.length - 1];
        var endOffset = this.currentWidget.getEndOffset() + 1;
        if (this.offset === endOffset && moveToNextParagraph) {
            var paragraphEnd = this.moveToNextParagraphInTableCheck();
            if (paragraphEnd) {
                this.moveToNextParagraphInTable();
            }
            else if (!isNullOrUndefined(selection.getNextParagraphBlock(this.currentWidget.paragraph))) {
                var endParagraph = selection.getNextParagraphBlock(this.currentWidget.paragraph);
                this.currentWidget = endParagraph.childWidgets[endParagraph.childWidgets.length - 1];
                this.offset = this.currentWidget.getEndOffset() + 1;
            }
        }
        else {
            this.offset = endOffset;
        }
        this.calculateOffset();
    };
    /**
     * @private
     */
    TextPosition.prototype.moveUp = function (selection, left) {
        var paragraph = this.currentWidget.paragraph;
        //Moves text position to start of line.
        this.moveToLineStartInternal(selection, true);
        //Moves previous line starting.
        this.movePreviousPosition();
        var prevLine = undefined;
        var currentParagraph = this.currentWidget.paragraph;
        if (paragraph.isInsideTable && paragraph !== currentParagraph && paragraph.associatedCell !== currentParagraph.associatedCell
            && (!isNullOrUndefined(currentParagraph.associatedCell) && (paragraph.associatedCell.ownerRow === currentParagraph.associatedCell.ownerRow))) {
            var ownerRow = currentParagraph.associatedCell.ownerRow;
            if (ownerRow.previousRenderedWidget instanceof TableRowWidget) {
                var cell = selection.getFirstCellInRegion(ownerRow.previousRenderedWidget, currentParagraph.associatedCell, left, true);
                var lastParagraph = selection.getLastParagraph(cell);
                this.setPosition(lastParagraph.childWidgets[lastParagraph.childWidgets.length - 1], false);
            }
            else {
                var prevBlock = ownerRow.ownerTable.previousRenderedWidget;
                do {
                    if (prevBlock instanceof TableWidget) {
                        prevBlock = selection.getLastBlockInLastCell(prevBlock);
                    }
                } while (prevBlock instanceof TableWidget);
                if (prevBlock instanceof ParagraphWidget) {
                    this.setPosition(prevBlock.childWidgets[prevBlock.childWidgets.length - 1], false);
                }
            }
            prevLine = selection.getLineWidgetParagraph(this.offset, this.currentWidget);
        }
        else {
            if (!paragraph.isInsideTable && this.currentWidget.paragraph.isInsideTable) {
                var cell = selection.getFirstCellInRegion(this.currentWidget.paragraph.associatedCell.ownerRow, this.currentWidget.paragraph.associatedCell, this.owner.selection.upDownSelectionLength, true);
                var lastParagraph = selection.getLastParagraph(cell);
                this.setPosition(lastParagraph.childWidgets[lastParagraph.childWidgets.length - 1], false);
            }
            else if (paragraph.isInsideTable && (!isNullOrUndefined(this.currentWidget.paragraph.associatedCell) && paragraph.associatedCell.ownerRow.previousRenderedWidget !== paragraph.associatedCell.ownerRow.previousSplitWidget &&
                paragraph.associatedCell.ownerRow.previousRenderedWidget === this.currentWidget.paragraph.associatedCell.ownerRow)) {
                var cell = selection.getLastCellInRegion(this.currentWidget.paragraph.associatedCell.ownerRow, this.currentWidget.paragraph.associatedCell, this.owner.selection.upDownSelectionLength, true);
                var lastParagraph = selection.getLastParagraph(cell);
                this.setPosition(lastParagraph.childWidgets[lastParagraph.childWidgets.length - 1], false);
            }
            prevLine = selection.getLineWidgetParagraph(this.offset, this.currentWidget);
        }
        //Moves till the Up/Down selection width.
        var top = selection.getTop(prevLine);
        // Here, updating the left position when line widget end with page break
        // to update cursor before page break
        if (this.currentWidget.isEndsWithPageBreak && this.offset === this.currentWidget.getEndOffset() - 1) {
            left = this.location.x;
        }
        selection.updateTextPositionWidget(prevLine, new Point(left, top), this, false);
    };
    /**
     * @private
     */
    TextPosition.prototype.moveDown = function (selection, left) {
        //Moves text position to end of line.
        var prevParagraph = this.currentWidget.paragraph;
        var currentLine = this.currentWidget;
        this.moveToLineEndInternal(selection, true);
        var length = this.selection.getParagraphLength(this.currentWidget.paragraph);
        if (this.offset > length) {
            this.offset = length;
        }
        //Moves next line starting.
        this.moveNextPosition();
        var nextLine = undefined;
        if (prevParagraph.isInsideTable && prevParagraph !== this.currentWidget.paragraph && prevParagraph.associatedCell !== this.currentWidget.paragraph.associatedCell && (!isNullOrUndefined(this.currentWidget.paragraph.associatedCell) && prevParagraph.associatedCell.ownerRow === this.currentWidget.paragraph.associatedCell.ownerRow)) {
            var ownerRow = this.currentWidget.paragraph.associatedCell.ownerRow;
            if (prevParagraph.isInsideTable && this.currentWidget.paragraph.isInsideTable && prevParagraph.associatedCell.cellFormat.rowSpan > 1 && prevParagraph.associatedCell.cellFormat.rowSpan + prevParagraph.associatedCell.ownerRow.rowIndex === prevParagraph.associatedCell.ownerTable.childWidgets.length) {
                //If the prevParagraph  owner cell is Verically merged upto the last row, then theposition moved to next column. the position moved to out of the current tabel so owner row is assigned to last row.
                ownerRow = this.currentWidget.paragraph.associatedCell.ownerTable.childWidgets[this.currentWidget.paragraph.associatedCell.ownerTable.childWidgets.length - 1];
            }
            if (ownerRow.nextRenderedWidget instanceof TableRowWidget) {
                var cell = this.selection.getLastCellInRegion(ownerRow.nextRenderedWidget, this.currentWidget.paragraph.associatedCell, left, false);
                this.setPosition(this.selection.getFirstParagraph(cell).childWidgets[0], true);
            }
            else {
                var nextBlock = this.selection.getNextRenderedBlock(ownerRow.ownerTable);
                do {
                    if (nextBlock instanceof TableWidget) {
                        nextBlock = this.selection.getFirstBlockInFirstCell(nextBlock);
                    }
                } while (nextBlock instanceof TableWidget);
                if (nextBlock instanceof ParagraphWidget) {
                    this.setPosition(nextBlock.childWidgets[0], true);
                }
            }
            nextLine = selection.getLineWidgetParagraph(this.offset, this.currentWidget);
        }
        else {
            if (!prevParagraph.isInsideTable && this.currentWidget.paragraph.isInsideTable) {
                var cell = this.selection.getLastCellInRegion(this.currentWidget.paragraph.associatedCell.ownerRow, this.currentWidget.paragraph.associatedCell, this.owner.selection.upDownSelectionLength, false);
                this.setPosition(this.selection.getFirstParagraph(cell).childWidgets[0], true);
            }
            else if (prevParagraph.isInsideTable && (!isNullOrUndefined(this.currentWidget.paragraph.associatedCell) && prevParagraph.associatedCell.ownerRow.nextRenderedWidget !== prevParagraph.associatedCell.ownerRow.nextSplitWidget
                && prevParagraph.associatedCell.ownerRow.nextRenderedWidget === this.currentWidget.paragraph.associatedCell.ownerRow)) {
                var cell = selection.getLastCellInRegion(this.currentWidget.paragraph.associatedCell.ownerRow, this.currentWidget.paragraph.associatedCell, this.owner.selection.upDownSelectionLength, true);
                this.setPosition(selection.getFirstParagraph(cell).childWidgets[0], false);
            }
            nextLine = selection.getLineWidgetParagraph(this.offset, this.currentWidget);
        }
        //Moves till the Up/Down selection width.
        var top = this.selection.getTop(nextLine);
        if (nextLine !== currentLine) {
            this.selection.updateTextPositionWidget(nextLine, new Point(left, top), this, false);
        }
    };
    /**
     * Moves the text position to start of the line.
     *
     * @private
     */
    TextPosition.prototype.moveToLineStartInternal = function (selection, moveToPreviousLine) {
        if (this.location.x > this.viewer.clientActiveArea.right) {
            this.offset = this.offset - 1;
        }
        var currentLine = selection.getLineWidgetInternal(this.currentWidget, this.offset, moveToPreviousLine);
        var firstElement;
        var isParaBidi = this.currentWidget.paragraph.paragraphFormat.bidi;
        if (isParaBidi && currentLine.children.length > 0 && this.containsRtlText(currentLine)) {
            firstElement = currentLine.children[currentLine.children.length - 1];
            if (firstElement instanceof ListTextElementBox) {
                firstElement = undefined;
            }
        }
        else {
            firstElement = selection.getFirstElementInternal(currentLine);
        }
        this.documentHelper.moveCaretPosition = 1;
        var startOffset = selection.getStartOffset(this.currentWidget.paragraph);
        if (isNullOrUndefined(firstElement) && this.offset > startOffset) {
            var index = 0;
            var inlineObj = this.currentWidget.getInline(this.offset, index);
            var inline = inlineObj.element;
            index = inlineObj.index;
            if (inline instanceof TextElementBox && inline.text !== '\v') {
                this.offset = startOffset;
            }
        }
        else if (!isNullOrUndefined(firstElement)) {
            var indexInInline = 0;
            this.currentWidget = firstElement.line;
            this.offset = this.currentWidget.getOffset(firstElement, indexInInline);
            indexInInline = 0;
            var inlineObj = this.currentWidget.getInline(this.offset, indexInInline);
            var inline = inlineObj.element;
            indexInInline = inlineObj.index;
            if (inline instanceof FieldElementBox) {
                //Checks if field character is part of rendered field, otherwise moves to previous rendered content.
                var prevInline = selection.getPreviousValidElement(inline);
                if (!isNullOrUndefined(prevInline)) {
                    inline = prevInline;
                    this.currentWidget = inline.line;
                    this.offset = this.currentWidget.getOffset(inline, inline.length);
                    if (inline instanceof FieldElementBox) {
                        this.offset--;
                    }
                }
            }
        }
        this.updatePhysicalPosition(true);
    };
    /**
     * Check paragraph is inside table
     *
     * @private
     */
    TextPosition.prototype.moveToNextParagraphInTableCheck = function () {
        if ((this.selection.start.paragraph.isInsideTable || this.paragraph.isInsideTable)
            && (this.selection.start.paragraph.associatedCell !== this.paragraph.associatedCell
                || this.selection.isCellSelected(this.selection.start.paragraph.associatedCell, this.selection.start, this))) {
            return true;
        }
        return false;
    };
    /**
     * Moves the text position to end of the word.
     *
     * @private
     */
    TextPosition.prototype.moveToWordEndInternal = function (type, excludeSpace) {
        // type === 0 -------->CTRL+ARROW Navigation
        // type === 1 -------->CTRL+SHIFT+ARROW Selection
        // type === 2 -------->Double-tap Word Selection
        var incrementValue = 0;
        var endOffset = this.currentWidget.getEndOffset();
        if (this.selection.isParagraphFirstLine(this.currentWidget)) {
            if (this.currentWidget.children[0] instanceof ListTextElementBox) {
                incrementValue = 1;
            }
            if (this.currentWidget.children[1] instanceof ListTextElementBox) {
                incrementValue = 2;
            }
        }
        if (this.offset + incrementValue === endOffset || this.offset === endOffset + 1) {
            if (this.offset === endOffset && type !== 0) {
                this.setPositionParagraph(this.currentWidget, endOffset + 1);
            }
            else {
                var nextParagraph = this.selection.getNextParagraphBlock(this.currentWidget.paragraph);
                if (isNullOrUndefined(nextParagraph)) {
                    return;
                }
                this.currentWidget = nextParagraph.childWidgets[0];
                this.offset = this.selection.getStartLineOffset(this.currentWidget);
                if (type === 1) {
                    var nextWord = this.moveToNextParagraphInTableCheck();
                    if (nextWord) {
                        this.moveToNextParagraphInTable();
                    }
                    else {
                        this.moveToWordEndInternal(type, excludeSpace);
                    }
                }
            }
        }
        else {
            var indexInInline = 0;
            var endSelection = false;
            var inlineObj = this.currentWidget.getInline(this.offset, indexInInline);
            var inline = inlineObj.element;
            indexInInline = inlineObj.index;
            this.getNextWordOffset(inline, indexInInline, type, false, endSelection, this, excludeSpace);
        }
        if (type !== 0) {
            var selectionStartIndex = this.owner.selection.start.getHierarchicalIndexInternal();
            var selectionEndIndex = this.getHierarchicalIndexInternal();
            if (selectionStartIndex !== selectionEndIndex) {
                this.validateForwardFieldSelection(selectionStartIndex, selectionEndIndex);
            }
        }
        this.updatePhysicalPosition(true);
    };
    /**
     * move text position to next paragraph inside table
     *
     * @private
     */
    TextPosition.prototype.moveToNextParagraphInTable = function () {
        var paragraph = this.currentWidget.paragraph;
        var nextParagraph = (paragraph.isInsideTable) ? this.selection.getNextSelectionCell(paragraph.associatedCell) :
            this.selection.getNextParagraphBlock(paragraph);
        if (isNullOrUndefined(nextParagraph)) {
            return;
        }
        this.currentWidget = nextParagraph.childWidgets[nextParagraph.childWidgets.length - 1];
        this.offset = this.currentWidget.getEndOffset() + 1;
    };
    /**
     * Moves the text position to start of the previous paragraph.
     *
     */
    TextPosition.prototype.moveToPreviousParagraph = function (selection) {
        var startOffset = selection.getStartOffset(this.currentWidget.paragraph);
        if (this.offset === startOffset && !isNullOrUndefined(selection.getPreviousParagraphBlock(this.currentWidget.paragraph))) {
            var previousParagraph = selection.getPreviousParagraphBlock(this.currentWidget.paragraph);
            this.currentWidget = previousParagraph.childWidgets[0];
            this.offset = selection.getStartOffset(this.currentWidget.paragraph);
        }
        else {
            this.offset = selection.getStartOffset(this.currentWidget.paragraph);
        }
        this.updatePhysicalPosition(true);
    };
    /**
     * Move to previous line from current position
     *
     * @private
     */
    TextPosition.prototype.moveToPreviousLine = function (selection, left) {
        var currentIndex = this.getHierarchicalIndexInternal();
        var currentLine = selection.getLineWidgetParagraph(this.offset, this.currentWidget);
        //Moves text position to start of line.
        this.moveToLineStartInternal(selection, true);
        if (this.currentWidget.paragraph.isInsideTable) {
            this.moveUpInTable(selection);
        }
        else {
            this.moveBackward();
        }
        var prevLine = selection.getLineWidgetParagraph(this.offset, this.currentWidget);
        var lineStart = selection.getLeft(prevLine);
        var lineWidth = selection.getWidth(prevLine, true);
        //Moves till the Up/Down selection width.
        if (lineWidth + lineStart >= left && currentLine !== prevLine) {
            var top_1 = selection.getTop(prevLine);
            var point = new Point(left, top_1);
            selection.updateTextPositionWidget(prevLine, point, this, true);
        }
        //Checks if the current position is between field result, then move to field begin.
        var selectionEndIndex = this.getHierarchicalIndexInternal();
        this.validateBackwardFieldSelection(currentIndex, selectionEndIndex);
    };
    /**
     * @param {Selection} selection Specifies the selection
     * @param {boolean} moveToNextLine Specifies the move to next line
     * @private
     */
    TextPosition.prototype.moveToLineEndInternal = function (selection, moveToNextLine) {
        if (this.location.x > this.viewer.clientActiveArea.right) {
            this.offset = this.offset - 1;
        }
        var currentLine = selection.getLineWidgetParagraph(this.offset, this.currentWidget);
        var firstElement = selection.getFirstElementInternal(currentLine);
        var isParaBidi = this.currentWidget.paragraph.paragraphFormat.bidi;
        this.documentHelper.moveCaretPosition = 2;
        if (isNullOrUndefined(firstElement) && this.offset === selection.getStartLineOffset(this.currentWidget)) {
            this.offset = selection.getParagraphLength(this.paragraph) + 1;
            this.updatePhysicalPosition(true);
        }
        else if (!isNullOrUndefined(firstElement)) {
            var lastElement = void 0;
            // As per Microsoft Behavior, when current para is RTL and if line widget contains rtl text or mixed inlines(rtl, normal),
            // then need to consider the last element and to update offset to last element
            if (isParaBidi && this.containsRtlText(currentLine)) {
                var endOffset = currentLine.getEndOffset();
                lastElement = currentLine.getInline(endOffset, 0).element;
            }
            else {
                lastElement = currentLine.children[currentLine.children.length - 1];
                if (lastElement instanceof ListTextElementBox && currentLine.children.length > 2) {
                    lastElement = currentLine.children[currentLine.children.length - 3];
                }
            }
            var index = 0;
            index += lastElement instanceof TextElementBox ? lastElement.length : 1;
            this.currentWidget = lastElement.line;
            if (index === lastElement.length
                && isNullOrUndefined(lastElement.nextNode) && selection.isParagraphLastLine(this.currentWidget)) {
                var length_1 = selection.getLineLength(this.currentWidget);
                this.offset = moveToNextLine ? length_1 + 1 : length_1;
            }
            else {
                var inline = lastElement;
                while (!isNullOrUndefined(inline) && inline.length === index && inline.nextNode instanceof FieldElementBox) {
                    var nextInline = selection.getNextValidElement(inline.nextNode);
                    if (inline !== nextInline) {
                        inline = nextInline;
                        index = 0;
                    }
                    if (inline instanceof FieldElementBox && inline.fieldType === 0
                        && !isNullOrUndefined(inline.fieldEnd)) {
                        var fieldBegin = inline;
                        if (isNullOrUndefined(fieldBegin.fieldSeparator)) {
                            inline = fieldBegin.fieldEnd;
                        }
                        else {
                            inline = fieldBegin.fieldSeparator;
                            this.currentWidget = inline.line;
                            if (this.currentWidget === fieldBegin.fieldEnd.line
                                && !selection.hasValidInline(this.currentWidget.paragraph, inline, fieldBegin.fieldEnd)) {
                                inline = fieldBegin.fieldEnd;
                            }
                        }
                        this.currentWidget = inline.line;
                    }
                    if (inline instanceof FieldElementBox) {
                        index = 1;
                    }
                }
                if (index === inline.length && isNullOrUndefined(inline.nextNode)) {
                    index++;
                }
                if (!moveToNextLine && inline instanceof ElementBox && inline.text === '\v') {
                    index--;
                }
                this.offset = this.currentWidget.getOffset(inline, index);
            }
            this.updatePhysicalPosition(moveToNextLine);
        }
    };
    /**
     * Move to next line
     *
     * @param {number} left Specified the left
     * @private
     * @returns {void}
     */
    TextPosition.prototype.moveToNextLine = function (left) {
        var selection = this.selection;
        var textPosition = new TextPosition(this.owner);
        textPosition.setPositionInternal(this);
        var currentIndex = this.getHierarchicalIndexInternal();
        var currentLine = selection.getLineWidgetParagraph(this.offset, this.currentWidget);
        var isAtLineStart = this.offset === 0 ? true : false;
        //Moves text position to end of line.
        this.moveToLineEndInternal(selection, true);
        var isMoveToLineEnd = !textPosition.isAtSamePosition(this);
        textPosition.setPositionInternal(this);
        if (this.currentWidget.paragraph.isInsideTable) {
            this.moveDownInTable(selection);
        }
        else {
            this.moveNextPosition();
            this.moveForward();
        }
        var nextLine = selection.getLineWidgetParagraph(this.offset, this.currentWidget);
        var lineStart = selection.getLeft(nextLine);
        var firstElement = selection.getFirstElementInternal(nextLine);
        var firstItemWidth = isNullOrUndefined(firstElement) ? selection.getWidth(nextLine, true) : selection.getLeftInternal(nextLine, firstElement, 1) - lineStart;
        //Moves till the Up/Down selection width.
        if (lineStart < left && (firstItemWidth / 2 < left - lineStart)) {
            var top_2 = selection.getTop(nextLine);
            var point = new Point(left, top_2);
            selection.updateTextPositionWidget(nextLine, point, this, true);
            var width = selection.getWidth(nextLine, true);
            if (width < left - lineStart) {
                this.moveToLineEndInternal(selection, true);
            }
        }
        else if (isMoveToLineEnd && this.currentWidget.paragraph.isInsideTable
            && this.currentWidget === this.owner.selection.start.currentWidget) {
            this.setPositionInternal(textPosition);
        }
        else if (!isMoveToLineEnd) {
            this.moveToLineEndInternal(selection, true);
        }
        //Checks if the current position is between field result, then move to field end.
        var selectionEndIndex = this.getHierarchicalIndexInternal();
        this.validateForwardFieldSelection(currentIndex, selectionEndIndex);
    };
    TextPosition.prototype.moveUpInTable = function (selection) {
        var isPositionUpdated = false;
        var end = this.owner.selection.end;
        var isBackwardSelection = !this.owner.selection.isEmpty;
        isPositionUpdated = end.paragraph.isInsideTable;
        if (isPositionUpdated) {
            var startCell = this.currentWidget.paragraph.associatedCell;
            var endCell = end.paragraph.associatedCell;
            var containerCell = selection.getContainerCellOf(endCell, startCell);
            isPositionUpdated = containerCell.ownerTable.contains(startCell);
            if (isPositionUpdated) {
                endCell = selection.getSelectedCell(endCell, containerCell);
                startCell = selection.getSelectedCell(startCell, containerCell);
                var isInContainerCell = selection.containsCell(containerCell, this.currentWidget.paragraph.associatedCell);
                var isContainerCellSelected = selection.isCellSelected(containerCell, this, end);
                if (!isContainerCellSelected) {
                    isContainerCellSelected = this.currentWidget.paragraph === selection.getFirstParagraph(containerCell) && this.isAtParagraphStart;
                }
                if ((isInContainerCell && isContainerCellSelected
                    || !isInContainerCell) && !isNullOrUndefined(startCell.ownerRow.previousRenderedWidget)) {
                    //Moves to cell in previous row.
                    var row = startCell.ownerRow.previousRenderedWidget;
                    var cell = selection.getFirstCellInRegion(row, containerCell, this.owner.selection.upDownSelectionLength, true);
                    var previousParagraph = selection.getLastParagraph(cell);
                    this.setPosition(previousParagraph.childWidgets[0], true);
                    return;
                }
                else if (isInContainerCell && isContainerCellSelected
                    && isNullOrUndefined(startCell.ownerRow.previousRenderedWidget) || !isInContainerCell) {
                    if (isBackwardSelection) {
                        //Moves to first cell of row.
                        startCell = startCell.ownerRow.childWidgets[0];
                        var previousParagraph = selection.getFirstParagraph(startCell);
                        this.setPosition(previousParagraph.childWidgets[0], true);
                    }
                    else {
                        //Moves to last cell of row.
                        startCell = startCell.ownerRow.childWidgets[startCell.ownerRow.childWidgets.length - 1];
                        var previousParagraph = selection.getLastParagraph(startCell);
                        this.setPosition(previousParagraph.childWidgets[0], false);
                    }
                }
            }
        }
        if (!isPositionUpdated) {
            //Moves to previous row / previous block.
            var cell = selection.getContainerCell(this.currentWidget.paragraph.associatedCell);
            if (isBackwardSelection) {
                //Moves to first cell of row.
                cell = cell.ownerRow.childWidgets[0];
                var previousParagraph = selection.getFirstParagraph(cell);
                this.setPosition(previousParagraph.childWidgets[0], true);
            }
            else {
                //Moves to end of row.
                cell = cell.ownerRow.childWidgets[cell.ownerRow.childWidgets.length - 1];
                var previousParagraph = selection.getLastParagraph(cell);
                this.setPosition(previousParagraph.childWidgets[0], false);
            }
        }
        //Moves to previous row / previous block.
        this.moveBackward();
    };
    TextPosition.prototype.moveDownInTable = function (selection) {
        var isPositionUpdated = false;
        var isForwardSelection = this.owner.selection.isEmpty || this.owner.selection.isForward;
        isPositionUpdated = this.owner.selection.start.paragraph.isInsideTable;
        if (isPositionUpdated) {
            var startCell = this.owner.selection.start.paragraph.associatedCell;
            var endCell = this.currentWidget.paragraph.associatedCell;
            var containerCell = selection.getContainerCellOf(startCell, endCell);
            isPositionUpdated = containerCell.ownerTable.contains(endCell);
            if (isPositionUpdated) {
                startCell = selection.getSelectedCell(startCell, containerCell);
                endCell = selection.getSelectedCell(endCell, containerCell);
                var isInContainerCell = selection.containsCell(containerCell, this.currentWidget.paragraph.associatedCell);
                var isContainerCellSelected = selection.isCellSelected(containerCell, this.owner.selection.start, this);
                if ((isInContainerCell && isContainerCellSelected
                    || !isInContainerCell) && !isNullOrUndefined(endCell.ownerRow.nextRenderedWidget)) {
                    //Moves to cell in next row.
                    var row = endCell.ownerRow.nextRenderedWidget;
                    var cell = selection.getLastCellInRegion(row, containerCell, this.owner.selection.upDownSelectionLength, false);
                    var lastParagraph = selection.getLastParagraph(cell);
                    this.setPosition(lastParagraph.childWidgets[lastParagraph.childWidgets.length - 1], false);
                    return;
                }
                else if (isInContainerCell && isContainerCellSelected
                    && isNullOrUndefined(endCell.ownerRow.nextRenderedWidget) || !isInContainerCell) {
                    if (isForwardSelection) {
                        //Moves to last cell of row.
                        endCell = endCell.ownerRow.childWidgets[endCell.ownerRow.childWidgets.length - 1];
                        var lastParagraph = selection.getLastParagraph(endCell);
                        this.setPosition(lastParagraph.childWidgets[lastParagraph.childWidgets.length - 1], false);
                    }
                    else {
                        //Moves to first cell of row.
                        endCell = endCell.ownerRow.childWidgets[0];
                        var lastParagraph = selection.getFirstParagraph(endCell);
                        this.setPosition(lastParagraph.childWidgets[lastParagraph.childWidgets.length - 1], true);
                    }
                }
            }
        }
        if (!isPositionUpdated) {
            //Moves to next row / next block.
            var cell = selection.getContainerCell(this.currentWidget.paragraph.associatedCell);
            if (isForwardSelection) {
                //Moves to end of row.
                cell = cell.ownerRow.childWidgets[cell.ownerRow.childWidgets.length - 1];
                var lastParagraph = selection.getLastParagraph(cell);
                this.setPosition(lastParagraph.childWidgets[lastParagraph.childWidgets.length - 1], false);
            }
            else if (cell.ownerRow.nextRenderedWidget) {
                //Moves to first cell of row.
                cell = cell.ownerRow.nextRenderedWidget.childWidgets[0];
                var lastParagraph = selection.getFirstParagraph(cell);
                this.setPosition(lastParagraph.childWidgets[lastParagraph.childWidgets.length - 1], true);
            }
        }
        //Moves to next row / next block.
        this.moveForward();
    };
    /**
     * @private
     * @returns {void}
     */
    TextPosition.prototype.destroy = function () {
        this.offset = undefined;
        this.isUpdateLocation = undefined;
        if (!isNullOrUndefined(this.location)) {
            this.location.destroy();
        }
        this.location = undefined;
        this.currentWidget = undefined;
        this.owner = undefined;
        this.documentHelper = undefined;
    };
    return TextPosition;
}());
export { TextPosition };
/**
 * @private
 */
var SelectionWidgetInfo = /** @class */ (function () {
    function SelectionWidgetInfo(left, width) {
        this.leftIn = 0;
        this.widthIn = 0;
        this.color = '';
        this.leftIn = left;
        this.widthIn = width;
    }
    Object.defineProperty(SelectionWidgetInfo.prototype, "left", {
        /**
         * @private
         */
        get: function () {
            return this.leftIn;
        },
        /**
         * @private
         */
        set: function (value) {
            this.leftIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionWidgetInfo.prototype, "width", {
        /**
         * @private
         */
        get: function () {
            return this.widthIn;
        },
        /**
         * @private
         */
        set: function (value) {
            this.widthIn = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @private
     */
    SelectionWidgetInfo.prototype.destroy = function () {
        this.widthIn = undefined;
        this.leftIn = undefined;
        this.floatingItems = [];
        this.floatingItems = undefined;
    };
    return SelectionWidgetInfo;
}());
export { SelectionWidgetInfo };
/**
 * @private
 */
var Hyperlink = /** @class */ (function () {
    function Hyperlink(fieldBeginAdv, selection) {
        this.linkInternal = '';
        this.localRef = '';
        this.opensNewWindow = false;
        this.isCrossRefField = false;
        var fieldCode = selection.getFieldCode(fieldBeginAdv);
        var lowercase = fieldCode.toLowerCase();
        if (lowercase.substring(0, 9) === 'hyperlink') {
            this.parseFieldValues(fieldCode.substring(9).trim(), true);
        }
        else if ((lowercase.indexOf('ref ') === 0 && lowercase.match('\\h'))) {
            this.parseFieldValues(fieldCode.substring(4).trim(), false);
            this.isCrossRefField = true;
        }
    }
    Object.defineProperty(Hyperlink.prototype, "navigationLink", {
        /**
         * Gets navigation link.
         *
         * @returns string
         * @private
         */
        get: function () {
            return this.linkInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Hyperlink.prototype, "localReference", {
        /**
         * Gets the local reference if any.
         *
         * @returns string
         * @private
         */
        get: function () {
            return this.localRef;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Hyperlink.prototype, "linkType", {
        /**
         * Gets hyper link type.
         *
         * @returns HyperLinkType
         * @private
         */
        get: function () {
            return this.typeInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Hyperlink.prototype, "isCrossRef", {
        /**
         * @private
         */
        get: function () {
            return this.isCrossRefField;
        },
        enumerable: true,
        configurable: true
    });
    Hyperlink.prototype.parseFieldValues = function (value, isHyperlink) {
        var codes = value.split(' ');
        var isLocalRef = false;
        if (isHyperlink) {
            for (var i = 0; i < codes.length; i++) {
                var code = codes[i];
                if (code.length < 1) {
                    continue;
                }
                if (code === '\\t' || code === '\\l') {
                    isLocalRef = true;
                }
                else if (code === '\\n') {
                    this.opensNewWindow = true;
                }
                else {
                    code = this.parseFieldValue(code, code[0] === '\"' ? '\"' : undefined, isHyperlink);
                    if (isLocalRef) {
                        this.localRef = code;
                        isLocalRef = false;
                    }
                    else {
                        this.linkInternal = code;
                    }
                }
            }
        }
        else {
            this.localRef = codes[0];
        }
        this.setLinkType();
    };
    Hyperlink.prototype.parseFieldValue = function (value, endChar, isHyperlink) {
        value = isHyperlink ? value.substring(1) : value.substring(0);
        var endIndex = endChar ? value.indexOf(endChar) : -1;
        if (endIndex < 0) {
            endIndex = value.length;
        }
        return value.substring(0, endIndex).trim();
    };
    Hyperlink.prototype.setLinkType = function () {
        // If only local reference.
        if (isNullOrUndefined(this.linkInternal) || this.linkInternal.length < 1) {
            this.typeInternal = 'Bookmark';
            return;
        }
        // Validates link.
        if (this.linkInternal.substring(0, 4) === ('www.')) {
            this.linkInternal = 'http://' + this.navigationLink;
        }
        else if (this.linkInternal[0] === '@') {
            this.linkInternal = 'mailto:' + this.navigationLink;
        }
        // Finds proper link type.
        if (this.linkInternal.substring(0, 7) === 'http://'
            || this.linkInternal.substring(0, 8) === 'https://') {
            this.typeInternal = 'WebPage';
        }
        else if (this.linkInternal.substring(0, 7) === 'mailto:') {
            this.typeInternal = 'Email';
        }
        else {
            this.typeInternal = 'File';
        }
    };
    /**
     * @private
     */
    Hyperlink.prototype.destroy = function () {
        this.linkInternal = undefined;
        this.localRef = undefined;
        this.typeInternal = undefined;
        this.opensNewWindow = undefined;
    };
    return Hyperlink;
}());
export { Hyperlink };
/**
 * @private
 */
var ImageInfo = /** @class */ (function () {
    /**
     * Constructor for image format class
     *
     * @param imageContainer - Specifies for image width and height values.
     */
    function ImageInfo(imageContainer) {
        /**
         * @private
         */
        this.width = 0;
        /**
         * @private
         */
        this.height = 0;
        this.width = imageContainer.width;
        this.height = imageContainer.height;
    }
    /**
     * Dispose the internal objects which are maintained.
     *
     * @private
     */
    ImageInfo.prototype.destroy = function () {
        this.width = undefined;
        this.height = undefined;
    };
    return ImageInfo;
}());
export { ImageInfo };
