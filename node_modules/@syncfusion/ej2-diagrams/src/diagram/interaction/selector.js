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
import { Property, ChildProperty, Complex } from '@syncfusion/ej2-base';
import { Margin } from '../core/appearance';
/**
 * A collection of frequently used commands that will be added around the selector
 * ```html
 * <div id='diagram'></div>
 * ```
 * ```typescript
 * let nodes: NodeModel[] = [{
 *           id: 'node1', width: 100, height: 100, offsetX: 100, offsetY: 100,
 *           annotations: [{ content: 'Default Shape' }]
 *       },
 *       {
 *           id: 'node2', width: 100, height: 100, offsetX: 300, offsetY: 100,
 *           shape: {
 *               type: 'Basic', shape: 'Ellipse'
 *           },
 *           annotations: [{ content: 'Path Element' }]
 *       }
 *       ];
 *       let connectors: ConnectorModel[] = [{
 *           id: 'connector1',
 *           type: 'Straight',
 *           sourcePoint: { x: 100, y: 300 },
 *           targetPoint: { x: 200, y: 400 },
 *       }];
 * let handle: UserHandleModel[] = [
 * { name: 'handle', margin: { top: 0, bottom: 0, left: 0, right: 0 }, offset: 0,
 * pathData: 'M 376.892,225.284L 371.279,211.95L 376.892,198.617L 350.225,211.95L 376.892,225.284 Z',
 * side: 'Top', horizontalAlignment: 'Center', verticalAlignment: 'Center',
 * pathColor: 'yellow' }];
 * let diagram: Diagram = new Diagram({
 * ...
 *     connectors: connectors, nodes: nodes,
 *     selectedItems: { constraints: SelectorConstraints.All, userHandles: handle },
 * ...
 * });
 * diagram.appendTo('#diagram');
 * ```
 * @default {}
 */
var UserHandle = /** @class */ (function (_super) {
    __extends(UserHandle, _super);
    function UserHandle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     *
     * Returns the name of class UserHandle
     *
     * @returns {string}  Returns the name of class UserHandle
     * @private
     */
    UserHandle.prototype.getClassName = function () {
        return 'UserHandle';
    };
    __decorate([
        Property('')
    ], UserHandle.prototype, "name", void 0);
    __decorate([
        Property('')
    ], UserHandle.prototype, "pathData", void 0);
    __decorate([
        Property('')
    ], UserHandle.prototype, "content", void 0);
    __decorate([
        Property('')
    ], UserHandle.prototype, "source", void 0);
    __decorate([
        Property('#000000')
    ], UserHandle.prototype, "backgroundColor", void 0);
    __decorate([
        Property('Top')
    ], UserHandle.prototype, "side", void 0);
    __decorate([
        Property('')
    ], UserHandle.prototype, "borderColor", void 0);
    __decorate([
        Property(0.5)
    ], UserHandle.prototype, "borderWidth", void 0);
    __decorate([
        Property(25)
    ], UserHandle.prototype, "size", void 0);
    __decorate([
        Property('white')
    ], UserHandle.prototype, "pathColor", void 0);
    __decorate([
        Property(10)
    ], UserHandle.prototype, "displacement", void 0);
    __decorate([
        Property(true)
    ], UserHandle.prototype, "visible", void 0);
    __decorate([
        Property(0)
    ], UserHandle.prototype, "offset", void 0);
    __decorate([
        Complex({}, Margin)
    ], UserHandle.prototype, "margin", void 0);
    __decorate([
        Property('Center')
    ], UserHandle.prototype, "horizontalAlignment", void 0);
    __decorate([
        Property('Center')
    ], UserHandle.prototype, "verticalAlignment", void 0);
    __decorate([
        Property(false)
    ], UserHandle.prototype, "disableNodes", void 0);
    __decorate([
        Property(false)
    ], UserHandle.prototype, "disableConnectors", void 0);
    __decorate([
        Property('')
    ], UserHandle.prototype, "template", void 0);
    return UserHandle;
}(ChildProperty));
export { UserHandle };
