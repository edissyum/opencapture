import { initialLoad } from '../base/constant';
import { RenderType } from '../base/enum';
import { VirtualContentRenderer, VirtualHeaderRenderer } from '../renderer/virtual-content-renderer';
import * as events from '../base/constant';
import { RowRenderer } from '../renderer/row-renderer';
import { extend, getValue, isNullOrUndefined, remove } from '@syncfusion/ej2-base';
import { setComplexFieldID, setValidationRuels, getColumnModelByUid } from '../base/util';
/**
 * Virtual Scrolling class
 */
var VirtualScroll = /** @class */ (function () {
    function VirtualScroll(parent, locator) {
        this.parent = parent;
        this.locator = locator;
        this.addEventListener();
    }
    VirtualScroll.prototype.getModuleName = function () {
        return 'virtualscroll';
    };
    VirtualScroll.prototype.instantiateRenderer = function () {
        this.parent.log(['limitation', 'virtual_height'], 'virtualization');
        var renderer = this.locator.getService('rendererFactory');
        if (!this.parent.isFrozenGrid()) {
            if (this.parent.enableColumnVirtualization) {
                renderer.addRenderer(RenderType.Header, new VirtualHeaderRenderer(this.parent, this.locator));
            }
            renderer.addRenderer(RenderType.Content, new VirtualContentRenderer(this.parent, this.locator));
        }
        this.ensurePageSize();
    };
    VirtualScroll.prototype.ensurePageSize = function () {
        var rowHeight = this.parent.getRowHeight();
        var vHeight = this.parent.height.toString().indexOf('%') < 0 ? this.parent.height :
            this.parent.element.getBoundingClientRect().height;
        this.blockSize = ~~(vHeight / rowHeight);
        var height = this.blockSize * 2;
        var size = this.parent.pageSettings.pageSize;
        this.parent.setProperties({ pageSettings: { pageSize: size < height ? height : size } }, true);
    };
    VirtualScroll.prototype.addEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.on(initialLoad, this.instantiateRenderer, this);
        this.parent.on(events.columnWidthChanged, this.refreshVirtualElement, this);
        this.parent.on(events.createVirtualValidationForm, this.createVirtualValidationForm, this);
        this.parent.on(events.validateVirtualForm, this.virtualEditFormValidation, this);
        this.parent.on(events.destroy, this.destroy, this);
    };
    VirtualScroll.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off(initialLoad, this.instantiateRenderer);
        this.parent.off(events.columnWidthChanged, this.refreshVirtualElement);
        this.parent.off(events.createVirtualValidationForm, this.createVirtualValidationForm);
        this.parent.off(events.validateVirtualForm, this.virtualEditFormValidation);
        this.parent.off(events.destroy, this.destroy);
    };
    VirtualScroll.prototype.getCurrentEditedData = function (prevData) {
        var data = {
            virtualData: extend({}, {}, prevData, true), isAdd: false, isScroll: false, endEdit: true
        };
        this.parent.notify(events.getVirtualData, data);
        return data.virtualData;
    };
    VirtualScroll.prototype.createVirtualValidationForm = function (e) {
        var gObj = this.parent;
        if (gObj.enableVirtualization && gObj.editSettings.mode === 'Normal') {
            var cols = gObj.columns;
            var rowRenderer = new RowRenderer(this.locator, null, this.parent);
            var rowObj = extend({}, {}, gObj.getRowObjectFromUID(e.uid), true);
            gObj.notify(events.refreshVirtualEditFormCells, rowObj);
            var args = e.argsCreator(this.getCurrentEditedData(e.prevData), {}, false);
            args.isCustomFormValidation = true;
            args.row = rowRenderer.render(rowObj, cols);
            e.renderer.update(args);
            var rules = {};
            for (var i = 0; i < cols.length; i++) {
                if (!cols[i].visible) {
                    continue;
                }
                if (cols[i].validationRules) {
                    setValidationRuels(cols[i], 0, rules, {}, {}, cols.length, true);
                }
            }
            args.form.classList.add('e-virtual-validation');
            gObj.editModule.virtualFormObj = gObj.editModule.createFormObj(args.form, rules);
        }
    };
    VirtualScroll.prototype.virtualEditFormValidation = function (args) {
        var gObj = this.parent;
        var error = gObj.element.querySelector('.e-griderror:not([style*="display: none"])');
        if (gObj.editModule.virtualFormObj) {
            if (error && error.style.display !== 'none') {
                var errorDomRect = error.getBoundingClientRect();
                var forms = gObj.element.querySelectorAll('.e-gridform');
                var form = forms[0];
                var contentLeft = gObj.getContent().getBoundingClientRect().left;
                if (forms.length > 1) {
                    form = gObj.getFrozenMode() !== 'Right' ? forms[1] : forms[0];
                    contentLeft = gObj.getMovableVirtualContent().getBoundingClientRect().left;
                }
                if (errorDomRect.left < contentLeft || errorDomRect.right > gObj.element.offsetWidth) {
                    var tooltip = form.querySelector('.e-tooltip-wrap:not([style*="display: none"])');
                    this.scrollToEdit(tooltip, { editIdx: args.editIdx, addIdx: args.addIdx }, true);
                }
            }
            else if (gObj.editModule.virtualFormObj && (!error || error.style.display === 'none')) {
                var existingErrors = gObj.editModule.virtualFormObj.element.querySelectorAll('.e-tooltip-wrap:not([style*="display: none"])');
                for (var i = 0; i < existingErrors.length; i++) {
                    remove(existingErrors[i]);
                }
                this.setEditedDataToValidationForm(gObj.editModule.virtualFormObj.element, this.getCurrentEditedData(args.prevData));
                args.isValid = gObj.editModule.virtualFormObj.validate();
                if (!args.isValid) {
                    var tooltip = gObj.editModule.virtualFormObj.element.querySelector('.e-tooltip-wrap:not([style*="display: none"])');
                    this.scrollToEdit(tooltip, { editIdx: args.editIdx, addIdx: args.addIdx });
                }
            }
        }
    };
    VirtualScroll.prototype.scrollToEdit = function (tooltip, args, isRenderer) {
        var gObj = this.parent;
        if (tooltip) {
            var cols = gObj.columnModel;
            var field = setComplexFieldID(tooltip.id).split('_')[0];
            var col = gObj.getColumnByField(field);
            var scrollTop = this.parent.getContent().firstElementChild.scrollTop;
            var row = gObj.getRowByIndex(args.editIdx);
            if (isRenderer || !col || (!isNullOrUndefined(args.addIdx) && scrollTop > 0) || (!isNullOrUndefined(args.editIdx) && !row)) {
                var validationCol = void 0;
                for (var i = 0; i < cols.length && !col; i++) {
                    if (cols[i].field === field) {
                        validationCol = cols[i];
                        break;
                    }
                }
                if (isRenderer) {
                    validationCol = col;
                }
                this.parent.notify(events.scrollToEdit, validationCol);
            }
        }
    };
    VirtualScroll.prototype.setEditedDataToValidationForm = function (form, editedData) {
        var inputs = [].slice.call(form.getElementsByClassName('e-field'));
        for (var i = 0, len = inputs.length; i < len; i++) {
            var col = getColumnModelByUid(this.parent, inputs[i].getAttribute('e-mappinguid'));
            var value = getValue(col.field, editedData);
            value = isNullOrUndefined(value) ? '' : value;
            inputs[i].value = value;
        }
    };
    VirtualScroll.prototype.refreshVirtualElement = function (args) {
        if (this.parent.enableColumnVirtualization && args.module === 'resize') {
            var renderer = this.locator.getService('rendererFactory');
            renderer.getRenderer(RenderType.Content).refreshVirtualElement();
        }
    };
    VirtualScroll.prototype.destroy = function () {
        this.removeEventListener();
    };
    return VirtualScroll;
}());
export { VirtualScroll };
