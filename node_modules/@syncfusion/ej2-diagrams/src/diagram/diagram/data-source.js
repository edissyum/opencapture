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
import { Property, ChildProperty, Complex, Collection } from '@syncfusion/ej2-base';
import { DataMappingItems as DataMappingItems } from './data-mapping';
/**
 * Configures the data source that is to be bound with diagram
 * ```html
 * <div id='diagram'></div>
 * ```
 * ```typescript
 * let data: object[] = [
 * { Name: "Elizabeth", Role: "Director" },
 * { Name: "Christina", ReportingPerson: "Elizabeth", Role: "Manager" },
 * { Name: "Yoshi", ReportingPerson: "Christina", Role: "Lead" },
 * { Name: "Philip", ReportingPerson: "Christina", Role: "Lead" },
 * { Name: "Yang", ReportingPerson: "Elizabeth", Role: "Manager" },
 * { Name: "Roland", ReportingPerson: "Yang", Role: "Lead" },
 * { Name: "Yvonne", ReportingPerson: "Yang", Role: "Lead" }
 * ];
 * let items: DataManager = new DataManager(data as JSON[]);
 * let diagram: Diagram = new Diagram({
 * ...
 * layout: {
 *             type: 'OrganizationalChart'
 * },
 * dataSourceSettings: {
 * id: 'Name', parentId: 'ReportingPerson', dataManager: items,
 * }
 * ...
 * });
 * diagram.appendTo('#diagram');
 * ```
 */
var CrudAction = /** @class */ (function (_super) {
    __extends(CrudAction, _super);
    function CrudAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], CrudAction.prototype, "read", void 0);
    __decorate([
        Property('')
    ], CrudAction.prototype, "create", void 0);
    __decorate([
        Property('')
    ], CrudAction.prototype, "update", void 0);
    __decorate([
        Property('')
    ], CrudAction.prototype, "destroy", void 0);
    __decorate([
        Property()
    ], CrudAction.prototype, "customFields", void 0);
    return CrudAction;
}(ChildProperty));
export { CrudAction };
var ConnectionDataSource = /** @class */ (function (_super) {
    __extends(ConnectionDataSource, _super);
    function ConnectionDataSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], ConnectionDataSource.prototype, "id", void 0);
    __decorate([
        Property('')
    ], ConnectionDataSource.prototype, "sourceID", void 0);
    __decorate([
        Property('')
    ], ConnectionDataSource.prototype, "targetID", void 0);
    __decorate([
        Property(null)
    ], ConnectionDataSource.prototype, "sourcePointX", void 0);
    __decorate([
        Property(null)
    ], ConnectionDataSource.prototype, "sourcePointY", void 0);
    __decorate([
        Property(null)
    ], ConnectionDataSource.prototype, "targetPointX", void 0);
    __decorate([
        Property(null)
    ], ConnectionDataSource.prototype, "targetPointY", void 0);
    __decorate([
        Property(null)
    ], ConnectionDataSource.prototype, "dataManager", void 0);
    __decorate([
        Complex({}, CrudAction)
    ], ConnectionDataSource.prototype, "crudAction", void 0);
    return ConnectionDataSource;
}(ChildProperty));
export { ConnectionDataSource };
var DataSource = /** @class */ (function (_super) {
    __extends(DataSource, _super);
    function DataSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], DataSource.prototype, "id", void 0);
    __decorate([
        Property(null)
    ], DataSource.prototype, "dataManager", void 0);
    __decorate([
        Property(null)
    ], DataSource.prototype, "dataSource", void 0);
    __decorate([
        Property('')
    ], DataSource.prototype, "root", void 0);
    __decorate([
        Property('')
    ], DataSource.prototype, "parentId", void 0);
    __decorate([
        Property()
    ], DataSource.prototype, "doBinding", void 0);
    __decorate([
        Collection([], DataMappingItems)
    ], DataSource.prototype, "dataMapSettings", void 0);
    __decorate([
        Complex({}, CrudAction)
    ], DataSource.prototype, "crudAction", void 0);
    __decorate([
        Complex({}, ConnectionDataSource)
    ], DataSource.prototype, "connectionDataSource", void 0);
    return DataSource;
}(ChildProperty));
export { DataSource };
