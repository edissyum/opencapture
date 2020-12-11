/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TagContentType, TagDefinition } from './tags';
export declare class HtmlTagDefinition implements TagDefinition {
    private closedByChildren;
    closedByParent: boolean;
    implicitNamespacePrefix: string | null;
    contentType: TagContentType;
    isVoid: boolean;
    ignoreFirstLf: boolean;
    canSelfClose: boolean;
    preventNamespaceInheritance: boolean;
    constructor({ closedByChildren, implicitNamespacePrefix, contentType, closedByParent, isVoid, ignoreFirstLf, preventNamespaceInheritance }?: {
        closedByChildren?: string[];
        closedByParent?: boolean;
        implicitNamespacePrefix?: string;
        contentType?: TagContentType;
        isVoid?: boolean;
        ignoreFirstLf?: boolean;
        preventNamespaceInheritance?: boolean;
    });
    isClosedByChild(name: string): boolean;
}
export declare function getHtmlTagDefinition(tagName: string): HtmlTagDefinition;
