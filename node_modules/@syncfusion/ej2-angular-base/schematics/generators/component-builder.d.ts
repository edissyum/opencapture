import { Rule } from "@angular-devkit/schematics";
import { Schema } from "@schematics/angular/component/schema";
export interface sampleDetails {
    componentName: string;
    sampleName: string;
    diModules: string;
    packageName: string;
    libModules: string;
}
export declare function componentBuilder(options: Schema, sampleDetails: sampleDetails): Rule;
