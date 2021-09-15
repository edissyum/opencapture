var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Property, Complex, ChildProperty, Collection } from '@syncfusion/ej2-base';
/**
 * Defines the combination of keys and modifier keys
 */
var KeyGesture = /** @class */ (function (_super) {
    __extends(KeyGesture, _super);
    function KeyGesture() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property()
    ], KeyGesture.prototype, "key", void 0);
    __decorate([
        Property()
    ], KeyGesture.prototype, "keyModifiers", void 0);
    return KeyGesture;
}(ChildProperty));
export { KeyGesture };
/**
 * Defines a command and a key gesture to define when the command should be executed
 */
var Command = /** @class */ (function (_super) {
    __extends(Command, _super);
    function Command() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     *
     * Returns the name of class Command
     * @returns {string}  Returns the name of class Command
     * @private
     */
    Command.prototype.getClassName = function () {
        return 'Command';
    };
    __decorate([
        Property('')
    ], Command.prototype, "name", void 0);
    __decorate([
        Property()
    ], Command.prototype, "canExecute", void 0);
    __decorate([
        Property()
    ], Command.prototype, "execute", void 0);
    __decorate([
        Complex({}, KeyGesture)
    ], Command.prototype, "gesture", void 0);
    __decorate([
        Property('')
    ], Command.prototype, "parameter", void 0);
    return Command;
}(ChildProperty));
export { Command };
/**
 * Defines the collection of commands and the corresponding key gestures
 */
var CommandManager = /** @class */ (function (_super) {
    __extends(CommandManager, _super);
    function CommandManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Collection([], Command)
    ], CommandManager.prototype, "commands", void 0);
    return CommandManager;
}(ChildProperty));
export { CommandManager };
/**
 * Defines the behavior of the context menu items
 */
var ContextMenuSettings = /** @class */ (function (_super) {
    __extends(ContextMenuSettings, _super);
    function ContextMenuSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property()
    ], ContextMenuSettings.prototype, "show", void 0);
    __decorate([
        Property()
    ], ContextMenuSettings.prototype, "showCustomMenuOnly", void 0);
    __decorate([
        Property()
    ], ContextMenuSettings.prototype, "items", void 0);
    return ContextMenuSettings;
}(ChildProperty));
export { ContextMenuSettings };
