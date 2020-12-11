/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/metadata" />
export * from './src/api';
export { DtsMetadataReader } from './src/dts';
export { flattenInheritedDirectiveMetadata } from './src/inheritance';
export { CompoundMetadataRegistry, LocalMetadataRegistry, InjectableClassRegistry } from './src/registry';
export { TemplateRegistry as TemplateMapping } from './src/template_mapping';
export { extractDirectiveTypeCheckMeta, CompoundMetadataReader } from './src/util';
export { BindingPropertyName, ClassPropertyMapping, ClassPropertyName, InputOrOutput } from './src/property_mapping';
