import { print as printWindow, createElement } from '@syncfusion/ej2-base';
import { getElement } from '../utils/helper-common';
import { beforePrint } from './constants';
/**
 * Represent the print for gauge
 *
 * @hidden
 */
var Print = /** @class */ (function () {
    /**
     * Constructor for gauge
     *
     * @param {CircularGauge} control - Specifies the instance of the gauge.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    function Print(control) {
        this.control = control;
    }
    /**
     * To print the gauge
     *
     * @param {string[] | string | Element} elements - Specifies the element.
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
        this.control.trigger('beforePrint', argsData, function (beforePrintArgs) {
            if (!argsData.cancel) {
                printWindow(argsData.htmlContent, _this.printWindow);
            }
        });
    };
    /**
     * To get the html string of the gauge
     *
     * @param { string[] | string | Element} elements - Specifies the element.
     * @returns {Element} - Returns the div element.
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
    Print.prototype.getModuleName = function () {
        // Returns te module name
        return 'Print';
    };
    /**
     * To destroy the Print.
     *
     * @param {CircularGauge} gauge - Specfies the instance of the gauge
     * @returns {void}
     * @private
     */
    Print.prototype.destroy = function (gauge) {
        // Destroy method performed here
    };
    return Print;
}());
export { Print };
