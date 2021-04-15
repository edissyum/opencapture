(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/typecheck/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/src/comments"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findTypeCheckBlock = exports.translateDiagnostic = exports.shouldReportDiagnostic = exports.addTemplateId = exports.addParseSpanInfo = exports.wrapForTypeChecker = exports.wrapForDiagnostics = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/diagnostics");
    var comments_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/comments");
    /**
     * Wraps the node in parenthesis such that inserted span comments become attached to the proper
     * node. This is an alias for `ts.createParen` with the benefit that it signifies that the
     * inserted parenthesis are for diagnostic purposes, not for correctness of the rendered TCB code.
     *
     * Note that it is important that nodes and its attached comment are not wrapped into parenthesis
     * by default, as it prevents correct translation of e.g. diagnostics produced for incorrect method
     * arguments. Such diagnostics would then be produced for the parenthesised node whereas the
     * positional comment would be located within that node, resulting in a mismatch.
     */
    function wrapForDiagnostics(expr) {
        return ts.createParen(expr);
    }
    exports.wrapForDiagnostics = wrapForDiagnostics;
    /**
     * Wraps the node in parenthesis such that inserted span comments become attached to the proper
     * node. This is an alias for `ts.createParen` with the benefit that it signifies that the
     * inserted parenthesis are for use by the type checker, not for correctness of the rendered TCB
     * code.
     */
    function wrapForTypeChecker(expr) {
        return ts.createParen(expr);
    }
    exports.wrapForTypeChecker = wrapForTypeChecker;
    /**
     * Adds a synthetic comment to the expression that represents the parse span of the provided node.
     * This comment can later be retrieved as trivia of a node to recover original source locations.
     */
    function addParseSpanInfo(node, span) {
        var commentText;
        if (span instanceof compiler_1.AbsoluteSourceSpan) {
            commentText = span.start + "," + span.end;
        }
        else {
            commentText = span.start.offset + "," + span.end.offset;
        }
        ts.addSyntheticTrailingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, commentText, /* hasTrailingNewLine */ false);
    }
    exports.addParseSpanInfo = addParseSpanInfo;
    /**
     * Adds a synthetic comment to the function declaration that contains the template id
     * of the class declaration.
     */
    function addTemplateId(tcb, id) {
        ts.addSyntheticLeadingComment(tcb, ts.SyntaxKind.MultiLineCommentTrivia, id, true);
    }
    exports.addTemplateId = addTemplateId;
    /**
     * Determines if the diagnostic should be reported. Some diagnostics are produced because of the
     * way TCBs are generated; those diagnostics should not be reported as type check errors of the
     * template.
     */
    function shouldReportDiagnostic(diagnostic) {
        var code = diagnostic.code;
        if (code === 6133 /* $var is declared but its value is never read. */) {
            return false;
        }
        else if (code === 6199 /* All variables are unused. */) {
            return false;
        }
        else if (code === 2695 /* Left side of comma operator is unused and has no side effects. */) {
            return false;
        }
        else if (code === 7006 /* Parameter '$event' implicitly has an 'any' type. */) {
            return false;
        }
        return true;
    }
    exports.shouldReportDiagnostic = shouldReportDiagnostic;
    /**
     * Attempts to translate a TypeScript diagnostic produced during template type-checking to their
     * location of origin, based on the comments that are emitted in the TCB code.
     *
     * If the diagnostic could not be translated, `null` is returned to indicate that the diagnostic
     * should not be reported at all. This prevents diagnostics from non-TCB code in a user's source
     * file from being reported as type-check errors.
     */
    function translateDiagnostic(diagnostic, resolver) {
        if (diagnostic.file === undefined || diagnostic.start === undefined) {
            return null;
        }
        // Locate the node that the diagnostic is reported on and determine its location in the source.
        var node = typescript_1.getTokenAtPosition(diagnostic.file, diagnostic.start);
        var sourceLocation = findSourceLocation(node, diagnostic.file);
        if (sourceLocation === null) {
            return null;
        }
        // Now use the external resolver to obtain the full `ParseSourceFile` of the template.
        var span = resolver.toParseSourceSpan(sourceLocation.id, sourceLocation.span);
        if (span === null) {
            return null;
        }
        var mapping = resolver.getSourceMapping(sourceLocation.id);
        return diagnostics_1.makeTemplateDiagnostic(sourceLocation.id, mapping, span, diagnostic.category, diagnostic.code, diagnostic.messageText);
    }
    exports.translateDiagnostic = translateDiagnostic;
    function findTypeCheckBlock(file, id) {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__values(file.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var stmt = _c.value;
                if (ts.isFunctionDeclaration(stmt) && getTemplateId(stmt, file) === id) {
                    return stmt;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    exports.findTypeCheckBlock = findTypeCheckBlock;
    /**
     * Traverses up the AST starting from the given node to extract the source location from comments
     * that have been emitted into the TCB. If the node does not exist within a TCB, or if an ignore
     * marker comment is found up the tree, this function returns null.
     */
    function findSourceLocation(node, sourceFile) {
        // Search for comments until the TCB's function declaration is encountered.
        while (node !== undefined && !ts.isFunctionDeclaration(node)) {
            if (comments_1.hasIgnoreMarker(node, sourceFile)) {
                // There's an ignore marker on this node, so the diagnostic should not be reported.
                return null;
            }
            var span = comments_1.readSpanComment(node, sourceFile);
            if (span !== null) {
                // Once the positional information has been extracted, search further up the TCB to extract
                // the unique id that is attached with the TCB's function declaration.
                var id = getTemplateId(node, sourceFile);
                if (id === null) {
                    return null;
                }
                return { id: id, span: span };
            }
            node = node.parent;
        }
        return null;
    }
    function getTemplateId(node, sourceFile) {
        // Walk up to the function declaration of the TCB, the file information is attached there.
        while (!ts.isFunctionDeclaration(node)) {
            if (comments_1.hasIgnoreMarker(node, sourceFile)) {
                // There's an ignore marker on this node, so the diagnostic should not be reported.
                return null;
            }
            node = node.parent;
            // Bail once we have reached the root.
            if (node === undefined) {
                return null;
            }
        }
        var start = node.getFullStart();
        return ts.forEachLeadingCommentRange(sourceFile.text, start, function (pos, end, kind) {
            if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
                return null;
            }
            var commentText = sourceFile.text.substring(pos + 2, end - 2);
            return commentText;
        }) || null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9zcmMvZGlhZ25vc3RpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDhDQUFzRTtJQUN0RSwrQkFBaUM7SUFFakMsa0ZBQTZEO0lBRTdELHFGQUEwRTtJQUUxRSxtRkFBNEQ7SUF3QjVEOzs7Ozs7Ozs7T0FTRztJQUNILFNBQWdCLGtCQUFrQixDQUFDLElBQW1CO1FBQ3BELE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRkQsZ0RBRUM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQWdCLGtCQUFrQixDQUFDLElBQW1CO1FBQ3BELE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRkQsZ0RBRUM7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFhLEVBQUUsSUFBd0M7UUFDdEYsSUFBSSxXQUFtQixDQUFDO1FBQ3hCLElBQUksSUFBSSxZQUFZLDZCQUFrQixFQUFFO1lBQ3RDLFdBQVcsR0FBTSxJQUFJLENBQUMsS0FBSyxTQUFJLElBQUksQ0FBQyxHQUFLLENBQUM7U0FDM0M7YUFBTTtZQUNMLFdBQVcsR0FBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQVEsQ0FBQztTQUN6RDtRQUNELEVBQUUsQ0FBQywyQkFBMkIsQ0FDMUIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFURCw0Q0FTQztJQUVEOzs7T0FHRztJQUNILFNB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VyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sV0FBVyxDQUFDO1FBQ3JCLENBQUMsQ0FBZSxJQUFJLElBQUksQ0FBQztJQUMzQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0Fic29sdXRlU291cmNlU3BhbiwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtnZXRUb2tlbkF0UG9zaXRpb259IGZyb20gJy4uLy4uL3V0aWwvc3JjL3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtUZW1wbGF0ZUlkLCBUZW1wbGF0ZVNvdXJjZU1hcHBpbmd9IGZyb20gJy4uL2FwaSc7XG5pbXBvcnQge21ha2VUZW1wbGF0ZURpYWdub3N0aWMsIFRlbXBsYXRlRGlhZ25vc3RpY30gZnJvbSAnLi4vZGlhZ25vc3RpY3MnO1xuXG5pbXBvcnQge2hhc0lnbm9yZU1hcmtlciwgcmVhZFNwYW5Db21tZW50fSBmcm9tICcuL2NvbW1lbnRzJztcblxuXG4vKipcbiAqIEFkYXB0ZXIgaW50ZXJmYWNlIHdoaWNoIGFsbG93cyB0aGUgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBkaWFnbm9zdGljcyBjb2RlIHRvIGludGVycHJldCBvZmZzZXRzXG4gKiBpbiBhIFRDQiBhbmQgbWFwIHRoZW0gYmFjayB0byBvcmlnaW5hbCBsb2NhdGlvbnMgaW4gdGhlIHRlbXBsYXRlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlU291cmNlUmVzb2x2ZXIge1xuICBnZXRUZW1wbGF0ZUlkKG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBUZW1wbGF0ZUlkO1xuXG4gIC8qKlxuICAgKiBGb3IgdGhlIGdpdmVuIHRlbXBsYXRlIGlkLCByZXRyaWV2ZSB0aGUgb3JpZ2luYWwgc291cmNlIG1hcHBpbmcgd2hpY2ggZGVzY3JpYmVzIGhvdyB0aGUgb2Zmc2V0c1xuICAgKiBpbiB0aGUgdGVtcGxhdGUgc2hvdWxkIGJlIGludGVycHJldGVkLlxuICAgKi9cbiAgZ2V0U291cmNlTWFwcGluZyhpZDogVGVtcGxhdGVJZCk6IFRlbXBsYXRlU291cmNlTWFwcGluZztcblxuICAvKipcbiAgICogQ29udmVydCBhbiBhYnNvbHV0ZSBzb3VyY2Ugc3BhbiBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIHRlbXBsYXRlIGlkIGludG8gYSBmdWxsXG4gICAqIGBQYXJzZVNvdXJjZVNwYW5gLiBUaGUgcmV0dXJuZWQgcGFyc2Ugc3BhbiBoYXMgbGluZSBhbmQgY29sdW1uIG51bWJlcnMgaW4gYWRkaXRpb24gdG8gb25seVxuICAgKiBhYnNvbHV0ZSBvZmZzZXRzIGFuZCBnaXZlcyBhY2Nlc3MgdG8gdGhlIG9yaWdpbmFsIHRlbXBsYXRlIHNvdXJjZS5cbiAgICovXG4gIHRvUGFyc2VTb3VyY2VTcGFuKGlkOiBUZW1wbGF0ZUlkLCBzcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4pOiBQYXJzZVNvdXJjZVNwYW58bnVsbDtcbn1cblxuLyoqXG4gKiBXcmFwcyB0aGUgbm9kZSBpbiBwYXJlbnRoZXNpcyBzdWNoIHRoYXQgaW5zZXJ0ZWQgc3BhbiBjb21tZW50cyBiZWNvbWUgYXR0YWNoZWQgdG8gdGhlIHByb3BlclxuICogbm9kZS4gVGhpcyBpcyBhbiBhbGlhcyBmb3IgYHRzLmNyZWF0ZVBhcmVuYCB3aXRoIHRoZSBiZW5lZml0IHRoYXQgaXQgc2lnbmlmaWVzIHRoYXQgdGhlXG4gKiBpbnNlcnRlZCBwYXJlbnRoZXNpcyBhcmUgZm9yIGRpYWdub3N0aWMgcHVycG9zZXMsIG5vdCBmb3IgY29ycmVjdG5lc3Mgb2YgdGhlIHJlbmRlcmVkIFRDQiBjb2RlLlxuICpcbiAqIE5vdGUgdGhhdCBpdCBpcyBpbXBvcnRhbnQgdGhhdCBub2RlcyBhbmQgaXRzIGF0dGFjaGVkIGNvbW1lbnQgYXJlIG5vdCB3cmFwcGVkIGludG8gcGFyZW50aGVzaXNcbiAqIGJ5IGRlZmF1bHQsIGFzIGl0IHByZXZlbnRzIGNvcnJlY3QgdHJhbnNsYXRpb24gb2YgZS5nLiBkaWFnbm9zdGljcyBwcm9kdWNlZCBmb3IgaW5jb3JyZWN0IG1ldGhvZFxuICogYXJndW1lbnRzLiBTdWNoIGRpYWdub3N0aWNzIHdvdWxkIHRoZW4gYmUgcHJvZHVjZWQgZm9yIHRoZSBwYXJlbnRoZXNpc2VkIG5vZGUgd2hlcmVhcyB0aGVcbiAqIHBvc2l0aW9uYWwgY29tbWVudCB3b3VsZCBiZSBsb2NhdGVkIHdpdGhpbiB0aGF0IG5vZGUsIHJlc3VsdGluZyBpbiBhIG1pc21hdGNoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd3JhcEZvckRpYWdub3N0aWNzKGV4cHI6IHRzLkV4cHJlc3Npb24pOiB0cy5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIHRzLmNyZWF0ZVBhcmVuKGV4cHIpO1xufVxuXG4vKipcbiAqIFdyYXBzIHRoZSBub2RlIGluIHBhcmVudGhlc2lzIHN1Y2ggdGhhdCBpbnNlcnRlZCBzcGFuIGNvbW1lbnRzIGJlY29tZSBhdHRhY2hlZCB0byB0aGUgcHJvcGVyXG4gKiBub2RlLiBUaGlzIGlzIGFuIGFsaWFzIGZvciBgdHMuY3JlYXRlUGFyZW5gIHdpdGggdGhlIGJlbmVmaXQgdGhhdCBpdCBzaWduaWZpZXMgdGhhdCB0aGVcbiAqIGluc2VydGVkIHBhcmVudGhlc2lzIGFyZSBmb3IgdXNlIGJ5IHRoZSB0eXBlIGNoZWNrZXIsIG5vdCBmb3IgY29ycmVjdG5lc3Mgb2YgdGhlIHJlbmRlcmVkIFRDQlxuICogY29kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXBGb3JUeXBlQ2hlY2tlcihleHByOiB0cy5FeHByZXNzaW9uKTogdHMuRXhwcmVzc2lvbiB7XG4gIHJldHVybiB0cy5jcmVhdGVQYXJlbihleHByKTtcbn1cblxuLyoqXG4gKiBBZGRzIGEgc3ludGhldGljIGNvbW1lbnQgdG8gdGhlIGV4cHJlc3Npb24gdGhhdCByZXByZXNlbnRzIHRoZSBwYXJzZSBzcGFuIG9mIHRoZSBwcm92aWRlZCBub2RlLlxuICogVGhpcyBjb21tZW50IGNhbiBsYXRlciBiZSByZXRyaWV2ZWQgYXMgdHJpdmlhIG9mIGEgbm9kZSB0byByZWNvdmVyIG9yaWdpbmFsIHNvdXJjZSBsb2NhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRQYXJzZVNwYW5JbmZvKG5vZGU6IHRzLk5vZGUsIHNwYW46IEFic29sdXRlU291cmNlU3BhbnxQYXJzZVNvdXJjZVNwYW4pOiB2b2lkIHtcbiAgbGV0IGNvbW1lbnRUZXh0OiBzdHJpbmc7XG4gIGlmIChzcGFuIGluc3RhbmNlb2YgQWJzb2x1dGVTb3VyY2VTcGFuKSB7XG4gICAgY29tbWVudFRleHQgPSBgJHtzcGFuLnN0YXJ0fSwke3NwYW4uZW5kfWA7XG4gIH0gZWxzZSB7XG4gICAgY29tbWVudFRleHQgPSBgJHtzcGFuLnN0YXJ0Lm9mZnNldH0sJHtzcGFuLmVuZC5vZmZzZXR9YDtcbiAgfVxuICB0cy5hZGRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnQoXG4gICAgICBub2RlLCB0cy5TeW50YXhLaW5kLk11bHRpTGluZUNvbW1lbnRUcml2aWEsIGNvbW1lbnRUZXh0LCAvKiBoYXNUcmFpbGluZ05ld0xpbmUgKi8gZmFsc2UpO1xufVxuXG4vKipcbiAqIEFkZHMgYSBzeW50aGV0aWMgY29tbWVudCB0byB0aGUgZnVuY3Rpb24gZGVjbGFyYXRpb24gdGhhdCBjb250YWlucyB0aGUgdGVtcGxhdGUgaWRcbiAqIG9mIHRoZSBjbGFzcyBkZWNsYXJhdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFRlbXBsYXRlSWQodGNiOiB0cy5GdW5jdGlvbkRlY2xhcmF0aW9uLCBpZDogVGVtcGxhdGVJZCk6IHZvaWQge1xuICB0cy5hZGRTeW50aGV0aWNMZWFkaW5nQ29tbWVudCh0Y2IsIHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSwgaWQsIHRydWUpO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIGRpYWdub3N0aWMgc2hvdWxkIGJlIHJlcG9ydGVkLiBTb21lIGRpYWdub3N0aWNzIGFyZSBwcm9kdWNlZCBiZWNhdXNlIG9mIHRoZVxuICogd2F5IFRDQnMgYXJlIGdlbmVyYXRlZDsgdGhvc2UgZGlhZ25vc3RpY3Mgc2hvdWxkIG5vdCBiZSByZXBvcnRlZCBhcyB0eXBlIGNoZWNrIGVycm9ycyBvZiB0aGVcbiAqIHRlbXBsYXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkUmVwb3J0RGlhZ25vc3RpYyhkaWFnbm9zdGljOiB0cy5EaWFnbm9zdGljKTogYm9vbGVhbiB7XG4gIGNvbnN0IHtjb2RlfSA9IGRpYWdub3N0aWM7XG4gIGlmIChjb2RlID09PSA2MTMzIC8qICR2YXIgaXMgZGVjbGFyZWQgYnV0IGl0cyB2YWx1ZSBpcyBuZXZlciByZWFkLiAqLykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIGlmIChjb2RlID09PSA2MTk5IC8qIEFsbCB2YXJpYWJsZXMgYXJlIHVudXNlZC4gKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSBpZiAoY29kZSA9PT0gMjY5NSAvKiBMZWZ0IHNpZGUgb2YgY29tbWEgb3BlcmF0b3IgaXMgdW51c2VkIGFuZCBoYXMgbm8gc2lkZSBlZmZlY3RzLiAqLykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIGlmIChjb2RlID09PSA3MDA2IC8qIFBhcmFtZXRlciAnJGV2ZW50JyBpbXBsaWNpdGx5IGhhcyBhbiAnYW55JyB0eXBlLiAqLykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBBdHRlbXB0cyB0byB0cmFuc2xhdGUgYSBUeXBlU2NyaXB0IGRpYWdub3N0aWMgcHJvZHVjZWQgZHVyaW5nIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgdG8gdGhlaXJcbiAqIGxvY2F0aW9uIG9mIG9yaWdpbiwgYmFzZWQgb24gdGhlIGNvbW1lbnRzIHRoYXQgYXJlIGVtaXR0ZWQgaW4gdGhlIFRDQiBjb2RlLlxuICpcbiAqIElmIHRoZSBkaWFnbm9zdGljIGNvdWxkIG5vdCBiZSB0cmFuc2xhdGVkLCBgbnVsbGAgaXMgcmV0dXJuZWQgdG8gaW5kaWNhdGUgdGhhdCB0aGUgZGlhZ25vc3RpY1xuICogc2hvdWxkIG5vdCBiZSByZXBvcnRlZCBhdCBhbGwuIFRoaXMgcHJldmVudHMgZGlhZ25vc3RpY3MgZnJvbSBub24tVENCIGNvZGUgaW4gYSB1c2VyJ3Mgc291cmNlXG4gKiBmaWxlIGZyb20gYmVpbmcgcmVwb3J0ZWQgYXMgdHlwZS1jaGVjayBlcnJvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGVEaWFnbm9zdGljKFxuICAgIGRpYWdub3N0aWM6IHRzLkRpYWdub3N0aWMsIHJlc29sdmVyOiBUZW1wbGF0ZVNvdXJjZVJlc29sdmVyKTogVGVtcGxhdGVEaWFnbm9zdGljfG51bGwge1xuICBpZiAoZGlhZ25vc3RpYy5maWxlID09PSB1bmRlZmluZWQgfHwgZGlhZ25vc3RpYy5zdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBMb2NhdGUgdGhlIG5vZGUgdGhhdCB0aGUgZGlhZ25vc3RpYyBpcyByZXBvcnRlZCBvbiBhbmQgZGV0ZXJtaW5lIGl0cyBsb2NhdGlvbiBpbiB0aGUgc291cmNlLlxuICBjb25zdCBub2RlID0gZ2V0VG9rZW5BdFBvc2l0aW9uKGRpYWdub3N0aWMuZmlsZSwgZGlhZ25vc3RpYy5zdGFydCk7XG4gIGNvbnN0IHNvdXJjZUxvY2F0aW9uID0gZmluZFNvdXJjZUxvY2F0aW9uKG5vZGUsIGRpYWdub3N0aWMuZmlsZSk7XG4gIGlmIChzb3VyY2VMb2NhdGlvbiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gTm93IHVzZSB0aGUgZXh0ZXJuYWwgcmVzb2x2ZXIgdG8gb2J0YWluIHRoZSBmdWxsIGBQYXJzZVNvdXJjZUZpbGVgIG9mIHRoZSB0ZW1wbGF0ZS5cbiAgY29uc3Qgc3BhbiA9IHJlc29sdmVyLnRvUGFyc2VTb3VyY2VTcGFuKHNvdXJjZUxvY2F0aW9uLmlkLCBzb3VyY2VMb2NhdGlvbi5zcGFuKTtcbiAgaWYgKHNwYW4gPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IG1hcHBpbmcgPSByZXNvbHZlci5nZXRTb3VyY2VNYXBwaW5nKHNvdXJjZUxvY2F0aW9uLmlkKTtcbiAgcmV0dXJuIG1ha2VUZW1wbGF0ZURpYWdub3N0aWMoXG4gICAgICBzb3VyY2VMb2NhdGlvbi5pZCwgbWFwcGluZywgc3BhbiwgZGlhZ25vc3RpYy5jYXRlZ29yeSwgZGlhZ25vc3RpYy5jb2RlLFxuICAgICAgZGlhZ25vc3RpYy5tZXNzYWdlVGV4dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kVHlwZUNoZWNrQmxvY2soZmlsZTogdHMuU291cmNlRmlsZSwgaWQ6IFRlbXBsYXRlSWQpOiB0cy5Ob2RlfG51bGwge1xuICBmb3IgKGNvbnN0IHN0bXQgb2YgZmlsZS5zdGF0ZW1lbnRzKSB7XG4gICAgaWYgKHRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbihzdG10KSAmJiBnZXRUZW1wbGF0ZUlkKHN0bXQsIGZpbGUpID09PSBpZCkge1xuICAgICAgcmV0dXJuIHN0bXQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5pbnRlcmZhY2UgU291cmNlTG9jYXRpb24ge1xuICBpZDogVGVtcGxhdGVJZDtcbiAgc3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuO1xufVxuXG4vKipcbiAqIFRyYXZlcnNlcyB1cCB0aGUgQVNUIHN0YXJ0aW5nIGZyb20gdGhlIGdpdmVuIG5vZGUgdG8gZXh0cmFjdCB0aGUgc291cmNlIGxvY2F0aW9uIGZyb20gY29tbWVudHNcbiAqIHRoYXQgaGF2ZSBiZWVuIGVtaXR0ZWQgaW50byB0aGUgVENCLiBJZiB0aGUgbm9kZSBkb2VzIG5vdCBleGlzdCB3aXRoaW4gYSBUQ0IsIG9yIGlmIGFuIGlnbm9yZVxuICogbWFya2VyIGNvbW1lbnQgaXMgZm91bmQgdXAgdGhlIHRyZWUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyBudWxsLlxuICovXG5mdW5jdGlvbiBmaW5kU291cmNlTG9jYXRpb24obm9kZTogdHMuTm9kZSwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IFNvdXJjZUxvY2F0aW9ufG51bGwge1xuICAvLyBTZWFyY2ggZm9yIGNvbW1lbnRzIHVudGlsIHRoZSBUQ0IncyBmdW5jdGlvbiBkZWNsYXJhdGlvbiBpcyBlbmNvdW50ZXJlZC5cbiAgd2hpbGUgKG5vZGUgIT09IHVuZGVmaW5lZCAmJiAhdHMuaXNGdW5jdGlvbkRlY2xhcmF0aW9uKG5vZGUpKSB7XG4gICAgaWYgKGhhc0lnbm9yZU1hcmtlcihub2RlLCBzb3VyY2VGaWxlKSkge1xuICAgICAgLy8gVGhlcmUncyBhbiBpZ25vcmUgbWFya2VyIG9uIHRoaXMgbm9kZSwgc28gdGhlIGRpYWdub3N0aWMgc2hvdWxkIG5vdCBiZSByZXBvcnRlZC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHNwYW4gPSByZWFkU3BhbkNvbW1lbnQobm9kZSwgc291cmNlRmlsZSk7XG4gICAgaWYgKHNwYW4gIT09IG51bGwpIHtcbiAgICAgIC8vIE9uY2UgdGhlIHBvc2l0aW9uYWwgaW5mb3JtYXRpb24gaGFzIGJlZW4gZXh0cmFjdGVkLCBzZWFyY2ggZnVydGhlciB1cCB0aGUgVENCIHRvIGV4dHJhY3RcbiAgICAgIC8vIHRoZSB1bmlxdWUgaWQgdGhhdCBpcyBhdHRhY2hlZCB3aXRoIHRoZSBUQ0IncyBmdW5jdGlvbiBkZWNsYXJhdGlvbi5cbiAgICAgIGNvbnN0IGlkID0gZ2V0VGVtcGxhdGVJZChub2RlLCBzb3VyY2VGaWxlKTtcbiAgICAgIGlmIChpZCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7aWQsIHNwYW59O1xuICAgIH1cblxuICAgIG5vZGUgPSBub2RlLnBhcmVudDtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBnZXRUZW1wbGF0ZUlkKG5vZGU6IHRzLk5vZGUsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBUZW1wbGF0ZUlkfG51bGwge1xuICAvLyBXYWxrIHVwIHRvIHRoZSBmdW5jdGlvbiBkZWNsYXJhdGlvbiBvZiB0aGUgVENCLCB0aGUgZmlsZSBpbmZvcm1hdGlvbiBpcyBhdHRhY2hlZCB0aGVyZS5cbiAgd2hpbGUgKCF0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICBpZiAoaGFzSWdub3JlTWFya2VyKG5vZGUsIHNvdXJjZUZpbGUpKSB7XG4gICAgICAvLyBUaGVyZSdzIGFuIGlnbm9yZSBtYXJrZXIgb24gdGhpcyBub2RlLCBzbyB0aGUgZGlhZ25vc3RpYyBzaG91bGQgbm90IGJlIHJlcG9ydGVkLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIG5vZGUgPSBub2RlLnBhcmVudDtcblxuICAgIC8vIEJhaWwgb25jZSB3ZSBoYXZlIHJlYWNoZWQgdGhlIHJvb3QuXG4gICAgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3RhcnQgPSBub2RlLmdldEZ1bGxTdGFydCgpO1xuICByZXR1cm4gdHMuZm9yRWFjaExlYWRpbmdDb21tZW50UmFuZ2Uoc291cmNlRmlsZS50ZXh0LCBzdGFydCwgKHBvcywgZW5kLCBraW5kKSA9PiB7XG4gICAgaWYgKGtpbmQgIT09IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1lbnRUZXh0ID0gc291cmNlRmlsZS50ZXh0LnN1YnN0cmluZyhwb3MgKyAyLCBlbmQgLSAyKTtcbiAgICByZXR1cm4gY29tbWVudFRleHQ7XG4gIH0pIGFzIFRlbXBsYXRlSWQgfHwgbnVsbDtcbn1cbiJdfQ==