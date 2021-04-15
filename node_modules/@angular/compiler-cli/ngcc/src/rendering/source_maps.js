(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/source_maps", ["require", "exports", "convert-source-map", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/sourcemaps"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderSourceAndMap = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var convert_source_map_1 = require("convert-source-map");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var sourcemaps_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps");
    /**
     * Merge the input and output source-maps, replacing the source-map comment in the output file
     * with an appropriate source-map comment pointing to the merged source-map.
     */
    function renderSourceAndMap(logger, fs, sourceFile, generatedMagicString) {
        var generatedPath = file_system_1.absoluteFromSourceFile(sourceFile);
        var generatedMapPath = file_system_1.absoluteFrom(generatedPath + ".map");
        var generatedContent = generatedMagicString.toString();
        var generatedMap = generatedMagicString.generateMap({ file: generatedPath, source: generatedPath, includeContent: true });
        try {
            var loader = new sourcemaps_1.SourceFileLoader(fs, logger, {});
            var generatedFile = loader.loadSourceFile(generatedPath, generatedContent, { map: generatedMap, mapPath: generatedMapPath });
            var rawMergedMap = generatedFile.renderFlattenedSourceMap();
            var mergedMap = convert_source_map_1.fromObject(rawMergedMap);
            var firstSource = generatedFile.sources[0];
            if (firstSource && (firstSource.rawMap !== null || !sourceFile.isDeclarationFile) &&
                firstSource.inline) {
                // We render an inline source map if one of:
                // * there was no input source map and this is not a typings file;
                // * the input source map exists and was inline.
                //
                // We do not generate inline source maps for typings files unless there explicitly was one in
                // the input file because these inline source maps can be very large and it impacts on the
                // performance of IDEs that need to read them to provide intellisense etc.
                return [
                    { path: generatedPath, contents: generatedFile.contents + "\n" + mergedMap.toComment() }
                ];
            }
            else {
                var sourceMapComment = convert_source_map_1.generateMapFileComment(file_system_1.basename(generatedPath) + ".map");
                return [
                    { path: generatedPath, contents: generatedFile.contents + "\n" + sourceMapComment },
                    { path: generatedMapPath, contents: mergedMap.toJSON() }
                ];
            }
        }
        catch (e) {
            logger.error("Error when flattening the source-map \"" + generatedMapPath + "\" for \"" + generatedPath + "\": " + e.toString());
            return [
                { path: generatedPath, contents: generatedContent },
                { path: generatedMapPath, contents: convert_source_map_1.fromObject(generatedMap).toJSON() },
            ];
        }
    }
    exports.renderSourceAndMap = renderSourceAndMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX21hcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL3NvdXJjZV9tYXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlEQUEwRjtJQUkxRiwyRUFBMEc7SUFFMUcseUVBQTZFO0lBVTdFOzs7T0FHRztJQUNILFNBQWdCLGtCQUFrQixDQUM5QixNQUFjLEVBQUUsRUFBYyxFQUFFLFVBQXlCLEVBQ3pELG9CQUFpQztRQUNuQyxJQUFNLGFBQWEsR0FBRyxvQ0FBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RCxJQUFNLGdCQUFnQixHQUFHLDBCQUFZLENBQUksYUFBYSxTQUFNLENBQUMsQ0FBQztRQUM5RCxJQUFNLGdCQUFnQixHQUFHLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pELElBQU0sWUFBWSxHQUFpQixvQkFBb0IsQ0FBQyxXQUFXLENBQy9ELEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBRXhFLElBQUk7WUFDRixJQUFNLE1BQU0sR0FBRyxJQUFJLDZCQUFnQixDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEQsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FDdkMsYUFBYSxFQUFFLGdCQUFnQixFQUFFLEVBQUMsR0FBRyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDO1lBRXJGLElBQU0sWUFBWSxHQUFpQixhQUFhLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUM1RSxJQUFNLFNBQVMsR0FBRywrQkFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzNDLElBQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDN0UsV0FBVyxDQUFDLE1BQU0sRUFBRTtnQkFDdEIsNENBQTRDO2dCQUM1QyxrRUFBa0U7Z0JBQ2xFLGdEQUFnRDtnQkFDaEQsRUFBRTtnQkFDRiw2RkFBNkY7Z0JBQzdGLDBGQUEwRjtnQkFDMUYsMEVBQTBFO2dCQUMxRSxPQUFPO29CQUNMLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUssYUFBYSxDQUFDLFFBQVEsVUFBSyxTQUFTLENBQUMsU0FBUyxFQUFJLEVBQUM7aUJBQ3ZGLENBQUM7YUFDSDtpQkFBTTtnQkFDTCxJQUFNLGdCQUFnQixHQUFHLDJDQUFzQixDQUFJLHNCQUFRLENBQUMsYUFBYSxDQUFDLFNBQU0sQ0FBQyxDQUFDO2dCQUNsRixPQUFPO29CQUNMLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUssYUFBYSxDQUFDLFFBQVEsVUFBSyxnQkFBa0IsRUFBQztvQkFDakYsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBQztpQkFDdkQsQ0FBQzthQUNIO1NBQ0Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsNENBQXlDLGdCQUFnQixpQkFDbEUsYUFBYSxZQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUksQ0FBQyxDQUFDO1lBQ3ZDLE9BQU87Z0JBQ0wsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBQztnQkFDakQsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLCtCQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUM7YUFDdEUsQ0FBQztTQUNIO0lBQ0gsQ0FBQztJQTVDRCxnREE0Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ZnJvbU9iamVjdCwgZ2VuZXJhdGVNYXBGaWxlQ29tbWVudCwgU291cmNlTWFwQ29udmVydGVyfSBmcm9tICdjb252ZXJ0LXNvdXJjZS1tYXAnO1xuaW1wb3J0IE1hZ2ljU3RyaW5nIGZyb20gJ21hZ2ljLXN0cmluZyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHthYnNvbHV0ZUZyb20sIGFic29sdXRlRnJvbVNvdXJjZUZpbGUsIGJhc2VuYW1lLCBGaWxlU3lzdGVtfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9sb2dnaW5nJztcbmltcG9ydCB7UmF3U291cmNlTWFwLCBTb3VyY2VGaWxlTG9hZGVyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2Mvc291cmNlbWFwcyc7XG5cbmltcG9ydCB7RmlsZVRvV3JpdGV9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNvdXJjZU1hcEluZm8ge1xuICBzb3VyY2U6IHN0cmluZztcbiAgbWFwOiBTb3VyY2VNYXBDb252ZXJ0ZXJ8bnVsbDtcbiAgaXNJbmxpbmU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogTWVyZ2UgdGhlIGlucHV0IGFuZCBvdXRwdXQgc291cmNlLW1hcHMsIHJlcGxhY2luZyB0aGUgc291cmNlLW1hcCBjb21tZW50IGluIHRoZSBvdXRwdXQgZmlsZVxuICogd2l0aCBhbiBhcHByb3ByaWF0ZSBzb3VyY2UtbWFwIGNvbW1lbnQgcG9pbnRpbmcgdG8gdGhlIG1lcmdlZCBzb3VyY2UtbWFwLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU291cmNlQW5kTWFwKFxuICAgIGxvZ2dlcjogTG9nZ2VyLCBmczogRmlsZVN5c3RlbSwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSxcbiAgICBnZW5lcmF0ZWRNYWdpY1N0cmluZzogTWFnaWNTdHJpbmcpOiBGaWxlVG9Xcml0ZVtdIHtcbiAgY29uc3QgZ2VuZXJhdGVkUGF0aCA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc291cmNlRmlsZSk7XG4gIGNvbnN0IGdlbmVyYXRlZE1hcFBhdGggPSBhYnNvbHV0ZUZyb20oYCR7Z2VuZXJhdGVkUGF0aH0ubWFwYCk7XG4gIGNvbnN0IGdlbmVyYXRlZENvbnRlbnQgPSBnZW5lcmF0ZWRNYWdpY1N0cmluZy50b1N0cmluZygpO1xuICBjb25zdCBnZW5lcmF0ZWRNYXA6IFJhd1NvdXJjZU1hcCA9IGdlbmVyYXRlZE1hZ2ljU3RyaW5nLmdlbmVyYXRlTWFwKFxuICAgICAge2ZpbGU6IGdlbmVyYXRlZFBhdGgsIHNvdXJjZTogZ2VuZXJhdGVkUGF0aCwgaW5jbHVkZUNvbnRlbnQ6IHRydWV9KTtcblxuICB0cnkge1xuICAgIGNvbnN0IGxvYWRlciA9IG5ldyBTb3VyY2VGaWxlTG9hZGVyKGZzLCBsb2dnZXIsIHt9KTtcbiAgICBjb25zdCBnZW5lcmF0ZWRGaWxlID0gbG9hZGVyLmxvYWRTb3VyY2VGaWxlKFxuICAgICAgICBnZW5lcmF0ZWRQYXRoLCBnZW5lcmF0ZWRDb250ZW50LCB7bWFwOiBnZW5lcmF0ZWRNYXAsIG1hcFBhdGg6IGdlbmVyYXRlZE1hcFBhdGh9KTtcblxuICAgIGNvbnN0IHJhd01lcmdlZE1hcDogUmF3U291cmNlTWFwID0gZ2VuZXJhdGVkRmlsZS5yZW5kZXJGbGF0dGVuZWRTb3VyY2VNYXAoKTtcbiAgICBjb25zdCBtZXJnZWRNYXAgPSBmcm9tT2JqZWN0KHJhd01lcmdlZE1hcCk7XG4gICAgY29uc3QgZmlyc3RTb3VyY2UgPSBnZW5lcmF0ZWRGaWxlLnNvdXJjZXNbMF07XG4gICAgaWYgKGZpcnN0U291cmNlICYmIChmaXJzdFNvdXJjZS5yYXdNYXAgIT09IG51bGwgfHwgIXNvdXJjZUZpbGUuaXNEZWNsYXJhdGlvbkZpbGUpICYmXG4gICAgICAgIGZpcnN0U291cmNlLmlubGluZSkge1xuICAgICAgLy8gV2UgcmVuZGVyIGFuIGlubGluZSBzb3VyY2UgbWFwIGlmIG9uZSBvZjpcbiAgICAgIC8vICogdGhlcmUgd2FzIG5vIGlucHV0IHNvdXJjZSBtYXAgYW5kIHRoaXMgaXMgbm90IGEgdHlwaW5ncyBmaWxlO1xuICAgICAgLy8gKiB0aGUgaW5wdXQgc291cmNlIG1hcCBleGlzdHMgYW5kIHdhcyBpbmxpbmUuXG4gICAgICAvL1xuICAgICAgLy8gV2UgZG8gbm90IGdlbmVyYXRlIGlubGluZSBzb3VyY2UgbWFwcyBmb3IgdHlwaW5ncyBmaWxlcyB1bmxlc3MgdGhlcmUgZXhwbGljaXRseSB3YXMgb25lIGluXG4gICAgICAvLyB0aGUgaW5wdXQgZmlsZSBiZWNhdXNlIHRoZXNlIGlubGluZSBzb3VyY2UgbWFwcyBjYW4gYmUgdmVyeSBsYXJnZSBhbmQgaXQgaW1wYWN0cyBvbiB0aGVcbiAgICAgIC8vIHBlcmZvcm1hbmNlIG9mIElERXMgdGhhdCBuZWVkIHRvIHJlYWQgdGhlbSB0byBwcm92aWRlIGludGVsbGlzZW5zZSBldGMuXG4gICAgICByZXR1cm4gW1xuICAgICAgICB7cGF0aDogZ2VuZXJhdGVkUGF0aCwgY29udGVudHM6IGAke2dlbmVyYXRlZEZpbGUuY29udGVudHN9XFxuJHttZXJnZWRNYXAudG9Db21tZW50KCl9YH1cbiAgICAgIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNvdXJjZU1hcENvbW1lbnQgPSBnZW5lcmF0ZU1hcEZpbGVDb21tZW50KGAke2Jhc2VuYW1lKGdlbmVyYXRlZFBhdGgpfS5tYXBgKTtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHtwYXRoOiBnZW5lcmF0ZWRQYXRoLCBjb250ZW50czogYCR7Z2VuZXJhdGVkRmlsZS5jb250ZW50c31cXG4ke3NvdXJjZU1hcENvbW1lbnR9YH0sXG4gICAgICAgIHtwYXRoOiBnZW5lcmF0ZWRNYXBQYXRoLCBjb250ZW50czogbWVyZ2VkTWFwLnRvSlNPTigpfVxuICAgICAgXTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEVycm9yIHdoZW4gZmxhdHRlbmluZyB0aGUgc291cmNlLW1hcCBcIiR7Z2VuZXJhdGVkTWFwUGF0aH1cIiBmb3IgXCIke1xuICAgICAgICBnZW5lcmF0ZWRQYXRofVwiOiAke2UudG9TdHJpbmcoKX1gKTtcbiAgICByZXR1cm4gW1xuICAgICAge3BhdGg6IGdlbmVyYXRlZFBhdGgsIGNvbnRlbnRzOiBnZW5lcmF0ZWRDb250ZW50fSxcbiAgICAgIHtwYXRoOiBnZW5lcmF0ZWRNYXBQYXRoLCBjb250ZW50czogZnJvbU9iamVjdChnZW5lcmF0ZWRNYXApLnRvSlNPTigpfSxcbiAgICBdO1xuICB9XG59XG4iXX0=