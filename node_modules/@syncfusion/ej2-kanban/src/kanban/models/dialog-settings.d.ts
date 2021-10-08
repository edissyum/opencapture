import { ChildProperty } from '@syncfusion/ej2-base';
import { DialogFieldsModel } from './dialog-fields-model';
import { KanbanDialogModel } from './kanban-dialog-model';
/**
 * Holds the configuration of editor settings.
 */
export declare class DialogSettings extends ChildProperty<DialogSettings> {
    /**
     * Defines the dialog template
     *
     * @default null
     */
    template: string;
    /**
     * Defines the dialog fields
     *
     * @default []
     */
    fields: DialogFieldsModel[];
    /**
     * Customize the model object configuration for the edit or add Dialog component.
     *
     * @default null
     */
    model: KanbanDialogModel;
}
