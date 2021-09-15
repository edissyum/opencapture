var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Formatter } from './formatter';
import { MarkdownParser } from './../../markdown-parser/base/markdown-parser';
import { extend } from '@syncfusion/ej2-base';
import { markdownKeyConfig, markdownListsTags, markdownFormatTags, markdownSelectionTags } from './../../common/config';
/**
 * Markdown adapter
 *
 * @hidden

 */
var MarkdownFormatter = /** @class */ (function (_super) {
    __extends(MarkdownFormatter, _super);
    function MarkdownFormatter(options) {
        var _this = _super.call(this) || this;
        _this.initialize();
        extend(_this, _this, options, true);
        if (options && _this.element) {
            _this.updateFormatter(_this.element, document, options.options);
        }
        return _this;
    }
    MarkdownFormatter.prototype.initialize = function () {
        this.keyConfig = markdownKeyConfig;
        this.formatTags = markdownFormatTags;
        this.listTags = markdownListsTags;
        this.selectionTags = markdownSelectionTags;
    };
    /**
     * Update the formatter of RichTextEditor
     *
     * @param  {Element} editElement - specifies the edit element.
     * @param  {Document} doc - specifies the document.
     * @param {number} options - specifies the options
     * @returns {void}
     * @hidden

     */
    MarkdownFormatter.prototype.updateFormatter = function (editElement, doc, options) {
        if (editElement) {
            this.editorManager = new MarkdownParser({
                element: editElement,
                formatTags: this.formatTags,
                listTags: this.listTags,
                selectionTags: this.selectionTags,
                options: options
            });
        }
    };
    return MarkdownFormatter;
}(Formatter));
export { MarkdownFormatter };
