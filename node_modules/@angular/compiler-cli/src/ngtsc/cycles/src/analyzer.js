/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/cycles/src/analyzer", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Cycle = exports.CycleAnalyzer = void 0;
    var tslib_1 = require("tslib");
    /**
     * Analyzes a `ts.Program` for cycles.
     */
    var CycleAnalyzer = /** @class */ (function () {
        function CycleAnalyzer(importGraph) {
            this.importGraph = importGraph;
        }
        /**
         * Check for a cycle to be created in the `ts.Program` by adding an import between `from` and
         * `to`.
         *
         * @returns a `Cycle` object if an import between `from` and `to` would create a cycle; `null`
         *     otherwise.
         */
        CycleAnalyzer.prototype.wouldCreateCycle = function (from, to) {
            // Import of 'from' -> 'to' is illegal if an edge 'to' -> 'from' already exists.
            return this.importGraph.transitiveImportsOf(to).has(from) ?
                new Cycle(this.importGraph, from, to) :
                null;
        };
        /**
         * Record a synthetic import from `from` to `to`.
         *
         * This is an import that doesn't exist in the `ts.Program` but will be considered as part of the
         * import graph for cycle creation.
         */
        CycleAnalyzer.prototype.recordSyntheticImport = function (from, to) {
            this.importGraph.addSyntheticImport(from, to);
        };
        return CycleAnalyzer;
    }());
    exports.CycleAnalyzer = CycleAnalyzer;
    /**
     * Represents an import cycle between `from` and `to` in the program.
     *
     * This class allows us to do the work to compute the cyclic path between `from` and `to` only if
     * needed.
     */
    var Cycle = /** @class */ (function () {
        function Cycle(importGraph, from, to) {
            this.importGraph = importGraph;
            this.from = from;
            this.to = to;
        }
        /**
         * Compute an array of source-files that illustrates the cyclic path between `from` and `to`.
         *
         * Note that a `Cycle` will not be created unless a path is available between `to` and `from`,
         * so `findPath()` will never return `null`.
         */
        Cycle.prototype.getPath = function () {
            return tslib_1.__spread([this.from], this.importGraph.findPath(this.to, this.from));
        };
        return Cycle;
    }());
    exports.Cycle = Cycle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2N5Y2xlcy9zcmMvYW5hbHl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQU1IOztPQUVHO0lBQ0g7UUFDRSx1QkFBb0IsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFBRyxDQUFDO1FBRWhEOzs7Ozs7V0FNRztRQUNILHdDQUFnQixHQUFoQixVQUFpQixJQUFtQixFQUFFLEVBQWlCO1lBQ3JELGdGQUFnRjtZQUNoRixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQztRQUNYLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILDZDQUFxQixHQUFyQixVQUFzQixJQUFtQixFQUFFLEVBQWlCO1lBQzFELElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDSCxvQkFBQztJQUFELENBQUMsQUExQkQsSUEwQkM7SUExQlksc0NBQWE7SUE0QjFCOzs7OztPQUtHO0lBQ0g7UUFDRSxlQUNZLFdBQXdCLEVBQVcsSUFBbUIsRUFBVyxFQUFpQjtZQUFsRixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUFXLFNBQUksR0FBSixJQUFJLENBQWU7WUFBVyxPQUFFLEdBQUYsRUFBRSxDQUFlO1FBQUcsQ0FBQztRQUVsRzs7Ozs7V0FLRztRQUNILHVCQUFPLEdBQVA7WUFDRSx5QkFBUSxJQUFJLENBQUMsSUFBSSxHQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBRSxFQUFFO1FBQ3hFLENBQUM7UUFDSCxZQUFDO0lBQUQsQ0FBQyxBQWJELElBYUM7SUFiWSxzQkFBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtJbXBvcnRHcmFwaH0gZnJvbSAnLi9pbXBvcnRzJztcblxuLyoqXG4gKiBBbmFseXplcyBhIGB0cy5Qcm9ncmFtYCBmb3IgY3ljbGVzLlxuICovXG5leHBvcnQgY2xhc3MgQ3ljbGVBbmFseXplciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW1wb3J0R3JhcGg6IEltcG9ydEdyYXBoKSB7fVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgYSBjeWNsZSB0byBiZSBjcmVhdGVkIGluIHRoZSBgdHMuUHJvZ3JhbWAgYnkgYWRkaW5nIGFuIGltcG9ydCBiZXR3ZWVuIGBmcm9tYCBhbmRcbiAgICogYHRvYC5cbiAgICpcbiAgICogQHJldHVybnMgYSBgQ3ljbGVgIG9iamVjdCBpZiBhbiBpbXBvcnQgYmV0d2VlbiBgZnJvbWAgYW5kIGB0b2Agd291bGQgY3JlYXRlIGEgY3ljbGU7IGBudWxsYFxuICAgKiAgICAgb3RoZXJ3aXNlLlxuICAgKi9cbiAgd291bGRDcmVhdGVDeWNsZShmcm9tOiB0cy5Tb3VyY2VGaWxlLCB0bzogdHMuU291cmNlRmlsZSk6IEN5Y2xlfG51bGwge1xuICAgIC8vIEltcG9ydCBvZiAnZnJvbScgLT4gJ3RvJyBpcyBpbGxlZ2FsIGlmIGFuIGVkZ2UgJ3RvJyAtPiAnZnJvbScgYWxyZWFkeSBleGlzdHMuXG4gICAgcmV0dXJuIHRoaXMuaW1wb3J0R3JhcGgudHJhbnNpdGl2ZUltcG9ydHNPZih0bykuaGFzKGZyb20pID9cbiAgICAgICAgbmV3IEN5Y2xlKHRoaXMuaW1wb3J0R3JhcGgsIGZyb20sIHRvKSA6XG4gICAgICAgIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVjb3JkIGEgc3ludGhldGljIGltcG9ydCBmcm9tIGBmcm9tYCB0byBgdG9gLlxuICAgKlxuICAgKiBUaGlzIGlzIGFuIGltcG9ydCB0aGF0IGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGB0cy5Qcm9ncmFtYCBidXQgd2lsbCBiZSBjb25zaWRlcmVkIGFzIHBhcnQgb2YgdGhlXG4gICAqIGltcG9ydCBncmFwaCBmb3IgY3ljbGUgY3JlYXRpb24uXG4gICAqL1xuICByZWNvcmRTeW50aGV0aWNJbXBvcnQoZnJvbTogdHMuU291cmNlRmlsZSwgdG86IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICB0aGlzLmltcG9ydEdyYXBoLmFkZFN5bnRoZXRpY0ltcG9ydChmcm9tLCB0byk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGltcG9ydCBjeWNsZSBiZXR3ZWVuIGBmcm9tYCBhbmQgYHRvYCBpbiB0aGUgcHJvZ3JhbS5cbiAqXG4gKiBUaGlzIGNsYXNzIGFsbG93cyB1cyB0byBkbyB0aGUgd29yayB0byBjb21wdXRlIHRoZSBjeWNsaWMgcGF0aCBiZXR3ZWVuIGBmcm9tYCBhbmQgYHRvYCBvbmx5IGlmXG4gKiBuZWVkZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDeWNsZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBpbXBvcnRHcmFwaDogSW1wb3J0R3JhcGgsIHJlYWRvbmx5IGZyb206IHRzLlNvdXJjZUZpbGUsIHJlYWRvbmx5IHRvOiB0cy5Tb3VyY2VGaWxlKSB7fVxuXG4gIC8qKlxuICAgKiBDb21wdXRlIGFuIGFycmF5IG9mIHNvdXJjZS1maWxlcyB0aGF0IGlsbHVzdHJhdGVzIHRoZSBjeWNsaWMgcGF0aCBiZXR3ZWVuIGBmcm9tYCBhbmQgYHRvYC5cbiAgICpcbiAgICogTm90ZSB0aGF0IGEgYEN5Y2xlYCB3aWxsIG5vdCBiZSBjcmVhdGVkIHVubGVzcyBhIHBhdGggaXMgYXZhaWxhYmxlIGJldHdlZW4gYHRvYCBhbmQgYGZyb21gLFxuICAgKiBzbyBgZmluZFBhdGgoKWAgd2lsbCBuZXZlciByZXR1cm4gYG51bGxgLlxuICAgKi9cbiAgZ2V0UGF0aCgpOiB0cy5Tb3VyY2VGaWxlW10ge1xuICAgIHJldHVybiBbdGhpcy5mcm9tLCAuLi50aGlzLmltcG9ydEdyYXBoLmZpbmRQYXRoKHRoaXMudG8sIHRoaXMuZnJvbSkhXTtcbiAgfVxufVxuXG5cbi8qKlxuICogV2hhdCB0byBkbyBpZiBhIGN5Y2xlIGlzIGRldGVjdGVkLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBDeWNsZUhhbmRsaW5nU3RyYXRlZ3kge1xuICAvKiogQWRkIFwicmVtb3RlIHNjb3BpbmdcIiBjb2RlIHRvIGF2b2lkIGNyZWF0aW5nIGEgY3ljbGUuICovXG4gIFVzZVJlbW90ZVNjb3BpbmcsXG4gIC8qKiBGYWlsIHRoZSBjb21waWxhdGlvbiB3aXRoIGFuIGVycm9yLiAqL1xuICBFcnJvcixcbn1cbiJdfQ==