import { Ajax, createElement, select, extend } from '@syncfusion/ej2-base';
import { isNullOrUndefined as isNOU, setValue, getValue } from '@syncfusion/ej2-base';
import * as events from '../base/constant';
import { createDialog, createExtDialog } from '../pop-up/dialog';
import { fileType, setNodeId, getLocaleText, setDateObject, doPasteUpdate, getParentPath, getPathObject } from '../common/utility';
import { generatePath } from '../common/utility';
/**
 * Function to read the content from given path in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} event - specifies the event.
 * @param {string} path - specifies the path.
 * @returns {void}
 * @private
 */
export function read(parent, event, path) {
    // eslint-disable-next-line
    var itemData = parent.itemData;
    for (var i = 0; i < itemData.length; i++) {
        if (isNOU(getValue('hasChild', itemData[i]))) {
            setValue('hasChild', false, itemData[i]);
        }
    }
    // eslint-disable-next-line
    var data = { action: 'read', path: path, showHiddenItems: parent.showHiddenItems, data: itemData };
    createAjax(parent, data, readSuccess, event);
}
/**
 * Function to create new folder in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} itemName - specifies the item name.
 * @returns {void}
 * @private
 */
export function createFolder(parent, itemName) {
    // eslint-disable-next-line
    var data = { action: 'create', path: parent.path, name: itemName, data: parent.itemData };
    createAjax(parent, data, createSuccess, itemName);
}
/**
 * Function to filter the files in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string}  event - specifies the event.
 * @returns {void}
 * @private
 */
export function filter(parent, event) {
    // eslint-disable-next-line
    var data = { action: 'filter', path: parent.path, showHiddenItems: parent.showHiddenItems, data: [getPathObject(parent)] };
    // eslint-disable-next-line
    var filterData;
    // eslint-disable-next-line
    var filterDataVal = parent.filterData ? extend(filterData, data, parent.filterData) : data;
    createAjax(parent, filterDataVal, filterSuccess, event, getValue('action', filterDataVal));
}
/**
 * Function to rename the folder/file in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} path - specifies the path.
 * @param {string} itemNewName - specifies the item's new name.
 * @returns {void}
 * @private
 */
export function rename(parent, path, itemNewName) {
    var name;
    var newName;
    if (parent.breadcrumbbarModule.searchObj.element.value === '' && !parent.isFiltered) {
        name = parent.currentItemText;
        newName = itemNewName;
    }
    else {
        var fPath = parent.filterPath;
        if (parent.hasId) {
            name = parent.currentItemText;
            newName = itemNewName;
        }
        else {
            fPath = fPath.replace(/\\/g, '/');
            name = fPath.replace(path, '') + parent.currentItemText;
            newName = fPath.replace(path, '') + itemNewName;
        }
    }
    // eslint-disable-next-line
    var data = {
        action: 'rename', path: path, name: name, newName: newName, data: parent.itemData
    };
    createAjax(parent, data, renameSuccess, path);
}
/**
 * Function to paste file's and folder's in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} path - specifies the path.
 * @param {string[]} names - specifies the names.
 * @param {string} targetPath - specifies the target path.
 * @param {string} pasteOperation - specifies the paste operation.
 * @param {string[]} renameItems - specifies the rename items.
 * @param {Object[]} actionRecords - specifies the action records.
 * @returns {void}
 * @private
 */
export function paste(parent, path, names, targetPath, pasteOperation, 
// eslint-disable-next-line
renameItems, actionRecords) {
    // eslint-disable-next-line
    var data = {
        action: pasteOperation, path: path, targetData: parent.itemData[0],
        targetPath: targetPath, names: names, renameFiles: renameItems, data: actionRecords
    };
    parent.destinationPath = targetPath;
    createAjax(parent, data, pasteSuccess, path, pasteOperation, targetPath);
}
/**
 * Function to delete file's and folder's in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string[]} items - specifies the items.
 * @param {string} path - specifies the path.
 * @param {string} operation - specifies the operation.
 * @returns {void}
 * @private
 */
