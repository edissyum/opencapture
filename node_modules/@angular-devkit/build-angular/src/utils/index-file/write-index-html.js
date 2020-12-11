"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeIndexHtml = void 0;
const core_1 = require("@angular-devkit/core");
const path_1 = require("path");
const package_chunk_sort_1 = require("../package-chunk-sort");
const strip_bom_1 = require("../strip-bom");
const augment_index_html_1 = require("./augment-index-html");
async function writeIndexHtml({ host, outputPath, indexPath, files = [], noModuleFiles = [], moduleFiles = [], baseHref, deployUrl, sri = false, scripts = [], styles = [], postTransforms, crossOrigin, lang, }) {
    const readFile = async (filePath) => core_1.virtualFs.fileBufferToString(await host.read(core_1.normalize(filePath)).toPromise());
    let content = await augment_index_html_1.augmentIndexHtml({
        input: outputPath,
        inputContent: strip_bom_1.stripBom(await readFile(indexPath)),
        baseHref,
        deployUrl,
        crossOrigin,
        sri,
        lang,
        entrypoints: package_chunk_sort_1.generateEntryPoints({ scripts, styles }),
        files: filterAndMapBuildFiles(files, ['.js', '.css']),
        noModuleFiles: filterAndMapBuildFiles(noModuleFiles, '.js'),
        moduleFiles: filterAndMapBuildFiles(moduleFiles, '.js'),
        loadOutputFile: filePath => readFile(path_1.join(path_1.dirname(outputPath), filePath)),
    });
    for (const transform of postTransforms) {
        content = await transform(content);
    }
    await host.write(core_1.normalize(outputPath), core_1.virtualFs.stringToFileBuffer(content)).toPromise();
}
exports.writeIndexHtml = writeIndexHtml;
function filterAndMapBuildFiles(files, extensionFilter) {
    const filteredFiles = [];
    const validExtensions = Array.isArray(extensionFilter)
        ? extensionFilter
        : [extensionFilter];
    for (const { file, name, extension, initial } of files) {
        if (name && initial && validExtensions.includes(extension)) {
            filteredFiles.push({ file, extension, name });
        }
    }
    return filteredFiles;
}
