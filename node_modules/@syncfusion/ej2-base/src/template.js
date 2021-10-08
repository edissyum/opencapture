/**
 * Template Engine
 */
var LINES = new RegExp('\\n|\\r|\\s\\s+', 'g');
var QUOTES = new RegExp(/'|"/g);
var IF_STMT = new RegExp('if ?\\(');
var ELSEIF_STMT = new RegExp('else if ?\\(');
var ELSE_STMT = new RegExp('else');
var FOR_STMT = new RegExp('for ?\\(');
var IF_OR_FOR = new RegExp('(/if|/for)');
var CALL_FUNCTION = new RegExp('\\((.*)\\)', '');
var NOT_NUMBER = new RegExp('^[0-9]+$', 'g');
var WORD = new RegExp('[\\w"\'.\\s+]+', 'g');
var DBL_QUOTED_STR = new RegExp('"(.*?)"', 'g');
var WORDIF = new RegExp('[\\w"\'@#$.\\s-+]+', 'g');
var exp = new RegExp('\\${([^}]*)}', 'g');
// let cachedTemplate: Object = {};
var ARR_OBJ = /^\..*/gm;
var SINGLE_SLASH = /\\/gi;
var DOUBLE_SLASH = /\\\\/gi;
var WORDFUNC = new RegExp('[\\w"\'@#$.\\s+]+', 'g');
var WINDOWFUNC = /\window\./gm;
/**
 * The function to set regular expression for template expression string.
 *
 * @param {RegExp} value - Value expression.
 * @returns {RegExp} ?
 * @private
 */
export function expression(value) {
    if (value) {
        exp = value;
    }
    return exp;
}
// /**
//  * To render the template string from the given data.
//  * @param  {string} template - String Template.
//  * @param  {Object[]|JSON} data - DataSource for the template.
//  * @param  {Object} helper? - custom helper object.
//  */
// export function template(template: string, data: JSON, helper?: Object): string {
//     let hash: string = hashCode(template);
//     let tmpl: Function;
//     if (!cachedTemplate[hash]) {
//         tmpl = cachedTemplate[hash] = compile(template, helper);
//     } else {
//         tmpl = cachedTemplate[hash];
//     }
//     return tmpl(data);
// }
/**
 * Compile the template string into template function.
 *
 * @param {string} template - The template string which is going to convert.
 * @param {Object} helper - Helper functions as an object.
 * @param {boolean} ignorePrefix ?
 * @returns {string} ?
 * @private
 */
export function compile(template, helper, ignorePrefix) {
    var argName = 'data';
    var evalExpResult = evalExp(template, argName, helper, ignorePrefix);
    var condtion = "var valueRegEx = (/value=\\'([A-Za-z0-9 _]*)((.)([\\w)(!-;?-\u25A0\\s]+)['])/g);\n    var hrefRegex = (/(?:href)([\\s='\"./]+)([\\w-./?=&\\\\#\"]+)((.)([\\w)(!-;/?-\u25A0\\s]+)['])/g);\n    if(str.match(valueRegEx)){\n        var check = str.match(valueRegEx);\n        var str1 = str;\n        for (var i=0; i < check.length; i++) {\n            var check1 = str.match(valueRegEx)[i].split('value=')[1];\n            var change = check1.match(/^'/) !== null ? check1.replace(/^'/, '\"') : check1;\n            change =change.match(/.$/)[0] === '\\'' ? change.replace(/.$/,'\"') : change;\n            str1 = str1.replace(check1, change);\n        }\n        str = str.replace(str, str1);\n    }\n    else if(str.match(hrefRegex)) {\n        var check = str.match(hrefRegex);\n        var str1 = str;\n        for (var i=0; i < check.length; i++) {\n            var check1 = str.match(hrefRegex)[i].split('href=')[1];\n            var change = check1.match(/^'/) !== null ? check1.replace(/^'/, '\"') : check1;\n            change =change.match(/.$/)[0] === '\\'' ? change.replace(/.$/,'\"') : change;\n            str1 = str1.replace(check1, change);\n        }\n        str = str.replace(str, str1);\n    }\n    ";
    var fnCode = "var str=\"" + evalExpResult + "\";" + condtion + " return str;";
    var fn = new Function(argName, fnCode);
    return fn.bind(helper);
}
/** function used to evaluate the function expression
 *
 * @param {string} str ?
 * @param {string} nameSpace ?
 * @param {Object} helper ?
 * @param {boolean} ignorePrefix ?
 * @returns {string} ?
 */
function evalExp(str, nameSpace, helper, ignorePrefix) {
    var varCOunt = 0;
    /**
     * Variable containing Local Keys
     */
    var localKeys = [];
    var isClass = str.match(/class="([^"]+|)\s{2}/g);
    var singleSpace = '';
    if (isClass) {
        isClass.forEach(function (value) {
            singleSpace = value.replace(/\s\s+/g, ' ');
            str = str.replace(value, singleSpace);
        });
    }
    return str.replace(LINES, '').replace(DBL_QUOTED_STR, '\'$1\'').replace(exp, 
    // eslint-disable-next-line
    function (match, cnt, offset, matchStr) {
        var SPECIAL_CHAR = /@|#|\$/gm;
        var matches = cnt.match(CALL_FUNCTION);
        // matches to detect any function calls
        if (matches) {
            var rlStr = matches[1];
            if (ELSEIF_STMT.test(cnt)) {
                //handling else-if condition
                cnt = '";} ' + cnt.replace(matches[1], rlStr.replace(WORD, function (str) {
                    str = str.trim();
                    return addNameSpace(str, !(QUOTES.test(str)) && (localKeys.indexOf(str) === -1), nameSpace, localKeys, ignorePrefix);
                })) + '{ \n str = str + "';
            }
            else if (IF_STMT.test(cnt)) {
                //handling if condition
                cnt = '"; ' + cnt.replace(matches[1], rlStr.replace(WORDIF, function (strs) {
                    return HandleSpecialCharArrObj(strs, nameSpace, localKeys, ignorePrefix);
                })) + '{ \n str = str + "';
            }
            else if (FOR_STMT.test(cnt)) {
                //handling for condition
                var rlStr_1 = matches[1].split(' of ');
                // replace for each into actual JavaScript
                // eslint-disable-next-line
                cnt = '"; ' + cnt.replace(matches[1], function (mtc) {
                    localKeys.push(rlStr_1[0]);
                    localKeys.push(rlStr_1[0] + 'Index');
                    varCOunt = varCOunt + 1;
                    // tslint:disable-next-line
                    return 'var i' + varCOunt + '=0; i' + varCOunt + ' < ' + addNameSpace(rlStr_1[1], true, nameSpace, localKeys, ignorePrefix) + '.length; i' + varCOunt + '++';
                }) + '{ \n ' + rlStr_1[0] + '= ' + addNameSpace(rlStr_1[1], true, nameSpace, localKeys, ignorePrefix)
                    + '[i' + varCOunt + ']; \n var ' + rlStr_1[0] + 'Index=i' + varCOunt + '; \n str = str + "';
            }
            else {
                //helper function handling
                var fnStr = cnt.split('(');
                // eslint-disable-next-line
                var fNameSpace = (helper && helper.hasOwnProperty(fnStr[0]) ? 'this.' : 'global');
                fNameSpace = (/\./.test(fnStr[0]) ? '' : fNameSpace);
                var ftArray = matches[1].split(',');
                if (matches[1].length !== 0 && !(/data/).test(ftArray[0]) && !(/window./).test(ftArray[0])) {
                    matches[1] = (fNameSpace === 'global' ? nameSpace + '.' + matches[1] : matches[1]);
                }
                var splRegexp = /@|\$|#/gm;
                var arrObj = /\]\./gm;
                if (WINDOWFUNC.test(cnt) && arrObj.test(cnt) || splRegexp.test(cnt)) {
                    var splArrRegexp = /@|\$|#|\]\./gm;
                    if (splArrRegexp.test(cnt)) {
                        // tslint:disable-next-line
                        cnt = '"+ ' + (fNameSpace === 'global' ? '' : fNameSpace) + cnt.replace(matches[1], rlStr.replace(WORDFUNC, function (strs) {
                            return HandleSpecialCharArrObj(strs, nameSpace, localKeys, ignorePrefix);
                        })) + '+ "';
                    }
                }
                else {
                    cnt = '" + ' + (fNameSpace === 'global' ? '' : fNameSpace) +
                        cnt.replace(rlStr, addNameSpace(matches[1].replace(/,( |)data.|,/gi, ',' + nameSpace + '.').replace(/,( |)data.window/gi, ',window'), (fNameSpace === 'global' ? false : true), nameSpace, localKeys, ignorePrefix)) +
                        '+"';
                }
            }
        }
        else if (ELSE_STMT.test(cnt)) {
            // handling else condition
            cnt = '"; ' + cnt.replace(ELSE_STMT, '} else { \n str = str + "');
            // eslint-disable-next-line
        }
        else if (!!cnt.match(IF_OR_FOR)) {
            // close condition
            cnt = cnt.replace(IF_OR_FOR, '"; \n } \n str = str + "');
        }
        else if (SPECIAL_CHAR.test(cnt)) {
            // template string with double slash with special character
            if (cnt.match(SINGLE_SLASH)) {
                cnt = SlashReplace(cnt);
            }
            cnt = '"+' + NameSpaceForspecialChar(cnt, (localKeys.indexOf(cnt) === -1), nameSpace, localKeys) + '"]+"';
        }
        else {
            // template string with double slash
            if (cnt.match(SINGLE_SLASH)) {
                cnt = SlashReplace(cnt);
                cnt = '"+' + NameSpaceForspecialChar(cnt, (localKeys.indexOf(cnt) === -1), nameSpace, localKeys) + '"]+"';
            }
            else {
                // evaluate normal expression
                cnt = '"+' + addNameSpace(cnt.replace(/,/gi, '+' + nameSpace + '.'), (localKeys.indexOf(cnt) === -1), nameSpace, localKeys, ignorePrefix) + '+"';
            }
        }
        return cnt;
    });
}
/**
 *
 * @param {string} str ?
 * @param {boolean} addNS ?
 * @param {string} nameSpace ?
 * @param {string[]} ignoreList ?
 * @param {boolean} ignorePrefix ?
 * @returns {string} ?
 */
