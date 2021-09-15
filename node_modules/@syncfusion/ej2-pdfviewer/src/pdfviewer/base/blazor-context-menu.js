/**
 * ContextMenu module is used to handle the context menus used in the control.
 *
 * @hidden
 */
var BlazorContextMenu = /** @class */ (function () {
    /**
     * Initialize the constructor of blazorcontext
     *
     * @param { PdfViewer } pdfViewer - Specified PdfViewer class.
     * @param { PdfViewerBase } pdfViewerBase - The pdfViewerBase.
     */
    function BlazorContextMenu(pdfViewer, pdfViewerBase) {
        this.pdfViewer = pdfViewer;
        this.pdfViewerBase = pdfViewerBase;
    }
    /**
     * Create the context menu.
     * @returns {void}
     */
    BlazorContextMenu.prototype.createContextMenu = function () {
        var htmlCollection = document.getElementsByClassName(this.pdfViewer.element.id + '_context_menu');
        if (htmlCollection) {
            this.contextMenuElement = htmlCollection[0];
            if (this.contextMenuElement.children && this.contextMenuElement.children.length > 0) {
                var htmlElement = this.contextMenuElement.children[0];
                htmlElement.className = htmlElement.className + ' ' + 'e-pv-context-menu';
            }
        }
    };
    /**
     * open the context menu.
     * @param {number} top - The top.
     * @param {number} left - The left.
     * @param {HTMLElement} target - The target.
     * @returns {void}
     */
    BlazorContextMenu.prototype.open = function (top, left, target) {
        this.pdfViewer._dotnetInstance.invokeMethodAsync('OpenContextMenu', top, left);
    };
    /**
     * close the context menu.
     * @returns {void}
     */
    BlazorContextMenu.prototype.close = function () {
        this.pdfViewer._dotnetInstance.invokeMethodAsync('CloseContextMenu');
    };
    /**
     * destroy the context menu.
     * @returns {void}
     */
    BlazorContextMenu.prototype.destroy = function () {
        this.previousAction = '';
        this.contextMenuElement = null;
    };
    // eslint-disable-next-line
    BlazorContextMenu.prototype.OnItemSelected = function (selectedMenu) {
        if (typeof selectedMenu === 'string') {
            this.pdfViewerBase.OnItemSelected(selectedMenu);
        }
        else {
            this.pdfViewerBase.OnItemSelected(selectedMenu[0]);
        }
    };
    return BlazorContextMenu;
}());
export { BlazorContextMenu };
