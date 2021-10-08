import { SizeF, RectangleF, PointF } from './../../drawing/pdf-drawing';
import { PdfWordWrapType } from './enum';
import { StringTokenizer } from './string-tokenizer';
/**
 * Class `lay outing the text`.
 */
var PdfStringLayouter = /** @class */ (function () {
    // Constructors
    /**
     * Initializes a new instance of the `StringLayouter` class.
     * @private
     */
    function PdfStringLayouter() {
        /**
         * Checks whether the x co-ordinate is need to set as client size or not.
         * @hidden
         * @private
         */
        this.isOverloadWithPosition = false;
        //
    }
    PdfStringLayouter.prototype.layout = function (arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        if (arg4 instanceof RectangleF) {
            this.initialize(arg1, arg2, arg3, arg4, arg5);
            this.isOverloadWithPosition = arg6;
            this.clientSize = arg7;
            var result = this.doLayout();
            this.clear();
            return result;
        }
        else {
            this.initialize(arg1, arg2, arg3, arg4);
            this.isOverloadWithPosition = arg5;
            this.clientSize = arg6;
            var result = this.doLayout();
            this.clear();
            return result;
        }
    };
    PdfStringLayouter.prototype.initialize = function (text, font, format, rectSize, pageHeight) {
        if (typeof pageHeight === 'number') {
            if (text == null) {
                throw new Error('ArgumentNullException:text');
            }
            if (font == null) {
                throw new Error('ArgumentNullException:font');
            }
            this.text = text;
            this.font = font;
            this.format = format;
            this.size = new SizeF(rectSize.width, rectSize.height);
            this.rectangle = rectSize;
            this.pageHeight = pageHeight;
            this.reader = new StringTokenizer(text);
        }
        else {
            this.initialize(text, font, format, new RectangleF(new PointF(0, 0), rectSize), 0);
        }
    };
    /**
     * `Clear` all resources.
     * @private
     */
    PdfStringLayouter.prototype.clear = function () {
        this.font = null;
        this.format = null;
        this.reader.close();
        this.reader = null;
        this.text = null;
    };
    /**
     * `Layouts` the text.
     * @private
     */
    PdfStringLayouter.prototype.doLayout = function () {
        var result = new PdfStringLayoutResult();
        var lineResult = new PdfStringLayoutResult();
        var lines = [];
        var line = this.reader.peekLine();
        var lineIndent = this.getLineIndent(true);
        while (line != null) {
            lineResult = this.layoutLine(line, lineIndent);
            if (lineResult !== null || typeof lineResult !== 'undefined') {
                var numSymbolsInserted = 0;
                /* tslint:disable */
                var returnedValue = this.copyToResult(result, lineResult, lines, /*out*/ numSymbolsInserted);
                /* tslint:enable */
                var success = returnedValue.success;
                numSymbolsInserted = returnedValue.numInserted;
                if (!success) {
                    this.reader.read(numSymbolsInserted);
                    break;
                }
            }
            // if (lineResult.textRemainder != null && lineResult.textRemainder.length > 0 ) {
            //     break;
            // }
            this.reader.readLine();
            line = this.reader.peekLine();
            lineIndent = this.getLineIndent(false);
        }
        this.finalizeResult(result, lines);
        return result;
    };
    /**
     * Returns `line indent` for the line.
     * @private
     */
    PdfStringLayouter.prototype.getLineIndent = function (firstLine) {
        var lineIndent = 0;
        if (this.format != null) {
            lineIndent = (firstLine) ? this.format.firstLineIndent : this.format.paragraphIndent;
            lineIndent = (this.size.width > 0) ? Math.min(this.size.width, lineIndent) : lineIndent;
        }
        return lineIndent;
    };
    /**
     * Calculates `height` of the line.
     * @private
     */
    PdfStringLayouter.prototype.getLineHeight = function () {
        var height = this.font.height;
        if (this.format != null && this.format.lineSpacing !== 0) {
            height = this.format.lineSpacing + this.font.height;
        }
        return height;
    };
    /**
     * Calculates `width` of the line.
     * @private
     */
    PdfStringLayouter.prototype.getLineWidth = function (line) {
        var width = this.font.getLineWidth(line, this.format);
        return width;
    };
    // tslint:disable
    /**
     * `Layouts` line.
     * @private
     */
    PdfStringLayouter.prototype.layoutLine = function (line, lineIndent) {
        var lineResult = new PdfStringLayoutResult();
        lineResult.layoutLineHeight = this.getLineHeight();
        var lines = [];
        var maxWidth = this.size.width;
        var lineWidth = this.getLineWidth(line) + lineIndent;
        var lineType = LineType.FirstParagraphLine;
        var readWord = true;
        // line is in bounds.
        if (maxWidth <= 0 || Math.round(lineWidth) <= Math.round(maxWidth)) {
            this.addToLineResult(lineResult, lines, line, lineWidth, LineType.NewLineBreak | lineType);
        }
        else {
            var builder = '';
            var curLine = '';
            lineWidth = lineIndent;
            var curIndent = lineIndent;
            var reader = new StringTokenizer(line);
            var word = reader.peekWord();
            var isSingleWord = false;
            if (word.length !== reader.length) {
                if (word === ' ') {
                    curLine = curLine + word;
                    builder = builder + word;
                    reader.position += 1;
                    word = reader.peekWord();
                }
            }
            while (word != null) {
                curLine = curLine + word;
                var curLineWidth = this.getLineWidth(curLine.toString()) + curIndent /*)*/;
                if (curLine.toString() === ' ') {
                    curLine = '';
                    curLineWidth = 0;
                }
                if (curLineWidth > maxWidth) {
                    if (this.getWrapType() === PdfWordWrapType.None) {
                        break;
                    }
                    if (curLine.length === word.length) {
                        //  Character wrap is disabled or one symbol is greater than bounds.
                        if (this.getWrapType() === PdfWordWrapType.WordOnly) {
                            lineResult.textRemainder = line.substring(reader.position);
                            break;
                        }
                        else if (curLine.length === 1) {
                            builder = builder + word;
                            break;
                        }
                        else {
                            readWord = false;
                            curLine = '';
                            word = reader.peek().toString();
                            continue;
                        }
                    }
                    else {
                        if (this.getLineWidth(word.toString()) > maxWidth) {
                            this.format.wordWrap = PdfWordWrapType.Character;
                        }
                        else {
                            if (typeof this.format !== 'undefined' && this.format !== null) {
                                this.format.wordWrap = PdfWordWrapType.Word;
                            }
                        }
                        if (this.getWrapType() !== PdfWordWrapType.Character || !readWord) {
                            var ln = builder.toString();
                            // if (ln.indexOf(' ') === -1) {
                            //     isSingleWord = true;
                            //     this.addToLineResult(lineResult, lines, curLine, lineWidth, LineType.LayoutBreak | lineType);
                            // } else {
                            //     this.addToLineResult(lineResult, lines, ln, lineWidth, LineType.LayoutBreak | lineType);
                            // }                          
                            if (ln !== ' ') {
                                this.addToLineResult(lineResult, lines, ln, lineWidth, LineType.LayoutBreak | lineType);
                            }
                            if (this.isOverloadWithPosition) {
                                maxWidth = this.clientSize.width;
                            }
                            curLine = '';
                            builder = '';
                            lineWidth = 0;
                            curIndent = 0;
                            curLineWidth = 0;
                            lineType = LineType.None;
                            // if (isSingleWord) {
                            //     reader.readWord();
                            //     readWord = false;
                            // }
                            word = (readWord) ? word : reader.peekWord();
                            //isSingleWord = false;
                            readWord = true;
                        }
                        else {
                            readWord = false;
                            curLine = '';
                            curLine = curLine + builder.toString();
                            word = reader.peek().toString();
                        }
                        continue;
                    }
                }
                /*tslint:disable:max-func-body-length */
                builder = builder + word;
                lineWidth = curLineWidth;
                if (readWord) {
                    reader.readWord();
                    word = reader.peekWord();
                    //isSingleWord = false;
                }
                else {
                    reader.read();
                    word = reader.peek().toString();
                }
            }
            if (builder.length > 0) {
                var ln = builder.toString();
                this.addToLineResult(lineResult, lines, ln, lineWidth, LineType.NewLineBreak | LineType.LastParagraphLine);
            }
            reader.close();
        }
        lineResult.layoutLines = [];
        for (var index = 0; index < lines.length; index++) {
            lineResult.layoutLines.push(lines[index]);
        }
        lines = [];
        return lineResult;
    };
    /**
     * `Adds` line to line result.
     * @private
     */
    PdfStringLayouter.prototype.addToLineResult = function (lineResult, lines, line, lineWidth, breakType) {
        var info = new LineInfo();
        info.text = line;
        info.width = lineWidth;
        info.lineType = breakType;
        lines.push(info);
        var size = lineResult.actualSize;
        size.height += this.getLineHeight();
        size.width = Math.max(size.width, lineWidth);
        lineResult.size = size;
    };
    /**
     * `Copies` layout result from line result to entire result. Checks whether we can proceed lay outing or not.
     * @private
     */
    PdfStringLayouter.prototype.copyToResult = function (result, lineResult, lines, 
    /*out*/ numInserted) {
        var success = true;
        var allowPartialLines = (this.format != null && !this.format.lineLimit);
        var height = result.actualSize.height;
        var maxHeight = this.size.height;
        if ((this.pageHeight > 0) && (maxHeight + this.rectangle.y > this.pageHeight)) {
            maxHeight = this.rectangle.y - this.pageHeight;
            maxHeight = Math.max(maxHeight, -maxHeight);
        }
        numInserted = 0;
        if (lineResult.lines != null) {
            for (var i = 0, len = lineResult.lines.length; i < len; i++) {
                var expHeight = height + lineResult.lineHeight;
                if (expHeight <= maxHeight || maxHeight <= 0 || allowPartialLines) {
                    var info = lineResult.lines[i];
                    numInserted += info.text.length;
                    info = this.trimLine(info, (lines.length === 0));
                    lines.push(info);
                    // Update width.
                    var size = result.actualSize;
                    size.width = Math.max(size.width, info.width);
                    result.size = size;
                    // The part of the line fits only and it's allowed to use partial lines.
                    // if (expHeight >= maxHeight && maxHeight > 0 && allowPartialLines)
                    // {
                    //     let shouldClip : boolean = (this.format == null || !this.format.noClip);
                    //     if (shouldClip)
                    //     {
                    //         let exceededHeight : number = expHeight - maxHeight;
                    //         let fitHeight : number  = /*Utils.Round(*/ lineResult.lineHeight - exceededHeight /*)*/;
                    //         height = /*Utils.Round(*/ height + fitHeight /*)*/;
                    //     }
                    //     else
                    //     {
                    //         height = expHeight;
                    //     }
                    //     success = false;
                    //     break;
                    // } else {
                    height = expHeight;
                    // }
                }
                else {
                    success = false;
                    break;
                }
            }
        }
        if (height != result.size.height) {
            var size1 = result.actualSize;
            size1.height = height;
            result.size = size1;
        }
        return { success: success, numInserted: numInserted };
    };
    /**
     * `Finalizes` final result.
     * @private
     */
    PdfStringLayouter.prototype.finalizeResult = function (result, lines) {
        result.layoutLines = [];
        for (var index = 0; index < lines.length; index++) {
            result.layoutLines.push(lines[index]);
        }
        result.layoutLineHeight = this.getLineHeight();
        if (!this.reader.end) {
            result.textRemainder = this.reader.readToEnd();
        }
        lines = [];
    };
    /**
     * `Trims` whitespaces at the line.
     * @private
     */
    PdfStringLayouter.prototype.trimLine = function (info, firstLine) {
        var line = info.text;
        var lineWidth = info.width;
        // Trim start whitespaces if the line is not a start of the paragraph only.
        var trimStartSpaces = ((info.lineType & LineType.FirstParagraphLine) === 0);
        var start = (this.format == null || !this.format.rightToLeft);
        var spaces = StringTokenizer.spaces;
        line = (start) ? line.trim() : line.trim();
        // Recalculate line width.
        if (line.length !== info.text.length) {
            lineWidth = this.getLineWidth(line);
            if ((info.lineType & LineType.FirstParagraphLine) > 0) {
                lineWidth += this.getLineIndent(firstLine);
            }
        }
        info.text = line;
        info.width = lineWidth;
        return info;
    };
    /**
     * Returns `wrap` type.
     * @private
     */
    PdfStringLayouter.prototype.getWrapType = function () {
        var wrapType = (this.format != null) ? this.format.wordWrap : PdfWordWrapType.Word;
        return wrapType;
    };
    return PdfStringLayouter;
}());
export { PdfStringLayouter };
//Internal declaration
var PdfStringLayoutResult = /** @class */ (function () {
    function PdfStringLayoutResult() {
    }
    Object.defineProperty(PdfStringLayoutResult.prototype, "remainder", {
        // Properties
        /**
         * Gets the `text` which is not lay outed.
         * @private
         */
        get: function () {
            return this.textRemainder;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringLayoutResult.prototype, "actualSize", {
        /**
         * Gets the actual layout text `bounds`.
         * @private
         */
        get: function () {
            if (typeof this.size === 'undefined') {
                this.size = new SizeF(0, 0);
            }
            return this.size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringLayoutResult.prototype, "lines", {
        /**
         * Gets layout `lines` information.
         * @private
         */
        get: function () {
            return this.layoutLines;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringLayoutResult.prototype, "lineHeight", {
        /**
         * Gets the `height` of the line.
         * @private
         */
        get: function () {
            return this.layoutLineHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringLayoutResult.prototype, "empty", {
        /**
         * Gets value that indicates whether any layout text [`empty`].
         * @private
         */
        get: function () {
            return (this.layoutLines == null || this.layoutLines.length === 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStringLayoutResult.prototype, "lineCount", {
        /**
         * Gets `number of` the layout lines.
         * @private
         */
        get: function () {
            var count = (!this.empty) ? this.layoutLines.length : 0;
            return count;
        },
        enumerable: true,
        configurable: true
    });
    return PdfStringLayoutResult;
}());
export { PdfStringLayoutResult };
var LineInfo = /** @class */ (function () {
    function LineInfo() {
    }
    Object.defineProperty(LineInfo.prototype, "lineType", {
        //Properties
        /**
         * Gets the `type` of the line text.
         * @private
         */
        get: function () {
            return this.type;
        },
        set: function (value) {
            this.type = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineInfo.prototype, "text", {
        /**
         * Gets the line `text`.
         * @private
         */
        get: function () {
            return this.content;
        },
        set: function (value) {
            this.content = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineInfo.prototype, "width", {
        /**
         * Gets `width` of the line text.
         * @private
         */
        get: function () {
            return this.lineWidth;
        },
        set: function (value) {
            this.lineWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    return LineInfo;
}());
export { LineInfo };
/**
* Break type of the `line`.
* @private
*/
export var LineType;
(function (LineType) {
    /**
     * Specifies the type of `None`.
     * @private
     */
    LineType[LineType["None"] = 0] = "None";
    /**
     * Specifies the type of `NewLineBreak`.
     * @private
     */
    LineType[LineType["NewLineBreak"] = 1] = "NewLineBreak";
    /**
     * Specifies the type of `LayoutBreak`.
     * @private
     */
    LineType[LineType["LayoutBreak"] = 2] = "LayoutBreak";
    /**
     * Specifies the type of `FirstParagraphLine`.
     * @private
     */
    LineType[LineType["FirstParagraphLine"] = 4] = "FirstParagraphLine";
    /**
     * Specifies the type of `LastParagraphLine`.
     * @private
     */
    LineType[LineType["LastParagraphLine"] = 8] = "LastParagraphLine";
})(LineType || (LineType = {}));
