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
import { EditorManager } from './../../editor-manager/base/editor-manager';
import { extend } from '@syncfusion/ej2-base';
import { htmlKeyConfig } from './../../common/config';
/**
 * HTML adapter
 *
 * @hidden

 */
var HTMLFormatter = /** @class */ (function (_super) {
    __extends(HTMLFormatter, _super);
    function HTMLFormatter(options) {
        var _this = _super.call(this) || this;
        _this.initialize();
        extend(_this, _this, options, true);
        if (_this.currentDocument && _this.element) {
            _this.updateFormatter(_this.element, _this.currentDocument, options.options);
        }
        return _this;
    }
    HTMLFormatter.prototype.initialize = function () {
        this.keyConfig = htmlKeyConfig;
    };
    /**
     * Update the formatter of RichTextEditor
     *
     * @param  {Element} editElement - specifies the edit element.
     * @param  {Document} doc - specifies the doucment
     * @param {number} options - specifies the options
     * @returns {void}
     * @hidden

     */
    HTMLFormatter.prototype.updateFormatter = function (editElement, doc, options) {
        if (editElement && doc) {
            this.editorManager = new EditorManager({
                document: doc,
                editableElement: editElement,
                options: options
            });
        }
    };
    return HTMLFormatter;
}(Formatter));
export { HTMLFormatter };
