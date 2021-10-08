import { merge } from '@syncfusion/ej2-base';
/**
 * Configures column collection in Gantt.
 */
var Column = /** @class */ (function () {
    function Column(options) {
        /**
         * If `allowEditing` set to false, then it disables editing of a particular column.
         * By default all columns are editable.
         *
         * @default true
         */
        this.allowEditing = true;
        /**
         * If `allowReordering` set to false, then it disables reorder of a particular column.
         * By default all columns can be reorder.
         *
         * @default true
         */
        this.allowReordering = true;
        /**
         * If `allowResizing` is set to false, it disables resize option of a particular column.
         * By default all the columns can be resized.
         *
         * @default true
         */
        this.allowResizing = true;
        /**
         * If `allowSorting` set to false, then it disables sorting option of a particular column.
         * By default all columns are sortable.
         *
         * @default true
         */
        this.allowSorting = true;
        /**
         * If `allowFiltering` set to false, then it disables filtering option and filter bar element of a particular column.
         * By default all columns are filterable.
         *
         * @default true
         */
        this.allowFiltering = true;
        /**
         * Defines the `IEditCell` object to customize default edit cell.
         *
         * @default {}
         */
        this.edit = {};
        merge(this, options);
    }
    return Column;
}());
export { Column };
