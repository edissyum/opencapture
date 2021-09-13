export interface OptionsSchema {
    skipPackageJson: boolean;
    modules: string;
    modulePath: string;
    theme: 'material' | 'fabric' | 'bootstrap' | 'highcontrast';
    project?: string;
}
export interface LibOptionsSchema {
    pkgName: string;
    pkgVer: string;
    moduleName: string;
    themeVer: string;
}
