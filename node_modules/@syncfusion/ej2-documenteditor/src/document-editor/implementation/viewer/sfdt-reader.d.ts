import { WList } from '../list/list';
import { WAbstractList } from '../list/abstract-list';
import { WCharacterFormat, WParagraphFormat, WSectionFormat } from '../format/index';
import { WStyles } from '../format/index';
import { DocumentHelper } from './viewer';
import { Widget, BodyWidget, BlockWidget, HeaderFooters, CommentCharacterElementBox, CommentElementBox, ContentControlProperties, Footnote } from './page';
import { Dictionary } from '../../base/dictionary';
import { Revision } from '../track-changes/track-changes';
/**
 * @private
 */
export declare class SfdtReader {
    private documentHelper;
    private fieldSeparator;
    /**
     * @private
     */
    commentStarts: Dictionary<string, CommentCharacterElementBox>;
    /**
     * @private
     */
    commentEnds: Dictionary<string, CommentCharacterElementBox>;
    /**
     * @private
     */
    commentsCollection: Dictionary<string, CommentElementBox>;
    /**
     * @private
     */
    revisionCollection: Dictionary<string, Revision>;
    private isPageBreakInsideTable;
    private editableRanges;
    private isParseHeader;
    footnotes: Footnote;
    endnotes: Footnote;
    /**
     * @private
     */
    isCutPerformed: boolean;
    /**
     * @private
     */
    isPaste: boolean;
    private readonly isPasting;
    constructor(documentHelper: DocumentHelper);
    private readonly viewer;
    convertJsonToDocument(json: string): BodyWidget[];
    private parseFootnotes;
    private parseEndtnotes;
    private parseCustomXml;
    private parseDocumentProtection;
    private parseStyles;
    parseRevisions(data: any, revisions: Revision[]): void;
    parseRevision(data: any): Revision;
    private checkAndApplyRevision;
    parseComments(data: any, comments: CommentElementBox[]): void;
    private parseComment;
    private parseCommentText;
    parseStyle(data: any, style: any, styles: WStyles): void;
    private getStyle;
    parseAbstractList(data: any, abstractLists: WAbstractList[]): void;
    private parseListLevel;
    parseList(data: any, listCollection: WList[]): void;
    private parseLevelOverride;
    private parseSections;
    parseHeaderFooter(data: any, headersFooters: any): HeaderFooters;
    private parseTextBody;
    addCustomStyles(data: any): void;
    parseBody(data: any, blocks: BlockWidget[], container?: Widget, isSectionBreak?: boolean, contentControlProperties?: ContentControlProperties): void;
    private parseTable;
    private parseTablePositioning;
    private parseRowGridValues;
    private parseContentControlProperties;
    private parseParagraph;
    private applyCharacterStyle;
    private parseEditableRangeStart;
    private addEditRangeCollection;
    private parseChartTitleArea;
    private parseChartDataFormat;
    private parseChartLayout;
    private parseChartLegend;
    private parseChartCategoryAxis;
    private parseChartDataTable;
    private parseChartArea;
    private parseChartData;
    private parseChartSeries;
    private parseChartDataLabels;
    private parseChartSeriesDataPoints;
    private parseChartTrendLines;
    private parseTableFormat;
    private parseCellFormat;
    private parseCellMargin;
    private parseRowFormat;
    private parseBorders;
    private parseBorder;
    private parseShading;
    /**
     * @private
     */
    parseCharacterFormat(sourceFormat: any, characterFormat: WCharacterFormat, writeInlineFormat?: boolean): void;
    private getColor;
    parseParagraphFormat(sourceFormat: any, paragraphFormat: WParagraphFormat): void;
    private parseListFormat;
    parseSectionFormat(data: any, sectionFormat: WSectionFormat): void;
    private parseTabStop;
    private validateImageUrl;
    private containsFieldBegin;
}
