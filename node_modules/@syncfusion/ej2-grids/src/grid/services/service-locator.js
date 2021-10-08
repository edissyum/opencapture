import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { ResponsiveDialogRenderer } from '../renderer/responsive-dialog-renderer';
/**
 * ServiceLocator
 *
 * @hidden
 */
var ServiceLocator = /** @class */ (function () {
    function ServiceLocator() {
        this.services = {};
    }
    ServiceLocator.prototype.register = function (name, type) {
        if (isNullOrUndefined(this.services[name])) {
            this.services[name] = type;
        }
    };
    ServiceLocator.prototype.getService = function (name) {
        if (isNullOrUndefined(this.services[name])) {
            // eslint-disable-next-line no-throw-literal
            throw "The service " + name + " is not registered";
        }
        return this.services[name];
    };
    ServiceLocator.prototype.registerAdaptiveService = function (type, isAdaptiveUI, action) {
        if (isAdaptiveUI) {
            type.responsiveDialogRenderer = new ResponsiveDialogRenderer(type.parent, type.serviceLocator);
            type.responsiveDialogRenderer.action = action;
        }
        else {
            if (type.responsiveDialogRenderer) {
                type.responsiveDialogRenderer.removeEventListener();
                type.responsiveDialogRenderer = undefined;
            }
        }
    };
    return ServiceLocator;
}());
export { ServiceLocator };
