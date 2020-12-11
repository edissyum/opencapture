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
        define("@angular/compiler/src/render3/util", ["require", "exports", "@angular/compiler/src/aot/static_symbol", "@angular/compiler/src/output/output_ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.wrapReference = exports.jitOnlyGuardedExpression = exports.prepareSyntheticListenerFunctionName = exports.getSyntheticPropertyName = exports.isSyntheticPropertyOrListener = exports.prepareSyntheticListenerName = exports.prepareSyntheticPropertyName = exports.typeWithParameters = exports.convertMetaToOutput = exports.mapToMapExpression = void 0;
    var static_symbol_1 = require("@angular/compiler/src/aot/static_symbol");
    var o = require("@angular/compiler/src/output/output_ast");
    /**
     * Convert an object map with `Expression` values into a `LiteralMapExpr`.
     */
    function mapToMapExpression(map) {
        var result = Object.keys(map).map(function (key) { return ({
            key: key,
            // The assertion here is because really TypeScript doesn't allow us to express that if the
            // key is present, it will have a value, but this is true in reality.
            value: map[key],
            quoted: false,
        }); });
        return o.literalMap(result);
    }
    exports.mapToMapExpression = mapToMapExpression;
    /**
     * Convert metadata into an `Expression` in the given `OutputContext`.
     *
     * This operation will handle arrays, references to symbols, or literal `null` or `undefined`.
     */
    function convertMetaToOutput(meta, ctx) {
        if (Array.isArray(meta)) {
            return o.literalArr(meta.map(function (entry) { return convertMetaToOutput(entry, ctx); }));
        }
        if (meta instanceof static_symbol_1.StaticSymbol) {
            return ctx.importExpr(meta);
        }
        if (meta == null) {
            return o.literal(meta);
        }
        throw new Error("Internal error: Unsupported or unknown metadata: " + meta);
    }
    exports.convertMetaToOutput = convertMetaToOutput;
    function typeWithParameters(type, numParams) {
        if (numParams === 0) {
            return o.expressionType(type);
        }
        var params = [];
        for (var i = 0; i < numParams; i++) {
            params.push(o.DYNAMIC_TYPE);
        }
        return o.expressionType(type, undefined, params);
    }
    exports.typeWithParameters = typeWithParameters;
    var ANIMATE_SYMBOL_PREFIX = '@';
    function prepareSyntheticPropertyName(name) {
        return "" + ANIMATE_SYMBOL_PREFIX + name;
    }
    exports.prepareSyntheticPropertyName = prepareSyntheticPropertyName;
    function prepareSyntheticListenerName(name, phase) {
        return "" + ANIMATE_SYMBOL_PREFIX + name + "." + phase;
    }
    exports.prepareSyntheticListenerName = prepareSyntheticListenerName;
    function isSyntheticPropertyOrListener(name) {
        return name.charAt(0) == ANIMATE_SYMBOL_PREFIX;
    }
    exports.isSyntheticPropertyOrListener = isSyntheticPropertyOrListener;
    function getSyntheticPropertyName(name) {
        // this will strip out listener phase values...
        // @foo.start => @foo
        var i = name.indexOf('.');
        name = i > 0 ? name.substring(0, i) : name;
        if (name.charAt(0) !== ANIMATE_SYMBOL_PREFIX) {
            name = ANIMATE_SYMBOL_PREFIX + name;
        }
        return name;
    }
    exports.getSyntheticPropertyName = getSyntheticPropertyName;
    function prepareSyntheticListenerFunctionName(name, phase) {
        return "animation_" + name + "_" + phase;
    }
    exports.prepareSyntheticListenerFunctionName = prepareSyntheticListenerFunctionName;
    function jitOnlyGuardedExpression(expr) {
        var ngJitMode = new o.ExternalExpr({ name: 'ngJitMode', moduleName: null });
        var jitFlagNotDefined = new o.BinaryOperatorExpr(o.BinaryOperator.Identical, new o.TypeofExpr(ngJitMode), o.literal('undefined'));
        var jitFlagUndefinedOrTrue = new o.BinaryOperatorExpr(o.BinaryOperator.Or, jitFlagNotDefined, ngJitMode, /* type */ undefined, 
        /* sourceSpan */ undefined, true);
        return new o.BinaryOperatorExpr(o.BinaryOperator.And, jitFlagUndefinedOrTrue, expr);
    }
    exports.jitOnlyGuardedExpression = jitOnlyGuardedExpression;
    function wrapReference(value) {
        var wrapped = new o.WrappedNodeExpr(value);
        return { value: wrapped, type: wrapped };
    }
    exports.wrapReference = wrapReference;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgseUVBQWtEO0lBQ2xELDJEQUEwQztJQUcxQzs7T0FFRztJQUNILFNBQWdCLGtCQUFrQixDQUFDLEdBQTRDO1FBQzdFLElBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUMvQixVQUFBLEdBQUcsSUFBSSxPQUFBLENBQUM7WUFDTixHQUFHLEtBQUE7WUFDSCwwRkFBMEY7WUFDMUYscUVBQXFFO1lBQ3JFLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFFO1lBQ2hCLE1BQU0sRUFBRSxLQUFLO1NBQ2QsQ0FBQyxFQU5LLENBTUwsQ0FBQyxDQUFDO1FBQ1IsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFWRCxnREFVQztJQUVEOzs7O09BSUc7SUFDSCxTQUFnQixtQkFBbUIsQ0FBQyxJQUFTLEVBQUUsR0FBa0I7UUFDL0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsbUJBQW1CLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUEvQixDQUErQixDQUFDLENBQUMsQ0FBQztTQUN6RTtRQUNELElBQUksSUFBSSxZQUFZLDRCQUFZLEVBQUU7WUFDaEMsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ2hCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJ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O0lBQ3RGLENBQUM7SUFSRCw0REFRQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxLQUFVO1FBQ3RDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxPQUFPLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFDekMsQ0FBQztJQUhELHNDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3RhdGljU3ltYm9sfSBmcm9tICcuLi9hb3Qvc3RhdGljX3N5bWJvbCc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7T3V0cHV0Q29udGV4dH0gZnJvbSAnLi4vdXRpbCc7XG5cbi8qKlxuICogQ29udmVydCBhbiBvYmplY3QgbWFwIHdpdGggYEV4cHJlc3Npb25gIHZhbHVlcyBpbnRvIGEgYExpdGVyYWxNYXBFeHByYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcFRvTWFwRXhwcmVzc2lvbihtYXA6IHtba2V5OiBzdHJpbmddOiBvLkV4cHJlc3Npb258dW5kZWZpbmVkfSk6IG8uTGl0ZXJhbE1hcEV4cHIge1xuICBjb25zdCByZXN1bHQgPSBPYmplY3Qua2V5cyhtYXApLm1hcChcbiAgICAgIGtleSA9PiAoe1xuICAgICAgICBrZXksXG4gICAgICAgIC8vIFRoZSBhc3NlcnRpb24gaGVyZSBpcyBiZWNhdXNlIHJlYWxseSBUeXBlU2NyaXB0IGRvZXNuJ3QgYWxsb3cgdXMgdG8gZXhwcmVzcyB0aGF0IGlmIHRoZVxuICAgICAgICAvLyBrZXkgaXMgcHJlc2VudCwgaXQgd2lsbCBoYXZlIGEgdmFsdWUsIGJ1dCB0aGlzIGlzIHRydWUgaW4gcmVhbGl0eS5cbiAgICAgICAgdmFsdWU6IG1hcFtrZXldISxcbiAgICAgICAgcXVvdGVkOiBmYWxzZSxcbiAgICAgIH0pKTtcbiAgcmV0dXJuIG8ubGl0ZXJhbE1hcChyZXN1bHQpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgbWV0YWRhdGEgaW50byBhbiBgRXhwcmVzc2lvbmAgaW4gdGhlIGdpdmVuIGBPdXRwdXRDb250ZXh0YC5cbiAqXG4gKiBUaGlzIG9wZXJhdGlvbiB3aWxsIGhhbmRsZSBhcnJheXMsIHJlZmVyZW5jZXMgdG8gc3ltYm9scywgb3IgbGl0ZXJhbCBgbnVsbGAgb3IgYHVuZGVmaW5lZGAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0TWV0YVRvT3V0cHV0KG1ldGE6IGFueSwgY3R4OiBPdXRwdXRDb250ZXh0KTogby5FeHByZXNzaW9uIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkobWV0YSkpIHtcbiAgICByZXR1cm4gby5saXRlcmFsQXJyKG1ldGEubWFwKGVudHJ5ID0+IGNvbnZlcnRNZXRhVG9PdXRwdXQoZW50cnksIGN0eCkpKTtcbiAgfVxuICBpZiAobWV0YSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgIHJldHVybiBjdHguaW1wb3J0RXhwcihtZXRhKTtcbiAgfVxuICBpZiAobWV0YSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG8ubGl0ZXJhbChtZXRhKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgSW50ZXJuYWwgZXJyb3I6IFVuc3VwcG9ydGVkIG9yIHVua25vd24gbWV0YWRhdGE6ICR7bWV0YX1gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVXaXRoUGFyYW1ldGVycyh0eXBlOiBvLkV4cHJlc3Npb24sIG51bVBhcmFtczogbnVtYmVyKTogby5FeHByZXNzaW9uVHlwZSB7XG4gIGlmIChudW1QYXJhbXMgPT09IDApIHtcbiAgICByZXR1cm4gby5leHByZXNzaW9uVHlwZSh0eXBlKTtcbiAgfVxuICBjb25zdCBwYXJhbXM6IG8uVHlwZVtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtUGFyYW1zOyBpKyspIHtcbiAgICBwYXJhbXMucHVzaChvLkRZTkFNSUNfVFlQRSk7XG4gIH1cbiAgcmV0dXJuIG8uZXhwcmVzc2lvblR5cGUodHlwZSwgdW5kZWZpbmVkLCBwYXJhbXMpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFIzUmVmZXJlbmNlIHtcbiAgdmFsdWU6IG8uRXhwcmVzc2lvbjtcbiAgdHlwZTogby5FeHByZXNzaW9uO1xufVxuXG5jb25zdCBBTklNQVRFX1NZTUJPTF9QUkVGSVggPSAnQCc7XG5leHBvcnQgZnVuY3Rpb24gcHJlcGFyZVN5bnRoZXRpY1Byb3BlcnR5TmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGAke0FOSU1BVEVfU1lNQk9MX1BSRUZJWH0ke25hbWV9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVTeW50aGV0aWNMaXN0ZW5lck5hbWUobmFtZTogc3RyaW5nLCBwaGFzZTogc3RyaW5nKSB7XG4gIHJldHVybiBgJHtBTklNQVRFX1NZTUJPTF9QUkVGSVh9JHtuYW1lfS4ke3BoYXNlfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N5bnRoZXRpY1Byb3BlcnR5T3JMaXN0ZW5lcihuYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5hbWUuY2hhckF0KDApID09IEFOSU1BVEVfU1lNQk9MX1BSRUZJWDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN5bnRoZXRpY1Byb3BlcnR5TmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgLy8gdGhpcyB3aWxsIHN0cmlwIG91dCBsaXN0ZW5lciBwaGFzZSB2YWx1ZXMuLi5cbiAgLy8gQGZvby5zdGFydCA9PiBAZm9vXG4gIGNvbnN0IGkgPSBuYW1lLmluZGV4T2YoJy4nKTtcbiAgbmFtZSA9IGkgPiAwID8gbmFtZS5zdWJzdHJpbmcoMCwgaSkgOiBuYW1lO1xuICBpZiAobmFtZS5jaGFyQXQoMCkgIT09IEFOSU1BVEVfU1lNQk9MX1BSRUZJWCkge1xuICAgIG5hbWUgPSBBTklNQVRFX1NZTUJPTF9QUkVGSVggKyBuYW1lO1xuICB9XG4gIHJldHVybiBuYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlcGFyZVN5bnRoZXRpY0xpc3RlbmVyRnVuY3Rpb25OYW1lKG5hbWU6IHN0cmluZywgcGhhc2U6IHN0cmluZykge1xuICByZXR1cm4gYGFuaW1hdGlvbl8ke25hbWV9XyR7cGhhc2V9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGppdE9ubHlHdWFyZGVkRXhwcmVzc2lvbihleHByOiBvLkV4cHJlc3Npb24pOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCBuZ0ppdE1vZGUgPSBuZXcgby5FeHRlcm5hbEV4cHIoe25hbWU6ICduZ0ppdE1vZGUnLCBtb2R1bGVOYW1lOiBudWxsfSk7XG4gIGNvbnN0IGppdEZsYWdOb3REZWZpbmVkID0gbmV3IG8uQmluYXJ5T3BlcmF0b3JFeHByKFxuICAgICAgby5CaW5hcnlPcGVyYXRvci5JZGVudGljYWwsIG5ldyBvLlR5cGVvZkV4cHIobmdKaXRNb2RlKSwgby5saXRlcmFsKCd1bmRlZmluZWQnKSk7XG4gIGNvbnN0IGppdEZsYWdVbmRlZmluZWRPclRydWUgPSBuZXcgby5CaW5hcnlPcGVyYXRvckV4cHIoXG4gICAgICBvLkJpbmFyeU9wZXJhdG9yLk9yLCBqaXRGbGFnTm90RGVmaW5lZCwgbmdKaXRNb2RlLCAvKiB0eXBlICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIHNvdXJjZVNwYW4gKi8gdW5kZWZpbmVkLCB0cnVlKTtcbiAgcmV0dXJuIG5ldyBvLkJpbmFyeU9wZXJhdG9yRXhwcihvLkJpbmFyeU9wZXJhdG9yLkFuZCwgaml0RmxhZ1VuZGVmaW5lZE9yVHJ1ZSwgZXhwcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUmVmZXJlbmNlKHZhbHVlOiBhbnkpOiBSM1JlZmVyZW5jZSB7XG4gIGNvbnN0IHdyYXBwZWQgPSBuZXcgby5XcmFwcGVkTm9kZUV4cHIodmFsdWUpO1xuICByZXR1cm4ge3ZhbHVlOiB3cmFwcGVkLCB0eXBlOiB3cmFwcGVkfTtcbn1cbiJdfQ==