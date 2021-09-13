(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_linker_selector", ["require", "exports", "tslib", "semver", "@angular/compiler-cli/linker/src/file_linker/get_source_file", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_component_linker_1", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_directive_linker_1", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_pipe_linker_1"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PartialLinkerSelector = exports.declarationFunctions = exports.ɵɵngDeclarePipe = exports.ɵɵngDeclareComponent = exports.ɵɵngDeclareDirective = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var semver_1 = require("semver");
    var get_source_file_1 = require("@angular/compiler-cli/linker/src/file_linker/get_source_file");
    var partial_component_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_component_linker_1");
    var partial_directive_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_directive_linker_1");
    var partial_pipe_linker_1_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_pipe_linker_1");
    exports.ɵɵngDeclareDirective = 'ɵɵngDeclareDirective';
    exports.ɵɵngDeclareComponent = 'ɵɵngDeclareComponent';
    exports.ɵɵngDeclarePipe = 'ɵɵngDeclarePipe';
    exports.declarationFunctions = [exports.ɵɵngDeclareDirective, exports.ɵɵngDeclareComponent, exports.ɵɵngDeclarePipe];
    /**
     * A helper that selects the appropriate `PartialLinker` for a given declaration.
     *
     * The selection is made from a database of linker instances, chosen if their given semver range
     * satisfies the version found in the code to be linked.
     *
     * Note that the ranges are checked in order, and the first matching range will be selected, so
     * ranges should be most restrictive first.
     *
     * Also, ranges are matched to include "pre-releases", therefore if the range is `>=11.1.0-next.1`
     * then this includes `11.1.0-next.2` and also `12.0.0-next.1`.
     *
     * Finally, note that we always start with the current version (i.e. `11.2.14`). This
     * allows the linker to work on local builds effectively.
     */
    var PartialLinkerSelector = /** @class */ (function () {
        function PartialLinkerSelector(environment, sourceUrl, code) {
            this.linkers = this.createLinkerMap(environment, sourceUrl, code);
        }
        /**
         * Returns true if there are `PartialLinker` classes that can handle functions with this name.
         */
        PartialLinkerSelector.prototype.supportsDeclaration = function (functionName) {
            return this.linkers.has(functionName);
        };
        /**
         * Returns the `PartialLinker` that can handle functions with the given name and version.
         * Throws an error if there is none.
         */
        PartialLinkerSelector.prototype.getLinker = function (functionName, version) {
            var e_1, _a;
            if (!this.linkers.has(functionName)) {
                throw new Error("Unknown partial declaration function " + functionName + ".");
            }
            var versions = this.linkers.get(functionName);
            try {
                for (var versions_1 = tslib_1.__values(versions), versions_1_1 = versions_1.next(); !versions_1_1.done; versions_1_1 = versions_1.next()) {
                    var _b = versions_1_1.value, range = _b.range, linker = _b.linker;
                    if (semver_1.satisfies(version, range, { includePrerelease: true })) {
                        return linker;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (versions_1_1 && !versions_1_1.done && (_a = versions_1.return)) _a.call(versions_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            throw new Error("Unsupported partial declaration version " + version + " for " + functionName + ".\n" +
                'Valid version ranges are:\n' + versions.map(function (v) { return " - " + v.range; }).join('\n'));
        };
        PartialLinkerSelector.prototype.createLinkerMap = function (environment, sourceUrl, code) {
            var partialDirectiveLinkerVersion1 = new partial_directive_linker_1_1.PartialDirectiveLinkerVersion1(sourceUrl, code);
            var partialComponentLinkerVersion1 = new partial_component_linker_1_1.PartialComponentLinkerVersion1(environment, get_source_file_1.createGetSourceFile(sourceUrl, code, environment.sourceFileLoader), sourceUrl, code);
            var partialPipeLinkerVersion1 = new partial_pipe_linker_1_1.PartialPipeLinkerVersion1();
            var linkers = new Map();
            linkers.set(exports.ɵɵngDeclareDirective, [
                { range: '11.2.14', linker: partialDirectiveLinkerVersion1 },
                { range: '>=11.1.0-next.1', linker: partialDirectiveLinkerVersion1 },
            ]);
            linkers.set(exports.ɵɵngDeclareComponent, [
                { range: '11.2.14', linker: partialComponentLinkerVersion1 },
                { range: '>=11.1.0-next.1', linker: partialComponentLinkerVersion1 },
            ]);
            linkers.set(exports.ɵɵngDeclarePipe, [
                { range: '11.2.14', linker: partialPipeLinkerVersion1 },
                { range: '>=11.1.0-next.1', linker: partialPipeLinkerVersion1 },
            ]);
            return linkers;
        };
        return PartialLinkerSelector;
    }());
    exports.PartialLinkerSelector = PartialLinkerSelector;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbF9saW5rZXJfc2VsZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL3NyYy9maWxlX2xpbmtlci9wYXJ0aWFsX2xpbmtlcnMvcGFydGlhbF9saW5rZXJfc2VsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILGlDQUFpQztJQUdqQyxnR0FBdUQ7SUFHdkQsc0lBQTRFO0lBQzVFLHNJQUE0RTtJQUU1RSw0SEFBa0U7SUFFckQsUUFBQSxvQkFBb0IsR0FBRyxzQkFBc0IsQ0FBQztJQUM5QyxRQUFBLG9CQUFvQixHQUFHLHNCQUFzQixDQUFDO0lBQzlDLFFBQUEsZUFBZSxHQUFHLGlCQUFpQixDQUFDO0lBQ3BDLFFBQUEsb0JBQW9CLEdBQUcsQ0FBQyw0QkFBb0IsRUFBRSw0QkFBb0IsRUFBRSx1QkFBZSxDQUFDLENBQUM7SUFPbEc7Ozs7Ozs7Ozs7Ozs7O09BY0c7SUFDSDtRQUdFLCtCQUNJLFdBQXVELEVBQUUsU0FBeUIsRUFDbEYsSUFBWTtZQUNkLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFFRDs7V0FFRztRQUNILG1EQUFtQixHQUFuQixVQUFvQixZQUFvQjtZQUN0QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRDs7O1dBR0c7UUFDSCx5Q0FBUyxHQUFULFVBQVUsWUFBb0IsRUFBRSxPQUFlOztZQUM3QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQXdDLFlBQVksTUFBRyxDQUFDLENBQUM7YUFDMUU7WUFDRCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUUsQ0FBQzs7Z0JBQ2pELEtBQThCLElBQUEsYUFBQSxpQkFBQSxRQUFRLENBQUEsa0NBQUEsd0RBQUU7b0JBQTdCLElBQUEsdUJBQWUsRUFBZCxLQUFLLFdBQUEsRUFBRSxNQUFNLFlBQUE7b0JBQ3ZCLElBQUksa0JBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFDLENBQUMsRUFBRTt3QkFDeEQsT0FBTyxNQUFNLENBQUM7cUJBQ2Y7aUJBQ0Y7Ozs7Ozs7OztZQUNELE1BQU0sSUFBSSxLQUFLLENBQ1gsNkNBQTJDLE9BQU8sYUFBUSxZQUFZLFFBQUs7Z0JBQzNFLDZCQUE2QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxRQUFNLENBQUMsQ0FBQyxLQUFPLEVBQWYsQ0FBZSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVPLCtDQUFlLEdBQXZCLFVBQ0ksV0FBdUQsRUFBRSxTQUF5QixFQUNsRixJQUFZO1lBQ2QsSUFBTSw4QkFBOEIsR0FBRyxJQUFJLDJEQUE4QixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzRixJQUFNLDhCQUE4QixHQUFHLElBQUksMkRBQThCLENBQ3JFLFdBQVcsRUFBRSxxQ0FBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFNBQVMsRUFDMUYsSUFBSSxDQUFDLENBQUM7WUFDVixJQUFNLHlCQUF5QixHQUFHLElBQUksaURBQXlCLEVBQUUsQ0FBQztZQUVsRSxJQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBc0MsQ0FBQztZQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUFvQixFQUFFO2dCQUNoQyxFQUFDLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQUUsOEJBQThCLEVBQUM7Z0JBQ3BFLEVBQUMsS0FBSyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSw4QkFBOEIsRUFBQzthQUNuRSxDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUFvQixFQUFFO2dCQUNoQyxFQUFDLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQUUsOEJBQThCLEVBQUM7Z0JBQ3BFLEVBQUMsS0FBSyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSw4QkFBOEIsRUFBQzthQUNuRSxDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUFlLEVBQUU7Z0JBQzNCLEVBQUMsS0FBSyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sRUFBRSx5QkFBeUIsRUFBQztnQkFDL0QsRUFBQyxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLHlCQUF5QixFQUFDO2FBQzlELENBQUMsQ0FBQztZQUNILE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUM7UUFDSCw0QkFBQztJQUFELENBQUMsQUEzREQsSUEyREM7SUEzRFksc0RBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3NhdGlzZmllc30gZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aH0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Y3JlYXRlR2V0U291cmNlRmlsZX0gZnJvbSAnLi4vZ2V0X3NvdXJjZV9maWxlJztcbmltcG9ydCB7TGlua2VyRW52aXJvbm1lbnR9IGZyb20gJy4uL2xpbmtlcl9lbnZpcm9ubWVudCc7XG5cbmltcG9ydCB7UGFydGlhbENvbXBvbmVudExpbmtlclZlcnNpb24xfSBmcm9tICcuL3BhcnRpYWxfY29tcG9uZW50X2xpbmtlcl8xJztcbmltcG9ydCB7UGFydGlhbERpcmVjdGl2ZUxpbmtlclZlcnNpb24xfSBmcm9tICcuL3BhcnRpYWxfZGlyZWN0aXZlX2xpbmtlcl8xJztcbmltcG9ydCB7UGFydGlhbExpbmtlcn0gZnJvbSAnLi9wYXJ0aWFsX2xpbmtlcic7XG5pbXBvcnQge1BhcnRpYWxQaXBlTGlua2VyVmVyc2lvbjF9IGZyb20gJy4vcGFydGlhbF9waXBlX2xpbmtlcl8xJztcblxuZXhwb3J0IGNvbnN0IMm1ybVuZ0RlY2xhcmVEaXJlY3RpdmUgPSAnybXJtW5nRGVjbGFyZURpcmVjdGl2ZSc7XG5leHBvcnQgY29uc3QgybXJtW5nRGVjbGFyZUNvbXBvbmVudCA9ICfJtcm1bmdEZWNsYXJlQ29tcG9uZW50JztcbmV4cG9ydCBjb25zdCDJtcm1bmdEZWNsYXJlUGlwZSA9ICfJtcm1bmdEZWNsYXJlUGlwZSc7XG5leHBvcnQgY29uc3QgZGVjbGFyYXRpb25GdW5jdGlvbnMgPSBbybXJtW5nRGVjbGFyZURpcmVjdGl2ZSwgybXJtW5nRGVjbGFyZUNvbXBvbmVudCwgybXJtW5nRGVjbGFyZVBpcGVdO1xuXG5pbnRlcmZhY2UgTGlua2VyUmFuZ2U8VEV4cHJlc3Npb24+IHtcbiAgcmFuZ2U6IHN0cmluZztcbiAgbGlua2VyOiBQYXJ0aWFsTGlua2VyPFRFeHByZXNzaW9uPjtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciB0aGF0IHNlbGVjdHMgdGhlIGFwcHJvcHJpYXRlIGBQYXJ0aWFsTGlua2VyYCBmb3IgYSBnaXZlbiBkZWNsYXJhdGlvbi5cbiAqXG4gKiBUaGUgc2VsZWN0aW9uIGlzIG1hZGUgZnJvbSBhIGRhdGFiYXNlIG9mIGxpbmtlciBpbnN0YW5jZXMsIGNob3NlbiBpZiB0aGVpciBnaXZlbiBzZW12ZXIgcmFuZ2VcbiAqIHNhdGlzZmllcyB0aGUgdmVyc2lvbiBmb3VuZCBpbiB0aGUgY29kZSB0byBiZSBsaW5rZWQuXG4gKlxuICogTm90ZSB0aGF0IHRoZSByYW5nZXMgYXJlIGNoZWNrZWQgaW4gb3JkZXIsIGFuZCB0aGUgZmlyc3QgbWF0Y2hpbmcgcmFuZ2Ugd2lsbCBiZSBzZWxlY3RlZCwgc29cbiAqIHJhbmdlcyBzaG91bGQgYmUgbW9zdCByZXN0cmljdGl2ZSBmaXJzdC5cbiAqXG4gKiBBbHNvLCByYW5nZXMgYXJlIG1hdGNoZWQgdG8gaW5jbHVkZSBcInByZS1yZWxlYXNlc1wiLCB0aGVyZWZvcmUgaWYgdGhlIHJhbmdlIGlzIGA+PTExLjEuMC1uZXh0LjFgXG4gKiB0aGVuIHRoaXMgaW5jbHVkZXMgYDExLjEuMC1uZXh0LjJgIGFuZCBhbHNvIGAxMi4wLjAtbmV4dC4xYC5cbiAqXG4gKiBGaW5hbGx5LCBub3RlIHRoYXQgd2UgYWx3YXlzIHN0YXJ0IHdpdGggdGhlIGN1cnJlbnQgdmVyc2lvbiAoaS5lLiBgMC4wLjAtUExBQ0VIT0xERVJgKS4gVGhpc1xuICogYWxsb3dzIHRoZSBsaW5rZXIgdG8gd29yayBvbiBsb2NhbCBidWlsZHMgZWZmZWN0aXZlbHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXJ0aWFsTGlua2VyU2VsZWN0b3I8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBsaW5rZXJzOiBNYXA8c3RyaW5nLCBMaW5rZXJSYW5nZTxURXhwcmVzc2lvbj5bXT47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBlbnZpcm9ubWVudDogTGlua2VyRW52aXJvbm1lbnQ8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+LCBzb3VyY2VVcmw6IEFic29sdXRlRnNQYXRoLFxuICAgICAgY29kZTogc3RyaW5nKSB7XG4gICAgdGhpcy5saW5rZXJzID0gdGhpcy5jcmVhdGVMaW5rZXJNYXAoZW52aXJvbm1lbnQsIHNvdXJjZVVybCwgY29kZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZXJlIGFyZSBgUGFydGlhbExpbmtlcmAgY2xhc3NlcyB0aGF0IGNhbiBoYW5kbGUgZnVuY3Rpb25zIHdpdGggdGhpcyBuYW1lLlxuICAgKi9cbiAgc3VwcG9ydHNEZWNsYXJhdGlvbihmdW5jdGlvbk5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxpbmtlcnMuaGFzKGZ1bmN0aW9uTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYFBhcnRpYWxMaW5rZXJgIHRoYXQgY2FuIGhhbmRsZSBmdW5jdGlvbnMgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgdmVyc2lvbi5cbiAgICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZXJlIGlzIG5vbmUuXG4gICAqL1xuICBnZXRMaW5rZXIoZnVuY3Rpb25OYW1lOiBzdHJpbmcsIHZlcnNpb246IHN0cmluZyk6IFBhcnRpYWxMaW5rZXI8VEV4cHJlc3Npb24+IHtcbiAgICBpZiAoIXRoaXMubGlua2Vycy5oYXMoZnVuY3Rpb25OYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHBhcnRpYWwgZGVjbGFyYXRpb24gZnVuY3Rpb24gJHtmdW5jdGlvbk5hbWV9LmApO1xuICAgIH1cbiAgICBjb25zdCB2ZXJzaW9ucyA9IHRoaXMubGlua2Vycy5nZXQoZnVuY3Rpb25OYW1lKSE7XG4gICAgZm9yIChjb25zdCB7cmFuZ2UsIGxpbmtlcn0gb2YgdmVyc2lvbnMpIHtcbiAgICAgIGlmIChzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIHtpbmNsdWRlUHJlcmVsZWFzZTogdHJ1ZX0pKSB7XG4gICAgICAgIHJldHVybiBsaW5rZXI7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVuc3VwcG9ydGVkIHBhcnRpYWwgZGVjbGFyYXRpb24gdmVyc2lvbiAke3ZlcnNpb259IGZvciAke2Z1bmN0aW9uTmFtZX0uXFxuYCArXG4gICAgICAgICdWYWxpZCB2ZXJzaW9uIHJhbmdlcyBhcmU6XFxuJyArIHZlcnNpb25zLm1hcCh2ID0+IGAgLSAke3YucmFuZ2V9YCkuam9pbignXFxuJykpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVMaW5rZXJNYXAoXG4gICAgICBlbnZpcm9ubWVudDogTGlua2VyRW52aXJvbm1lbnQ8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+LCBzb3VyY2VVcmw6IEFic29sdXRlRnNQYXRoLFxuICAgICAgY29kZTogc3RyaW5nKTogTWFwPHN0cmluZywgTGlua2VyUmFuZ2U8VEV4cHJlc3Npb24+W10+IHtcbiAgICBjb25zdCBwYXJ0aWFsRGlyZWN0aXZlTGlua2VyVmVyc2lvbjEgPSBuZXcgUGFydGlhbERpcmVjdGl2ZUxpbmtlclZlcnNpb24xKHNvdXJjZVVybCwgY29kZSk7XG4gICAgY29uc3QgcGFydGlhbENvbXBvbmVudExpbmtlclZlcnNpb24xID0gbmV3IFBhcnRpYWxDb21wb25lbnRMaW5rZXJWZXJzaW9uMShcbiAgICAgICAgZW52aXJvbm1lbnQsIGNyZWF0ZUdldFNvdXJjZUZpbGUoc291cmNlVXJsLCBjb2RlLCBlbnZpcm9ubWVudC5zb3VyY2VGaWxlTG9hZGVyKSwgc291cmNlVXJsLFxuICAgICAgICBjb2RlKTtcbiAgICBjb25zdCBwYXJ0aWFsUGlwZUxpbmtlclZlcnNpb24xID0gbmV3IFBhcnRpYWxQaXBlTGlua2VyVmVyc2lvbjEoKTtcblxuICAgIGNvbnN0IGxpbmtlcnMgPSBuZXcgTWFwPHN0cmluZywgTGlua2VyUmFuZ2U8VEV4cHJlc3Npb24+W10+KCk7XG4gICAgbGlua2Vycy5zZXQoybXJtW5nRGVjbGFyZURpcmVjdGl2ZSwgW1xuICAgICAge3JhbmdlOiAnMC4wLjAtUExBQ0VIT0xERVInLCBsaW5rZXI6IHBhcnRpYWxEaXJlY3RpdmVMaW5rZXJWZXJzaW9uMX0sXG4gICAgICB7cmFuZ2U6ICc+PTExLjEuMC1uZXh0LjEnLCBsaW5rZXI6IHBhcnRpYWxEaXJlY3RpdmVMaW5rZXJWZXJzaW9uMX0sXG4gICAgXSk7XG4gICAgbGlua2Vycy5zZXQoybXJtW5nRGVjbGFyZUNvbXBvbmVudCwgW1xuICAgICAge3JhbmdlOiAnMC4wLjAtUExBQ0VIT0xERVInLCBsaW5rZXI6IHBhcnRpYWxDb21wb25lbnRMaW5rZXJWZXJzaW9uMX0sXG4gICAgICB7cmFuZ2U6ICc+PTExLjEuMC1uZXh0LjEnLCBsaW5rZXI6IHBhcnRpYWxDb21wb25lbnRMaW5rZXJWZXJzaW9uMX0sXG4gICAgXSk7XG4gICAgbGlua2Vycy5zZXQoybXJtW5nRGVjbGFyZVBpcGUsIFtcbiAgICAgIHtyYW5nZTogJzAuMC4wLVBMQUNFSE9MREVSJywgbGlua2VyOiBwYXJ0aWFsUGlwZUxpbmtlclZlcnNpb24xfSxcbiAgICAgIHtyYW5nZTogJz49MTEuMS4wLW5leHQuMScsIGxpbmtlcjogcGFydGlhbFBpcGVMaW5rZXJWZXJzaW9uMX0sXG4gICAgXSk7XG4gICAgcmV0dXJuIGxpbmtlcnM7XG4gIH1cbn1cbiJdfQ==