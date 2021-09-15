/**
 * PdfCacheCollection.ts class for EJ2-PDF
 */
import { Dictionary } from './../collections/dictionary';
/**
 * `Collection of the cached objects`.
 * @private
 */
var PdfCacheCollection = /** @class */ (function () {
    // Constructors
    /**
     * Initializes a new instance of the `PdfCacheCollection` class.
     * @private
     */
    function PdfCacheCollection() {
        this.referenceObjects = [];
        this.pdfFontCollection = new Dictionary();
    }
    // Public methods
    /**
     * `Searches` for the similar cached object. If is not found - adds the object to the cache.
     * @private
     */
    PdfCacheCollection.prototype.search = function (obj) {
        var result = null;
        var group = this.getGroup(obj);
        if (group == null) {
            group = this.createNewGroup();
        }
        else if (group.length > 0) {
            result = group[0];
        }
        group.push(obj);
        return result;
    };
    // Implementation
    /**
     * `Creates` a new group.
     * @private
     */
    PdfCacheCollection.prototype.createNewGroup = function () {
        var group = [];
        this.referenceObjects.push(group);
        return group;
    };
    /**
     * `Find and Return` a group.
     * @private
     */
    PdfCacheCollection.prototype.getGroup = function (result) {
        var group = null;
        if (result !== null) {
            var len = this.referenceObjects.length;
            for (var i = 0; i < len; i++) {
                if (this.referenceObjects.length > 0) {
                    var tGroup = this.referenceObjects[i];
                    if (tGroup.length > 0) {
                        var representative = tGroup[0];
                        if (result.equalsTo(representative)) {
                            group = tGroup;
                            break;
                        }
                    }
                    else {
                        this.removeGroup(tGroup);
                    }
                }
                len = this.referenceObjects.length;
            }
        }
        return group;
    };
    /**
     * Remove a group from the storage.
     */
    PdfCacheCollection.prototype.removeGroup = function (group) {
        if (group !== null) {
            var index = this.referenceObjects.indexOf(group);
            this.referenceObjects.slice(index, index + 1);
        }
    };
    PdfCacheCollection.prototype.destroy = function () {
        this.pdfFontCollection = undefined;
        this.referenceObjects = undefined;
    };
    return PdfCacheCollection;
}());
export { PdfCacheCollection };
