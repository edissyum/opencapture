(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/esm5_rendering_formatter", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/ngcc/src/host/esm2015_host", "@angular/compiler-cli/ngcc/src/rendering/esm_rendering_formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Esm5RenderingFormatter = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var esm2015_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm2015_host");
    var esm_rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/esm_rendering_formatter");
    /**
     * A RenderingFormatter that works with files that use ECMAScript Module `import` and `export`
     * statements, but instead of `class` declarations it uses ES5 `function` wrappers for classes.
     */
    var Esm5RenderingFormatter = /** @class */ (function (_super) {
        tslib_1.__extends(Esm5RenderingFormatter, _super);
        function Esm5RenderingFormatter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Add the definitions, directly before the return statement, inside the IIFE of each decorated
         * class.
         */
        Esm5RenderingFormatter.prototype.addDefinitions = function (output, compiledClass, definitions) {
            var classSymbol = this.host.getClassSymbol(compiledClass.declaration);
            if (!classSymbol) {
                throw new Error("Compiled class \"" + compiledClass.name + "\" in \"" + compiledClass.declaration.getSourceFile()
                    .fileName + "\" does not have a valid syntax.\n" +
                    "Expected an ES5 IIFE wrapped function. But got:\n" +
                    compiledClass.declaration.getText());
            }
            var declarationStatement = esm2015_host_1.getContainingStatement(classSymbol.implementation.valueDeclaration);
            var iifeBody = declarationStatement.parent;
            if (!iifeBody || !ts.isBlock(iifeBody)) {
                throw new Error("Compiled class declaration is not inside an IIFE: " + compiledClass.name + " in " + compiledClass.declaration.getSourceFile().fileName);
            }
            var returnStatement = iifeBody.statements.find(ts.isReturnStatement);
            if (!returnStatement) {
                throw new Error("Compiled class wrapper IIFE does not have a return statement: " + compiledClass.name + " in " + compiledClass.declaration.getSourceFile().fileName);
            }
            var insertionPoint = returnStatement.getFullStart();
            output.appendLeft(insertionPoint, '\n' + definitions);
        };
        /**
         * Convert a `Statement` to JavaScript code in a format suitable for rendering by this formatter.
         *
         * @param stmt The `Statement` to print.
         * @param sourceFile A `ts.SourceFile` that provides context for the statement. See
         *     `ts.Printer#printNode()` for more info.
         * @param importManager The `ImportManager` to use for managing imports.
         *
         * @return The JavaScript code corresponding to `stmt` (in the appropriate format).
         */
        Esm5RenderingFormatter.prototype.printStatement = function (stmt, sourceFile, importManager) {
            var node = translator_1.translateStatement(stmt, importManager, { downlevelLocalizedStrings: true, downlevelVariableDeclarations: true });
            var code = this.printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
            return code;
        };
        return Esm5RenderingFormatter;
    }(esm_rendering_formatter_1.EsmRenderingFormatter));
    exports.Esm5RenderingFormatter = Esm5RenderingFormatter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNtNV9yZW5kZXJpbmdfZm9ybWF0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL3JlbmRlcmluZy9lc201X3JlbmRlcmluZ19mb3JtYXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQVNBLCtCQUFpQztJQUVqQyx5RUFBZ0Y7SUFFaEYsaUZBQTREO0lBRTVELDRHQUFnRTtJQUVoRTs7O09BR0c7SUFDSDtRQUE0QyxrREFBcUI7UUFBakU7O1FBb0RBLENBQUM7UUFuREM7OztXQUdHO1FBQ0gsK0NBQWMsR0FBZCxVQUFlLE1BQW1CLEVBQUUsYUFBNEIsRUFBRSxXQUFtQjtZQUNuRixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FDWCxzQkFBbUIsYUFBYSxDQUFDLElBQUksZ0JBQ2pDLGFBQWEsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFO3FCQUNwQyxRQUFRLHVDQUFtQztvQkFDcEQsbURBQW1EO29CQUNuRCxhQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDMUM7WUFDRCxJQUFNLG9CQUFvQixHQUN0QixxQ0FBc0IsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFeEUsSUFBTSxRQUFRLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDO1lBQzdDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLHVEQUFxRCxhQUFhLENBQUMsSUFBSSxZQUNuRixhQUFhLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVUsQ0FBQyxDQUFDO2FBQzNEO1lBRUQsSUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxtRUFDWixhQUFhLENBQUMsSUFBSSxZQUFPLGFBQWEsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBVSxDQUFDLENBQUM7YUFDcEY7WUFFRCxJQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRDs7Ozs7Ozs7O1dBU0c7UUFDSCwrQ0FBYyxHQUFkLFVBQWUsSUFBZSxFQUFFLFVBQXlCLEVBQUUsYUFBNEI7WUFDckYsSUFBTSxJQUFJLEdBQUcsK0JBQWtCLENBQzNCLElBQUksRUFBRSxhQUFhLEVBQ25CLEVBQUMseUJBQXlCLEVBQUUsSUFBSSxFQUFFLDZCQUE2QixFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFDNUUsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRS9FLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNILDZCQUFDO0lBQUQsQ0FBQyxBQXBERCxDQUE0QywrQ0FBcUIsR0FvRGhFO0lBcERZLHdEQUFzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtTdGF0ZW1lbnR9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCBNYWdpY1N0cmluZyBmcm9tICdtYWdpYy1zdHJpbmcnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7SW1wb3J0TWFuYWdlciwgdHJhbnNsYXRlU3RhdGVtZW50fSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvdHJhbnNsYXRvcic7XG5pbXBvcnQge0NvbXBpbGVkQ2xhc3N9IGZyb20gJy4uL2FuYWx5c2lzL3R5cGVzJztcbmltcG9ydCB7Z2V0Q29udGFpbmluZ1N0YXRlbWVudH0gZnJvbSAnLi4vaG9zdC9lc20yMDE1X2hvc3QnO1xuXG5pbXBvcnQge0VzbVJlbmRlcmluZ0Zvcm1hdHRlcn0gZnJvbSAnLi9lc21fcmVuZGVyaW5nX2Zvcm1hdHRlcic7XG5cbi8qKlxuICogQSBSZW5kZXJpbmdGb3JtYXR0ZXIgdGhhdCB3b3JrcyB3aXRoIGZpbGVzIHRoYXQgdXNlIEVDTUFTY3JpcHQgTW9kdWxlIGBpbXBvcnRgIGFuZCBgZXhwb3J0YFxuICogc3RhdGVtZW50cywgYnV0IGluc3RlYWQgb2YgYGNsYXNzYCBkZWNsYXJhdGlvbnMgaXQgdXNlcyBFUzUgYGZ1bmN0aW9uYCB3cmFwcGVycyBmb3IgY2xhc3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEVzbTVSZW5kZXJpbmdGb3JtYXR0ZXIgZXh0ZW5kcyBFc21SZW5kZXJpbmdGb3JtYXR0ZXIge1xuICAvKipcbiAgICogQWRkIHRoZSBkZWZpbml0aW9ucywgZGlyZWN0bHkgYmVmb3JlIHRoZSByZXR1cm4gc3RhdGVtZW50LCBpbnNpZGUgdGhlIElJRkUgb2YgZWFjaCBkZWNvcmF0ZWRcbiAgICogY2xhc3MuXG4gICAqL1xuICBhZGREZWZpbml0aW9ucyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBjb21waWxlZENsYXNzOiBDb21waWxlZENsYXNzLCBkZWZpbml0aW9uczogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2xhc3NTeW1ib2wgPSB0aGlzLmhvc3QuZ2V0Q2xhc3NTeW1ib2woY29tcGlsZWRDbGFzcy5kZWNsYXJhdGlvbik7XG4gICAgaWYgKCFjbGFzc1N5bWJvbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBDb21waWxlZCBjbGFzcyBcIiR7Y29tcGlsZWRDbGFzcy5uYW1lfVwiIGluIFwiJHtcbiAgICAgICAgICAgICAgY29tcGlsZWRDbGFzcy5kZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKClcbiAgICAgICAgICAgICAgICAgIC5maWxlTmFtZX1cIiBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgc3ludGF4LlxcbmAgK1xuICAgICAgICAgIGBFeHBlY3RlZCBhbiBFUzUgSUlGRSB3cmFwcGVkIGZ1bmN0aW9uLiBCdXQgZ290OlxcbmAgK1xuICAgICAgICAgIGNvbXBpbGVkQ2xhc3MuZGVjbGFyYXRpb24uZ2V0VGV4dCgpKTtcbiAgICB9XG4gICAgY29uc3QgZGVjbGFyYXRpb25TdGF0ZW1lbnQgPVxuICAgICAgICBnZXRDb250YWluaW5nU3RhdGVtZW50KGNsYXNzU3ltYm9sLmltcGxlbWVudGF0aW9uLnZhbHVlRGVjbGFyYXRpb24pO1xuXG4gICAgY29uc3QgaWlmZUJvZHkgPSBkZWNsYXJhdGlvblN0YXRlbWVudC5wYXJlbnQ7XG4gICAgaWYgKCFpaWZlQm9keSB8fCAhdHMuaXNCbG9jayhpaWZlQm9keSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ29tcGlsZWQgY2xhc3MgZGVjbGFyYXRpb24gaXMgbm90IGluc2lkZSBhbiBJSUZFOiAke2NvbXBpbGVkQ2xhc3MubmFtZX0gaW4gJHtcbiAgICAgICAgICBjb21waWxlZENsYXNzLmRlY2xhcmF0aW9uLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXR1cm5TdGF0ZW1lbnQgPSBpaWZlQm9keS5zdGF0ZW1lbnRzLmZpbmQodHMuaXNSZXR1cm5TdGF0ZW1lbnQpO1xuICAgIGlmICghcmV0dXJuU3RhdGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbXBpbGVkIGNsYXNzIHdyYXBwZXIgSUlGRSBkb2VzIG5vdCBoYXZlIGEgcmV0dXJuIHN0YXRlbWVudDogJHtcbiAgICAgICAgICBjb21waWxlZENsYXNzLm5hbWV9IGluICR7Y29tcGlsZWRDbGFzcy5kZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWV9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5zZXJ0aW9uUG9pbnQgPSByZXR1cm5TdGF0ZW1lbnQuZ2V0RnVsbFN0YXJ0KCk7XG4gICAgb3V0cHV0LmFwcGVuZExlZnQoaW5zZXJ0aW9uUG9pbnQsICdcXG4nICsgZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBgU3RhdGVtZW50YCB0byBKYXZhU2NyaXB0IGNvZGUgaW4gYSBmb3JtYXQgc3VpdGFibGUgZm9yIHJlbmRlcmluZyBieSB0aGlzIGZvcm1hdHRlci5cbiAgICpcbiAgICogQHBhcmFtIHN0bXQgVGhlIGBTdGF0ZW1lbnRgIHRvIHByaW50LlxuICAgKiBAcGFyYW0gc291cmNlRmlsZSBBIGB0cy5Tb3VyY2VGaWxlYCB0aGF0IHByb3ZpZGVzIGNvbnRleHQgZm9yIHRoZSBzdGF0ZW1lbnQuIFNlZVxuICAgKiAgICAgYHRzLlByaW50ZXIjcHJpbnROb2RlKClgIGZvciBtb3JlIGluZm8uXG4gICAqIEBwYXJhbSBpbXBvcnRNYW5hZ2VyIFRoZSBgSW1wb3J0TWFuYWdlcmAgdG8gdXNlIGZvciBtYW5hZ2luZyBpbXBvcnRzLlxuICAgKlxuICAgKiBAcmV0dXJuIFRoZSBKYXZhU2NyaXB0IGNvZGUgY29ycmVzcG9uZGluZyB0byBgc3RtdGAgKGluIHRoZSBhcHByb3ByaWF0ZSBmb3JtYXQpLlxuICAgKi9cbiAgcHJpbnRTdGF0ZW1lbnQoc3RtdDogU3RhdGVtZW50LCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyKTogc3RyaW5nIHtcbiAgICBjb25zdCBub2RlID0gdHJhbnNsYXRlU3RhdGVtZW50KFxuICAgICAgICBzdG10LCBpbXBvcnRNYW5hZ2VyLFxuICAgICAgICB7ZG93bmxldmVsTG9jYWxpemVkU3RyaW5nczogdHJ1ZSwgZG93bmxldmVsVmFyaWFibGVEZWNsYXJhdGlvbnM6IHRydWV9KTtcbiAgICBjb25zdCBjb2RlID0gdGhpcy5wcmludGVyLnByaW50Tm9kZSh0cy5FbWl0SGludC5VbnNwZWNpZmllZCwgbm9kZSwgc291cmNlRmlsZSk7XG5cbiAgICByZXR1cm4gY29kZTtcbiAgfVxufVxuIl19