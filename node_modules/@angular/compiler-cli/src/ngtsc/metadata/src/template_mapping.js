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
        define("@angular/compiler-cli/src/ngtsc/metadata/src/template_mapping", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TemplateRegistry = void 0;
    /**
     * Tracks the mapping between external template files and the component(s) which use them.
     *
     * This information is produced during analysis of the program and is used mainly to support
     * external tooling, for which such a mapping is challenging to determine without compiler
     * assistance.
     */
    var TemplateRegistry = /** @class */ (function () {
        function TemplateRegistry() {
            this.map = new Map();
        }
        TemplateRegistry.prototype.getComponentsWithTemplate = function (template) {
            if (!this.map.has(template)) {
                return new Set();
            }
            return this.map.get(template);
        };
        TemplateRegistry.prototype.register = function (template, component) {
            if (!this.map.has(template)) {
                this.map.set(template, new Set());
            }
            this.map.get(template).add(component);
        };
        return TemplateRegistry;
    }());
    exports.TemplateRegistry = TemplateRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfbWFwcGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvbWV0YWRhdGEvc3JjL3RlbXBsYXRlX21hcHBpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBS0g7Ozs7OztPQU1HO0lBQ0g7UUFBQTtZQUNVLFFBQUcsR0FBRyxJQUFJLEdBQUcsRUFBeUMsQ0FBQztRQWdCakUsQ0FBQztRQWRDLG9EQUF5QixHQUF6QixVQUEwQixRQUF3QjtZQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQzNCLE9BQU8sSUFBSSxHQUFHLEVBQUUsQ0FBQzthQUNsQjtZQUVELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFFLENBQUM7UUFDakMsQ0FBQztRQUVELG1DQUFRLEdBQVIsVUFBUyxRQUF3QixFQUFFLFNBQTJCO1lBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQzthQUNuQztZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBakJELElBaUJDO0lBakJZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRofSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuXG4vKipcbiAqIFRyYWNrcyB0aGUgbWFwcGluZyBiZXR3ZWVuIGV4dGVybmFsIHRlbXBsYXRlIGZpbGVzIGFuZCB0aGUgY29tcG9uZW50KHMpIHdoaWNoIHVzZSB0aGVtLlxuICpcbiAqIFRoaXMgaW5mb3JtYXRpb24gaXMgcHJvZHVjZWQgZHVyaW5nIGFuYWx5c2lzIG9mIHRoZSBwcm9ncmFtIGFuZCBpcyB1c2VkIG1haW5seSB0byBzdXBwb3J0XG4gKiBleHRlcm5hbCB0b29saW5nLCBmb3Igd2hpY2ggc3VjaCBhIG1hcHBpbmcgaXMgY2hhbGxlbmdpbmcgdG8gZGV0ZXJtaW5lIHdpdGhvdXQgY29tcGlsZXJcbiAqIGFzc2lzdGFuY2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBtYXAgPSBuZXcgTWFwPEFic29sdXRlRnNQYXRoLCBTZXQ8Q2xhc3NEZWNsYXJhdGlvbj4+KCk7XG5cbiAgZ2V0Q29tcG9uZW50c1dpdGhUZW1wbGF0ZSh0ZW1wbGF0ZTogQWJzb2x1dGVGc1BhdGgpOiBSZWFkb25seVNldDxDbGFzc0RlY2xhcmF0aW9uPiB7XG4gICAgaWYgKCF0aGlzLm1hcC5oYXModGVtcGxhdGUpKSB7XG4gICAgICByZXR1cm4gbmV3IFNldCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm1hcC5nZXQodGVtcGxhdGUpITtcbiAgfVxuXG4gIHJlZ2lzdGVyKHRlbXBsYXRlOiBBYnNvbHV0ZUZzUGF0aCwgY29tcG9uZW50OiBDbGFzc0RlY2xhcmF0aW9uKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm1hcC5oYXModGVtcGxhdGUpKSB7XG4gICAgICB0aGlzLm1hcC5zZXQodGVtcGxhdGUsIG5ldyBTZXQoKSk7XG4gICAgfVxuICAgIHRoaXMubWFwLmdldCh0ZW1wbGF0ZSkhLmFkZChjb21wb25lbnQpO1xuICB9XG59XG4iXX0=