function addNameSpace(str, addNS, nameSpace, ignoreList, ignorePrefix) {
    return ((addNS && !(NOT_NUMBER.test(str)) && ignoreList.indexOf(str.split('.')[0]) === -1 && !ignorePrefix) ? nameSpace + '.' + str : str);
}
/**
 *
 * @param {string} str ?
 * @param {boolean} addNS ?
 * @param {string} nameSpace ?
 * @param {string[]} ignoreList ?
 * @returns {string} ?
 */
function NameSpaceArrObj(str, addNS, nameSpace, ignoreList) {
    var arrObjReg = /^\..*/gm;
    return ((addNS && !(NOT_NUMBER.test(str)) &&
        ignoreList.indexOf(str.split('.')[0]) === -1 && !(arrObjReg.test(str))) ? nameSpace + '.' + str : str);
}
// // Create hashCode for template string to storeCached function
// function hashCode(str: string): string {
//     return str.split('').reduce((a: number, b: string) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0).toString();
// }
/**
 *
 * @param {string} str ?
 * @param {boolean} addNS ?
 * @param {string} nameSpace ?
 * @param {string[]} ignoreList ?
 * @returns {string} ?
 */
function NameSpaceForspecialChar(str, addNS, nameSpace, ignoreList) {
    return ((addNS && !(NOT_NUMBER.test(str)) && ignoreList.indexOf(str.split('.')[0]) === -1) ? nameSpace + '["' + str : str);
}
// eslint-disable-next-line
function SlashReplace(tempStr) {
    var double = '\\\\';
    if (tempStr.match(DOUBLE_SLASH)) {
        // eslint-disable-next-line
        tempStr = tempStr;
    }
    else {
        tempStr = tempStr.replace(SINGLE_SLASH, double);
    }
    return tempStr;
}
/**
 *
 * @param {string} str ?
 * @param {string} nameSpaceNew ?
 * @param {string[]} keys ?
 * @param {boolean} ignorePrefix ?
 * @returns {string} ?
 */
function HandleSpecialCharArrObj(str, nameSpaceNew, keys, ignorePrefix) {
    str = str.trim();
    var windowFunc = /\window\./gm;
    if (!windowFunc.test(str)) {
        var quotes = /'|"/gm;
        var splRegexp = /@|\$|#/gm;
        if (splRegexp.test(str)) {
            str = NameSpaceForspecialChar(str, (keys.indexOf(str) === -1), nameSpaceNew, keys) + '"]';
        }
        if (ARR_OBJ.test(str)) {
            return NameSpaceArrObj(str, !(quotes.test(str)) && (keys.indexOf(str) === -1), nameSpaceNew, keys);
        }
        else {
            return addNameSpace(str, !(quotes.test(str)) && (keys.indexOf(str) === -1), nameSpaceNew, keys, ignorePrefix);
        }
    }
    else {
        return str;
    }
}
