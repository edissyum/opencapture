import { PdfStream } from './../primitives/pdf-stream';
import { PdfGraphics, GetResourceEventHandler } from './../graphics/pdf-graphics';
import { PdfPageLayerCollection } from './pdf-page-layer-collection';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { PdfColorSpace } from './../graphics/enum';
/**
 * The `PdfPageLayer` used to create layers in PDF document.
 * @private
 */
var PdfPageLayer = /** @class */ (function () {
    function PdfPageLayer(page, streamClipPageTemplates) {
        // private bSaved : boolean;
        /**
         * Local Variable to store the `color space` of the document.
         * @private
         */
        this.pdfColorSpace = PdfColorSpace.Rgb;
        /**
         * Local Variable to set `visibility`.
         * @default true
         * @private
         */
        this.isVisible = true;
        /**
         * Indicates if `Sublayer` is present.
         * @default false
         * @private
         */
        this.sublayer = false;
        /**
         * Local variable to store `length` of the graphics.
         * @default 0
         * @private
         */
        this.contentLength = 0;
        /**
         * Instance for `PdfDictionaryProperties` Class.
         * @private
         */
        this.dictionaryProperties = new DictionaryProperties();
        if (page === null) {
            throw new Error('ArgumentNullException:page');
        }
        this.pdfPage = page;
        this.clipPageTemplates = true;
        if (typeof streamClipPageTemplates === 'undefined') {
            this.content = new PdfStream();
        }
        else if (streamClipPageTemplates instanceof PdfStream || streamClipPageTemplates === null) {
            if (streamClipPageTemplates === null) {
                throw new Error('ArgumentNullException:stream');
            }
            this.content = streamClipPageTemplates;
        }
        else {
            this.content = new PdfStream();
            this.clipPageTemplates = streamClipPageTemplates;
        }
    }
    Object.defineProperty(PdfPageLayer.prototype, "colorSpace", {
        // Properties
        /**
         * Get or set the `color space`.
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
    Object.defineProperty(PdfPageLayer.prototype, "page", {
        /**
         * Gets parent `page` of the layer.
         * @private
         */
        get: function () {
            return this.pdfPage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageLayer.prototype, "layerId", {
        /**
         * Gets and Sets the `id of the layer`.
         * @private
         */
        get: function () {
            return this.layerid;
        },
        set: function (value) {
            this.layerid = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageLayer.prototype, "name", {
        /**
         * Gets or sets the `name` of the layer.
         * @private
         */
        get: function () {
            return this.layerName;
        },
        set: function (value) {
            this.layerName = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageLayer.prototype, "visible", {
        /**
         * Gets or sets the `visibility` of the layer.
         * @private
         */
        get: function () {
            return this.isVisible;
        },
        set: function (value) {
            this.isVisible = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageLayer.prototype, "graphics", {
        /**
         * Gets `Graphics` context of the layer, used to draw various graphical content on layer.
         * @private
         */
        get: function () {
            if ((this.pdfGraphics == null)) {
                this.initializeGraphics(this.page);
            }
            return this.pdfGraphics;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageLayer.prototype, "layers", {
        /**
         * Gets the collection of `PdfPageLayer`, this collection handle by the class 'PdfPageLayerCollection'.
         * @private
         */
        get: function () {
            if (this.layer == null) {
                this.layer = new PdfPageLayerCollection(this.page);
                this.layer.sublayer = true;
                return this.layer;
            }
            else {
                return this.layer;
            }
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * `Adds` a new PDF Page layer.
     * @private
     */
    PdfPageLayer.prototype.add = function () {
        var layer = new PdfPageLayer(this.pdfPage);
        layer.name = '';
        return layer;
    };
    /**
     * Returns a value indicating the `sign` of a single-precision floating-point number.
     * @private
     */
    PdfPageLayer.prototype.sign = function (number) {
        if (number === 0) {
            return 0;
        }
        else if (number > 0) {
            return 1;
        }
        else {
            return -1;
        }
    };
    /**
     * `Initializes Graphics context` of the layer.
     * @private
     */
    PdfPageLayer.prototype.initializeGraphics = function (page) {
        var oPage = page;
        var gr = new GetResourceEventHandler(this.page);
        var cropBox = null;
        this.pdfGraphics = new PdfGraphics(page.size, gr, this.content);
        this.pdfGraphics.mediaBoxUpperRightBound = 0;
        if (oPage != null) {
            var sc = oPage.section.parent;
            if (sc != null) {
                this.pdfGraphics.colorSpace = sc.document.colorSpace;
                this.colorSpace = sc.document.colorSpace;
            }
        }
        // Transform coordinates to the left/top and activate margins.
        var isSame = (this.sign(page.origin.y) === this.sign(page.origin.x));
        // if (page != null) {
        if (page.origin.x >= 0 && page.origin.y >= 0 || !(isSame)) {
            this.pdfGraphics.initializeCoordinates();
        }
        else {
            // this.m_graphics.InitializeCoordinates(page);
        }
        var clipRect = oPage.section.getActualBounds(oPage, true);
        var margins = oPage.section.pageSettings.margins;
        if (this.clipPageTemplates) {
            if (page.origin.x >= 0 && page.origin.y >= 0) {
                this.pdfGraphics.clipTranslateMargins(clipRect);
            }
        }
        else {
            this.graphics.clipTranslateMargins(clipRect.x, clipRect.y, margins.left, margins.top, margins.right, margins.bottom);
        }
        this.pdfGraphics.setLayer(this);
        // this.bSaved = false;
    };
    Object.defineProperty(PdfPageLayer.prototype, "element", {
        // IPdfWrapper Members
        /**
         * Gets the wrapped `element`.
         * @private
         */
        get: function () {
            return this.content;
        },
        enumerable: true,
        configurable: true
    });
    return PdfPageLayer;
}());
export { PdfPageLayer };
