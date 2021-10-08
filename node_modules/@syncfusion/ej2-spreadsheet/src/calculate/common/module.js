/**
 * Represents the getModules function.
 *
 * @param {Calculate} context - specify the context
 * @returns {ModuleDeclaration[]} - Represents the getModules function.
 */
export function getModules(context) {
    var modules = [];
    if (context.includeBasicFormulas) {
        modules.push({
            member: 'basic-formulas',
            args: [context]
        });
    }
    return modules;
}
