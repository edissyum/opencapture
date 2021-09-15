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
        this.services[name] = type;
    };
    ServiceLocator.prototype.getService = function (name) {
        return this.services[name];
    };
    return ServiceLocator;
}());
export { ServiceLocator };
