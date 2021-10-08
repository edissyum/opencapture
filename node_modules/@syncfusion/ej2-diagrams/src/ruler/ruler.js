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
/* eslint-disable @typescript-eslint/ban-types */
import { Component, Property } from '@syncfusion/ej2-base';
import { createSvgElement, createHtmlElement, setAttributeSvg } from '../diagram/utility/dom-util';
import { Size } from '../diagram/primitives/size';
import { getFunction } from '../diagram/utility/base-util';
/**
 * Represents the Ruler component that measures the Diagram objects, indicate positions, and align Diagram elements.
 * ```html
 * <div id='ruler'>Show Ruler</div>
 * ```
 * ```typescript
 * <script>
 *   var rulerObj = new Ruler({ showRuler: true });
 *   rulerObj.appendTo('#ruler');
 * </script>
 * ```
 */
var Ruler = /** @class */ (function (_super) {
    __extends(Ruler, _super);
    /**
     *  Constructor for creating the Ruler Component
     *
     * @param {RulerModel} options The ruler model.
     * @param {string | HTMLElement} element The ruler element.
     */
    function Ruler(options, element) {
        var _this = _super.call(this, options, element) || this;
        /**   @private  */
        _this.offset = 0;
        /**   @private  */
        _this.scale = 1;
        return _this;
    }
    /**
     * Initializes the values of private members.
     *
     * @returns {void}  Initializes the values of private members.
     * @private
     */
    Ruler.prototype.preRender = function () {
        this.unWireEvents();
        this.wireEvents();
    };
    /**
     * Renders the rulers.
     *
     * @returns {void}  Renders the rulers.
     * @private
     */
    Ruler.prototype.render = function () {
        this.updateRulerGeometry();
        this.renderComplete();
    };
    /**
     * Core method to return the component name.
     *
     * @returns {string}  Core method to return the component name.
     * @private
     */
    Ruler.prototype.getModuleName = function () {
        return 'Ruler';
    };
    /**
     *To destroy the ruler
     *
     * @returns {void} To destroy the ruler
     */
    Ruler.prototype.destroy = function () {
        this.unWireEvents();
        this.notify('destroy', {});
        _super.prototype.destroy.call(this);
        this.element.classList.remove('e-ruler');
    };
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string}  Get the properties to be maintained in the persisted state.
     */
    Ruler.prototype.getPersistData = function () {
        var keyEntity = ['loaded'];
        return this.addOnPersist(keyEntity);
    };
    /**
     * Refreshes the ruler when the Ruler properties are updated\
     *
     * @returns {  void}    Refreshes the ruler when the Ruler properties are updated .\
     * @param {RulerModel} newProp - provide the newProp value.
     * @param {RulerModel} oldProp - provide the oldProp value.
     * @private
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Ruler.prototype.onPropertyChanged = function (newProp, oldProp) {
        for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'length':
                case 'interval':
                case 'segmentWidth':
                case 'tickAlignment':
                case 'markerColor':
                case 'thickness':
                    this.updateRuler();
                    break;
            }
        }
    };
    Ruler.prototype.updateRulerGeometry = function () {
        this.element.style.textAlign = 'left';
        this.renderRulerSpace();
        this.updateRuler();
    };
    Ruler.prototype.renderRulerSpace = function () {
        var rulerGeometry = this.getRulerGeometry();
        var div = document.getElementById(this.element.id + '_ruler_space');
        if (!div) {
            div = createHtmlElement('div', {
                'id': this.element.id + '_ruler_space',
                'style': 'height:' + rulerGeometry.height + 'px;width:' + rulerGeometry.width + 'px;cssFloat:' + 'left;'
            });
            this.element.appendChild(div);
        }
        return div;
    };
    Ruler.prototype.updateRuler = function () {
        var rulerSize = this.getRulerSize();
        var rulerGeometry = this.getRulerGeometry();
        var length = 0;
        var offset = 0;
        var availableSize = new Size();
        var svg = this.getRulerSVG(rulerGeometry);
        if (svg) {
            length = this.length;
            availableSize.height = rulerSize;
            offset = this.offset;
            if (length && length !== Infinity) {
                var unitLength = length + this.segmentWidth;
                var unitOffset = offset;
                this.updateSegments(unitOffset, (unitLength + Math.abs(unitOffset)), svg, rulerSize);
            }
        }
    };
    Ruler.prototype.updateSegments = function (start, end, svg, rulerSize) {
        var run = start;
        var trans = { trans: 0 };
        while (run < end) {
            var rulerSegment = this.getNewSegment(run, svg);
            if (rulerSegment) {
                svg.appendChild(rulerSegment.segment);
                run = this.updateSegment(start, end, rulerSegment, run, trans, rulerSize);
            }
        }
    };
    Ruler.prototype.updateSegment = function (start, end, rulerSegment, run, trans, rulerSize) {
        var segWidth = this.updateSegmentWidth(this.scale);
        if (run === start) {
            this.startValue = Math.floor(start / segWidth) * segWidth / this.scale;
            this.startValue = (this.startValue % 1) !== 0 ? Number((this.startValue).toFixed(1)) : this.startValue;
            rulerSegment.label.textContent = this.startValue.toString();
            this.defStartValue = run = this.startValue * this.scale;
            if (this.orientation === 'Horizontal') {
                this.hRulerOffset = start - run;
            }
            else {
                this.vRulerOffset = start - run;
            }
        }
        else {
            this.startValue = (run / this.scale);
            this.startValue = (this.startValue % 1) !== 0 ? Number((this.startValue).toFixed(1)) : this.startValue;
            rulerSegment.label.textContent = this.startValue.toString();
        }
        this.updateTickLabel(rulerSegment, rulerSize);
        var translate = (this.orientation === 'Horizontal') ? ((trans.trans + 0.5) + ',0.5') : ('0.5,' + (trans.trans + 0.5));
        rulerSegment.segment.setAttribute('transform', 'translate(' + translate + ')');
        trans.trans += segWidth;
        run += segWidth;
        return run;
    };
    Ruler.prototype.updateTickLabel = function (rulerSegment, rulerSize) {
        var bBox = rulerSegment.segment.lastChild.getBBox();
        var isHorizontal = (this.orientation === 'Horizontal') ? true : false;
        var isRightOrBottom = (this.tickAlignment === 'RightOrBottom') ? true : false;
        var x = isHorizontal ? 2 : 0;
        var y = isHorizontal ? (isRightOrBottom ? (rulerSize / 2 + (11 / 2) - (11 / 2)) :
            (rulerSize / 2 + (11 / 2))) : bBox.height;
        var translate = isRightOrBottom ? (-(bBox.width + 2) + ',' + ((rulerSize / 2) - bBox.height)) :
            (-(bBox.width + 2) + ',' + ((rulerSize / 2) - bBox.height / 2));
        var attr = isHorizontal ? { 'x': x, 'y': y } :
            { 'x': x, 'y': y, 'transform': 'rotate(270)' + 'translate(' + translate + ')' };
        setAttributeSvg(rulerSegment.segment.lastChild, attr);
    };
    Ruler.prototype.getNewSegment = function (run, svg) {
        var segment = this.createNewTicks(run, svg);
        var label = this.createTickLabel(svg, segment);
        return { segment: segment, label: label };
    };
    Ruler.prototype.createNewTicks = function (run, svg) {
        var tick;
        var tickInterval;
        var segmentWidth = this.updateSegmentWidth(this.scale);
        //let g: SVGElement;
        var attr = { 'class': 'e-ruler-segment' };
        var g = createSvgElement('g', attr);
        for (var i = 0; i < this.interval; i++) {
            tickInterval = segmentWidth / this.interval;
            tick = this.createTick(svg, tickInterval, i + 1, run);
            g.appendChild(tick);
        }
        return g;
    };
    Ruler.prototype.getLinePoint = function (svg, tickInterval, length) {
        var segmentWidth = this.updateSegmentWidth(this.scale);
        var rulerSize = this.getRulerSize();
        tickInterval = tickInterval * (length - 1);
        length = ((tickInterval % segmentWidth) === 0) ? rulerSize : rulerSize * 0.3;
        return length;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Ruler.prototype.createTick = function (svg, tickInterval, length, run) {
        var ruler;
        //let line: SVGElement;
        var linePoint = this.getLinePoint(svg, tickInterval, length);
        var rulerSize = this.getRulerSize();
        //let args: IArrangeTickOptions;
        //let attr: Object;
        var isHorizontal = (this.orientation === 'Horizontal') ? true : false;
        var isRightOrBottom = (this.tickAlignment === 'RightOrBottom') ? true : false;
        var arrangeTick = getFunction(this.arrangeTick);
        // eslint-disable-next-line
        var args = { ruler: ruler, tickLength: linePoint, tickInterval: ((this.segmentWidth / this.interval) * (length - 1)) };
        if (arrangeTick) {
            arrangeTick(args);
        }
        linePoint = args.tickLength;
        var point = tickInterval * (length - 1);
        var x1 = isHorizontal ? point : (isRightOrBottom ? rulerSize : 0);
        var x2 = isHorizontal ? point : (isRightOrBottom ? (rulerSize - linePoint) : (rulerSize - (rulerSize - linePoint)));
        var y1 = isHorizontal ? (isRightOrBottom ? rulerSize : (rulerSize - (rulerSize - linePoint))) : point;
        var y2 = isHorizontal ? (isRightOrBottom ? (rulerSize - linePoint) : 0) : point;
        var attr = { 'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2, 'stroke-width': '1', 'stroke': 'black' };
        var line = createSvgElement('line', attr);
        line.setAttribute('class', 'e-ruler-tick');
        return line;
    };
    Ruler.prototype.createTickLabel = function (svg, segment) {
        var text;
        if (segment) {
            var attr = { 'class': 'e-ruler-tick-label' };
            text = createSvgElement('text', attr);
            segment.appendChild(text);
        }
        return text;
    };
    /**
     * @private
     * @param {number} scale
     */
    /**
     * updateSegmentWidth method\
     *
     * @returns {number}    updateSegmentWidth method .\
     * @param {string} scale - provide the scale value.
     *
     * @private
     */
    Ruler.prototype.updateSegmentWidth = function (scale) {
        if (this.segmentWidth !== 100) {
            return this.segmentWidth;
        }
        var five = 25;
        var multiples = 1;
        var div;
        //let scaleRound: number;
        var fifty = 100;
        var scaleRound = Math.pow(2, Math.round(Math.log(scale) / Math.log(2)));
        div = fifty;
        div = (fifty / scaleRound);
        while (div > 100) {
            multiples /= 10;
            div /= 10;
        }
        while (div < 25) {
            multiples *= 10;
            div *= 10;
        }
        if (div >= five && div % five !== 0) {
            div = Math.round(div / five) * five;
        }
        return div * scale / multiples;
    };
    Ruler.prototype.createMarkerLine = function (rulerSvg, rulerObj, attr) {
        var line;
        if (rulerObj) {
            line = rulerSvg.getElementById(rulerObj.id + '_marker');
            if (line) {
                line.parentNode.removeChild(line);
            }
            line = createSvgElement('line', attr);
        }
        return line;
    };
    /**
     * updateSegmentWidth method\
     *
     * @returns {void}    updateSegmentWidth method .\
     * @param {HTMLElement} rulerObj - Defines the ruler Object
     * @param {PointModel} currentPoint - Defines the current point for ruler Object
     * @param {number} offset - Defines the offset ruler Object
     *
     * @private
     */
    Ruler.prototype.drawRulerMarker = function (rulerObj, currentPoint, offset) {
        var rulerSvg;
        var rulerSize;
        var scale;
        var diff;
        var i;
        var attr;
        var line;
        var isHorizontal = this.orientation === 'Horizontal' ? true : false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var rulerSvgElements = rulerObj.getElementsByTagName('svg');
        for (i = 0; i < rulerSvgElements.length; i++) {
            if (rulerSvgElements[i]) {
                rulerSvg = rulerSvgElements[i];
            }
            break;
        }
        if (rulerSvg) {
            rulerSize = this.getRulerSize();
            attr = {
                'id': rulerObj.id + '_marker', 'x1': 0, 'y1': 0, 'x2': (isHorizontal ? 0 : rulerSize),
                'y2': (isHorizontal ? rulerSize : 0), 'stroke': this.markerColor, 'stroke-width': 1.5,
                'class': 'e-d-ruler-marker'
            };
            line = this.createMarkerLine(rulerSvg, rulerObj, attr);
            scale = this.scale;
            diff = this.offset - this.defStartValue;
            var point = isHorizontal ? currentPoint.x : currentPoint.y;
            var move = (point * scale) + offset + diff;
            line.setAttribute('transform', 'translate(' + (isHorizontal ? ((move + 0.5) + ' 0.5') : ('0.5 ' + (move + 0.5))) + ')');
            rulerSvg.appendChild(line);
        }
    };
    Ruler.prototype.getRulerGeometry = function () {
        return new Size(this.element ? this.element.getBoundingClientRect().width : 0, this.element ? this.element.getBoundingClientRect().height : 0);
    };
    Ruler.prototype.getRulerSize = function () {
        return this.thickness;
    };
    Ruler.prototype.getRulerSVG = function (rulerGeometry) {
        var rulerSpace;
        var rulerSize = this.getRulerSize();
        var svg;
        if (this.element) {
            rulerSpace = document.getElementById(this.element.id + '_ruler_space');
            if (rulerSpace) {
                var attr = {
                    'id': this.element.id + '_Ruler_svg',
                    width: this.orientation === 'Horizontal' ? (rulerGeometry.width + 200) : rulerSize + 'px',
                    height: this.orientation === 'Horizontal' ? rulerSize : (rulerGeometry.height + 200) + 'px',
                    style: 'position:inherit;'
                };
                svg = createSvgElement('svg', attr);
                if (rulerSpace.childNodes.length > 0) {
                    for (var i = rulerSpace.childNodes.length - 1; i >= 0; i--) {
                        rulerSpace.childNodes[i].parentNode.removeChild(rulerSpace.childNodes[i]);
                    }
                }
                rulerSpace.appendChild(svg);
            }
        }
        return svg;
    };
    /**
     * Method to bind events for the ruler \
     *
     * @returns {void}    Method to bind events for the ruler .\
     * @private
     */
    Ruler.prototype.wireEvents = function () {
        //wire Events
    };
    /**
     *  Method to unbind events for the ruler \
     *
     * @returns {void}     Method to unbind events for the ruler .\
     * @private
     */
    Ruler.prototype.unWireEvents = function () {
        //unWire Events
    };
    __decorate([
        Property(5)
    ], Ruler.prototype, "interval", void 0);
    __decorate([
        Property(100)
    ], Ruler.prototype, "segmentWidth", void 0);
    __decorate([
        Property('Horizontal')
    ], Ruler.prototype, "orientation", void 0);
    __decorate([
        Property('RightOrBottom')
    ], Ruler.prototype, "tickAlignment", void 0);
    __decorate([
        Property('red')
    ], Ruler.prototype, "markerColor", void 0);
    __decorate([
        Property(25)
    ], Ruler.prototype, "thickness", void 0);
    __decorate([
        Property(null)
    ], Ruler.prototype, "arrangeTick", void 0);
    __decorate([
        Property(400)
    ], Ruler.prototype, "length", void 0);
    return Ruler;
}(Component));
export { Ruler };
