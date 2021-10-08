/**
 * @private
 * @hidden
 */
export function defaultToString(item) {
    // if (item === null) {
    //     return 'COLLECTION_NULL';
    // } else if (typeof item === 'undefined') {
    //     return 'COLLECTION_UNDEFINED';
    // } else if (Object.prototype.toString.call(item) === '[object String]') {
    if (Object.prototype.toString.call(item) === '[object String]') {
        return '$s' + item;
    }
    else {
        return '$o' + item.toString();
    }
}
