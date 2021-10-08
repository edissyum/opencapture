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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RealAction } from '../diagram/enum/enum';
import { DiagramRenderer } from '../diagram/rendering/renderer';
import { CanvasRenderer } from '../diagram/rendering/canvas-renderer';
import { Component, Property, Browser, EventHandler, Event, isBlazor } from '@syncfusion/ej2-base';
import { setAttributeHtml, setAttributeSvg, createHtmlElement, getHTMLLayer } from '../diagram/utility/dom-util';
import { createSvgElement, getNativeLayer, hasClass } from '../diagram/utility/dom-util';
import { Rect } from '../diagram/primitives/rect';
import { Size } from '../diagram/primitives/size';
import { SvgRenderer } from '../diagram/rendering/svg-renderer';
/**
 * Overview control allows you to see a preview or an overall view of the entire content of a Diagram.
 * This helps you to look at the overall picture of a large Diagram
 * To navigate, pan, or zoom, on a particular position of the page.
 * ```html
 * <div id='diagram'/>
 * <div id="overview"></div>
 * ```
 * ```typescript
 * let overview: Overview;
 * let diagram: Diagram = new Diagram({
 * width:'1000px', height:'500px' });
 * diagram.appendTo('#diagram');
 * let options: OverviewModel = {};
 * options.sourceID = 'diagram';
 * options.width = '250px';
 * options.height = '500px';
 * overview = new Overview(options);
 * overview.appendTo('#overview');
 * ```
 */
