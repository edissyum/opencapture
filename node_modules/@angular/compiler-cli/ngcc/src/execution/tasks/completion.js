(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/execution/tasks/completion", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/packages/build_marker", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/execution/tasks/api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createLogErrorHandler = exports.createThrowErrorHandler = exports.createMarkAsProcessedHandler = exports.composeTaskCompletedCallbacks = void 0;
    var tslib_1 = require("tslib");
    var build_marker_1 = require("@angular/compiler-cli/ngcc/src/packages/build_marker");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var api_1 = require("@angular/compiler-cli/ngcc/src/execution/tasks/api");
    /**
     * Compose a group of TaskCompletedHandlers into a single TaskCompletedCallback.
     *
     * The compose callback will receive an outcome and will delegate to the appropriate handler based
     * on this outcome.
     *
     * @param callbacks a map of outcomes to handlers.
     */
    function composeTaskCompletedCallbacks(callbacks) {
        return function (task, outcome, message) {
            var callback = callbacks[outcome];
            if (callback === undefined) {
                throw new Error("Unknown task outcome: \"" + outcome + "\" - supported outcomes: " + JSON.stringify(Object.keys(callbacks)));
            }
            callback(task, message);
        };
    }
    exports.composeTaskCompletedCallbacks = composeTaskCompletedCallbacks;
    /**
     * Create a handler that will mark the entry-points in a package as being processed.
     *
     * @param pkgJsonUpdater The service used to update the package.json
     */
    function createMarkAsProcessedHandler(fs, pkgJsonUpdater) {
        return function (task) {
            var entryPoint = task.entryPoint, formatPropertiesToMarkAsProcessed = task.formatPropertiesToMarkAsProcessed, processDts = task.processDts;
            var packageJsonPath = fs.resolve(entryPoint.path, 'package.json');
            var propsToMarkAsProcessed = tslib_1.__spread(formatPropertiesToMarkAsProcessed);
            if (processDts !== api_1.DtsProcessing.No) {
                propsToMarkAsProcessed.push('typings');
            }
            build_marker_1.markAsProcessed(pkgJsonUpdater, entryPoint.packageJson, packageJsonPath, propsToMarkAsProcessed);
        };
    }
    exports.createMarkAsProcessedHandler = createMarkAsProcessedHandler;
    /**
     * Create a handler that will throw an error.
     */
    function createThrowErrorHandler(fs) {
        return function (task, message) {
            throw new Error(createErrorMessage(fs, task, message));
        };
    }
    exports.createThrowErrorHandler = createThrowErrorHandler;
    /**
     * Create a handler that logs an error and marks the task as failed.
     */
    function createLogErrorHandler(logger, fs, taskQueue) {
        return function (task, message) {
            taskQueue.markAsFailed(task);
            logger.error(createErrorMessage(fs, task, message));
        };
    }
    exports.createLogErrorHandler = createLogErrorHandler;
    function createErrorMessage(fs, task, message) {
        var _a;
        var jsFormat = "`" + task.formatProperty + "` as " + ((_a = entry_point_1.getEntryPointFormat(fs, task.entryPoint, task.formatProperty)) !== null && _a !== void 0 ? _a : 'unknown format');
        var format = task.typingsOnly ? "typings only using " + jsFormat : jsFormat;
        message = message !== null ? " due to " + message : '';
        return "Failed to compile entry-point " + task.entryPoint.name + " (" + format + ")" + message;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9leGVjdXRpb24vdGFza3MvY29tcGxldGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBU0EscUZBQTREO0lBQzVELG1GQUE0RjtJQUc1RiwwRUFBbUc7SUFVbkc7Ozs7Ozs7T0FPRztJQUNILFNBQWdCLDZCQUE2QixDQUN6QyxTQUE4RDtRQUNoRSxPQUFPLFVBQUMsSUFBVSxFQUFFLE9BQThCLEVBQUUsT0FBb0I7WUFDdEUsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBMEIsT0FBTyxpQ0FDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFHLENBQUMsQ0FBQzthQUMvQztZQUNELFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVZELHNFQVVDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQWdCLDRCQUE0QixDQUN4QyxFQUFvQixFQUFFLGNBQWtDO1FBQzFELE9BQU8sVUFBQyxJQUFVO1lBQ1QsSUFBQSxVQUFVLEdBQW1ELElBQUksV0FBdkQsRUFBRSxpQ0FBaUMsR0FBZ0IsSUFBSSxrQ0FBcEIsRUFBRSxVQUFVLEdBQUksSUFBSSxXQUFSLENBQVM7WUFDekUsSUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3BFLElBQU0sc0JBQXNCLG9CQUNwQixpQ0FBaUMsQ0FBQyxDQUFDO1lBQzNDLElBQUksVUFBVSxLQUFLLG1CQUFhLENBQUMsRUFBRSxFQUFFO2dCQUNuQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDeEM7WUFDRCw4QkFBZSxDQUNYLGNBQWMsRUFBRSxVQUFVLENBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3ZGLENBQUMsQ0FBQztJQUNKLENBQUM7SUFiRCxvRUFhQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsdUJBQXVCLENBQUMsRUFBc0I7UUFDNUQsT0FBTyxVQUFDLElBQVUsRUFBRSxPQUFvQjtZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUM7SUFDSixDQUFDO0lBSkQsMERBSUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLHFCQUFxQixDQUNqQyxNQUFjLEVBQUUsRUFBc0IsRUFBRSxTQUFvQjtRQUM5RCxPQUFPLFVBQUMsSUFBVSxFQUFFLE9BQW9CO1lBQ3RDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQU5ELHNEQU1DO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxFQUFzQixFQUFFLElBQVUsRUFBRSxPQUFvQjs7UUFDbEYsSUFBTSxRQUFRLEdBQUcsTUFBSyxJQUFJLENBQUMsY0FBYyxvQkFDckMsaUNBQW1CLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQ0FBSSxnQkFBZ0IsQ0FBRSxDQUFDO1FBQ3hGLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLHdCQUFzQixRQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUM5RSxPQUFPLEdBQUcsT0FBTyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsYUFBVyxPQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN2RCxPQUFPLG1DQUFpQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksVUFBSyxNQUFNLE1BQUcsR0FBRyxPQUFPLENBQUM7SUFDdkYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtQYXRoTWFuaXB1bGF0aW9uLCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHttYXJrQXNQcm9jZXNzZWR9IGZyb20gJy4uLy4uL3BhY2thZ2VzL2J1aWxkX21hcmtlcic7XG5pbXBvcnQge2dldEVudHJ5UG9pbnRGb3JtYXQsIFBhY2thZ2VKc29uRm9ybWF0UHJvcGVydGllc30gZnJvbSAnLi4vLi4vcGFja2FnZXMvZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtQYWNrYWdlSnNvblVwZGF0ZXJ9IGZyb20gJy4uLy4uL3dyaXRpbmcvcGFja2FnZV9qc29uX3VwZGF0ZXInO1xuXG5pbXBvcnQge0R0c1Byb2Nlc3NpbmcsIFRhc2ssIFRhc2tDb21wbGV0ZWRDYWxsYmFjaywgVGFza1Byb2Nlc3NpbmdPdXRjb21lLCBUYXNrUXVldWV9IGZyb20gJy4vYXBpJztcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgY2FuIGhhbmRsZSBhIHNwZWNpZmljIG91dGNvbWUgb2YgYSB0YXNrIGNvbXBsZXRpb24uXG4gKlxuICogVGhlc2UgZnVuY3Rpb25zIGNhbiBiZSBjb21wb3NlZCB1c2luZyB0aGUgYGNvbXBvc2VUYXNrQ29tcGxldGVkQ2FsbGJhY2tzKClgXG4gKiB0byBjcmVhdGUgYSBgVGFza0NvbXBsZXRlZENhbGxiYWNrYCBmdW5jdGlvbiB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gYW4gYEV4ZWN1dG9yYC5cbiAqL1xuZXhwb3J0IHR5cGUgVGFza0NvbXBsZXRlZEhhbmRsZXIgPSAodGFzazogVGFzaywgbWVzc2FnZTogc3RyaW5nfG51bGwpID0+IHZvaWQ7XG5cbi8qKlxuICogQ29tcG9zZSBhIGdyb3VwIG9mIFRhc2tDb21wbGV0ZWRIYW5kbGVycyBpbnRvIGEgc2luZ2xlIFRhc2tDb21wbGV0ZWRDYWxsYmFjay5cbiAqXG4gKiBUaGUgY29tcG9zZSBjYWxsYmFjayB3aWxsIHJlY2VpdmUgYW4gb3V0Y29tZSBhbmQgd2lsbCBkZWxlZ2F0ZSB0byB0aGUgYXBwcm9wcmlhdGUgaGFuZGxlciBiYXNlZFxuICogb24gdGhpcyBvdXRjb21lLlxuICpcbiAqIEBwYXJhbSBjYWxsYmFja3MgYSBtYXAgb2Ygb3V0Y29tZXMgdG8gaGFuZGxlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wb3NlVGFza0NvbXBsZXRlZENhbGxiYWNrcyhcbiAgICBjYWxsYmFja3M6IFJlY29yZDxUYXNrUHJvY2Vzc2luZ091dGNvbWUsIFRhc2tDb21wbGV0ZWRIYW5kbGVyPik6IFRhc2tDb21wbGV0ZWRDYWxsYmFjayB7XG4gIHJldHVybiAodGFzazogVGFzaywgb3V0Y29tZTogVGFza1Byb2Nlc3NpbmdPdXRjb21lLCBtZXNzYWdlOiBzdHJpbmd8bnVsbCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gY2FsbGJhY2tzW291dGNvbWVdO1xuICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdGFzayBvdXRjb21lOiBcIiR7b3V0Y29tZX1cIiAtIHN1cHBvcnRlZCBvdXRjb21lczogJHtcbiAgICAgICAgICBKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhjYWxsYmFja3MpKX1gKTtcbiAgICB9XG4gICAgY2FsbGJhY2sodGFzaywgbWVzc2FnZSk7XG4gIH07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgaGFuZGxlciB0aGF0IHdpbGwgbWFyayB0aGUgZW50cnktcG9pbnRzIGluIGEgcGFja2FnZSBhcyBiZWluZyBwcm9jZXNzZWQuXG4gKlxuICogQHBhcmFtIHBrZ0pzb25VcGRhdGVyIFRoZSBzZXJ2aWNlIHVzZWQgdG8gdXBkYXRlIHRoZSBwYWNrYWdlLmpzb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hcmtBc1Byb2Nlc3NlZEhhbmRsZXIoXG4gICAgZnM6IFBhdGhNYW5pcHVsYXRpb24sIHBrZ0pzb25VcGRhdGVyOiBQYWNrYWdlSnNvblVwZGF0ZXIpOiBUYXNrQ29tcGxldGVkSGFuZGxlciB7XG4gIHJldHVybiAodGFzazogVGFzayk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHtlbnRyeVBvaW50LCBmb3JtYXRQcm9wZXJ0aWVzVG9NYXJrQXNQcm9jZXNzZWQsIHByb2Nlc3NEdHN9ID0gdGFzaztcbiAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBmcy5yZXNvbHZlKGVudHJ5UG9pbnQucGF0aCwgJ3BhY2thZ2UuanNvbicpO1xuICAgIGNvbnN0IHByb3BzVG9NYXJrQXNQcm9jZXNzZWQ6IFBhY2thZ2VKc29uRm9ybWF0UHJvcGVydGllc1tdID1cbiAgICAgICAgWy4uLmZvcm1hdFByb3BlcnRpZXNUb01hcmtBc1Byb2Nlc3NlZF07XG4gICAgaWYgKHByb2Nlc3NEdHMgIT09IER0c1Byb2Nlc3NpbmcuTm8pIHtcbiAgICAgIHByb3BzVG9NYXJrQXNQcm9jZXNzZWQucHVzaCgndHlwaW5ncycpO1xuICAgIH1cbiAgICBtYXJrQXNQcm9jZXNzZWQoXG4gICAgICAgIHBrZ0pzb25VcGRhdGVyLCBlbnRyeVBvaW50LnBhY2thZ2VKc29uLCBwYWNrYWdlSnNvblBhdGgsIHByb3BzVG9NYXJrQXNQcm9jZXNzZWQpO1xuICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGhhbmRsZXIgdGhhdCB3aWxsIHRocm93IGFuIGVycm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGhyb3dFcnJvckhhbmRsZXIoZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSk6IFRhc2tDb21wbGV0ZWRIYW5kbGVyIHtcbiAgcmV0dXJuICh0YXNrOiBUYXNrLCBtZXNzYWdlOiBzdHJpbmd8bnVsbCk6IHZvaWQgPT4ge1xuICAgIHRocm93IG5ldyBFcnJvcihjcmVhdGVFcnJvck1lc3NhZ2UoZnMsIHRhc2ssIG1lc3NhZ2UpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBoYW5kbGVyIHRoYXQgbG9ncyBhbiBlcnJvciBhbmQgbWFya3MgdGhlIHRhc2sgYXMgZmFpbGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTG9nRXJyb3JIYW5kbGVyKFxuICAgIGxvZ2dlcjogTG9nZ2VyLCBmczogUmVhZG9ubHlGaWxlU3lzdGVtLCB0YXNrUXVldWU6IFRhc2tRdWV1ZSk6IFRhc2tDb21wbGV0ZWRIYW5kbGVyIHtcbiAgcmV0dXJuICh0YXNrOiBUYXNrLCBtZXNzYWdlOiBzdHJpbmd8bnVsbCk6IHZvaWQgPT4ge1xuICAgIHRhc2tRdWV1ZS5tYXJrQXNGYWlsZWQodGFzayk7XG4gICAgbG9nZ2VyLmVycm9yKGNyZWF0ZUVycm9yTWVzc2FnZShmcywgdGFzaywgbWVzc2FnZSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVFcnJvck1lc3NhZ2UoZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgdGFzazogVGFzaywgbWVzc2FnZTogc3RyaW5nfG51bGwpOiBzdHJpbmcge1xuICBjb25zdCBqc0Zvcm1hdCA9IGBcXGAke3Rhc2suZm9ybWF0UHJvcGVydHl9XFxgIGFzICR7XG4gICAgICBnZXRFbnRyeVBvaW50Rm9ybWF0KGZzLCB0YXNrLmVudHJ5UG9pbnQsIHRhc2suZm9ybWF0UHJvcGVydHkpID8/ICd1bmtub3duIGZvcm1hdCd9YDtcbiAgY29uc3QgZm9ybWF0ID0gdGFzay50eXBpbmdzT25seSA/IGB0eXBpbmdzIG9ubHkgdXNpbmcgJHtqc0Zvcm1hdH1gIDoganNGb3JtYXQ7XG4gIG1lc3NhZ2UgPSBtZXNzYWdlICE9PSBudWxsID8gYCBkdWUgdG8gJHttZXNzYWdlfWAgOiAnJztcbiAgcmV0dXJuIGBGYWlsZWQgdG8gY29tcGlsZSBlbnRyeS1wb2ludCAke3Rhc2suZW50cnlQb2ludC5uYW1lfSAoJHtmb3JtYXR9KWAgKyBtZXNzYWdlO1xufVxuIl19