/**
 * PdfDictionary.ts class for EJ2-PDF
 */
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { Dictionary } from './../collections/dictionary';
import { PdfName } from './pdf-name';
import { ObjectStatus } from './../input-output/enum';
import { PdfCrossTable } from './../input-output/pdf-cross-table';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
import { PdfSectionCollection } from './../pages/pdf-section-collection';
import { PdfAnnotation } from './../annotations/annotation';
import { PdfSection, PageSettingsState } from './../pages/pdf-section';
import { PdfPage } from './../pages/pdf-page';
import { UnicodeTrueTypeFont } from './../graphics/fonts/unicode-true-type-font';
/**
 * `PdfDictionary` class is used to perform primitive operations.
 * @private
 */
export declare class PdfDictionary implements IPdfPrimitive {
    /**
     * Indicates if the object was `changed`.
     * @private
     */
    private bChanged;
    /**
     * Internal variable to store the `position`.
     * @default -1
     * @private
     */
    private position7;
    /**
     * Flag is dictionary need to `encrypt`.
     * @private
     */
    private encrypt;
    /**
     * The `IPdfSavable` with the specified key.
     * @private
     */
    private primitiveItems;
    /**
     * `Start marker` for dictionary.
     * @private
     */
    private readonly prefix;
    /**
     * `End marker` for dictionary.
     * @private
     */
    private readonly suffix;
    /**
     * @hidden
     * @private
     */
    private resources;
    /**
     * Shows the type of object `status` whether it is object registered or other status.
     * @private
     */
    private status7;
    /**
     * Indicates if the object `is currently in saving state` or not.
     * @private
     */
    private isSaving7;
    /**
     * Holds the `index` number of the object.
     * @private
     */
    private index7;
    /**
     * Internal variable to hold `cloned object`.
     * @default null
     * @private
     */
    private readonly object;
    /**
     * Flag for PDF file formar 1.5 is dictionary `archiving` needed.
     * @default true
     * @private
     */
    private archive;
    /**
     * @hidden
     * @private
     */
    private tempPageCount;
    /**
     * @hidden
     * @private
     */
    protected dictionaryProperties: DictionaryProperties;
    /**
     * Event. Raise before the object saves.
     * @public
     */
    pageBeginDrawTemplate: SaveTemplateEventHandler;
    /**
     * Event. Raise `before the object saves`.
     * @private
     */
    beginSave: SaveSectionCollectionEventHandler;
    /**
     * Event. Raise `after the object saved`.
     * @private
     */
    endSave: SaveSectionCollectionEventHandler;
    /**
     * @hidden
     * @private
     */
    sectionBeginSave: SaveSectionEventHandler;
    /**
     * @hidden
     * @private
     */
    annotationBeginSave: SaveAnnotationEventHandler;
    /**
     * @hidden
     * @private
     */
    annotationEndSave: SaveAnnotationEventHandler;
    /**
     * Event. Raise `before the object saves`.
     * @private
     */
    descendantFontBeginSave: SaveDescendantFontEventHandler;
    /**
     * Event. Raise `before the object saves`.
     * @private
     */
    fontDictionaryBeginSave: SaveFontDictionaryEventHandler;
    /**
     * Represents the Font dictionary.
     * @hidden
     * @private
     */
    isFont: boolean;
    /**
     * Gets or sets the `IPdfSavable` with the specified key.
     * @private
     */
    readonly items: Dictionary<string, IPdfPrimitive>;
    /**
     * Gets or sets the `Status` of the specified object.
     * @private
     */
    status: ObjectStatus;
    /**
     * Gets or sets a value indicating whether this document `is saving` or not.
     * @private
     */
    isSaving: boolean;
    /**
     * Gets or sets the `index` value of the specified object.
     * @private
     */
    objectCollectionIndex: number;
    /**
     * Returns `cloned object`.
     * @private
     */
    readonly clonedObject: IPdfPrimitive;
    /**
     * Gets or sets the `position` of the object.
     * @private
     */
    position: number;
    /**
     * Gets the `count`.
     * @private
     */
    readonly Count: number;
    /**
     * Collection of `items` in the object.
     * @private
     */
    readonly Dictionary: PdfDictionary;
    /**
     * Get flag if need to `archive` dictionary.
     * @private
     */
    getArchive(): boolean;
    /**
     * Set flag if need to `archive` dictionary.
     * @private
     */
    setArchive(value: boolean): void;
    /**
     * Sets flag if `encryption` is needed.
     * @private
     */
    setEncrypt(value: boolean): void;
    /**
     * Gets flag if `encryption` is needed.
     * @private
     */
    getEncrypt(): boolean;
    /**
     * Initializes a new empty instance of the `PdfDictionary` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new empty instance of the `PdfDictionary` class.
     * @private
     */
    constructor(dictionary: PdfDictionary);
    /**
     * `Freezes` the changes.
     * @private
     */
    freezeChanges(freezer: Object): void;
    /**
     * Creates a `copy of PdfDictionary`.
     * @private
     */
    clone(crossTable: PdfCrossTable): IPdfPrimitive;
    /**
     * `Mark` this instance modified.
     * @private
     */
    modify(): void;
    /**
     * `Removes` the specified key.
     * @private
     */
    remove(key: PdfName | string): void;
    /**
     * `Determines` whether the dictionary contains the key.
     * @private
     */
    containsKey(key: string | PdfName): boolean;
    /**
     * Raises event `BeginSave`.
     * @private
     */
    protected onBeginSave(): void;
    /**
     * Raises event `Font Dictionary BeginSave`.
     * @private
     */
    protected onFontDictionaryBeginSave(): void;
    /**
     * Raises event `Descendant Font BeginSave`.
     * @private
     */
    protected onDescendantFontBeginSave(): void;
    /**
     * Raises event 'BeginSave'.
     * @private
     */
    protected onTemplateBeginSave(): void;
    /**
     * Raises event `BeginSave`.
     * @private
     */
    protected onBeginAnnotationSave(): void;
    /**
     * Raises event `BeginSave`.
     * @private
     */
    protected onSectionBeginSave(writer: IPdfWriter): void;
    /**
     * `Saves` the object using the specified writer.
     * @private
     */
    save(writer: IPdfWriter): void;
    /**
     * `Saves` the object using the specified writer.
     * @private
     */
    save(writer: IPdfWriter, bRaiseEvent: boolean): void;
    /**
     * `Save dictionary items`.
     * @private
     */
    private saveItems;
}
export declare class SaveSectionCollectionEventHandler {
    /**
     * @hidden
     * @private
     */
    sender: PdfSectionCollection;
    /**
     * New instance for `save section collection event handler` class.
     * @private
     */
    constructor(sender: PdfSectionCollection);
}
export declare class SaveDescendantFontEventHandler {
    /**
     * @hidden
     * @private
     */
    sender: UnicodeTrueTypeFont;
    /**
     * New instance for `save section collection event handler` class.
     * @private
     */
    constructor(sender: UnicodeTrueTypeFont);
}
export declare class SaveFontDictionaryEventHandler {
    /**
     * @hidden
     * @private
     */
    sender: UnicodeTrueTypeFont;
    /**
     * New instance for `save section collection event handler` class.
     * @private
     */
    constructor(sender: UnicodeTrueTypeFont);
}
export declare class SaveAnnotationEventHandler {
    /**
     * @hidden
     * @private
     */
    sender: PdfAnnotation;
    /**
     * New instance for `save annotation event handler` class.
     * @private
     */
    constructor(sender: PdfAnnotation);
}
export declare class SaveSectionEventHandler {
    /**
     * @hidden
     * @private
     */
    sender: PdfSection;
    /**
     * @hidden
     * @private
     */
    state: PageSettingsState;
    /**
     * New instance for `save section event handler` class.
     * @private
     */
    constructor(sender: PdfSection, state: PageSettingsState);
}
/**
 * SaveTemplateEventHandler class used to store information about template elements.
 * @private
 * @hidden
 */
export declare class SaveTemplateEventHandler {
    /**
     * @public
     * @hidden
     */
    sender: PdfPage;
    /**
     * New instance for save section collection event handler class.
     * @public
     */
    constructor(sender: PdfPage);
}
