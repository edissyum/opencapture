"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
/** Regular expression that matches all possible Angular CLI default style files. */
const defaultStyleFileRegex = /styles\.(c|le|sc)ss/;
/** Regular expression that matches all files that have a proper stylesheet extension. */
const validStyleFileRegex = /\.(c|le|sc)ss/;
/**
 * Gets a style file with the given extension in a project and returns its path. If no
 * extension is specified, any style file with a valid extension will be returned.
 */
function getProjectStyleFile(project, extension) {
    const buildTarget = project.architect['build'];
    if (buildTarget.options && buildTarget.options.styles && buildTarget.options.styles.length) {
        const styles = buildTarget.options.styles.map(s => typeof s === 'string' ? s : s.input);
        // Look for the default style file that is generated for new projects by the Angular CLI. This
        // default style file is usually called `styles.ext` unless it has been changed explicitly.
        const defaultMainStylePath = styles
            .find(file => extension ? file === `styles.${extension}` : defaultStyleFileRegex.test(file));
        if (defaultMainStylePath) {
            return core_1.normalize(defaultMainStylePath);
        }
        // If no default style file could be found, use the first style file that matches the given
        // extension. If no extension specified explicitly, we look for any file with a valid style
        // file extension.
        const fallbackStylePath = styles
            .find(file => extension ? file.endsWith(`.${extension}`) : validStyleFileRegex.test(file));
        if (fallbackStylePath) {
            return core_1.normalize(fallbackStylePath);
        }
    }
    return null;
}
exports.getProjectStyleFile = getProjectStyleFile;
/** Throws if the project is not using the default Angular devkit builders. */
function assertDefaultBuildersConfigured(project) {
    const defaultBuilder = '@angular-devkit/build-angular:browser';
    const defaultTestBuilder = '@angular-devkit/build-angular:karma';
    const hasDefaultBuilders = project.architect &&
        project.architect['build'] &&
        project.architect['build']['builder'] === defaultBuilder &&
        project.architect['test'] &&
        project.architect['test']['builder'] === defaultTestBuilder;
    if (!hasDefaultBuilders) {
        throw new schematics_1.SchematicsException('Your project is not using the default builders for build and test. The Angular Material ' +
            'schematics can only be used if the original builders from the Angular CLI are configured.');
    }
}
exports.assertDefaultBuildersConfigured = assertDefaultBuildersConfigured;
