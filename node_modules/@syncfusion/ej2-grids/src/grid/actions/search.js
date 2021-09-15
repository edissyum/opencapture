import { extend, isNullOrUndefined } from '@syncfusion/ej2-base';
import * as events from '../base/constant';
import { isActionPrevent } from '../base/util';
/**
 * The `Search` module is used to handle search action.
 */
var Search = /** @class */ (function () {
    /**
     * Constructor for Grid search module.
     *
     * @param {IGrid} parent - specifies the IGrid
     * @hidden
     */
    function Search(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * Searches Grid records by given key.
     *
     * > You can customize the default search action by using [`searchSettings`](grid/#searchsettings/).
     *
     * @param  {string} searchString - Defines the key.
     * @returns {void}
     */
    Search.prototype.search = function (searchString) {
        var gObj = this.parent;
        searchString = isNullOrUndefined(searchString) ? '' : searchString;
        if (isActionPrevent(gObj)) {
            gObj.notify(events.preventBatch, { instance: this, handler: this.search, arg1: searchString });
            return;
        }
        if (searchString !== gObj.searchSettings.key) {
            gObj.searchSettings.key = searchString.toString();
            gObj.dataBind();
        }
        else if (this.refreshSearch) {
            gObj.refresh();
        }
    };
    /**
     * @returns {void}
     * @hidden
     */
    Search.prototype.addEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.on(events.inBoundModelChanged, this.onPropertyChanged, this);
        this.parent.on(events.searchComplete, this.onSearchComplete, this);
        this.parent.on(events.destroy, this.destroy, this);
        this.actionCompleteFunc = this.onActionComplete.bind(this);
        this.parent.addEventListener(events.actionComplete, this.actionCompleteFunc);
        this.parent.on(events.cancelBegin, this.cancelBeginEvent, this);
    };
    /**
     * @returns {void}
     * @hidden
     */
    Search.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off(events.inBoundModelChanged, this.onPropertyChanged);
        this.parent.off(events.searchComplete, this.onSearchComplete);
        this.parent.off(events.destroy, this.destroy);
        this.parent.removeEventListener(events.actionComplete, this.actionCompleteFunc);
        this.parent.off(events.cancelBegin, this.cancelBeginEvent);
    };
    /**
     * To destroy the print
     *
     * @returns {void}
     * @hidden
     */
    Search.prototype.destroy = function () {
        this.removeEventListener();
    };
    /**
     * @param {NotifyArgs} e - specfies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    Search.prototype.onPropertyChanged = function (e) {
        if (e.module !== this.getModuleName()) {
            return;
        }
        if (!isNullOrUndefined(e.properties.key)) {
            this.parent.notify(events.modelChanged, {
                requestType: 'searching', type: events.actionBegin, searchString: this.parent.searchSettings.key
            });
        }
        else {
            this.parent.notify(events.modelChanged, {
                requestType: 'searching', type: events.actionBegin
            });
        }
    };
    /**
     * The function used to trigger onActionComplete
     *
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    Search.prototype.onSearchComplete = function (e) {
        this.parent.trigger(events.actionComplete, extend(e, {
            searchString: this.parent.searchSettings.key, requestType: 'searching', type: events.actionComplete
        }));
    };
    /**
     * The function used to store the requestType
     *
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    Search.prototype.onActionComplete = function (e) {
        this.refreshSearch = e.requestType !== 'searching';
    };
    Search.prototype.cancelBeginEvent = function (e) {
        if (e.requestType === 'searching') {
            this.parent.setProperties({ searchSettings: { key: '' } }, true);
        }
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    Search.prototype.getModuleName = function () {
        return 'search';
    };
    return Search;
}());
export { Search };
