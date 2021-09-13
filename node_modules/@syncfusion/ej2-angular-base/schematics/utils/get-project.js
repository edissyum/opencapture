"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
function getProjectFromWorkspace(workspace, projectName) {
    let project = workspace.projects[projectName || workspace.defaultProject];
    if (!project) {
        throw new Error(`Could not find project in workspace: ${projectName}`);
    }
    return project;
}
exports.getProjectFromWorkspace = getProjectFromWorkspace;
