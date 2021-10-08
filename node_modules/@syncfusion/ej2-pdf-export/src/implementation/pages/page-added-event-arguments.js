/**
 * Provides data for `PageAddedEventHandler` event.
 * This event raises when adding the new PDF page to the PDF document.
 */
var PageAddedEventArgs = /** @class */ (function () {
    function PageAddedEventArgs(page) {
        if (typeof page !== 'undefined') {
            this.pdfPage = page;
        }
        else {
            this.pdfPage = null;
        }
    }
    Object.defineProperty(PageAddedEventArgs.prototype, "page", {
        /**
         * Gets the `newly added page`.
         * @private
         */
        get: function () {
            return this.pdfPage;
        },
        enumerable: true,
        configurable: true
    });
    return PageAddedEventArgs;
}());
export { PageAddedEventArgs };
