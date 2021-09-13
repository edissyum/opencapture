(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_pipe_linker_1", ["require", "exports", "@angular/compiler", "@angular/compiler-cli/linker/src/fatal_linker_error"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toR3PipeMeta = exports.PartialPipeLinkerVersion1 = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var fatal_linker_error_1 = require("@angular/compiler-cli/linker/src/fatal_linker_error");
    /**
     * A `PartialLinker` that is designed to process `ɵɵngDeclarePipe()` call expressions.
     */
    var PartialPipeLinkerVersion1 = /** @class */ (function () {
        function PartialPipeLinkerVersion1() {
        }
        PartialPipeLinkerVersion1.prototype.linkPartialDeclaration = function (constantPool, metaObj) {
            var meta = toR3PipeMeta(metaObj);
            var def = compiler_1.compilePipeFromMetadata(meta);
            return def.expression;
        };
        return PartialPipeLinkerVersion1;
    }());
    exports.PartialPipeLinkerVersion1 = PartialPipeLinkerVersion1;
    /**
     * Derives the `R3PipeMetadata` structure from the AST object.
     */
    function toR3PipeMeta(metaObj) {
        var typeExpr = metaObj.getValue('type');
        var typeName = typeExpr.getSymbolName();
        if (typeName === null) {
            throw new fatal_linker_error_1.FatalLinkerError(typeExpr.expression, 'Unsupported type, its name could not be determined');
        }
        var pure = metaObj.has('pure') ? metaObj.getBoolean('pure') : true;
        return {
            name: typeName,
            type: wrapReference(typeExpr.getOpaque()),
            internalType: metaObj.getOpaque('type'),
            typeArgumentCount: 0,
            deps: null,
            pipeName: metaObj.getString('name'),
            pure: pure,
        };
    }
    exports.toR3PipeMeta = toR3PipeMeta;
    function wrapReference(wrapped) {
        return { value: wrapped, type: wrapped };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbF9waXBlX2xpbmtlcl8xLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL2xpbmtlci9zcmMvZmlsZV9saW5rZXIvcGFydGlhbF9saW5rZXJzL3BhcnRpYWxfcGlwZV9saW5rZXJfMS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4Q0FBa0o7SUFJbEosMEZBQTBEO0lBSTFEOztPQUVHO0lBQ0g7UUFDRTtRQUFlLENBQUM7UUFFaEIsMERBQXNCLEdBQXRCLFVBQ0ksWUFBMEIsRUFDMUIsT0FBcUQ7WUFDdkQsSUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25DLElBQU0sR0FBRyxHQUFHLGtDQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUN4QixDQUFDO1FBQ0gsZ0NBQUM7SUFBRCxDQUFDLEFBVkQsSUFVQztJQVZZLDhEQUF5QjtJQVl0Qzs7T0FFRztJQUNILFNBQWdCLFlBQVksQ0FBYyxPQUFzRDtRQUU5RixJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMxQyxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7WUFDckIsTUFBTSxJQUFJLHFDQUFnQixDQUN0QixRQUFRLENBQUMsVUFBVSxFQUFFLG9EQUFvRCxDQUFDLENBQUM7U0FDaEY7UUFFRCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFckUsT0FBTztZQUNMLElBQUksRUFBRSxRQUFRO1lBQ2QsSUFBSSxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDekMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQ3ZDLGlCQUFpQixFQUFFLENBQUM7WUFDcEIsSUFBSSxFQUFFLElBQUk7WUFDVixRQUFRLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFDbkMsSUFBSSxNQUFBO1NBQ0wsQ0FBQztJQUNKLENBQUM7SUFwQkQsb0NBb0JDO0lBRUQsU0FBUyxhQUFhLENBQWMsT0FBdUM7UUFDekUsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxDQUFDO0lBQ3pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Y29tcGlsZVBpcGVGcm9tTWV0YWRhdGEsIENvbnN0YW50UG9vbCwgUjNEZWNsYXJlUGlwZU1ldGFkYXRhLCBSM1BhcnRpYWxEZWNsYXJhdGlvbiwgUjNQaXBlTWV0YWRhdGEsIFIzUmVmZXJlbmNlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyBvIGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyL3NyYy9vdXRwdXQvb3V0cHV0X2FzdCc7XG5cbmltcG9ydCB7QXN0T2JqZWN0fSBmcm9tICcuLi8uLi9hc3QvYXN0X3ZhbHVlJztcbmltcG9ydCB7RmF0YWxMaW5rZXJFcnJvcn0gZnJvbSAnLi4vLi4vZmF0YWxfbGlua2VyX2Vycm9yJztcblxuaW1wb3J0IHtQYXJ0aWFsTGlua2VyfSBmcm9tICcuL3BhcnRpYWxfbGlua2VyJztcblxuLyoqXG4gKiBBIGBQYXJ0aWFsTGlua2VyYCB0aGF0IGlzIGRlc2lnbmVkIHRvIHByb2Nlc3MgYMm1ybVuZ0RlY2xhcmVQaXBlKClgIGNhbGwgZXhwcmVzc2lvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXJ0aWFsUGlwZUxpbmtlclZlcnNpb24xPFRFeHByZXNzaW9uPiBpbXBsZW1lbnRzIFBhcnRpYWxMaW5rZXI8VEV4cHJlc3Npb24+IHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGxpbmtQYXJ0aWFsRGVjbGFyYXRpb24oXG4gICAgICBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCxcbiAgICAgIG1ldGFPYmo6IEFzdE9iamVjdDxSM1BhcnRpYWxEZWNsYXJhdGlvbiwgVEV4cHJlc3Npb24+KTogby5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBtZXRhID0gdG9SM1BpcGVNZXRhKG1ldGFPYmopO1xuICAgIGNvbnN0IGRlZiA9IGNvbXBpbGVQaXBlRnJvbU1ldGFkYXRhKG1ldGEpO1xuICAgIHJldHVybiBkZWYuZXhwcmVzc2lvbjtcbiAgfVxufVxuXG4vKipcbiAqIERlcml2ZXMgdGhlIGBSM1BpcGVNZXRhZGF0YWAgc3RydWN0dXJlIGZyb20gdGhlIEFTVCBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1IzUGlwZU1ldGE8VEV4cHJlc3Npb24+KG1ldGFPYmo6IEFzdE9iamVjdDxSM0RlY2xhcmVQaXBlTWV0YWRhdGEsIFRFeHByZXNzaW9uPik6XG4gICAgUjNQaXBlTWV0YWRhdGEge1xuICBjb25zdCB0eXBlRXhwciA9IG1ldGFPYmouZ2V0VmFsdWUoJ3R5cGUnKTtcbiAgY29uc3QgdHlwZU5hbWUgPSB0eXBlRXhwci5nZXRTeW1ib2xOYW1lKCk7XG4gIGlmICh0eXBlTmFtZSA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBGYXRhbExpbmtlckVycm9yKFxuICAgICAgICB0eXBlRXhwci5leHByZXNzaW9uLCAnVW5zdXBwb3J0ZWQgdHlwZSwgaXRzIG5hbWUgY291bGQgbm90IGJlIGRldGVybWluZWQnKTtcbiAgfVxuXG4gIGNvbnN0IHB1cmUgPSBtZXRhT2JqLmhhcygncHVyZScpID8gbWV0YU9iai5nZXRCb29sZWFuKCdwdXJlJykgOiB0cnVlO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogdHlwZU5hbWUsXG4gICAgdHlwZTogd3JhcFJlZmVyZW5jZSh0eXBlRXhwci5nZXRPcGFxdWUoKSksXG4gICAgaW50ZXJuYWxUeXBlOiBtZXRhT2JqLmdldE9wYXF1ZSgndHlwZScpLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgIGRlcHM6IG51bGwsXG4gICAgcGlwZU5hbWU6IG1ldGFPYmouZ2V0U3RyaW5nKCduYW1lJyksXG4gICAgcHVyZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gd3JhcFJlZmVyZW5jZTxURXhwcmVzc2lvbj4od3JhcHBlZDogby5XcmFwcGVkTm9kZUV4cHI8VEV4cHJlc3Npb24+KTogUjNSZWZlcmVuY2Uge1xuICByZXR1cm4ge3ZhbHVlOiB3cmFwcGVkLCB0eXBlOiB3cmFwcGVkfTtcbn1cbiJdfQ==