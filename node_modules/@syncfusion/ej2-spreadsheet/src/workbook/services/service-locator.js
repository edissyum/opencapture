import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * ServiceLocator
 *
 * @hidden
 */
var ServiceLocator = /** @class */ (function () {
    function ServiceLocator() {
        this.services = {};
    }
    ServiceLocator.prototype.getService = function (name) {
        if (isNullOrUndefined(this.services[name])) {
            // eslint-disable-next-line no-throw-literal
            throw "The service " + name + " is not registered";
        }
        return this.services[name];
    };
    ServiceLocator.prototype.register = function (name, type) {
        if (isNullOrUndefined(this.services[name])) {
            this.services[name] = type;
        }
    };
    return ServiceLocator;
}());
export { ServiceLocator };
