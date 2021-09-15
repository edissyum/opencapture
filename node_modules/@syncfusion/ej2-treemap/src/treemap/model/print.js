import { print as printWindow, createElement } from '@syncfusion/ej2-base';
import { getElement } from '../utils/helper';
import { beforePrint } from '../model/constants';
/**
 * Print module handles the print functionality for treemap.
 *
 * @hidden
 */
var Print = /** @class */ (function () {
    /**
     * Constructor for Maps
     *
     * @param {TreeMap} control - Specifies the treemap instance.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    function Print(control) {
        this.control = control;
    }
    /**
     * This method is used to perform the print functionality in treemap.
     *
     * @param { string[] | string | Element} elements - Specifies the element.
     * @returns {void}
     * @private
     */
    Print.prototype.print = function (elements) {
        var _this = this;
        this.printWindow = window.open('', 'print', 'height=' + window.outerHeight + ',width=' + window.outerWidth + ',tabbar=no');
        this.printWindow.moveTo(0, 0);
        this.printWindow.resizeTo(screen.availWidth, screen.availHeight);
        var argsData = {
            cancel: false, htmlContent: this.getHTMLContent(elements), name: beforePrint
        };
        this.control.trigger(beforePrint, argsData, function () {
            if (!argsData.cancel) {
                printWindow(argsData.htmlContent, _this.printWindow);
            }
        });
    };
    /**
     * To get the html string of the Maps
     *
     * @param {string[] | string | Element} elements - Specifies the element
     * @returns {Element} - Returns the element
     * @private
     */
    Print.prototype.getHTMLContent = function (elements) {
        var div = createElement('div');
        if (elements) {
            if (elements instanceof Array) {
                elements.forEach(function (value) {
                    div.appendChild(getElement(value).cloneNode(true));
                });
            }
            else if (elements instanceof Element) {
                div.appendChild(elements.cloneNode(true));
            }
            else {
                div.appendChild(getElement(elements).cloneNode(true));
            }
        }
        else {
            div.appendChild(this.control.element.cloneNode(true));
        }
        return div;
    };
    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name.
     */
    Print.prototype.getModuleName = function () {
        // Returns te module name
        return 'Print';
    };
    /**
     * To destroy the legend.
     *
     * @param {TreeMap} treemap - Specifies the treemap instance
     * @returns {void}
     * @private
     */
    Print.prototype.destroy = function (treemap) {
        /**
         * Destroy method performed here
         */
    };
    return Print;
}());
export { Print };
