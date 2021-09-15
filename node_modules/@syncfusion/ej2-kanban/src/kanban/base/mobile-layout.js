import { append, createElement, EventHandler, addClass, removeClass } from '@syncfusion/ej2-base';
import { TreeView } from '@syncfusion/ej2-navigations';
import { Popup } from '@syncfusion/ej2-popups';
import * as events from './constant';
import * as cls from './css-constant';
/**
 * Kanban mobile layout rendering module
 *
 */
var MobileLayout = /** @class */ (function () {
    function MobileLayout(parent) {
        this.parent = parent;
    }
    MobileLayout.prototype.renderSwimlaneHeader = function () {
        var toolbarWrapper = createElement('div', {
            className: cls.SWIMLANE_HEADER_CLASS,
            innerHTML: '<div class="' + cls.SWIMLANE_HEADER_TOOLBAR_CLASS + '"><div class="' + cls.TOOLBAR_MENU_CLASS +
                '"><div class="e-icons ' + cls.TOOLBAR_MENU_ICON_CLASS + '"></div></div><div class="' + cls.TOOLBAR_LEVEL_TITLE_CLASS +
                '"><div class="' + cls.TOOLBAR_SWIMLANE_NAME_CLASS + '"></div></div></div>'
        });
        this.parent.element.appendChild(toolbarWrapper);
        EventHandler.add(toolbarWrapper.querySelector('.' + cls.TOOLBAR_MENU_ICON_CLASS), 'click', this.menuClick, this);
    };
    MobileLayout.prototype.renderSwimlaneTree = function () {
        var height = this.parent.element.querySelector('.' + cls.SWIMLANE_HEADER_CLASS).offsetHeight;
        var treeHeight = window.innerHeight - height;
        this.popupOverlay = createElement('div', { className: cls.SWIMLANE_OVERLAY_CLASS, styles: 'height: ' + treeHeight + 'px;' });
        var wrapper = createElement('div', { className: cls.SWIMLANE_CONTENT_CLASS, styles: 'top:' + height + 'px;' });
        var treeWrapper = createElement('div', {
            className: cls.SWIMLANE_RESOURCE_CLASS + ' e-popup-close', styles: 'height: ' + treeHeight + 'px;'
        });
        wrapper.appendChild(treeWrapper);
        wrapper.appendChild(this.popupOverlay);
        this.parent.element.appendChild(wrapper);
        var swimlaneTree = createElement('div', { className: cls.SWIMLANE_TREE_CLASS });
        treeWrapper.appendChild(swimlaneTree);
        this.treeViewObj = new TreeView({
            cssClass: this.parent.cssClass,
            enableRtl: this.parent.enableRtl,
            fields: {
                dataSource: this.parent.layoutModule.kanbanRows,
                id: 'keyField',
                text: 'textField'
            },
            nodeTemplate: this.parent.swimlaneSettings.template,
            nodeClicked: this.treeSwimlaneClick.bind(this),
            drawNode: this.drawNode.bind(this),
        });
        this.treeViewObj.appendTo(swimlaneTree);
        var popupObj = {
            targetType: 'relative',
            actionOnScroll: 'none',
            enableRtl: this.parent.enableRtl,
            zIndex: 10,
            hideAnimation: { name: 'SlideLeftOut', duration: 500 },
            showAnimation: { name: 'SlideLeftIn', duration: 500 },
            viewPortElement: this.parent.element.querySelector('.' + cls.CONTENT_CLASS)
        };
        popupObj.content = this.treeViewObj.element;
        this.treePopup = new Popup(treeWrapper, popupObj);
    };
    MobileLayout.prototype.menuClick = function () {
        if (this.parent.element.querySelector('.' + cls.SWIMLANE_RESOURCE_CLASS).classList.contains('e-popup-open')) {
            this.treePopup.hide();
            removeClass([this.popupOverlay], 'e-enable');
        }
        else {
            var treeNodes = [].slice.call(this.treeViewObj.element.querySelectorAll('.e-list-item'));
            removeClass(treeNodes, 'e-active');
            addClass([treeNodes[this.parent.layoutModule.swimlaneIndex]], 'e-active');
            this.treePopup.show();
            addClass([this.popupOverlay], 'e-enable');
        }
    };
    MobileLayout.prototype.treeSwimlaneClick = function (args) {
        this.treePopup.hide();
        var treeNodes = [].slice.call(this.treeViewObj.element.querySelectorAll('.e-list-item'));
        this.parent.layoutModule.swimlaneIndex = treeNodes.indexOf(args.node);
        this.parent.layoutModule.scrollLeft = 0;
        this.parent.notify(events.dataReady, { processedData: this.parent.kanbanData });
        args.event.preventDefault();
    };
    MobileLayout.prototype.hidePopup = function () {
        this.treePopup.hide();
        removeClass([this.popupOverlay], 'e-enable');
    };
    MobileLayout.prototype.getWidth = function () {
        return (window.innerWidth * 80) / 100;
    };
    MobileLayout.prototype.drawNode = function (args) {
        if (this.parent.swimlaneSettings.template && this.parent.isReact) {
            var templateId = this.parent.element.id + '_treeviewTemplate';
            var treeViewTemplate = this.parent.templateParser(this.parent.swimlaneSettings.template)(args.nodeData, this.parent, 'nodeTemplate', templateId, false);
            append(treeViewTemplate, args.node.querySelector('.e-list-text'));
        }
    };
    return MobileLayout;
}());
export { MobileLayout };
