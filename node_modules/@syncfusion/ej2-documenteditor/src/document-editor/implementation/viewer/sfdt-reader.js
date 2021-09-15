/* eslint-disable */
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { WList } from '../list/list';
import { WListLevel } from '../list/list-level';
import { WAbstractList } from '../list/abstract-list';
import { WLevelOverride } from '../list/level-override';
import { WCharacterFormat, WListFormat, WParagraphFormat, WCellFormat, WTableFormat, WSectionFormat, WRowFormat } from '../format/index';
import { WCharacterStyle, WParagraphStyle, WTabStop } from '../format/index';
import { LineWidget, ParagraphWidget, ImageElementBox, BodyWidget, TextElementBox, TableCellWidget, TableRowWidget, TableWidget, FieldElementBox, HeaderFooterWidget, BookmarkElementBox, FieldTextElementBox, TabElementBox, EditRangeStartElementBox, EditRangeEndElementBox, ChartElementBox, ChartDataFormat, ChartCategory, ChartData, ChartSeries, ChartDataLabels, ChartTrendLines, ChartSeriesFormat, CommentCharacterElementBox, CommentElementBox, TextFormField, CheckBoxFormField, DropDownFormField, ShapeElementBox, LineFormat, TextFrame, ContentControlProperties, ContentControlListItems, ContentControl, CheckBoxState, XmlMapping, CustomXmlPart, Footnote, FootnoteElementBox, FillFormat, TablePosition } from './page';
import { HelperMethods } from '../editor/editor-helper';
import { Dictionary } from '../../base/dictionary';
import { ChartComponent } from '@syncfusion/ej2-office-chart';
import { Revision } from '../track-changes/track-changes';
/**
 * @private
 */
