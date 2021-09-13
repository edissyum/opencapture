"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const config_1 = require("@schematics/angular/utility/config");
const ast_1 = require("../utils/ast");
const get_project_1 = require("../utils/get-project");
const theme_1 = require("./theme");
const package_1 = require("./../utils/package");
function addEJ2ToPackageJson(libOptions) {
    return (host) => {
        package_1.addEJ2PackageToPackageJson(host, 'dependencies', libOptions.pkgName, libOptions.pkgVer);
        return host;
    };
}
/*
 * Install the packages
 */
function installNodePackages() {
    return (host, context) => {
        context.addTask(new tasks_1.NodePackageInstallTask());
        return host;
    };
}
/*
 * Install function to accept the schema, package name and version
 */
function install(options, libOptions) {
    const theme = options.theme || 'material';
    return schematics_1.chain([
        options && options.skipPackageJson ? schematics_1.noop() : addEJ2ToPackageJson(libOptions),
        theme_1.addEJ2ThemeToPackageJson(options, libOptions),
        (options && !options.skipPackageJson) ? installNodePackages() : schematics_1.noop(),
        addEJ2PackageRootConfig(options, libOptions),
        theme_1.addEJ2Theme(options, theme)
    ]);
}
exports.install = install;
function validateEJ2Modules(moduleName, libOptions) {
    return libOptions.moduleName.split(',').filter((module) => {
        return ((module.trim().split('Module'))[0].toLowerCase() === moduleName.toLowerCase());
    });
}
function addModuleImportToCustomModule(host, options, validModules, libOptions) {
    if (host.exists(options.modulePath.toString())) {
        ast_1.addModuleImportToModule(host, core_1.normalize(options.modulePath.toString()), validModules, libOptions.pkgName);
    }
    else {
        throw new schematics_1.SchematicsException(`Could not find the module file. The given path \'${options.modulePath}\' is invalid. ` +
            `Please provide a valid relative path to the module file.\n` +
            `For example: src/app/app.module.ts`);
    }
}
/*
 * Add browser animation module to app.module
 */
function addEJ2PackageRootConfig(options, libOptions) {
    return (host) => {
        const workspace = config_1.getWorkspace(host);
        const project = get_project_1.getProjectFromWorkspace(workspace, options.project);
        let validModules;
        let availableModules = libOptions.moduleName.replace(/Module/g, '').trim();
        if (options.modules !== '') {
            let preferredModule = [];
            options.modules.split(',').forEach((module) => {
                let validatedModule = (validateEJ2Modules(module.trim(), libOptions)).toString().trim();
                if (validatedModule === '') {
                    console.log('\x1b[31m%s\x1b[0m', 'The ' + module + 'module is not part of the' +
                        ' package, ' + libOptions.pkgName + '. The available modules are ' + availableModules + '.');
                }
                else {
                    preferredModule.push(validatedModule);
                }
            });
            validModules = preferredModule.toString().replace(/,/g, ', ');
        }
        else {
            validModules = libOptions.moduleName;
        }
        (options.modulePath !== undefined && options.modulePath !== "") ? addModuleImportToCustomModule(host, options, validModules, libOptions) :
            ast_1.addModuleImportToRootModule(host, validModules, libOptions.pkgName, project);
        return host;
    };
}
