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
        define("@angular/compiler-cli/src/ngtsc/sourcemaps/src/segment_marker", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.offsetSegment = exports.compareSegments = void 0;
    /**
     * Compare two segment-markers, for use in a search or sorting algorithm.
     *
     * @returns a positive number if `a` is after `b`, a negative number if `b` is after `a`
     * and zero if they are at the same position.
     */
    function compareSegments(a, b) {
        return a.position - b.position;
    }
    exports.compareSegments = compareSegments;
    /**
     * Return a new segment-marker that is offset by the given number of characters.
     *
     * @param startOfLinePositions the position of the start of each line of content of the source file
     * whose segment-marker we are offsetting.
     * @param marker the segment to offset.
     * @param offset the number of character to offset by.
     */
    function offsetSegment(startOfLinePositions, marker, offset) {
        if (offset === 0) {
            return marker;
        }
        var line = marker.line;
        var position = marker.position + offset;
        while (line < startOfLinePositions.length - 1 && startOfLinePositions[line + 1] <= position) {
            line++;
        }
        while (line > 0 && startOfLinePositions[line] > position) {
            line--;
        }
        var column = position - startOfLinePositions[line];
        return { line: line, column: column, position: position, next: undefined };
    }
    exports.offsetSegment = offsetSegment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudF9tYXJrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NvdXJjZW1hcHMvc3JjL3NlZ21lbnRfbWFya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQWdCSDs7Ozs7T0FLRztJQUNILFNBQWdCLGVBQWUsQ0FBQyxDQUFnQixFQUFFLENBQWdCO1FBQ2hFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO0lBQ2pDLENBQUM7SUFGRCwwQ0FFQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxTQUFnQixhQUFhLENBQ3pCLG9CQUE4QixFQUFFLE1BQXFCLEVBQUUsTUFBYztRQUN2RSxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDaEIsT0FBTyxNQUFNLENBQUM7U0FDZjtRQUVELElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDMUMsT0FBTyxJQUFJLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFO1lBQzNGLElBQUksRUFBRSxDQUFDO1NBQ1I7UUFDRCxPQUFPLElBQUksR0FBRyxDQUFDLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFO1lBQ3hELElBQUksRUFBRSxDQUFDO1NBQ1I7UUFDRCxJQUFNLE1BQU0sR0FBRyxRQUFRLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsT0FBTyxFQUFDLElBQUksTUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsQ0FBQztJQUNuRCxDQUFDO0lBaEJELHNDQWdCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbi8qKlxuICogQSBtYXJrZXIgdGhhdCBpbmRpY2F0ZXMgdGhlIHN0YXJ0IG9mIGEgc2VnbWVudCBpbiBhIG1hcHBpbmcuXG4gKlxuICogVGhlIGVuZCBvZiBhIHNlZ21lbnQgaXMgaW5kaWNhdGVkIGJ5IHRoZSB0aGUgZmlyc3Qgc2VnbWVudC1tYXJrZXIgb2YgYW5vdGhlciBtYXBwaW5nIHdob3NlIHN0YXJ0XG4gKiBpcyBncmVhdGVyIG9yIGVxdWFsIHRvIHRoaXMgb25lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlZ21lbnRNYXJrZXIge1xuICByZWFkb25seSBsaW5lOiBudW1iZXI7XG4gIHJlYWRvbmx5IGNvbHVtbjogbnVtYmVyO1xuICByZWFkb25seSBwb3NpdGlvbjogbnVtYmVyO1xuICBuZXh0OiBTZWdtZW50TWFya2VyfHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBzZWdtZW50LW1hcmtlcnMsIGZvciB1c2UgaW4gYSBzZWFyY2ggb3Igc29ydGluZyBhbGdvcml0aG0uXG4gKlxuICogQHJldHVybnMgYSBwb3NpdGl2ZSBudW1iZXIgaWYgYGFgIGlzIGFmdGVyIGBiYCwgYSBuZWdhdGl2ZSBudW1iZXIgaWYgYGJgIGlzIGFmdGVyIGBhYFxuICogYW5kIHplcm8gaWYgdGhleSBhcmUgYXQgdGhlIHNhbWUgcG9zaXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlU2VnbWVudHMoYTogU2VnbWVudE1hcmtlciwgYjogU2VnbWVudE1hcmtlcik6IG51bWJlciB7XG4gIHJldHVybiBhLnBvc2l0aW9uIC0gYi5wb3NpdGlvbjtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSBuZXcgc2VnbWVudC1tYXJrZXIgdGhhdCBpcyBvZmZzZXQgYnkgdGhlIGdpdmVuIG51bWJlciBvZiBjaGFyYWN0ZXJzLlxuICpcbiAqIEBwYXJhbSBzdGFydE9mTGluZVBvc2l0aW9ucyB0aGUgcG9zaXRpb24gb2YgdGhlIHN0YXJ0IG9mIGVhY2ggbGluZSBvZiBjb250ZW50IG9mIHRoZSBzb3VyY2UgZmlsZVxuICogd2hvc2Ugc2VnbWVudC1tYXJrZXIgd2UgYXJlIG9mZnNldHRpbmcuXG4gKiBAcGFyYW0gbWFya2VyIHRoZSBzZWdtZW50IHRvIG9mZnNldC5cbiAqIEBwYXJhbSBvZmZzZXQgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXIgdG8gb2Zmc2V0IGJ5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gb2Zmc2V0U2VnbWVudChcbiAgICBzdGFydE9mTGluZVBvc2l0aW9uczogbnVtYmVyW10sIG1hcmtlcjogU2VnbWVudE1hcmtlciwgb2Zmc2V0OiBudW1iZXIpOiBTZWdtZW50TWFya2VyIHtcbiAgaWYgKG9mZnNldCA9PT0gMCkge1xuICAgIHJldHVybiBtYXJrZXI7XG4gIH1cblxuICBsZXQgbGluZSA9IG1hcmtlci5saW5lO1xuICBjb25zdCBwb3NpdGlvbiA9IG1hcmtlci5wb3NpdGlvbiArIG9mZnNldDtcbiAgd2hpbGUgKGxpbmUgPCBzdGFydE9mTGluZVBvc2l0aW9ucy5sZW5ndGggLSAxICYmIHN0YXJ0T2ZMaW5lUG9zaXRpb25zW2xpbmUgKyAxXSA8PSBwb3NpdGlvbikge1xuICAgIGxpbmUrKztcbiAgfVxuICB3aGlsZSAobGluZSA+IDAgJiYgc3RhcnRPZkxpbmVQb3NpdGlvbnNbbGluZV0gPiBwb3NpdGlvbikge1xuICAgIGxpbmUtLTtcbiAgfVxuICBjb25zdCBjb2x1bW4gPSBwb3NpdGlvbiAtIHN0YXJ0T2ZMaW5lUG9zaXRpb25zW2xpbmVdO1xuICByZXR1cm4ge2xpbmUsIGNvbHVtbiwgcG9zaXRpb24sIG5leHQ6IHVuZGVmaW5lZH07XG59XG4iXX0=