export function Delete(parent, items, path, operation) {
    // eslint-disable-next-line
    var data = { action: operation, path: path, names: items, data: parent.itemData };
    createAjax(parent, data, deleteSuccess, path);
}
/* istanbul ignore next */
/**
 * Function to get details of file's and folder's in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string[]} names - specifies the names.
 * @param {string} path - specifies the path.
 * @param {string} operation - specifies the operation data.
 * @returns {void}
 * @private
 */
export function GetDetails(parent, names, path, operation) {
    // eslint-disable-next-line
    var data = { action: operation, path: path, names: names, data: parent.itemData };
    createAjax(parent, data, detailsSuccess, path, operation);
}
/**
 * Function for createAjax in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {Object} data - specifies the data.
 * @param {Function} fn - specifies the fn.
 * @param {string} event - specifies the event.
 * @param {string} operation - specifies the operation.
 * @param {string} targetPath - specifies the target path.
 * @returns {void}
 * @private
 */
function createAjax(
// eslint-disable-next-line
parent, data, fn, event, operation, targetPath) {
    // eslint-disable-next-line
    var ajaxSettings = {
        url: parent.ajaxSettings.url,
        type: 'POST',
        mode: true,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        onSuccess: null,
        onFailure: null,
        beforeSend: null
    };
    var eventArgs = { action: getValue('action', data), ajaxSettings: ajaxSettings, cancel: false };
    parent.trigger('beforeSend', eventArgs, function (beforeSendArgs) {
        if (!beforeSendArgs.cancel) {
            parent.notify(events.beforeRequest, {});
            var ajax = new Ajax({
                url: getValue('url', beforeSendArgs.ajaxSettings),
                type: getValue('type', beforeSendArgs.ajaxSettings),
                mode: getValue('mode', beforeSendArgs.ajaxSettings),
                dataType: getValue('dataType', beforeSendArgs.ajaxSettings),
                contentType: getValue('contentType', beforeSendArgs.ajaxSettings),
                data: getValue('data', beforeSendArgs.ajaxSettings),
                beforeSend: getValue('beforeSend', beforeSendArgs.ajaxSettings),
                onSuccess: function (result) {
                    if (isNOU(result)) {
                        var result_1 = {
                            error: {
                                fileExists: null,
                                message: getLocaleText(parent, 'Server-Error') + ' ' + parent.ajaxSettings.url,
                                code: '406'
                            },
                            files: null
                        };
                        triggerAjaxFailure(parent, beforeSendArgs, fn, result_1, event, operation, targetPath);
                        return;
                    }
                    if (typeof (result) === 'string') {
                        result = JSON.parse(result);
                    }
                    parent.notify(events.afterRequest, { action: 'success' });
                    var id = parent.expandedId ? parent.expandedId : parent.pathId[parent.pathId.length - 1];
                    if (!isNOU(result.cwd) && (getValue('action', data) === 'read')) {
                        result.cwd.name = (parent.pathId.length === 1) ? (parent.rootAliasName || result.cwd.name) : result.cwd.name;
                        setValue('_fm_id', id, result.cwd);
                        setValue(id, result.cwd, parent.feParent);
                        if (!isNOU(result.files) || result.error.code === '401') {
                            if ((event === 'finalize-end' || event === 'initial-end') && parent.pathNames.length === 0) {
                                // eslint-disable-next-line
                                var root = getValue(parent.pathId[0], parent.feParent);
                                parent.pathNames[0] = getValue('name', root);
                                parent.hasId = !isNOU(getValue('id', root));
                            }
                            if (event === 'finalize-end') {
                                generatePath(parent);
                            }
                        }
                    }
                    if (!isNOU(result.files)) {
                        setDateObject(result.files);
                        for (var i = 0, len = result.files.length; i < len; i++) {
                            // eslint-disable-next-line
                            var item = result.files[i];
                            setValue('_fm_iconClass', fileType(item), item);
                        }
                        if (getValue('action', data) === 'read') {
                            setNodeId(result, id);
                            setValue(id, result.files, parent.feFiles);
                        }
                    }
                    if (!isNOU(result.details) && !isNOU(parent.rootAliasName)) {
                        var rootName = parent.rootAliasName || getValue('name', result.details);
                        var location_1 = getValue('location', result.details).replace(new RegExp('/', 'g'), '\\');
                        if ((getValue('path', data) === '/') || (parent.hasId && getValue('path', data).match(/[/]/g).length === 1)) {
                            if (getValue('names', data).length === 0) {
                                setValue('name', rootName, result.details);
                                location_1 = rootName;
                            }
                            else {
                                location_1 = location_1.replace(location_1.substring(0, location_1.indexOf('\\')), rootName);
                            }
                        }
                        else {
                            location_1 = location_1.replace(location_1.substring(0, location_1.indexOf('\\')), rootName);
                        }
                        setValue('location', location_1, result.details);
                    }
                    fn(parent, result, event, operation, targetPath);
                    if (!isNOU(result.files) && (event === 'path-changed' || event === 'finalize-end' || event === 'open-end')) {
                        parent.notify(events.searchTextChange, result);
                    }
                    if (typeof getValue('onSuccess', beforeSendArgs.ajaxSettings) === 'function') {
                        getValue('onSuccess', beforeSendArgs.ajaxSettings)();
                    }
                },
                onFailure: function () {
                    var result = {
                        files: null,
                        error: {
                            code: '404',
                            message: getLocaleText(parent, 'Network-Error') + ' ' + parent.ajaxSettings.url,
                            fileExists: null
                        }
                    };
                    triggerAjaxFailure(parent, beforeSendArgs, fn, result, event, operation, targetPath);
                }
            });
            ajax.send();
        }
    });
}
/**
 * Function for trigger Ajax failure in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {BeforeSendEventArgs} beforeSendArgs - specifies the beforeSendArgs.
 * @param {Function} fn - specifies the function.
 * @param {ReadArgs} result - specifies the result.
 * @param {string} event - specifies the event.
 * @param {string} operation - specifies the operation.
 * @param {string} targetPath - specifies the targetPath.
 * @returns {void}
 * @private
 */
