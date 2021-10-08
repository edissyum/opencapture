import { Operators } from './pdf-operators';
import { PdfNumber } from './../primitives/pdf-number';
import { PointF, RectangleF } from './../drawing/pdf-drawing';
import { PdfString } from './../primitives/pdf-string';
import { PdfName } from './../primitives/pdf-name';
/**
 * Helper class to `write PDF graphic streams` easily.
 * @private
 */
var PdfStreamWriter = /** @class */ (function () {
    /**
     * Initialize an instance of `PdfStreamWriter` class.
     * @private
     */
    function PdfStreamWriter(stream) {
        if (stream == null) {
            throw new Error('ArgumentNullException:stream');
        }
        this.stream = stream;
    }
    //Implementation
    /**
     * `Clear` the stream.
     * @public
     */
    PdfStreamWriter.prototype.clear = function () {
        this.stream.clearStream();
    };
    PdfStreamWriter.prototype.setGraphicsState = function (dictionaryName) {
        if (dictionaryName instanceof PdfName) {
            this.stream.write(dictionaryName.toString());
            this.stream.write(Operators.whiteSpace);
            this.writeOperator(Operators.setGraphicsState);
        }
        else {
            this.stream.write(Operators.slash);
            this.stream.write(dictionaryName);
            this.stream.write(Operators.whiteSpace);
            this.writeOperator(Operators.setGraphicsState);
        }
    };
    /**
     * `Executes the XObject`.
     * @private
     */
    PdfStreamWriter.prototype.executeObject = function (name) {
        this.stream.write(name.toString());
        this.stream.write(Operators.whiteSpace);
        this.writeOperator(Operators.paintXObject);
        this.stream.write(Operators.newLine);
    };
    /**
     * `Closes path object`.
     * @private
     */
    PdfStreamWriter.prototype.closePath = function () {
        this.writeOperator(Operators.closePath);
    };
    /**
     * `Clips the path`.
     * @private
     */
    PdfStreamWriter.prototype.clipPath = function (useEvenOddRule) {
        this.stream.write(Operators.clipPath);
        if (useEvenOddRule) {
            this.stream.write(Operators.evenOdd);
        }
        this.stream.write(Operators.whiteSpace);
        this.stream.write(Operators.endPath);
        this.stream.write(Operators.newLine);
    };
    /**
     * `Closes, then fills and strokes the path`.
     * @private
     */
    PdfStreamWriter.prototype.closeFillStrokePath = function (useEvenOddRule) {
        this.stream.write(Operators.closeFillStrokePath);
        if (useEvenOddRule) {
            this.stream.write(Operators.evenOdd);
            this.stream.write(Operators.newLine);
        }
        else {
            this.stream.write(Operators.newLine);
        }
    };
    /**
     * `Fills and strokes path`.
     * @private
     */
    PdfStreamWriter.prototype.fillStrokePath = function (useEvenOddRule) {
        this.stream.write(Operators.fillStroke);
        if (useEvenOddRule) {
            this.stream.write(Operators.evenOdd);
            this.stream.write(Operators.newLine);
        }
        else {
            this.stream.write(Operators.newLine);
        }
    };
    /**
     * `Fills path`.
     * @private
     */
    PdfStreamWriter.prototype.fillPath = function (useEvenOddRule) {
        this.stream.write(Operators.fill);
        if (useEvenOddRule) {
            this.stream.write(Operators.evenOdd);
            this.stream.write(Operators.newLine);
        }
        else {
            this.stream.write(Operators.newLine);
        }
    };
    /**
     * `Ends the path`.
     * @private
     */
    PdfStreamWriter.prototype.endPath = function () {
        this.writeOperator(Operators.n);
    };
    /**
     * `Closes and fills the path`.
     * @private
     */
    PdfStreamWriter.prototype.closeFillPath = function (useEvenOddRule) {
        this.writeOperator(Operators.closePath);
        this.stream.write(Operators.fill);
        if (useEvenOddRule) {
            this.stream.write(Operators.evenOdd);
            this.stream.write(Operators.newLine);
        }
        else {
            this.stream.write(Operators.newLine);
        }
    };
    /**
     * `Closes and strokes the path`.
     * @private
     */
    PdfStreamWriter.prototype.closeStrokePath = function () {
        this.writeOperator(Operators.closeStrokePath);
    };
    /**
     * `Sets the text scaling`.
     * @private
     */
    PdfStreamWriter.prototype.setTextScaling = function (textScaling) {
        this.stream.write(PdfNumber.floatToString(textScaling));
        this.stream.write(Operators.whiteSpace);
        this.writeOperator(Operators.setTextScaling);
    };
    /**
     * `Strokes path`.
     * @private
     */
    PdfStreamWriter.prototype.strokePath = function () {
        this.writeOperator(Operators.stroke);
    };
    /**
     * `Restores` the graphics state.
     * @private
     */
    PdfStreamWriter.prototype.restoreGraphicsState = function () {
        this.writeOperator(Operators.restoreState);
    };
    /**
     * `Saves` the graphics state.
     * @private
     */
    PdfStreamWriter.prototype.saveGraphicsState = function () {
        this.writeOperator(Operators.saveState);
    };
    PdfStreamWriter.prototype.startNextLine = function (arg1, arg2) {
        if (typeof arg1 === 'undefined') {
            this.writeOperator(Operators.goToNextLine);
        }
        else if (arg1 instanceof PointF) {
            this.writePoint(arg1);
            this.writeOperator(Operators.setCoords);
        }
        else {
            this.writePoint(arg1, arg2);
            this.writeOperator(Operators.setCoords);
        }
    };
    /**
     * Shows the `text`.
     * @private
     */
    PdfStreamWriter.prototype.showText = function (text) {
        this.checkTextParam(text);
        this.writeText(text);
        this.writeOperator(Operators.setText);
    };
    /**
     * Sets `text leading`.
     * @private
     */
    PdfStreamWriter.prototype.setLeading = function (leading) {
        this.stream.write(PdfNumber.floatToString(leading));
        this.stream.write(Operators.whiteSpace);
        this.writeOperator(Operators.setTextLeading);
    };
    /**
     * `Begins the path`.
     * @private
     */
    PdfStreamWriter.prototype.beginPath = function (x, y) {
        this.writePoint(x, y);
        this.writeOperator(Operators.beginPath);
    };
    /**
     * `Begins text`.
     * @private
     */
    PdfStreamWriter.prototype.beginText = function () {
        this.writeOperator(Operators.beginText);
    };
    /**
     * `Ends text`.
     * @private
     */
    PdfStreamWriter.prototype.endText = function () {
        this.writeOperator(Operators.endText);
    };
    PdfStreamWriter.prototype.appendRectangle = function (arg1, arg2, arg3, arg4) {
        if (arg1 instanceof RectangleF) {
            this.appendRectangle(arg1.x, arg1.y, arg1.width, arg1.height);
        }
        else {
            this.writePoint(arg1, arg2);
            this.writePoint(arg3, arg4);
            this.writeOperator(Operators.appendRectangle);
        }
    };
    PdfStreamWriter.prototype.appendLineSegment = function (arg1, arg2) {
        if (arg1 instanceof PointF) {
            this.appendLineSegment(arg1.x, arg1.y);
        }
        else {
            this.writePoint(arg1, arg2);
            this.writeOperator(Operators.appendLineSegment);
        }
    };
    /**
     * Sets the `text rendering mode`.
     * @private
     */
    PdfStreamWriter.prototype.setTextRenderingMode = function (renderingMode) {
        this.stream.write(renderingMode.toString());
        this.stream.write(Operators.whiteSpace);
        this.writeOperator(Operators.setRenderingMode);
    };
    /**
     * Sets the `character spacing`.
     * @private
     */
    PdfStreamWriter.prototype.setCharacterSpacing = function (charSpacing) {
        this.stream.write(PdfNumber.floatToString(charSpacing));
        this.stream.write(Operators.whiteSpace);
        this.stream.write(Operators.setCharacterSpace);
        this.stream.write(Operators.newLine);
    };
    /**
     * Sets the `word spacing`.
     * @private
     */
    PdfStreamWriter.prototype.setWordSpacing = function (wordSpacing) {
        this.stream.write(PdfNumber.floatToString(wordSpacing));
        this.stream.write(Operators.whiteSpace);
        this.writeOperator(Operators.setWordSpace);
    };
    PdfStreamWriter.prototype.showNextLineText = function (arg1, arg2) {
        if (arg1 instanceof PdfString) {
            this.checkTextParam(arg1);
            this.writeText(arg1);
            this.writeOperator(Operators.setTextOnNewLine);
        }
        else {
            this.checkTextParam(arg1);
            this.writeText(arg1, arg2);
            this.writeOperator(Operators.setTextOnNewLine);
        }
    };
    PdfStreamWriter.prototype.setColorSpace = function (arg1, arg2) {
        if (arg1 instanceof PdfName && typeof arg2 === 'boolean') {
            var temparg1 = arg1;
            var temparg2 = arg2;
            // if (temparg1 == null) {
            //     throw new Error('ArgumentNullException:name');
            // }
            var op = (temparg2) ? Operators.selectcolorspaceforstroking : Operators.selectcolorspacefornonstroking;
            this.stream.write(temparg1.toString());
            this.stream.write(Operators.whiteSpace);
            this.stream.write(op);
            this.stream.write(Operators.newLine);
        }
        else {
            var temparg1 = arg1;
            var temparg2 = arg2;
            this.setColorSpace(new PdfName(temparg1), temparg2);
        }
    };
    /**
     * Modifies current `transformation matrix`.
     * @private
     */
    PdfStreamWriter.prototype.modifyCtm = function (matrix) {
        if (matrix == null) {
            throw new Error('ArgumentNullException:matrix');
        }
        this.stream.write(matrix.toString());
        this.stream.write(Operators.whiteSpace);
        this.writeOperator(Operators.modifyCtm);
    };
    PdfStreamWriter.prototype.setFont = function (font, name, size) {
        if (typeof name === 'string') {
            this.setFont(font, new PdfName(name), size);
        }
        else {
            if (font == null) {
                throw new Error('ArgumentNullException:font');
            }
            this.stream.write(name.toString());
            this.stream.write(Operators.whiteSpace);
            this.stream.write(PdfNumber.floatToString(size));
            this.stream.write(Operators.whiteSpace);
            this.writeOperator(Operators.setFont);
        }
    };
    /**
     * `Writes the operator`.
     * @private
     */
    PdfStreamWriter.prototype.writeOperator = function (opcode) {
        this.stream.write(opcode);
        this.stream.write(Operators.newLine);
    };
    PdfStreamWriter.prototype.checkTextParam = function (text) {
        if (text == null) {
            throw new Error('ArgumentNullException:text');
        }
        if (typeof text === 'string' && text === '') {
            throw new Error('ArgumentException:The text can not be an empty string, text');
        }
    };
    PdfStreamWriter.prototype.writeText = function (arg1, arg2) {
        if ((arg1 instanceof PdfString) && (typeof arg2 === 'undefined')) {
            this.stream.write(arg1.pdfEncode());
        }
        else {
            var start = void 0;
            var end = void 0;
            if (arg2) {
                start = PdfString.hexStringMark[0];
                end = PdfString.hexStringMark[1];
            }
            else {
                start = PdfString.stringMark[0];
                end = PdfString.stringMark[1];
            }
            this.stream.write(start);
            this.stream.write(arg1);
            this.stream.write(end);
        }
    };
    PdfStreamWriter.prototype.writePoint = function (arg1, arg2) {
        if ((arg1 instanceof PointF) && (typeof arg2 === 'undefined')) {
            this.writePoint(arg1.x, arg1.y);
        }
        else {
            var temparg1 = arg1;
            this.stream.write(PdfNumber.floatToString(temparg1));
            this.stream.write(Operators.whiteSpace);
            // NOTE: Change Y co-ordinate because we shifted co-ordinate system only.
            arg2 = this.updateY(arg2);
            this.stream.write(PdfNumber.floatToString(arg2));
            this.stream.write(Operators.whiteSpace);
        }
    };
    /**
     * `Updates y` co-ordinate.
     * @private
     */
    PdfStreamWriter.prototype.updateY = function (arg) {
        return -arg;
    };
    /**
     * `Writes string` to the file.
     * @private
     */
    PdfStreamWriter.prototype.write = function (string) {
        var builder = '';
        builder += string;
        builder += Operators.newLine;
        this.writeOperator(builder);
    };
    /**
     * `Writes comment` to the file.
     * @private
     */
    PdfStreamWriter.prototype.writeComment = function (comment) {
        if (comment != null && comment.length > 0) {
            var builder = '';
            builder += Operators.comment;
            builder += Operators.whiteSpace;
            builder += comment;
            //builder.Append( Operators.NewLine );
            this.writeOperator(builder);
        }
        else {
            throw new Error('Invalid comment');
        }
    };
    /**
     * Sets the `color and space`.
     * @private
     */
    PdfStreamWriter.prototype.setColorAndSpace = function (color, colorSpace, forStroking) {
        if (!color.isEmpty) {
            // bool test = color is PdfExtendedColor;
            this.stream.write(color.toString(colorSpace, forStroking));
            this.stream.write(Operators.newLine);
        }
    };
    // public setLineDashPattern(pattern : number[], patternOffset : number) : void
    // {
    //     let pat : PdfArray = new PdfArray(pattern);
    //     let off : PdfNumber = new PdfNumber(patternOffset);
    //     this.setLineDashPatternHelper(pat, off);
    // }
    // private setLineDashPatternHelper(pattern : PdfArray, patternOffset : PdfNumber) : void
    // {
    //     pattern.Save(this);
    //     this.m_stream.write(Operators.whiteSpace);
    //     patternOffset.Save(this);
    //     this.m_stream.write(Operators.whiteSpace);
    //     this.writeOperator(Operators.setDashPattern);
    // }
    /**
     * Sets the `line dash pattern`.
     * @private
     */
    PdfStreamWriter.prototype.setLineDashPattern = function (pattern, patternOffset) {
        // let pat : PdfArray = new PdfArray(pattern);
        // let off : PdfNumber = new PdfNumber(patternOffset);
        // this.setLineDashPatternHelper(pat, off);
        this.setLineDashPatternHelper(pattern, patternOffset);
    };
    /**
     * Sets the `line dash pattern`.
     * @private
     */
    PdfStreamWriter.prototype.setLineDashPatternHelper = function (pattern, patternOffset) {
        var tempPattern = '[';
        if (pattern.length > 1) {
            for (var index = 0; index < pattern.length; index++) {
                if (index === pattern.length - 1) {
                    tempPattern += pattern[index].toString();
                }
                else {
                    tempPattern += pattern[index].toString() + ' ';
                }
            }
        }
        tempPattern += '] ';
        tempPattern += patternOffset.toString();
        tempPattern += ' ' + Operators.setDashPattern;
        this.stream.write(tempPattern);
        this.stream.write(Operators.newLine);
    };
    /**
     * Sets the `miter limit`.
     * @private
     */
    PdfStreamWriter.prototype.setMiterLimit = function (miterLimit) {
        this.stream.write(PdfNumber.floatToString(miterLimit));
        this.stream.write(Operators.whiteSpace);
        this.writeOperator(Operators.setMiterLimit);
    };
    /**
     * Sets the `width of the line`.
     * @private
     */
    PdfStreamWriter.prototype.setLineWidth = function (width) {
        this.stream.write(PdfNumber.floatToString(width));
        this.stream.write(Operators.whiteSpace);
        this.writeOperator(Operators.setLineWidth);
    };
    /**
     * Sets the `line cap`.
     * @private
     */
    PdfStreamWriter.prototype.setLineCap = function (lineCapStyle) {
        this.stream.write((lineCapStyle).toString());
        this.stream.write(Operators.whiteSpace);
        this.writeOperator(Operators.setLineCapStyle);
    };
    /**
     * Sets the `line join`.
     * @private
     */
    PdfStreamWriter.prototype.setLineJoin = function (lineJoinStyle) {
        this.stream.write((lineJoinStyle).toString());
        this.stream.write(Operators.whiteSpace);
        this.writeOperator(Operators.setLineJoinStyle);
    };
    Object.defineProperty(PdfStreamWriter.prototype, "position", {
        //IPdfWriter members
        /**
         * Gets or sets the current `position` within the stream.
         * @private
         */
        get: function () {
            return this.stream.position;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStreamWriter.prototype, "length", {
        /**
         * Gets `stream length`.
         * @private
         */
        get: function () {
            var returnValue = 0;
            if (this.stream.data.length !== 0 && this.stream.data.length !== -1) {
                for (var index = 0; index < this.stream.data.length; index++) {
                    returnValue += this.stream.data[index].length;
                }
            }
            return returnValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfStreamWriter.prototype, "document", {
        /**
         * Gets and Sets the `current document`.
         * @private
         */
        get: function () {
            return null;
        },
        enumerable: true,
        configurable: true
    });
    /* tslint:disable-next-line:max-line-length */
    PdfStreamWriter.prototype.appendBezierSegment = function (arg1, arg2, arg3, arg4, arg5, arg6) {
        if (arg1 instanceof PointF && arg2 instanceof PointF && arg3 instanceof PointF) {
            this.writePoint(arg1.x, arg1.y);
            this.writePoint(arg2.x, arg2.y);
            this.writePoint(arg3.x, arg3.y);
        }
        else {
            this.writePoint(arg1, arg2);
            this.writePoint(arg3, arg4);
            this.writePoint(arg5, arg6);
        }
        this.writeOperator(Operators.appendbeziercurve);
    };
    PdfStreamWriter.prototype.setColourWithPattern = function (colours, patternName, forStroking) {
        if ((colours != null)) {
            var count = colours.length;
            var i = 0;
            for (i = 0; i < count; ++i) {
                this.stream.write(colours[i].toString());
                this.stream.write(Operators.whiteSpace);
            }
        }
        if ((patternName != null)) {
            this.stream.write(patternName.toString());
            this.stream.write(Operators.whiteSpace);
        }
        if (forStroking) {
            this.writeOperator(Operators.setColorAndPatternStroking);
        }
        else {
            this.writeOperator(Operators.setColorAndPattern);
        }
    };
    return PdfStreamWriter;
}());
export { PdfStreamWriter };
