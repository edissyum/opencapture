/**
 * PdfTemplate.ts class for EJ2-PDF
 */
import { PdfStream } from './../../primitives/pdf-stream';
import { DictionaryProperties } from './../../input-output/pdf-dictionary-properties';
import { PdfArray } from './../../primitives/pdf-array';
import { PdfGraphics } from './../pdf-graphics';
import { PdfResources } from './../pdf-resources';
import { PdfName } from './../../primitives/pdf-name';
import { PointF, SizeF, RectangleF } from './../../drawing/pdf-drawing';
import { GetResourceEventHandler } from './../pdf-graphics';
/**
 * Represents `Pdf Template` object.
 * @private
 */
var PdfTemplate = /** @class */ (function () {
    function PdfTemplate(arg1, arg2) {
        /**
         * Initialize an instance for `DictionaryProperties` class.
         * @private
         * @hidden
         */
        this.dictionaryProperties = new DictionaryProperties();
        /**
         * Checks whether the transformation 'is performed'.
         * @default true
         * @private
         */
        this.writeTransformation = true;
        if (typeof arg1 === 'undefined') {
            //
        }
        else if (arg1 instanceof SizeF && typeof arg2 === 'undefined') {
            this.content = new PdfStream();
            var tempSize = new SizeF(arg1.width, arg1.height);
            this.setSize(tempSize);
            this.initialize();
        }
        else {
            this.content = new PdfStream();
            this.setSize(new SizeF(arg1, arg2));
            this.initialize();
        }
    }
    Object.defineProperty(PdfTemplate.prototype, "size", {
        //Properties
        /**
         * Gets the size of the 'PdfTemplate'.
         */
        get: function () {
            return this.templateSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTemplate.prototype, "width", {
        /**
         * Gets the width of the 'PdfTemplate'.
         */
        get: function () {
            return this.size.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTemplate.prototype, "height", {
        /**
         * Gets the height of the 'PdfTemplate'.
         */
        get: function () {
            return this.size.height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTemplate.prototype, "graphics", {
        /**
         * Gets the `graphics` of the 'PdfTemplate'.
         */
        get: function () {
            if (this.pdfGraphics == null || typeof this.pdfGraphics === 'undefined') {
                var gr = new GetResourceEventHandler(this);
                var g = new PdfGraphics(this.size, gr, this.content);
                this.pdfGraphics = g;
                // if(this.writeTransformation) {
                // Transform co-ordinates to Top/Left.
                this.pdfGraphics.initializeCoordinates();
                // }
            }
            return this.pdfGraphics;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the resources and modifies the template dictionary.
     * @private
     */
    PdfTemplate.prototype.getResources = function () {
        if (this.resources == null) {
            this.resources = new PdfResources();
            this.content.items.setValue(this.dictionaryProperties.resources, this.resources);
        }
        return this.resources;
    };
    // Public methods
    /**
     * `Initialize` the type and subtype of the template.
     * @private
     */
    PdfTemplate.prototype.initialize = function () {
        this.addType();
        this.addSubType();
    };
    /**
     * `Adds type key`.
     * @private
     */
    PdfTemplate.prototype.addType = function () {
        var value = new PdfName(this.dictionaryProperties.xObject);
        this.content.items.setValue(this.dictionaryProperties.type, value);
    };
    /**
     * `Adds SubType key`.
     * @private
     */
    PdfTemplate.prototype.addSubType = function () {
        var value = new PdfName(this.dictionaryProperties.form);
        this.content.items.setValue(this.dictionaryProperties.subtype, value);
    };
    PdfTemplate.prototype.reset = function (size) {
        if (typeof size === 'undefined') {
            if (this.resources != null) {
                this.resources = null;
                this.content.remove(this.dictionaryProperties.resources);
            }
            if (this.graphics != null) {
                this.graphics.reset(this.size);
            }
        }
        else {
            this.setSize(size);
            this.reset();
        }
    };
    /**
     * `Set the size` of the 'PdfTemplate'.
     * @private
     */
    PdfTemplate.prototype.setSize = function (size) {
        var rect = new RectangleF(new PointF(0, 0), size);
        var val = PdfArray.fromRectangle(rect);
        this.content.items.setValue(this.dictionaryProperties.bBox, val);
        this.templateSize = size;
    };
    Object.defineProperty(PdfTemplate.prototype, "element", {
        // /**
        //  * Returns the value of current graphics.
        //  * @private
        //  */
        // public GetGraphics(g : PdfGraphics) : PdfGraphics {
        //     if (this.graphics == null || typeof this.graphics === 'undefined') {
        //         this.graphics = g;
        //         this.graphics.Size = this.Size;
        //         this.graphics.StreamWriter = new PdfStreamWriter(this.content)
        //         this.graphics.Initialize();
        //         if(this.writeTransformation) {
        //             this.graphics.InitializeCoordinates();
        //         }
        //     }
        //     return this.graphics;
        // }
        // IPdfWrapper Members
        /**
         * Gets the `content stream` of 'PdfTemplate' class.
         * @private
         */
        get: function () {
            return this.content;
        },
        enumerable: true,
        configurable: true
    });
    return PdfTemplate;
}());
export { PdfTemplate };