var Overview = /** @class */ (function (_super) {
    __extends(Overview, _super);
    function Overview(options, element) {
        var _this = _super.call(this, options, element) || this;
        /** @private */
        _this.mode = 'Canvas';
        /** @private */
        _this.id = 'overview';
        _this.actionName = '';
        _this.startPoint = null;
        _this.currentPoint = null;
        _this.prevPoint = null;
        _this.scale = null;
        _this.inAction = false;
        _this.viewPortRatio = 1;
        _this.horizontalOffset = 0;
        _this.verticalOffset = 0;
        _this.model = {};
        _this.event = true;
        _this.overviewid = 88123;
        _this.model = { width: _this.width, height: _this.height };
        return _this;
    }
    /**
     * Updates the overview control when the objects are changed
     *
     * @param {OverviewModel} newProp - Lists the new values of the changed properties
     * @param {OverviewModel} oldProp - Lists the old values of the changed properties
     */
    Overview.prototype.onPropertyChanged = function (newProp, oldProp) {
        //let objectArray: Object[] = [];
        for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'sourceID':
                    this.setParent(newProp.sourceID);
                    break;
                case 'width':
                case 'height':
                    this.renderCanvas();
                    this.setParent(this.sourceID);
                    break;
            }
        }
    };
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string}  Get the properties to be maintained in the persisted state.
     */
    Overview.prototype.getPersistData = function () {
        var keyEntity = ['loaded'];
        return this.addOnPersist(keyEntity);
    };
    /**
     * Initializes the values of private members.
     *
     * @returns {void}  Initializes the values of private members.
     * @private
     */
    Overview.prototype.preRender = function () {
        if (this.element.id === '') {
            var collection = document.getElementsByClassName('e-overview').length;
            this.element.id = 'overview_' + this.overviewid + '_' + collection;
        }
        this.element.style.background = 'transparent';
        this.unWireEvents();
        this.wireEvents();
    };
    Overview.prototype.render = function () {
        this.diagramRenderer = new DiagramRenderer(this.element.id, new SvgRenderer(), false);
        this.renderCanvas();
        this.setParent(this.sourceID);
        this.renderComplete();
    };
    // eslint-disable-next-line @typescript-eslint/ban-types
    Overview.prototype.getSizeValue = function (real) {
        var text;
        if (real.toString().indexOf('px') > 0 || real.toString().indexOf('%') > 0) {
            text = real.toString();
        }
        else {
            text = real.toString() + 'px';
        }
        return text;
    };
    Overview.prototype.renderCanvas = function (options) {
        var canvas = document.getElementById(this.element.id + '_canvas');
        if (!canvas) {
            canvas = createHtmlElement('div', {});
            this.element.appendChild(canvas);
        }
        var attribute = {
            'id': this.element.id + '_canvas', 'class': 'drawing',
            'style': 'position:relative; height:' + this.getSizeValue(this.model.height) + '; width:' +
                this.getSizeValue(this.model.width) +
                ';style:-ms-touch-action: none;touch-action: none;'
        };
        setAttributeHtml(canvas, attribute);
        this.element.setAttribute('tabindex', String(0));
        this.element.style.overflow = 'hidden';
        this.element.style.height = String(this.model.height);
        this.element.style.width = String(this.model.width);
        this.canvas = canvas;
    };
    Overview.prototype.setParent = function (id) {
        var element = document.getElementById(id);
        var instance = 'ej2_instances';
        if (this.parent) {
            var oldparent = this.parent;
            this.parent = null;
            oldparent.setOverview(null, this.element.id);
            this.removeDocument(this);
        }
        this.parent = this.getDiagram(element, instance);
        if (this.parent) {
            this.parent.setOverview(this);
        }
    };
    Overview.prototype.getDiagram = function (element, instance) {
        var diagram;
        var n = element[instance].length;
        for (var i = 0; i < n; i++) {
            if (hasClass(element[instance][i].element, 'e-diagram')) {
                diagram = element[instance][i];
                break;
            }
        }
        return diagram;
    };
    Overview.prototype.unWireEvents = function () {
        var start = Browser.touchStartEvent;
        var move = Browser.touchMoveEvent;
        //const evnt: EventHandler;
        var cancel = Browser.isPointer ? 'pointerleave' : 'mouseleave';
        //const isIE11Pointer: Boolean = Browser.isPointer;
        // const wheelEvent: string = Browser.info.name === 'mozilla' ?
        //     (isIE11Pointer ? 'mousewheel' : 'DOMMouseScroll') : 'mousewheel';
        var stop = Browser.touchEndEvent;
        EventHandler.remove(this.element, start, this.mouseDown);
        EventHandler.remove(this.element, move, this.mouseMove);
        EventHandler.remove(this.element, stop, this.mouseUp);
        EventHandler.remove(this.element, cancel, this.documentMouseUp);
        EventHandler.remove(window, 'resize', this.windowResize);
        var container = document.getElementById(this.sourceID + 'content');
        if (container) {
            EventHandler.remove(container, 'scroll', this.scrolled);
        }
    };
    Overview.prototype.wireEvents = function () {
        var start = Browser.touchStartEvent;
        var stop = Browser.touchEndEvent;
        var move = Browser.touchMoveEvent;
        var cancel = Browser.isPointer ? 'pointerleave' : 'mouseleave';
        //const isIE11Pointer: Boolean = Browser.isPointer;
        // const wheelEvent: string = Browser.info.name === 'mozilla' ?
        //     (isIE11Pointer ? 'mousewheel' : 'DOMMouseScroll') : 'mousewheel';
        EventHandler.add(this.element, start, this.mouseDown, this);
        EventHandler.add(this.element, move, this.mouseMove, this);
        EventHandler.add(this.element, stop, this.mouseUp, this);
        EventHandler.add(this.element, cancel, this.documentMouseUp, this);
        // eslint-disable
        EventHandler.add(window, 'resize', this.windowResize, this);
        // eslint-enable
        var container = document.getElementById(this.sourceID + 'content');
        if (container) {
            EventHandler.add(container, 'scroll', this.scrolled, this);
        }
    };
    /**
     * renderDocument method\
     *
     * @returns {  void }    renderDocument method .\
     * @param {Overview} view - provide the angle value.
     * @private
     */
    Overview.prototype.renderDocument = function (view) {
        view.canvas = this.canvas;
        var g = document.getElementById(this.canvas.id + '_svg');
        if (g) {
            g.parentNode.removeChild(g);
        }
        var attr = {
            id: this.canvas.id + '_svg',
            version: '1.1',
            'class': 'overview_svg'
        };
        var svg = createSvgElement('svg', attr);
        this.svg = svg;
        view.svg = svg;
        view.canvas.appendChild(svg);
        var ovw = document.getElementById(this.element.id);
        var element = ovw;
        var eWidth = element.clientWidth;
        var eHeight = element.clientHeight;
        var bRect = element.getBoundingClientRect();
        // Check for the window resize
        var screenX = (window.screenX < 0) ? window.screenX * -1 : window.screenX;
        var screenY = (window.screenY < 0) ? window.screenY * -1 : window.screenY;
        if (eWidth === 0) {
            var widthValue = Math.floor(((window.innerWidth - screenX) - Math.floor(bRect.left)));
            eWidth = widthValue > 0 ? widthValue : Math.floor(window.innerWidth);
        }
        if (eHeight === 0) {
            var heightValue = Math.floor(((window.innerHeight - screenY) - Math.floor(bRect.top)));
            eHeight = heightValue > 0 ? heightValue : Math.floor(window.innerHeight);
        }
        if (eWidth > 0) {
            svg.setAttribute('width', String(eWidth));
            this.model.height = eHeight;
        }
        if (eHeight > 0) {
            svg.setAttribute('height', String(eHeight));
            this.model.width = eWidth;
        }
        //let attributes: Object;
        if (!view.diagramLayerDiv) {
            view.diagramLayerDiv = createHtmlElement('div', {});
            //const container: HTMLElement = document.getElementById(this.element.id);
            view.diagramLayer = CanvasRenderer.createCanvas(this.element.id + '_diagramLayer', this.model.width, this.model.height);
            view.diagramLayer.setAttribute('style', 'position:absolute; left:0px;  top:0px ');
            view.diagramLayerDiv.appendChild(view.diagramLayer);
            view.canvas.appendChild(view.diagramLayerDiv);
        }
        var attributes = {
            'id': this.element.id + '_diagramLayer_div',
            'style': 'width:' + this.model.width + 'px; height:' + this.model.height + 'px;position:absolute;top:0px;left:0px'
        };
        setAttributeHtml(view.diagramLayerDiv, attributes);
        this.renderHtmlLayer(view.canvas);
        this.renderNativeLayer(view.canvas, view);
        this.addOverviewRectPanel(view);
    };
    /**
     * removeDocument method\
     *
     * @returns {  void }    removeDocument method .\
     * @param {Overview} view - provide the angle value.
     * @private
     */
    Overview.prototype.removeDocument = function (view) {
        var svg = document.getElementById(this.canvas.id + '_svg');
        this.canvas.removeChild(svg);
        var htmlLayer = document.getElementById(this.element.id + '_htmlLayer');
        this.canvas.removeChild(htmlLayer);
        var diagramLayer = document.getElementById(this.element.id + '_diagramLayer_div');
        this.canvas.removeChild(diagramLayer);
        view.diagramLayerDiv = null;
        view.diagramLayer = null;
        var domTable = 'domTable';
        window[domTable][this.id + 'html_layer'] = null;
    };
    Overview.prototype.renderHtmlLayer = function (canvas) {
        var htmlLayer = createHtmlElement('div', {
            'id': this.element.id + '_htmlLayer', 'class': 'e-html-layer',
            'style': 'pointer-events:none;position:absolute;top:0px;left:0px;'
        });
        var options = {
            'id': this.element.id + '_htmlLayer_div',
            'style': 'position:absolute;top:0px;left:0px;'
        };
        var htmlDiv = createHtmlElement('div', options);
        htmlLayer.appendChild(htmlDiv);
        canvas.appendChild(htmlLayer);
        return htmlLayer;
    };
    Overview.prototype.renderNativeLayer = function (canvas, view) {
        if (!document.getElementById(this.element.id + '_nativeLayer_svg')) {
            var nativeLayerSvg = this.parent.createSvg(this.element.id + '_nativeLayer_svg', this.model.width, this.model.height);
            var nativeLayer = createSvgElement('g', { 'id': this.element.id + '_nativeLayer' });
            nativeLayerSvg.appendChild(nativeLayer);
            view.diagramLayerDiv.appendChild(nativeLayerSvg);
            setAttributeSvg(nativeLayerSvg, { 'class': 'e-native-layer' });
        }
    };
    Overview.prototype.addOverviewRectPanel = function (view) {
        var svg = document.getElementById(this.canvas.id + '_overviewsvg');
        if (svg) {
            svg.parentNode.removeChild(svg);
        }
        var attr = ({
            id: this.canvas.id + '_overviewsvg',
            class: 'overviewsvg',
            version: '1.1',
            'style': 'position:absolute;left:0px;top:0px; aria-label:Specifies overview',
            width: this.model.width,
            height: this.model.height
        });
        svg = createSvgElement('svg', attr);
        view.canvas.appendChild(svg);
        var ovw = createSvgElement('g', { 'id': this.element.id + '_overviewlayer', 'style': 'pointer-events:none' });
        svg.appendChild(ovw);
        var rect = createSvgElement('rect', {
            'fill': 'transparent', 'width': '100%', 'height': '100%', 'class': 'overviewbackrect',
            'id': this.canvas.id + 'overviewbackrect'
        });
        rect.setAttribute('style', ' pointer-events: none; ');
        ovw.appendChild(rect);
        //const svgDocument: SVGElement = (ovw);
        var g = createSvgElement('g', { 'id': this.canvas.id + 'overviewhandle', 'style': 'pointer-events:all' });
        ovw.appendChild(g);
        var innerrect = createSvgElement('rect', { 'id': this.canvas.id + 'overviewrect', 'fill': 'transparent' });
        g.appendChild(innerrect);
        this.renderOverviewCorner('left', g);
        this.renderOverviewCorner('right', g);
        this.renderOverviewCorner('top', g);
        this.renderOverviewCorner('bottom', g);
        this.renderOverviewCorner('topleft', g);
        this.renderOverviewCorner('topright', g);
        this.renderOverviewCorner('bottomleft', g);
        this.renderOverviewCorner('bottomright', g);
    };
    Overview.prototype.renderOverviewCorner = function (name, parent) {
        var svg = this.svg;
        var shape;
        if (name === 'top' || name === 'bottom' || name === 'right' || name === 'left') {
            shape = 'rect';
        }
        else {
            shape = 'circle';
        }
        var innerrect = createSvgElement(shape, { 'id': this.canvas.id + 'visible' + name });
        parent.appendChild(innerrect);
        var transrect = createSvgElement(shape, {
            'id': this.canvas.id + name, 'class': 'overviewresizer', 'fill': 'transparent'
        });
        parent.appendChild(transrect);
    };
    Overview.prototype.updateOverviewRectangle = function () {
        var difx = this.currentPoint.x - this.prevPoint.x;
        var dify = this.currentPoint.y - this.prevPoint.y;
        var size = new Size();
        size.width = 0;
        size.height = 0;
        var x = 0;
        var y = 0;
        var w;
        var h;
        switch (this.resizeDirection) {
            case 'left':
                size.width -= difx;
                size.height -= difx / this.viewPortRatio;
                x = difx;
                y = difx / this.viewPortRatio;
                y /= 2;
                break;
            case 'right':
                size.width += difx;
                size.height += difx / this.viewPortRatio;
                y = difx / this.viewPortRatio;
                y /= -2;
                break;
            case 'top':
                size.height -= dify;
                size.width -= dify * this.viewPortRatio;
                y = dify;
                x = dify * this.viewPortRatio;
                x /= 2;
                break;
            case 'bottom':
                size.height += dify;
                size.width += dify * this.viewPortRatio;
                x = dify * this.viewPortRatio;
                x /= -2;
                break;
            case 'topleft':
                if (Math.abs(dify) > Math.abs(difx)) {
                    difx = dify * this.viewPortRatio;
                }
                else {
                    dify = difx / this.viewPortRatio;
                }
                size.width -= difx;
                size.height -= dify;
                x = difx;
                y = dify;
                break;
            case 'topright':
                if (Math.abs(dify) > Math.abs(difx)) {
                    difx = -dify * this.viewPortRatio;
                }
                else {
                    dify = -(difx / this.viewPortRatio);
                }
                y = dify;
                size.width += difx;
                size.height -= dify;
                break;
            case 'bottomleft':
                if (Math.abs(dify) > Math.abs(difx)) {
                    difx = -dify * this.viewPortRatio;
                }
                else {
                    dify = -difx / this.viewPortRatio;
                }
                x = difx;
                size.width -= difx;
                size.height += dify;
                break;
            case 'bottomright':
                if (Math.abs(dify) > Math.abs(difx)) {
                    difx = dify * this.viewPortRatio;
                }
                else {
                    dify = difx / this.viewPortRatio;
                }
                size.width += difx;
                size.height += dify;
                break;
        }
        this.updateHelper(x, y, size, w, h);
    };
    Overview.prototype.updateHelper = function (difx, dify, size, width, height) {
        var x;
        var y;
        var bounds;
        var svg = this.element.getElementsByTagName('svg')[2];
        var rect = svg.getElementById('helper');
        if (size) {
            bounds = rect.getBBox();
            x = bounds.x + difx;
            y = bounds.y + dify;
            width = bounds.width + size.width;
            height = bounds.height + size.height;
        }
        else {
            var difx_1;
            if (this.currentPoint.x > this.startPoint.x) {
                difx_1 = this.currentPoint.x - this.prevPoint.x;
            }
            else {
                difx_1 = this.prevPoint.x - this.currentPoint.x;
            }
            var dify_1;
            if (this.currentPoint.y > this.startPoint.y) {
                dify_1 = this.currentPoint.y - this.prevPoint.y;
            }
            else {
                dify_1 = this.prevPoint.y - this.currentPoint.y;
            }
            var w = void 0;
            var h = void 0;
            if (Math.abs(dify_1) > Math.abs(difx_1)) {
                difx_1 = this.viewPortRatio * dify_1;
                h = true;
                w = false;
            }
            else {
                dify_1 = difx_1 / this.viewPortRatio;
                w = true;
                h = false;
            }
            bounds = rect.getBBox();
            x = ((this.startPoint.x > this.currentPoint.x) ?
                bounds.x - difx_1 : bounds.x);
            y = ((this.startPoint.y > this.currentPoint.y) ? bounds.y - dify_1 : bounds.y);
            width = bounds.width + difx_1;
            height = bounds.height + dify_1;
        }
        setAttributeSvg(this.helper, {
            'id': this.helper.id, 'x': x, 'y': y,
            'width': Math.max(0, width), 'height': Math.max(0, height)
        });
    };
    Overview.prototype.updateOverviewrect = function (x, y, width, height) {
        var rect = document.getElementById(this.canvas.id + 'overviewrect');
        var attr = { x: x, y: y, width: Math.max(1, width), height: Math.max(1, height) };
        setAttributeHtml(rect, attr);
        this.updateOverviewCorner('top', x + 8, y + 1, Math.max(0, width - 16), 2);
        this.updateOverviewCorner('bottom', x + 8, y + height + 3, Math.max(0, width - 16), 2);
        this.updateOverviewCorner('left', x - 2, y + 11, 2, Math.max(0, height - 16));
        this.updateOverviewCorner('right', x + width, y + 11, 2, Math.max(0, height - 16));
        this.updateOverviewCorner('topleft', x, y + 3, 5, 5);
        this.updateOverviewCorner('topright', x + width, y + 3, 5, 5);
        this.updateOverviewCorner('bottomleft', x, y + height + 3, 5, 5);
        this.updateOverviewCorner('bottomright', x + width, y + height + 3, 5, 5);
    };
    Overview.prototype.updateOverviewCorner = function (name, x, y, width, height) {
        var attr;
        var transattr;
        var rectname = 'visible' + name;
        var rect = document.getElementById(this.canvas.id + rectname);
        if (name === 'top' || name === 'bottom' || name === 'right' || name === 'left') {
            attr = { x: x, y: y, width: width, height: height, fill: '#ED1C24' };
            transattr = { x: x - 2, y: y - 2, width: width === 2 ? 4 : width, height: height === 2 ? 4 : height };
        }
        else {
            attr = { cx: x, cy: y, 'r': 4, fill: '#ED1C24' };
            transattr = { cx: x, cy: y, 'r': 6, fill: 'transparent' };
        }
        setAttributeHtml(rect, attr);
        var transrect = document.getElementById(this.canvas.id + name);
        setAttributeHtml(transrect, transattr);
    };
    Overview.prototype.translateOverviewRectangle = function () {
        var offwidth = Number(this.model.width);
        var offheight = Number(this.model.height);
        var difx = this.currentPoint.x - this.prevPoint.x;
        var dify = this.currentPoint.y - this.prevPoint.y;
        //const viewPort: Rect;
        //let zoom: number = Math.min(this.parent.scroller.viewPortWidth / offwidth, this.parent.scroller.viewPortHeight / offheight);
        var svg = this.element.getElementsByClassName('overviewsvg')[0];
        var panel = svg.getElementById(this.canvas.id
            + 'overviewrect');
        var bounds = panel.getBBox();
        var x = bounds.x + difx;
        var y = bounds.y + dify;
        var width = bounds.width;
        var height = bounds.height;
        this.updateOverviewrect(x, y, width, height);
        this.updateParentView(this.parent.scroller.currentZoom, x, y, width, height, null);
    };
    Overview.prototype.renderOverviewRect = function (x, y, width, height) {
        var offwidth = Number(this.model.width);
        var offheight = Number(this.model.height);
        //const viewPort: Rect;
        var viewwidth = (width / offwidth) * this.contentWidth;
        var viewheight = (height / offheight) * this.contentHeight;
        var zoom = Math.max(this.parent.scroller.viewPortWidth / viewwidth, this.parent.scroller.viewPortHeight / viewheight);
        if (zoom >= 0.25 && zoom <= 30) {
            var point = { x: 0, y: 0 };
            this.updateParentView(zoom, x, y, width, height, point);
            var bounds = this.scrollOverviewRect(this.parent.scroller.horizontalOffset, this.parent.scroller.verticalOffset, this.parent.scroller.currentZoom, true);
            if (this.helper) {
                var panel = this.element.getElementsByTagName('rect')[10];
                var svgRect = panel.getBBox();
                bounds.x = svgRect.x;
                bounds.y = svgRect.y;
            }
            this.updateOverviewrect(bounds.x, bounds.y, bounds.width, bounds.height);
        }
    };
    Overview.prototype.scrollOverviewRect = function (hoffset, voffset, currentZoom, scaled) {
        if (!(this.actionName) || scaled) {
            var offwidth = Number(this.model.width);
            var offheight = Number(this.model.height);
            var scale = Math.min(this.contentWidth / offwidth, this.contentHeight / offheight);
            var bounds = new Rect();
            var x = bounds.x = (hoffset / currentZoom) / scale;
            var y = bounds.y = (voffset / currentZoom) / scale;
            //const viewPort: Rect;
            var width = bounds.width = (this.parent.scroller.viewPortWidth / currentZoom) / scale;
            var height = bounds.height = (this.parent.scroller.viewPortHeight / currentZoom) / scale;
            //const ratio: number = this.parent.scroller.viewPortWidth / this.parent.scroller.viewPortHeight;
            if (scaled) {
                var rect = new Rect();
                rect.x = x;
                rect.y = y;
                rect.width = width;
                rect.height = height;
                return rect;
            }
            this.updateOverviewrect(-x, -y, width, height);
        }
        return null;
    };
    Overview.prototype.updateParentView = function (zoom, x, y, width, height, focusPoint) {
        var offwidth = Number(this.model.width);
        var offheight = Number(this.model.height);
        var scalex = this.contentWidth / offwidth;
        var scaley = this.contentHeight / offheight;
        var hoffset = x * scalex * zoom;
        var voffset = y * scaley * zoom;
        var delx;
        var dely;
        var bounds = this.parent.scroller.getPageBounds();
        if (zoom !== 1 || this.actionName === 'pan') {
            delx = -hoffset - this.parent.scroller.horizontalOffset;
            dely = -voffset - this.parent.scroller.verticalOffset;
        }
        this.parent.setBlazorDiagramProps(true);
        this.parent.realActions |= RealAction.OverViewAction;
        if (this.actionName === 'scale' || this.actionName === 'draw') {
            this.parent.scroller.zoom(zoom / this.parent.scroller.currentZoom, delx, dely, focusPoint);
        }
        else {
            if (!isBlazor()) {
                this.parent.pan(delx, dely, focusPoint);
            }
            else {
                this.parent.scroller.zoom(1, delx, dely, focusPoint);
            }
        }
    };
    Overview.prototype.updateHtmlLayer = function (view) {
        var htmlLayer = getHTMLLayer(view.element.id);
        var bounds = this.parent.scroller.getPageBounds(true);
        var width = bounds.width;
        var height = bounds.height;
        var w = Math.max(width, this.parent.scroller.viewPortWidth);
        var h = Math.max(height, this.parent.scroller.viewPortHeight / this.parent.scroller.currentZoom);
        var scale = Math.min(Number(this.model.width) / w, Number(this.model.height) / h);
        htmlLayer.style.transform = 'scale(' + scale + ') translate(' + this.parent.scroller.transform.tx + 'px,'
            + (this.parent.scroller.transform.ty) + 'px)';
    };
    /** @private */
    /**
     * updateView method\
     *
     * @returns {  void }    removeDocument method .\
     * @param {Overview} view - provide the angle value.
     * @private
     */
    Overview.prototype.updateView = function (view) {
        //let width: number; let height: number;
        var bounds = this.parent.scroller.getPageBounds();
        var diagramBoundsWidth = this.parent.scroller.viewPortWidth / this.parent.scroller.currentZoom;
        var diagramBoundsHeight = this.parent.scroller.viewPortHeight / this.parent.scroller.currentZoom;
        var transformWidth = 0;
        var transformHeight = 0;
        if (this.parent.scroller.currentZoom < 1 && diagramBoundsWidth > bounds.width && diagramBoundsHeight > bounds.height) {
            transformWidth = (diagramBoundsWidth - bounds.width) / 2;
            transformHeight = (diagramBoundsHeight - bounds.height) / 2;
        }
        var width = bounds.width;
        var height = bounds.height;
        var offwidth = Number(this.model.width);
        var offheight = Number(this.model.height);
        //let scale: number;
        var w = Math.max(width, this.parent.scroller.viewPortWidth);
        var h = Math.max(height, this.parent.scroller.viewPortHeight / this.parent.scroller.currentZoom);
        this.contentWidth = w = Math.max(w, (offwidth / offheight) * h);
        this.contentHeight = h = Math.max(h, (offheight / offwidth) * w);
        var scale = Math.min(offwidth / w, offheight / h);
        var htmlLayer = document.getElementById(this.element.id + '_htmlLayer');
        htmlLayer.style.webkitTransform = 'scale(' + scale + ') translate(' + -bounds.x + 'px,' + (-bounds.y) + 'px)';
        htmlLayer.style.transform = 'scale(' + scale + ') translate(' + ((-(bounds.x)) + transformWidth) + 'px,'
            + (((-bounds.y) + transformHeight)) + 'px)';
        var ovw = document.getElementById(this.element.id + '_overviewlayer');
        ovw.setAttribute('transform', 'translate(' + (-bounds.x * scale) + ',' + (-bounds.y * scale) + ')');
        this.horizontalOffset = bounds.x * scale;
        this.verticalOffset = bounds.y * scale;
        var canvas = document.getElementById(this.element.id + '_diagramLayer');
        var nativeLayer = getNativeLayer(this.element.id);
        var context = canvas.getContext('2d');
        var widthratio = (Number(this.model.width) / this.contentWidth);
        var heightratio = (Number(this.model.height) / this.contentHeight);
        widthratio = Math.min(widthratio, heightratio);
        var transform = this.parent.scroller.transform;
        var tx = transform.tx;
        var ty = transform.ty;
        nativeLayer.setAttribute('transform', 'translate('
            + (tx * widthratio) + ',' + (ty * heightratio) + '),scale('
            + widthratio + ')');
        context.setTransform(widthratio, 0, 0, widthratio, 0, 0);
        context.fillStyle = 'red';
        this.scrollOverviewRect(this.parent.scroller.horizontalOffset, this.parent.scroller.verticalOffset, this.parent.scroller.currentZoom);
    };
    // region - Event Handlers
    Overview.prototype.scrolled = function (evt) {
        if (this.event) {
            var bounds = this.scrollOverviewRect(this.parent.scroller.horizontalOffset, this.parent.scroller.verticalOffset, this.parent.scroller.currentZoom, true);
            this.updateOverviewrect(-bounds.x, -bounds.y, bounds.width, bounds.height);
        }
    };
    Overview.prototype.updateCursor = function (evt) {
        if (hasClass(evt.target, ('overviewresizer'))) {
            switch (evt.target.id) {
                case this.canvas.id + 'left':
                    this.canvas.style.cursor = 'w-resize';
                    break;
                case this.canvas.id + 'right':
                    this.canvas.style.cursor = 'e-resize';
                    break;
                case this.canvas.id + 'top':
                    this.canvas.style.cursor = 'n-resize';
                    break;
                case this.canvas.id + 'bottom':
                    this.canvas.style.cursor = 's-resize';
                    break;
                case this.canvas.id + 'topleft':
                    this.canvas.style.cursor = 'nw-resize';
                    break;
                case this.canvas.id + 'topright':
                    this.canvas.style.cursor = 'ne-resize';
                    break;
                case this.canvas.id + 'bottomleft':
                    this.canvas.style.cursor = 'sw-resize';
                    break;
                case this.canvas.id + 'bottomright':
                    this.canvas.style.cursor = 'se-resize';
                    break;
            }
        }
        else {
            this.canvas.style.cursor = 'default';
        }
    };
    Overview.prototype.mouseMove = function (evt) {
        this.event = false;
        this.updateCursor(evt);
        this.currentPoint = this.mousePosition(evt);
        if (this.actionName) {
            switch (this.actionName) {
                case 'draw':
                    if (!this.inAction && (this.startPoint.x !== this.currentPoint.x || this.startPoint.y !== this.currentPoint.y)) {
                        this.initHelper();
                        this.inAction = true;
                    }
                    if (this.inAction) {
                        this.updateHelper();
                    }
                    break;
                case 'scale':
                    if (!this.inAction) {
                        this.initHelper();
                        this.inAction = true;
                    }
                    this.updateOverviewRectangle();
                    break;
                case 'pan':
                    if ((this.startPoint.x !== this.currentPoint.x || this.startPoint.y === this.currentPoint.y) || this.inAction) {
                        this.inAction = true;
                        this.translateOverviewRectangle();
                    }
                    break;
            }
        }
        this.prevPoint = this.currentPoint;
    };
    Overview.prototype.documentMouseUp = function (evt) {
        this.inAction = false;
        this.actionName = '';
        if (this.helper) {
            this.helper.parentNode.removeChild(this.helper);
            this.helper = null;
        }
        this.event = true;
        document.getElementById(this.canvas.id + 'overviewhandle').style.pointerEvents = 'all';
    };
    Overview.prototype.windowResize = function (evt) {
        var _this = this;
        if (this.resizeTo) {
            clearTimeout(this.resizeTo);
        }
        this.resizeTo = setTimeout(function () {
            var element = document.getElementById(_this.element.id);
            var bRect = element.getBoundingClientRect();
            _this.model.width = bRect.width > 0 ? bRect.width : _this.model.width;
            _this.model.height = bRect.height > 0 ? bRect.height : _this.model.height;
            _this.renderCanvas();
            _this.setParent(_this.sourceID);
        }, 10);
        return false;
    };
    /**
     * mouseDown method\
     *
     * @returns {  void }    mouseDown method .\
     * @param {PointerEvent | TouchEvent} evt - provide the angle value.
     * @private
     */
    Overview.prototype.mouseDown = function (evt) {
        if (evt.target.id === this.canvas.id + '_overviewsvg') {
            this.actionName = 'draw';
        }
        if (evt.target.id === this.canvas.id + 'overviewrect') {
            this.actionName = 'pan';
        }
        if (hasClass(evt.target, 'overviewresizer')) {
            this.actionName = 'scale';
            switch (evt.target.id) {
                case this.canvas.id + 'left':
                    this.resizeDirection = 'left';
                    break;
                case this.canvas.id + 'right':
                    this.resizeDirection = 'right';
                    break;
                case this.canvas.id + 'top':
                    this.resizeDirection = 'top';
                    break;
                case this.canvas.id + 'bottom':
                    this.resizeDirection = 'bottom';
                    break;
                case this.canvas.id + 'topleft':
                    this.resizeDirection = 'topleft';
                    break;
                case this.canvas.id + 'topright':
                    this.resizeDirection = 'topright';
                    break;
                case this.canvas.id + 'bottomleft':
                    this.resizeDirection = 'bottomleft';
                    break;
                case this.canvas.id + 'bottomright':
                    this.resizeDirection = 'bottomright';
                    break;
            }
        }
        this.startPoint = this.prevPoint = this.mousePosition(evt);
        this.viewPortRatio = this.parent.scroller.viewPortWidth / this.parent.scroller.viewPortHeight;
        var overViewHandle = document.getElementById(this.canvas.id + 'overviewhandle');
        overViewHandle.style.pointerEvents = 'none';
    };
    Overview.prototype.mouseUp = function (evt) {
        this.currentPoint = this.mousePosition(evt);
        //let offwidth: number = Number(this.model.width);
        //let offheight: number = Number(this.model.height);
        if (this.actionName) {
            if ((this.startPoint.x !== this.currentPoint.x || this.startPoint.y !== this.currentPoint.y)) {
                if (this.actionName === 'pan') {
                    //let i: number = 0;
                }
                else {
                    if (this.helper) {
                        var bounds = (this.element.getElementsByTagName('rect')[10]).getBBox();
                        this.resizeDirection = this.resizeDirection || '';
                        var x = bounds.x;
                        var y = bounds.y;
                        var width = bounds.width;
                        var height = bounds.height;
                        var adjust = this.resizeDirection === 'topleft' || this.resizeDirection === 'topright' ||
                            this.resizeDirection === 'bottomleft' || this.resizeDirection === 'bottomright';
                        this.renderOverviewRect(x, y, width, height);
                    }
                }
            }
            else {
                if (evt.target.id === this.canvas.id + '_overviewsvg' || evt.target.id === 'helper') {
                    var svg = this.element.getElementsByTagName('svg')[2];
                    var g = svg.getElementById(this.canvas.id
                        + 'overviewrect');
                    var bounds = g.getBBox();
                    var width = bounds.width;
                    var height = bounds.height;
                    this.inAction = true;
                    this.actionName = 'pan';
                    this.renderOverviewRect(this.currentPoint.x - width / 2, this.currentPoint.y - height / 2, width, height);
                    this.inAction = false;
                }
            }
        }
        if (this.helper) {
            this.helper.parentNode.removeChild(this.helper);
            this.helper = null;
        }
        this.actionName = '';
        this.startPoint = null;
        this.currentPoint = null;
        this.prevPoint = null;
        this.helper = null;
        this.viewPortRatio = 1;
        this.resizeDirection = '';
        this.inAction = false;
        this.event = true;
        document.getElementById(this.canvas.id + 'overviewhandle').style.pointerEvents = 'all';
    };
    Overview.prototype.initHelper = function () {
        var g = this.element.getElementsByTagName('svg')[2];
        //const scale: number = this.parent.scroller.currentZoom;
        var x = this.startPoint.x;
        var y = this.startPoint.y;
        var width = 1;
        var height = 1;
        if (this.actionName === 'scale') {
            var rect = g.
                getElementById(this.canvas.id + 'overviewrect');
            var bounds = rect.getBBox();
            x = bounds.x;
            y = bounds.y;
            width = bounds.width;
            height = bounds.height;
        }
        var selectionRect = createSvgElement('rect', {
            'id': 'helper', x: x, y: y, width: width, height: height,
            'fill': 'transparent', 'stroke': 'gray', 'stroke-dasharray': '2 2', 'shape-rendering': 'crispEdges'
        });
        var overviewLayer = g.getElementById(this.element.id + '_overviewlayer');
        overviewLayer.appendChild(selectionRect);
        this.helper = selectionRect;
    };
    Overview.prototype.mousePosition = function (evt) {
        var touchArg;
        var offsetX;
        var offsetY;
        if (evt.type.indexOf('touch') !== -1) {
            touchArg = evt;
            var pageX = touchArg.changedTouches[0].clientX;
            var pageY = touchArg.changedTouches[0].clientY;
            offsetX = pageX - this.element.offsetLeft;
            offsetY = pageY - this.element.offsetTop;
        }
        else {
            offsetX = evt.clientX;
            offsetY = evt.clientY;
        }
        var boundingRect = this.element.getBoundingClientRect();
        offsetX = offsetX - boundingRect.left;
        offsetY = offsetY - boundingRect.top;
        return { x: offsetX + this.horizontalOffset, y: offsetY + this.verticalOffset };
    };
    // end region - Event handlers
    /**
     *To destroy the overview
     *
     * @returns {void} To destroy the overview
     */
    Overview.prototype.destroy = function () {
        this.unWireEvents();
        this.notify('destroy', {});
        _super.prototype.destroy.call(this);
        if (document.getElementById(this.element.id)) {
            this.element.classList.remove('e-overview');
            var content = document.getElementById(this.element.id + '_canvas');
            if (content) {
                this.element.removeChild(content);
            }
        }
        this.parent.views.splice(this.parent.views.indexOf(this.element.id), 1);
        this.diagramLayerDiv = null;
        this.canvas = null;
        this.parent = null;
    };
    /**
     * Core method to return the component name.
     *
     * @returns {string}  Core method to return the component name.
     * @private
     */
    Overview.prototype.getModuleName = function () {
        /**
         * Returns the module name
         */
        return 'Overview';
    };
    __decorate([
        Property('100%')
    ], Overview.prototype, "width", void 0);
    __decorate([
        Property('100%')
    ], Overview.prototype, "height", void 0);
    __decorate([
        Property('')
    ], Overview.prototype, "sourceID", void 0);
    __decorate([
        Event()
    ], Overview.prototype, "created", void 0);
    return Overview;
}(Component));
export { Overview };
