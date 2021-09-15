var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * PdfPageLayerCollection.ts class for EJ2-PDF
 */
import { PdfPageBase } from './pdf-page-base';
import { PdfDictionary } from './../primitives/pdf-dictionary';
import { PdfPageLayer } from './pdf-page-layer';
import { PdfCollection } from './../general/pdf-collection';
import { PdfReferenceHolder } from './../primitives/pdf-reference';
import { PdfStream } from './../primitives/pdf-stream';
/**
 * The class provides methods and properties to handle the collections of `PdfPageLayer`.
 */
var PdfPageLayerCollection = /** @class */ (function (_super) {
    __extends(PdfPageLayerCollection, _super);
    function PdfPageLayerCollection(page) {
        var _this = _super.call(this) || this;
        /**
         * Stores the `number of first level layers` in the document.
         * @default 0
         * @private
         */
        _this.parentLayerCount = 0;
        /**
         * Indicates if `Sublayer` is present.
         * @default false
         * @private
         */
        _this.sublayer = false;
        /**
         * Stores the `optional content dictionary`.
         * @private
         */
        _this.optionalContent = new PdfDictionary();
        if (page instanceof PdfPageBase) {
            // if (page == null) {
            //     throw new Error('ArgumentNullException:page');
            // }
            _this.page = page;
            var lPage = page;
            // if (lPage != null) {
            _this.parseLayers(lPage);
            // }
        }
        return _this;
    }
    PdfPageLayerCollection.prototype.items = function (index, value) {
        if (typeof index === 'number' && typeof value === 'undefined') {
            var obj = this.list[index];
            return obj;
        }
        else {
            if (value == null) {
                throw new Error('ArgumentNullException: layer');
            }
            if (value.page !== this.page) {
                throw new Error('ArgumentException: The layer belongs to another page');
            }
            // // Add/remove the layer.
            // let layer : PdfPageLayer = this.items(index);
            // if (layer != null) {
            //     this.RemoveLayer(layer);
            // }
            // this.List[index] = value;
            // this.InsertLayer(index, value);
        }
    };
    PdfPageLayerCollection.prototype.add = function (firstArgument, secondArgument) {
        if (typeof firstArgument === 'undefined') {
            var layer = new PdfPageLayer(this.page);
            layer.name = '';
            this.add(layer);
            return layer;
        }
        else if (firstArgument instanceof PdfPageLayer) {
            // if (layer == null)
            //     throw new ArgumentNullException("layer");
            // if (layer.Page != m_page)
            //     throw new ArgumentException("The layer belongs to another page");
            var index = this.list.push(firstArgument);
            // Register layer.
            this.addLayer(index, firstArgument);
            return index;
        }
        else {
            return 0;
        }
    };
    /**
     * Registers `layer` at the page.
     * @private
     */
    PdfPageLayerCollection.prototype.addLayer = function (index, layer) {
        var reference = new PdfReferenceHolder(layer);
        this.page.contents.add(reference);
    };
    // private RemoveLayer(layer : PdfPageLayer) : void {
    //     if (layer == null) {
    //         throw new Error('ArgumentNullException:layer');
    //     }
    //     let reference : PdfReferenceHolder = new PdfReferenceHolder(layer);
    //     if (this.page != null) {
    //         this.page.Contents.Remove(reference);
    //     }
    // }
    /**
     * Inserts `PdfPageLayer` into the collection at specified index.
     * @private
     */
    PdfPageLayerCollection.prototype.insert = function (index, layer) {
        // if (index < 0)
        //     throw new ArgumentOutOfRangeException("index", "Value can not be less 0");
        // if (layer == null)
        //     throw new ArgumentNullException("layer");
        // if (layer.Page != m_page)
        //     throw new ArgumentException("The layer belongs to another page");
        var list = [];
        var length = this.list.length;
        for (var i = index; i < length; i++) {
            list.push(this.list.pop());
        }
        this.list.push(layer);
        for (var i = 0; i < list.length; i++) {
            this.list.push(list[i]);
        }
        // Register layer.
        this.insertLayer(index, layer);
    };
    /**
     * Registers layer at the page.
     * @private
     */
    PdfPageLayerCollection.prototype.insertLayer = function (index, layer) {
        if (layer == null) {
            throw new Error('ArgumentNullException:layer');
        }
        var reference = new PdfReferenceHolder(layer);
        this.page.contents.insert(index, reference);
    };
    // tslint:disable
    /**
     * `Parses the layers`.
     * @private
     */
    PdfPageLayerCollection.prototype.parseLayers = function (loadedPage) {
        // if (loadedPage == null) {
        //     throw new Error('ArgumentNullException:loadedPage');
        // }
        var contents = this.page.contents;
        var resource = this.page.getResources();
        var crossTable = null;
        var ocproperties = null;
        var propertie = null;
        var isLayerAdded = false;
        // if (loadedPage instanceof PdfPage) {
        crossTable = loadedPage.crossTable;
        // } else {
        //     crossTable = (loadedPage as PdfLoadedPage).CrossTable;
        //     Propertie = PdfCrossTable.Dereference(Resource[DictionaryProperties.Properties]) as PdfDictionary;
        //     ocproperties = PdfCrossTable.Dereference((loadedPage as PdfLoadedPage).
        //     Document.Catalog[DictionaryProperties.OCProperties]) as PdfDictionary;
        // }
        var saveStream = new PdfStream();
        var restoreStream = new PdfStream();
        var saveState = 'q';
        var newLine = '\n';
        var restoreState = 'Q';
        // for (let index : number = 0; index < contents.Items.length; index++) {
        //     let obj : IPdfPrimitive = contents[index];
        //     let stream : PdfStream = crossTable.GetObject(obj) as PdfStream;
        //     if (stream == null)
        //         throw new PdfDocumentException("Invalid contents array.");
        //     // if (stream.Compress)
        //     {
        //         if (!loadedPage.Imported)
        //             stream.Decompress();
        //     }
        //     byte[] contentId = stream.Data;
        //     string str = PdfString.ByteToString(contentId);
        //     if (!loadedPage.Imported && (contents.Count == 1) && ((stream.Data[stream.Data.Length - 2] ==
        //     RestoreState) || (stream.Data[stream.Data.Length - 1] == RestoreState)))
        //     {
        //         byte[] content = stream.Data;
        //         byte[] data = new byte[content.Length + 4];
        //         data[0] = SaveState;
        //         data[1] = NewLine;
        //         content.CopyTo(data, 2);
        //         data[data.Length - 2] = NewLine;
        //         data[data.Length - 1] = RestoreState;
        //         stream.Data = data;
        //     }
        //     if (ocproperties != null)
        //     {
        //         if (Propertie != null)
        //         {
        //             foreach (KeyValuePair<PdfName, IPdfPrimitive> prop in Propertie.Items)
        //             {
        //                 String Key = prop.Key.ToString();
        //                 PdfReferenceHolder refh = prop.Value as PdfReferenceHolder;
        //                 PdfDictionary Dict = null;
        //                 if (refh != null)
        //                 {
        //                     Dict = refh.Object as PdfDictionary;
        //                 }
        //                 else
        //                 {
        //                     Dict = prop.Value as PdfDictionary;
        //                 }
        //                 PdfDictionary m_usage = PdfCrossTable.Dereference(Dict[DictionaryProperties.Usage]) as PdfDictionary;
        //                 if (m_usage != null)
        //                 {
        //                     if (str.Contains(Key))
        //                     {
        //                         PdfPageLayer layer = new PdfPageLayer(loadedPage, stream);
        //                         PdfDictionary printoption = PdfCrossTable.Dereference(m_usage[DictionaryProperties.Print])
        //                         as PdfDictionary;
        //                         if (printoption != null)
        //                         {
        //                             layer.m_printOption = printoption;
        //                             foreach (KeyValuePair<PdfName, IPdfPrimitive> value in printoption.Items)
        //                             {
        //                                 if (value.Key.Value.Equals(DictionaryProperties.PrintState))
        //                                 {
        //                                     string printState = (value.Value as PdfName).Value;
        //                                     if (printState.Equals(DictionaryProperties.OCGON))
        //                                     {
        //                                         layer.PrintState = PdfPrintState.AlwaysPrint;
        //                                         break;
        //                                     }
        //                                     else
        //                                     {
        //                                         layer.PrintState = PdfPrintState.NeverPrint;
        //                                         break;
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                         PdfString layerName = PdfCrossTable.Dereference(Dict[DictionaryProperties.Name]) as PdfString;
        //                         layer.Name = layerName.Value;
        //                         List.add(layer);
        //                         isLayerAdded = true;
        //                         if(!str.Contains("EMC"))
        //                         break;
        //                     }
        //                 }
        //                 else
        //                 {
        //                     if (str.Contains(Key))
        //                     {
        //                         PdfPageLayer layer = new PdfPageLayer(loadedPage, stream);
        //                         List.add(layer);
        //                         if(Dict.ContainsKey(DictionaryProperties.Name))
        //                         {
        //                         PdfString layerName = PdfCrossTable.Dereference(Dict[DictionaryProperties.Name]) as PdfString;
        //                         layer.Name = layerName.Value;
        //                         }
        //                         isLayerAdded = true;
        //                         break;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     if (!isLayerAdded)
        //     {
        //         PdfPageLayer layer = new PdfPageLayer(loadedPage, stream);
        //         List.add(layer);
        //     }
        //     else
        //         isLayerAdded = false;
        // }
        var saveData = [];
        saveData.push(saveState);
        saveStream.data = saveData;
        contents.insert(0, new PdfReferenceHolder(saveStream));
        saveData = [];
        saveData.push(restoreState);
        restoreStream.data = saveData;
        contents.insert(contents.count, new PdfReferenceHolder(restoreStream));
    };
    /**
     * Returns `index of` the `PdfPageLayer` in the collection if exists, -1 otherwise.
     * @private
     */
    PdfPageLayerCollection.prototype.indexOf = function (layer) {
        if (layer == null) {
            throw new Error('ArgumentNullException: layer');
        }
        var index = this.list.indexOf(layer);
        return index;
    };
    return PdfPageLayerCollection;
}(PdfCollection));
export { PdfPageLayerCollection };
