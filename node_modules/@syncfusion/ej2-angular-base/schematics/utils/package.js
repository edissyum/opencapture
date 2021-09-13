"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Adds Essential JS 2 package to the package.json
 */
function addEJ2PackageToPackageJson(host, type, ej2_pkg, version) {
    if (host.exists('package.json')) {
        const srcText = host.read('package.json').toString('utf-8');
        const pkg_json = JSON.parse(srcText);
        if (!pkg_json[type]) {
            pkg_json[type] = {};
        }
        if (!pkg_json[type][ej2_pkg]) {
            pkg_json[type][ej2_pkg] = version;
        }
        host.overwrite('package.json', JSON.stringify(pkg_json, null, 2));
    }
    return host;
}
exports.addEJ2PackageToPackageJson = addEJ2PackageToPackageJson;
