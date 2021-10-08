import { DataManager } from '@syncfusion/ej2-data';
import { ChildProperty } from '@syncfusion/ej2-base';
import { CrudActionModel, ConnectionDataSourceModel } from './data-source-model';
import { DataMappingItemsModel } from './data-mapping-model';
/**
 * Configures the data source that is to be bound with diagram
 * ```html
 * <div id='diagram'></div>
 * ```
 * ```typescript
 * let data: object[] = [
 * { Name: "Elizabeth", Role: "Director" },
 * { Name: "Christina", ReportingPerson: "Elizabeth", Role: "Manager" },
 * { Name: "Yoshi", ReportingPerson: "Christina", Role: "Lead" },
 * { Name: "Philip", ReportingPerson: "Christina", Role: "Lead" },
 * { Name: "Yang", ReportingPerson: "Elizabeth", Role: "Manager" },
 * { Name: "Roland", ReportingPerson: "Yang", Role: "Lead" },
 * { Name: "Yvonne", ReportingPerson: "Yang", Role: "Lead" }
 * ];
 * let items: DataManager = new DataManager(data as JSON[]);
 * let diagram: Diagram = new Diagram({
 * ...
 * layout: {
 *             type: 'OrganizationalChart'
 * },
 * dataSourceSettings: {
 * id: 'Name', parentId: 'ReportingPerson', dataManager: items,
 * }
 * ...
 * });
 * diagram.appendTo('#diagram');
 * ```
 */
export declare class CrudAction extends ChildProperty<CrudAction> {
    /**
     * set an URL to get a data from database
     *
     * @default ''
     */
    read: string;
    /**
     * set an URL to add a data into database
     *
     * @default ''
     */
    create: string;
    /**
     * set an URL to update the existing data in database
     *
     * @default ''
     */
    update: string;
    /**
     * set an URL to remove an data in database
     *
     * @default ''
     */
    destroy: string;
    /**
     * Add custom fields to node
     *
     * @aspDefaultValueIgnore
     * @default undefined
     */
    customFields: Object[];
}
export declare class ConnectionDataSource extends ChildProperty<ConnectionDataSource> {
    /**
     * set an id for connector dataSource
     *
     * @default ''
     */
    id: string;
    /**
     * define sourceID to connect with connector
     *
     * @default ''
     */
    sourceID: string;
    /**
     * define targetID to connect with connector
     *
     * @default ''
     */
    targetID: string;
    /**
     * define sourcePoint to render connector startPoint
     *
     * @default null
     */
    sourcePointX: number;
    /**
     * define sourcePoint to render connector startPoint
     *
     * @default null
     */
    sourcePointY: number;
    /**
     * define targetPoint to render connector targetPoint
     *
     * @default null
     */
    targetPointX: number;
    /**
     * define targetPoint to render connector targetPoint
     *
     * @default null
     */
    targetPointY: number;
    /**
     * Sets the data source either as a collection of objects or as an URL of DataManager
     *
     * @default null
     */
    dataManager: DataManager;
    /**
     * Add CrudAction to connector data source
     *
     * @aspDefaultValueIgnore
     * @default undefined

     */
    crudAction: CrudActionModel;
}
export declare class DataSource extends ChildProperty<DataSource> {
    /**
     * Sets the unique id of the data source items
     *
     * @default ''
     */
    id: string;
    /**
     * Sets the data source either as a collection of objects or as an URL of DataManager
     *
     * @default null

     */
    dataManager: DataManager;
    /**
     * Sets the data source either as a collection of objects or as an URL of DataManager
     *
     * @default null
     */
    dataSource: DataManager;
    /**
     * Sets the unique id of the root data source item
     *
     * @default ''
     */
    root: string;
    /**
     * Sets the unique id that defines the relationship between the data source items
     *
     * @default ''
     */
    parentId: string;
    /**
     * Binds the custom data with node model
     *
     * @aspDefaultValueIgnore
     * @default undefined

     */
    doBinding: Function | string;
    /**
     * A collection of JSON objects where each object represents an Data Map Items.
     *
     * @default []
     */
    dataMapSettings: DataMappingItemsModel[];
    /**
     * Add CrudAction to data source
     *
     * @aspDefaultValueIgnore
     * @default undefined

     */
    crudAction: CrudActionModel;
    /**
     * define connectorDataSource collection
     *
     * @aspDefaultValueIgnore
     * @default undefined
     */
    connectionDataSource: ConnectionDataSourceModel;
}
