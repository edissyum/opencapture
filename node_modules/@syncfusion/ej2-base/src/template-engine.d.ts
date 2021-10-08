export declare const blazorTemplates: object;
/**
 *
 * @returns {string} ?
 */
export declare function getRandomId(): string;
/**
 * Interface for Template Engine.
 */
export interface ITemplateEngine {
    compile: (templateString: string, helper?: Object, ignorePrefix?: boolean) => (data: Object | JSON) => string;
}
/**
 * Compile the template string into template function.
 *
 * @param {string} templateString - The template string which is going to convert.
 * @param {Object} helper - Helper functions as an object.
 * @param {boolean} ignorePrefix ?
 * @returns {NodeList} ?
 * @private
 */
export declare function compile(templateString: string, helper?: Object, ignorePrefix?: boolean): (data: Object | JSON, component?: any, propName?: any) => NodeList;
/**
 *
 * @param {string} templateId ?
 * @param {string} templateName ?
 * @param {string} comp ?
 * @param {boolean} isEmpty ?
 * @param {Function} callBack ?
 * @returns {void} ?
 */
export declare function updateBlazorTemplate(templateId?: string, templateName?: string, comp?: object, isEmpty?: boolean, callBack?: Function): void;
/**
 *
 * @param {string} templateId ?
 * @param {string} templateName ?
 * @param {number} index ?
 * @returns {void} ?
 */
export declare function resetBlazorTemplate(templateId?: string, templateName?: string, index?: number): void;
/**
 * Set your custom template engine for template rendering.
 *
 * @param  {ITemplateEngine} classObj - Class object for custom template.
 * @returns {void} ?
 * @private
 */
export declare function setTemplateEngine(classObj: ITemplateEngine): void;
/**
 * Get current template engine for template rendering
 *
 * @returns {string} ?
 * @private
 */
export declare function getTemplateEngine(): (template: string, helper?: Object) => (data: Object | JSON) => string;
