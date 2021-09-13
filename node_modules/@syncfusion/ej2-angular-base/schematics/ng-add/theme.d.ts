import { Tree } from "@angular-devkit/schematics";
import { LibOptionsSchema, OptionsSchema } from "../ng-add/schema";
export declare function addEJ2ThemeToPackageJson(options: OptionsSchema, libOptions: LibOptionsSchema): (host: Tree) => Tree;
export declare function addEJ2Theme(options: OptionsSchema, theme: string): (host: Tree) => Tree;
