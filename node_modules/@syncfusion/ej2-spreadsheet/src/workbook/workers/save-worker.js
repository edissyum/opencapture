/**
 * @hidden
 * The `SaveWorker` module is used to perform save functionality with Web Worker.
 */
var SaveWorker = /** @class */ (function () {
    /**
     * Constructor for SaveWorker module in Workbook library.
     *
     * @private
     * @param {Workbook} parent - Specifies the workbook.
     */
    function SaveWorker(parent) {
        this.parent = parent;
    }
    /**
     * Process sheet.
     *
     * @param {string} sheet - specify the sheet
     * @param {number} sheetIndex - specify the sheetIndex
     * @returns {Object} - Process sheet.
     * @hidden
     */
    SaveWorker.prototype.processSheet = function (sheet, sheetIndex) {
        var parsedSheet = JSON.parse(sheet, function (key, value) {
            //Remove empty properties
            if ((Array.isArray(value) || typeof value === 'string') && !value.length) {
                return undefined;
            }
            return value;
        });
        return [sheetIndex, parsedSheet];
    };
    /**
     * Process save action.
     *
     * @param {Object} saveJSON - specify the object
     * @param {SaveOptions | Object} saveSettings - specify the saveSettings
     * @param {Object} customParams - specify the customParams
     * @returns {void} - Process save action.
     * @hidden
     */
    SaveWorker.prototype.processSave = function (saveJSON, saveSettings, customParams) {
        var formData = new FormData();
        var i;
        var keys = Object.keys(saveSettings);
        formData.append('JSONData', JSON.stringify(saveJSON));
        for (i = 0; i < keys.length; i++) {
            formData.append(keys[i], saveSettings[keys[i]]);
        }
        keys = Object.keys(customParams);
        for (i = 0; i < keys.length; i++) {
            formData.append(keys[i], customParams[keys[i]]);
        }
        fetch(saveSettings.url, { method: 'POST', body: formData })
            .then(function (response) {
            if (response.ok) {
                return response.blob();
            }
            else {
                return Promise.reject({
                    message: response.statusText
                });
            }
        })
            .then(function (data) {
            new Promise(function (resolve) {
                var reader = new FileReader();
                reader.onload = function () {
                    var result = reader.result.toString();
                    if (result.indexOf('data:text/plain;base64,') > -1 || result.indexOf('data:text/html;base64,') > -1 ||
                        result.indexOf('data:application/json;base64,') > -1) {
                        var str = void 0;
                        result = result.replace('data:text/plain;base64,', '');
                        result = result.replace('data:text/html;base64,', '');
                        if (result.indexOf('data:application/json;base64,') > -1) {
                            result = result.replace('data:application/json;base64,', '');
                            str = atob(result).split('.');
                        }
                        else {
                            str = atob(result).split(/(\r\n|\n|\r)/gm);
                        }
                        if (str.length) {
                            var text = str[0].length > 1 && str[0][0] === '"' ? str[0].split('"')[1] + '.' : str[0];
                            postMessage({ dialog: text });
                        }
                    }
                    else {
                        postMessage(data);
                    }
                    resolve(reader.result);
                };
                reader.readAsDataURL(data);
            });
        })
            .catch(function (error) {
            postMessage({ error: error.message });
        });
        // try {
        //     let httpRequest: XMLHttpRequest = new XMLHttpRequest();
        //     let formData: FormData = new FormData();
        //     let i: number;
        //     let keys: string[] = Object.keys(saveSettings);
        //     httpRequest.onreadystatechange = (event: Event) => {
        //         if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        //             (postMessage as Function)(httpRequest.response);
        //         }
        //     };
        //     httpRequest.onerror = (event: Event) => {
        //         (postMessage as Function)(event);
        //     };
        //     formData.append('JSONData', JSON.stringify(saveJSON));
        //     for (i = 0; i < keys.length; i++) {
        //         formData.append(keys[i], (<{ [key: string]: string }>saveSettings)[keys[i]]);
        //     }
        //     httpRequest.open('POST', saveSettings.saveUrl, false);
        //     httpRequest.send(formData);
        // } catch (e) {
        //     (postMessage as Function)({ error: e.message });
        // }
    };
    return SaveWorker;
}());
export { SaveWorker };
