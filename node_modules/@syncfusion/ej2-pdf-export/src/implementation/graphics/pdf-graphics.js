/**
 * PdfGraphics.ts class for EJ2-PDF
 */
import { PdfColorSpace, TextRenderingMode, PdfFillMode, PdfTextAlignment } from './enum';
import { PdfVerticalAlignment, PdfBlendMode } from './enum';
import { PdfSubSuperScript } from './fonts/enum';
import { PdfStreamWriter } from './../input-output/pdf-stream-writer';
import { PdfPen } from './pdf-pen';
import { PdfBrush } from './brushes/pdf-brush';
import { PdfSolidBrush } from './brushes/pdf-solid-brush';
import { PdfFont } from './fonts/pdf-font';
import { PdfTransformationMatrix } from './pdf-transformation-matrix';
import { PointF, SizeF, RectangleF } from './../drawing/pdf-drawing';
import { ProcedureSets } from './constants';
import { PdfString } from './../primitives/pdf-string';
import { PdfStringFormat } from './fonts/pdf-string-format';
import { TemporaryDictionary } from './../collections/object-object-pair/dictionary';
import { PdfTransparency } from './pdf-transparency';
import { PdfStringLayouter, LineType } from './fonts/string-layouter';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { StringTokenizer } from './fonts/string-tokenizer';
import { PdfAutomaticFieldInfoCollection } from './../document/automatic-fields/automatic-field-info-collection';
import { PdfAutomaticFieldInfo } from './../document/automatic-fields/automatic-field-info';
import { Operators } from './../input-output/pdf-operators';
import { UnicodeTrueTypeFont } from './fonts/unicode-true-type-font';
import { InternalEnum } from './../primitives/pdf-string';
import { RtlRenderer } from './fonts/rtl-renderer';
import { PdfTextDirection } from './enum';
import { PathPointType } from './figures/enum';
import { PdfGradientBrush } from './../../implementation/graphics/brushes/pdf-gradient-brush';
import { PdfTilingBrush } from './brushes/pdf-tiling-brush';
/**
 * `PdfGraphics` class represents a graphics context of the objects.
 * It's used for performing all the graphics operations.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
 * // set the font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * // create black brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
 * //
 * //graphics of the page
 * let page1Graphics : PdfGraphics = page1.graphics;
 * // draw the text on the page1 graphics
 * page1Graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
 * //
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
var PdfGraphics = /** @class */ (function () {
    function PdfGraphics(arg1, arg2, arg3) {
        /**
         * Represents the `Current color space`.
         * @private
         */
        this.currentColorSpace = PdfColorSpace.Rgb;
        /**
         * Stores `previous rendering mode`.
         * @private
         */
        this.previousTextRenderingMode = TextRenderingMode.Fill;
        /**
         * Previous `character spacing` value or 0.
         * @private
         */
        this.previousCharacterSpacing = 0.0;
        /**
         * Previous `word spacing` value or 0.
         * @private
         */
        this.previousWordSpacing = 0.0;
        /**
         * The `previously used text scaling` value.
         * @private
         */
        this.previousTextScaling = 100.0;
        /**
         * Instance of `ProcedureSets` class.
         * @private
         */
        this.procedureSets = new ProcedureSets();
        /**
         * To check wihether it is a `direct text rendering`.
         * @default true
         * @private
         */
        this.isNormalRender = true;
        /**
         * check whether to `use font size` to calculate the shift.
         * @default false
         * @private
         */
        this.isUseFontSize = false;
        /**
         * check whether the font is in `italic type`.
         * @default false
         * @private
         */
        this.isItalic = false;
        /**
         * Check whether it is an `emf Text Matrix`.
         * @default false
         * @private
         */
        this.isEmfTextScaled = false;
        /**
         * Check whether it is an `emf` call.
         * @default false
         * @private
         */
        this.isEmf = false;
        /**
         * Check whether it is an `emf plus` call.
         * @default false
         * @private
         */
        this.isEmfPlus = false;
        /**
         * Check whether it is in `base line format`.
         * @default true
         * @private
         */
        this.isBaselineFormat = true;
        /**
         * Emf Text `Scaling Factor`.
         * @private
         */
        this.emfScalingFactor = new SizeF(0, 0);
        /**
         * To check whether the `last color space` of document and garphics is saved.
         * @private
         */
        this.colorSpaceChanged = false;
        /**
         * Stores an instance of `DictionaryProperties`.
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        /**
         * Checks whether the x co-ordinate is need to set as client size or not.
         * @hidden
         * @private
         */
        this.isOverloadWithPosition = false;
        /**
         * Checks whether the x co-ordinate is need to set as client size or not.
         * @hidden
         * @private
         */
        this.isPointOverload = false;
        /**
         * Current colorspaces.
         * @hidden
         * @private
         */
        this.currentColorSpaces = ['RGB', 'CMYK', 'GrayScale', 'Indexed'];
        /**
         * Checks the current image `is optimized` or not.
         * @default false.
         * @private
         */
        this.isImageOptimized = false;
        /**
         * Stores the `graphics states`.
         * @private
         */
        this.graphicsState = [];
        /**
         * Indicates whether the object `had trasparency`.
         * @default false
         * @private
         */
        this.istransparencySet = false;
        /**
         * Stores the instance of `PdfAutomaticFieldInfoCollection` class .
         * @default null
         * @private
         */
        this.internalAutomaticFields = null;
        /**
         * Stores the index of the start line that should draw with in the next page.
         * @private
         */
        this.startCutIndex = -1;
        this.getResources = arg2;
        this.canvasSize = arg1;
        if (arg3 instanceof PdfStreamWriter) {
            this.pdfStreamWriter = arg3;
        }
        else {
            this.pdfStreamWriter = new PdfStreamWriter(arg3);
        }
        this.initialize();
    }
    Object.defineProperty(PdfGraphics.prototype, "stringLayoutResult", {
        //  Properties
        /**
         * Returns the `result` after drawing string.
         * @private
         */
        get: function () {
            return this.pdfStringLayoutResult;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphics.prototype, "size", {
        /**
         * Gets the `size` of the canvas.
         * @private
         */
        get: function () {
            return this.canvasSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphics.prototype, "mediaBoxUpperRightBound", {
        /**
         * Gets and Sets the value of `MediaBox upper right bound`.
         * @private
         */
        get: function () {
            if (typeof this.internalMediaBoxUpperRightBound === 'undefined') {
                this.internalMediaBoxUpperRightBound = 0;
            }
            return this.internalMediaBoxUpperRightBound;
        },
        set: function (value) {
            this.internalMediaBoxUpperRightBound = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphics.prototype, "clientSize", {
        /**
         * Gets the `size` of the canvas reduced by margins and page templates.
         * @private
         */
        get: function () {
            return new SizeF(this.clipBounds.width, this.clipBounds.height);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphics.prototype, "colorSpace", {
        /**
         * Gets or sets the current `color space` of the document
         * @private
         */
        get: function () {
            return this.currentColorSpace;
        },
        set: function (value) {
            this.currentColorSpace = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphics.prototype, "streamWriter", {
        /**
         * Gets the `stream writer`.
         * @private
         */
        get: function () {
            return this.pdfStreamWriter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphics.prototype, "matrix", {
        /**
         * Gets the `transformation matrix` reflecting current transformation.
         * @private
         */
        get: function () {
            if (this.transformationMatrix == null) {
                this.transformationMatrix = new PdfTransformationMatrix();
            }
            return this.transformationMatrix;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphics.prototype, "layer", {
        /**
         * Gets the `layer` for the graphics, if exists.
         * @private
         */
        get: function () {
            return this.pageLayer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphics.prototype, "page", {
        /**
         * Gets the `page` for this graphics, if exists.
         * @private
         */
        get: function () {
            return this.pageLayer.page;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphics.prototype, "automaticFields", {
        get: function () {
            if (this.internalAutomaticFields == null || typeof this.internalAutomaticFields === 'undefined') {
                this.internalAutomaticFields = new PdfAutomaticFieldInfoCollection();
            }
            return this.internalAutomaticFields;
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    /**
     * `Initializes` this instance.
     * @private
     */
    PdfGraphics.prototype.initialize = function () {
        this.bStateSaved = false;
        this.currentPen = null;
        this.currentBrush = null;
        this.currentFont = null;
        this.currentColorSpace = PdfColorSpace.Rgb;
        this.bCSInitialized = false;
        this.transformationMatrix = null;
        this.previousTextRenderingMode = (-1); //.Fill;
        this.previousCharacterSpacing = -1.0;
        this.previousWordSpacing = -1.0;
        this.previousTextScaling = -100.0;
        // this.m_trasparencies = null;
        this.currentStringFormat = null;
        this.clipBounds = new RectangleF(new PointF(0, 0), this.size);
        this.getResources.getResources().requireProcedureSet(this.procedureSets.pdf);
    };
    PdfGraphics.prototype.drawPdfTemplate = function (template, location, size) {
        if (typeof size === 'undefined') {
            if (template == null) {
                throw Error('ArgumentNullException-template');
            }
            this.drawPdfTemplate(template, location, template.size);
        }
        else {
            // let crossTable : PdfCrossTable = null;
            // if (this.pageLayer != null) {
            //     crossTable = (this.page as PdfPage).section.parentDocument.crossTable;
            // }
            if (template == null) {
                throw Error('ArgumentNullException-template');
            }
            var scaleX = (template.width > 0) ? size.width / template.width : 1;
            var scaleY = (template.height > 0) ? size.height / template.height : 1;
            var bNeedScale = !(scaleX === 1 && scaleY === 1);
            // Save state.
            var state = this.save();
            // Take into consideration that rect location is bottom/left.
            var matrix = new PdfTransformationMatrix();
            if (this.pageLayer != null) {
                this.getTranslateTransform(location.x, location.y + size.height, matrix);
            }
            if (bNeedScale) {
                this.getScaleTransform(scaleX, scaleY, matrix);
            }
            this.pdfStreamWriter.modifyCtm(matrix);
            // Output template.
            var resources = this.getResources.getResources();
            var name_1 = resources.getName(template);
            this.pdfStreamWriter.executeObject(name_1);
            // Restore state.
            this.restore(state);
            //Transfer automatic fields from template.
            var g = template.graphics;
            if (g != null) {
                for (var index = 0; index < g.automaticFields.automaticFields.length; index++) {
                    var fieldInfo = g.automaticFields.automaticFields[index];
                    var newLocation = new PointF(fieldInfo.location.x + location.x, fieldInfo.location.y + location.y);
                    var scalingX = template.size.width == 0 ? 0 : size.width / template.size.width;
                    var scalingY = template.size.height == 0 ? 0 : size.height / template.size.height;
                    this.automaticFields.add(new PdfAutomaticFieldInfo(fieldInfo.field, newLocation, scalingX, scalingY));
                    this.page.dictionary.modify();
                }
            }
            this.getResources.getResources().requireProcedureSet(this.procedureSets.imageB);
            this.getResources.getResources().requireProcedureSet(this.procedureSets.imageC);
            this.getResources.getResources().requireProcedureSet(this.procedureSets.imageI);
            this.getResources.getResources().requireProcedureSet(this.procedureSets.text);
        }
    };
    /* tslint:disable */
    /**
     * @public
     */
    PdfGraphics.prototype.drawString = function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        if (typeof arg1 === 'string' && arg2 instanceof PdfFont && (arg3 instanceof PdfPen || arg3 === null) && (arg4 instanceof PdfBrush || arg4 === null) && typeof arg5 === 'number' && typeof arg6 === 'number' && (arg7 instanceof PdfStringFormat || arg7 === null) && typeof arg8 === 'undefined') {
            this.isOverloadWithPosition = true;
            this.drawString(arg1, arg2, arg3, arg4, arg5, arg6, (this.clientSize.width - arg5), 0, arg7);
        }
        else {
            var temparg3 = arg3;
            var temparg4 = arg4;
            var temparg5 = arg5;
            var temparg6 = arg6;
            var temparg7 = arg7;
            var temparg8 = arg8;
            var temparg9 = arg9;
            var layouter = new PdfStringLayouter();
            var result = layouter.layout(arg1, arg2, temparg9, new SizeF(temparg7, temparg8), this.isOverloadWithPosition, this.clientSize);
            if (!result.empty) {
                var rect = this.checkCorrectLayoutRectangle(result.actualSize, temparg5, temparg6, temparg9);
                if (temparg7 <= 0) {
                    temparg5 = rect.x;
                    temparg7 = rect.width;
                }
                if (temparg8 <= 0) {
                    temparg6 = rect.y;
                    temparg8 = rect.height;
                }
                this.drawStringLayoutResult(result, arg2, temparg3, temparg4, new RectangleF(temparg5, temparg6, temparg7, temparg8), temparg9);
                this.isEmfTextScaled = false;
                this.emfScalingFactor = new SizeF(0, 0);
            }
            this.getResources.getResources().requireProcedureSet(this.procedureSets.text);
            this.isNormalRender = true;
            this.pdfStringLayoutResult = result;
            this.isUseFontSize = false;
        }
    }; /* tslint:enable */
    PdfGraphics.prototype.drawLine = function (arg1, arg2, arg3, arg4, arg5) {
        if (arg2 instanceof PointF) {
            var temparg2 = arg2;
            var temparg3 = arg3;
            this.drawLine(arg1, temparg2.x, temparg2.y, temparg3.x, temparg3.y);
        }
        else {
            var temparg2 = arg2;
            var temparg3 = arg3;
            var temparg4 = arg4;
            var temparg5 = arg5;
            this.stateControl(arg1, null, null);
            var sw = this.streamWriter;
            sw.beginPath(temparg2, temparg3);
            sw.appendLineSegment(temparg4, temparg5);
            sw.strokePath();
            this.getResources.getResources().requireProcedureSet(this.procedureSets.pdf);
        }
    };
    /* tslint:disable */
    PdfGraphics.prototype.drawRectangle = function (arg1, arg2, arg3, arg4, arg5, arg6) {
        if (arg1 instanceof PdfPen && typeof arg2 === 'number') {
            var temparg3 = arg3;
            this.drawRectangle(arg1, null, arg2, temparg3, arg4, arg5);
        }
        else if (arg1 instanceof PdfBrush && typeof arg2 === 'number') {
            var temparg3 = arg3;
            this.drawRectangle(null, arg1, arg2, temparg3, arg4, arg5);
        }
        else {
            var temparg3 = arg3;
            var temparg4 = arg4;
            var temparg5 = arg5;
            var temparg6 = arg6;
            if ((arg2 instanceof PdfTilingBrush)) {
                this.bCSInitialized = false;
                var xOffset = (this.matrix.matrix.offsetX + temparg3);
                var yOffset = void 0;
                if (((this.layer != null) && (this.layer.page != null))) {
                    yOffset = ((this.layer.page.size.height - this.matrix.matrix.offsetY) + temparg4);
                }
                else {
                    yOffset = ((this.clientSize.height - this.matrix.matrix.offsetY) + temparg4);
                }
                (arg2).location = new PointF(xOffset, yOffset);
                (arg2).graphics.colorSpace = this.colorSpace;
            }
            else if ((arg2 instanceof PdfGradientBrush)) {
                arg2.colorSpace = this.colorSpace;
            }
            if (arg2 instanceof PdfSolidBrush && arg2.color.isEmpty) {
                arg2 = null;
            }
            var temparg1 = arg1;
            var temparg2 = arg2;
            this.stateControl(temparg1, temparg2, null);
            this.streamWriter.appendRectangle(temparg3, temparg4, temparg5, temparg6);
            this.drawPathHelper(temparg1, temparg2, false);
        }
    };
    PdfGraphics.prototype.drawPathHelper = function (arg1, arg2, arg3, arg4) {
        if (typeof arg3 === 'boolean') {
            var temparg3 = arg3;
            this.drawPathHelper(arg1, arg2, PdfFillMode.Winding, temparg3);
        }
        else {
            var temparg3 = arg3;
            var temparg4 = arg4;
            var isPen = arg1 != null;
            var isBrush = arg2 != null;
            var isEvenOdd = (temparg3 === PdfFillMode.Alternate);
            if (isPen && isBrush) {
                this.streamWriter.fillStrokePath(isEvenOdd);
            }
            else if (!isPen && !isBrush) {
                this.streamWriter.endPath();
            }
            else if (isPen) {
                this.streamWriter.strokePath();
            }
            else {
                this.streamWriter.fillPath(isEvenOdd);
            }
        }
    };
    /* tslint:disable */
    PdfGraphics.prototype.drawImage = function (arg1, arg2, arg3, arg4, arg5) {
        if (typeof arg2 === 'number' && typeof arg3 === 'number' && typeof arg4 === 'undefined') {
            var size = arg1.physicalDimension;
            this.drawImage(arg1, arg2, arg3, size.width, size.height);
        }
        else {
            var temparg2 = arg2;
            var temparg3 = arg3;
            var temparg4 = arg4;
            var temparg5 = arg5;
            arg1.save();
            var matrix = new PdfTransformationMatrix();
            this.getTranslateTransform(temparg2, (temparg3 + temparg5), matrix);
            this.getScaleTransform(arg4, arg5, matrix);
            this.pdfStreamWriter.write('q');
            this.pdfStreamWriter.modifyCtm(matrix);
            // Output template.
            var resources = this.getResources.getResources();
            if (typeof this.pageLayer !== 'undefined' && this.page != null) {
                resources.document = this.page.document;
            }
            var name_2 = resources.getName(arg1);
            if (typeof this.pageLayer !== 'undefined') {
                this.page.setResources(resources);
            }
            this.pdfStreamWriter.executeObject(name_2);
            this.pdfStreamWriter.write(Operators.restoreState);
            this.pdfStreamWriter.write(Operators.newLine);
            var resource = this.getResources.getResources();
            resource.requireProcedureSet(this.procedureSets.imageB);
            resource.requireProcedureSet(this.procedureSets.imageC);
            resource.requireProcedureSet(this.procedureSets.imageI);
            resource.requireProcedureSet(this.procedureSets.text);
        }
    };
    //Implementation
    /* tslint:disable */
    /**
     * Returns `bounds` of the line info.
     * @private
     */
    PdfGraphics.prototype.getLineBounds = function (lineIndex, result, font, layoutRectangle, format) {
        var bounds;
        if (!result.empty && lineIndex < result.lineCount && lineIndex >= 0) {
            var line = result.lines[lineIndex];
            var vShift = this.getTextVerticalAlignShift(result.actualSize.height, layoutRectangle.height, format);
            var y = vShift + layoutRectangle.y + (result.lineHeight * lineIndex);
            var lineWidth = line.width;
            var hShift = this.getHorizontalAlignShift(lineWidth, layoutRectangle.width, format);
            var lineIndent = this.getLineIndent(line, format, layoutRectangle, (lineIndex === 0));
            hShift += (!this.rightToLeft(format)) ? lineIndent : 0;
            var x = layoutRectangle.x + hShift;
            /* tslint:disable */
            var width = (!this.shouldJustify(line, layoutRectangle.width, format)) ? lineWidth - lineIndent : layoutRectangle.width - lineIndent; /* tslint:enable */
            var height = result.lineHeight;
            bounds = new RectangleF(x, y, width, height);
        }
        else {
            bounds = new RectangleF(0, 0, 0, 0);
        }
        return bounds;
    };
    /**
     * Creates `lay outed rectangle` depending on the text settings.
     * @private
     */
    PdfGraphics.prototype.checkCorrectLayoutRectangle = function (textSize, x, y, format) {
        var layoutedRectangle = new RectangleF(x, y, textSize.width, textSize.width);
        if (format != null) {
            switch (format.alignment) {
                case PdfTextAlignment.Center:
                    layoutedRectangle.x -= layoutedRectangle.width / 2;
                    break;
                case PdfTextAlignment.Right:
                    layoutedRectangle.x -= layoutedRectangle.width;
                    break;
            }
            switch (format.lineAlignment) {
                case PdfVerticalAlignment.Middle:
                    layoutedRectangle.y -= layoutedRectangle.height / 2;
                    break;
                case PdfVerticalAlignment.Bottom:
                    layoutedRectangle.y -= layoutedRectangle.height;
                    break;
            }
        }
        return layoutedRectangle;
    };
    /**
     * Sets the `layer` for the graphics.
     * @private
     */
    PdfGraphics.prototype.setLayer = function (layer) {
        this.pageLayer = layer;
        var page = layer.page;
        if (page != null && typeof page !== 'undefined') {
            page.beginSave = this.pageSave;
        }
    };
    /**
     * Adding page number field before page saving.
     * @private
     */
    /* tslint:disable */
    PdfGraphics.prototype.pageSave = function (page) {
        if (page.graphics.automaticFields != null) {
            for (var i = 0; i < page.graphics.automaticFields.automaticFields.length; i++) {
                var fieldInfo = page.graphics.automaticFields.automaticFields[i];
                fieldInfo.field.performDraw(page.graphics, fieldInfo.location, fieldInfo.scalingX, fieldInfo.scalingY);
            }
        }
    };
    /**
     * `Draws a layout result`.
     * @private
     */
    PdfGraphics.prototype.drawStringLayoutResult = function (result, font, pen, brush, layoutRectangle, format) {
        if (!result.empty) {
            this.applyStringSettings(font, pen, brush, format, layoutRectangle);
            // Set text scaling
            var textScaling = (format != null) ? format.horizontalScalingFactor : 100.0;
            if (textScaling !== this.previousTextScaling && !this.isEmfTextScaled) {
                this.pdfStreamWriter.setTextScaling(textScaling);
                this.previousTextScaling = textScaling;
            }
            var height = (format == null || format.lineSpacing === 0) ? font.height : format.lineSpacing + font.height;
            var subScript = (format != null && format.subSuperScript === PdfSubSuperScript.SubScript);
            var shift = 0;
            shift = (subScript) ? height - (font.height + font.metrics.getDescent(format)) : (height - font.metrics.getAscent(format));
            this.shift = shift;
            this.pdfStreamWriter.startNextLine(layoutRectangle.x, layoutRectangle.y - shift);
            this.pdfStreamWriter.setLeading(+height);
            var resultHeight = 0;
            var remainingString = '';
            for (var i = 0; i < result.lines.length; i++) {
                resultHeight += result.lineHeight;
                if ((layoutRectangle.y + resultHeight) > this.clientSize.height) {
                    this.startCutIndex = i;
                    break;
                }
            }
            for (var j = this.startCutIndex; (j < result.lines.length && j >= 0); j++) {
                remainingString += result.lines[j].text;
            }
            var bounds = new RectangleF(layoutRectangle.x, layoutRectangle.y, layoutRectangle.width, layoutRectangle.height);
            this.drawLayoutResult(result, font, format, layoutRectangle);
            this.underlineStrikeoutText(pen, brush, result, font, bounds, format);
            this.isEmfPlus = false;
            this.isUseFontSize = false;
            if (this.startCutIndex !== -1) {
                var page = this.getNextPage();
                page.graphics.drawString(remainingString, font, pen, brush, layoutRectangle.x, 0, layoutRectangle.width, 0, format);
            }
        }
        else {
            throw new Error('ArgumentNullException:result');
        }
    };
    /**
     * Gets the `next page`.
     * @private
     */
    PdfGraphics.prototype.getNextPage = function () {
        var section = this.currentPage.section;
        var nextPage = null;
        var index = section.indexOf(this.currentPage);
        if (index === section.count - 1) {
            nextPage = section.add();
        }
        else {
            nextPage = section.getPages()[index + 1];
        }
        return nextPage;
    };
    PdfGraphics.prototype.setClip = function (rectangle, mode) {
        if (typeof mode === 'undefined') {
            this.setClip(rectangle, PdfFillMode.Winding);
        }
        else {
            this.pdfStreamWriter.appendRectangle(rectangle);
            this.pdfStreamWriter.clipPath((mode === PdfFillMode.Alternate));
        }
    };
    /**
     * Applies all the `text settings`.
     * @private
     */
    PdfGraphics.prototype.applyStringSettings = function (font, pen, brush, format, bounds) {
        if (brush instanceof PdfTilingBrush) {
            this.bCSInitialized = false;
            brush.graphics.colorSpace = this.colorSpace;
        }
        else if ((brush instanceof PdfGradientBrush)) {
            this.bCSInitialized = false;
            brush.colorSpace = this.colorSpace;
        }
        var setLineWidth = false;
        var tm = this.getTextRenderingMode(pen, brush, format);
        this.stateControl(pen, brush, font, format);
        this.pdfStreamWriter.beginText();
        if ((tm) !== this.previousTextRenderingMode) {
            this.pdfStreamWriter.setTextRenderingMode(tm);
            this.previousTextRenderingMode = tm;
        }
        // Set character spacing.
        var cs = (format != null) ? format.characterSpacing : 0;
        if (cs !== this.previousCharacterSpacing && !this.isEmfTextScaled) {
            this.pdfStreamWriter.setCharacterSpacing(cs);
            this.previousCharacterSpacing = cs;
        }
        // Set word spacing.
        // NOTE: it works only if the space code is equal to 32 (0x20).
        var ws = (format != null) ? format.wordSpacing : 0;
        if (ws !== this.previousWordSpacing) {
            this.pdfStreamWriter.setWordSpacing(ws);
            this.previousWordSpacing = ws;
        }
    };
    /**
     * Calculates `shift value` if the text is vertically aligned.
     * @private
     */
    PdfGraphics.prototype.getTextVerticalAlignShift = function (textHeight, boundsHeight, format) {
        var shift = 0;
        if (boundsHeight >= 0 && format != null && format.lineAlignment !== PdfVerticalAlignment.Top) {
            switch (format.lineAlignment) {
                case PdfVerticalAlignment.Middle:
                    shift = (boundsHeight - textHeight) / 2;
                    break;
                case PdfVerticalAlignment.Bottom:
                    shift = boundsHeight - textHeight;
                    break;
            }
        }
        return shift;
    };
    /* tslint:disable */
    /**
     * `Draws layout result`.
     * @private
     */
    PdfGraphics.prototype.drawLayoutResult = function (result, font, format, layoutRectangle) {
        var vAlignShift = this.getTextVerticalAlignShift(result.actualSize.height, layoutRectangle.height, format);
        if (vAlignShift !== 0) {
            this.pdfStreamWriter.startNextLine(0, vAlignShift);
        }
        var ttfFont = font;
        var unicode = (ttfFont != null && ttfFont.isUnicode);
        var embed = (ttfFont != null && ttfFont.isEmbedFont);
        var lines = result.lines;
        for (var i = 0, len = lines.length; (i < len && i !== this.startCutIndex); i++) {
            var lineInfo = lines[i];
            var line = lineInfo.text;
            var lineWidth = lineInfo.width;
            var hAlignShift = this.getHorizontalAlignShift(lineWidth, layoutRectangle.width, format);
            var lineIndent = this.getLineIndent(lineInfo, format, layoutRectangle, (i === 0));
            hAlignShift += (!this.rightToLeft(format)) ? lineIndent : 0;
            if (hAlignShift !== 0 && !this.isEmfTextScaled) {
                this.pdfStreamWriter.startNextLine(hAlignShift, 0);
            }
            if (unicode) {
                this.drawUnicodeLine(lineInfo, layoutRectangle, font, format);
            }
            else {
                this.drawAsciiLine(lineInfo, layoutRectangle, font, format);
            }
            if (hAlignShift !== 0 && !this.isEmfTextScaled) {
                this.pdfStreamWriter.startNextLine(-hAlignShift, 0);
            }
            if (this.isOverloadWithPosition && lines.length > 1) {
                this.pdfStreamWriter.startNextLine(-(layoutRectangle.x), 0);
                layoutRectangle.x = 0;
                layoutRectangle.width = this.clientSize.width;
                this.isOverloadWithPosition = false;
                this.isPointOverload = true;
            }
        }
        this.getResources.getResources().requireProcedureSet(this.procedureSets.text);
        if (vAlignShift !== 0) {
            this.pdfStreamWriter.startNextLine(0, -(vAlignShift - result.lineHeight));
        }
        this.pdfStreamWriter.endText();
    };
    /**
     * `Draws Ascii line`.
     * @private
     */
    PdfGraphics.prototype.drawAsciiLine = function (lineInfo, layoutRectangle, font, format) {
        this.justifyLine(lineInfo, layoutRectangle.width, format);
        var value = '';
        if (lineInfo.text.indexOf('(') !== -1 || lineInfo.text.indexOf(')') !== -1) {
            for (var i = 0; i < lineInfo.text.length; i++) {
                if (lineInfo.text[i] === '(') {
                    value += '\\\(';
                }
                else if (lineInfo.text[i] === ')') {
                    value += '\\\)';
                }
                else {
                    value += lineInfo.text[i];
                }
            }
        }
        if (value === '') {
            value = lineInfo.text;
        }
        var line = '(' + value + ')';
        this.pdfStreamWriter.showNextLineText(new PdfString(line));
    };
    /**
     * Draws unicode line.
     * @private
     */
    PdfGraphics.prototype.drawUnicodeLine = function (lineInfo, layoutRectangle, font, format) {
        var line = lineInfo.text;
        var lineWidth = lineInfo.width;
        var rtl = (format !== null && typeof format !== 'undefined' && format.rightToLeft);
        var useWordSpace = (format !== null && typeof format !== 'undefined' && (format.wordSpacing !== 0 || format.alignment === PdfTextAlignment.Justify));
        var ttfFont = font;
        var wordSpacing = this.justifyLine(lineInfo, layoutRectangle.width, format);
        var rtlRender = new RtlRenderer();
        if (rtl || (format !== null && typeof format !== 'undefined' && format.textDirection !== PdfTextDirection.None)) {
            var blocks = null;
            var rightAlign = (format !== null && typeof format !== 'undefined' && format.alignment === PdfTextAlignment.Right);
            if (format !== null && typeof format !== 'undefined' && format.textDirection !== PdfTextDirection.None) {
                /* tslint:disable-next-line:max-line-length */
                blocks = rtlRender.layout(line, ttfFont, (format.textDirection === PdfTextDirection.RightToLeft) ? true : false, useWordSpace, format);
            }
            else {
                blocks = rtlRender.layout(line, ttfFont, rightAlign, useWordSpace, format);
            }
            var words = null;
            if (blocks.length > 1) {
                if (format !== null && typeof format !== 'undefined' && format.textDirection !== PdfTextDirection.None) {
                    /* tslint:disable-next-line:max-line-length */
                    words = rtlRender.splitLayout(line, ttfFont, (format.textDirection === PdfTextDirection.RightToLeft) ? true : false, useWordSpace, format);
                }
                else {
                    words = rtlRender.splitLayout(line, ttfFont, rightAlign, useWordSpace, format);
                }
            }
            else {
                words = [line];
            }
            this.drawUnicodeBlocks(blocks, words, ttfFont, format, wordSpacing);
        }
        else {
            if (useWordSpace) {
                var result = this.breakUnicodeLine(line, ttfFont, null);
                var blocks = result.tokens;
                var words = result.words;
                this.drawUnicodeBlocks(blocks, words, ttfFont, format, wordSpacing);
            }
            else {
                var token = this.convertToUnicode(line, ttfFont);
                var value = this.getUnicodeString(token);
                this.streamWriter.showNextLineText(value);
            }
        }
    };
    /**
     * Draws array of unicode tokens.
     */
    /* tslint:disable */
    PdfGraphics.prototype.drawUnicodeBlocks = function (blocks, words, font, format, wordSpacing) {
        /* tslint:enable */
        if (blocks == null) {
            throw new Error('Argument Null Exception : blocks');
        }
        if (words == null) {
            throw new Error('Argument Null Exception : words');
        }
        if (font == null) {
            throw new Error('Argument Null Exception : font');
        }
        this.streamWriter.startNextLine();
        var x = 0;
        var xShift = 0;
        var firstLineIndent = 0;
        var paragraphIndent = 0;
        try {
            if (format !== null && typeof format !== 'undefined') {
                firstLineIndent = format.firstLineIndent;
                paragraphIndent = format.paragraphIndent;
                format.firstLineIndent = 0;
                format.paragraphIndent = 0;
            }
            var spaceWidth = font.getCharWidth(StringTokenizer.whiteSpace, format) + wordSpacing;
            var characterSpacing = (format != null) ? format.characterSpacing : 0;
            var wordSpace = (format !== null && typeof format !== 'undefined' && wordSpacing === 0) ? format.wordSpacing : 0;
            spaceWidth += characterSpacing + wordSpace;
            for (var i = 0; i < blocks.length; i++) {
                var token = blocks[i];
                var word = words[i];
                var tokenWidth = 0;
                if (x !== 0) {
                    this.streamWriter.startNextLine(x, 0);
                }
                if (word.length > 0) {
                    tokenWidth += /*Utils.Round(*/ font.measureString(word, format).width /*)*/;
                    tokenWidth += characterSpacing;
                    var val = this.getUnicodeString(token);
                    this.streamWriter.showText(val);
                }
                if (i !== blocks.length - 1) {
                    x = tokenWidth + spaceWidth;
                    xShift += x;
                }
            }
            // Rolback current line position.
            if (xShift > 0) {
                this.streamWriter.startNextLine(-xShift, 0);
            }
        }
        finally {
            if (format !== null && typeof format !== 'undefined') {
                format.firstLineIndent = firstLineIndent;
                format.paragraphIndent = paragraphIndent;
            }
        }
    };
    /**
     * Breakes the unicode line to the words and converts symbols to glyphs.
     */
    PdfGraphics.prototype.breakUnicodeLine = function (line, ttfFont, words) {
        if (line === null) {
            throw new Error('Argument Null Exception : line');
        }
        words = line.split(null);
        var tokens = [];
        for (var i = 0; i < words.length; i++) {
            // Reconvert string according to unicode standard.
            var word = words[i];
            var token = this.convertToUnicode(word, ttfFont);
            tokens[i] = token;
        }
        return { tokens: tokens, words: words };
    };
    /**
     * Creates PdfString from the unicode text.
     */
    PdfGraphics.prototype.getUnicodeString = function (token) {
        if (token === null) {
            throw new Error('Argument Null Exception : token');
        }
        var val = new PdfString(token);
        val.converted = true;
        val.encode = InternalEnum.ForceEncoding.Ascii;
        return val;
    };
    /**
     * Converts to unicode format.
     */
    PdfGraphics.prototype.convertToUnicode = function (text, ttfFont) {
        var token = null;
        if (text == null) {
            throw new Error('Argument Null Exception : text');
        }
        if (ttfFont == null) {
            throw new Error('Argument Null Exception : ttfFont');
        }
        if (ttfFont.fontInternal instanceof UnicodeTrueTypeFont) {
            var ttfReader = ttfFont.fontInternal.ttfReader;
            ttfFont.setSymbols(text);
            token = ttfReader.convertString(text);
            var bytes = PdfString.toUnicodeArray(token, false);
            token = PdfString.byteToString(bytes);
        }
        return token;
    };
    /**
     * `Justifies` the line if needed.
     * @private
     */
    PdfGraphics.prototype.justifyLine = function (lineInfo, boundsWidth, format) {
        var line = lineInfo.text;
        var lineWidth = lineInfo.width;
        var shouldJustify = this.shouldJustify(lineInfo, boundsWidth, format);
        var hasWordSpacing = (format != null && format.wordSpacing !== 0);
        var symbols = StringTokenizer.spaces;
        var whitespacesCount = StringTokenizer.getCharsCount(line, symbols);
        var wordSpace = 0;
        if (shouldJustify) {
            // Correct line width.
            if (hasWordSpacing) {
                lineWidth -= (whitespacesCount * format.wordSpacing);
            }
            var difference = boundsWidth - lineWidth;
            wordSpace = difference / whitespacesCount;
            this.pdfStreamWriter.setWordSpacing(wordSpace);
        }
        else {
            // If there is justifying, but the line shouldn't be justified, restore default word spacing.
            if (hasWordSpacing) {
                this.pdfStreamWriter.setWordSpacing(format.wordSpacing);
            }
            else {
                this.pdfStreamWriter.setWordSpacing(0);
            }
        }
        return wordSpace;
    };
    /**
     * `Reset` or reinitialize the current graphic value.
     * @private
     */
    PdfGraphics.prototype.reset = function (size) {
        this.canvasSize = size;
        this.streamWriter.clear();
        this.initialize();
        this.initializeCoordinates();
    };
    /**
     * Checks whether the line should be `justified`.
     * @private
     */
    PdfGraphics.prototype.shouldJustify = function (lineInfo, boundsWidth, format) {
        var line = lineInfo.text;
        var lineWidth = lineInfo.width;
        var justifyStyle = (format != null && format.alignment === PdfTextAlignment.Justify);
        var goodWidth = (boundsWidth >= 0 && lineWidth < boundsWidth);
        var symbols = StringTokenizer.spaces;
        var whitespacesCount = StringTokenizer.getCharsCount(line, symbols);
        var hasSpaces = (whitespacesCount > 0 && line[0] !== StringTokenizer.whiteSpace);
        var goodLineBreakStyle = ((lineInfo.lineType & LineType.LayoutBreak) > 0);
        /* tslint:disable */
        var shouldJustify = (justifyStyle && goodWidth && hasSpaces && (goodLineBreakStyle || format.alignment === PdfTextAlignment.Justify)); /* tslint:enable */
        return shouldJustify;
    };
    /* tslint:disable */
    /**
     * Emulates `Underline, Strikeout` of the text if needed.
     * @private
     */
    PdfGraphics.prototype.underlineStrikeoutText = function (pen, brush, result, font, layoutRectangle, format) {
        if (font.underline || font.strikeout) {
            // Calculate line width.
            var linePen = this.createUnderlineStikeoutPen(pen, brush, font, format);
            if (linePen != null) {
                // Approximate line positions.
                var vShift = this.getTextVerticalAlignShift(result.actualSize.height, layoutRectangle.height, format);
                var underlineYOffset = 0;
                underlineYOffset = layoutRectangle.y + vShift + font.metrics.getAscent(format) + 1.5 * linePen.width;
                var strikeoutYOffset = layoutRectangle.y + vShift + font.metrics.getHeight(format) / 2 + 1.5 * linePen.width;
                var lines = result.lines;
                // Run through the text and draw lines.
                for (var i = 0, len = result.lineCount; i < len; i++) {
                    var lineInfo = lines[i];
                    var line = lineInfo.text;
                    var lineWidth = lineInfo.width;
                    var hShift = this.getHorizontalAlignShift(lineWidth, layoutRectangle.width, format);
                    var lineIndent = this.getLineIndent(lineInfo, format, layoutRectangle, (i === 0));
                    hShift += (!this.rightToLeft(format)) ? lineIndent : 0;
                    var x1 = layoutRectangle.x + hShift;
                    /* tslint:disable */
                    var x2 = (!this.shouldJustify(lineInfo, layoutRectangle.width, format)) ? x1 + lineWidth - lineIndent : x1 + layoutRectangle.width - lineIndent;
                    /* tslint:enable */
                    if (font.underline) {
                        var y = underlineYOffset;
                        this.drawLine(linePen, x1, y, x2, y);
                        underlineYOffset += result.lineHeight;
                    }
                    if (font.strikeout) {
                        var y = strikeoutYOffset;
                        this.drawLine(linePen, x1, y, x2, y);
                        strikeoutYOffset += result.lineHeight;
                    }
                    if (this.isPointOverload && lines.length > 1) {
                        layoutRectangle.x = 0;
                        layoutRectangle.width = this.clientSize.width;
                    }
                }
                this.isPointOverload = false;
            }
        }
    };
    /**
     * `Creates a pen` for drawing lines in the text.
     * @private
     */
    PdfGraphics.prototype.createUnderlineStikeoutPen = function (pen, brush, font, format) {
        // Calculate line width.
        var lineWidth = font.metrics.getSize(format) / 20;
        var linePen = null;
        // Create a pen fo the lines.
        if (pen != null) {
            linePen = new PdfPen(pen.color, lineWidth);
        }
        else if (brush != null) {
            linePen = new PdfPen(brush, lineWidth);
        }
        return linePen;
    };
    /**
     * Return `text rendering mode`.
     * @private
     */
    PdfGraphics.prototype.getTextRenderingMode = function (pen, brush, format) {
        var tm = TextRenderingMode.None;
        if (pen != null && brush != null) {
            tm = TextRenderingMode.FillStroke;
        }
        else if (pen != null) {
            tm = TextRenderingMode.Stroke;
        }
        else {
            tm = TextRenderingMode.Fill;
        }
        if (format != null && format.clipPath) {
            tm |= TextRenderingMode.ClipFlag;
        }
        return tm;
    };
    /**
     * Returns `line indent` for the line.
     * @private
     */
    PdfGraphics.prototype.getLineIndent = function (lineInfo, format, layoutBounds, firstLine) {
        var lineIndent = 0;
        var firstParagraphLine = ((lineInfo.lineType & LineType.FirstParagraphLine) > 0);
        if (format != null && firstParagraphLine) {
            lineIndent = (firstLine) ? format.firstLineIndent : format.paragraphIndent;
            lineIndent = (layoutBounds.width > 0) ? Math.min(layoutBounds.width, lineIndent) : lineIndent;
        }
        return lineIndent;
    };
    /**
     * Calculates shift value if the line is `horizontaly aligned`.
     * @private
     */
    PdfGraphics.prototype.getHorizontalAlignShift = function (lineWidth, boundsWidth, format) {
        var shift = 0;
        if (boundsWidth >= 0 && format != null && format.alignment !== PdfTextAlignment.Left) {
            switch (format.alignment) {
                case PdfTextAlignment.Center:
                    shift = (boundsWidth - lineWidth) / 2;
                    break;
                case PdfTextAlignment.Right:
                    shift = boundsWidth - lineWidth;
                    break;
            }
        }
        return shift;
    };
    /**
     * Gets or sets the value that indicates `text direction` mode.
     * @private
     */
    PdfGraphics.prototype.rightToLeft = function (format) {
        var rtl = (format !== null && typeof format !== 'undefined' && format.rightToLeft);
        if (format !== null && typeof format !== 'undefined') {
            if (format.textDirection !== PdfTextDirection.None && typeof format.textDirection !== 'undefined') {
                rtl = true;
            }
        }
        return rtl;
    };
    PdfGraphics.prototype.stateControl = function (pen, brush, font, format) {
        if (typeof format === 'undefined') {
            this.stateControl(pen, brush, font, null);
        }
        else {
            if (brush instanceof PdfGradientBrush) {
                this.bCSInitialized = false;
                brush.colorSpace = this.colorSpace;
            }
            if (brush instanceof PdfTilingBrush) {
                this.bCSInitialized = false;
                brush.graphics.colorSpace = this.colorSpace;
            }
            var saveState = false;
            if (brush !== null) {
                var solidBrush = brush;
                if (typeof this.pageLayer !== 'undefined' && this.pageLayer != null) {
                    if (this.colorSpaceChanged === false) {
                        this.lastDocumentCS = this.pageLayer.page.document.colorSpace;
                        this.lastGraphicsCS = this.pageLayer.page.graphics.colorSpace;
                        this.colorSpace = this.pageLayer.page.document.colorSpace;
                        this.currentColorSpace = this.pageLayer.page.document.colorSpace;
                        this.colorSpaceChanged = true;
                    }
                }
                this.initCurrentColorSpace(this.currentColorSpace);
            }
            else if (pen != null) {
                var pdfPen = pen;
                if (typeof this.pageLayer !== 'undefined' && this.pageLayer != null) {
                    /* tslint:disable */
                    this.colorSpace = this.pageLayer.page.document.colorSpace;
                    this.currentColorSpace = this.pageLayer.page.document.colorSpace;
                }
                this.initCurrentColorSpace(this.currentColorSpace);
            }
            this.penControl(pen, saveState);
            this.brushControl(brush, saveState);
            this.fontControl(font, format, saveState);
        }
    };
    /**
     * Initializes the `current color space`.
     * @private
     */
    PdfGraphics.prototype.initCurrentColorSpace = function (colorspace) {
        var re = this.getResources.getResources();
        if (!this.bCSInitialized) {
            if (this.currentColorSpace != PdfColorSpace.GrayScale) {
                this.pdfStreamWriter.setColorSpace('Device' + this.currentColorSpaces[this.currentColorSpace], true);
                this.pdfStreamWriter.setColorSpace('Device' + this.currentColorSpaces[this.currentColorSpace], false);
                this.bCSInitialized = true;
            }
            else {
                this.pdfStreamWriter.setColorSpace('DeviceGray', true);
                this.pdfStreamWriter.setColorSpace('DeviceGray', false);
                this.bCSInitialized = true;
            }
        }
    };
    /**
     * Controls the `pen state`.
     * @private
     */
    PdfGraphics.prototype.penControl = function (pen, saveState) {
        if (pen != null) {
            this.currentPen = pen;
            /* tslint:disable */
            pen.monitorChanges(this.currentPen, this.pdfStreamWriter, this.getResources, saveState, this.colorSpace, this.matrix.clone());
            /* tslint:enable */
            this.currentPen = pen.clone();
        }
    };
    /**
     * Controls the `brush state`.
     * @private
     */
    PdfGraphics.prototype.brushControl = function (brush, saveState) {
        if (brush != null && typeof brush !== 'undefined') {
            var b = brush.clone();
            var lgb = b;
            if (lgb !== null && typeof lgb !== 'undefined' && !(brush instanceof PdfSolidBrush) && !(brush instanceof PdfTilingBrush)) {
                var m = lgb.matrix;
                var matrix = this.matrix.clone();
                if ((m != null)) {
                    m.multiply(matrix);
                    matrix = m;
                }
                lgb.matrix = matrix;
            }
            this.currentBrush = lgb;
            var br = (brush);
            /* tslint:disable */
            b.monitorChanges(this.currentBrush, this.pdfStreamWriter, this.getResources, saveState, this.colorSpace);
            /* tslint:enable */
            this.currentBrush = brush;
            brush = null;
        }
    };
    /**
     * Saves the font and other `font settings`.
     * @private
     */
    PdfGraphics.prototype.fontControl = function (font, format, saveState) {
        if (font != null) {
            var curSubSuper = (format != null) ? format.subSuperScript : PdfSubSuperScript.None;
            /* tslint:disable */
            var prevSubSuper = (this.currentStringFormat != null) ? this.currentStringFormat.subSuperScript : PdfSubSuperScript.None; /* tslint:enable */
            if (saveState || font !== this.currentFont || curSubSuper !== prevSubSuper) {
                var resources = this.getResources.getResources();
                this.currentFont = font;
                this.currentStringFormat = format;
                var size = font.metrics.getSize(format);
                /* tslint:disable */
                this.isEmfTextScaled = false;
                var fontName = resources.getName(font);
                this.pdfStreamWriter.setFont(font, fontName, size);
            }
        }
    };
    PdfGraphics.prototype.setTransparency = function (arg1, arg2, arg3) {
        if (typeof arg2 === 'undefined') {
            this.istransparencySet = true;
            this.setTransparency(arg1, arg1, PdfBlendMode.Normal);
        }
        else if (typeof arg2 === 'number' && typeof arg3 === 'undefined') {
            this.setTransparency(arg1, arg2, PdfBlendMode.Normal);
        }
        else {
            if (this.trasparencies == null) {
                this.trasparencies = new TemporaryDictionary();
            }
            var transp = null;
            var td = new TransparencyData(arg1, arg2, arg3);
            if (this.trasparencies.containsKey(td)) {
                transp = this.trasparencies.getValue(td);
            }
            if (transp == null) {
                transp = new PdfTransparency(arg1, arg2, arg3);
                this.trasparencies.setValue(td, transp);
            }
            var resources = this.getResources.getResources();
            var name_3 = resources.getName(transp);
            var sw = this.streamWriter;
            sw.setGraphicsState(name_3);
        }
    };
    PdfGraphics.prototype.clipTranslateMargins = function (x, y, left, top, right, bottom) {
        if (x instanceof RectangleF && typeof y === 'undefined') {
            this.clipBounds = x;
            this.pdfStreamWriter.writeComment('Clip margins.');
            this.pdfStreamWriter.appendRectangle(x);
            this.pdfStreamWriter.closePath();
            this.pdfStreamWriter.clipPath(false);
            this.pdfStreamWriter.writeComment('Translate co-ordinate system.');
            this.translateTransform(x.x, x.y);
        }
        else if (typeof x === 'number') {
            var clipArea = new RectangleF(left, top, this.size.width - left - right, this.size.height - top - bottom);
            this.clipBounds = clipArea;
            this.pdfStreamWriter.writeComment("Clip margins.");
            this.pdfStreamWriter.appendRectangle(clipArea);
            this.pdfStreamWriter.closePath();
            this.pdfStreamWriter.clipPath(false);
            this.pdfStreamWriter.writeComment("Translate co-ordinate system.");
            this.translateTransform(x, y);
        }
    };
    /**
     * `Updates y` co-ordinate.
     * @private
     */
    PdfGraphics.prototype.updateY = function (y) {
        return -y;
    };
    /**
     * Used to `translate the transformation`.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // set pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // set translate transform
     * page1.graphics.translateTransform(100, 100);
     * //
     * // draw the rectangle after applying translate transform
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param offsetX The x-coordinate of the translation.
     * @param offsetY The y-coordinate of the translation.
     */
    PdfGraphics.prototype.translateTransform = function (offsetX, offsetY) {
        var matrix = new PdfTransformationMatrix();
        this.getTranslateTransform(offsetX, offsetY, matrix);
        this.pdfStreamWriter.modifyCtm(matrix);
        this.matrix.multiply(matrix);
    };
    /**
     * `Translates` coordinates of the input matrix.
     * @private
     */
    PdfGraphics.prototype.getTranslateTransform = function (x, y, input) {
        input.translate(x, this.updateY(y));
        return input;
    };
    /* tslint:disable */
    /**
     * Applies the specified `scaling operation` to the transformation matrix of this Graphics by prepending it to the object's transformation matrix.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // apply scaling trasformation
     * page1.graphics.scaleTransform(1.5, 2);
     * //
     * // draw the rectangle after applying scaling transform
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 100, y : 100}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param scaleX Scale factor in the x direction.
     * @param scaleY Scale factor in the y direction.
     */
    /* tslint:enable */
    PdfGraphics.prototype.scaleTransform = function (scaleX, scaleY) {
        var matrix = new PdfTransformationMatrix();
        this.getScaleTransform(scaleX, scaleY, matrix);
        this.pdfStreamWriter.modifyCtm(matrix);
        this.matrix.multiply(matrix);
    };
    /**
     * `Scales` coordinates of the input matrix.
     * @private
     */
    PdfGraphics.prototype.getScaleTransform = function (x, y, input) {
        if (input == null) {
            input = new PdfTransformationMatrix();
        }
        input.scale(x, y);
        return input;
    };
    /**
     * Applies the specified `rotation` to the transformation matrix of this Graphics.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // set RotateTransform with 25 degree of angle
     * page1.graphics.rotateTransform(25);
     * //
     * // draw the rectangle after RotateTransformation
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 100, y : 100}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param angle Angle of rotation in degrees.
     */
    PdfGraphics.prototype.rotateTransform = function (angle) {
        var matrix = new PdfTransformationMatrix();
        this.getRotateTransform(angle, matrix);
        this.pdfStreamWriter.modifyCtm(matrix);
        this.matrix.multiply(matrix);
    };
    /**
     * `Initializes coordinate system`.
     * @private
     */
    PdfGraphics.prototype.initializeCoordinates = function () {
        // Matrix equation: TM(T-1)=M', where T=[1 0 0 -1 0 h]
        this.pdfStreamWriter.writeComment('Change co-ordinate system to left/top.');
        // Translate co-ordinates only, don't flip.
        if (this.mediaBoxUpperRightBound !== -(this.size.height)) {
            if (this.cropBox == null) {
                if (this.mediaBoxUpperRightBound === this.size.height || this.mediaBoxUpperRightBound === 0) {
                    this.translateTransform(0, this.updateY(this.size.height));
                }
                else {
                    this.translateTransform(0, this.updateY(this.mediaBoxUpperRightBound));
                }
            }
        }
    };
    /**
     * `Rotates` coordinates of the input matrix.
     * @private
     */
    PdfGraphics.prototype.getRotateTransform = function (angle, input) {
        if (input == null || typeof input === 'undefined') {
            input = new PdfTransformationMatrix();
        }
        input.rotate(this.updateY(angle));
        return input;
    };
    /**
     * `Saves` the current state of this Graphics and identifies the saved state with a GraphicsState.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // save the graphics state
     * let state1 : PdfGraphicsState = page1.graphics.save();
     * //
     * page1.graphics.scaleTransform(1.5, 2);
     * // draw the rectangle
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 100, y : 100}, {width : 100, height : 50}));
     * // restore the graphics state
     * page1.graphics.restore(state1);
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    PdfGraphics.prototype.save = function () {
        var state = new PdfGraphicsState(this, this.matrix.clone());
        state.brush = this.currentBrush;
        state.pen = this.currentPen;
        state.font = this.currentFont;
        state.colorSpace = this.currentColorSpace;
        state.characterSpacing = this.previousCharacterSpacing;
        state.wordSpacing = this.previousWordSpacing;
        state.textScaling = this.previousTextScaling;
        state.textRenderingMode = this.previousTextRenderingMode;
        this.graphicsState.push(state);
        this.pdfStreamWriter.saveGraphicsState();
        return state;
    };
    PdfGraphics.prototype.restore = function (state) {
        if (typeof state === 'undefined') {
            if (this.graphicsState.length > 0) {
                this.doRestoreState();
            }
        }
        else {
            if (this.graphicsState.indexOf(state) !== -1) {
                for (;;) {
                    if (this.graphicsState.length === 0) {
                        break;
                    }
                    var popState = this.doRestoreState();
                    if (popState === state) {
                        break;
                    }
                }
            }
        }
    };
    /**
     * `Restores graphics state`.
     * @private
     */
    PdfGraphics.prototype.doRestoreState = function () {
        var state = this.graphicsState.pop();
        this.transformationMatrix = state.matrix;
        this.currentBrush = state.brush;
        this.currentPen = state.pen;
        this.currentFont = state.font;
        this.currentColorSpace = state.colorSpace;
        this.previousCharacterSpacing = state.characterSpacing;
        this.previousWordSpacing = state.wordSpacing;
        this.previousTextScaling = state.textScaling;
        this.previousTextRenderingMode = state.textRenderingMode;
        this.pdfStreamWriter.restoreGraphicsState();
        return state;
    };
    /* tslint:enable */
    /**
     * `Draws the specified path`, using its original physical size, at the location specified by a coordinate pair.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // add a page to the document.
     * let page1 : PdfPage = document.pages.add();
     * //Create new PDF path.
     * let path : PdfPath = new PdfPath();
     * //Add line path points.
     * path.addLine(new PointF(10, 100), new PointF(10, 200));
     * path.addLine(new PointF(100, 100), new PointF(100, 200));
     * path.addLine(new PointF(100, 200), new PointF(55, 150));
     * // set pen
     * let pen : PdfPen = new PdfPen(new PdfColor(255, 0, 0));
     * // set brush
     * let brush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * // draw the path
     * page1.graphics.drawPath(pen, brush, path);
     * //
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param pen Color of the text.
     * @param brush Color of the text.
     * @param path Draw path.
     */
    PdfGraphics.prototype.drawPath = function (pen, brush, path) {
        if (brush instanceof PdfTilingBrush) {
            this.bCSInitialized = false;
            brush.graphics.colorSpace = this.colorSpace;
        }
        else if (brush instanceof PdfGradientBrush) {
            this.bCSInitialized = false;
            brush.colorSpace = this.colorSpace;
        }
        this.stateControl(pen, brush, null);
        this.buildUpPath(path.pathPoints, path.pathTypes);
        this.drawPathHelper(pen, brush, path.fillMode, false);
    };
    /* tslint:disable-next-line:max-line-length */
    PdfGraphics.prototype.drawArc = function (arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        if (arg2 instanceof RectangleF) {
            this.drawArc(arg1, arg2.x, arg2.y, arg2.width, arg2.height, arg3, arg4);
        }
        else {
            if ((arg7 !== 0)) {
                this.stateControl(arg1, null, null);
                this.constructArcPath(arg2, arg3, (arg2 + arg4), (arg3 + arg5), arg6, arg7);
                this.drawPathHelper(arg1, null, false);
            }
        }
    };
    /**
     * Builds up the path.
     * @private
     */
    PdfGraphics.prototype.buildUpPath = function (arg1, arg2) {
        var cnt = arg1.length;
        for (var i = 0; i < cnt; ++i) {
            var typeValue = 0;
            var point = arg1[i];
            switch (((arg2[i] & (PdfGraphics.pathTypesValuesMask)))) {
                case PathPointType.Start:
                    this.pdfStreamWriter.beginPath(point.x, point.y);
                    break;
                case PathPointType.Bezier3:
                    var p2 = new PointF(0, 0);
                    var p3 = new PointF(0, 0);
                    var result1 = this.getBezierPoints(arg1, arg2, i, p2, p3);
                    this.pdfStreamWriter.appendBezierSegment(point, result1.p2, result1.p3);
                    i = result1.i;
                    break;
                case PathPointType.Line:
                    this.pdfStreamWriter.appendLineSegment(point);
                    break;
                default:
                    throw new Error('ArithmeticException - Incorrect path formation.');
            }
            typeValue = arg2[i];
            this.checkFlags(typeValue);
        }
    };
    /**
     * Gets the bezier points from respective arrays.
     * @private
     */
    /* tslint:disable-next-line:max-line-length */
    PdfGraphics.prototype.getBezierPoints = function (points, types, i, p2, p3) {
        var errorMsg = 'Malforming path.';
        ++i;
        if ((((types[i] & PdfGraphics.pathTypesValuesMask)) === PathPointType.Bezier3)) {
            p2 = points[i];
            ++i;
            if ((((types[i] & PdfGraphics.pathTypesValuesMask)) === PathPointType.Bezier3)) {
                p3 = points[i];
            }
            else {
                throw new Error('ArgumentException : errorMsg');
            }
        }
        else {
            throw new Error('ArgumentException : errorMsg');
        }
        return { i: i, p2: p2, p3: p3 };
    };
    /**
     * Checks path point type flags.
     * @private
     */
    PdfGraphics.prototype.checkFlags = function (type) {
        if ((((type & (PathPointType.CloseSubpath))) === PathPointType.CloseSubpath)) {
            this.pdfStreamWriter.closePath();
        }
    };
    /**
     * Constructs the arc path using Bezier curves.
     * @private
     */
    PdfGraphics.prototype.constructArcPath = function (x1, y1, x2, y2, startAng, sweepAngle) {
        var points = this.getBezierArc(x1, y1, x2, y2, startAng, sweepAngle);
        if ((points.length === 0)) {
            return;
        }
        var pt = [points[0], points[1], points[2], points[3], points[4], points[5], points[6], points[7]];
        this.pdfStreamWriter.beginPath(pt[0], pt[1]);
        var i = 0;
        for (i = 0; i < points.length; i = i + 8) {
            pt = [points[i], points[i + 1], points[i + 2], points[i + 3], points[i + 4], points[i + 5], points[i + 6], points[i + 7]];
            this.pdfStreamWriter.appendBezierSegment(pt[2], pt[3], pt[4], pt[5], pt[6], pt[7]);
        }
    };
    /**
     * Gets the bezier points for arc constructing.
     * @private
     */
    PdfGraphics.prototype.getBezierArc = function (numX1, numY1, numX2, numY2, s1, e1) {
        if ((numX1 > numX2)) {
            var tmp = void 0;
            tmp = numX1;
            numX1 = numX2;
            numX2 = tmp;
        }
        if ((numY2 > numY1)) {
            var tmp = void 0;
            tmp = numY1;
            numY1 = numY2;
            numY2 = tmp;
        }
        var fragAngle1;
        var numFragments;
        if ((Math.abs(e1) <= 90)) {
            fragAngle1 = e1;
            numFragments = 1;
        }
        else {
            numFragments = (Math.ceil((Math.abs(e1) / 90)));
            fragAngle1 = (e1 / numFragments);
        }
        var xcen = ((numX1 + numX2) / 2);
        var ycen = ((numY1 + numY2) / 2);
        var rx = ((numX2 - numX1) / 2);
        var ry = ((numY2 - numY1) / 2);
        var halfAng = ((fragAngle1 * (Math.PI / 360)));
        var kappa = (Math.abs(4.0 / 3.0 * (1.0 - Math.cos(halfAng)) / Math.sin(halfAng)));
        var pointsList = [];
        for (var i = 0; (i < numFragments); i++) {
            var thetaValue0 = (((s1 + (i * fragAngle1)) * (Math.PI / 180)));
            var thetaValue1 = (((s1 + ((i + 1) * fragAngle1)) * (Math.PI / 180)));
            var cos0 = (Math.cos(thetaValue0));
            var cos1 = (Math.cos(thetaValue1));
            var sin0 = (Math.sin(thetaValue0));
            var sin1 = (Math.sin(thetaValue1));
            if ((fragAngle1 > 0)) {
                /* tslint:disable-next-line:max-line-length */
                pointsList.push((xcen + (rx * cos0)), (ycen - (ry * sin0)), (xcen + (rx * (cos0 - (kappa * sin0)))), (ycen - (ry * (sin0 + (kappa * cos0)))), (xcen + (rx * (cos1 + (kappa * sin1)))), (ycen - (ry * (sin1 - (kappa * cos1)))), (xcen + (rx * cos1)), (ycen - (ry * sin1)));
            }
            else {
                /* tslint:disable-next-line:max-line-length */
                pointsList.push((xcen + (rx * cos0)), (ycen - (ry * sin0)), (xcen + (rx * (cos0 + (kappa * sin0)))), (ycen - (ry * (sin0 - (kappa * cos0)))), (xcen + (rx * (cos1 - (kappa * sin1)))), (ycen - (ry * (sin1 + (kappa * cos1)))), (xcen + (rx * cos1)), (ycen - (ry * sin1)));
            }
        }
        return pointsList;
    };
    // Constants
    /**
     * Specifies the mask of `path type values`.
     * @private
     */
    PdfGraphics.pathTypesValuesMask = 0xf;
    /**
     * Checks whether the object is `transparencyObject`.
     * @hidden
     * @private
     */
    PdfGraphics.transparencyObject = false;
    return PdfGraphics;
}());
export { PdfGraphics };
/**
 * `GetResourceEventHandler` class is alternate for event handlers and delegates.
 * @private
 * @hidden
 */
var GetResourceEventHandler = /** @class */ (function () {
    /**
     * Initialize instance of `GetResourceEventHandler` class.
     * Alternate for event handlers and delegates.
     * @private
     */
    function GetResourceEventHandler(sender) {
        this.sender = sender;
    }
    /**
     * Return the instance of `PdfResources` class.
     * @private
     */
    GetResourceEventHandler.prototype.getResources = function () {
        return this.sender.getResources();
    };
    return GetResourceEventHandler;
}());
export { GetResourceEventHandler };
var PdfGraphicsState = /** @class */ (function () {
    function PdfGraphicsState(graphics, matrix) {
        /**
         * Stores `previous rendering mode`.
         * @default TextRenderingMode.Fill
         * @private
         */
        this.internalTextRenderingMode = TextRenderingMode.Fill;
        /**
         * `Previous character spacing` value or 0.
         * @default 0.0
         * @private
         */
        this.internalCharacterSpacing = 0.0;
        /**
         * `Previous word spacing` value or 0.
         * @default 0.0
         * @private
         */
        this.internalWordSpacing = 0.0;
        /**
         * The previously used `text scaling value`.
         * @default 100.0
         * @private
         */
        this.internalTextScaling = 100.0;
        /**
         * `Current color space`.
         * @default PdfColorSpace.Rgb
         * @private
         */
        this.pdfColorSpace = PdfColorSpace.Rgb;
        if (typeof graphics !== 'undefined') {
            this.pdfGraphics = graphics;
            this.transformationMatrix = matrix;
        }
    }
    Object.defineProperty(PdfGraphicsState.prototype, "graphics", {
        // Properties
        /**
         * Gets the parent `graphics object`.
         * @private
         */
        get: function () {
            return this.pdfGraphics;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphicsState.prototype, "matrix", {
        /**
         * Gets the `current matrix`.
         * @private
         */
        get: function () {
            return this.transformationMatrix;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphicsState.prototype, "characterSpacing", {
        /**
         * Gets or sets the `current character spacing`.
         * @private
         */
        get: function () {
            return this.internalCharacterSpacing;
        },
        set: function (value) {
            this.internalCharacterSpacing = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphicsState.prototype, "wordSpacing", {
        /**
         * Gets or sets the `word spacing` value.
         * @private
         */
        get: function () {
            return this.internalWordSpacing;
        },
        set: function (value) {
            this.internalWordSpacing = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphicsState.prototype, "textScaling", {
        /**
         * Gets or sets the `text scaling` value.
         * @private
         */
        get: function () {
            return this.internalTextScaling;
        },
        set: function (value) {
            this.internalTextScaling = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphicsState.prototype, "pen", {
        /**
         * Gets or sets the `current pen` object.
         * @private
         */
        get: function () {
            return this.pdfPen;
        },
        set: function (value) {
            this.pdfPen = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphicsState.prototype, "brush", {
        /**
         * Gets or sets the `brush`.
         * @private
         */
        get: function () {
            return this.pdfBrush;
        },
        set: function (value) {
            this.pdfBrush = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphicsState.prototype, "font", {
        /**
         * Gets or sets the `current font` object.
         * @private
         */
        get: function () {
            return this.pdfFont;
        },
        set: function (value) {
            this.pdfFont = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphicsState.prototype, "colorSpace", {
        /**
         * Gets or sets the `current color space` value.
         * @private
         */
        get: function () {
            return this.pdfColorSpace;
        },
        set: function (value) {
            this.pdfColorSpace = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGraphicsState.prototype, "textRenderingMode", {
        /**
         * Gets or sets the `text rendering mode`.
         * @private
         */
        get: function () {
            return this.internalTextRenderingMode;
        },
        set: function (value) {
            this.internalTextRenderingMode = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfGraphicsState;
}());
export { PdfGraphicsState };
var TransparencyData = /** @class */ (function () {
    // Constructors
    /**
     * Initializes a new instance of the `TransparencyData` class.
     * @private
     */
    function TransparencyData(alphaPen, alphaBrush, blendMode) {
        this.alphaPen = alphaPen;
        this.alphaBrush = alphaBrush;
        this.blendMode = blendMode;
    }
    return TransparencyData;
}());
