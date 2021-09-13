"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const config_1 = require("@schematics/angular/utility/config");
const ts = require("typescript");
const get_project_1 = require("../utils/get-project");
const helpers_1 = require("../utils/helpers/helpers");
const ast_1 = require("../utils/ast");
function componentBuilder(options, sampleDetails) {
    return (host, context) => {
        const workspace = config_1.getWorkspace(host);
        const project = get_project_1.getProjectFromWorkspace(workspace, options.project);
        options.selector = options.selector || core_1.strings.dasherize(options.name);
        if (options.path === undefined) {
            options.path = `/${project.root}/src/app/`;
        }
        const parsedPath = helpers_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        helpers_1.validateName(options.name);
        helpers_1.validateHtmlSelector(options.selector);
        options.selector = options.selector || buildSelector(options, project.prefix);
        options.module = helpers_1.findModuleFromOptions(host, options);
        const templateSource = schematics_1.apply(schematics_1.url('./samples'), [
            schematics_1.template(Object.assign({}, core_1.strings, { 'if-flat': (s) => options.flat ? '' : s }, options)),
            schematics_1.move(null, parsedPath.path)
        ]);
        const parsedImagePath = helpers_1.parseName(`/${project.root}/src/assets/${sampleDetails.componentName}`, `${sampleDetails.sampleName}`);
        let imagesExists = host.getDir(`${parsedImagePath.path}/${parsedImagePath.name}`).subfiles.length ?
            true : false, optionsClone = Object.assign({}, options), copyImages;
        optionsClone.path = parsedImagePath.path;
        optionsClone.name = parsedImagePath.name;
        if (!imagesExists)
            copyImages = schematics_1.apply(schematics_1.url('./images'), [
                schematics_1.template(Object.assign({}, core_1.strings, optionsClone)),
                schematics_1.move(null, parsedImagePath.path)
            ]);
        return schematics_1.chain([
            schematics_1.branchAndMerge(schematics_1.chain([
                addModuleToRoot(options, sampleDetails),
                schematics_1.mergeWith(templateSource),
                imagesExists ? schematics_1.noop() : schematics_1.mergeWith(copyImages),
            ]))
        ])(host, context);
    };
}
exports.componentBuilder = componentBuilder;
function buildSelector(options, projectPrefix) {
    let selector = core_1.strings.dasherize(options.name);
    if (options.prefix) {
        selector = `${options.prefix}-${selector}`;
    }
    else if (options.prefix === undefined && projectPrefix) {
        selector = `${projectPrefix}-${selector}`;
    }
    return selector;
}
function readIntoSourceFile(host, modulePath) {
    const text = host.read(modulePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}
function addModuleToRoot(options, sampleDetails) {
    return (host) => {
        const modulePath = options.module;
        let source = readIntoSourceFile(host, modulePath);
        const componentPath = `/${options.path}/`
            + (options.flat ? '' : core_1.strings.dasherize(options.name) + '/')
            + core_1.strings.dasherize(options.name)
            + '.component';
        const relativePath = helpers_1.buildRelativePath(modulePath, componentPath);
        const classifiedName = core_1.strings.classify(`${options.name}Component`);
        const declarationChanges = helpers_1.addDeclarationToModule(source, modulePath, classifiedName, relativePath);
        const declarationRecorder = host.beginUpdate(modulePath);
        for (const change of declarationChanges) {
            if (change instanceof helpers_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        ast_1.addModuleImportToModule(host, modulePath, sampleDetails.libModules, sampleDetails.packageName);
        const providers = sampleDetails.diModules ? sampleDetails.diModules.split(',') : null;
        if (providers)
            providers.forEach((provider) => {
                if (!helpers_1.isImported(source, provider.trim(), sampleDetails.packageName)) {
                    source = readIntoSourceFile(host, modulePath);
                    const providerChanges = helpers_1.addProviderToModule(source, modulePath, provider, sampleDetails.packageName);
                    const providerRecorder = host.beginUpdate(modulePath);
                    for (const change of providerChanges) {
                        if (change instanceof helpers_1.InsertChange) {
                            providerRecorder.insertLeft(change.pos, change.toAdd);
                        }
                    }
                    host.commitUpdate(providerRecorder);
                }
            });
        return host;
    };
}
