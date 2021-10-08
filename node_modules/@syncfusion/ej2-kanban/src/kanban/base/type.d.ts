/**
 * Kanban Types
 */
/**
 * Defines types to be used as ReturnType.
 */
export declare type ReturnType = {
    result: Record<string, any>[];
    count: number;
    aggregates?: Record<string, any>;
};
/**
 * Defines types to be used as CurrentAction.
 */
export declare type CurrentAction = 'Add' | 'Edit' | 'Delete';
/**
 * Defines types to be used as SelectionType.
 */
export declare type SelectionType = 'None' | 'Single' | 'Multiple';
/**
 * Defines types to be used as SortDirection.
 */
export declare type SortDirection = 'Ascending' | 'Descending';
/**
 * Defines types to be used as SortOrder.
 */
export declare type SortOrderBy = 'DataSourceOrder' | 'Index' | 'Custom';
/**
 * Defines types to be used as ConstraintType.
 */
export declare type ConstraintType = 'Column' | 'Swimlane';
/**
 * Defines types used to specifies the Dialog Field Type.
 */
export declare type DialogFieldType = 'TextBox' | 'DropDown' | 'Numeric' | 'TextArea';
