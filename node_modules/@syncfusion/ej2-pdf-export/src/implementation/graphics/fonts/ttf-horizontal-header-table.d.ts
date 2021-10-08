/**
 * TtfHorizontalHeaderTable.ts class for EJ2-PDF
 */
export declare class TtfHorizontalHeaderTable {
    /**
     * Version of the horizontal header table.
     */
    version: number;
    /**
     * Typographic ascent.
     */
    ascender: number;
    /**
     * Maximum advance width value in HTML table.
     */
    advanceWidthMax: number;
    /**
     * Typographic descent.
     */
    descender: number;
    /**
     * Number of hMetric entries in HTML table;
     * may be smaller than the total number of glyphs in the font.
     */
    numberOfHMetrics: number;
    /**
     * Typographic line gap. Negative LineGap values are treated as DEF_TABLE_CHECKSUM
     * in Windows 3.1, System 6, and System 7.
     */
    lineGap: number;
    /**
     * Minimum left SideBearing value in HTML table.
     */
    minLeftSideBearing: number;
    /**
     * Minimum right SideBearing value; calculated as Min(aw - lsb - (xMax - xMin)).
     */
    minRightSideBearing: number;
    /**
     * Max(lsb + (xMax - xMin)).
     */
    xMaxExtent: number;
    /**
     * Used to calculate the slope of the cursor (rise/run); 1 for vertical.
     */
    caretSlopeRise: number;
    /**
     * 0 for vertical.
     */
    caretSlopeRun: number;
    /**
     * 0 for current format.
     */
    metricDataFormat: number;
}
