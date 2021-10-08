import { IGrid } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
import { Data } from './data';
/**
 * `ForeignKey` module is used to handle foreign key column's actions.
 */
export declare class ForeignKey extends Data {
    constructor(parent: IGrid, serviceLocator: ServiceLocator);
    private initEvent;
    private initForeignKeyColumns;
    private eventfPromise;
    private getForeignKeyData;
    private generateQueryFormData;
    private genarateQuery;
    private genarateColumnQuery;
    private isFiltered;
    protected getModuleName(): string;
    protected destroy(): void;
    private destroyEvent;
}
