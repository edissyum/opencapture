import { Query, DataManager } from '@syncfusion/ej2-data';
import { IDataProcessor, IGrid, PendingState } from '../base/interface';
import { PredicateModel } from '../base/grid-model';
import { ServiceLocator } from '../services/service-locator';
import { Column } from '../models/column';
/**
 * Grid data module is used to generate query and data source.
 *
 * @hidden
 */
export declare class Data implements IDataProcessor {
    dataManager: DataManager;
    /** @hidden */
    isQueryInvokedFromData: boolean;
    protected parent: IGrid;
    protected serviceLocator: ServiceLocator;
    protected dataState: PendingState;
    foreignKeyDataState: PendingState;
    /**
     * Constructor for data module.
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {ServiceLocator} serviceLocator - specifies the service locator
     * @hidden
     */
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator);
    private reorderRows;
    protected getModuleName(): string;
    /**
     * The function used to initialize dataManager and external query
     *
     * @returns {void}
     */
    private initDataManager;
    /**
     * The function is used to generate updated Query from Grid model.
     *
     * @param {boolean} skipPage - specifies the boolean to skip the page
     * @returns {Query} returns the Query
     * @hidden
     */
    generateQuery(skipPage?: boolean): Query;
    /**
     * @param {Query} query - specifies the query
     * @returns {Query} - returns the query
     * @hidden
     */
    aggregateQuery(query: Query): Query;
    protected virtualGroupPageQuery(query: Query): Query;
    protected pageQuery(query: Query, skipPage?: boolean): Query;
    protected groupQuery(query: Query): Query;
    protected sortQuery(query: Query): Query;
    protected searchQuery(query: Query, fcolumn?: Column, isForeignKey?: boolean): Query;
    protected filterQuery(query: Query, column?: PredicateModel[], skipFoerign?: boolean): Query;
    private fGeneratePredicate;
    /**
     * The function is used to get dataManager promise by executing given Query.
     *
     * @param {object} args - specifies the object
     * @param {string} args.requestType - Defines the request type
     * @param {string[]} args.foreignKeyData - Defines the foreignKeyData.string
     * @param {Object} args.data - Defines the data.
     * @param {number} args.index - Defines the index .
     * @param {Query} query - Defines the query which will execute along with data processing.
     * @returns {Promise<Object>} - returns the object
     * @hidden
     */
    getData(args?: {
        requestType?: string;
        foreignKeyData?: string[];
        data?: Object;
        index?: number;
    }, query?: Query): Promise<Object>;
    private insert;
    private executeQuery;
    private formatGroupColumn;
    private crudActions;
    /**
     * @param {object} changes - specifies the changes
     * @param {string} key - specifies the key
     * @param {object} original - specifies the original data
     * @param {Query} query - specifies the query
     * @returns {Promise<Object>} returns the object
     * @hidden
     */
    saveChanges(changes: Object, key: string, original: Object, query?: Query): Promise<Object>;
    private getKey;
    /**
     * @returns {boolean} returns whether its remote data
     * @hidden
     */
    isRemote(): boolean;
    private addRows;
    private removeRows;
    private getColumnByField;
    protected destroy(): void;
    getState(): PendingState;
    setState(state: PendingState): Object;
    getForeignKeyDataState(): PendingState;
    setForeignKeyDataState(state: PendingState): void;
    getStateEventArgument(query: Query): PendingState;
    private eventPromise;
    /**
     * Gets the columns where searching needs to be performed from the Grid.
     *
     * @returns {string[]} returns the searched column field names
     */
    private getSearchColumnFieldNames;
    private refreshFilteredCols;
}
