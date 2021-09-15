import { Dictionary } from './../collections/dictionary';
import { PdfName } from './pdf-name';
import { Operators } from './../input-output/pdf-operators';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
/**
 * `PdfDictionary` class is used to perform primitive operations.
 * @private
 */
var PdfDictionary = /** @class */ (function () {
    function PdfDictionary(dictionary) {
        /**
         * Internal variable to store the `position`.
         * @default -1
         * @private
         */
        this.position7 = -1;
        /**
         * The `IPdfSavable` with the specified key.
         * @private
         */
        this.primitiveItems = new Dictionary();
        /**
         * `Start marker` for dictionary.
         * @private
         */
        this.prefix = '<<';
        /**
         * `End marker` for dictionary.
         * @private
         */
        this.suffix = '>>';
        /**
         * @hidden
         * @private
         */
        this.resources = [];
        /**
         * Internal variable to hold `cloned object`.
         * @default null
         * @private
         */
        this.object = null;
        /**
         * Flag for PDF file formar 1.5 is dictionary `archiving` needed.
         * @default true
         * @private
         */
        this.archive = true;
        /**
         * Represents the Font dictionary.
         * @hidden
         * @private
         */
        this.isFont = false;
        if (typeof dictionary === 'undefined') {
            this.primitiveItems = new Dictionary();
            this.encrypt = true;
            this.dictionaryProperties = new DictionaryProperties();
        }
        else {
            this.primitiveItems = new Dictionary();
            var keys = dictionary.items.keys();
            var values = dictionary.items.values();
            for (var index = 0; index < dictionary.items.size(); index++) {
                this.primitiveItems.setValue(keys[index], values[index]);
            }
            this.status = dictionary.status;
            this.freezeChanges(this);
            this.encrypt = true;
            this.dictionaryProperties = new DictionaryProperties();
        }
    }
    Object.defineProperty(PdfDictionary.prototype, "items", {
        //Properties
        /**
         * Gets or sets the `IPdfSavable` with the specified key.
         * @private
         */
        get: function () {
            return this.primitiveItems;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDictionary.prototype, "status", {
        /**
         * Gets or sets the `Status` of the specified object.
         * @private
         */
        get: function () {
            return this.status7;
        },
        set: function (value) {
            this.status7 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDictionary.prototype, "isSaving", {
        /**
         * Gets or sets a value indicating whether this document `is saving` or not.
         * @private
         */
        get: function () {
            return this.isSaving7;
        },
        set: function (value) {
            this.isSaving7 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDictionary.prototype, "objectCollectionIndex", {
        /**
         * Gets or sets the `index` value of the specified object.
         * @private
         */
        get: function () {
            return this.index7;
        },
        set: function (value) {
            this.index7 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDictionary.prototype, "clonedObject", {
        /**
         * Returns `cloned object`.
         * @private
         */
        get: function () {
            return this.object;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDictionary.prototype, "position", {
        /**
         * Gets or sets the `position` of the object.
         * @private
         */
        get: function () {
            return this.position7;
        },
        set: function (value) {
            this.position7 = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDictionary.prototype, "Count", {
        /**
         * Gets the `count`.
         * @private
         */
        get: function () {
            return this.primitiveItems.size();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfDictionary.prototype, "Dictionary", {
        /**
         * Collection of `items` in the object.
         * @private
         */
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get flag if need to `archive` dictionary.
     * @private
     */
    PdfDictionary.prototype.getArchive = function () {
        return this.archive;
    };
    /**
     * Set flag if need to `archive` dictionary.
     * @private
     */
    PdfDictionary.prototype.setArchive = function (value) {
        this.archive = value;
    };
    /**
     * Sets flag if `encryption` is needed.
     * @private
     */
    PdfDictionary.prototype.setEncrypt = function (value) {
        this.encrypt = value;
        this.modify();
    };
    /**
     * Gets flag if `encryption` is needed.
     * @private
     */
    PdfDictionary.prototype.getEncrypt = function () {
        return this.encrypt;
    };
    /**
     * `Freezes` the changes.
     * @private
     */
    PdfDictionary.prototype.freezeChanges = function (freezer) {
        this.bChanged = false;
    };
    /**
     * Creates a `copy of PdfDictionary`.
     * @private
     */
    PdfDictionary.prototype.clone = function (crossTable) {
        //Need to add more codings
        var newDict = new PdfDictionary();
        return newDict;
    };
    /**
     * `Mark` this instance modified.
     * @private
     */
    PdfDictionary.prototype.modify = function () {
        this.bChanged = true;
    };
    /**
     * `Removes` the specified key.
     * @private
     */
    PdfDictionary.prototype.remove = function (key) {
        if (typeof key !== 'string') {
            this.primitiveItems.remove(key.value);
            this.modify();
        }
        else {
            this.remove(new PdfName(key));
        }
    };
    /**
     * `Determines` whether the dictionary contains the key.
     * @private
     */
    PdfDictionary.prototype.containsKey = function (key) {
        var returnValue = false;
        returnValue = this.primitiveItems.containsKey(key.toString());
        return returnValue;
    };
    /**
     * Raises event `BeginSave`.
     * @private
     */
    PdfDictionary.prototype.onBeginSave = function () {
        this.beginSave.sender.beginSave();
    };
    /**
     * Raises event `Font Dictionary BeginSave`.
     * @private
     */
    PdfDictionary.prototype.onFontDictionaryBeginSave = function () {
        this.fontDictionaryBeginSave.sender.fontDictionaryBeginSave();
    };
    /**
     * Raises event `Descendant Font BeginSave`.
     * @private
     */
    PdfDictionary.prototype.onDescendantFontBeginSave = function () {
        this.descendantFontBeginSave.sender.descendantFontBeginSave();
    };
    /**
     * Raises event 'BeginSave'.
     * @private
     */
    PdfDictionary.prototype.onTemplateBeginSave = function () {
        this.pageBeginDrawTemplate.sender.pageBeginSave();
    };
    /**
     * Raises event `BeginSave`.
     * @private
     */
    PdfDictionary.prototype.onBeginAnnotationSave = function () {
        this.annotationBeginSave.sender.beginSave();
    };
    /**
     * Raises event `BeginSave`.
     * @private
     */
    PdfDictionary.prototype.onSectionBeginSave = function (writer) {
        var saveEvent = this.sectionBeginSave;
        saveEvent.sender.beginSave(saveEvent.state, writer);
    };
    PdfDictionary.prototype.save = function (writer, bRaiseEvent) {
        if (typeof bRaiseEvent === 'undefined') {
            this.save(writer, true);
        }
        else {
            writer.write(this.prefix);
            if (typeof this.beginSave !== 'undefined') {
                this.onBeginSave();
            }
            if (typeof this.descendantFontBeginSave !== 'undefined') {
                this.onDescendantFontBeginSave();
            }
            if (typeof this.fontDictionaryBeginSave !== 'undefined') {
                this.onFontDictionaryBeginSave();
            }
            if (typeof this.annotationBeginSave !== 'undefined') {
                this.onBeginAnnotationSave();
            }
            if (typeof this.sectionBeginSave !== 'undefined') {
                this.onSectionBeginSave(writer);
            }
            if (typeof this.pageBeginDrawTemplate !== 'undefined') {
                this.onTemplateBeginSave();
            }
            // }
            if (this.Count > 0) {
                this.saveItems(writer);
            }
            writer.write(this.suffix);
            writer.write(Operators.newLine);
        }
    };
    /**
     * `Save dictionary items`.
     * @private
     */
    PdfDictionary.prototype.saveItems = function (writer) {
        writer.write(Operators.newLine);
        var keys = this.primitiveItems.keys();
        var values = this.primitiveItems.values();
        for (var index = 0; index < keys.length; index++) {
            var key = keys[index];
            var name_1 = new PdfName(key);
            name_1.save(writer);
            writer.write(Operators.whiteSpace);
            var resources = values[index];
            resources.save(writer);
            writer.write(Operators.newLine);
        }
    };
    return PdfDictionary;
}());
export { PdfDictionary };
var SaveSectionCollectionEventHandler = /** @class */ (function () {
    /**
     * New instance for `save section collection event handler` class.
     * @private
     */
    function SaveSectionCollectionEventHandler(sender) {
        this.sender = sender;
    }
    return SaveSectionCollectionEventHandler;
}());
export { SaveSectionCollectionEventHandler };
var SaveDescendantFontEventHandler = /** @class */ (function () {
    /**
     * New instance for `save section collection event handler` class.
     * @private
     */
    function SaveDescendantFontEventHandler(sender) {
        this.sender = sender;
    }
    return SaveDescendantFontEventHandler;
}());
export { SaveDescendantFontEventHandler };
var SaveFontDictionaryEventHandler = /** @class */ (function () {
    /**
     * New instance for `save section collection event handler` class.
     * @private
     */
    function SaveFontDictionaryEventHandler(sender) {
        this.sender = sender;
    }
    return SaveFontDictionaryEventHandler;
}());
export { SaveFontDictionaryEventHandler };
var SaveAnnotationEventHandler = /** @class */ (function () {
    /**
     * New instance for `save annotation event handler` class.
     * @private
     */
    function SaveAnnotationEventHandler(sender) {
        this.sender = sender;
    }
    return SaveAnnotationEventHandler;
}());
export { SaveAnnotationEventHandler };
var SaveSectionEventHandler = /** @class */ (function () {
    // constructors
    /**
     * New instance for `save section event handler` class.
     * @private
     */
    function SaveSectionEventHandler(sender, state) {
        this.sender = sender;
        this.state = state;
    }
    return SaveSectionEventHandler;
}());
export { SaveSectionEventHandler };
/**
 * SaveTemplateEventHandler class used to store information about template elements.
 * @private
 * @hidden
 */
var SaveTemplateEventHandler = /** @class */ (function () {
    /**
     * New instance for save section collection event handler class.
     * @public
     */
    function SaveTemplateEventHandler(sender) {
        this.sender = sender;
    }
    return SaveTemplateEventHandler;
}());
export { SaveTemplateEventHandler };
