"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class HeatMapHelper extends e2e_1.TestHelper {
    constructor(id, wrapperFn) {
        super();
        this.id = id;
        if (wrapperFn !== undefined) {
            this.wrapperFn = wrapperFn;
        }
        return this;
    }
    getHeatMapContainer() {
        return this.selector('#' + this.id);
    }
    getTooltipElement() {
        return this.selector('#' + this.id + 'Celltooltipcontainer');
    }
    getSecondaryElement() {
        return this.selector('#' + this.id + '_Secondary_Element');
    }
    getLegendElement() {
        return this.selector('#' + this.id + '_Heatmap_Legend');
    }
    getAxisElement() {
        return this.selector('#' + this.id + 'AxisCollection');
    }
    getSeriesElement() {
        return this.selector('#' + this.id + 'Celltooltipcontainer');
    }
}
exports.HeatMapHelper = HeatMapHelper;
