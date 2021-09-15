/* eslint-disable */
import { StreamWriter } from '@syncfusion/ej2-file-utils';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * Exports the document to Text format.
 */
var TextExport = /** @class */ (function () {
    function TextExport() {
        /**
         * @private
         */
        this.pageContent = '';
        this.curSectionIndex = 0;
        this.inField = false;
    }
    TextExport.prototype.getModuleName = function () {
        return 'TextExport';
    };
    /**
     * @private
     * @param {DocumentHelper} documentHelper - Document helper.
     * @param {string} fileName - Specified file name.
     * @return {void}
     */
    TextExport.prototype.save = function (documentHelper, fileName) {
        this.serialize(documentHelper);
        var writer = new StreamWriter();
        this.writeInternal(writer);
        writer.save(fileName + '.txt');
    };
    /**
     * Save text document as Blob.
     *
     * @private
     * @param {DocumentHelper} documentHelper - Document helper.
     * @return {Promise<Blob>} - Returns promise object.
     */
    TextExport.prototype.saveAsBlob = function (documentHelper) {
        this.serialize(documentHelper);
        var streamWriter = new StreamWriter();
        this.writeInternal(streamWriter);
        var blob = streamWriter.buffer;
        streamWriter.destroy();
        return new Promise(function (resolve, reject) {
            resolve(blob);
        });
    };
    TextExport.prototype.serialize = function (documentHelper) {
        var document = documentHelper.owner.sfdtExportModule.write();
        this.setDocument(document);
    };
    /**
     * @private
     * @param document
     */
    TextExport.prototype.setDocument = function (document) {
        this.document = document;
        this.mSections = document.sections;
    };
    /**
     * @private
     * @param streamWriter - Stream writer instance.
     * @return {void}
     */
    TextExport.prototype.writeInternal = function (streamWriter) {
        var section = undefined;
        var sectionCount = this.document.sections.length - 1;
        var isLastSection = false;
        this.updateLastParagraph();
        for (var i = 0; i <= sectionCount; i++) {
            section = this.document.sections[i];
            isLastSection = (i === sectionCount) ? true : false;
            this.writeBody(streamWriter, section.blocks);
            this.writeNewLine(streamWriter);
            this.writeSectionEnd(section, isLastSection);
        }
        for (var j = 0; j <= sectionCount; j++) {
            section = this.document.sections[j];
            this.writeHeadersFooters(streamWriter, section);
        }
    };
    /// <summary>
    /// Writes the specified document content to the text file.
    /// </summary>
    TextExport.prototype.writeBody = function (streamWriter, body) {
        var bodyItemsCount = body.length - 1;
        var bodyItem = undefined;
        for (var i = 0; i <= bodyItemsCount; i++) {
            bodyItem = body[i];
            if (bodyItem.hasOwnProperty('inlines')) {
                var isLastPara = (bodyItem === this.lastPara) ? true : false;
                this.writeParagraph(streamWriter, bodyItem, isLastPara);
            }
            else {
                this.writeTable(streamWriter, bodyItem);
            }
        }
    };
    TextExport.prototype.writeParagraph = function (streamWriter, paragraph, isLastPara) {
        for (var i = 0; i < paragraph.inlines.length; i++) {
            var item = paragraph.inlines[i];
            if (item.hasOwnProperty('fieldType')) {
                this.inField = item.fieldType === 0;
            }
            else if (item.hasOwnProperty('text') && !this.inField) {
                this.writeText(streamWriter, item.text);
            }
        }
        if (!isLastPara) {
            this.writeNewLine(streamWriter);
        }
    };
    /// }
    /// <summary>
    /// Writes the specified table text content to the text file.
    /// </summary>
    TextExport.prototype.writeTable = function (streamWriter, table) {
        for (var i = 0; i < table.rows.length; i++) {
            var row = table.rows[i];
            for (var j = 0; j < row.cells.length; j++) {
                var cell = row.cells[j];
                this.writeBody(streamWriter, cell.blocks);
            }
        }
    };
    /// <summary>
    /// Writes the specified Header Footer text content to the text file.
    /// </summary>
    TextExport.prototype.writeHeadersFooters = function (streamWriter, section) {
        var headersFooters = section.headersFooters;
        if (isNullOrUndefined(headersFooters)) {
            return;
        }
        this.writeHeaderFooter(streamWriter, section.headersFooters.header);
        this.writeHeaderFooter(streamWriter, section.headersFooters.footer);
        this.writeHeaderFooter(streamWriter, section.headersFooters.evenFooter);
        this.writeHeaderFooter(streamWriter, section.headersFooters.evenHeader);
        this.writeHeaderFooter(streamWriter, section.headersFooters.firstPageHeader);
        this.writeHeaderFooter(streamWriter, section.headersFooters.firstPageFooter);
    };
    TextExport.prototype.writeHeaderFooter = function (streamWriter, headerFooter) {
        if (headerFooter && headerFooter.blocks) {
            this.writeBody(streamWriter, headerFooter.blocks);
        }
    };
    /// <summary>
    /// Writes the end of the section.
    /// </summary>
    TextExport.prototype.writeSectionEnd = function (section, lastSection) {
        this.curSectionIndex++;
    };
    TextExport.prototype.writeNewLine = function (writer) {
        if (!isNullOrUndefined(writer)) {
            writer.writeLine('');
        }
        else {
            this.pageContent = this.pageContent + ' ';
        }
    };
    TextExport.prototype.writeText = function (writer, text) {
        if (!isNullOrUndefined(writer)) {
            writer.write(text);
        }
        else {
            this.pageContent += text;
        }
    };
    TextExport.prototype.updateLastParagraph = function () {
        var cnt = this.document.sections.length;
        var sec;
        if (cnt > 0) {
            sec = this.document.sections[cnt - 1];
        }
        if (!isNullOrUndefined(sec)) {
            var paragraphs = [];
            for (var i = 0; i < sec.blocks.length; i++) {
                if (sec.blocks[i].hasOwnProperty('inlines')) {
                    paragraphs.push(sec.blocks[i]);
                }
            }
            var pCount = paragraphs.length;
            if (pCount > 0) {
                this.lastPara = paragraphs[pCount - 1];
            }
        }
    };
    /**
     * @private
     * @returns {void}
     */
    TextExport.prototype.destroy = function () {
        this.document = undefined;
        this.lastPara = undefined;
        this.mSections = undefined;
        this.sections = undefined;
    };
    return TextExport;
}());
export { TextExport };
