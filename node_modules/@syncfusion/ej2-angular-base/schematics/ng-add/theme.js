"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const change_1 = require("@schematics/angular/utility/change");
const config_1 = require("@schematics/angular/utility/config");
const get_project_1 = require("../utils/get-project");
const package_1 = require("../utils/package");
const project_style_file_1 = require("../utils/project-style-file");
/*
 * Adds EJ2 theme dependecies
 */
function addEJ2ThemeToPackageJson(options, libOptions) {
    const themeVer = libOptions.themeVer ? libOptions.themeVer : 'latest';
    return (host) => {
        package_1.addEJ2PackageToPackageJson(host, 'dependencies', `@syncfusion/ej2-${options.theme || 'material'}-theme`, themeVer);
        return host;
    };
}
exports.addEJ2ThemeToPackageJson = addEJ2ThemeToPackageJson;
/*
 * Adds EJ2 theme
 */
function addEJ2Theme(options, theme) {
    return (host) => {
        const themePath = `@import \'..\/node_modules/@syncfusion/ej2-${theme}-theme/styles/${theme}.css\';\n`;
        const strippedThemePath = `./node_modules/@syncfusion/ej2-${theme}-theme/styles/${theme}.css`;
        const workspace = config_1.getWorkspace(host);
        const project = get_project_1.getProjectFromWorkspace(workspace, options.project);
        const stylesPath = project_style_file_1.getProjectStyleFile(project, 'css');
        const stylesBuffer = host.read(stylesPath);
        // Because the build setup for the Angular CLI can be changed so dramatically, we can't know
        // where to generate anything if the project is not using the default config for build and test.
        project_style_file_1.assertDefaultBuildersConfigured(project);
        options.skipPackageJson ? console.log('\x1b[33m%s\x1b[0m', `WARNING: You skipped the dependency installation. ` +
            `You must manually install the \'@syncfusion/ej2-${theme}-theme\' package. ` +
            `If you have already done this, you can ignore this message.`) :
            null;
        if (stylesBuffer) {
            const stylesContent = stylesBuffer.toString();
            if (!stylesContent.includes(themePath)) {
                const streamContent = host.beginUpdate(stylesPath);
                const insertion = new change_1.InsertChange(stylesPath, 0, themePath);
                streamContent.insertLeft(insertion.pos, insertion.toAdd);
                host.commitUpdate(streamContent);
            }
        }
        else {
            console.log('\x1b[31m%s\x1b[0m', `Cannot import theme file. The file \'/src/styles.css\' is missing.`);
        }
        project.architect ? [
            addStyleToTarget(project.architect['build'], host, strippedThemePath, workspace),
            addStyleToTarget(project.architect['test'], host, strippedThemePath, workspace)
        ] :
            console.log('\x1b[31m%s\x1b[0m', `The project does not have an architect configuration. `
                + `Cannot add entry theme file in \'angular.json\'.`);
        return host;
    };
}
exports.addEJ2Theme = addEJ2Theme;
/*
 * Adds a style entry to the given target.
 */
function addStyleToTarget(target, host, asset, workspace) {
    // We can't assume that any of these properties are defined, so safely add them as we go
    // if necessary.
    if (!target.options) {
        target.options = { styles: [asset] };
    }
    else if (!target.options.styles) {
        target.options.styles = [asset];
    }
    else {
        const currentStyles = target.options.styles.map(s => typeof s === 'string' ? s : s.input);
        if (!currentStyles.includes(asset)) {
            target.options.styles.push(asset);
        }
    }
    host.overwrite('angular.json', JSON.stringify(workspace, null, 2));
}
