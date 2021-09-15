import { Rect } from '../../primitives/rect';
import { Quad } from './quad';
/**
 * Spatial search module helps to effectively find the objects over diagram
 */
var SpatialSearch = /** @class */ (function () {
    /**
     *  Constructor for creating the spatial search
     *
     * @param {number} objectTable The objectTable.
     * @private
     */
    function SpatialSearch(objectTable) {
        this.quadSize = 500;
        this.objectTable = objectTable;
        this.parentQuad = new Quad(0, 0, this.quadSize * 2, this.quadSize * 2, this);
        this.pageLeft = Number.MAX_VALUE;
        this.pageRight = -Number.MAX_VALUE;
        this.pageTop = Number.MAX_VALUE;
        this.pageBottom = -Number.MAX_VALUE;
        this.quadTable = {};
    }
    /**
     * removeFromAQuad method\
     *
     * @returns {void}    removeFromAQuad method .\
     * @param {IGroupable} node - provide the options value.
     * @private
     */
    SpatialSearch.prototype.removeFromAQuad = function (node) {
        if (this.quadTable[node.id]) {
            var quad = this.quadTable[node.id];
            var index = this.objectIndex(quad.objects, node);
            if (index !== -1) {
                quad.objects.splice(index, 1);
                this.update(quad);
                delete this.quadTable[node.id];
            }
        }
    };
    SpatialSearch.prototype.update = function (quad) {
        if (quad.parent && quad.objects.length === 0 && quad.first && quad.second && quad.third && quad.fourth) {
            var parent_1 = quad.parent;
            if (parent_1.first === quad) {
                parent_1.first = null;
            }
            else if (parent_1.second === quad) {
                parent_1.second = null;
            }
            else if (parent_1.third === quad) {
                parent_1.third = null;
            }
            else if (parent_1.fourth === quad) {
                parent_1.fourth = null;
            }
            this.update(quad.parent);
        }
        else {
            if (quad === this.parentQuad && !quad.first && !quad.second && !quad.third && !quad.fourth) {
                quad.left = 0;
                quad.width = 1000;
                quad.top = 0;
                quad.height = 1000;
            }
            return;
        }
    };
    SpatialSearch.prototype.addIntoAQuad = function (node) {
        var quad = this.parentQuad.addIntoAQuad(node);
        this.quadTable[node.id] = quad;
    };
    SpatialSearch.prototype.objectIndex = function (objects, node) {
        for (var i = 0; i < objects.length; i++) {
            if ((objects[i]).id === node.id) {
                return i;
            }
        }
        return -1;
    };
    SpatialSearch.prototype.updateQuad = function (node) {
        this.setCurrentNode(node);
        var nodBounds = node.outerBounds;
        if (!(!isNaN(nodBounds.x) && !isNaN(nodBounds.y) &&
            !isNaN(nodBounds.width) && !isNaN(nodBounds.height))) {
            return false;
        }
        //nodBounds = new Rect(nodBounds.X.Valid(), nodBounds.Y.Valid(), nodBounds.Width.Valid(), nodBounds.Height.Valid());
        if (this.quadTable[node.id]) {
            var quad = this.quadTable[node.id];
            if (!quad.isContained()) {
                this.removeFromAQuad(node);
                this.addIntoAQuad(node);
            }
        }
        else {
            this.addIntoAQuad(node);
        }
        if (this.isWithinPageBounds(nodBounds) &&
            this.leftElement !== node &&
            this.topElement !== node &&
            this.rightElement !== node &&
            this.bottomElement !== node) {
            //contained - no change
        }
        else {
            var modified = false;
            if (this.pageLeft !== this.childLeft || node !== this.leftElement) {
                if (this.pageLeft >= this.childLeft) {
                    this.pageLeft = this.childLeft;
                    this.leftElement = node;
                    modified = true;
                }
                else if (node === this.leftElement) {
                    this.pageLeft = Number.MAX_VALUE;
                    this.findLeft(this.parentQuad);
                    modified = true;
                }
            }
            if (this.pageTop !== this.childTop || node !== this.topElement) {
                if (this.pageTop >= this.childTop) {
                    this.pageTop = this.childTop;
                    this.topElement = node;
                    modified = true;
                }
                else if (node === this.topElement) {
                    this.pageTop = Number.MAX_VALUE;
                    this.findTop(this.parentQuad);
                    modified = true;
                }
            }
            if (this.pageBottom !== this.childBottom || node !== this.bottomElement) {
                if (this.pageBottom <= this.childBottom) {
                    modified = true;
                    this.pageBottom = this.childBottom;
                    this.bottomElement = node;
                }
                else if (node === this.bottomElement) {
                    this.pageBottom = -Number.MAX_VALUE;
                    this.findBottom(this.parentQuad);
                    modified = true;
                }
            }
            if (this.pageRight !== this.childRight || node !== this.rightElement) {
                if (this.pageRight <= this.childRight) {
                    this.pageRight = this.childRight;
                    this.rightElement = node;
                    modified = true;
                }
                else if (node === this.rightElement) {
                    this.pageRight = -Number.MAX_VALUE;
                    this.findRight(this.parentQuad);
                    modified = true;
                }
            }
            return modified;
        }
        this.setCurrentNode(null);
        return false;
    };
    SpatialSearch.prototype.isWithinPageBounds = function (node) {
        if (node.left >= this.pageLeft && node.right <= this.pageRight && node.top >= this.pageTop
            && node.bottom <= this.pageBottom) {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * findQuads method\
     *
     * @returns {  Quad[] }    findQuads method .\
     * @param {Rect} region - provide the options value.
     * @private
     */
    SpatialSearch.prototype.findQuads = function (region) {
        var quads = [];
        this.parentQuad.findQuads(region, quads);
        return quads;
    };
    /**
     * findObjects method\
     *
     * @returns {  IGroupable[] }    findObjects method .\
     * @param {Rect} region - provide the options value.
     * @private
     */
    SpatialSearch.prototype.findObjects = function (region) {
        var quads = this.findQuads(region);
        var objects = [];
        for (var _i = 0, quads_1 = quads; _i < quads_1.length; _i++) {
            var quad = quads_1[_i];
            for (var _a = 0, _b = quad.objects; _a < _b.length; _a++) {
                var obj = _b[_a];
                if (obj.outerBounds.intersects(region)) {
                    objects.push(this.objectTable[obj.id]);
                }
            }
        }
        return objects;
    };
    /**
     * updateBounds method\
     *
     * @returns { boolean }    updateBounds method .\
     * @param {IGroupable} node - provide the options value.
     * @private
     */
    SpatialSearch.prototype.updateBounds = function (node) {
        var modified = false;
        if (node === this.topElement) {
            this.pageTop = Number.MAX_VALUE;
            this.topElement = null;
            this.findTop(this.parentQuad);
            modified = true;
        }
        if (node === this.leftElement) {
            this.pageLeft = Number.MAX_VALUE;
            this.leftElement = null;
            this.findLeft(this.parentQuad);
            modified = true;
        }
        if (node === this.rightElement) {
            this.pageRight = -Number.MAX_VALUE;
            this.rightElement = null;
            this.findRight(this.parentQuad);
            modified = true;
        }
        if (node === this.bottomElement) {
            this.pageBottom = -Number.MAX_VALUE;
            this.bottomElement = null;
            this.findBottom(this.parentQuad);
            modified = true;
        }
        return modified;
    };
    SpatialSearch.prototype.findBottom = function (quad) {
        //if (quad.Quads.Count === 4)
        {
            if (quad.third || quad.fourth) {
                if (quad.third) {
                    this.findBottom(quad.third);
                }
                if (quad.fourth) {
                    this.findBottom(quad.fourth);
                }
            }
            else {
                if (quad.second) {
                    this.findBottom(quad.second);
                }
                if (quad.first) {
                    this.findBottom(quad.first);
                }
            }
        }
        for (var _i = 0, _a = quad.objects; _i < _a.length; _i++) {
            var node = _a[_i];
            if (this.pageBottom <= node.outerBounds.bottom) {
                this.pageBottom = node.outerBounds.bottom;
                this.bottomElement = node;
            }
        }
    };
    SpatialSearch.prototype.findRight = function (quad) {
        //if (quad.Quads.Count === 4)
        {
            if (quad.second || quad.fourth) {
                if (quad.second) {
                    this.findRight(quad.second);
                }
                if (quad.fourth) {
                    this.findRight(quad.fourth);
                }
            }
            else {
                if (quad.first) {
                    this.findRight(quad.first);
                }
                if (quad.third) {
                    this.findRight(quad.third);
                }
            }
        }
        for (var _i = 0, _a = quad.objects; _i < _a.length; _i++) {
            var node = _a[_i];
            if (this.pageRight <= node.outerBounds.right) {
                this.pageRight = node.outerBounds.right;
                this.rightElement = node;
            }
        }
    };
    SpatialSearch.prototype.findLeft = function (quad) {
        //if (quad.Quads.Count === 4)
        {
            if (quad.first || quad.third) {
                if (quad.first) {
                    this.findLeft(quad.first);
                }
                if (quad.third) {
                    this.findLeft(quad.third);
                }
            }
            else {
                if (quad.second) {
                    this.findLeft(quad.second);
                }
                if (quad.fourth) {
                    this.findLeft(quad.fourth);
                }
            }
        }
        for (var _i = 0, _a = quad.objects; _i < _a.length; _i++) {
            var node = _a[_i];
            if (this.pageLeft >= node.outerBounds.left) {
                this.pageLeft = node.outerBounds.left;
                this.leftElement = node;
            }
        }
    };
    SpatialSearch.prototype.findTop = function (quad) {
        //if (quad.Quads.Count === 4)
        {
            if (quad.first || quad.second) {
                if (quad.first) {
                    this.findTop(quad.first);
                }
                if (quad.second) {
                    this.findTop(quad.second);
                }
            }
            else {
                if (quad.third) {
                    this.findTop(quad.third);
                }
                if (quad.fourth) {
                    this.findTop(quad.fourth);
                }
            }
        }
        for (var _i = 0, _a = quad.objects; _i < _a.length; _i++) {
            var node = _a[_i];
            if (this.pageTop >= node.outerBounds.top) {
                this.pageTop = node.outerBounds.top;
                this.topElement = node;
            }
        }
    };
    /**
     * setCurrentNode method\
     *
     * @returns { void }    setCurrentNode method .\
     * @param {IGroupable} node - provide the options value.
     * @private
     */
    SpatialSearch.prototype.setCurrentNode = function (node) {
        this.childNode = node;
        if (node) {
            var r = node.outerBounds;
            this.childLeft = Number(r.left);
            this.childTop = Number(r.top);
            this.childRight = Number(r.right);
            this.childBottom = Number(r.bottom);
        }
        else {
            this.childLeft = Number.MAX_VALUE;
            this.childTop = Number.MAX_VALUE;
            this.childRight = -Number.MAX_VALUE;
            this.childBottom = -Number.MAX_VALUE;
        }
    };
    /**
     * getPageBounds method\
     *
     * @returns { Rect }    getPageBounds method .\
     * @param {number} originX - provide the options value.
     * @param {number} originY - provide the options value.
     * @private
     */
    SpatialSearch.prototype.getPageBounds = function (originX, originY) {
        if (this.pageLeft === Number.MAX_VALUE) {
            return new Rect(0, 0, 0, 0);
        }
        var left = originX !== undefined ? Math.min(this.pageLeft, 0) : this.pageLeft;
        var top = originY !== undefined ? Math.min(this.pageTop, 0) : this.pageTop;
        return new Rect(Math.round(left), Math.round(top), Math.round(this.pageRight - left), Math.round(this.pageBottom - top));
    };
    /**
     * getQuad method\
     *
     * @returns { Quad }    getQuad method .\
     * @param {IGroupable} node - provide the options value.
     * @private
     */
    SpatialSearch.prototype.getQuad = function (node) {
        return this.quadTable[node.id];
    };
    return SpatialSearch;
}());
export { SpatialSearch };
