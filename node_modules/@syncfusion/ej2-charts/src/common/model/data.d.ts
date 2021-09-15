import { Query, DataManager } from '@syncfusion/ej2-data';
/**
 * data module is used to generate query and dataSource
 */
export declare class Data {
    private dataManager;
    private query;
    /**
     * Constructor for data module
     *
     * @param dataSource
     * @param query
     * @param dataSource
     * @param query
     * @private
     */
    constructor(dataSource?: Object | DataManager, query?: Query);
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
    initDataManager(dataSource: Object | DataManager, query: Query): void;
    /**
     * The function used to generate updated Query from chart model
     *
     * @returns {void}
     * @private
     */
    generateQuery(): Query;
    /**
     * The function used to get dataSource by executing given Query
     *
     * @param  {Query} query - A Query that specifies to generate dataSource
     * @returns {void}
     * @private
     */
    getData(dataQuery: Query): Promise<Object>;
}
