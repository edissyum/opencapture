import { IGrid } from '../base/interface';
import { EditRender } from '../renderer/edit-renderer';
import { ServiceLocator } from '../services/service-locator';
import { NormalEdit } from './normal-edit';
/**
 * `DialogEdit` module is used to handle dialog editing actions.
 *
 * @hidden
 */
export declare class DialogEdit extends NormalEdit {
    protected parent: IGrid;
    protected serviceLocator: ServiceLocator;
    protected renderer: EditRender;
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator, renderer?: EditRender);
    closeEdit(): void;
    addRecord(data?: Object, index?: number): void;
    endEdit(): void;
    updateRow(index: number, data?: Object): void;
    deleteRecord(fieldname?: string, data?: Object): void;
    protected startEdit(tr?: Element): void;
}
