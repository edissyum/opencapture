import { ChildProperty } from '@syncfusion/ej2-base';
/**
 * Configures the column chooser behavior of the Grid.
 */
export declare class ColumnChooserSettings extends ChildProperty<ColumnChooserSettings> {
    /**
     * Defines the search operator for Column Chooser.
     *
     * @default 'startsWith'
     * @blazorType Syncfusion.Blazor.Operator
     * @blazorDefaultValue Syncfusion.Blazor.Operator.StartsWith
     */
    operator: string;
    /**
     * If ignoreAccent set to true, then ignores the diacritic characters or accents while searching in column chooser dialog.
     *
     * @default false
     */
    ignoreAccent: boolean;
}
