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
        define("@angular/compiler/src/render3/view/util", ["require", "exports", "tslib", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/util", "@angular/compiler/src/render3/r3_ast", "@angular/compiler/src/render3/view/i18n/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInterpolationArgsLength = exports.chainedInstruction = exports.getAttrsForDirectiveMatching = exports.DefinitionMap = exports.getQueryPredicate = exports.trimTrailingNulls = exports.conditionallyCreateMapObjectLiteral = exports.asLiteral = exports.invalid = exports.unsupported = exports.temporaryAllocator = exports.NON_BINDABLE_ATTR = exports.IMPLICIT_REFERENCE = exports.REFERENCE_PREFIX = exports.RENDER_FLAGS = exports.CONTEXT_NAME = exports.TEMPORARY_NAME = void 0;
    var tslib_1 = require("tslib");
    var o = require("@angular/compiler/src/output/output_ast");
    var util_1 = require("@angular/compiler/src/util");
    var t = require("@angular/compiler/src/render3/r3_ast");
    var util_2 = require("@angular/compiler/src/render3/view/i18n/util");
    /**
     * Checks whether an object key contains potentially unsafe chars, thus the key should be wrapped in
     * quotes. Note: we do not wrap all keys into quotes, as it may have impact on minification and may
     * bot work in some cases when object keys are mangled by minifier.
     *
     * TODO(FW-1136): this is a temporary solution, we need to come up with a better way of working with
     * inputs that contain potentially unsafe chars.
     */
    var UNSAFE_OBJECT_KEY_NAME_REGEXP = /[-.]/;
    /** Name of the temporary to use during data binding */
    exports.TEMPORARY_NAME = '_t';
    /** Name of the context parameter passed into a template function */
    exports.CONTEXT_NAME = 'ctx';
    /** Name of the RenderFlag passed into a template function */
    exports.RENDER_FLAGS = 'rf';
    /** The prefix reference variables */
    exports.REFERENCE_PREFIX = '_r';
    /** The name of the implicit context reference */
    exports.IMPLICIT_REFERENCE = '$implicit';
    /** Non bindable attribute name **/
    exports.NON_BINDABLE_ATTR = 'ngNonBindable';
    /**
     * Creates an allocator for a temporary variable.
     *
     * A variable declaration is added to the statements the first time the allocator is invoked.
     */
    function temporaryAllocator(statements, name) {
        var temp = null;
        return function () {
            if (!temp) {
                statements.push(new o.DeclareVarStmt(exports.TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
                temp = o.variable(name);
            }
            return temp;
        };
    }
    exports.temporaryAllocator = temporaryAllocator;
    function unsupported(feature) {
        if (this) {
            throw new Error("Builder " + this.constructor.name + " doesn't support " + feature + " yet");
        }
        throw new Error("Feature " + feature + " is not supported yet");
    }
    exports.unsupported = unsupported;
    function invalid(arg) {
        throw new Error("Invalid state: Visitor " + this.constructor.name + " doesn't handle " + arg.constructor.name);
    }
    exports.invalid = invalid;
    function asLiteral(value) {
        if (Array.isArray(value)) {
            return o.literalArr(value.map(asLiteral));
        }
        return o.literal(value, o.INFERRED_TYPE);
    }
    exports.asLiteral = asLiteral;
    function conditionallyCreateMapObjectLiteral(keys, keepDeclared) {
        if (Object.getOwnPropertyNames(keys).length > 0) {
            return mapToExpression(keys, keepDeclared);
        }
        return null;
    }
    exports.conditionallyCreateMapObjectLiteral = conditionallyCreateMapObjectLiteral;
    function mapToExpression(map, keepDeclared) {
        return o.literalMap(Object.getOwnPropertyNames(map).map(function (key) {
            var _a, _b;
            // canonical syntax: `dirProp: publicProp`
            // if there is no `:`, use dirProp = elProp
            var value = map[key];
            var declaredName;
            var publicName;
            var minifiedName;
            if (Array.isArray(value)) {
                _a = tslib_1.__read(value, 2), publicName = _a[0], declaredName = _a[1];
            }
            else {
                _b = tslib_1.__read(util_1.splitAtColon(key, [key, value]), 2), declaredName = _b[0], publicName = _b[1];
            }
            minifiedName = declaredName;
            return {
                key: minifiedName,
                // put quotes around keys that contain potentially unsafe characters
                quoted: UNSAFE_OBJECT_KEY_NAME_REGEXP.test(minifiedName),
                value: (keepDeclared && publicName !== declaredName) ?
                    o.literalArr([asLiteral(publicName), asLiteral(declaredName)]) :
                    asLiteral(publicName)
            };
        }));
    }
    /**
     *  Remove trailing null nodes as they are implied.
     */
    function trimTrailingNulls(parameters) {
        while (o.isNull(parameters[parameters.length - 1])) {
            parameters.pop();
        }
        return parameters;
    }
    exports.trimTrailingNulls = trimTrailingNulls;
    function getQueryPredicate(query, constantPool) {
        if (Array.isArray(query.predicate)) {
            var predicate_1 = [];
            query.predicate.forEach(function (selector) {
                // Each item in predicates array may contain strings with comma-separated refs
                // (for ex. 'ref, ref1, ..., refN'), thus we extract individual refs and store them
                // as separate array entities
                var selectors = selector.split(',').map(function (token) { return o.literal(token.trim()); });
                predicate_1.push.apply(predicate_1, tslib_1.__spread(selectors));
            });
            return constantPool.getConstLiteral(o.literalArr(predicate_1), true);
        }
        else {
            return query.predicate;
        }
    }
    exports.getQueryPredicate = getQueryPredicate;
    var DefinitionMap = /** @class */ (function () {
        function DefinitionMap() {
            this.values = [];
        }
        DefinitionMap.prototype.set = function (key, value) {
            if (value) {
                this.values.push({ key: key, value: value, quoted: false });
            }
        };
        DefinitionMap.prototype.toLiteralMap = function () {
            return o.literalMap(this.values);
        };
        return DefinitionMap;
    }());
    exports.DefinitionMap = DefinitionMap;
    /**
     * Extract a map of properties to values for a given element or template node, which can be used
     * by the directive matching machinery.
     *
     * @param elOrTpl the element or template in question
     * @return an object set up for directive matching. For attributes on the element/template, this
     * object maps a property name to its (static) value. For any bindings, this map simply maps the
     * property name to an empty string.
     */
    function getAttrsForDirectiveMatching(elOrTpl) {
        var attributesMap = {};
        if (elOrTpl instanceof t.Template && elOrTpl.tagName !== 'ng-template') {
            elOrTpl.templateAttrs.forEach(function (a) { return attributesMap[a.name] = ''; });
        }
        else {
            elOrTpl.attributes.forEach(function (a) {
                if (!util_2.isI18nAttribute(a.name)) {
                    attributesMap[a.name] = a.value;
                }
            });
            elOrTpl.inputs.forEach(function (i) {
                attributesMap[i.name] = '';
            });
            elOrTpl.outputs.forEach(function (o) {
                attributesMap[o.name] = '';
            });
        }
        return attributesMap;
    }
    exports.getAttrsForDirectiveMatching = getAttrsForDirectiveMatching;
    /** Returns a call expression to a chained instruction, e.g. `property(params[0])(params[1])`. */
    function chainedInstruction(reference, calls, span) {
        var expression = o.importExpr(reference, null, span);
        if (calls.length > 0) {
            for (var i = 0; i < calls.length; i++) {
                expression = expression.callFn(calls[i], span);
            }
        }
        else {
            // Add a blank invocation, in case the `calls` array is empty.
            expression = expression.callFn([], span);
        }
        return expression;
    }
    exports.chainedInstruction = chainedInstruction;
    /**
     * Gets the number of arguments expected to be passed to a generated instruction in the case of
     * interpolation instructions.
     * @param interpolation An interpolation ast
     */
    function getInterpolationArgsLength(interpolation) {
        var expressions = interpolation.expressions, strings = interpolation.strings;
        if (expressions.length === 1 && strings.length === 2 && strings[0] === '' && strings[1] === '') {
            // If the interpolation has one interpolated value, but the prefix and suffix are both empty
            // strings, we only pass one argument, to a special instruction like `propertyInterpolate` or
            // `textInterpolate`.
            return 1;
        }
        else {
            return expressions.length + strings.length;
        }
    }
    exports.getInterpolationArgsLength = getInterpolationArgsLength;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsMkRBQTZDO0lBRTdDLG1EQUF3QztJQUN4Qyx3REFBK0I7SUFHL0IscUVBQTRDO0lBRzVDOzs7Ozs7O09BT0c7SUFDSCxJQUFNLDZCQUE2QixHQUFHLE1BQU0sQ0FBQztJQUU3Qyx1REFBdUQ7SUFDMUMsUUFBQSxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBRW5DLG9FQUFvRTtJQUN2RCxRQUFBLFlBQVksR0FBRyxLQUFLLENBQUM7SUFFbEMsNkRBQTZEO0lBQ2hELFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQztJQUVqQyxxQ0FBcUM7SUFDeEIsUUFBQSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7SUFFckMsaURBQWlEO0lBQ3BDLFFBQUEsa0JBQWtCLEdBQUcsV0FBVyxDQUFDO0lBRTlDLG1DQUFtQztJQUN0QixRQUFBLGlCQUFpQixHQUFHLGVBQWUsQ0FBQztJQUVqRDs7OztPQUlHO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsVUFBeUIsRUFBRSxJQUFZO1FBQ3hFLElBQUksSUFBSSxHQUF1QixJQUFJLENBQUM7UUFDcEMsT0FBTztZQUNMLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1QsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsc0JBQWMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ2pGLElBQUksR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3pCO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUM7SUFDSixDQUFDO0lBVEQsZ0RBU0M7SUFHRCxTQUFnQixXQUFX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QUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBaUIsQ0FBQztRQUVyRSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNyQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDaEQ7U0FDRjthQUFNO1lBQ0wsOERBQThEO1lBQzlELFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMxQztRQUVELE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFkRCxnREFjQztJQUVEOzs7O09BSUc7SUFDSCxTQUFnQiwwQkFBMEIsQ0FBQyxhQUE0QjtRQUM5RCxJQUFBLFdBQVcsR0FBYSxhQUFhLFlBQTFCLEVBQUUsT0FBTyxHQUFJLGFBQWEsUUFBakIsQ0FBa0I7UUFDN0MsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDOUYsNEZBQTRGO1lBQzVGLDZGQUE2RjtZQUM3RixxQkFBcUI7WUFDckIsT0FBTyxDQUFDLENBQUM7U0FDVjthQUFNO1lBQ0wsT0FBTyxXQUFXLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7U0FDNUM7SUFDSCxDQUFDO0lBVkQsZ0VBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4uLy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0IHtJbnRlcnBvbGF0aW9ufSBmcm9tICcuLi8uLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge3NwbGl0QXRDb2xvbn0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgKiBhcyB0IGZyb20gJy4uL3IzX2FzdCc7XG5cbmltcG9ydCB7UjNRdWVyeU1ldGFkYXRhfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge2lzSTE4bkF0dHJpYnV0ZX0gZnJvbSAnLi9pMThuL3V0aWwnO1xuXG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYW4gb2JqZWN0IGtleSBjb250YWlucyBwb3RlbnRpYWxseSB1bnNhZmUgY2hhcnMsIHRodXMgdGhlIGtleSBzaG91bGQgYmUgd3JhcHBlZCBpblxuICogcXVvdGVzLiBOb3RlOiB3ZSBkbyBub3Qgd3JhcCBhbGwga2V5cyBpbnRvIHF1b3RlcywgYXMgaXQgbWF5IGhhdmUgaW1wYWN0IG9uIG1pbmlmaWNhdGlvbiBhbmQgbWF5XG4gKiBib3Qgd29yayBpbiBzb21lIGNhc2VzIHdoZW4gb2JqZWN0IGtleXMgYXJlIG1hbmdsZWQgYnkgbWluaWZpZXIuXG4gKlxuICogVE9ETyhGVy0xMTM2KTogdGhpcyBpcyBhIHRlbXBvcmFyeSBzb2x1dGlvbiwgd2UgbmVlZCB0byBjb21lIHVwIHdpdGggYSBiZXR0ZXIgd2F5IG9mIHdvcmtpbmcgd2l0aFxuICogaW5wdXRzIHRoYXQgY29udGFpbiBwb3RlbnRpYWxseSB1bnNhZmUgY2hhcnMuXG4gKi9cbmNvbnN0IFVOU0FGRV9PQkpFQ1RfS0VZX05BTUVfUkVHRVhQID0gL1stLl0vO1xuXG4vKiogTmFtZSBvZiB0aGUgdGVtcG9yYXJ5IHRvIHVzZSBkdXJpbmcgZGF0YSBiaW5kaW5nICovXG5leHBvcnQgY29uc3QgVEVNUE9SQVJZX05BTUUgPSAnX3QnO1xuXG4vKiogTmFtZSBvZiB0aGUgY29udGV4dCBwYXJhbWV0ZXIgcGFzc2VkIGludG8gYSB0ZW1wbGF0ZSBmdW5jdGlvbiAqL1xuZXhwb3J0IGNvbnN0IENPTlRFWFRfTkFNRSA9ICdjdHgnO1xuXG4vKiogTmFtZSBvZiB0aGUgUmVuZGVyRmxhZyBwYXNzZWQgaW50byBhIHRlbXBsYXRlIGZ1bmN0aW9uICovXG5leHBvcnQgY29uc3QgUkVOREVSX0ZMQUdTID0gJ3JmJztcblxuLyoqIFRoZSBwcmVmaXggcmVmZXJlbmNlIHZhcmlhYmxlcyAqL1xuZXhwb3J0IGNvbnN0IFJFRkVSRU5DRV9QUkVGSVggPSAnX3InO1xuXG4vKiogVGhlIG5hbWUgb2YgdGhlIGltcGxpY2l0IGNvbnRleHQgcmVmZXJlbmNlICovXG5leHBvcnQgY29uc3QgSU1QTElDSVRfUkVGRVJFTkNFID0gJyRpbXBsaWNpdCc7XG5cbi8qKiBOb24gYmluZGFibGUgYXR0cmlidXRlIG5hbWUgKiovXG5leHBvcnQgY29uc3QgTk9OX0JJTkRBQkxFX0FUVFIgPSAnbmdOb25CaW5kYWJsZSc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhbGxvY2F0b3IgZm9yIGEgdGVtcG9yYXJ5IHZhcmlhYmxlLlxuICpcbiAqIEEgdmFyaWFibGUgZGVjbGFyYXRpb24gaXMgYWRkZWQgdG8gdGhlIHN0YXRlbWVudHMgdGhlIGZpcnN0IHRpbWUgdGhlIGFsbG9jYXRvciBpcyBpbnZva2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVtcG9yYXJ5QWxsb2NhdG9yKHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIG5hbWU6IHN0cmluZyk6ICgpID0+IG8uUmVhZFZhckV4cHIge1xuICBsZXQgdGVtcDogby5SZWFkVmFyRXhwcnxudWxsID0gbnVsbDtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBpZiAoIXRlbXApIHtcbiAgICAgIHN0YXRlbWVudHMucHVzaChuZXcgby5EZWNsYXJlVmFyU3RtdChURU1QT1JBUllfTkFNRSwgdW5kZWZpbmVkLCBvLkRZTkFNSUNfVFlQRSkpO1xuICAgICAgdGVtcCA9IG8udmFyaWFibGUobmFtZSk7XG4gICAgfVxuICAgIHJldHVybiB0ZW1wO1xuICB9O1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB1bnN1cHBvcnRlZCh0aGlzOiB2b2lkfEZ1bmN0aW9uLCBmZWF0dXJlOiBzdHJpbmcpOiBuZXZlciB7XG4gIGlmICh0aGlzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBCdWlsZGVyICR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSBkb2Vzbid0IHN1cHBvcnQgJHtmZWF0dXJlfSB5ZXRgKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoYEZlYXR1cmUgJHtmZWF0dXJlfSBpcyBub3Qgc3VwcG9ydGVkIHlldGApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52YWxpZDxUPih0aGlzOiB0LlZpc2l0b3IsIGFyZzogby5FeHByZXNzaW9ufG8uU3RhdGVtZW50fHQuTm9kZSk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYEludmFsaWQgc3RhdGU6IFZpc2l0b3IgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGRvZXNuJ3QgaGFuZGxlICR7YXJnLmNvbnN0cnVjdG9yLm5hbWV9YCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc0xpdGVyYWwodmFsdWU6IGFueSk6IG8uRXhwcmVzc2lvbiB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiBvLmxpdGVyYWxBcnIodmFsdWUubWFwKGFzTGl0ZXJhbCkpO1xuICB9XG4gIHJldHVybiBvLmxpdGVyYWwodmFsdWUsIG8uSU5GRVJSRURfVFlQRSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25kaXRpb25hbGx5Q3JlYXRlTWFwT2JqZWN0TGl0ZXJhbChcbiAgICBrZXlzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfHN0cmluZ1tdfSwga2VlcERlY2xhcmVkPzogYm9vbGVhbik6IG8uRXhwcmVzc2lvbnxudWxsIHtcbiAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGtleXMpLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gbWFwVG9FeHByZXNzaW9uKGtleXMsIGtlZXBEZWNsYXJlZCk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIG1hcFRvRXhwcmVzc2lvbihcbiAgICBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd8c3RyaW5nW119LCBrZWVwRGVjbGFyZWQ/OiBib29sZWFuKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIG8ubGl0ZXJhbE1hcChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtYXApLm1hcChrZXkgPT4ge1xuICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBwdWJsaWNQcm9wYFxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICBjb25zdCB2YWx1ZSA9IG1hcFtrZXldO1xuICAgIGxldCBkZWNsYXJlZE5hbWU6IHN0cmluZztcbiAgICBsZXQgcHVibGljTmFtZTogc3RyaW5nO1xuICAgIGxldCBtaW5pZmllZE5hbWU6IHN0cmluZztcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIFtwdWJsaWNOYW1lLCBkZWNsYXJlZE5hbWVdID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIFtkZWNsYXJlZE5hbWUsIHB1YmxpY05hbWVdID0gc3BsaXRBdENvbG9uKGtleSwgW2tleSwgdmFsdWVdKTtcbiAgICB9XG4gICAgbWluaWZpZWROYW1lID0gZGVjbGFyZWROYW1lO1xuICAgIHJldHVybiB7XG4gICAgICBrZXk6IG1pbmlmaWVkTmFtZSxcbiAgICAgIC8vIHB1dCBxdW90ZXMgYXJvdW5kIGtleXMgdGhhdCBjb250YWluIHBvdGVudGlhbGx5IHVuc2FmZSBjaGFyYWN0ZXJzXG4gICAgICBxdW90ZWQ6IFVOU0FGRV9PQkpFQ1RfS0VZX05BTUVfUkVHRVhQLnRlc3QobWluaWZpZWROYW1lKSxcbiAgICAgIHZhbHVlOiAoa2VlcERlY2xhcmVkICYmIHB1YmxpY05hbWUgIT09IGRlY2xhcmVkTmFtZSkgP1xuICAgICAgICAgIG8ubGl0ZXJhbEFycihbYXNMaXRlcmFsKHB1YmxpY05hbWUpLCBhc0xpdGVyYWwoZGVjbGFyZWROYW1lKV0pIDpcbiAgICAgICAgICBhc0xpdGVyYWwocHVibGljTmFtZSlcbiAgICB9O1xuICB9KSk7XG59XG5cbi8qKlxuICogIFJlbW92ZSB0cmFpbGluZyBudWxsIG5vZGVzIGFzIHRoZXkgYXJlIGltcGxpZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmltVHJhaWxpbmdOdWxscyhwYXJhbWV0ZXJzOiBvLkV4cHJlc3Npb25bXSk6IG8uRXhwcmVzc2lvbltdIHtcbiAgd2hpbGUgKG8uaXNOdWxsKHBhcmFtZXRlcnNbcGFyYW1ldGVycy5sZW5ndGggLSAxXSkpIHtcbiAgICBwYXJhbWV0ZXJzLnBvcCgpO1xuICB9XG4gIHJldHVybiBwYXJhbWV0ZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UXVlcnlQcmVkaWNhdGUoXG4gICAgcXVlcnk6IFIzUXVlcnlNZXRhZGF0YSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wpOiBvLkV4cHJlc3Npb24ge1xuICBpZiAoQXJyYXkuaXNBcnJheShxdWVyeS5wcmVkaWNhdGUpKSB7XG4gICAgbGV0IHByZWRpY2F0ZTogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBxdWVyeS5wcmVkaWNhdGUuZm9yRWFjaCgoc2VsZWN0b3I6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgLy8gRWFjaCBpdGVtIGluIHByZWRpY2F0ZXMgYXJyYXkgbWF5IGNvbnRhaW4gc3RyaW5ncyB3aXRoIGNvbW1hLXNlcGFyYXRlZCByZWZzXG4gICAgICAvLyAoZm9yIGV4LiAncmVmLCByZWYxLCAuLi4sIHJlZk4nKSwgdGh1cyB3ZSBleHRyYWN0IGluZGl2aWR1YWwgcmVmcyBhbmQgc3RvcmUgdGhlbVxuICAgICAgLy8gYXMgc2VwYXJhdGUgYXJyYXkgZW50aXRpZXNcbiAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IHNlbGVjdG9yLnNwbGl0KCcsJykubWFwKHRva2VuID0+IG8ubGl0ZXJhbCh0b2tlbi50cmltKCkpKTtcbiAgICAgIHByZWRpY2F0ZS5wdXNoKC4uLnNlbGVjdG9ycyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwoby5saXRlcmFsQXJyKHByZWRpY2F0ZSksIHRydWUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBxdWVyeS5wcmVkaWNhdGU7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlZmluaXRpb25NYXAge1xuICB2YWx1ZXM6IHtrZXk6IHN0cmluZywgcXVvdGVkOiBib29sZWFuLCB2YWx1ZTogby5FeHByZXNzaW9ufVtdID0gW107XG5cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogby5FeHByZXNzaW9ufG51bGwpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMudmFsdWVzLnB1c2goe2tleSwgdmFsdWUsIHF1b3RlZDogZmFsc2V9KTtcbiAgICB9XG4gIH1cblxuICB0b0xpdGVyYWxNYXAoKTogby5MaXRlcmFsTWFwRXhwciB7XG4gICAgcmV0dXJuIG8ubGl0ZXJhbE1hcCh0aGlzLnZhbHVlcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHRyYWN0IGEgbWFwIG9mIHByb3BlcnRpZXMgdG8gdmFsdWVzIGZvciBhIGdpdmVuIGVsZW1lbnQgb3IgdGVtcGxhdGUgbm9kZSwgd2hpY2ggY2FuIGJlIHVzZWRcbiAqIGJ5IHRoZSBkaXJlY3RpdmUgbWF0Y2hpbmcgbWFjaGluZXJ5LlxuICpcbiAqIEBwYXJhbSBlbE9yVHBsIHRoZSBlbGVtZW50IG9yIHRlbXBsYXRlIGluIHF1ZXN0aW9uXG4gKiBAcmV0dXJuIGFuIG9iamVjdCBzZXQgdXAgZm9yIGRpcmVjdGl2ZSBtYXRjaGluZy4gRm9yIGF0dHJpYnV0ZXMgb24gdGhlIGVsZW1lbnQvdGVtcGxhdGUsIHRoaXNcbiAqIG9iamVjdCBtYXBzIGEgcHJvcGVydHkgbmFtZSB0byBpdHMgKHN0YXRpYykgdmFsdWUuIEZvciBhbnkgYmluZGluZ3MsIHRoaXMgbWFwIHNpbXBseSBtYXBzIHRoZVxuICogcHJvcGVydHkgbmFtZSB0byBhbiBlbXB0eSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBdHRyc0ZvckRpcmVjdGl2ZU1hdGNoaW5nKGVsT3JUcGw6IHQuRWxlbWVudHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQuVGVtcGxhdGUpOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30ge1xuICBjb25zdCBhdHRyaWJ1dGVzTWFwOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcblxuXG4gIGlmIChlbE9yVHBsIGluc3RhbmNlb2YgdC5UZW1wbGF0ZSAmJiBlbE9yVHBsLnRhZ05hbWUgIT09ICduZy10ZW1wbGF0ZScpIHtcbiAgICBlbE9yVHBsLnRlbXBsYXRlQXR0cnMuZm9yRWFjaChhID0+IGF0dHJpYnV0ZXNNYXBbYS5uYW1lXSA9ICcnKTtcbiAgfSBlbHNlIHtcbiAgICBlbE9yVHBsLmF0dHJpYnV0ZXMuZm9yRWFjaChhID0+IHtcbiAgICAgIGlmICghaXNJMThuQXR0cmlidXRlKGEubmFtZSkpIHtcbiAgICAgICAgYXR0cmlidXRlc01hcFthLm5hbWVdID0gYS52YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGVsT3JUcGwuaW5wdXRzLmZvckVhY2goaSA9PiB7XG4gICAgICBhdHRyaWJ1dGVzTWFwW2kubmFtZV0gPSAnJztcbiAgICB9KTtcbiAgICBlbE9yVHBsLm91dHB1dHMuZm9yRWFjaChvID0+IHtcbiAgICAgIGF0dHJpYnV0ZXNNYXBbby5uYW1lXSA9ICcnO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGF0dHJpYnV0ZXNNYXA7XG59XG5cbi8qKiBSZXR1cm5zIGEgY2FsbCBleHByZXNzaW9uIHRvIGEgY2hhaW5lZCBpbnN0cnVjdGlvbiwgZS5nLiBgcHJvcGVydHkocGFyYW1zWzBdKShwYXJhbXNbMV0pYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFpbmVkSW5zdHJ1Y3Rpb24oXG4gICAgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlLCBjYWxsczogby5FeHByZXNzaW9uW11bXSwgc3Bhbj86IFBhcnNlU291cmNlU3BhbnxudWxsKSB7XG4gIGxldCBleHByZXNzaW9uID0gby5pbXBvcnRFeHByKHJlZmVyZW5jZSwgbnVsbCwgc3BhbikgYXMgby5FeHByZXNzaW9uO1xuXG4gIGlmIChjYWxscy5sZW5ndGggPiAwKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24uY2FsbEZuKGNhbGxzW2ldLCBzcGFuKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gQWRkIGEgYmxhbmsgaW52b2NhdGlvbiwgaW4gY2FzZSB0aGUgYGNhbGxzYCBhcnJheSBpcyBlbXB0eS5cbiAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi5jYWxsRm4oW10sIHNwYW4pO1xuICB9XG5cbiAgcmV0dXJuIGV4cHJlc3Npb247XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbnVtYmVyIG9mIGFyZ3VtZW50cyBleHBlY3RlZCB0byBiZSBwYXNzZWQgdG8gYSBnZW5lcmF0ZWQgaW5zdHJ1Y3Rpb24gaW4gdGhlIGNhc2Ugb2ZcbiAqIGludGVycG9sYXRpb24gaW5zdHJ1Y3Rpb25zLlxuICogQHBhcmFtIGludGVycG9sYXRpb24gQW4gaW50ZXJwb2xhdGlvbiBhc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEludGVycG9sYXRpb25BcmdzTGVuZ3RoKGludGVycG9sYXRpb246IEludGVycG9sYXRpb24pIHtcbiAgY29uc3Qge2V4cHJlc3Npb25zLCBzdHJpbmdzfSA9IGludGVycG9sYXRpb247XG4gIGlmIChleHByZXNzaW9ucy5sZW5ndGggPT09IDEgJiYgc3RyaW5ncy5sZW5ndGggPT09IDIgJiYgc3RyaW5nc1swXSA9PT0gJycgJiYgc3RyaW5nc1sxXSA9PT0gJycpIHtcbiAgICAvLyBJZiB0aGUgaW50ZXJwb2xhdGlvbiBoYXMgb25lIGludGVycG9sYXRlZCB2YWx1ZSwgYnV0IHRoZSBwcmVmaXggYW5kIHN1ZmZpeCBhcmUgYm90aCBlbXB0eVxuICAgIC8vIHN0cmluZ3MsIHdlIG9ubHkgcGFzcyBvbmUgYXJndW1lbnQsIHRvIGEgc3BlY2lhbCBpbnN0cnVjdGlvbiBsaWtlIGBwcm9wZXJ0eUludGVycG9sYXRlYCBvclxuICAgIC8vIGB0ZXh0SW50ZXJwb2xhdGVgLlxuICAgIHJldHVybiAxO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBleHByZXNzaW9ucy5sZW5ndGggKyBzdHJpbmdzLmxlbmd0aDtcbiAgfVxufVxuIl19