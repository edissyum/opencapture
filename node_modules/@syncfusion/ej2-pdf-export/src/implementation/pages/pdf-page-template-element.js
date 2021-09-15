/**
 * PdfPageTemplateElement.ts class for EJ2-Pdf
 */
import { PdfDockStyle, PdfAlignmentStyle, TemplateType } from './enum';
import { PointF, SizeF } from './../drawing/pdf-drawing';
import { PdfTemplate } from './../graphics/figures/pdf-template';
import { PdfPage } from './pdf-page';
import { RectangleF } from './../drawing/pdf-drawing';
/**
 * Describes a `page template` object that can be used as header/footer, watermark or stamp.
 */
var PdfPageTemplateElement = /** @class */ (function () {
    /* tslint:disable */
    function PdfPageTemplateElement(arg1, arg2, arg3, arg4, arg5) {
        if (arg1 instanceof RectangleF && typeof arg2 === 'undefined') {
            this.InitiateBounds(arg1.x, arg1.y, arg1.width, arg1.height, null);
        }
        else if (arg1 instanceof RectangleF && arg2 instanceof PdfPage && typeof arg3 === 'undefined') {
            this.InitiateBounds(arg1.x, arg1.y, arg1.width, arg1.height, arg2);
        }
        else if (arg1 instanceof PointF && arg2 instanceof SizeF && typeof arg3 === 'undefined') {
            this.InitiateBounds(arg1.x, arg1.y, arg2.width, arg2.height, null);
        }
        else if (arg1 instanceof PointF && arg2 instanceof SizeF && arg3 instanceof PdfPage && typeof arg4 === 'undefined') {
            this.InitiateBounds(arg1.x, arg1.y, arg2.width, arg2.height, arg3);
        }
        else if (arg1 instanceof SizeF && typeof arg2 === 'undefined') {
            this.InitiateBounds(0, 0, arg1.width, arg1.height, null);
        }
        else if (typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'undefined') {
            this.InitiateBounds(0, 0, arg1, arg2, null);
        }
        else if (typeof arg1 === 'number' && typeof arg2 === 'number' && arg3 instanceof PdfPage && typeof arg4 === 'undefined') {
            this.InitiateBounds(0, 0, arg1, arg2, arg3);
        }
        else if (typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number' && typeof arg4 === 'number' && typeof arg5 === 'undefined') {
            this.InitiateBounds(arg1, arg2, arg3, arg4, null);
        }
        else {
            this.InitiateBounds(arg1, arg2, arg3, arg4, null);
            // this.graphics.colorSpace = this.page.document.colorSpace;
        }
        /* tslint:enable */
    }
    Object.defineProperty(PdfPageTemplateElement.prototype, "dock", {
        // Properties
        /**
         * Gets or sets the `dock style` of the page template element.
         * @private
         */
        get: function () {
            return this.dockStyle;
        },
        set: function (value) {
            // if (this.dockStyle !== value && this.Type === TemplateType.None) {
            this.dockStyle = value;
            // Reset alignment.
            this.resetAlignment();
            // }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "alignment", {
        /**
         * Gets or sets `alignment` of the page template element.
         * @private
         */
        get: function () {
            return this.alignmentStyle;
        },
        set: function (value) {
            // if (this.alignmentStyle !== value) {
            this.setAlignment(value);
            // }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "foreground", {
        /**
         * Indicates whether the page template is located `in front of the page layers or behind of it`.
         * @private
         */
        get: function () {
            return this.isForeground;
        },
        set: function (value) {
            // if (this.foreground !== value) {
            this.isForeground = value;
            // }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "background", {
        /**
         * Indicates whether the page template is located `behind of the page layers or in front of it`.
         * @private
         */
        get: function () {
            return !this.isForeground;
        },
        set: function (value) {
            this.isForeground = !value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "location", {
        /**
         * Gets or sets `location` of the page template element.
         * @private
         */
        get: function () {
            return this.currentLocation;
        },
        set: function (value) {
            if (this.type === TemplateType.None) {
                this.currentLocation = value;
            }
            else {
                //
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "x", {
        /**
         * Gets or sets `X` co-ordinate of the template element on the page.
         * @private
         */
        get: function () {
            var value = (typeof this.currentLocation !== 'undefined') ? this.currentLocation.x : 0;
            return value;
        },
        set: function (value) {
            if (this.type === TemplateType.None) {
                this.currentLocation.x = value;
            }
            else {
                //
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "y", {
        /**
         * Gets or sets `Y` co-ordinate of the template element on the page.
         * @private
         */
        get: function () {
            var value = (typeof this.currentLocation !== 'undefined') ? this.currentLocation.y : 0;
            return value;
        },
        set: function (value) {
            if (this.type === TemplateType.None) {
                this.currentLocation.y = value;
            }
            else {
                //
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "size", {
        /**
         * Gets or sets `size` of the page template element.
         * @private
         */
        get: function () {
            return this.template.size;
        },
        set: function (value) {
            if (this.type === TemplateType.None) {
                this.template.reset(value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "width", {
        /**
         * Gets or sets `width` of the page template element.
         * @private
         */
        get: function () {
            return this.template.width;
        },
        set: function (value) {
            if (this.template.width !== value && this.type === TemplateType.None) {
                var size = this.template.size;
                size.width = value;
                this.template.reset(size);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "height", {
        /**
         * Gets or sets `height` of the page template element.
         * @private
         */
        get: function () {
            return this.template.height;
        },
        set: function (value) {
            if (this.template.height !== value && this.type === TemplateType.None) {
                var size = this.template.size;
                size.height = value;
                this.template.reset(size);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "graphics", {
        /**
         * Gets `graphics` context of the page template element.
         * @private
         */
        get: function () {
            return this.template.graphics;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "template", {
        /**
         * Gets Pdf `template` object.
         * @private
         */
        get: function () {
            // if (typeof this.pdfTemplate === 'undefined' || this.pdfTemplate == null) {
            //     this.pdfTemplate = new PdfTemplate(this.size);
            // }
            return this.pdfTemplate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "type", {
        /**
         * Gets or sets `type` of the usage of this page template.
         * @private
         */
        get: function () {
            return this.templateType;
        },
        set: function (value) {
            this.updateDocking(value);
            this.templateType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfPageTemplateElement.prototype, "bounds", {
        /**
         * Gets or sets `bounds` of the page template.
         * @public
         */
        get: function () {
            return new RectangleF(new PointF(this.x, this.y), this.size);
        },
        set: function (value) {
            if (this.type === TemplateType.None) {
                this.location = new PointF(value.x, value.y);
                this.size = new SizeF(value.width, value.height);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * `Initialize Bounds` Initialize the bounds value of the template.
     * @private
     */
    PdfPageTemplateElement.prototype.InitiateBounds = function (arg1, arg2, arg3, arg4, arg5) {
        this.x = arg1;
        this.y = arg2;
        this.pdfTemplate = new PdfTemplate(arg3, arg4);
        // this.graphics.colorSpace = this.page.document.colorSpace;
    };
    /**
     * `Updates Dock` property if template is used as header/footer.
     * @private
     */
    PdfPageTemplateElement.prototype.updateDocking = function (type) {
        if (type !== TemplateType.None) {
            switch (type) {
                case TemplateType.Top:
                    this.dock = PdfDockStyle.Top;
                    break;
                case TemplateType.Bottom:
                    this.dock = PdfDockStyle.Bottom;
                    break;
                case TemplateType.Left:
                    this.dock = PdfDockStyle.Left;
                    break;
                case TemplateType.Right:
                    this.dock = PdfDockStyle.Right;
                    break;
            }
            this.resetAlignment();
        }
    };
    /**
     * `Resets alignment` of the template.
     * @private
     */
    PdfPageTemplateElement.prototype.resetAlignment = function () {
        this.alignment = PdfAlignmentStyle.None;
    };
    /**
     * `Sets alignment` of the template.
     * @private
     */
    PdfPageTemplateElement.prototype.setAlignment = function (alignment) {
        if (this.dock === PdfDockStyle.None) {
            this.alignmentStyle = alignment;
        }
        else {
            // Template is docked and alignment has been changed.
            var canBeSet = false;
            switch (this.dock) {
                case PdfDockStyle.Left:
                    canBeSet = (alignment === PdfAlignmentStyle.TopLeft || alignment === PdfAlignmentStyle.MiddleLeft ||
                        alignment === PdfAlignmentStyle.BottomLeft || alignment === PdfAlignmentStyle.None);
                    break;
                case PdfDockStyle.Top:
                    canBeSet = (alignment === PdfAlignmentStyle.TopLeft || alignment === PdfAlignmentStyle.TopCenter ||
                        alignment === PdfAlignmentStyle.TopRight || alignment === PdfAlignmentStyle.None);
                    break;
                case PdfDockStyle.Right:
                    canBeSet = (alignment === PdfAlignmentStyle.TopRight || alignment === PdfAlignmentStyle.MiddleRight ||
                        alignment === PdfAlignmentStyle.BottomRight || alignment === PdfAlignmentStyle.None);
                    break;
                case PdfDockStyle.Bottom:
                    canBeSet = (alignment === PdfAlignmentStyle.BottomLeft || alignment === PdfAlignmentStyle.BottomCenter
                        || alignment === PdfAlignmentStyle.BottomRight || alignment === PdfAlignmentStyle.None);
                    break;
                case PdfDockStyle.Fill:
                    canBeSet = (alignment === PdfAlignmentStyle.MiddleCenter || alignment === PdfAlignmentStyle.None);
                    break;
            }
            if (canBeSet) {
                this.alignmentStyle = alignment;
            }
        }
    };
    /**
     * Draws the template.
     * @private
     */
    PdfPageTemplateElement.prototype.draw = function (layer, document) {
        var page = layer.page;
        var bounds = this.calculateBounds(page, document);
        if (bounds.x === -0) {
            bounds.x = 0;
        }
        layer.graphics.drawPdfTemplate(this.template, new PointF(bounds.x, bounds.y), new SizeF(bounds.width, bounds.height));
    };
    /**
     * Calculates bounds of the page template.
     * @private
     */
    PdfPageTemplateElement.prototype.calculateBounds = function (page, document) {
        var result = this.bounds;
        if (this.alignmentStyle !== PdfAlignmentStyle.None) {
            result = this.getAlignmentBounds(page, document);
        }
        else if (this.dockStyle !== PdfDockStyle.None) {
            result = this.getDockBounds(page, document);
        }
        return result;
    };
    /**
     * Calculates bounds according to the alignment.
     * @private
     */
    PdfPageTemplateElement.prototype.getAlignmentBounds = function (page, document) {
        var result = this.bounds;
        if (this.type === TemplateType.None) {
            result = this.getSimpleAlignmentBounds(page, document);
        }
        else {
            result = this.getTemplateAlignmentBounds(page, document);
        }
        return result;
    };
    /**
     * Calculates bounds according to the alignment.
     * @private
     */
    PdfPageTemplateElement.prototype.getSimpleAlignmentBounds = function (page, document) {
        var bounds = this.bounds;
        var pdfSection = page.section;
        var actualBounds = pdfSection.getActualBounds(document, page, false);
        var x = this.x;
        var y = this.y;
        switch (this.alignmentStyle) {
            case PdfAlignmentStyle.TopLeft:
                x = 0;
                y = 0;
                break;
            case PdfAlignmentStyle.TopCenter:
                x = (actualBounds.width - this.width) / 2;
                y = 0;
                break;
            case PdfAlignmentStyle.TopRight:
                x = actualBounds.width - this.width;
                y = 0;
                break;
            case PdfAlignmentStyle.MiddleLeft:
                x = 0;
                y = (actualBounds.height - this.height) / 2;
                break;
            case PdfAlignmentStyle.MiddleCenter:
                x = (actualBounds.width - this.width) / 2;
                y = (actualBounds.height - this.height) / 2;
                break;
            case PdfAlignmentStyle.MiddleRight:
                x = actualBounds.width - this.width;
                y = (actualBounds.height - this.height) / 2;
                break;
            case PdfAlignmentStyle.BottomLeft:
                x = 0;
                y = actualBounds.height - this.height;
                break;
            case PdfAlignmentStyle.BottomCenter:
                x = (actualBounds.width - this.width) / 2;
                y = actualBounds.height - this.height;
                break;
            case PdfAlignmentStyle.BottomRight:
                x = actualBounds.width - this.width;
                y = actualBounds.height - this.height;
                break;
        }
        bounds.x = x;
        bounds.y = y;
        return bounds;
    };
    /**
     * Calculates bounds according to the alignment.
     * @private
     */
    PdfPageTemplateElement.prototype.getTemplateAlignmentBounds = function (page, document) {
        var result = this.bounds;
        var section = page.section;
        var actualBounds = section.getActualBounds(document, page, false);
        var x = this.x;
        var y = this.y;
        switch (this.alignmentStyle) {
            case PdfAlignmentStyle.TopLeft:
                if (this.type === TemplateType.Left) {
                    x = -actualBounds.x;
                    y = 0;
                }
                else if (this.type === TemplateType.Top) {
                    x = -actualBounds.x;
                    y = -actualBounds.y;
                }
                break;
            case PdfAlignmentStyle.TopCenter:
                x = (actualBounds.width - this.width) / 2;
                y = -actualBounds.y;
                break;
            case PdfAlignmentStyle.TopRight:
                if (this.type === TemplateType.Right) {
                    x = actualBounds.width + section.getRightIndentWidth(document, page, false) - this.width;
                    y = 0;
                }
                else if (this.type === TemplateType.Top) {
                    x = actualBounds.width + section.getRightIndentWidth(document, page, false) - this.width;
                    y = -actualBounds.y;
                }
                break;
            case PdfAlignmentStyle.MiddleLeft:
                x = -actualBounds.x;
                y = (actualBounds.height - this.height) / 2;
                break;
            case PdfAlignmentStyle.MiddleCenter:
                x = (actualBounds.width - this.width) / 2;
                y = (actualBounds.height - this.height) / 2;
                break;
            case PdfAlignmentStyle.MiddleRight:
                x = actualBounds.width + section.getRightIndentWidth(document, page, false) - this.width;
                y = (actualBounds.height - this.height) / 2;
                break;
            case PdfAlignmentStyle.BottomLeft:
                if (this.type === TemplateType.Left) {
                    x = -actualBounds.x;
                    y = actualBounds.height - this.height;
                }
                else if (this.type === TemplateType.Bottom) {
                    x = -actualBounds.x;
                    y = actualBounds.height + section.getBottomIndentHeight(document, page, false) - this.height;
                }
                break;
            case PdfAlignmentStyle.BottomCenter:
                x = (actualBounds.width - this.width) / 2;
                y = actualBounds.height + section.getBottomIndentHeight(document, page, false) - this.height;
                break;
            case PdfAlignmentStyle.BottomRight:
                if (this.type === TemplateType.Right) {
                    x = actualBounds.width + section.getRightIndentWidth(document, page, false) - this.width;
                    y = actualBounds.height - this.height;
                }
                else if (this.type === TemplateType.Bottom) {
                    x = actualBounds.width + section.getRightIndentWidth(document, page, false) - this.width;
                    y = actualBounds.height + section.getBottomIndentHeight(document, page, false) - this.height;
                }
                break;
        }
        result.x = x;
        result.y = y;
        return result;
    };
    /**
     * Calculates bounds according to the docking.
     * @private
     */
    PdfPageTemplateElement.prototype.getDockBounds = function (page, document) {
        var result = this.bounds;
        if (this.type === TemplateType.None) {
            result = this.getSimpleDockBounds(page, document);
        }
        else {
            result = this.getTemplateDockBounds(page, document);
        }
        return result;
    };
    /**
     * Calculates bounds according to the docking.
     * @private
     */
    PdfPageTemplateElement.prototype.getSimpleDockBounds = function (page, document) {
        var result = this.bounds;
        var section = page.section;
        var actualBounds = section.getActualBounds(document, page, false);
        var x = this.x;
        var y = this.y;
        var width = this.width;
        var height = this.height;
        switch (this.dockStyle) {
            case PdfDockStyle.Left:
                x = 0;
                y = 0;
                width = this.width;
                height = actualBounds.height;
                break;
            case PdfDockStyle.Top:
                x = 0;
                y = 0;
                width = actualBounds.width;
                height = this.height;
                break;
            case PdfDockStyle.Right:
                x = actualBounds.width - this.width;
                y = 0;
                width = this.width;
                height = actualBounds.height;
                break;
            case PdfDockStyle.Bottom:
                x = 0;
                y = actualBounds.height - this.height;
                width = actualBounds.width;
                height = this.height;
                break;
            case PdfDockStyle.Fill:
                x = 0;
                x = 0;
                width = actualBounds.width;
                height = actualBounds.height;
                break;
        }
        result = new RectangleF(x, y, width, height);
        return result;
    };
    /**
     * Calculates template bounds basing on docking if template is a page template.
     * @private
     */
    PdfPageTemplateElement.prototype.getTemplateDockBounds = function (page, document) {
        var result = this.bounds;
        var section = page.section;
        var actualBounds = section.getActualBounds(document, page, false);
        var actualSize = section.pageSettings.getActualSize();
        var x = this.x;
        var y = this.y;
        var width = this.width;
        var height = this.height;
        switch (this.dockStyle) {
            case PdfDockStyle.Left:
                x = -actualBounds.x;
                y = 0;
                width = this.width;
                height = actualBounds.height;
                break;
            case PdfDockStyle.Top:
                x = -actualBounds.x;
                y = -actualBounds.y;
                width = actualSize.width;
                height = this.height;
                if (actualBounds.height < 0) {
                    y = -actualBounds.y + actualSize.height;
                }
                break;
            case PdfDockStyle.Right:
                x = actualBounds.width + section.getRightIndentWidth(document, page, false) - this.width;
                y = 0;
                width = this.width;
                height = actualBounds.height;
                break;
            case PdfDockStyle.Bottom:
                x = -actualBounds.x;
                y = actualBounds.height + section.getBottomIndentHeight(document, page, false) - this.height;
                width = actualSize.width;
                height = this.height;
                if (actualBounds.height < 0) {
                    y -= actualSize.height;
                }
                break;
            case PdfDockStyle.Fill:
                x = 0;
                x = 0;
                width = actualBounds.width;
                height = actualBounds.height;
                break;
        }
        result = new RectangleF(x, y, width, height);
        return result;
    };
    return PdfPageTemplateElement;
}());
export { PdfPageTemplateElement };
