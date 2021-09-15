/**
 * @private
 */
export declare class HtmlExport {
    private document;
    private characterFormat;
    private paragraphFormat;
    private prevListLevel;
    private isOrdered;
    /**
     * @private
     */
    fieldCheck: number;
    /**
     * @private
     */
    isMergeField: boolean;
    writeHtml(document: any): string;
    private serializeSection;
    private serializeParagraph;
    private closeList;
    private getListLevel;
    private getHtmlList;
    private serializeInlines;
    private serializeContentInlines;
    private serializeSpan;
    /**
     * @private
     * @param {string} style - style name.
     * @returns {string} - return heading tag.
     */
    getStyleName(style: string): string;
    private serializeImageContainer;
    serializeCell(cell: any): string;
    private serializeTable;
    private serializeRow;
    private serializeParagraphStyle;
    private serializeInlineStyle;
    private serializeTableBorderStyle;
    private serializeCellBordersStyle;
    private serializeBorderStyle;
    private convertBorderLineStyle;
    private serializeCharacterFormat;
    private serializeTextDecoration;
    /**
     * @private
     */
    serializeParagraphFormat(paragraphFormat: any, isList: boolean): string;
    private createAttributesTag;
    private createTag;
    private endTag;
    createTableStartTag(table: any): string;
    private createTableEndTag;
    private createRowStartTag;
    private createRowEndTag;
    private decodeHtmlNames;
}
