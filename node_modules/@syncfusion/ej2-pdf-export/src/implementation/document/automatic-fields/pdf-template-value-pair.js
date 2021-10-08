/**
 * Represent class to store information about `template and value pairs`.
 * @private
 */
var PdfTemplateValuePair = /** @class */ (function () {
    function PdfTemplateValuePair(template, value) {
        // Fields
        /**
         * Internal variable to store template.
         * @default null
         * @private
         */
        this.pdfTemplate = null;
        /**
         * Intenal variable to store value.
         * @private
         */
        this.content = '';
        if (typeof template === 'undefined') {
            //
        }
        else {
            this.template = template;
            this.value = value;
        }
    }
    Object.defineProperty(PdfTemplateValuePair.prototype, "template", {
        // Properties
        /**
         * Gets or sets the template.
         * @private
         */
        get: function () {
            return this.pdfTemplate;
        },
        set: function (value) {
            this.pdfTemplate = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTemplateValuePair.prototype, "value", {
        /**
         * Gets or sets the value.
         * @private
         */
        get: function () {
            return this.content;
        },
        set: function (value) {
            this.content = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfTemplateValuePair;
}());
export { PdfTemplateValuePair };
