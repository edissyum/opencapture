/**
 * PdfOperators.ts class for EJ2-PDF
 * Class of string PDF common operators.
 * @private
 */
export declare class Operators {
    /**
     * Specifies the value of `obj`.
     * @private
     */
    static readonly obj: string;
    /**
     * Specifies the value of `endObj`.
     * @private
     */
    static readonly endObj: string;
    /**
     * Specifies the value of `R`.
     * @private
     */
    static readonly r: string;
    /**
     * Specifies the value of ` `.
     * @private
     */
    static readonly whiteSpace: string;
    /**
     * Specifies the value of `/`.
     * @private
     */
    static readonly slash: string;
    /**
     * Specifies the value of `\r\n`.
     * @private
     */
    static readonly newLine: string;
    /**
     * Specifies the value of `stream`.
     * @private
     */
    static readonly stream: string;
    /**
     * Specifies the value of `endStream`.
     * @private
     */
    static readonly endStream: string;
    /**
     * Specifies the value of `xref`.
     * @private
     */
    static readonly xref: string;
    /**
     * Specifies the value of `f`.
     * @private
     */
    static readonly f: string;
    /**
     * Specifies the value of `n`.
     * @private
     */
    static readonly n: string;
    /**
     * Specifies the value of `trailer`.
     * @private
     */
    static readonly trailer: string;
    /**
     * Specifies the value of `startxref`.
     * @private
     */
    static readonly startxref: string;
    /**
     * Specifies the value of `eof`.
     * @private
     */
    static readonly eof: string;
    /**
     * Specifies the value of `header`.
     * @private
     */
    static readonly header: string;
    /**
     * Specifies the value of `beginText`.
     * @private
     */
    static readonly beginText: string;
    /**
     * Specifies the value of `endText`.
     * @private
     */
    static readonly endText: string;
    /**
     * Specifies the value of `m`.
     * @private
     */
    static readonly beginPath: string;
    /**
     * Specifies the value of `l`.
     * @private
     */
    static readonly appendLineSegment: string;
    /**
     * Specifies the value of `S`.
     * @private
     */
    static readonly stroke: string;
    /**
     * Specifies the value of `f`.
     * @private
     */
    static readonly fill: string;
    /**
     * Specifies the value of `f*`.
     * @private
     */
    static readonly fillEvenOdd: string;
    /**
     * Specifies the value of `B`.
     * @private
     */
    static readonly fillStroke: string;
    /**
     * Specifies the value of `B*`.
     * @private
     */
    static readonly fillStrokeEvenOdd: string;
    /**
     * Specifies the value of `c`.
     * @private
     */
    static readonly appendbeziercurve: string;
    /**
     * Specifies the value of `re`.
     * @private
     */
    static readonly appendRectangle: string;
    /**
     * Specifies the value of `q`.
     * @private
     */
    static readonly saveState: string;
    /**
     * Specifies the value of `Q`.
     * @private
     */
    static readonly restoreState: string;
    /**
     * Specifies the value of `Do`.
     * @private
     */
    static readonly paintXObject: string;
    /**
     * Specifies the value of `cm`.
     * @private
     */
    static readonly modifyCtm: string;
    /**
     * Specifies the value of `Tm`.
     * @private
     */
    static readonly modifyTM: string;
    /**
     * Specifies the value of `w`.
     * @private
     */
    static readonly setLineWidth: string;
    /**
     * Specifies the value of `J`.
     * @private
     */
    static readonly setLineCapStyle: string;
    /**
     * Specifies the value of `j`.
     * @private
     */
    static readonly setLineJoinStyle: string;
    /**
     * Specifies the value of `d`.
     * @private
     */
    static readonly setDashPattern: string;
    /**
     * Specifies the value of `i`.
     * @private
     */
    static readonly setFlatnessTolerance: string;
    /**
     * Specifies the value of `h`.
     * @private
     */
    static readonly closePath: string;
    /**
     * Specifies the value of `s`.
     * @private
     */
    static readonly closeStrokePath: string;
    /**
     * Specifies the value of `b`.
     * @private
     */
    static readonly closeFillStrokePath: string;
    /**
     * Specifies the value of `setCharacterSpace`.
     * @private
     */
    static readonly setCharacterSpace: string;
    /**
     * Specifies the value of `setWordSpace`.
     * @private
     */
    static readonly setWordSpace: string;
    /**
     * Specifies the value of `setHorizontalScaling`.
     * @private
     */
    static readonly setHorizontalScaling: string;
    /**
     * Specifies the value of `setTextLeading`.
     * @private
     */
    static readonly setTextLeading: string;
    /**
     * Specifies the value of `setFont`.
     * @private
     */
    static readonly setFont: string;
    /**
     * Specifies the value of `setRenderingMode`.
     * @private
     */
    static readonly setRenderingMode: string;
    /**
     * Specifies the value of `setTextRise`.
     * @private
     */
    static readonly setTextRise: string;
    /**
     * Specifies the value of `setTextScaling`.
     * @private
     */
    static readonly setTextScaling: string;
    /**
     * Specifies the value of `setCoords`.
     * @private
     */
    static readonly setCoords: string;
    /**
     * Specifies the value of `goToNextLine`.
     * @private
     */
    static readonly goToNextLine: string;
    /**
     * Specifies the value of `setText`.
     * @private
     */
    static readonly setText: string;
    /**
     * Specifies the value of `setTextWithFormatting`.
     * @private
     */
    static readonly setTextWithFormatting: string;
    /**
     * Specifies the value of `setTextOnNewLine`.
     * @private
     */
    static readonly setTextOnNewLine: string;
    /**
     * Specifies the value of `selectcolorspaceforstroking`.
     * @private
     */
    static readonly selectcolorspaceforstroking: string;
    /**
     * Specifies the value of `selectcolorspacefornonstroking`.
     * @private
     */
    static readonly selectcolorspacefornonstroking: string;
    /**
     * Specifies the value of `setrbgcolorforstroking`.
     * @private
     */
    static readonly setrbgcolorforstroking: string;
    /**
     * Specifies the value of `setrbgcolorfornonstroking`.
     * @private
     */
    static readonly setrbgcolorfornonstroking: string;
    /**
     * Specifies the value of `K`.
     * @private
     */
    static readonly setcmykcolorforstroking: string;
    /**
     * Specifies the value of `k`.
     * @private
     */
    static readonly setcmykcolorfornonstroking: string;
    /**
     * Specifies the value of `G`.
     * @private
     */
    static readonly setgraycolorforstroking: string;
    /**
     * Specifies the value of `g`.
     * @private
     */
    static readonly setgraycolorfornonstroking: string;
    /**
     * Specifies the value of `W`.
     * @private
     */
    static readonly clipPath: string;
    /**
     * Specifies the value of `clipPathEvenOdd`.
     * @private
     */
    static readonly clipPathEvenOdd: string;
    /**
     * Specifies the value of `n`.
     * @private
     */
    static readonly endPath: string;
    /**
     * Specifies the value of `setGraphicsState`.
     * @private
     */
    static readonly setGraphicsState: string;
    /**
     * Specifies the value of `%`.
     * @private
     */
    static readonly comment: string;
    /**
     * Specifies the value of `*`.
     * @private
     */
    static readonly evenOdd: string;
    /**
     * Specifies the value of `M`.
     * @private
     */
    static readonly setMiterLimit: string;
    /**
     * Specifies the value of `test`.
     * @private
     */
    private forTest;
    /**
     * Same as SC, but also supports Pattern, Separation, DeviceN, and ICCBased color spaces. For non-stroking operations.
     * @public
     */
    static readonly setColorAndPattern: string;
    /**
     * Same as SC, but also supports Pattern, Separation, DeviceN, and ICCBased color spaces. For stroking.
     */
    static readonly setColorAndPatternStroking: string;
    /**
     * Create an instance of `PdfOperator` class.
     * @private
     */
    constructor();
}
