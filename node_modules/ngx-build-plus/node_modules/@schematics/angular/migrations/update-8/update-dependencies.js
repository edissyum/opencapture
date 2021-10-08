"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dependencies_1 = require("../../utility/dependencies");
const latest_versions_1 = require("../../utility/latest-versions");
function updateDependencies() {
    return (host) => {
        let current = dependencies_1.getPackageJsonDependency(host, '@angular-devkit/build-angular');
        if (current && current.version !== latest_versions_1.latestVersions.DevkitBuildAngular) {
            dependencies_1.addPackageJsonDependency(host, {
                type: current.type,
                name: '@angular-devkit/build-angular',
                version: latest_versions_1.latestVersions.DevkitBuildAngular,
                overwrite: true,
            });
        }
        current = dependencies_1.getPackageJsonDependency(host, '@angular-devkit/build-ng-packagr');
        if (current && current.version !== latest_versions_1.latestVersions.DevkitBuildNgPackagr) {
            dependencies_1.addPackageJsonDependency(host, {
                type: current.type,
                name: '@angular-devkit/build-ng-packagr',
                version: latest_versions_1.latestVersions.DevkitBuildNgPackagr,
                overwrite: true,
            });
        }
        current = dependencies_1.getPackageJsonDependency(host, 'zone.js');
        if (current && current.version !== latest_versions_1.latestVersions.ZoneJs) {
            dependencies_1.addPackageJsonDependency(host, {
                type: current.type,
                name: 'zone.js',
                version: latest_versions_1.latestVersions.ZoneJs,
                overwrite: true,
            });
        }
        // FIXME: change to ^2.3.2 as soon as it's released with the pr208 fix
        const webAnimationsJsVersion = 'github:angular/web-animations-js#release_pr208';
        current = dependencies_1.getPackageJsonDependency(host, 'web-animations-js');
        if (current && current.version !== webAnimationsJsVersion) {
            dependencies_1.addPackageJsonDependency(host, {
                type: current.type,
                name: 'web-animations-js',
                version: webAnimationsJsVersion,
                overwrite: true,
            });
        }
    };
}
exports.updateDependencies = updateDependencies;
