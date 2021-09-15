/**
 * RTL-Renderer.ts class for EJ2-PDF
 */
import { PdfStringFormat } from './pdf-string-format';
import { PdfTrueTypeFont } from './pdf-true-type-font';
/**
 * `Metrics` of the font.
 * @private
 */
export declare class RtlRenderer {
    private readonly openBracket;
    private readonly closeBracket;
    layout(line: string, font: PdfTrueTypeFont, rtl: boolean, wordSpace: boolean, format: PdfStringFormat): string[];
    splitLayout(line: string, font: PdfTrueTypeFont, rtl: boolean, wordSpace: boolean, format: PdfStringFormat): string[];
    getGlyphIndex(line: string, font: PdfTrueTypeFont, rtl: boolean, /*out*/ glyphs: Uint16Array, custom?: boolean | null): {
        success: boolean;
        glyphs: Uint16Array;
    };
    customLayout(line: string, rtl: boolean, format: PdfStringFormat): string;
    customLayout(line: string, rtl: boolean, format: PdfStringFormat, font: PdfTrueTypeFont, wordSpace: boolean): string[];
    addChars(font: PdfTrueTypeFont, glyphs: string): string;
    customSplitLayout(line: string, font: PdfTrueTypeFont, rtl: boolean, wordSpace: boolean, format: PdfStringFormat): string[];
}