function triggerAjaxFailure(
// eslint-disable-next-line
parent, beforeSendArgs, fn, result, event, operation, targetPath) {
    parent.notify(events.afterRequest, { action: 'failure' });
    fn(parent, result, event, operation, targetPath);
    if (typeof getValue('onFailure', beforeSendArgs.ajaxSettings) === 'function') {
        getValue('onFailure', beforeSendArgs.ajaxSettings)();
    }
}
/**
 * Function for read success in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {ReadArgs} result - specifies the result.
 * @param {string} event - specifies the event.
 * @returns {void}
 * @private
 */
function readSuccess(parent, result, event) {
    if (!isNOU(result.files)) {
        parent.notify(event, result);
        parent.notify(events.selectionChanged, {});
        var args = { action: 'read', result: result };
        parent.trigger('success', args);
    }
    else {
        if (result.error.code === '401') {
            result.files = [];
            parent.notify(event, result);
            parent.notify(events.selectionChanged, {});
        }
        onFailure(parent, result, 'read');
    }
    if (parent.isDragDrop && parent.isDropEnd) {
        if (parent.droppedObjects.length !== 0) {
            var args = { fileDetails: parent.droppedObjects };
            parent.trigger('fileDropped', args);
        }
        parent.isDropEnd = parent.isDragDrop = false;
    }
}
/**
 * Function for filter success in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {ReadArgs} result - specifies the result.
 * @param {string} event - specifies the event.
 * @param {string} action - specifies the action.
 * @returns {void}
 * @private
 */
function filterSuccess(parent, result, event, action) {
    if (!isNOU(result.files)) {
        parent.notify(event, result);
        var args = { action: action, result: result };
        parent.trigger('success', args);
    }
    else {
        onFailure(parent, result, action);
    }
}
/* istanbul ignore next */
/**
 * Function for create success in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {ReadArgs} result - specifies the result.
 * @param {string} itemName - specifies the item name.
 * @returns {void}
 * @private
 */
