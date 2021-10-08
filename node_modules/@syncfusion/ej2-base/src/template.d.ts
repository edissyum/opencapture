/**
 * Template Engine
 */
/**
 * The function to set regular expression for template expression string.
 *
 * @param {RegExp} value - Value expression.
 * @returns {RegExp} ?
 * @private
 */
export declare function expression(value?: RegExp): RegExp;
/**
 * Compile the template string into template function.
 *
 * @param {string} template - The template string which is going to convert.
 * @param {Object} helper - Helper functions as an object.
 * @param {boolean} ignorePrefix ?
 * @returns {string} ?
 * @private
 */
export declare function compile(template: string, helper?: Object, ignorePrefix?: boolean): () => string;
