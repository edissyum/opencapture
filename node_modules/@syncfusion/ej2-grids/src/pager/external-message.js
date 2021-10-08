import { createElement, remove, isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * `ExternalMessage` module is used to display user provided message.
 */
var ExternalMessage = /** @class */ (function () {
    /**
     * Constructor for externalMessage module
     *
     * @param {Pager} pagerModule - specifies the pagermodule
     * @hidden
     */
    function ExternalMessage(pagerModule) {
        this.pagerModule = pagerModule;
    }
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    ExternalMessage.prototype.getModuleName = function () {
        return 'externalMessage';
    };
    /**
     * The function is used to render pager externalMessage
     *
     * @returns {void}
     * @hidden
     */
    ExternalMessage.prototype.render = function () {
        this.element = createElement('div', { className: 'e-pagerexternalmsg', attrs: { 'aria-label': 'Pager external message' } });
        this.pagerModule.element.appendChild(this.element);
        this.refresh();
    };
    /**
     * Refreshes the external message of Pager.
     *
     * @returns {void}
     */
    ExternalMessage.prototype.refresh = function () {
        if (this.pagerModule.externalMessage && this.pagerModule.externalMessage.toString().length) {
            this.showMessage();
            this.element.innerHTML = this.pagerModule.externalMessage;
        }
        else {
            this.hideMessage();
        }
    };
    /**
     * Hides the external message of Pager.
     *
     * @returns {void}
     */
    ExternalMessage.prototype.hideMessage = function () {
        if (!isNullOrUndefined(this.element)) {
            this.element.style.display = 'none';
        }
    };
    /**
     * Shows the external message of the Pager.
     *
     * @returns {void}s
     */
    ExternalMessage.prototype.showMessage = function () {
        this.element.style.display = '';
    };
    /**
     * To destroy the PagerMessage
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    ExternalMessage.prototype.destroy = function () {
        remove(this.element);
    };
    return ExternalMessage;
}());
export { ExternalMessage };
