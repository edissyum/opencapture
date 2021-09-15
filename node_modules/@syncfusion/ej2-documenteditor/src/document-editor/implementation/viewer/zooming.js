import { isNullOrUndefined, Browser } from '@syncfusion/ej2-base';
/**
 * @private
 */
var Zoom = /** @class */ (function () {
    function Zoom(documentHelper) {
        var _this = this;
        /**
         * @private
         * @param {WheelEvent} event Specifies the mouse wheen event
         * @returns {void}
         */
        this.onMouseWheelInternal = function (event) {
            if (event.ctrlKey === true) {
                event.preventDefault();
                var pageX = event.pageX - _this.documentHelper.viewerContainer.offsetLeft;
                if (pageX < _this.documentHelper.pageContainer.offsetWidth) {
                    var isFirefFox = navigator.userAgent.match('Firefox');
                    /* eslint-disable */
                    var wheel = isFirefFox ? event.detail < 0 : (Browser.isIE ? event.wheelDelta > 0 : event.deltaY < 0);
                    /* eslint-enable */
                    var zoomFactor = _this.documentHelper.zoomFactor;
                    if (wheel) {
                        if (zoomFactor <= 4.90) {
                            zoomFactor += .10;
                        }
                        else {
                            zoomFactor = 5.00;
                        }
                    }
                    else {
                        if (zoomFactor >= .20) {
                            zoomFactor -= .10;
                        }
                        else {
                            zoomFactor = 0.10;
                        }
                    }
                    _this.documentHelper.zoomFactor = zoomFactor;
                }
            }
        };
        this.documentHelper = documentHelper;
    }
    Zoom.prototype.setZoomFactor = function () {
        this.onZoomFactorChanged();
        if (!isNullOrUndefined(this.documentHelper.selection)) {
            this.documentHelper.selection.updateCaretPosition();
        }
        this.documentHelper.updateTouchMarkPosition();
        if (!isNullOrUndefined(this.documentHelper.owner.imageResizerModule)) {
            this.documentHelper.owner.imageResizerModule.updateImageResizerPosition();
        }
        this.documentHelper.owner.fireZoomFactorChange();
    };
    Object.defineProperty(Zoom.prototype, "viewer", {
        get: function () {
            return this.documentHelper.owner.viewer;
        },
        enumerable: true,
        configurable: true
    });
    //Zoom Implementation Starts
    Zoom.prototype.onZoomFactorChanged = function () {
        if (this.documentHelper.zoomFactor > 5) {
            this.documentHelper.zoomFactor = 5;
        }
        else if (this.documentHelper.zoomFactor < 0.1) {
            this.documentHelper.zoomFactor = 0.1;
        }
        this.zoom();
    };
    Zoom.prototype.zoom = function () {
        var viewer = this.viewer;
        this.documentHelper.clearContent();
        viewer.handleZoom();
        this.documentHelper.updateFocus();
    };
    return Zoom;
}());
export { Zoom };
