/**
 * PdfOperators.ts class for EJ2-PDF
 * Class of string PDF common operators.
 * @private
 */
var Operators = /** @class */ (function () {
    /**
     * Create an instance of `PdfOperator` class.
     * @private
     */
    function Operators() {
        /**
         * Specifies the value of `test`.
         * @private
         */
        this.forTest = 'test';
        this.forTest = Operators.obj;
    }
    /**
     * Specifies the value of `obj`.
     * @private
     */
    Operators.obj = 'obj';
    /**
     * Specifies the value of `endObj`.
     * @private
     */
    Operators.endObj = 'endobj';
    /**
     * Specifies the value of `R`.
     * @private
     */
    Operators.r = 'R';
    /**
     * Specifies the value of ` `.
     * @private
     */
    Operators.whiteSpace = ' ';
    /**
     * Specifies the value of `/`.
     * @private
     */
    Operators.slash = '/';
    /**
     * Specifies the value of `\r\n`.
     * @private
     */
    Operators.newLine = '\r\n';
    /**
     * Specifies the value of `stream`.
     * @private
     */
    Operators.stream = 'stream';
    /**
     * Specifies the value of `endStream`.
     * @private
     */
    Operators.endStream = 'endstream';
    /**
     * Specifies the value of `xref`.
     * @private
     */
    Operators.xref = 'xref';
    /**
     * Specifies the value of `f`.
     * @private
     */
    Operators.f = 'f';
    /**
     * Specifies the value of `n`.
     * @private
     */
    Operators.n = 'n';
    /**
     * Specifies the value of `trailer`.
     * @private
     */
    Operators.trailer = 'trailer';
    /**
     * Specifies the value of `startxref`.
     * @private
     */
    Operators.startxref = 'startxref';
    /**
     * Specifies the value of `eof`.
     * @private
     */
    Operators.eof = '%%EOF';
    /**
     * Specifies the value of `header`.
     * @private
     */
    Operators.header = '%PDF-1.5';
    /**
     * Specifies the value of `beginText`.
     * @private
     */
    Operators.beginText = 'BT';
    /**
     * Specifies the value of `endText`.
     * @private
     */
    Operators.endText = 'ET';
    /**
     * Specifies the value of `m`.
     * @private
     */
    Operators.beginPath = 'm';
    /**
     * Specifies the value of `l`.
     * @private
     */
    Operators.appendLineSegment = 'l';
    /**
     * Specifies the value of `S`.
     * @private
     */
    Operators.stroke = 'S';
    /**
     * Specifies the value of `f`.
     * @private
     */
    Operators.fill = 'f';
    /**
     * Specifies the value of `f*`.
     * @private
     */
    Operators.fillEvenOdd = 'f*';
    /**
     * Specifies the value of `B`.
     * @private
     */
    Operators.fillStroke = 'B';
    /**
     * Specifies the value of `B*`.
     * @private
     */
    Operators.fillStrokeEvenOdd = 'B*';
    /**
     * Specifies the value of `c`.
     * @private
     */
    Operators.appendbeziercurve = 'c';
    /**
     * Specifies the value of `re`.
     * @private
     */
    Operators.appendRectangle = 're';
    /**
     * Specifies the value of `q`.
     * @private
     */
    Operators.saveState = 'q';
    /**
     * Specifies the value of `Q`.
     * @private
     */
    Operators.restoreState = 'Q';
    /**
     * Specifies the value of `Do`.
     * @private
     */
    Operators.paintXObject = 'Do';
    /**
     * Specifies the value of `cm`.
     * @private
     */
    Operators.modifyCtm = 'cm';
    /**
     * Specifies the value of `Tm`.
     * @private
     */
    Operators.modifyTM = 'Tm';
    /**
     * Specifies the value of `w`.
     * @private
     */
    Operators.setLineWidth = 'w';
    /**
     * Specifies the value of `J`.
     * @private
     */
    Operators.setLineCapStyle = 'J';
    /**
     * Specifies the value of `j`.
     * @private
     */
    Operators.setLineJoinStyle = 'j';
    /**
     * Specifies the value of `d`.
     * @private
     */
    Operators.setDashPattern = 'd';
    /**
     * Specifies the value of `i`.
     * @private
     */
    Operators.setFlatnessTolerance = 'i';
    /**
     * Specifies the value of `h`.
     * @private
     */
    Operators.closePath = 'h';
    /**
     * Specifies the value of `s`.
     * @private
     */
    Operators.closeStrokePath = 's';
    /**
     * Specifies the value of `b`.
     * @private
     */
    Operators.closeFillStrokePath = 'b';
    /**
     * Specifies the value of `setCharacterSpace`.
     * @private
     */
    Operators.setCharacterSpace = 'Tc';
    /**
     * Specifies the value of `setWordSpace`.
     * @private
     */
    Operators.setWordSpace = 'Tw';
    /**
     * Specifies the value of `setHorizontalScaling`.
     * @private
     */
    Operators.setHorizontalScaling = 'Tz';
    /**
     * Specifies the value of `setTextLeading`.
     * @private
     */
    Operators.setTextLeading = 'TL';
    /**
     * Specifies the value of `setFont`.
     * @private
     */
    Operators.setFont = 'Tf';
    /**
     * Specifies the value of `setRenderingMode`.
     * @private
     */
    Operators.setRenderingMode = 'Tr';
    /**
     * Specifies the value of `setTextRise`.
     * @private
     */
    Operators.setTextRise = 'Ts';
    /**
     * Specifies the value of `setTextScaling`.
     * @private
     */
    Operators.setTextScaling = 'Tz';
    /**
     * Specifies the value of `setCoords`.
     * @private
     */
    Operators.setCoords = 'Td';
    /**
     * Specifies the value of `goToNextLine`.
     * @private
     */
    Operators.goToNextLine = 'T*';
    /**
     * Specifies the value of `setText`.
     * @private
     */
    Operators.setText = 'Tj';
    /**
     * Specifies the value of `setTextWithFormatting`.
     * @private
     */
    Operators.setTextWithFormatting = 'TJ';
    /**
     * Specifies the value of `setTextOnNewLine`.
     * @private
     */
    Operators.setTextOnNewLine = '\'';
    /**
     * Specifies the value of `selectcolorspaceforstroking`.
     * @private
     */
    Operators.selectcolorspaceforstroking = 'CS';
    /**
     * Specifies the value of `selectcolorspacefornonstroking`.
     * @private
     */
    Operators.selectcolorspacefornonstroking = 'cs';
    /**
     * Specifies the value of `setrbgcolorforstroking`.
     * @private
     */
    Operators.setrbgcolorforstroking = 'RG';
    /**
     * Specifies the value of `setrbgcolorfornonstroking`.
     * @private
     */
    Operators.setrbgcolorfornonstroking = 'rg';
    /**
     * Specifies the value of `K`.
     * @private
     */
    Operators.setcmykcolorforstroking = 'K';
    /**
     * Specifies the value of `k`.
     * @private
     */
    Operators.setcmykcolorfornonstroking = 'k';
    /**
     * Specifies the value of `G`.
     * @private
     */
    Operators.setgraycolorforstroking = 'G';
    /**
     * Specifies the value of `g`.
     * @private
     */
    Operators.setgraycolorfornonstroking = 'g';
    /**
     * Specifies the value of `W`.
     * @private
     */
    Operators.clipPath = 'W';
    /**
     * Specifies the value of `clipPathEvenOdd`.
     * @private
     */
    Operators.clipPathEvenOdd = 'W*';
    /**
     * Specifies the value of `n`.
     * @private
     */
    Operators.endPath = 'n';
    /**
     * Specifies the value of `setGraphicsState`.
     * @private
     */
    Operators.setGraphicsState = 'gs';
    /**
     * Specifies the value of `%`.
     * @private
     */
    Operators.comment = '%';
    /**
     * Specifies the value of `*`.
     * @private
     */
    Operators.evenOdd = '*';
    /**
     * Specifies the value of `M`.
     * @private
     */
    Operators.setMiterLimit = 'M';
    /**
     * Same as SC, but also supports Pattern, Separation, DeviceN, and ICCBased color spaces. For non-stroking operations.
     * @public
     */
    Operators.setColorAndPattern = 'scn';
    /**
     * Same as SC, but also supports Pattern, Separation, DeviceN, and ICCBased color spaces. For stroking.
     */
    Operators.setColorAndPatternStroking = 'SCN';
    return Operators;
}());
export { Operators };
