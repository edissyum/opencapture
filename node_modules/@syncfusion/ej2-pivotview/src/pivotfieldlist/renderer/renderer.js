import { DialogRenderer } from '../renderer/dialog-renderer';
import { TreeViewRenderer } from '../renderer/tree-renderer';
import { AxisTableRenderer } from '../renderer/axis-table-renderer';
import { AxisFieldRenderer } from './axis-field-renderer';
/**
 * Module to render Pivot Table component
 */
/** @hidden */
var Render = /** @class */ (function () {
    /** Constructor for render module
     * @param {PivotFieldList} parent - Instance of field list.
     */
    function Render(parent) {
        this.parent = parent;
        this.parent.dialogRenderer = new DialogRenderer(this.parent);
        this.parent.treeViewModule = new TreeViewRenderer(this.parent);
        this.parent.axisTableModule = new AxisTableRenderer(this.parent);
        this.parent.axisFieldModule = new AxisFieldRenderer(this.parent);
    }
    /**
     * Initialize the pivot table rendering
     * @returns {void}
     * @private
     */
    Render.prototype.render = function () {
        this.parent.dialogRenderer.render();
        if (!this.parent.isAdaptive) {
            this.parent.treeViewModule.render();
        }
        this.parent.axisTableModule.render();
    };
    return Render;
}());
export { Render };
