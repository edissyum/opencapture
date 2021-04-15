/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/metadata/src/template_mapping" />
import { AbsoluteFsPath } from '../../file_system';
import { ClassDeclaration } from '../../reflection';
/**
 * Tracks the mapping between external template files and the component(s) which use them.
 *
 * This information is produced during analysis of the program and is used mainly to support
 * external tooling, for which such a mapping is challenging to determine without compiler
 * assistance.
 */
export declare class TemplateRegistry {
    private map;
    getComponentsWithTemplate(template: AbsoluteFsPath): ReadonlySet<ClassDeclaration>;
    register(template: AbsoluteFsPath, component: ClassDeclaration): void;
}
