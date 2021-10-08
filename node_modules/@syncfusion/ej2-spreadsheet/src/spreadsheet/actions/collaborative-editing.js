import { collaborativeUpdate, updateAction } from '../common/index';
/**
 * Collaborative Editing module for real time changes in the Spreadsheet.
 */
var CollaborativeEditing = /** @class */ (function () {
    function CollaborativeEditing(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    CollaborativeEditing.prototype.refreshClients = function (options) {
        updateAction(options, this.parent);
    };
    CollaborativeEditing.prototype.addEventListener = function () {
        this.parent.on(collaborativeUpdate, this.refreshClients, this);
    };
    CollaborativeEditing.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(collaborativeUpdate, this.refreshClients);
        }
    };
    /**
     * Destroy collaborative editing module.
     *
     * @returns {void} - Destroy collaborative editing module.
     */
    CollaborativeEditing.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    /**
     * Get the collaborative editing module name.
     *
     * @returns {string} - Get the collaborative editing module name.
     */
    CollaborativeEditing.prototype.getModuleName = function () {
        return 'collaborativeEditing';
    };
    return CollaborativeEditing;
}());
export { CollaborativeEditing };
