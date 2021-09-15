/**
 * `IPdfTrueTypeFont.ts` interface for EJ2-PDF
 * Defines the basic interace of the various Pdf True Type Font.
 * @private
 */
import { IPdfPrimitive } from './i-pdf-primitives';
import { PdfFontMetrics } from './../implementation/graphics/fonts/pdf-font-metrics';
import { PdfFont } from './../implementation/graphics/fonts/pdf-font';
export interface IPdfTrueTypeFont {
    size: number;
    metrics: PdfFontMetrics;
    getInternals(): IPdfPrimitive;
    equalsToFont(font: PdfFont): boolean;
    createInternals(): void;
    getCharWidth(charCode: string): number;
    getLineWidth(line: string): number;
    close(): void;
}
