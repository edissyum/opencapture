/* eslint-disable @typescript-eslint/no-inferrable-types */
import { createElement, isNullOrUndefined, Browser, remove } from '@syncfusion/ej2-base';
import { Toolbar } from '@syncfusion/ej2-navigations';
import { DateRangePicker } from '@syncfusion/ej2-calendars';
import { getElement } from '../../common/utils/helper';
import { Rect } from '@syncfusion/ej2-svg-base';
/**
 * Period selector class
 */
var PeriodSelector = /** @class */ (function () {
    //constructor for period selector
    function PeriodSelector(control) {
        this.control = {};
        this.rootControl = control;
    }
    /**
     * To set the control values
     *
     * @param control
     * @returns {void}
     */
    PeriodSelector.prototype.setControlValues = function (control) {
        if (control.getModuleName() === 'rangeNavigator') {
            this.control.periods = this.rootControl.periodSelectorSettings.periods;
            this.control.seriesXMax = control.chartSeries.xMax;
            this.control.seriesXMin = control.chartSeries.xMin;
            this.control.rangeSlider = control.rangeSlider;
            this.control.rangeNavigatorControl = control;
            this.control.endValue = control.endValue;
            this.control.startValue = control.startValue;
        }
        else {
            this.control.periods = this.rootControl.periods;
            this.control.endValue = this.control.seriesXMax = control.seriesXMax;
            this.control.startValue = this.control.seriesXMin = control.seriesXMin;
            this.control.rangeNavigatorControl = this.rootControl.rangeNavigator;
            if (this.control.rangeNavigatorControl) {
                this.control.rangeSlider = this.rootControl.rangeNavigator.rangeSlider;
            }
        }
        this.control.element = control.element;
        this.control.disableRangeSelector = control.disableRangeSelector;
    };
    /**
     * To initialize the period selector properties
     *
     * @param options
     * @param x
     * @param options
     * @param x
     */
    PeriodSelector.prototype.appendSelector = function (options, x) {
        if (x === void 0) { x = 0; }
        this.renderSelectorElement(null, options, x);
        this.renderSelector();
    };
    /**
     * renderSelector div
     *
     * @param control
     * @param options
     * @param x
     * @param options
     * @param x
     */
    PeriodSelector.prototype.renderSelectorElement = function (control, options, x) {
        //render border
        this.periodSelectorSize = control ? this.periodSelectorSize : new Rect(x, this.rootControl.titleSize.height, options.width, options.height);
        var thumbSize;
        var element;
        if (control) {
            thumbSize = control.themeStyle.thumbWidth;
            element = control.element;
        }
        else {
            thumbSize = options.thumbSize;
            element = options.element;
        }
        if (getElement(element.id + '_Secondary_Element')) {
            remove(getElement(element.id + '_Secondary_Element'));
        }
        this.periodSelectorDiv = createElement('div', {
            id: element.id + '_Secondary_Element',
            styles: 'width: ' + (this.periodSelectorSize.width - thumbSize) + 'px;height: ' +
                this.periodSelectorSize.height + 'px;top:' +
                this.periodSelectorSize.y + 'px;left:' +
                (this.periodSelectorSize.x + thumbSize / 2) + 'px; position: absolute'
        });
        element.appendChild(this.periodSelectorDiv);
    };
    /**
     * renderSelector elements
     *
     * @returns {void}
     */
    PeriodSelector.prototype.renderSelector = function () {
        var _this = this;
        this.setControlValues(this.rootControl);
        var enableCustom = true;
        var controlId = this.control.element.id;
        var selectorElement = createElement('div', { id: controlId + '_selector' });
        var buttons = this.control.periods;
        var selector = this.updateCustomElement();
        var buttonStyles = 'text-transform: none; text-overflow: unset';
        var isStringTemplate = 'isStringTemplate';
        var dateRangeId = controlId + 'customRange';
        this.periodSelectorDiv.appendChild(selectorElement);
        for (var i = 0; i < buttons.length; i++) {
            selector.push({ align: 'Left', text: buttons[i].text });
        }
        if (this.rootControl.getModuleName() === 'stockChart') {
            enableCustom = this.rootControl.enableCustomRange;
        }
        if (enableCustom) {
            this.calendarId = controlId + '_calendar';
            selector.push({ template: '<button id=' + this.calendarId + '></button>', align: 'Right' });
        }
        var selctorArgs = {
            selector: selector, name: 'RangeSelector', cancel: false, enableCustomFormat: true, content: 'Date Range'
        };
        if (this.rootControl.getModuleName() === 'stockChart') {
            selector.push({ template: createElement('button', { id: controlId + '_reset', innerHTML: 'Reset',
                    styles: buttonStyles, className: 'e-dropdown-btn e-btn' }),
                align: 'Right' });
            if (this.rootControl.exportType.indexOf('Print') > -1) {
                selector.push({ template: createElement('button', { id: controlId + '_print', innerHTML: 'Print', styles: buttonStyles,
                        className: 'e-dropdown-btn e-btn' }),
                    align: 'Right' });
            }
            if (this.rootControl.exportType.length) {
                selector.push({ template: createElement('button', { id: controlId + '_export', innerHTML: 'Export', styles: buttonStyles,
                        className: 'e-dropdown-btn e-btn' }),
                    align: 'Right' });
            }
        }
        this.rootControl.trigger('selectorRender', selctorArgs);
        this.toolbar = new Toolbar({
            items: selctorArgs.selector, height: this.periodSelectorSize.height,
            clicked: function (args) {
                _this.buttonClick(args, _this.control);
            }, created: function () {
                _this.nodes = _this.toolbar.element.querySelectorAll('.e-toolbar-left')[0];
                if (isNullOrUndefined(_this.selectedIndex)) {
                    buttons.map(function (period, index) {
                        if (period.selected) {
                            _this.control.startValue = _this.changedRange(period.intervalType, _this.control.endValue, period.interval).getTime();
                            _this.selectedIndex = (_this.nodes.childNodes.length - buttons.length) + index;
                        }
                    });
                }
                _this.setSelectedStyle(_this.selectedIndex);
            }
        });
        this.toolbar[isStringTemplate] = true;
        this.toolbar.appendTo(selectorElement);
        this.triggerChange = true;
        if (enableCustom) {
            this.datePicker = new DateRangePicker({
                min: new Date(this.control.seriesXMin),
                max: new Date(this.control.seriesXMax),
                // eslint-disable-next-line no-useless-escape
                format: 'dd\'\/\'MM\'\/\'yyyy', placeholder: 'Select a range',
                showClearButton: false, startDate: new Date(this.control.startValue),
                endDate: new Date(this.control.endValue),
                created: function () {
                    if (selctorArgs.enableCustomFormat) {
                        var datePicker = document.getElementsByClassName('e-date-range-wrapper');
                        var datePickerElement = void 0;
                        for (var i = 0; i < datePicker.length; i++) {
                            if (datePicker[i].children[0].id.indexOf(controlId) !== -1) {
                                datePickerElement = datePicker[i];
                            }
                        }
                        datePickerElement.style.display = 'none';
                        datePickerElement.insertAdjacentElement('afterend', createElement('div', {
                            id: dateRangeId,
                            innerHTML: selctorArgs.content, className: 'e-btn e-dropdown-btn',
                            styles: 'font-family: "Segoe UI"; font-size: 14px; font-weight: 500; text-transform: none '
                        }));
                        getElement(dateRangeId).insertAdjacentElement('afterbegin', (createElement('span', {
                            id: controlId + 'dateIcon', className: 'e-input-group-icon e-range-icon e-btn-icon e-icons',
                            styles: 'font-size: 16px; min-height: 0px; margin: -3px 0 0 0; outline: none; min-width: 30px'
                            // fix for date range icon alignment issue.
                        })));
                        document.getElementById(dateRangeId).onclick = function () {
                            _this.datePicker.show(getElement(dateRangeId));
                        };
                    }
                },
                change: function (args) {
                    if (_this.triggerChange) {
                        if (_this.control.rangeSlider && args.event) {
                            _this.control.rangeSlider.performAnimation(args.startDate.getTime(), args.endDate.getTime(), _this.control.rangeNavigatorControl);
                        }
                        else if (args.event) {
                            _this.rootControl.rangeChanged(args.startDate.getTime(), args.endDate.getTime());
                        }
                        _this.nodes = _this.toolbar.element.querySelectorAll('.e-toolbar-left')[0];
                        if (!_this.rootControl.resizeTo && _this.control.rangeSlider && _this.control.rangeSlider.isDrag) {
                            /**
                             * Issue: While disabling range navigator console error throws
                             * Fix:Check with rangeSlider present or not. Then checked with isDrag.
                             */
                            for (var i = 0, length_1 = _this.nodes.childNodes.length; i < length_1; i++) {
                                _this.nodes.childNodes[i].childNodes[0].classList.remove('e-active');
                                _this.nodes.childNodes[i].childNodes[0].classList.remove('e-active');
                            }
                        }
                    }
                }
            });
            this.datePicker.appendTo('#' + this.calendarId);
        }
    };
    PeriodSelector.prototype.updateCustomElement = function () {
        var selector = [];
        var controlId = this.rootControl.element.id;
        var buttonStyles = 'text-transform: none; text-overflow: unset';
        if (this.rootControl.getModuleName() === 'stockChart') {
            if (this.rootControl.seriesType.length) {
                selector.push({ template: createElement('button', { id: controlId + '_seriesType', innerHTML: 'Series',
                        styles: buttonStyles }),
                    align: 'Left' });
            }
            if (this.rootControl.indicatorType.length) {
                selector.push({ template: createElement('button', { id: controlId + '_indicatorType', innerHTML: 'Indicators',
                        styles: buttonStyles }),
                    align: 'Left' });
            }
            if (this.rootControl.trendlineType.length) {
                selector.push({ template: createElement('button', { id: controlId + '_trendType', innerHTML: 'Trendline',
                        styles: buttonStyles }),
                    align: 'Left' });
            }
        }
        return selector;
    };
    /**
     * To set and deselect the acrive style
     *
     * @param buttons
     * @param selectedIndex
     * @returns {void}
     */
    PeriodSelector.prototype.setSelectedStyle = function (selectedIndex) {
        if (this.control.disableRangeSelector || this.rootControl.getModuleName() === 'stockChart') {
            for (var i = 0, length_2 = this.nodes.childNodes.length; i < length_2; i++) {
                this.nodes.childNodes[i].childNodes[0].classList.remove('e-active');
                this.nodes.childNodes[i].childNodes[0].classList.remove('e-active');
            }
            this.nodes.childNodes[selectedIndex].childNodes[0].classList.add('e-flat');
            this.nodes.childNodes[selectedIndex].childNodes[0].classList.add('e-active');
        }
    };
    /**
     * Button click handling
     *
     * @param args
     * @param control
     * @param args
     * @param control
     */
    PeriodSelector.prototype.buttonClick = function (args, control) {
        var _this = this;
        var clickedEle = args.item;
        var slider = this.control.rangeSlider;
        var buttons = this.control.periods;
        var button = buttons.filter(function (btn) { return (btn.text === clickedEle.text); });
        var updatedStart;
        var updatedEnd;
        buttons.map(function (period, index) {
            if (period.text === args.item.text) {
                _this.selectedIndex = (_this.nodes.childNodes.length - buttons.length) + index;
            }
        });
        if (args.item.text !== '') {
            this.setSelectedStyle(this.selectedIndex);
        }
        if (clickedEle.text.toLowerCase() === 'all') {
            updatedStart = control.seriesXMin;
            updatedEnd = control.seriesXMax;
            if (slider) {
                slider.performAnimation(updatedStart, updatedEnd, this.control.rangeNavigatorControl);
            }
            else {
                this.rootControl.rangeChanged(updatedStart, updatedEnd);
            }
        }
        else if (clickedEle.text.toLowerCase() === 'ytd') {
            if (slider) {
                updatedStart = new Date(new Date(slider.currentEnd).getFullYear().toString()).getTime();
                updatedEnd = slider.currentEnd;
                slider.performAnimation(updatedStart, updatedEnd, this.control.rangeNavigatorControl);
            }
            else {
                updatedStart = new Date(new Date(this.rootControl.currentEnd).getFullYear().toString()).getTime();
                updatedEnd = this.rootControl.currentEnd;
                this.rootControl.rangeChanged(updatedStart, updatedEnd);
            }
        }
        else if (clickedEle.text.toLowerCase() !== '') {
            if (slider) {
                updatedStart = this.changedRange(button[0].intervalType, slider.currentEnd, button[0].interval).getTime();
                updatedEnd = slider.currentEnd;
                slider.performAnimation(updatedStart, updatedEnd, this.control.rangeNavigatorControl);
            }
            else {
                updatedStart = this.changedRange(button[0].intervalType, this.rootControl.currentEnd, button[0].interval).getTime();
                updatedEnd = this.rootControl.currentEnd;
                this.rootControl.rangeChanged(updatedStart, updatedEnd);
            }
        }
        if (this.rootControl.getModuleName() === 'stockChart') {
            this.rootControl.zoomChange = false;
        }
        if (getElement(this.calendarId + '_popup') && !Browser.isDevice) {
            var element = getElement(this.calendarId + '_popup');
            element.querySelectorAll('.e-range-header')[0].style.display = 'none';
        }
    };
    /**
     *
     * @param type updatedRange for selector
     * @param end
     * @param interval
     */
    PeriodSelector.prototype.changedRange = function (type, end, interval) {
        var result = new Date(end);
        switch (type) {
            case 'Quarter':
                result.setMonth(result.getMonth() - (3 * interval));
                break;
            case 'Months':
                result.setMonth(result.getMonth() - interval);
                break;
            case 'Weeks':
                result.setDate(result.getDate() - (interval * 7));
                break;
            case 'Days':
                result.setDate(result.getDate() - interval);
                break;
            case 'Hours':
                result.setHours(result.getHours() - interval);
                break;
            case 'Minutes':
                result.setMinutes(result.getMinutes() - interval);
                break;
            case 'Seconds':
                result.setSeconds(result.getSeconds() - interval);
                break;
            default:
                result.setFullYear(result.getFullYear() - interval);
                break;
        }
        return result;
    };
    /**
     * Get module name
     *
     * @returns {string}
     */
    PeriodSelector.prototype.getModuleName = function () {
        return 'PeriodSelector';
    };
    /**
     * To destroy the period selector.
     *
     * @returns {void}
     * @private
     */
    PeriodSelector.prototype.destroy = function () {
        /**
         * destroy method
         */
    };
    return PeriodSelector;
}());
export { PeriodSelector };
