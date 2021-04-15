/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../output/output_ast';
import { splitAtColon } from '../../util';
import * as t from '../r3_ast';
import { isI18nAttribute } from './i18n/util';
/**
 * Checks whether an object key contains potentially unsafe chars, thus the key should be wrapped in
 * quotes. Note: we do not wrap all keys into quotes, as it may have impact on minification and may
 * bot work in some cases when object keys are mangled by minifier.
 *
 * TODO(FW-1136): this is a temporary solution, we need to come up with a better way of working with
 * inputs that contain potentially unsafe chars.
 */
const UNSAFE_OBJECT_KEY_NAME_REGEXP = /[-.]/;
/** Name of the temporary to use during data binding */
export const TEMPORARY_NAME = '_t';
/** Name of the context parameter passed into a template function */
export const CONTEXT_NAME = 'ctx';
/** Name of the RenderFlag passed into a template function */
export const RENDER_FLAGS = 'rf';
/** The prefix reference variables */
export const REFERENCE_PREFIX = '_r';
/** The name of the implicit context reference */
export const IMPLICIT_REFERENCE = '$implicit';
/** Non bindable attribute name **/
export const NON_BINDABLE_ATTR = 'ngNonBindable';
/**
 * Creates an allocator for a temporary variable.
 *
 * A variable declaration is added to the statements the first time the allocator is invoked.
 */
