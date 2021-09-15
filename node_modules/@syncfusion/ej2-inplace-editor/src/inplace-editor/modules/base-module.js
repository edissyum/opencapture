import { isNullOrUndefined as isNOU } from '@syncfusion/ej2-base';
import * as events from '../base/events';
/**
 * The `Base` module.
 */
var Base = /** @class */ (function () {
    function Base(parent, module) {
        this.parent = parent;
        this.module = module;
        this.addEventListener();
    }
    Base.prototype.render = function (e) {
        this.module.render(e);
    };
    Base.prototype.showPopup = function () {
        this.module.showPopup();
    };
    Base.prototype.focus = function () {
        this.module.focus();
    };
    Base.prototype.update = function (e) {
        this.module.updateValue(e);
    };
    Base.prototype.getValue = function () {
        this.module.getRenderValue();
    };
    Base.prototype.destroyComponent = function () {
        if (isNOU(this.module.compObj)) {
            return;
        }
        this.module.compObj.destroy();
        this.module.compObj = undefined;
    };
    Base.prototype.destroy = function () {
        this.destroyComponent();
        this.removeEventListener();
    };
    Base.prototype.addEventListener = function () {
        this.parent.on(events.render, this.render, this);
        this.parent.on(events.setFocus, this.focus, this);
        this.parent.on(events.showPopup, this.showPopup, this);
        this.parent.on(events.update, this.update, this);
        this.parent.on(events.accessValue, this.getValue, this);
        this.parent.on(events.destroyModules, this.destroyComponent, this);
        this.parent.on(events.destroy, this.destroy, this);
    };
    Base.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off(events.render, this.render);
        this.parent.off(events.setFocus, this.focus);
        this.parent.off(events.showPopup, this.showPopup);
        this.parent.off(events.update, this.update);
        this.parent.off(events.accessValue, this.getValue);
        this.parent.off(events.destroyModules, this.destroyComponent);
        this.parent.off(events.destroy, this.destroy);
    };
    return Base;
}());
export { Base };
