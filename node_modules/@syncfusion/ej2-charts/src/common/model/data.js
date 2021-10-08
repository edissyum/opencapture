/* eslint-disable @typescript-eslint/ban-types */
import { Query, DataManager, Deferred } from '@syncfusion/ej2-data';
/**
 * data module is used to generate query and dataSource
 */
var Data = /** @class */ (function () {
    /**
     * Constructor for data module
     *
     * @param dataSource
     * @param query
     * @param dataSource
     * @param query
     * @private
     */
    function Data(dataSource, query) {
        this.initDataManager(dataSource, query);
    }
    /**
     * The function used to initialize dataManager and query
     *
     * @param dataSource
     * @param query
     * @param dataSource
     * @param query
     * @returns {void}
     * @private
     */
    Data.prototype.initDataManager = function (dataSource, query) {
        this.dataManager = dataSource instanceof DataManager ? dataSource : new DataManager(dataSource);
        this.query = query instanceof Query ? query : new Query();
    };
    /**
     * The function used to generate updated Query from chart model
     *
     * @returns {void}
     * @private
     */
    Data.prototype.generateQuery = function () {
        var query = this.query.clone();
        return query;
    };
    /**
     * The function used to get dataSource by executing given Query
     *
     * @param  {Query} query - A Query that specifies to generate dataSource
     * @returns {void}
     * @private
     */
    Data.prototype.getData = function (dataQuery) {
        var _this = this;
        if (this.dataManager.ready) {
            var dataManagerDeferred_1 = new Deferred();
            var ready = this.dataManager.ready;
            ready.then(function () {
                _this.dataManager.executeQuery(dataQuery).then(function (result) {
                    dataManagerDeferred_1.resolve(result);
                });
            }).catch(function (e) { dataManagerDeferred_1.reject(e); });
            return dataManagerDeferred_1.promise;
        }
        else {
            return this.dataManager.executeQuery(dataQuery);
        }
    };
    return Data;
}());
export { Data };