export function temporaryAllocator(statements, name) {
    let temp = null;
    return () => {
        if (!temp) {
            statements.push(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
            temp = o.variable(name);
        }
        return temp;
    };
}
export function unsupported(feature) {
    if (this) {
        throw new Error(`Builder ${this.constructor.name} doesn't support ${feature} yet`);
    }
    throw new Error(`Feature ${feature} is not supported yet`);
}
export function invalid(arg) {
    throw new Error(`Invalid state: Visitor ${this.constructor.name} doesn't handle ${arg.constructor.name}`);
}
export function asLiteral(value) {
    if (Array.isArray(value)) {
        return o.literalArr(value.map(asLiteral));
    }
    return o.literal(value, o.INFERRED_TYPE);
}
export function conditionallyCreateMapObjectLiteral(keys, keepDeclared) {
    if (Object.getOwnPropertyNames(keys).length > 0) {
        return mapToExpression(keys, keepDeclared);
    }
    return null;
}
function mapToExpression(map, keepDeclared) {
    return o.literalMap(Object.getOwnPropertyNames(map).map(key => {
        // canonical syntax: `dirProp: publicProp`
        // if there is no `:`, use dirProp = elProp
        const value = map[key];
        let declaredName;
        let publicName;
        let minifiedName;
        if (Array.isArray(value)) {
            [publicName, declaredName] = value;
        }
        else {
            [declaredName, publicName] = splitAtColon(key, [key, value]);
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
export function trimTrailingNulls(parameters) {
    while (o.isNull(parameters[parameters.length - 1])) {
        parameters.pop();
    }
    return parameters;
}
export function getQueryPredicate(query, constantPool) {
    if (Array.isArray(query.predicate)) {
        let predicate = [];
        query.predicate.forEach((selector) => {
            // Each item in predicates array may contain strings with comma-separated refs
            // (for ex. 'ref, ref1, ..., refN'), thus we extract individual refs and store them
            // as separate array entities
            const selectors = selector.split(',').map(token => o.literal(token.trim()));
            predicate.push(...selectors);
        });
        return constantPool.getConstLiteral(o.literalArr(predicate), true);
    }
    else {
        return query.predicate;
    }
}
export class DefinitionMap {
    constructor() {
        this.values = [];
    }
    set(key, value) {
        if (value) {
            this.values.push({ key, value, quoted: false });
        }
    }
    toLiteralMap() {
        return o.literalMap(this.values);
    }
}
/**
 * Extract a map of properties to values for a given element or template node, which can be used
 * by the directive matching machinery.
 *
 * @param elOrTpl the element or template in question
 * @return an object set up for directive matching. For attributes on the element/template, this
 * object maps a property name to its (static) value. For any bindings, this map simply maps the
 * property name to an empty string.
 */
export function getAttrsForDirectiveMatching(elOrTpl) {
    const attributesMap = {};
    if (elOrTpl instanceof t.Template && elOrTpl.tagName !== 'ng-template') {
        elOrTpl.templateAttrs.forEach(a => attributesMap[a.name] = '');
    }
    else {
        elOrTpl.attributes.forEach(a => {
            if (!isI18nAttribute(a.name)) {
                attributesMap[a.name] = a.value;
            }
        });
        elOrTpl.inputs.forEach(i => {
            attributesMap[i.name] = '';
        });
        elOrTpl.outputs.forEach(o => {
            attributesMap[o.name] = '';
        });
    }
    return attributesMap;
}
/** Returns a call expression to a chained instruction, e.g. `property(params[0])(params[1])`. */
export function chainedInstruction(reference, calls, span) {
    let expression = o.importExpr(reference, null, span);
    if (calls.length > 0) {
        for (let i = 0; i < calls.length; i++) {
            expression = expression.callFn(calls[i], span);
        }
    }
    else {
        // Add a blank invocation, in case the `calls` array is empty.
        expression = expression.callFn([], span);
    }
    return expression;
}
/**
 * Gets the number of arguments expected to be passed to a generated instruction in the case of
 * interpolation instructions.
 * @param interpolation An interpolation ast
 */
export function getInterpolationArgsLength(interpolation) {
    const { expressions, strings } = interpolation;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEtBQUssQ0FBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTdDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDeEMsT0FBTyxLQUFLLENBQUMsTUFBTSxXQUFXLENBQUM7QUFHL0IsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUc1Qzs7Ozs7OztHQU9HO0FBQ0gsTUFBTSw2QkFBNkIsR0FBRyxNQUFNLENBQUM7QUFFN0MsdURBQXVEO0FBQ3ZELE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFFbkMsb0VBQW9FO0FBQ3BFLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUM7QUFFbEMsNkRBQTZEO0FBQzdELE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUM7QUFFakMscUNBQXFDO0FBQ3JDLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUVyQyxpREFBaUQ7QUFDakQsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsV0FBVyxDQUFDO0FBRTlDLG1DQUFtQztBQUNuQyxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxlQUFlLENBQUM7QUFFakQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxVQUF5QixFQUFFLElBQVk7SUFDeEUsSUFBSSxJQUFJLEdBQXVCLElBQUksQ0FBQztJQUNwQyxPQUFPLEdBQUcsRUFBRTtRQUNWLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUsU0FBUyxF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MkI7SUFDdEYsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBaUIsQ0FBQztJQUVyRSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3JDLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNoRDtLQUNGO1NBQU07UUFDTCw4REFBOEQ7UUFDOUQsVUFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzFDO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsYUFBNEI7SUFDckUsTUFBTSxFQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUMsR0FBRyxhQUFhLENBQUM7SUFDN0MsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDOUYsNEZBQTRGO1FBQzVGLDZGQUE2RjtRQUM3RixxQkFBcUI7UUFDckIsT0FBTyxDQUFDLENBQUM7S0FDVjtTQUFNO1FBQ0wsT0FBTyxXQUFXLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FDNUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICcuLi8uLi9jb25zdGFudF9wb29sJztcbmltcG9ydCB7SW50ZXJwb2xhdGlvbn0gZnJvbSAnLi4vLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uLy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtzcGxpdEF0Q29sb259IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuLi9yM19hc3QnO1xuXG5pbXBvcnQge1IzUXVlcnlNZXRhZGF0YX0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtpc0kxOG5BdHRyaWJ1dGV9IGZyb20gJy4vaTE4bi91dGlsJztcblxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGFuIG9iamVjdCBrZXkgY29udGFpbnMgcG90ZW50aWFsbHkgdW5zYWZlIGNoYXJzLCB0aHVzIHRoZSBrZXkgc2hvdWxkIGJlIHdyYXBwZWQgaW5cbiAqIHF1b3Rlcy4gTm90ZTogd2UgZG8gbm90IHdyYXAgYWxsIGtleXMgaW50byBxdW90ZXMsIGFzIGl0IG1heSBoYXZlIGltcGFjdCBvbiBtaW5pZmljYXRpb24gYW5kIG1heVxuICogYm90IHdvcmsgaW4gc29tZSBjYXNlcyB3aGVuIG9iamVjdCBrZXlzIGFyZSBtYW5nbGVkIGJ5IG1pbmlmaWVyLlxuICpcbiAqIFRPRE8oRlctMTEzNik6IHRoaXMgaXMgYSB0ZW1wb3Jhcnkgc29sdXRpb24sIHdlIG5lZWQgdG8gY29tZSB1cCB3aXRoIGEgYmV0dGVyIHdheSBvZiB3b3JraW5nIHdpdGhcbiAqIGlucHV0cyB0aGF0IGNvbnRhaW4gcG90ZW50aWFsbHkgdW5zYWZlIGNoYXJzLlxuICovXG5jb25zdCBVTlNBRkVfT0JKRUNUX0tFWV9OQU1FX1JFR0VYUCA9IC9bLS5dLztcblxuLyoqIE5hbWUgb2YgdGhlIHRlbXBvcmFyeSB0byB1c2UgZHVyaW5nIGRhdGEgYmluZGluZyAqL1xuZXhwb3J0IGNvbnN0IFRFTVBPUkFSWV9OQU1FID0gJ190JztcblxuLyoqIE5hbWUgb2YgdGhlIGNvbnRleHQgcGFyYW1ldGVyIHBhc3NlZCBpbnRvIGEgdGVtcGxhdGUgZnVuY3Rpb24gKi9cbmV4cG9ydCBjb25zdCBDT05URVhUX05BTUUgPSAnY3R4JztcblxuLyoqIE5hbWUgb2YgdGhlIFJlbmRlckZsYWcgcGFzc2VkIGludG8gYSB0ZW1wbGF0ZSBmdW5jdGlvbiAqL1xuZXhwb3J0IGNvbnN0IFJFTkRFUl9GTEFHUyA9ICdyZic7XG5cbi8qKiBUaGUgcHJlZml4IHJlZmVyZW5jZSB2YXJpYWJsZXMgKi9cbmV4cG9ydCBjb25zdCBSRUZFUkVOQ0VfUFJFRklYID0gJ19yJztcblxuLyoqIFRoZSBuYW1lIG9mIHRoZSBpbXBsaWNpdCBjb250ZXh0IHJlZmVyZW5jZSAqL1xuZXhwb3J0IGNvbnN0IElNUExJQ0lUX1JFRkVSRU5DRSA9ICckaW1wbGljaXQnO1xuXG4vKiogTm9uIGJpbmRhYmxlIGF0dHJpYnV0ZSBuYW1lICoqL1xuZXhwb3J0IGNvbnN0IE5PTl9CSU5EQUJMRV9BVFRSID0gJ25nTm9uQmluZGFibGUnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYWxsb2NhdG9yIGZvciBhIHRlbXBvcmFyeSB2YXJpYWJsZS5cbiAqXG4gKiBBIHZhcmlhYmxlIGRlY2xhcmF0aW9uIGlzIGFkZGVkIHRvIHRoZSBzdGF0ZW1lbnRzIHRoZSBmaXJzdCB0aW1lIHRoZSBhbGxvY2F0b3IgaXMgaW52b2tlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlbXBvcmFyeUFsbG9jYXRvcihzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdLCBuYW1lOiBzdHJpbmcpOiAoKSA9PiBvLlJlYWRWYXJFeHByIHtcbiAgbGV0IHRlbXA6IG8uUmVhZFZhckV4cHJ8bnVsbCA9IG51bGw7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgaWYgKCF0ZW1wKSB7XG4gICAgICBzdGF0ZW1lbnRzLnB1c2gobmV3IG8uRGVjbGFyZVZhclN0bXQoVEVNUE9SQVJZX05BTUUsIHVuZGVmaW5lZCwgby5EWU5BTUlDX1RZUEUpKTtcbiAgICAgIHRlbXAgPSBvLnZhcmlhYmxlKG5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGVtcDtcbiAgfTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdW5zdXBwb3J0ZWQodGhpczogdm9pZHxGdW5jdGlvbiwgZmVhdHVyZTogc3RyaW5nKTogbmV2ZXIge1xuICBpZiAodGhpcykge1xuICAgIHRocm93IG5ldyBFcnJvcihgQnVpbGRlciAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gZG9lc24ndCBzdXBwb3J0ICR7ZmVhdHVyZX0geWV0YCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBGZWF0dXJlICR7ZmVhdHVyZX0gaXMgbm90IHN1cHBvcnRlZCB5ZXRgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludmFsaWQ8VD4odGhpczogdC5WaXNpdG9yLCBhcmc6IG8uRXhwcmVzc2lvbnxvLlN0YXRlbWVudHx0Lk5vZGUpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBJbnZhbGlkIHN0YXRlOiBWaXNpdG9yICR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSBkb2Vzbid0IGhhbmRsZSAke2FyZy5jb25zdHJ1Y3Rvci5uYW1lfWApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNMaXRlcmFsKHZhbHVlOiBhbnkpOiBvLkV4cHJlc3Npb24ge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gby5saXRlcmFsQXJyKHZhbHVlLm1hcChhc0xpdGVyYWwpKTtcbiAgfVxuICByZXR1cm4gby5saXRlcmFsKHZhbHVlLCBvLklORkVSUkVEX1RZUEUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uZGl0aW9uYWxseUNyZWF0ZU1hcE9iamVjdExpdGVyYWwoXG4gICAga2V5czoge1trZXk6IHN0cmluZ106IHN0cmluZ3xzdHJpbmdbXX0sIGtlZXBEZWNsYXJlZD86IGJvb2xlYW4pOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhrZXlzKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIG1hcFRvRXhwcmVzc2lvbihrZXlzLCBrZWVwRGVjbGFyZWQpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBtYXBUb0V4cHJlc3Npb24oXG4gICAgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfHN0cmluZ1tdfSwga2VlcERlY2xhcmVkPzogYm9vbGVhbik6IG8uRXhwcmVzc2lvbiB7XG4gIHJldHVybiBvLmxpdGVyYWxNYXAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobWFwKS5tYXAoa2V5ID0+IHtcbiAgICAvLyBjYW5vbmljYWwgc3ludGF4OiBgZGlyUHJvcDogcHVibGljUHJvcGBcbiAgICAvLyBpZiB0aGVyZSBpcyBubyBgOmAsIHVzZSBkaXJQcm9wID0gZWxQcm9wXG4gICAgY29uc3QgdmFsdWUgPSBtYXBba2V5XTtcbiAgICBsZXQgZGVjbGFyZWROYW1lOiBzdHJpbmc7XG4gICAgbGV0IHB1YmxpY05hbWU6IHN0cmluZztcbiAgICBsZXQgbWluaWZpZWROYW1lOiBzdHJpbmc7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBbcHVibGljTmFtZSwgZGVjbGFyZWROYW1lXSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBbZGVjbGFyZWROYW1lLCBwdWJsaWNOYW1lXSA9IHNwbGl0QXRDb2xvbihrZXksIFtrZXksIHZhbHVlXSk7XG4gICAgfVxuICAgIG1pbmlmaWVkTmFtZSA9IGRlY2xhcmVkTmFtZTtcbiAgICByZXR1cm4ge1xuICAgICAga2V5OiBtaW5pZmllZE5hbWUsXG4gICAgICAvLyBwdXQgcXVvdGVzIGFyb3VuZCBrZXlzIHRoYXQgY29udGFpbiBwb3RlbnRpYWxseSB1bnNhZmUgY2hhcmFjdGVyc1xuICAgICAgcXVvdGVkOiBVTlNBRkVfT0JKRUNUX0tFWV9OQU1FX1JFR0VYUC50ZXN0KG1pbmlmaWVkTmFtZSksXG4gICAgICB2YWx1ZTogKGtlZXBEZWNsYXJlZCAmJiBwdWJsaWNOYW1lICE9PSBkZWNsYXJlZE5hbWUpID9cbiAgICAgICAgICBvLmxpdGVyYWxBcnIoW2FzTGl0ZXJhbChwdWJsaWNOYW1lKSwgYXNMaXRlcmFsKGRlY2xhcmVkTmFtZSldKSA6XG4gICAgICAgICAgYXNMaXRlcmFsKHB1YmxpY05hbWUpXG4gICAgfTtcbiAgfSkpO1xufVxuXG4vKipcbiAqICBSZW1vdmUgdHJhaWxpbmcgbnVsbCBub2RlcyBhcyB0aGV5IGFyZSBpbXBsaWVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpbVRyYWlsaW5nTnVsbHMocGFyYW1ldGVyczogby5FeHByZXNzaW9uW10pOiBvLkV4cHJlc3Npb25bXSB7XG4gIHdoaWxlIChvLmlzTnVsbChwYXJhbWV0ZXJzW3BhcmFtZXRlcnMubGVuZ3RoIC0gMV0pKSB7XG4gICAgcGFyYW1ldGVycy5wb3AoKTtcbiAgfVxuICByZXR1cm4gcGFyYW1ldGVycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFF1ZXJ5UHJlZGljYXRlKFxuICAgIHF1ZXJ5OiBSM1F1ZXJ5TWV0YWRhdGEsIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sKTogby5FeHByZXNzaW9uIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkocXVlcnkucHJlZGljYXRlKSkge1xuICAgIGxldCBwcmVkaWNhdGU6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgcXVlcnkucHJlZGljYXRlLmZvckVhY2goKHNlbGVjdG9yOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgIC8vIEVhY2ggaXRlbSBpbiBwcmVkaWNhdGVzIGFycmF5IG1heSBjb250YWluIHN0cmluZ3Mgd2l0aCBjb21tYS1zZXBhcmF0ZWQgcmVmc1xuICAgICAgLy8gKGZvciBleC4gJ3JlZiwgcmVmMSwgLi4uLCByZWZOJyksIHRodXMgd2UgZXh0cmFjdCBpbmRpdmlkdWFsIHJlZnMgYW5kIHN0b3JlIHRoZW1cbiAgICAgIC8vIGFzIHNlcGFyYXRlIGFycmF5IGVudGl0aWVzXG4gICAgICBjb25zdCBzZWxlY3RvcnMgPSBzZWxlY3Rvci5zcGxpdCgnLCcpLm1hcCh0b2tlbiA9PiBvLmxpdGVyYWwodG9rZW4udHJpbSgpKSk7XG4gICAgICBwcmVkaWNhdGUucHVzaCguLi5zZWxlY3RvcnMpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKG8ubGl0ZXJhbEFycihwcmVkaWNhdGUpLCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcXVlcnkucHJlZGljYXRlO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZpbml0aW9uTWFwIHtcbiAgdmFsdWVzOiB7a2V5OiBzdHJpbmcsIHF1b3RlZDogYm9vbGVhbiwgdmFsdWU6IG8uRXhwcmVzc2lvbn1bXSA9IFtdO1xuXG4gIHNldChrZXk6IHN0cmluZywgdmFsdWU6IG8uRXhwcmVzc2lvbnxudWxsKTogdm9pZCB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLnZhbHVlcy5wdXNoKHtrZXksIHZhbHVlLCBxdW90ZWQ6IGZhbHNlfSk7XG4gICAgfVxuICB9XG5cbiAgdG9MaXRlcmFsTWFwKCk6IG8uTGl0ZXJhbE1hcEV4cHIge1xuICAgIHJldHVybiBvLmxpdGVyYWxNYXAodGhpcy52YWx1ZXMpO1xuICB9XG59XG5cbi8qKlxuICogRXh0cmFjdCBhIG1hcCBvZiBwcm9wZXJ0aWVzIHRvIHZhbHVlcyBmb3IgYSBnaXZlbiBlbGVtZW50IG9yIHRlbXBsYXRlIG5vZGUsIHdoaWNoIGNhbiBiZSB1c2VkXG4gKiBieSB0aGUgZGlyZWN0aXZlIG1hdGNoaW5nIG1hY2hpbmVyeS5cbiAqXG4gKiBAcGFyYW0gZWxPclRwbCB0aGUgZWxlbWVudCBvciB0ZW1wbGF0ZSBpbiBxdWVzdGlvblxuICogQHJldHVybiBhbiBvYmplY3Qgc2V0IHVwIGZvciBkaXJlY3RpdmUgbWF0Y2hpbmcuIEZvciBhdHRyaWJ1dGVzIG9uIHRoZSBlbGVtZW50L3RlbXBsYXRlLCB0aGlzXG4gKiBvYmplY3QgbWFwcyBhIHByb3BlcnR5IG5hbWUgdG8gaXRzIChzdGF0aWMpIHZhbHVlLiBGb3IgYW55IGJpbmRpbmdzLCB0aGlzIG1hcCBzaW1wbHkgbWFwcyB0aGVcbiAqIHByb3BlcnR5IG5hbWUgdG8gYW4gZW1wdHkgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXR0cnNGb3JEaXJlY3RpdmVNYXRjaGluZyhlbE9yVHBsOiB0LkVsZW1lbnR8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LlRlbXBsYXRlKToge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9IHtcbiAgY29uc3QgYXR0cmlidXRlc01hcDoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG5cblxuICBpZiAoZWxPclRwbCBpbnN0YW5jZW9mIHQuVGVtcGxhdGUgJiYgZWxPclRwbC50YWdOYW1lICE9PSAnbmctdGVtcGxhdGUnKSB7XG4gICAgZWxPclRwbC50ZW1wbGF0ZUF0dHJzLmZvckVhY2goYSA9PiBhdHRyaWJ1dGVzTWFwW2EubmFtZV0gPSAnJyk7XG4gIH0gZWxzZSB7XG4gICAgZWxPclRwbC5hdHRyaWJ1dGVzLmZvckVhY2goYSA9PiB7XG4gICAgICBpZiAoIWlzSTE4bkF0dHJpYnV0ZShhLm5hbWUpKSB7XG4gICAgICAgIGF0dHJpYnV0ZXNNYXBbYS5uYW1lXSA9IGEudmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBlbE9yVHBsLmlucHV0cy5mb3JFYWNoKGkgPT4ge1xuICAgICAgYXR0cmlidXRlc01hcFtpLm5hbWVdID0gJyc7XG4gICAgfSk7XG4gICAgZWxPclRwbC5vdXRwdXRzLmZvckVhY2gobyA9PiB7XG4gICAgICBhdHRyaWJ1dGVzTWFwW28ubmFtZV0gPSAnJztcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBhdHRyaWJ1dGVzTWFwO1xufVxuXG4vKiogUmV0dXJucyBhIGNhbGwgZXhwcmVzc2lvbiB0byBhIGNoYWluZWQgaW5zdHJ1Y3Rpb24sIGUuZy4gYHByb3BlcnR5KHBhcmFtc1swXSkocGFyYW1zWzFdKWAuICovXG5leHBvcnQgZnVuY3Rpb24gY2hhaW5lZEluc3RydWN0aW9uKFxuICAgIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZSwgY2FsbHM6IG8uRXhwcmVzc2lvbltdW10sIHNwYW4/OiBQYXJzZVNvdXJjZVNwYW58bnVsbCkge1xuICBsZXQgZXhwcmVzc2lvbiA9IG8uaW1wb3J0RXhwcihyZWZlcmVuY2UsIG51bGwsIHNwYW4pIGFzIG8uRXhwcmVzc2lvbjtcblxuICBpZiAoY2FsbHMubGVuZ3RoID4gMCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2FsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGV4cHJlc3Npb24gPSBleHByZXNzaW9uLmNhbGxGbihjYWxsc1tpXSwgc3Bhbik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEFkZCBhIGJsYW5rIGludm9jYXRpb24sIGluIGNhc2UgdGhlIGBjYWxsc2AgYXJyYXkgaXMgZW1wdHkuXG4gICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24uY2FsbEZuKFtdLCBzcGFuKTtcbiAgfVxuXG4gIHJldHVybiBleHByZXNzaW9uO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIG51bWJlciBvZiBhcmd1bWVudHMgZXhwZWN0ZWQgdG8gYmUgcGFzc2VkIHRvIGEgZ2VuZXJhdGVkIGluc3RydWN0aW9uIGluIHRoZSBjYXNlIG9mXG4gKiBpbnRlcnBvbGF0aW9uIGluc3RydWN0aW9ucy5cbiAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uIEFuIGludGVycG9sYXRpb24gYXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnRlcnBvbGF0aW9uQXJnc0xlbmd0aChpbnRlcnBvbGF0aW9uOiBJbnRlcnBvbGF0aW9uKSB7XG4gIGNvbnN0IHtleHByZXNzaW9ucywgc3RyaW5nc30gPSBpbnRlcnBvbGF0aW9uO1xuICBpZiAoZXhwcmVzc2lvbnMubGVuZ3RoID09PSAxICYmIHN0cmluZ3MubGVuZ3RoID09PSAyICYmIHN0cmluZ3NbMF0gPT09ICcnICYmIHN0cmluZ3NbMV0gPT09ICcnKSB7XG4gICAgLy8gSWYgdGhlIGludGVycG9sYXRpb24gaGFzIG9uZSBpbnRlcnBvbGF0ZWQgdmFsdWUsIGJ1dCB0aGUgcHJlZml4IGFuZCBzdWZmaXggYXJlIGJvdGggZW1wdHlcbiAgICAvLyBzdHJpbmdzLCB3ZSBvbmx5IHBhc3Mgb25lIGFyZ3VtZW50LCB0byBhIHNwZWNpYWwgaW5zdHJ1Y3Rpb24gbGlrZSBgcHJvcGVydHlJbnRlcnBvbGF0ZWAgb3JcbiAgICAvLyBgdGV4dEludGVycG9sYXRlYC5cbiAgICByZXR1cm4gMTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZXhwcmVzc2lvbnMubGVuZ3RoICsgc3RyaW5ncy5sZW5ndGg7XG4gIH1cbn1cbiJdfQ==