var SfdtReader = /** @class */ (function () {
    function SfdtReader(documentHelper) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        this.documentHelper = undefined;
        /**
         * @private
         */
        this.commentStarts = undefined;
        /**
         * @private
         */
        this.commentEnds = undefined;
        /**
         * @private
         */
        this.commentsCollection = undefined;
        /**
         * @private
         */
        this.revisionCollection = undefined;
        this.isPageBreakInsideTable = false;
        this.isParseHeader = false;
        this.footnotes = undefined;
        this.endnotes = undefined;
        /**
         * @private
         */
        this.isCutPerformed = false;
        /**
         * @private
         */
        this.isPaste = false;
        this.documentHelper = documentHelper;
        this.editableRanges = new Dictionary();
    }
    Object.defineProperty(SfdtReader.prototype, "isPasting", {
        get: function () {
            return this.viewer && this.viewer.owner.isPastingContent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SfdtReader.prototype, "viewer", {
        get: function () {
            return this.documentHelper.owner.viewer;
        },
        enumerable: true,
        configurable: true
    });
    SfdtReader.prototype.convertJsonToDocument = function (json) {
        this.commentStarts = new Dictionary();
        this.commentEnds = new Dictionary();
        this.commentsCollection = new Dictionary();
        this.revisionCollection = new Dictionary();
        this.footnotes = new Footnote();
        this.endnotes = new Footnote();
        var sections = [];
        var jsonObject = json;
        jsonObject = (jsonObject instanceof Object) ? jsonObject : JSON.parse(jsonObject);
        var characterFormat = isNullOrUndefined(jsonObject.characterFormat) ?
            this.viewer.owner.characterFormat : jsonObject.characterFormat;
        this.parseCharacterFormat(characterFormat, this.documentHelper.characterFormat);
        var paragraphFormat = isNullOrUndefined(jsonObject.paragraphFormat) ?
            this.viewer.owner.paragraphFormat : jsonObject.paragraphFormat;
        this.parseParagraphFormat(paragraphFormat, this.documentHelper.paragraphFormat);
        this.parseDocumentProtection(jsonObject);
        if (!isNullOrUndefined(jsonObject.defaultTabWidth)) {
            this.documentHelper.defaultTabWidth = jsonObject.defaultTabWidth;
        }
        if (!isNullOrUndefined(jsonObject.trackChanges)) {
            this.documentHelper.owner.showRevisions = jsonObject.trackChanges;
            this.documentHelper.owner.enableTrackChanges = jsonObject.trackChanges;
        }
        if (!isNullOrUndefined(jsonObject.dontUseHTMLParagraphAutoSpacing)) {
            this.documentHelper.dontUseHtmlParagraphAutoSpacing = jsonObject.dontUseHTMLParagraphAutoSpacing;
        }
        if (!isNullOrUndefined(jsonObject.alignTablesRowByRow)) {
            this.documentHelper.alignTablesRowByRow = jsonObject.alignTablesRowByRow;
        }
        if (!isNullOrUndefined(jsonObject.background)) {
            this.documentHelper.backgroundColor = this.getColor(jsonObject.background.color);
        }
        if (!isNullOrUndefined(jsonObject.compatibilityMode)) {
            this.documentHelper.compatibilityMode = jsonObject.compatibilityMode;
        }
        if (!isNullOrUndefined(jsonObject.abstractLists)) {
            this.parseAbstractList(jsonObject, this.documentHelper.abstractLists);
        }
        if (!isNullOrUndefined(jsonObject.lists)) {
            this.parseList(jsonObject, this.documentHelper.lists);
        }
        if (!isNullOrUndefined(jsonObject.styles)) {
            this.parseStyles(jsonObject, this.documentHelper.styles);
        }
        if (!isNullOrUndefined(jsonObject.comments)) {
            this.parseComments(jsonObject, this.documentHelper.comments);
        }
        if (!isNullOrUndefined(jsonObject.revisions)) {
            this.parseRevisions(jsonObject, this.viewer.owner.revisionsInternal.changes);
        }
        if (!isNullOrUndefined(jsonObject.sections)) {
            this.parseSections(jsonObject.sections, sections);
        }
        if (!isNullOrUndefined(jsonObject.customXml)) {
            this.parseCustomXml(jsonObject);
        }
        if (!isNullOrUndefined(jsonObject.formFieldShading)) {
            this.documentHelper.owner.documentEditorSettings.formFieldSettings.applyShading = jsonObject.formFieldShading;
        }
        if (!isNullOrUndefined(jsonObject.footnotes)) {
            this.parseFootnotes(jsonObject.footnotes, this.documentHelper.footnotes);
        }
        if (!isNullOrUndefined(jsonObject.endnotes)) {
            this.parseEndtnotes(jsonObject.endnotes, this.documentHelper.endnotes);
        }
        return sections;
    };
    SfdtReader.prototype.parseFootnotes = function (data, footnote) {
        if (!isNullOrUndefined(data.separator)) {
            this.parseBody(data.separator, footnote.separator);
        }
        if (!isNullOrUndefined(data.continuationNotice)) {
            this.parseBody(data.continuationNotice, footnote.continuationNotice);
        }
        if (!isNullOrUndefined(data.continuationSeparator)) {
            this.parseBody(data.continuationSeparator, footnote.continuationSeparator);
        }
    };
    SfdtReader.prototype.parseEndtnotes = function (data, endnote) {
        if (!isNullOrUndefined(data.separator)) {
            this.parseBody(data.separator, endnote.separator);
        }
        if (!isNullOrUndefined(data.continuationNotice)) {
            this.parseBody(data.continuationNotice, endnote.continuationNotice);
        }
        if (!isNullOrUndefined(data.continuationSeparator)) {
            this.parseBody(data.continuationSeparator, endnote.continuationSeparator);
        }
    };
    SfdtReader.prototype.parseCustomXml = function (data) {
        for (var i = 0; i < data.customXml.length; i++) {
            var xmlData = data.customXml[i];
            if (!this.revisionCollection.containsKey(xmlData.itemID)) {
                this.documentHelper.customXmlData.add(xmlData.itemID, xmlData.xml);
            }
        }
    };
    SfdtReader.prototype.parseDocumentProtection = function (data) {
        if (!isNullOrUndefined(data.formatting)) {
            this.documentHelper.restrictFormatting = data.formatting;
        }
        if (!isNullOrUndefined(data.enforcement)) {
            this.documentHelper.isDocumentProtected = data.enforcement;
        }
        if (!isNullOrUndefined(data.protectionType)) {
            this.documentHelper.protectionType = data.protectionType;
        }
        if (!isNullOrUndefined(data.hashValue)) {
            this.documentHelper.hashValue = data.hashValue;
        }
        if (!isNullOrUndefined(data.saltValue)) {
            this.documentHelper.saltValue = data.saltValue;
        }
    };
    SfdtReader.prototype.parseStyles = function (data, styles) {
        for (var i = 0; i < data.styles.length; i++) {
            if (isNullOrUndefined(this.documentHelper.styles.findByName(data.styles[i].name))) {
                this.parseStyle(data, data.styles[i], styles);
            }
        }
    };
    SfdtReader.prototype.parseRevisions = function (data, revisions) {
        for (var i = 0; i < data.revisions.length; i++) {
            var revisionData = data.revisions[i];
            if (!isNullOrUndefined(revisionData.revisionId) && !isNullOrUndefined(revisionData.revisionType)) {
                var revision = this.parseRevision(revisionData);
                var revisionCheck = true;
                if (!this.documentHelper.owner.sfdtExportModule.copyWithTrackChange && this.isPaste) {
                    if (revisionData.revisionType === 'Insertion' && this.isPaste && this.documentHelper.owner.enableTrackChanges) {
                        continue;
                    }
                    else {
                        if (!this.revisionCollection.containsKey(revisionData.revisionId)) {
                            this.revisionCollection.add(revisionData.revisionId, revision);
                        }
                    }
                }
                else {
                    this.revisionCollection.add(revisionData.revisionId, revision);
                }
                for (var j = 0; j < revisions.length; j++) {
                    if (revisions[j].revisionID === revision.revisionID) {
                        revisionCheck = false;
                    }
                }
                if (revisionCheck) {
                    revisions.push(revision);
                }
            }
        }
        this.documentHelper.revisionsInternal = this.revisionCollection;
        if (this.documentHelper.owner.sfdtExportModule) {
            this.documentHelper.owner.sfdtExportModule.copyWithTrackChange = false;
        }
    };
    SfdtReader.prototype.parseRevision = function (data) {
        if (!isNullOrUndefined(data)) {
            var revision = new Revision(this.viewer.owner, data.author, data.date);
            revision.revisionID = data.revisionId;
            revision.revisionType = data.revisionType;
            return revision;
        }
        else {
            return undefined;
        }
    };
    SfdtReader.prototype.checkAndApplyRevision = function (inline, item) {
        if (!isNullOrUndefined(inline.revisionIds) && inline.revisionIds.length > 0) {
            for (var i = 0; i < inline.revisionIds.length; i++) {
                var id = inline.revisionIds[i];
                if (this.revisionCollection.containsKey(id)) {
                    var revision = this.revisionCollection.get(id);
                    if (!(item instanceof WParagraphFormat)) {
                        revision.range.push(item);
                    }
                    item.revisions.push(revision);
                }
            }
        }
    };
    SfdtReader.prototype.parseComments = function (data, comments) {
        var count = 0;
        for (var i = 0; i < data.comments.length; i++) {
            var commentData = data.comments[i];
            var commentElement = undefined;
            commentElement = this.parseComment(commentData, commentElement);
            while (count < commentData.replyComments.length) {
                var replyComment = undefined;
                replyComment = this.parseComment(commentData.replyComments[count], replyComment);
                replyComment.ownerComment = commentElement;
                replyComment.isReply = true;
                commentElement.replyComments.push(replyComment);
                this.commentsCollection.add(replyComment.commentId, replyComment);
                count++;
            }
            this.commentsCollection.add(commentElement.commentId, commentElement);
            comments.push(commentElement);
            count = 0;
        }
    };
    SfdtReader.prototype.parseComment = function (commentData, commentElement) {
        commentElement = new CommentElementBox(commentData.date);
        commentElement.author = commentData.author;
        commentElement.initial = commentData.initial;
        commentElement.commentId = commentData.commentId;
        commentElement.isResolved = commentData.done;
        commentElement.text = this.parseCommentText(commentData.blocks);
        return commentElement;
    };
    SfdtReader.prototype.parseCommentText = function (blocks) {
        var text = '';
        for (var i = 0; i < blocks.length; i++) {
            if (i !== 0) {
                text += '\n';
            }
            for (var j = 0; j < blocks[i].inlines.length; j++) {
                text = text + blocks[i].inlines[j].text;
            }
        }
        return text;
    };
    SfdtReader.prototype.parseStyle = function (data, style, styles) {
        var wStyle;
        if (!isNullOrUndefined(style.type)) {
            if (style.type === 'Paragraph') {
                wStyle = new WParagraphStyle();
                wStyle.type = 'Paragraph';
            }
            if (style.type === 'Character') {
                wStyle = new WCharacterStyle();
                wStyle.type = 'Character';
            }
            if (!isNullOrUndefined(style.name)) {
                wStyle.name = style.name;
            }
            styles.push(wStyle);
            if (!isNullOrUndefined(style.basedOn)) {
                var basedOn = styles.findByName(style.basedOn);
                if (!isNullOrUndefined(basedOn)) {
                    if (basedOn.type === wStyle.type) {
                        wStyle.basedOn = basedOn;
                    }
                }
                else {
                    var basedStyle = this.getStyle(style.basedOn, data);
                    var styleString = void 0;
                    if (!isNullOrUndefined(basedStyle) && basedStyle.type === wStyle.type) {
                        styleString = basedStyle;
                    }
                    else {
                        if (wStyle.type === 'Paragraph') {
                            styleString = JSON.parse('{"type":"Paragraph","name":"Normal","next":"Normal"}');
                        }
                        else {
                            styleString = JSON.parse('{"type": "Character","name": "Default Paragraph Font"}');
                        }
                    }
                    this.parseStyle(data, styleString, styles);
                    wStyle.basedOn = styles.findByName(styleString.name);
                }
            }
            if (!isNullOrUndefined(style.link)) {
                var link = styles.findByName(style.link);
                var linkStyle = this.getStyle(style.link, data);
                var styleString = void 0;
                if (isNullOrUndefined(link)) {
                    if (isNullOrUndefined(linkStyle)) {
                        //Construct the CharacterStyle string
                        var charaStyle = {};
                        charaStyle.characterFormat = style.characterFormat;
                        charaStyle.name = style.name + ' Char';
                        charaStyle.type = 'Character';
                        //TODO: Implement basedOn
                        charaStyle.basedOn = style.basedOn === 'Normal' ? 'Default Paragraph Font' : (style.basedOn + ' Char');
                        styleString = charaStyle;
                    }
                    else {
                        styleString = linkStyle;
                    }
                    this.parseStyle(data, styleString, styles);
                    wStyle.link = isNullOrUndefined(styles.findByName(styleString.name)) ? style.link : styles.findByName(styleString.name);
                }
                else {
                    wStyle.link = link;
                }
            }
            if (!isNullOrUndefined(style.characterFormat)) {
                this.parseCharacterFormat(style.characterFormat, wStyle.characterFormat);
            }
            if (!isNullOrUndefined(style.paragraphFormat)) {
                this.parseParagraphFormat(style.paragraphFormat, wStyle.paragraphFormat);
            }
            if (!isNullOrUndefined(style.next)) {
                if (style.next === style.name) {
                    wStyle.next = wStyle;
                }
                else {
                    var next = styles.findByName(style.next);
                    if (!isNullOrUndefined(next) && next.type === wStyle.type) {
                        wStyle.next = next;
                    }
                    else {
                        var nextStyleString = this.getStyle(style.next, data);
                        if (!isNullOrUndefined(nextStyleString)) {
                            this.parseStyle(data, nextStyleString, styles);
                            wStyle.next = styles.findByName(nextStyleString.name);
                        }
                        else {
                            wStyle.next = wStyle;
                        }
                    }
                }
            }
        }
    };
    SfdtReader.prototype.getStyle = function (name, data) {
        for (var i = 0; i < data.styles.length; i++) {
            if (data.styles[i].name === name) {
                return data.styles[i];
            }
        }
        return undefined;
    };
    SfdtReader.prototype.parseAbstractList = function (data, abstractLists) {
        for (var i = 0; i < data.abstractLists.length; i++) {
            var abstractList = new WAbstractList();
            var abstract = data.abstractLists[i];
            abstractLists.push(abstractList);
            if (!isNullOrUndefined(abstract)) {
                if (!isNullOrUndefined(abstract.abstractListId)) {
                    abstractList.abstractListId = abstract.abstractListId;
                }
                if (!isNullOrUndefined(abstract.levels)) {
                    for (var j = 0; j < abstract.levels.length; j++) {
                        var level = abstract.levels[j];
                        if (!isNullOrUndefined(level)) {
                            var listLevel = this.parseListLevel(level, abstractList);
                            abstractList.levels.push(listLevel);
                        }
                    }
                }
            }
        }
    };
    SfdtReader.prototype.parseListLevel = function (data, owner) {
        var listLevel = new WListLevel(owner);
        if (data.listLevelPattern === 'Bullet') {
            listLevel.listLevelPattern = 'Bullet';
            listLevel.numberFormat = !isNullOrUndefined(data.numberFormat) ? data.numberFormat : '';
        }
        else {
            listLevel.listLevelPattern = data.listLevelPattern;
            listLevel.startAt = data.startAt;
            listLevel.numberFormat = !isNullOrUndefined(data.numberFormat) ? data.numberFormat : '';
            if (data.restartLevel >= 0) {
                listLevel.restartLevel = data.restartLevel;
            }
            else {
                listLevel.restartLevel = data.levelNumber;
            }
        }
        listLevel.followCharacter = data.followCharacter;
        this.parseCharacterFormat(data.characterFormat, listLevel.characterFormat);
        this.parseParagraphFormat(data.paragraphFormat, listLevel.paragraphFormat);
        return listLevel;
    };
    SfdtReader.prototype.parseList = function (data, listCollection) {
        for (var i = 0; i < data.lists.length; i++) {
            var list = new WList();
            var lists = data.lists[i];
            if (!isNullOrUndefined(lists.abstractListId)) {
                list.abstractListId = lists.abstractListId;
                list.abstractList = this.documentHelper.getAbstractListById(lists.abstractListId);
            }
            listCollection.push(list);
            if (!isNullOrUndefined(lists.listId)) {
                list.listId = lists.listId;
            }
            if (lists.hasOwnProperty('levelOverrides')) {
                this.parseLevelOverride(lists.levelOverrides, list);
            }
        }
    };
    SfdtReader.prototype.parseLevelOverride = function (data, list) {
        if (isNullOrUndefined(data)) {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var levelOverrides = new WLevelOverride();
            var levelOverride = data[i];
            levelOverrides.startAt = levelOverride.startAt;
            levelOverrides.levelNumber = levelOverride.levelNumber;
            if (!isNullOrUndefined(levelOverride.overrideListLevel)) {
                levelOverrides.overrideListLevel = this.parseListLevel(levelOverride.overrideListLevel, levelOverrides);
            }
            list.levelOverrides.push(levelOverrides);
        }
    };
    SfdtReader.prototype.parseSections = function (data, sections) {
        for (var i = 0; i < data.length; i++) {
            var section = new BodyWidget();
            section.sectionFormat = new WSectionFormat(section);
            section.index = i;
            var item = data[i];
            if (!isNullOrUndefined(item.sectionFormat)) {
                this.parseSectionFormat(item.sectionFormat, section.sectionFormat);
            }
            if (isNullOrUndefined(item.headersFooters)) {
                item.headersFooters = {};
            }
            this.documentHelper.headersFooters.push(this.parseHeaderFooter(item.headersFooters, this.documentHelper.headersFooters));
            this.isParseHeader = false;
            this.parseTextBody(item.blocks, section, i + 1 < data.length);
            for (var i_1 = 0; i_1 < section.childWidgets.length; i_1++) {
                section.childWidgets[i_1].containerWidget = section;
            }
            sections.push(section);
        }
    };
    SfdtReader.prototype.parseHeaderFooter = function (data, headersFooters) {
        this.isParseHeader = true;
        var hfs = {};
        if (!isNullOrUndefined(data.header)) {
            var oddHeader = new HeaderFooterWidget('OddHeader');
            hfs[0] = oddHeader;
            this.parseTextBody(data.header.blocks, oddHeader);
        }
        if (!isNullOrUndefined(data.footer)) {
            var oddFooter = new HeaderFooterWidget('OddFooter');
            hfs[1] = oddFooter;
            this.parseTextBody(data.footer.blocks, oddFooter);
        }
        if (!isNullOrUndefined(data.evenHeader)) {
            var evenHeader = new HeaderFooterWidget('EvenHeader');
            hfs[2] = evenHeader;
            this.parseTextBody(data.evenHeader.blocks, evenHeader);
        }
        if (!isNullOrUndefined(data.evenFooter)) {
            var evenFooter = new HeaderFooterWidget('EvenFooter');
            hfs[3] = evenFooter;
            this.parseTextBody(data.evenFooter.blocks, evenFooter);
        }
        if (!isNullOrUndefined(data.firstPageHeader)) {
            var firstPageHeader = new HeaderFooterWidget('FirstPageHeader');
            hfs[4] = firstPageHeader;
            this.parseTextBody(data.firstPageHeader.blocks, firstPageHeader);
        }
        if (!isNullOrUndefined(data.firstPageFooter)) {
            var firstPageFooter = new HeaderFooterWidget('FirstPageFooter');
            hfs[5] = firstPageFooter;
            this.parseTextBody(data.firstPageFooter.blocks, firstPageFooter);
        }
        return hfs;
    };
    SfdtReader.prototype.parseTextBody = function (data, section, isSectionBreak) {
        this.parseBody(data, section.childWidgets, section, isSectionBreak);
    };
    SfdtReader.prototype.addCustomStyles = function (data) {
        if (!isNullOrUndefined(data.styles)) {
            for (var i = 0; i < data.styles.length; i++) {
                var style = this.documentHelper.styles.findByName(data.styles[i].name);
                if (style === undefined) {
                    this.parseStyle(data, data.styles[i], this.documentHelper.styles);
                }
            }
        }
    };
    SfdtReader.prototype.parseBody = function (data, blocks, container, isSectionBreak, contentControlProperties) {
        if (!isNullOrUndefined(data)) {
            for (var i = 0; i < data.length; i++) {
                var block = data[i];
                var hasValidElmts = false;
                if (block.hasOwnProperty('inlines')) {
                    var writeInlineFormat = false;
                    //writeInlineFormat = this.isPasting && i === data.length - 1;
                    var paragraph = new ParagraphWidget();
                    paragraph.characterFormat = new WCharacterFormat(paragraph);
                    paragraph.paragraphFormat = new WParagraphFormat(paragraph);
                    if (block.inlines.length > 0) {
                        hasValidElmts = this.parseParagraph(block.inlines, paragraph, writeInlineFormat);
                    }
                    if (!(isSectionBreak && block === data[data.length - 1] && !hasValidElmts)) {
                        this.parseCharacterFormat(block.characterFormat, paragraph.characterFormat);
                        this.parseParagraphFormat(block.paragraphFormat, paragraph.paragraphFormat);
                        var styleObj = void 0;
                        if (!isNullOrUndefined(block.paragraphFormat) && !isNullOrUndefined(block.paragraphFormat.styleName)) {
                            styleObj = this.documentHelper.styles.findByName(block.paragraphFormat.styleName, 'Paragraph');
                            if (!isNullOrUndefined(styleObj)) {
                                paragraph.paragraphFormat.applyStyle(styleObj);
                            }
                        }
                        blocks.push(paragraph);
                    }
                    else if (isSectionBreak && data.length === 1) {
                        blocks.push(paragraph);
                    }
                    paragraph.index = blocks.length - 1;
                    paragraph.containerWidget = container;
                }
                else if (block.hasOwnProperty('rows')) {
                    this.parseTable(block, blocks, blocks.length, container);
                }
                else if (block.hasOwnProperty('contentControlProperties')) {
                    var blockStartContentControl = new ContentControl('Block');
                    var blockEndContentControl = new ContentControl('Block');
                    this.parseContentControlProperties(block.contentControlProperties, blockStartContentControl.contentControlProperties);
                    blockEndContentControl.contentControlProperties = blockStartContentControl.contentControlProperties;
                    blockStartContentControl.type = 0;
                    blockEndContentControl.type = 1;
                    this.parseBody(block.blocks, blocks, container, isSectionBreak, blockStartContentControl.contentControlProperties);
                    for (var j = 0; j < 2; j++) {
                        var para = (blocks.length < block.blocks.length) ? blocks[0] : j === 0 ? blocks[blocks.length - block.blocks.length] : blocks[blocks.length - 1];
                        var blockWidget = void 0;
                        if (para instanceof ParagraphWidget) {
                            blockWidget = para;
                        }
                        else if (para instanceof TableWidget) {
                            if (j === 0) {
                                blockWidget = para.firstChild.firstChild.firstChild;
                            }
                            else {
                                var cell = para.lastChild.lastChild;
                                blockWidget = cell.lastChild;
                            }
                        }
                        if (!isNullOrUndefined(blockWidget) && blockWidget.childWidgets.length === 0) {
                            var lineWidget = new LineWidget(blockWidget);
                            blockWidget.childWidgets.push(lineWidget);
                        }
                        if (j === 0) {
                            blockWidget.firstChild.children.splice(0, 0, blockStartContentControl);
                            blockStartContentControl.line = blockWidget.firstChild;
                        }
                        else {
                            blockWidget.lastChild.children.push(blockEndContentControl);
                            blockEndContentControl.line = blockWidget.lastChild;
                        }
                    }
                }
                if (!isNullOrUndefined(contentControlProperties)) {
                    blocks[blocks.length - 1].contentControlProperties = contentControlProperties;
                }
            }
        }
    };
    SfdtReader.prototype.parseTable = function (block, blocks, index, section) {
        var table = new TableWidget();
        table.index = index;
        table.tableFormat = new WTableFormat(table);
        if (!isNullOrUndefined(block.tableFormat)) {
            this.parseTableFormat(block.tableFormat, table.tableFormat);
        }
        table.title = block.title;
        table.description = block.description;
        this.parseTablePositioning(block, table);
        for (var i = 0; i < block.rows.length; i++) {
            var row = new TableRowWidget();
            row.rowFormat = new WRowFormat(row);
            var tableRow = block.rows[i];
            if (!isNullOrUndefined(tableRow.contentControlProperties)) {
                row.contentControlProperties = new ContentControlProperties('Row');
                this.parseContentControlProperties(tableRow.contentControlProperties, row.contentControlProperties);
            }
            if (tableRow.hasOwnProperty('rowFormat')) {
                this.parseRowFormat(tableRow.rowFormat, row.rowFormat);
                this.parseRowGridValues(tableRow, row.rowFormat);
                this.parseRowGridValues(tableRow.rowFormat, row.rowFormat);
                row.index = i;
                for (var j = 0; j < block.rows[i].cells.length; j++) {
                    var cell = new TableCellWidget();
                    cell.cellFormat = new WCellFormat(cell);
                    if (!isNullOrUndefined(block.rows[i].cells[j].contentControlProperties)) {
                        cell.contentControlProperties = new ContentControlProperties('Cell');
                        this.parseContentControlProperties(block.rows[i].cells[j].contentControlProperties, cell.contentControlProperties);
                    }
                    row.childWidgets.push(cell);
                    cell.containerWidget = row;
                    cell.index = j;
                    cell.rowIndex = i;
                    cell.columnIndex = j;
                    if (block.rows[i].cells[j].hasOwnProperty('cellFormat')) {
                        this.parseCellFormat(block.rows[i].cells[j].cellFormat, cell.cellFormat);
                    }
                    this.isPageBreakInsideTable = true;
                    this.parseTextBody(block.rows[i].cells[j].blocks, cell, false);
                    if (!isNullOrUndefined(cell.contentControlProperties)) {
                        var cellStartContentControl = new ContentControl('Cell');
                        var cellEndContentControl = new ContentControl('Cell');
                        cellStartContentControl.contentControlProperties = cell.contentControlProperties;
                        cellEndContentControl.contentControlProperties = cell.contentControlProperties;
                        cellStartContentControl.type = 0;
                        cellEndContentControl.type = 1;
                        if (cell.firstChild.childWidgets.length === 0) {
                            var lineWidget = new LineWidget(cell.firstChild);
                            cell.firstChild.childWidgets.push(lineWidget);
                        }
                        cellStartContentControl.line = cell.firstChild.firstChild;
                        cell.firstChild.firstChild.children.splice(0, 0, cellStartContentControl);
                        cellEndContentControl.line = cell.lastChild.lastChild;
                        cell.lastChild.lastChild.children.push(cellEndContentControl);
                    }
                    if (!isNullOrUndefined(row.contentControlProperties)) {
                        if (row.firstChild === cell) {
                            var rowStartContentControl = new ContentControl('Row');
                            rowStartContentControl.contentControlProperties = row.contentControlProperties;
                            rowStartContentControl.type = 0;
                            if (cell.firstChild.childWidgets.length === 0) {
                                var lineWidget = new LineWidget(cell.firstChild);
                                cell.firstChild.childWidgets.push(lineWidget);
                            }
                            rowStartContentControl.line = cell.firstChild.firstChild;
                            cell.firstChild.firstChild.children.splice(0, 0, rowStartContentControl);
                        }
                        else if (row.lastChild === cell) {
                            var rowEndContentControl = new ContentControl('Row');
                            rowEndContentControl.contentControlProperties = row.contentControlProperties;
                            rowEndContentControl.type = 1;
                            if (cell.lastChild.childWidgets.length === 0) {
                                var lineWidget = new LineWidget(cell.lastChild);
                                cell.lastChild.childWidgets.push(lineWidget);
                            }
                            rowEndContentControl.line = cell.lastChild.lastChild;
                            cell.lastChild.lastChild.children.push(rowEndContentControl);
                        }
                    }
                    this.isPageBreakInsideTable = false;
                }
            }
            table.childWidgets.push(row);
            row.containerWidget = table;
        }
        table.containerWidget = section;
        blocks.push(table);
        table.isGridUpdated = false;
    };
    SfdtReader.prototype.parseTablePositioning = function (block, table) {
        table.wrapTextAround = !isNullOrUndefined(block.wrapTextAround) ? block.wrapTextAround : false;
        if (table.wrapTextAround) {
            table.positioning = new TablePosition();
            table.positioning.allowOverlap = block.positioning.allowOverlap;
            table.positioning.distanceBottom = HelperMethods.convertPointToPixel(block.positioning.distanceBottom);
            table.positioning.distanceLeft = HelperMethods.convertPointToPixel(block.positioning.distanceLeft);
            table.positioning.distanceRight = HelperMethods.convertPointToPixel(block.positioning.distanceRight);
            table.positioning.distanceTop = HelperMethods.convertPointToPixel(block.positioning.distanceTop);
            if (!isNullOrUndefined(block.positioning.verticalAlignment)) {
                table.positioning.verticalAlignment = block.positioning.verticalAlignment;
            }
            if (!isNullOrUndefined(block.positioning.verticalOrigin)) {
                table.positioning.verticalOrigin = block.positioning.verticalOrigin;
            }
            table.positioning.verticalPosition = block.positioning.verticalPosition;
            if (!isNullOrUndefined(block.positioning.horizontalAlignment)) {
                table.positioning.horizontalAlignment = block.positioning.horizontalAlignment;
            }
            if (!isNullOrUndefined(block.positioning.horizontalOrigin)) {
                table.positioning.horizontalOrigin = block.positioning.horizontalOrigin;
            }
            table.positioning.horizontalPosition = block.positioning.horizontalPosition;
        }
    };
    SfdtReader.prototype.parseRowGridValues = function (data, rowFormat) {
        if (!isNullOrUndefined(data.gridBefore)) {
            rowFormat.gridBefore = data.gridBefore;
        }
        if (!isNullOrUndefined(data.gridBeforeWidth)) {
            rowFormat.gridBeforeWidth = data.gridBeforeWidth;
        }
        if (!isNullOrUndefined(data.gridBeforeWidthType)) {
            rowFormat.gridBeforeWidthType = data.gridBeforeWidthType;
        }
        if (!isNullOrUndefined(data.gridAfter)) {
            rowFormat.gridAfter = data.gridAfter;
        }
        if (!isNullOrUndefined(data.gridAfterWidth)) {
            rowFormat.gridAfterWidth = data.gridAfterWidth;
        }
        if (!isNullOrUndefined(data.gridAfterWidthType)) {
            rowFormat.gridAfterWidthType = data.gridAfterWidthType;
        }
    };
    SfdtReader.prototype.parseContentControlProperties = function (wContentControlProperties, contentControlProperties) {
        if (!isNullOrUndefined(wContentControlProperties.lockContentControl)) {
            contentControlProperties.lockContentControl = wContentControlProperties.lockContentControl;
        }
        if (!isNullOrUndefined(wContentControlProperties.lockContents)) {
            contentControlProperties.lockContents = wContentControlProperties.lockContents;
        }
        if (!isNullOrUndefined(wContentControlProperties.tag)) {
            contentControlProperties.tag = wContentControlProperties.tag;
        }
        if (!isNullOrUndefined(wContentControlProperties.color)) {
            contentControlProperties.color = wContentControlProperties.color;
        }
        if (!isNullOrUndefined(wContentControlProperties.title)) {
            contentControlProperties.title = wContentControlProperties.title;
        }
        if (!isNullOrUndefined(wContentControlProperties.appearance)) {
            contentControlProperties.appearance = wContentControlProperties.appearance;
        }
        if (!isNullOrUndefined(wContentControlProperties.type)) {
            contentControlProperties.type = wContentControlProperties.type;
        }
        if (!isNullOrUndefined(wContentControlProperties.hasPlaceHolderText)) {
            contentControlProperties.hasPlaceHolderText = wContentControlProperties.hasPlaceHolderText;
        }
        if (!isNullOrUndefined(wContentControlProperties.multiline)) {
            contentControlProperties.multiline = wContentControlProperties.multiline;
        }
        if (!isNullOrUndefined(wContentControlProperties.isTemporary)) {
            contentControlProperties.isTemporary = wContentControlProperties.isTemporary;
        }
        if (!isNullOrUndefined(wContentControlProperties.characterFormat)) {
            this.parseCharacterFormat(wContentControlProperties.characterFormat, contentControlProperties.characterFormat);
        }
        if (contentControlProperties.type === 'CheckBox') {
            if (!isNullOrUndefined(wContentControlProperties.isChecked)) {
                contentControlProperties.isChecked = wContentControlProperties.isChecked;
            }
            if (!isNullOrUndefined(wContentControlProperties.uncheckedState)) {
                contentControlProperties.uncheckedState = new CheckBoxState();
                contentControlProperties.uncheckedState.font = wContentControlProperties.uncheckedState.font;
                contentControlProperties.uncheckedState.value = wContentControlProperties.uncheckedState.value;
            }
            if (!isNullOrUndefined(wContentControlProperties.checkedState)) {
                contentControlProperties.checkedState = new CheckBoxState();
                contentControlProperties.checkedState.font = wContentControlProperties.checkedState.font;
                contentControlProperties.checkedState.value = wContentControlProperties.checkedState.value;
            }
        }
        else if (contentControlProperties.type === 'Date') {
            if (!isNullOrUndefined(wContentControlProperties.dateCalendarType)) {
                contentControlProperties.dateCalendarType = wContentControlProperties.dateCalendarType;
            }
            if (!isNullOrUndefined(wContentControlProperties.dateStorageFormat)) {
                contentControlProperties.dateStorageFormat = wContentControlProperties.dateStorageFormat;
            }
            if (!isNullOrUndefined(wContentControlProperties.dateDisplayLocale)) {
                contentControlProperties.dateDisplayLocale = wContentControlProperties.dateDisplayLocale;
            }
            if (!isNullOrUndefined(wContentControlProperties.dateDisplayFormat)) {
                contentControlProperties.dateDisplayFormat = wContentControlProperties.dateDisplayFormat;
            }
        }
        else if (contentControlProperties.type === 'ComboBox' || contentControlProperties.type === 'DropDownList') {
            if (!isNullOrUndefined(wContentControlProperties.contentControlListItems)) {
                for (var i = 0; i < wContentControlProperties.contentControlListItems.length; i++) {
                    var contentControlListItem = new ContentControlListItems();
                    contentControlListItem.displayText = wContentControlProperties.contentControlListItems[i].displayText;
                    contentControlListItem.value = wContentControlProperties.contentControlListItems[i].value;
                    contentControlProperties.contentControlListItems.push(contentControlListItem);
                }
            }
        }
        if (!isNullOrUndefined(wContentControlProperties.xmlMapping)) {
            contentControlProperties.xmlMapping = new XmlMapping();
            contentControlProperties.xmlMapping.isMapped = wContentControlProperties.xmlMapping.isMapped;
            contentControlProperties.xmlMapping.isWordMl = wContentControlProperties.xmlMapping.isWordMl;
            if (!isNullOrUndefined(wContentControlProperties.xmlMapping.prefixMapping)) {
                contentControlProperties.xmlMapping.prefixMapping = wContentControlProperties.xmlMapping.prefixMapping;
            }
            contentControlProperties.xmlMapping.xPath = wContentControlProperties.xmlMapping.xPath;
            contentControlProperties.xmlMapping.storeItemId = wContentControlProperties.xmlMapping.storeItemId;
            if (!isNullOrUndefined(wContentControlProperties.xmlMapping.customXmlPart)) {
                contentControlProperties.xmlMapping.customXmlPart = new CustomXmlPart();
                contentControlProperties.xmlMapping.customXmlPart.id = wContentControlProperties.xmlMapping.customXmlPart.id;
                contentControlProperties.xmlMapping.customXmlPart.xml = wContentControlProperties.xmlMapping.customXmlPart.xml;
            }
        }
    };
    /* eslint-disable  */
    SfdtReader.prototype.parseParagraph = function (data, paragraph, writeInlineFormat, lineWidget) {
        var isContentControl = false;
        if (isNullOrUndefined(lineWidget)) {
            lineWidget = new LineWidget(paragraph);
        }
        else {
            isContentControl = true;
        }
        var hasValidElmts = false;
        var revision;
        var trackChange = this.viewer.owner.enableTrackChanges;
        for (var i = 0; i < data.length; i++) {
            var inline = data[i];
            if (inline.hasOwnProperty('text')) {
                var textElement = undefined;
                if (this.documentHelper.isPageField) {
                    textElement = new FieldTextElementBox();
                    textElement.fieldBegin = this.documentHelper.fieldStacks[this.documentHelper.fieldStacks.length - 1];
                }
                else if (inline.text === '\t') {
                    textElement = new TabElementBox();
                }
                else if (inline.text === '\f' && this.isPageBreakInsideTable) {
                    continue;
                }
                else {
                    textElement = new TextElementBox();
                }
                textElement.characterFormat = new WCharacterFormat(textElement);
                this.parseCharacterFormat(inline.characterFormat, textElement.characterFormat, writeInlineFormat);
                this.applyCharacterStyle(inline, textElement);
                textElement.text = inline.text;
                if (this.documentHelper.owner.parser.isPaste && !(this.isCutPerformed)) {
                    if (!isNullOrUndefined(inline.revisionIds)) {
                        for (var j = 0; j < inline.revisionIds.length; j++) {
                            if (this.revisionCollection.containsKey(inline.revisionIds[j])) {
                                if (trackChange) {
                                    revision = this.revisionCollection.get(inline.revisionIds[j]);
                                }
                                if (!isNullOrUndefined(revision) && !isNullOrUndefined(lineWidget.children[i - 1].revisions[j]) && ((!trackChange) || (trackChange && (revision.revisionType === 'Deletion')))) {
                                    if (revision.revisionID === inline.revisionIds[j]) {
                                        inline.revisionIds[j] = lineWidget.children[i - 1].revisions[j].revisionID;
                                        this.checkAndApplyRevision(inline, textElement);
                                        continue;
                                    }
                                }
                                if (!trackChange) {
                                    revision = this.documentHelper.revisionsInternal.get(inline.revisionIds[j]);
                                }
                                this.documentHelper.owner.editorModule.insertRevision(textElement, revision.revisionType, revision.author);
                                inline.revisionIds[j] = textElement.revisions[j].revisionID;
                            }
                        }
                    }
                }
                else {
                    this.checkAndApplyRevision(inline, textElement);
                }
                textElement.line = lineWidget;
                lineWidget.children.push(textElement);
                hasValidElmts = true;
            }
            else if (inline.hasOwnProperty('footnoteType')) {
                var footnoteElement = new FootnoteElementBox();
                footnoteElement.line = lineWidget;
                footnoteElement.footnoteType = inline.footnoteType;
                if (footnoteElement.footnoteType === 'Footnote') {
                    this.documentHelper.footnoteCollection.push(footnoteElement);
                }
                else {
                    this.documentHelper.endnoteCollection.push(footnoteElement);
                }
                footnoteElement.symbolCode = inline.symbolCode;
                footnoteElement.symbolFontName = inline.symbolFontName;
                footnoteElement.customMarker = inline.customMarker;
                footnoteElement.characterFormat = new WCharacterFormat(footnoteElement);
                this.parseCharacterFormat(inline.characterFormat, footnoteElement.characterFormat, writeInlineFormat);
                this.applyCharacterStyle(inline, footnoteElement);
                this.parseBody(inline.blocks, footnoteElement.blocks, undefined, false);
                lineWidget.children.push(footnoteElement);
                for (var j = 0; j < footnoteElement.blocks.length; j++) {
                    footnoteElement.blocks[j].footNoteReference = footnoteElement;
                }
                hasValidElmts = true;
            }
            else if (inline.hasOwnProperty('chartType')) {
                // chartPreservation
                if (this.documentHelper.owner.editor) {
                    this.documentHelper.owner.editor.chartType = true;
                }
                var chartElement = new ChartElementBox();
                chartElement.title = inline.chartTitle;
                chartElement.type = inline.chartType;
                chartElement.chartGapWidth = inline.gapWidth;
                chartElement.chartOverlap = inline.overlap;
                this.parseChartTitleArea(inline.chartTitleArea, chartElement.chartTitleArea);
                this.parseChartArea(inline.chartArea, chartElement.chartArea);
                this.parseChartArea(inline.plotArea, chartElement.chartPlotArea);
                this.parseChartLegend(inline.chartLegend, chartElement.chartLegend);
                this.parseChartData(inline, chartElement);
                this.parseChartCategoryAxis(inline.chartPrimaryCategoryAxis, chartElement.chartPrimaryCategoryAxis);
                this.parseChartCategoryAxis(inline.chartPrimaryValueAxis, chartElement.chartPrimaryValueAxis);
                if (inline.chartDataTable != null) {
                    this.parseChartDataTable(inline.chartDataTable, chartElement.chartDataTable);
                }
                chartElement.line = lineWidget;
                lineWidget.children.push(chartElement);
                chartElement.height = HelperMethods.convertPointToPixel(inline.height);
                chartElement.width = HelperMethods.convertPointToPixel(inline.width);
                var officeChart = new ChartComponent();
                officeChart.chartRender(inline);
                chartElement.officeChart = officeChart;
                officeChart.chart.appendTo(chartElement.targetElement);
                hasValidElmts = true;
            }
            else if (inline.hasOwnProperty('imageString')) {
                var image = new ImageElementBox(data[i].isInlineImage);
                image.isMetaFile = data[i].isMetaFile;
                image.isCompressed = data[i].isCompressed;
                image.metaFileImageString = data[i].metaFileImageString;
                image.characterFormat = new WCharacterFormat(image);
                image.line = lineWidget;
                this.checkAndApplyRevision(inline, image);
                lineWidget.children.push(image);
                var imageString = HelperMethods.formatClippedString(inline.imageString).formatClippedString;
                var isValidImage = this.validateImageUrl(imageString);
                if (!isValidImage) {
                    image.imageString = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAgVBMVEX///8AAADgAADY2Njl5eVcXFxjY2NZWVl/f3+wsLCmpqb4+PiioqKpqam7u7vV1dX2uLj2wsLhFRXzpKT3vb30sbHhCwv74+P40dH+9vbkIyO2trbBwcHLy8tsbGycnJz529v4zMzrbGzlLS3qZmblNzfrdXXoRkbvi4vvgYHlHh7CZsBOAAADpUlEQVR4nO3da1faQBSF4ekAUQlUEFs14AXxVv7/D6yaQiZx5mSEYXF2ut+PNKzyyK5diYDmR9czx34AB49C/CjE759w3jvvWr15Tdgz3atXE54f++EcIArxoxA/CvGjED8K8aMQPwrxoxA/CvGLEeZ9jPJdhfk4GyCUjb3ECGE/Q6m/q3DwfudjP0ERZYN9hKdn2hvd3+0jHJz5/kBVuTk96bbQUEjhYR9ckiikUH8UUqg/CinUH4UU6o9CCvVHIYX6o5BC/VFIof4opFB/FFKoPwop1B+FFOqPQgrjyxfjVC38Lxk9tnAxGqZqdKtSOE4GHA5/fuNJpDCtcNHbv4VqYYqPLjgfUViPQgrjozA2CptRSGF8/59w+Wrt+rr1btNna1cPzg0wwuXavncxabnX7PfHYYXzlYARvlobQZyUR9mXm+1NMEK7SSLONgcVV9vb8IQXv4J3KSeKKlxXxNCzONkeYp8AV3p9UT1+P3FWHVAsq5thhGZSEb1DrSZq7dS5HUdoLiuBZ6jORG3tCwAkNJfCUJ2Jrqe1P0ESCkMNTdSACYNDDU7UoAkDQw1P1MAJvUMVJmrwhJ6hShM1gMIvQxUnahCFjaHKEzWQQneoxR95ogZTWBuqPFEDKnSHKk/UoArdoYoTNbDC5lBDEzW4QjMpYiZqgIXG/S76JhwHK5zVVipcnkIVuv/RW/HyFKhwYhuFr6NiCmdNoDBUSGFjovJQEYXuRN9ahwoorJ8uSZenPsMTNk+X2q6jwgm/ntHL11HhhL4zenmoYEL/Gb04VCxh6KKTNFQoYfiikzBUJKF00Sk8VCChfF00OFQcYdt10dBQYYRT5xn0n9G7Q0X8GfCzNNEyZ6iPgD/HlydaVg11DfhajJaJlm2HugIUrlomWrYZKuJKHz6vHhbSM/hROdRnxNe1meuXYvW0DB6+aflYrB7dlzDiCM3N1dVN6GDhMCDhjlHYjEIK46MwNgqbUUhhfJ/vA07wO8N1vw94ONo/3e/lTpVOYfc/UyG//ZmqW52fi/FuTNW3/lZ+eguF+qOQQv1RSKH+KKRQfxRSqD8KKdQfhRTqj0IK9UchhfqjkEL9UUih/iikUH8UUqg/CmXh6Hsv3jlK+wnvD/vgkrSHMMuyu1P9ZdmuwnycDQYn+svG3n9KEUKT9zHyf6+IEWJHIX4U4kchfhTiRyF+FOJHIX4U4kchfnVhijeZa6sunCf4ZdPamteEHY5C/CjEr/vCv0ec0g+AtS1QAAAAAElFTkSuQmCC';
                }
                else {
                    image.imageString = inline.imageString;
                }
                image.width = HelperMethods.convertPointToPixel(inline.width);
                image.height = HelperMethods.convertPointToPixel(inline.height);
                image.top = inline.top;
                image.left = inline.left;
                image.bottom = inline.bottom;
                image.right = inline.right;
                image.cropHeightScale = inline.getimageheight;
                image.cropWidthScale = inline.getimagewidth;
                image.name = inline.name;
                image.alternativeText = inline.alternativeText;
                image.title = inline.title;
                image.visible = inline.visible;
                image.widthScale = inline.widthScale;
                image.heightScale = inline.heightScale;
                image.verticalPosition = HelperMethods.convertPointToPixel(inline.verticalPosition);
                image.verticalOrigin = inline.verticalOrigin;
                image.verticalAlignment = inline.verticalAlignment;
                image.horizontalPosition = HelperMethods.convertPointToPixel(inline.horizontalPosition);
                image.horizontalOrigin = inline.horizontalOrigin;
                image.horizontalAlignment = inline.horizontalAlignment;
                image.allowOverlap = inline.allowOverlap;
                image.textWrappingStyle = isNullOrUndefined(inline.textWrappingStyle) ? 'Inline' : inline.textWrappingStyle;
                image.textWrappingType = inline.textWrappingType;
                image.zOrderPosition = inline.zOrderPosition;
                image.layoutInCell = inline.layoutInCell;
                if (image.textWrappingStyle !== 'Inline') {
                    paragraph.floatingElements.push(image);
                }
                this.parseCharacterFormat(inline.characterFormat, image.characterFormat);
                hasValidElmts = true;
            }
            else if (inline.hasOwnProperty('hasFieldEnd') || (inline.hasOwnProperty('fieldType') && inline.fieldType === 0)) {
                var fieldBegin = new FieldElementBox(0);
                this.parseCharacterFormat(inline.characterFormat, fieldBegin.characterFormat, writeInlineFormat);
                this.applyCharacterStyle(inline, fieldBegin);
                fieldBegin.fieldCodeType = inline.fieldCodeType;
                fieldBegin.hasFieldEnd = inline.hasFieldEnd;
                if (inline.hasOwnProperty('formFieldData')) {
                    var formFieldData = void 0;
                    if (inline.formFieldData.hasOwnProperty('textInput')) {
                        formFieldData = new TextFormField();
                        formFieldData.type = inline.formFieldData.textInput.type;
                        formFieldData.maxLength = inline.formFieldData.textInput.maxLength;
                        formFieldData.defaultValue = inline.formFieldData.textInput.defaultValue;
                        formFieldData.format = inline.formFieldData.textInput.format;
                    }
                    else if (inline.formFieldData.hasOwnProperty('checkBox')) {
                        formFieldData = new CheckBoxFormField();
                        formFieldData.sizeType = inline.formFieldData.checkBox.sizeType;
                        formFieldData.size = inline.formFieldData.checkBox.size;
                        formFieldData.defaultValue = inline.formFieldData.checkBox.defaultValue;
                        formFieldData.checked = inline.formFieldData.checkBox.checked;
                    }
                    else {
                        formFieldData = new DropDownFormField();
                        formFieldData.dropdownItems = inline.formFieldData.dropDownList.dropDownItems;
                        formFieldData.selectedIndex = inline.formFieldData.dropDownList.selectedIndex;
                    }
                    formFieldData.name = inline.formFieldData.name;
                    formFieldData.enabled = inline.formFieldData.enabled;
                    formFieldData.helpText = inline.formFieldData.helpText;
                    formFieldData.statusText = inline.formFieldData.statusText;
                    fieldBegin.formFieldData = formFieldData;
                    this.documentHelper.formFields.push(fieldBegin);
                }
                this.documentHelper.fieldStacks.push(fieldBegin);
                this.checkAndApplyRevision(inline, fieldBegin);
                fieldBegin.line = lineWidget;
                this.documentHelper.fields.push(fieldBegin);
                lineWidget.children.push(fieldBegin);
            }
            else if (inline.hasOwnProperty('fieldType')) {
                var field = undefined;
                if (inline.fieldType === 2) {
                    field = new FieldElementBox(2);
                    this.fieldSeparator = field;
                    if (this.documentHelper.fieldStacks.length > 0) {
                        field.fieldBegin = this.documentHelper.fieldStacks[this.documentHelper.fieldStacks.length - 1];
                        field.fieldBegin.fieldSeparator = field;
                        //finds the whether the field is page filed or not
                        var lineWidgetCount = lineWidget.children.length;
                        if (lineWidgetCount >= 2) {
                            var fieldTextElement = this.containsFieldBegin(lineWidget);
                            if (!isNullOrUndefined(fieldTextElement) && fieldTextElement instanceof TextElementBox && fieldTextElement.text.match('PAGE')) {
                                this.documentHelper.isPageField = true;
                            }
                        }
                    }
                }
                else if (inline.fieldType === 1) {
                    field = new FieldElementBox(1);
                    this.parseCharacterFormat(inline.characterFormat, field.characterFormat, writeInlineFormat);
                    this.applyCharacterStyle(inline, field);
                    this.checkAndApplyRevision(inline, field);
                    //For Field End Updated begin and separator.                                      
                    if (this.documentHelper.fieldStacks.length > 0) {
                        field.fieldBegin = this.documentHelper.fieldStacks[this.documentHelper.fieldStacks.length - 1];
                        field.fieldBegin.fieldEnd = field;
                    }
                    if (!isNullOrUndefined(field.fieldBegin) && field.fieldBegin.fieldSeparator) {
                        field.fieldSeparator = field.fieldBegin.fieldSeparator;
                        field.fieldBegin.fieldSeparator.fieldEnd = field;
                        hasValidElmts = true;
                    }
                    //After setting all the property clear the field values
                    this.documentHelper.fieldStacks.splice(this.documentHelper.fieldStacks.length - 1, 1);
                    this.fieldSeparator = undefined;
                    this.documentHelper.isPageField = false;
                    this.documentHelper.fieldCollection.push(field.fieldBegin);
                }
                field.line = lineWidget;
                lineWidget.children.push(field);
            }
            else if (inline.hasOwnProperty('bookmarkType')) {
                var bookmark = undefined;
                bookmark = new BookmarkElementBox(inline.bookmarkType);
                bookmark.name = inline.name;
                lineWidget.children.push(bookmark);
                bookmark.line = lineWidget;
                if (!this.isParseHeader || this.isPaste) {
                    if (inline.bookmarkType === 0) {
                        var isAdd = this.isPaste && !this.documentHelper.bookmarks.containsKey(bookmark.name);
                        if (!this.isPaste || isAdd) {
                            this.documentHelper.bookmarks.add(bookmark.name, bookmark);
                        }
                        else if (!isAdd) {
                            lineWidget.children.splice(lineWidget.children.indexOf(bookmark), 1);
                        }
                    }
                    else if (inline.bookmarkType === 1) {
                        if (this.documentHelper.bookmarks.containsKey(bookmark.name)) {
                            var bookmarkStart = this.documentHelper.bookmarks.get(bookmark.name);
                            var isConsider = this.isPaste && isNullOrUndefined(bookmarkStart.reference);
                            if (!this.isPaste || isConsider) {
                                bookmarkStart.reference = bookmark;
                                bookmark.reference = bookmarkStart;
                            }
                            else if (!isConsider) {
                                lineWidget.children.splice(lineWidget.children.indexOf(bookmark), 1);
                            }
                        }
                    }
                }
                if (bookmark.name.indexOf('_') !== 0) {
                    hasValidElmts = true;
                }
            }
            else if (inline.hasOwnProperty('editRangeId')) {
                if (inline.hasOwnProperty('editableRangeStart')) {
                    var permEnd = new EditRangeEndElementBox();
                    if (this.editableRanges.containsKey(inline.editRangeId)) {
                        var start = this.editableRanges.get(inline.editRangeId);
                        permEnd.editRangeStart = start;
                        start.editRangeEnd = permEnd;
                        this.editableRanges.remove(inline.editRangeId);
                    }
                    lineWidget.children.push(permEnd);
                    permEnd.line = lineWidget;
                }
                else {
                    var permStart = this.parseEditableRangeStart(inline);
                    lineWidget.children.push(permStart);
                    permStart.line = lineWidget;
                    if (!this.editableRanges.containsKey(inline.editRangeId)) {
                        this.editableRanges.add(inline.editRangeId, permStart);
                    }
                }
                hasValidElmts = true;
            }
            else if (inline.hasOwnProperty('commentId')) {
                var commentID = inline.commentId;
                var commentStart = undefined;
                var comment = void 0;
                if (this.commentStarts.containsKey(commentID)) {
                    commentStart = this.commentStarts.get(commentID);
                }
                var commentEnd = undefined;
                if (this.commentEnds.containsKey(commentID)) {
                    commentEnd = this.commentEnds.get(commentID);
                }
                if (inline.hasOwnProperty('commentCharacterType')) {
                    if (inline.commentCharacterType === 0) {
                        var commentStartElement = new CommentCharacterElementBox(0);
                        commentStartElement.commentId = commentID;
                        if (!this.commentStarts.containsKey(commentID)) {
                            this.commentStarts.add(commentID, commentStartElement);
                        }
                        commentStartElement.line = lineWidget;
                        lineWidget.children.push(commentStartElement);
                        comment = this.commentsCollection.get(commentID);
                        if (!isNullOrUndefined(comment)) {
                            comment.commentStart = commentStartElement;
                            commentStartElement.comment = comment;
                        }
                    }
                    else {
                        var commentEndElement = new CommentCharacterElementBox(1);
                        commentEndElement.commentId = commentID;
                        if (!this.commentEnds.containsKey(commentID)) {
                            this.commentEnds.add(commentID, commentEndElement);
                        }
                        commentEndElement.line = lineWidget;
                        lineWidget.children.push(commentEndElement);
                        comment = this.commentsCollection.get(commentID);
                        if (!isNullOrUndefined(comment)) {
                            comment.commentEnd = commentEndElement;
                            commentEndElement.comment = comment;
                        }
                    }
                    if (!isNullOrUndefined(comment) && comment.isReply) {
                        if (isNullOrUndefined(comment.ownerComment.commentStart)) {
                            comment.ownerComment.commentStart = comment.commentStart;
                        }
                        if (isNullOrUndefined(comment.ownerComment.commentEnd)) {
                            comment.ownerComment.commentEnd = comment.commentEnd;
                        }
                    }
                }
            }
            else if (inline.hasOwnProperty('shapeId')) {
                var shape = new ShapeElementBox();
                shape.shapeId = inline.shapeId;
                shape.name = inline.name;
                shape.alternativeText = inline.alternativeText;
                shape.title = inline.title;
                shape.visible = inline.visible;
                shape.width = HelperMethods.convertPointToPixel(inline.width);
                shape.height = HelperMethods.convertPointToPixel(inline.height);
                shape.widthScale = inline.widthScale;
                shape.heightScale = inline.heightScale;
                shape.verticalPosition = HelperMethods.convertPointToPixel(inline.verticalPosition);
                shape.verticalOrigin = inline.verticalOrigin;
                shape.verticalAlignment = inline.verticalAlignment;
                shape.verticalRelativePercent = inline.verticalRelativePercent;
                shape.horizontalPosition = HelperMethods.convertPointToPixel(inline.horizontalPosition);
                shape.horizontalOrigin = inline.horizontalOrigin;
                shape.horizontalAlignment = inline.horizontalAlignment;
                shape.horizontalRelativePercent = inline.horizontalRelativePercent;
                shape.zOrderPosition = inline.zOrderPosition;
                shape.allowOverlap = inline.allowOverlap;
                shape.textWrappingStyle = isNullOrUndefined(inline.textWrappingStyle) ? 'InFrontOfText' : inline.textWrappingStyle;
                shape.textWrappingType = inline.textWrappingType;
                shape.distanceBottom = HelperMethods.convertPointToPixel(inline.distanceBottom);
                shape.distanceLeft = HelperMethods.convertPointToPixel(inline.distanceLeft);
                shape.distanceRight = HelperMethods.convertPointToPixel(inline.distanceRight);
                shape.distanceTop = HelperMethods.convertPointToPixel(inline.distanceTop);
                shape.layoutInCell = inline.layoutInCell;
                shape.lockAnchor = inline.lockAnchor;
                shape.autoShapeType = inline.autoShapeType;
                if (inline.hasOwnProperty('lineFormat')) {
                    var lineFormat = new LineFormat();
                    lineFormat.line = inline.lineFormat.line;
                    lineFormat.lineFormatType = inline.lineFormat.lineFormatType;
                    lineFormat.color = inline.lineFormat.color;
                    lineFormat.weight = inline.lineFormat.weight;
                    lineFormat.dashStyle = inline.lineFormat.lineStyle;
                    shape.lineFormat = lineFormat;
                }
                if (inline.hasOwnProperty('fillFormat')) {
                    var fillFormat = new FillFormat();
                    fillFormat.color = inline.fillFormat.color;
                    fillFormat.fill = inline.fillFormat.fill;
                    shape.fillFormat = fillFormat;
                }
                if (inline.hasOwnProperty('textFrame')) {
                    var textFrame = new TextFrame();
                    textFrame.textVerticalAlignment = inline.textFrame.textVerticalAlignment;
                    textFrame.marginLeft = inline.textFrame.leftMargin;
                    textFrame.marginRight = inline.textFrame.rightMargin;
                    textFrame.marginTop = inline.textFrame.topMargin;
                    textFrame.marginBottom = inline.textFrame.bottomMargin;
                    this.parseBody(inline.textFrame.blocks, textFrame.childWidgets, textFrame);
                    shape.textFrame = textFrame;
                    textFrame.containerShape = shape;
                }
                shape.line = lineWidget;
                lineWidget.children.push(shape);
                if (shape.textWrappingStyle !== 'Inline') {
                    paragraph.floatingElements.push(shape);
                }
            }
            else if (inline.hasOwnProperty('contentControlProperties')) {
                var inlineStartContentControl = new ContentControl('Inline');
                var inlineEndContentControl = new ContentControl('Inline');
                this.parseContentControlProperties(inline.contentControlProperties, inlineStartContentControl.contentControlProperties);
                inlineEndContentControl.contentControlProperties = inlineStartContentControl.contentControlProperties;
                inlineStartContentControl.line = lineWidget;
                inlineEndContentControl.line = lineWidget;
                inlineStartContentControl.type = 0;
                inlineEndContentControl.type = 1;
                lineWidget.children.push(inlineStartContentControl);
                this.parseParagraph(inline.inlines, paragraph, writeInlineFormat, lineWidget);
                var element = lineWidget.children[lineWidget.children.length - 1];
                while (!(element instanceof ContentControl)) {
                    element.contentControlProperties = inlineStartContentControl.contentControlProperties;
                    element = element.previousElement;
                }
                lineWidget.children.push(inlineEndContentControl);
                hasValidElmts = true;
            }
        }
        this.isCutPerformed = false;
        if (!isContentControl) {
            paragraph.childWidgets.push(lineWidget);
        }
        return hasValidElmts;
    };
    SfdtReader.prototype.applyCharacterStyle = function (inline, elementbox) {
        if (!isNullOrUndefined(inline.characterFormat) && !isNullOrUndefined(inline.characterFormat.styleName)) {
            var charStyle = this.documentHelper.styles.findByName(inline.characterFormat.styleName, 'Character');
            elementbox.characterFormat.applyStyle(charStyle);
        }
    };
    SfdtReader.prototype.parseEditableRangeStart = function (data) {
        var permStart = new EditRangeStartElementBox();
        if (!isNullOrUndefined(data.columnFirst)) {
            permStart.columnFirst = data.columnFirst;
        }
        if (!isNullOrUndefined(data.columnLast)) {
            permStart.columnLast = data.columnLast;
        }
        if (!isNullOrUndefined(data.user)) {
            permStart.user = data.user;
            if (this.documentHelper.userCollection.indexOf(permStart.user) === -1) {
                this.documentHelper.userCollection.push(permStart.user);
            }
            this.addEditRangeCollection(permStart.user, permStart);
        }
        if (!isNullOrUndefined(data.group) && data.group !== '') {
            permStart.group = data.group;
            permStart.group = permStart.group === 'everyone' ? 'Everyone' : permStart.group;
            if (this.documentHelper.userCollection.indexOf(permStart.group) === -1) {
                this.documentHelper.userCollection.push(permStart.group);
            }
            this.addEditRangeCollection(permStart.group, permStart);
        }
        return permStart;
    };
    SfdtReader.prototype.addEditRangeCollection = function (name, permStart) {
        if (this.documentHelper.editRanges.containsKey(name)) {
            var editStartCollection = this.documentHelper.editRanges.get(name);
            editStartCollection.push(permStart);
        }
        else {
            var newEditStartCollection = [];
            newEditStartCollection.push(permStart);
            this.documentHelper.editRanges.add(name, newEditStartCollection);
        }
    };
    SfdtReader.prototype.parseChartTitleArea = function (titleArea, chartTitleArea) {
        chartTitleArea.chartfontName = titleArea.fontName;
        chartTitleArea.chartFontSize = titleArea.fontSize;
        this.parseChartDataFormat(titleArea.dataFormat, chartTitleArea.dataFormat);
        this.parseChartLayout(titleArea.layout, chartTitleArea.layout);
    };
    SfdtReader.prototype.parseChartDataFormat = function (format, dataFormat) {
        dataFormat.fill.color = format.fill.foreColor;
        dataFormat.fill.rgb = format.fill.rgb;
        dataFormat.line.color = format.line.color;
        dataFormat.line.rgb = format.line.rgb;
    };
    SfdtReader.prototype.parseChartLayout = function (layout, chartLayout) {
        chartLayout.chartLayoutLeft = layout.layoutX;
        chartLayout.chartLayoutTop = layout.layoutY;
    };
    SfdtReader.prototype.parseChartLegend = function (legend, chartLegend) {
        chartLegend.chartLegendPostion = legend.position;
        this.parseChartTitleArea(legend.chartTitleArea, chartLegend.chartTitleArea);
    };
    SfdtReader.prototype.parseChartCategoryAxis = function (categoryAxis, primaryAxis) {
        primaryAxis.categoryAxisType = categoryAxis.categoryType;
        primaryAxis.categoryNumberFormat = categoryAxis.numberFormat;
        primaryAxis.interval = categoryAxis.majorUnit;
        primaryAxis.axisFontSize = categoryAxis.fontSize;
        primaryAxis.axisFontName = categoryAxis.fontName;
        primaryAxis.max = categoryAxis.maximumValue;
        primaryAxis.min = categoryAxis.minimumValue;
        primaryAxis.majorGridLines = categoryAxis.hasMajorGridLines;
        primaryAxis.minorGridLines = categoryAxis.hasMinorGridLines;
        primaryAxis.majorTick = categoryAxis.majorTickMark;
        primaryAxis.minorTick = categoryAxis.minorTickMark;
        primaryAxis.tickPosition = categoryAxis.tickLabelPosition;
        primaryAxis.categoryAxisTitle = categoryAxis.chartTitle;
        if (categoryAxis.chartTitle != null) {
            this.parseChartTitleArea(categoryAxis.chartTitleArea, primaryAxis.chartTitleArea);
        }
    };
    SfdtReader.prototype.parseChartDataTable = function (dataTable, chartDataTable) {
        chartDataTable.showSeriesKeys = dataTable.showSeriesKeys;
        chartDataTable.hasHorzBorder = dataTable.hasHorzBorder;
        chartDataTable.hasVertBorder = dataTable.hasVertBorder;
        chartDataTable.hasBorders = dataTable.hasBorders;
    };
    SfdtReader.prototype.parseChartArea = function (area, chartArea) {
        chartArea.chartForeColor = area.foreColor;
    };
    SfdtReader.prototype.parseChartData = function (inline, chart) {
        for (var i = 0; i < inline.chartCategory.length; i++) {
            var chartCategory = new ChartCategory();
            var xData = inline.chartCategory[i];
            if (xData.hasOwnProperty('categoryXName')) {
                chartCategory.xName = xData.categoryXName;
            }
            for (var j = 0; j < xData.chartData.length; j++) {
                var chartData = new ChartData();
                var yData = xData.chartData[j];
                chartData.yAxisValue = yData.yValue;
                if (inline.chartType === 'Bubble') {
                    chartData.bubbleSize = yData.size;
                }
                chartCategory.chartData.push(chartData);
            }
            chart.chartCategory.push(chartCategory);
        }
        this.parseChartSeries(inline, chart);
    };
    SfdtReader.prototype.parseChartSeries = function (inline, chart) {
        var chartType = inline.chartType;
        var isPieType = (chartType === 'Pie' || chartType === 'Doughnut');
        for (var i = 0; i < inline.chartSeries.length; i++) {
            var chartSeries = new ChartSeries();
            var xData = inline.chartSeries[i];
            if (xData.hasOwnProperty('seriesName')) {
                chartSeries.seriesName = xData.seriesName;
                if (isPieType) {
                    if (xData.hasOwnProperty('firstSliceAngle')) {
                        chartSeries.firstSliceAngle = xData.firstSliceAngle;
                    }
                    if (chartType === 'Doughnut') {
                        chartSeries.doughnutHoleSize = xData.holeSize;
                    }
                }
                if (xData.hasOwnProperty('dataLabel')) {
                    this.parseChartDataLabels(xData.dataLabel, chartSeries);
                }
                if (xData.hasOwnProperty('seriesFormat')) {
                    var seriesFormat = new ChartSeriesFormat();
                    var format = xData.seriesFormat;
                    seriesFormat.markerStyle = format.markerStyle;
                    seriesFormat.markerColor = format.markerColor;
                    seriesFormat.numberValue = format.markerSize;
                    chartSeries.seriesFormat = seriesFormat;
                }
                if (xData.hasOwnProperty('errorBar')) {
                    var errorBar = chartSeries.errorBar;
                    errorBar.errorType = xData.errorBar.type;
                    errorBar.errorDirection = xData.errorBar.direction;
                    errorBar.errorEndStyle = xData.errorBar.endStyle;
                    errorBar.numberValue = xData.errorBar.numberValue;
                }
                if (xData.hasOwnProperty('trendLines')) {
                    this.parseChartTrendLines(xData.trendLines, chartSeries);
                }
                this.parseChartSeriesDataPoints(xData.dataPoints, chartSeries);
            }
            chart.chartSeries.push(chartSeries);
        }
    };
    SfdtReader.prototype.parseChartDataLabels = function (dataLabels, series) {
        var dataLabel = new ChartDataLabels();
        dataLabel.labelPosition = dataLabels.position;
        dataLabel.fontName = dataLabels.fontName;
        dataLabel.fontColor = dataLabels.fontColor;
        dataLabel.fontSize = dataLabels.fontSize;
        dataLabel.isLegendKey = dataLabels.isLegendKey;
        dataLabel.isBubbleSize = dataLabels.isBubbleSize;
        dataLabel.isCategoryName = dataLabels.isCategoryName;
        dataLabel.isSeriesName = dataLabels.isSeriesName;
        dataLabel.isValue = dataLabels.isValue;
        dataLabel.isPercentage = dataLabels.isPercentage;
        dataLabel.isLeaderLines = dataLabels.isLeaderLines;
        series.dataLabels = dataLabel;
    };
    SfdtReader.prototype.parseChartSeriesDataPoints = function (dataPoints, series) {
        for (var i = 0; i < dataPoints.length; i++) {
            var chartFormat = new ChartDataFormat();
            this.parseChartDataFormat(dataPoints[i], chartFormat);
            series.chartDataFormat.push(chartFormat);
        }
    };
    SfdtReader.prototype.parseChartTrendLines = function (trendLines, series) {
        for (var i = 0; i < trendLines.length; i++) {
            var data = trendLines[i];
            var trendLine = new ChartTrendLines();
            trendLine.trendLineName = data.name;
            trendLine.trendLineType = data.type;
            trendLine.forwardValue = data.forward;
            trendLine.backwardValue = data.backward;
            trendLine.interceptValue = data.intercept;
            trendLine.isDisplayEquation = data.isDisplayEquation;
            trendLine.isDisplayRSquared = data.isDisplayRSquared;
            series.trendLines.push(trendLine);
        }
    };
    SfdtReader.prototype.parseTableFormat = function (sourceFormat, tableFormat) {
        this.parseBorders(sourceFormat.borders, tableFormat.borders);
        if (!isNullOrUndefined(sourceFormat.allowAutoFit)) {
            tableFormat.allowAutoFit = sourceFormat.allowAutoFit;
        }
        if (!isNullOrUndefined(sourceFormat.cellSpacing)) {
            tableFormat.cellSpacing = sourceFormat.cellSpacing;
        }
        if (!isNullOrUndefined(sourceFormat.leftMargin)) {
            tableFormat.leftMargin = sourceFormat.leftMargin;
        }
        if (!isNullOrUndefined(sourceFormat.topMargin)) {
            tableFormat.topMargin = sourceFormat.topMargin;
        }
        if (!isNullOrUndefined(sourceFormat.rightMargin)) {
            tableFormat.rightMargin = sourceFormat.rightMargin;
        }
        if (!isNullOrUndefined(sourceFormat.bottomMargin)) {
            tableFormat.bottomMargin = sourceFormat.bottomMargin;
        }
        if (!isNullOrUndefined(sourceFormat.leftIndent)) {
            tableFormat.leftIndent = sourceFormat.leftIndent;
        }
        this.parseShading(sourceFormat.shading, tableFormat.shading);
        if (!isNullOrUndefined(sourceFormat.tableAlignment)) {
            tableFormat.tableAlignment = sourceFormat.tableAlignment;
        }
        if (!isNullOrUndefined(sourceFormat.preferredWidth)) {
            tableFormat.preferredWidth = sourceFormat.preferredWidth;
        }
        if (!isNullOrUndefined(sourceFormat.preferredWidthType)) {
            tableFormat.preferredWidthType = sourceFormat.preferredWidthType;
        }
        if (!isNullOrUndefined(sourceFormat.bidi)) {
            tableFormat.bidi = sourceFormat.bidi;
        }
        if (!isNullOrUndefined(sourceFormat.horizontalPositionAbs)) {
            tableFormat.horizontalPositionAbs = sourceFormat.horizontalPositionAbs;
        }
        if (!isNullOrUndefined(sourceFormat.horizontalPosition)) {
            tableFormat.horizontalPosition = sourceFormat.horizontalPosition;
        }
    };
    SfdtReader.prototype.parseCellFormat = function (sourceFormat, cellFormat) {
        if (!isNullOrUndefined(sourceFormat)) {
            this.parseBorders(sourceFormat.borders, cellFormat.borders);
            if (!sourceFormat.isSamePaddingAsTable) {
                //    cellFormat.ClearMargins();
                //else
                this.parseCellMargin(sourceFormat, cellFormat);
            }
            if (!isNullOrUndefined(sourceFormat.cellWidth)) {
                cellFormat.cellWidth = sourceFormat.cellWidth;
            }
            if (!isNullOrUndefined(sourceFormat.columnSpan)) {
                cellFormat.columnSpan = sourceFormat.columnSpan;
            }
            if (!isNullOrUndefined(sourceFormat.rowSpan)) {
                cellFormat.rowSpan = sourceFormat.rowSpan;
            }
            this.parseShading(sourceFormat.shading, cellFormat.shading);
            if (!isNullOrUndefined(sourceFormat.verticalAlignment)) {
                cellFormat.verticalAlignment = sourceFormat.verticalAlignment;
            }
            if (!isNullOrUndefined(sourceFormat.preferredWidthType)) {
                cellFormat.preferredWidthType = sourceFormat.preferredWidthType;
            }
            if (!isNullOrUndefined(sourceFormat.preferredWidth)) {
                cellFormat.preferredWidth = sourceFormat.preferredWidth;
            }
        }
    };
    SfdtReader.prototype.parseCellMargin = function (sourceFormat, cellFormat) {
        if (!isNullOrUndefined(sourceFormat.leftMargin)) {
            cellFormat.leftMargin = sourceFormat.leftMargin;
        }
        if (!isNullOrUndefined(sourceFormat.rightMargin)) {
            cellFormat.rightMargin = sourceFormat.rightMargin;
        }
        if (!isNullOrUndefined(sourceFormat.topMargin)) {
            cellFormat.topMargin = sourceFormat.topMargin;
        }
        if (!isNullOrUndefined(sourceFormat.bottomMargin)) {
            cellFormat.bottomMargin = sourceFormat.bottomMargin;
        }
    };
    SfdtReader.prototype.parseRowFormat = function (sourceFormat, rowFormat) {
        if (!isNullOrUndefined(sourceFormat)) {
            if (!isNullOrUndefined(sourceFormat.allowBreakAcrossPages)) {
                rowFormat.allowBreakAcrossPages = sourceFormat.allowBreakAcrossPages;
            }
            if (!isNullOrUndefined(sourceFormat.isHeader)) {
                rowFormat.isHeader = sourceFormat.isHeader;
            }
            if (!isNullOrUndefined(sourceFormat.heightType)) {
                rowFormat.heightType = sourceFormat.heightType;
            }
            if (!isNullOrUndefined(sourceFormat.height)) {
                rowFormat.height = sourceFormat.height;
            }
            if (!isNullOrUndefined(sourceFormat.leftMargin)) {
                rowFormat.leftMargin = sourceFormat.leftMargin;
            }
            if (!isNullOrUndefined(sourceFormat.topMargin)) {
                rowFormat.topMargin = sourceFormat.topMargin;
            }
            if (!isNullOrUndefined(sourceFormat.rightMargin)) {
                rowFormat.rightMargin = sourceFormat.rightMargin;
            }
            if (!isNullOrUndefined(sourceFormat.bottomMargin)) {
                rowFormat.bottomMargin = sourceFormat.bottomMargin;
            }
            if (!isNullOrUndefined(sourceFormat.leftIndent)) {
                rowFormat.leftIndent = sourceFormat.leftIndent;
            }
            if (!isNullOrUndefined(sourceFormat.revisionIds) && sourceFormat.revisionIds.length > 0) {
                this.checkAndApplyRevision(sourceFormat, rowFormat);
            }
            this.parseBorders(sourceFormat.borders, rowFormat.borders);
        }
    };
    SfdtReader.prototype.parseBorders = function (sourceBorders, destBorder) {
        if (!isNullOrUndefined(sourceBorders)) {
            this.parseBorder(sourceBorders.left, destBorder.left);
            this.parseBorder(sourceBorders.right, destBorder.right);
            this.parseBorder(sourceBorders.top, destBorder.top);
            this.parseBorder(sourceBorders.bottom, destBorder.bottom);
            this.parseBorder(sourceBorders.vertical, destBorder.vertical);
            this.parseBorder(sourceBorders.horizontal, destBorder.horizontal);
            this.parseBorder(sourceBorders.diagonalDown, destBorder.diagonalDown);
            this.parseBorder(sourceBorders.diagonalUp, destBorder.diagonalUp);
        }
    };
    SfdtReader.prototype.parseBorder = function (sourceBorder, destBorder) {
        if (!isNullOrUndefined(sourceBorder)) {
            if (!isNullOrUndefined(sourceBorder.color)) {
                destBorder.color = this.getColor(sourceBorder.color);
            }
            if (!isNullOrUndefined(sourceBorder.lineStyle)) {
                destBorder.lineStyle = sourceBorder.lineStyle;
            }
            if (!isNullOrUndefined(sourceBorder.lineWidth)) {
                destBorder.lineWidth = sourceBorder.lineWidth;
            }
            if (!isNullOrUndefined(sourceBorder.hasNoneStyle)) {
                destBorder.hasNoneStyle = sourceBorder.hasNoneStyle;
            }
        }
    };
    SfdtReader.prototype.parseShading = function (sourceShading, destShading) {
        if (!isNullOrUndefined(sourceShading)) {
            if (!isNullOrUndefined(sourceShading.backgroundColor)) {
                destShading.backgroundColor = this.getColor(sourceShading.backgroundColor);
            }
            if (!isNullOrUndefined(sourceShading.foregroundColor)) {
                destShading.foregroundColor = this.getColor(sourceShading.foregroundColor);
            }
            if (!isNullOrUndefined(sourceShading.texture) || !isNullOrUndefined(sourceShading.textureStyle)) {
                destShading.textureStyle = !isNullOrUndefined(sourceShading.texture) ? sourceShading.texture : sourceShading.textureStyle;
            }
        }
    };
    /**
     * @private
     */
    SfdtReader.prototype.parseCharacterFormat = function (sourceFormat, characterFormat, writeInlineFormat) {
        if (!isNullOrUndefined(sourceFormat)) {
            if (writeInlineFormat && sourceFormat.hasOwnProperty('inlineFormat')) {
                this.parseCharacterFormat(sourceFormat.inlineFormat, characterFormat);
                return;
            }
            if (!isNullOrUndefined(sourceFormat.baselineAlignment)) {
                characterFormat.baselineAlignment = sourceFormat.baselineAlignment;
            }
            if (!isNullOrUndefined(sourceFormat.underline)) {
                characterFormat.underline = sourceFormat.underline;
            }
            if (!isNullOrUndefined(sourceFormat.strikethrough)) {
                characterFormat.strikethrough = sourceFormat.strikethrough;
            }
            if (!isNullOrUndefined(sourceFormat.fontSize)) {
                sourceFormat.fontSize = parseFloat(sourceFormat.fontSize);
                var number = sourceFormat.fontSize * 10;
                if (number % 10 !== 0) {
                    number = sourceFormat.fontSize.toFixed(1) * 10;
                    //to check worst case scenerio like 8.2 or 8.7 like these to round off
                    if (number % 5 === 0) {
                        sourceFormat.fontSize = sourceFormat.fontSize.toFixed(1);
                    }
                    else {
                        sourceFormat.fontSize = Math.round(sourceFormat.fontSize);
                    }
                }
                var fontSize = parseFloat(sourceFormat.fontSize);
                characterFormat.fontSize = fontSize < 0 ? 0 : fontSize;
            }
            if (!isNullOrUndefined(sourceFormat.fontFamily)) {
                if (sourceFormat.fontFamily.indexOf('"') !== -1) {
                    sourceFormat.fontFamily = sourceFormat.fontFamily.replace('"', '');
                }
                characterFormat.fontFamily = sourceFormat.fontFamily;
            }
            if (!isNullOrUndefined(sourceFormat.bold)) {
                characterFormat.bold = sourceFormat.bold;
            }
            if (!isNullOrUndefined(sourceFormat.italic)) {
                characterFormat.italic = sourceFormat.italic;
            }
            if (!isNullOrUndefined(sourceFormat.highlightColor)) {
                characterFormat.highlightColor = sourceFormat.highlightColor;
            }
            if (!isNullOrUndefined(sourceFormat.fontColor)) {
                characterFormat.fontColor = this.getColor(sourceFormat.fontColor);
            }
            if (!isNullOrUndefined(sourceFormat.bidi)) {
                characterFormat.bidi = sourceFormat.bidi;
            }
            if (!isNullOrUndefined(sourceFormat.bdo)) {
                characterFormat.bdo = sourceFormat.bdo;
            }
            if (!isNullOrUndefined(sourceFormat.fontSizeBidi)) {
                characterFormat.fontSizeBidi = sourceFormat.fontSizeBidi < 0 ? 0 : sourceFormat.fontSizeBidi;
            }
            if (!isNullOrUndefined(sourceFormat.fontFamilyBidi)) {
                characterFormat.fontFamilyBidi = sourceFormat.fontFamilyBidi;
            }
            if (!isNullOrUndefined(sourceFormat.boldBidi)) {
                characterFormat.boldBidi = sourceFormat.boldBidi;
            }
            if (!isNullOrUndefined(sourceFormat.italicBidi)) {
                characterFormat.italicBidi = sourceFormat.italicBidi;
            }
            if (!isNullOrUndefined(sourceFormat.revisionIds) && sourceFormat.revisionIds.length > 0) {
                this.checkAndApplyRevision(sourceFormat, characterFormat);
            }
            if (!isNullOrUndefined(sourceFormat.allCaps)) {
                characterFormat.allCaps = sourceFormat.allCaps;
            }
        }
    };
    SfdtReader.prototype.getColor = function (color) {
        var convertColor = color;
        return convertColor || '#ffffff';
    };
    SfdtReader.prototype.parseParagraphFormat = function (sourceFormat, paragraphFormat) {
        if (!isNullOrUndefined(sourceFormat)) {
            if (!isNullOrUndefined(sourceFormat.bidi)) {
                paragraphFormat.bidi = sourceFormat.bidi;
            }
            if (!isNullOrUndefined(sourceFormat.leftIndent)) {
                paragraphFormat.leftIndent = sourceFormat.leftIndent;
            }
            if (!isNullOrUndefined(sourceFormat.rightIndent)) {
                paragraphFormat.rightIndent = sourceFormat.rightIndent;
            }
            if (!isNullOrUndefined(sourceFormat.firstLineIndent)) {
                paragraphFormat.firstLineIndent = sourceFormat.firstLineIndent;
            }
            if (!isNullOrUndefined(sourceFormat.afterSpacing)) {
                paragraphFormat.afterSpacing = sourceFormat.afterSpacing;
            }
            if (!isNullOrUndefined(sourceFormat.beforeSpacing)) {
                paragraphFormat.beforeSpacing = sourceFormat.beforeSpacing;
            }
            if (!isNullOrUndefined(sourceFormat.lineSpacing)) {
                paragraphFormat.lineSpacing = sourceFormat.lineSpacing;
            }
            if (!isNullOrUndefined(sourceFormat.lineSpacingType)) {
                paragraphFormat.lineSpacingType = sourceFormat.lineSpacingType;
            }
            else {
                if (!isNullOrUndefined(sourceFormat.lineSpacing)) {
                    paragraphFormat.lineSpacingType = 'Multiple';
                }
            }
            if (!isNullOrUndefined(sourceFormat.textAlignment)) {
                paragraphFormat.textAlignment = sourceFormat.textAlignment;
            }
            if (!isNullOrUndefined(sourceFormat.outlineLevel)) {
                paragraphFormat.outlineLevel = sourceFormat.outlineLevel;
            }
            if (!isNullOrUndefined(sourceFormat.contextualSpacing)) {
                paragraphFormat.contextualSpacing = sourceFormat.contextualSpacing;
            }
            if (!isNullOrUndefined(sourceFormat.keepWithNext)) {
                paragraphFormat.keepWithNext = sourceFormat.keepWithNext;
            }
            if (!isNullOrUndefined(sourceFormat.keepLinesTogether)) {
                paragraphFormat.keepLinesTogether = sourceFormat.keepLinesTogether;
            }
            paragraphFormat.listFormat = new WListFormat();
            if (sourceFormat.hasOwnProperty('listFormat')) {
                this.parseListFormat(sourceFormat, paragraphFormat.listFormat);
            }
            if (sourceFormat.hasOwnProperty('tabs')) {
                this.parseTabStop(sourceFormat.tabs, paragraphFormat.tabs);
            }
        }
    };
    SfdtReader.prototype.parseListFormat = function (block, listFormat) {
        if (!isNullOrUndefined(block.listFormat)) {
            if (!isNullOrUndefined(block.listFormat.listId)) {
                listFormat.listId = block.listFormat.listId;
                listFormat.list = this.documentHelper.getListById(block.listFormat.listId);
            }
            if (!isNullOrUndefined(block.listFormat.listLevelNumber)) {
                listFormat.listLevelNumber = block.listFormat.listLevelNumber;
            }
        }
    };
    SfdtReader.prototype.parseSectionFormat = function (data, sectionFormat) {
        if (!isNullOrUndefined(data.pageWidth)) {
            sectionFormat.pageWidth = data.pageWidth;
        }
        if (!isNullOrUndefined(data.pageHeight)) {
            sectionFormat.pageHeight = data.pageHeight;
        }
        if (!isNullOrUndefined(data.leftMargin)) {
            sectionFormat.leftMargin = data.leftMargin;
        }
        if (!isNullOrUndefined(data.topMargin)) {
            sectionFormat.topMargin = data.topMargin;
        }
        if (!isNullOrUndefined(data.rightMargin)) {
            sectionFormat.rightMargin = data.rightMargin;
        }
        if (!isNullOrUndefined(data.bottomMargin)) {
            sectionFormat.bottomMargin = data.bottomMargin;
        }
        if (!isNullOrUndefined(data.headerDistance)) {
            sectionFormat.headerDistance = data.headerDistance;
        }
        if (!isNullOrUndefined(data.footerDistance)) {
            sectionFormat.footerDistance = data.footerDistance;
        }
        if (!isNullOrUndefined(data.differentFirstPage)) {
            sectionFormat.differentFirstPage = data.differentFirstPage;
        }
        if (!isNullOrUndefined(data.differentOddAndEvenPages)) {
            sectionFormat.differentOddAndEvenPages = data.differentOddAndEvenPages;
        }
        if (!isNullOrUndefined(data.bidi)) {
            sectionFormat.bidi = data.bidi;
        }
        if (!isNullOrUndefined(data.restartPageNumbering)) {
            sectionFormat.restartPageNumbering = data.restartPageNumbering;
        }
        if (!isNullOrUndefined(data.pageStartingNumber)) {
            sectionFormat.pageStartingNumber = data.pageStartingNumber;
        }
        if (!isNullOrUndefined(data.endnoteNumberFormat)) {
            sectionFormat.endnoteNumberFormat = data.endnoteNumberFormat;
        }
        if (!isNullOrUndefined(data.footNoteNumberFormat)) {
            sectionFormat.footNoteNumberFormat = data.footNoteNumberFormat;
        }
        if (!isNullOrUndefined(data.restartIndexForFootnotes)) {
            sectionFormat.restartIndexForFootnotes = data.restartIndexForFootnotes;
        }
        if (!isNullOrUndefined(data.pageStartingNumber)) {
            sectionFormat.restartIndexForEndnotes = data.restartIndexForEndnotes;
        }
        if (!isNullOrUndefined(data.initialFootNoteNumber)) {
            sectionFormat.initialFootNoteNumber = data.initialFootNoteNumber;
        }
        if (!isNullOrUndefined(data.initialEndNoteNumber)) {
            sectionFormat.initialEndNoteNumber = data.initialEndNoteNumber;
        }
    };
    SfdtReader.prototype.parseTabStop = function (wTabs, tabs) {
        if (wTabs) {
            for (var i = 0; i < wTabs.length; i++) {
                var tabStop = new WTabStop();
                tabStop.position = wTabs[i].position;
                tabStop.tabLeader = wTabs[i].tabLeader;
                tabStop.deletePosition = wTabs[i].deletePosition;
                tabStop.tabJustification = wTabs[i].tabJustification;
                tabs.push(tabStop);
            }
        }
    };
    SfdtReader.prototype.validateImageUrl = function (imagestr) {
        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        imagestr = imagestr.replace(/[^A-Za-z0-9\+\/\=]/g, '');
        var totalLength = imagestr.length * 3 / 4;
        if (imagestr.charAt(imagestr.length - 1) === keyStr.charAt(64)) {
            totalLength--;
        }
        if (imagestr.charAt(imagestr.length - 2) === keyStr.charAt(64)) {
            totalLength--;
        }
        if (totalLength % 1 !== 0) {
            // totalLength is not an integer, the length does not match a valid
            // base64 content. That can happen if:
            // - the imagestr is not a base64 content
            // - the imagestr is *almost* a base64 content, with a extra chars at the
            // beginning or at the end
            // - the imagestr uses a base64 variant (base64url for example)
            return false;
        }
        return true;
    };
    SfdtReader.prototype.containsFieldBegin = function (line) {
        var element = undefined;
        for (var i = line.children.length - 1; i >= 0; i--) {
            element = line.children[i];
            if (element instanceof FieldElementBox && element.hasFieldEnd && element.nextElement instanceof TextElementBox) {
                return element.nextElement;
            }
            else if (element instanceof FieldElementBox) {
                return undefined;
            }
        }
        return element;
    };
    return SfdtReader;
}());
export { SfdtReader };
