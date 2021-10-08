import { NonWorkingDay } from '../renderer/nonworking-day';
import { EventMarker } from '../renderer/event-marker';
import { getValue } from '@syncfusion/ej2-base';
/**
 * DayMarkers module is used to render event markers, holidays and to highlight the weekend days.
 */
var DayMarkers = /** @class */ (function () {
    function DayMarkers(parent) {
        this.parent = parent;
        this.nonworkingDayRender = new NonWorkingDay(this.parent);
        this.eventMarkerRender = new EventMarker(this.parent);
        this.wireEvents();
    }
    DayMarkers.prototype.wireEvents = function () {
        this.parent.on('refreshDayMarkers', this.refreshMarkers, this);
        this.parent.on('updateHeight', this.updateHeight, this);
        this.parent.on('ui-update', this.propertyChanged, this);
    };
    DayMarkers.prototype.propertyChanged = function (property) {
        var keys = Object.keys(getValue('properties', property));
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            switch (key) {
                case 'eventMarkers':
                    this.eventMarkerRender.renderEventMarkers();
                    this.updateHeight();
                    break;
                case 'highlightWeekends':
                    this.nonworkingDayRender.renderWeekends();
                    this.updateHeight();
                    break;
                case 'holidays':
                    this.nonworkingDayRender.renderHolidays();
                    this.updateHeight();
                    break;
            }
        }
    };
    DayMarkers.prototype.refreshMarkers = function () {
        this.eventMarkerRender.renderEventMarkers();
        this.nonworkingDayRender.renderWeekends();
        this.nonworkingDayRender.renderHolidays();
    };
    DayMarkers.prototype.updateHeight = function () {
        this.nonworkingDayRender.updateContainerHeight();
        this.eventMarkerRender.updateContainerHeight();
    };
    /**
     * To get module name
     *
     * @returns {string} .
     */
    DayMarkers.prototype.getModuleName = function () {
        return 'dayMarkers';
    };
    /**
     * @returns {void} .
     * @private
     */
    DayMarkers.prototype.destroy = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.nonworkingDayRender.removeContainers();
        this.eventMarkerRender.removeContainer();
        this.parent.off('refreshDayMarkers', this.refreshMarkers);
        this.parent.off('updateHeight', this.updateHeight);
        this.parent.off('ui-update', this.propertyChanged);
    };
    return DayMarkers;
}());
export { DayMarkers };
