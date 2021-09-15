"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const e2e_1 = require("@syncfusion/ej2-base/helpers/e2e");
class SmithChartHelper extends e2e_1.TestHelper {
    constructor(id, wrapperFn) {
        super();
        this.id = id;
        if (wrapperFn !== undefined) {
            this.wrapperFn = wrapperFn;
        }
        return this;
    }
    getSmithchartContainer() {
        return this.selector('#' + this.id);
    }
    getTitlegroupElement() {
        return this.selector('#' + this.id + '_Title_Group');
    }
    getHorizontalAxisMajorGridLinesElement() {
        return this.selector('#' + this.id + '_svg_horizontalAxisMajorGridLines');
    }
    gethAxisLineElement() {
        return this.selector('#' + this.id + '_svg_hAxisLine');
    }
    getRadialAxisMajorGridLinesElement() {
        return this.selector('#' + this.id + '_svg_radialAxisMajorGridLines');
    }
    getRAxisLineElement() {
        return this.selector('#' + this.id + '_svg_rAxisLine');
    }
    getHAxisLabelsElement() {
        return this.selector('#' + this.id + '_HAxisLabels');
    }
    getRAxisLabelsElement() {
        return this.selector('#' + this.id + '_RAxisLabels');
    }
    getseriesCollectionsElement() {
        return this.selector('#' + this.id + '_svg_seriesCollections');
    }
    getMarkerElement() {
        return this.selector('#' + this.id + '_svg_series1_Marker');
    }
    getSecondaryElement() {
        return this.selector('#' + this.id + '_Secondary_Element');
    }
    getLegendElement() {
        return this.selector('#' + this.id + 'legendItem_Group');
    }
}
exports.SmithChartHelper = SmithChartHelper;
