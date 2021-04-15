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
        define("@angular/compiler-cli/src/ngtsc/metadata/src/inheritance", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flattenInheritedDirectiveMetadata = void 0;
    var tslib_1 = require("tslib");
    var property_mapping_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping");
    /**
     * Given a reference to a directive, return a flattened version of its `DirectiveMeta` metadata
     * which includes metadata from its entire inheritance chain.
     *
     * The returned `DirectiveMeta` will either have `baseClass: null` if the inheritance chain could be
     * fully resolved, or `baseClass: 'dynamic'` if the inheritance chain could not be completely
     * followed.
     */
    function flattenInheritedDirectiveMetadata(reader, dir) {
        var topMeta = reader.getDirectiveMetadata(dir);
        if (topMeta === null) {
            throw new Error("Metadata not found for directive: " + dir.debugName);
        }
        if (topMeta.baseClass === null) {
            return topMeta;
        }
        var coercedInputFields = new Set();
        var undeclaredInputFields = new Set();
        var restrictedInputFields = new Set();
        var stringLiteralInputFields = new Set();
        var isDynamic = false;
        var inputs = property_mapping_1.ClassPropertyMapping.empty();
        var outputs = property_mapping_1.ClassPropertyMapping.empty();
        var addMetadata = function (meta) {
            var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
            if (meta.baseClass === 'dynamic') {
                isDynamic = true;
            }
            else if (meta.baseClass !== null) {
                var baseMeta = reader.getDirectiveMetadata(meta.baseClass);
                if (baseMeta !== null) {
                    addMetadata(baseMeta);
                }
                else {
                    // Missing metadata for the base class means it's effectively dynamic.
                    isDynamic = true;
                }
            }
            inputs = property_mapping_1.ClassPropertyMapping.merge(inputs, meta.inputs);
            outputs = property_mapping_1.ClassPropertyMapping.merge(outputs, meta.outputs);
            try {
                for (var _e = tslib_1.__values(meta.coercedInputFields), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var coercedInputField = _f.value;
                    coercedInputFields.add(coercedInputField);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _g = tslib_1.__values(meta.undeclaredInputFields), _h = _g.next(); !_h.done; _h = _g.next()) {
                    var undeclaredInputField = _h.value;
                    undeclaredInputFields.add(undeclaredInputField);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                }
                finally { if (e_2) throw e_2.error; }
            }
            try {
                for (var _j = tslib_1.__values(meta.restrictedInputFields), _k = _j.next(); !_k.done; _k = _j.next()) {
                    var restrictedInputField = _k.value;
                    restrictedInputFields.add(restrictedInputField);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
                }
                finally { if (e_3) throw e_3.error; }
            }
            try {
                for (var _l = tslib_1.__values(meta.stringLiteralInputFields), _m = _l.next(); !_m.done; _m = _l.next()) {
                    var field = _m.value;
                    stringLiteralInputFields.add(field);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        addMetadata(topMeta);
        return tslib_1.__assign(tslib_1.__assign({}, topMeta), { inputs: inputs,
            outputs: outputs,
            coercedInputFields: coercedInputFields,
            undeclaredInputFields: undeclaredInputFields,
            restrictedInputFields: restrictedInputFields,
            stringLiteralInputFields: stringLiteralInputFields, baseClass: isDynamic ? 'dynamic' : null });
    }
    exports.flattenInheritedDirectiveMetadata = flattenInheritedDirectiveMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5oZXJpdGFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL21ldGFkYXRhL3NyYy9pbmhlcml0YW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBTUgsa0dBQTJFO0lBRTNFOzs7Ozs7O09BT0c7SUFDSCxTQUFnQixpQ0FBaUMsQ0FDN0MsTUFBc0IsRUFBRSxHQUFnQztRQUMxRCxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakQsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXFDLEdBQUcsQ0FBQyxTQUFXLENBQUMsQ0FBQztTQUN2RTtRQUNELElBQUksT0FBTyxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDOUIsT0FBTyxPQUFPLENBQUM7U0FDaEI7UUFFRCxJQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO1FBQ3hELElBQU0scUJBQXFCLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFDM0QsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUMzRCxJQUFNLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO1FBQzlELElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLE1BQU0sR0FBRyx1Q0FBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQyxJQUFJLE9BQU8sR0FBRyx1Q0FBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUzQyxJQUFNLFdBQVcsR0FBRyxVQUFDLElBQW1COztZQUN0QyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO2dCQUNoQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2FBQ2xCO2lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7Z0JBQ2xDLElBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzdELElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtvQkFDckIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTTtvQkFDTCxzRUFBc0U7b0JBQ3RFLFNBQVMsR0FBRyxJQUFJLENBQUM7aUJBQ2xCO2FBQ0Y7WUFFRCxNQUFNLEdBQUcsdUNBQW9CLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekQsT0FBTyxHQUFHLHVDQUFvQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztnQkFFNUQsS0FBZ0MsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBcEQsSUFBTSxpQkFBaUIsV0FBQTtvQkFDMUIsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7aUJBQzNDOzs7Ozs7Ozs7O2dCQUNELEtBQW1DLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMscUJBQXFCLENBQUEsZ0JBQUEsNEJBQUU7b0JBQTFELElBQU0sb0JBQW9CLFdBQUE7b0JBQzdCLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUNqRDs7Ozs7Ozs7OztnQkFDRCxLQUFtQyxJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLHFCQUFxQixDQUFBLGdCQUFBLDRCQUFFO29CQUExRCxJQUFNLG9CQUFvQixXQUFBO29CQUM3QixxQkFBcUIsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztpQkFDakQ7Ozs7Ozs7Ozs7Z0JBQ0QsS0FBb0IsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyx3QkFBd0IsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBOUMsSUFBTSxLQUFLLFdBQUE7b0JBQ2Qsd0JBQXdCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNyQzs7Ozs7Ozs7O1FBQ0gsQ0FBQyxDQUFDO1FBRUYsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXJCLDZDQUNLLE9BQU8sS0FDVixNQUFNLFFBQUE7WUFDTixPQUFPLFNBQUE7WUFDUCxrQkFBa0Isb0JBQUE7WUFDbEIscUJBQXFCLHVCQUFBO1lBQ3JCLHFCQUFxQix1QkFBQTtZQUNyQix3QkFBd0IsMEJBQUEsRUFDeEIsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQ3ZDO0lBQ0osQ0FBQztJQTVERCw4RUE0REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSZWZlcmVuY2V9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuaW1wb3J0IHtEaXJlY3RpdmVNZXRhLCBNZXRhZGF0YVJlYWRlcn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtDbGFzc1Byb3BlcnR5TWFwcGluZywgQ2xhc3NQcm9wZXJ0eU5hbWV9IGZyb20gJy4vcHJvcGVydHlfbWFwcGluZyc7XG5cbi8qKlxuICogR2l2ZW4gYSByZWZlcmVuY2UgdG8gYSBkaXJlY3RpdmUsIHJldHVybiBhIGZsYXR0ZW5lZCB2ZXJzaW9uIG9mIGl0cyBgRGlyZWN0aXZlTWV0YWAgbWV0YWRhdGFcbiAqIHdoaWNoIGluY2x1ZGVzIG1ldGFkYXRhIGZyb20gaXRzIGVudGlyZSBpbmhlcml0YW5jZSBjaGFpbi5cbiAqXG4gKiBUaGUgcmV0dXJuZWQgYERpcmVjdGl2ZU1ldGFgIHdpbGwgZWl0aGVyIGhhdmUgYGJhc2VDbGFzczogbnVsbGAgaWYgdGhlIGluaGVyaXRhbmNlIGNoYWluIGNvdWxkIGJlXG4gKiBmdWxseSByZXNvbHZlZCwgb3IgYGJhc2VDbGFzczogJ2R5bmFtaWMnYCBpZiB0aGUgaW5oZXJpdGFuY2UgY2hhaW4gY291bGQgbm90IGJlIGNvbXBsZXRlbHlcbiAqIGZvbGxvd2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbkluaGVyaXRlZERpcmVjdGl2ZU1ldGFkYXRhKFxuICAgIHJlYWRlcjogTWV0YWRhdGFSZWFkZXIsIGRpcjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+KTogRGlyZWN0aXZlTWV0YSB7XG4gIGNvbnN0IHRvcE1ldGEgPSByZWFkZXIuZ2V0RGlyZWN0aXZlTWV0YWRhdGEoZGlyKTtcbiAgaWYgKHRvcE1ldGEgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE1ldGFkYXRhIG5vdCBmb3VuZCBmb3IgZGlyZWN0aXZlOiAke2Rpci5kZWJ1Z05hbWV9YCk7XG4gIH1cbiAgaWYgKHRvcE1ldGEuYmFzZUNsYXNzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRvcE1ldGE7XG4gIH1cblxuICBjb25zdCBjb2VyY2VkSW5wdXRGaWVsZHMgPSBuZXcgU2V0PENsYXNzUHJvcGVydHlOYW1lPigpO1xuICBjb25zdCB1bmRlY2xhcmVkSW5wdXRGaWVsZHMgPSBuZXcgU2V0PENsYXNzUHJvcGVydHlOYW1lPigpO1xuICBjb25zdCByZXN0cmljdGVkSW5wdXRGaWVsZHMgPSBuZXcgU2V0PENsYXNzUHJvcGVydHlOYW1lPigpO1xuICBjb25zdCBzdHJpbmdMaXRlcmFsSW5wdXRGaWVsZHMgPSBuZXcgU2V0PENsYXNzUHJvcGVydHlOYW1lPigpO1xuICBsZXQgaXNEeW5hbWljID0gZmFsc2U7XG4gIGxldCBpbnB1dHMgPSBDbGFzc1Byb3BlcnR5TWFwcGluZy5lbXB0eSgpO1xuICBsZXQgb3V0cHV0cyA9IENsYXNzUHJvcGVydHlNYXBwaW5nLmVtcHR5KCk7XG5cbiAgY29uc3QgYWRkTWV0YWRhdGEgPSAobWV0YTogRGlyZWN0aXZlTWV0YSk6IHZvaWQgPT4ge1xuICAgIGlmIChtZXRhLmJhc2VDbGFzcyA9PT0gJ2R5bmFtaWMnKSB7XG4gICAgICBpc0R5bmFtaWMgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAobWV0YS5iYXNlQ2xhc3MgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGJhc2VNZXRhID0gcmVhZGVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKG1ldGEuYmFzZUNsYXNzKTtcbiAgICAgIGlmIChiYXNlTWV0YSAhPT0gbnVsbCkge1xuICAgICAgICBhZGRNZXRhZGF0YShiYXNlTWV0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBNaXNzaW5nIG1ldGFkYXRhIGZvciB0aGUgYmFzZSBjbGFzcyBtZWFucyBpdCdzIGVmZmVjdGl2ZWx5IGR5bmFtaWMuXG4gICAgICAgIGlzRHluYW1pYyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5wdXRzID0gQ2xhc3NQcm9wZXJ0eU1hcHBpbmcubWVyZ2UoaW5wdXRzLCBtZXRhLmlucHV0cyk7XG4gICAgb3V0cHV0cyA9IENsYXNzUHJvcGVydHlNYXBwaW5nLm1lcmdlKG91dHB1dHMsIG1ldGEub3V0cHV0cyk7XG5cbiAgICBmb3IgKGNvbnN0IGNvZXJjZWRJbnB1dEZpZWxkIG9mIG1ldGEuY29lcmNlZElucHV0RmllbGRzKSB7XG4gICAgICBjb2VyY2VkSW5wdXRGaWVsZHMuYWRkKGNvZXJjZWRJbnB1dEZpZWxkKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCB1bmRlY2xhcmVkSW5wdXRGaWVsZCBvZiBtZXRhLnVuZGVjbGFyZWRJbnB1dEZpZWxkcykge1xuICAgICAgdW5kZWNsYXJlZElucHV0RmllbGRzLmFkZCh1bmRlY2xhcmVkSW5wdXRGaWVsZCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgcmVzdHJpY3RlZElucHV0RmllbGQgb2YgbWV0YS5yZXN0cmljdGVkSW5wdXRGaWVsZHMpIHtcbiAgICAgIHJlc3RyaWN0ZWRJbnB1dEZpZWxkcy5hZGQocmVzdHJpY3RlZElucHV0RmllbGQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIG1ldGEuc3RyaW5nTGl0ZXJhbElucHV0RmllbGRzKSB7XG4gICAgICBzdHJpbmdMaXRlcmFsSW5wdXRGaWVsZHMuYWRkKGZpZWxkKTtcbiAgICB9XG4gIH07XG5cbiAgYWRkTWV0YWRhdGEodG9wTWV0YSk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi50b3BNZXRhLFxuICAgIGlucHV0cyxcbiAgICBvdXRwdXRzLFxuICAgIGNvZXJjZWRJbnB1dEZpZWxkcyxcbiAgICB1bmRlY2xhcmVkSW5wdXRGaWVsZHMsXG4gICAgcmVzdHJpY3RlZElucHV0RmllbGRzLFxuICAgIHN0cmluZ0xpdGVyYWxJbnB1dEZpZWxkcyxcbiAgICBiYXNlQ2xhc3M6IGlzRHluYW1pYyA/ICdkeW5hbWljJyA6IG51bGwsXG4gIH07XG59XG4iXX0=