"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class SparklineHelper extends e2e_1.TestHelper {
    constructor(id, wrapperFn) {
        super();
        this.id = id;
        if (wrapperFn !== undefined) {
            this.wrapperFn = wrapperFn;
        }
        return this;
    }
    getSparklineContainer() {
        return this.selector('#' + this.id);
    }
    getLinePathElement() {
        return this.selector('#' + this.id + '_sparkline_line');
    }
    getAreaElement() {
        return this.selector('#' + this.id + '_sparkline_area_str');
    }
    getColumnElement() {
        return this.selector('#' + this.id + '_sparkline_column_0');
    }
    getWinlossElement() {
        return this.selector('#' + this.id + '_sparkline_winloss_0');
    }
    getPieElement() {
        return this.selector('#' + this.id + '_sparkline_pie_0');
    }
    getMarkerGroupElement() {
        return this.selector('#' + this.id + '_sparkline_marker_g');
    }
    getLabelGroupElement() {
        return this.selector('#' + this.id + '_sparkline_label_g');
    }
    getTooltipElement() {
        return this.selector('#' + this.id + '_Secondary_Element');
    }
}
exports.SparklineHelper = SparklineHelper;