function createSuccess(parent, result, itemName) {
    if (!isNOU(result.files)) {
        if (parent.dialogObj && parent.dialogObj.visible) {
            parent.dialogObj.hide();
        }
        parent.createdItem = result.files[0];
        parent.breadcrumbbarModule.searchObj.value = '';
        var args = { action: 'create', result: result };
        parent.trigger('success', args);
        parent.itemData = [getPathObject(parent)];
        read(parent, events.createEnd, parent.path);
    }
    else {
        if (result.error.code === '400') {
            if (parent.dialogObj && parent.dialogObj.visible) {
                var ele = select('#newname', parent.dialogObj.element);
                var error = getLocaleText(parent, 'Validation-NewFolder-Exists').replace('{0}', '"' + ele.value + '"');
                ele.parentElement.nextElementSibling.innerHTML = error;
            }
            else {
                var result_2 = {
                    files: null,
                    error: {
                        code: '400',
                        message: getLocaleText(parent, 'Validation-NewFolder-Exists').replace('{0}', '"' + itemName + '"'),
                        fileExists: null
                    }
                };
                createDialog(parent, 'Error', result_2);
            }
            var args = { action: 'create', error: result.error };
            parent.trigger('failure', args);
        }
        else {
            if (parent.dialogObj && parent.dialogObj.visible) {
                parent.dialogObj.hide();
            }
            onFailure(parent, result, 'create');
        }
    }
}
/* istanbul ignore next */
/**
 * Function to rename the folder/file in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {ReadArgs} result - specifies the result.
 * @param {string} path - specifies the path
 * @returns {void}
 * @private
 */
function renameSuccess(parent, result, path) {
    if (!isNOU(result.files)) {
        if (!isNOU(parent.dialogObj)) {
            parent.dialogObj.hide();
        }
        var args = { action: 'rename', result: result };
        parent.trigger('success', args);
        parent.renamedItem = result.files[0];
        if (parent.activeModule === 'navigationpane') {
            parent.pathId.pop();
            parent.itemData = [getValue(parent.pathId[parent.pathId.length - 1], parent.feParent)];
            read(parent, events.renameEndParent, getParentPath(parent.path));
        }
        else {
            parent.itemData = [getPathObject(parent)];
            if (parent.breadcrumbbarModule.searchObj.value !== '') {
                Search(parent, events.renameEnd, parent.path, parent.searchWord, parent.showHiddenItems, !parent.searchSettings.ignoreCase);
            }
            else {
                if (parent.isFiltered) {
                    filter(parent, events.renameEnd);
                }
                else {
                    read(parent, events.renameEnd, parent.path);
                }
            }
        }
    }
    else {
        if (result.error.code === '400' && parent.dialogObj && parent.dialogObj.visible) {
            var ele = select('#rename', parent.dialogObj.element);
            var error = getLocaleText(parent, 'Validation-Rename-Exists').replace('{0}', '"' + parent.currentItemText + '"');
            error = error.replace('{1}', '"' + ele.value + '"');
            ele.parentElement.nextElementSibling.innerHTML = error;
            var args = { action: 'rename', error: result.error };
            parent.trigger('failure', args);
        }
        else {
            if (!isNOU(parent.dialogObj)) {
                parent.dialogObj.hide();
            }
            onFailure(parent, result, 'rename');
        }
    }
}
/* istanbul ignore next */
/**
 * Function to create new folder in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {ReadArgs} result - specifies the result.
 * @param {string} path - specifies the path.
 * @param {string} operation - specifies the operation.
 * @returns {void}
 * @private
 */
function pasteSuccess(parent, result, path, operation) {
    if (result.error && result.error.fileExists) {
        parent.fileLength = 0;
        if (!isNOU(result.files)) {
            parent.isPasteError = true;
            doPasteUpdate(parent, operation, result);
        }
        createExtDialog(parent, 'DuplicateItems', result.error.fileExists);
        if (result.error.code === '404') {
            createDialog(parent, 'Error', result);
        }
    }
    else if (!result.error && !isNOU(result.files)) {
        parent.isPasteError = false;
        doPasteUpdate(parent, operation, result);
    }
    else if (result.error && !isNOU(result.files)) {
        parent.isPasteError = true;
        doPasteUpdate(parent, operation, result);
        createDialog(parent, 'Error', result);
    }
    else {
        onFailure(parent, result, operation);
    }
}
/**
 * Function to delete success in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {ReadArgs} result - specifies the result.
 * @param {string} path - specifies the path.
 * @returns {void}
 * @private
 */
function deleteSuccess(parent, result, path) {
    if (!isNOU(result.files)) {
        parent.setProperties({ path: path }, true);
        parent.itemData = [getPathObject(parent)];
        read(parent, events.deleteEnd, parent.path);
        if (result.error) {
            onFailure(parent, result, 'delete');
        }
        else {
            var args = { action: 'delete', result: result };
            parent.trigger('success', args);
        }
    }
    else {
        onFailure(parent, result, 'delete');
    }
}
/**
 * Function for details success in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {ReadArgs} result - specifies the result.
 * @param {string} path - specifies the path.
 * @param {string} operation - specifies the operation.
 * @returns {void}
 * @private
 */
function detailsSuccess(
// eslint:disable-next-line
parent, result, path, operation) {
    if (!isNOU(result.details)) {
        createDialog(parent, operation, null, result.details);
        var args = { action: 'details', result: result };
        parent.trigger('success', args);
    }
    else {
        onFailure(parent, result, 'details');
    }
}
/**
 * Function for on failure event in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {ReadArgs} result - specifies the result.
 * @param {string} action - specifies the action.
 * @returns {void}
 * @private
 */
function onFailure(parent, result, action) {
    createDialog(parent, 'Error', result);
    var args = { action: action, error: result.error };
    parent.trigger('failure', args);
}
/**
 * Function for search in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} event - specifies the event.
 * @param {string} path - specifies the path.
 * @param {string} searchString - specifies the search string.
 * @param {boolean} showHiddenItems - specifies the hidden items.
 * @param {boolean} caseSensitive - specifies the casing of search text.
 * @returns {void}
 * @private
 */
export function Search(
// eslint:disable-next-line
parent, event, path, searchString, showHiddenItems, caseSensitive) {
    // eslint-disable-next-line
    var data = {
        action: 'search', path: path, searchString: searchString, showHiddenItems: showHiddenItems, caseSensitive: caseSensitive,
        data: parent.itemData
    };
    createAjax(parent, data, searchSuccess, event);
}
/* istanbul ignore next */
/**
 * Function for search success in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {ReadArgs} result - specifies the result.
 * @param {string} event - specifies the event.
 * @returns {void}
 * @private
 */
function searchSuccess(parent, result, event) {
    if (!isNOU(result.files)) {
        parent.notify(event, result);
        var args = { action: 'search', result: result };
        parent.trigger('success', args);
    }
    else {
        onFailure(parent, result, 'search');
    }
}
/* istanbul ignore next */
/**
 * Function for download in File Manager.
 *
 * @param {IFileManager} parent - specifies the parent element.
 * @param {string} path - specifies the path.
 * @param {string[]} items - specifies the items.
 * @returns {void}
 * @private
 */
export function Download(parent, path, items) {
    var downloadUrl = parent.ajaxSettings.downloadUrl ? parent.ajaxSettings.downloadUrl : parent.ajaxSettings.url;
    // eslint-disable-next-line
    var data = { 'action': 'download', 'path': path, 'names': items, 'data': parent.itemData };
    var eventArgs = { data: data, cancel: false };
    parent.trigger('beforeDownload', eventArgs, function (downloadArgs) {
        if (!downloadArgs.cancel) {
            var form = createElement('form', {
                id: parent.element.id + '_downloadForm',
                attrs: { action: downloadUrl, method: 'post', name: 'downloadForm', 'download': '' }
            });
            var input = createElement('input', {
                id: parent.element.id + '_hiddenForm',
                attrs: { name: 'downloadInput', value: JSON.stringify(downloadArgs.data), type: 'hidden' }
            });
            form.appendChild(input);
            parent.element.appendChild(form);
            document.forms.namedItem('downloadForm').submit();
            parent.element.removeChild(form);
        }
    });
}
