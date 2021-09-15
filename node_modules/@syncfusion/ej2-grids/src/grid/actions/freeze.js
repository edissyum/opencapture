import * as events from '../base/constant';
import { RenderType } from '../base/enum';
import { FreezeRender, FreezeContentRender } from '../renderer/freeze-renderer';
import { VirtualFreezeRenderer, VirtualFreezeHdrRenderer, ColumnVirtualFreezeRenderer } from '../renderer/virtual-freeze-renderer';
import { ColumnFreezeContentRenderer, ColumnFreezeHeaderRenderer } from '../renderer/column-freeze-renderer';
/**
 * `Freeze` module is used to handle Frozen rows and columns.
 *
 * @hidden
 */
var Freeze = /** @class */ (function () {
    function Freeze(parent, locator) {
        this.parent = parent;
        this.locator = locator;
        this.addEventListener();
    }
    Freeze.prototype.getModuleName = function () {
        return 'freeze';
    };
    Freeze.prototype.addEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.on(events.initialLoad, this.instantiateRenderer, this);
        this.parent.on(events.destroy, this.destroy, this);
    };
    Freeze.prototype.instantiateRenderer = function () {
        this.parent.log('limitation', this.getModuleName());
        var renderer = this.locator.getService('rendererFactory');
        if (this.parent.getFrozenColumns()) {
            if (this.parent.enableColumnVirtualization) {
                renderer.addRenderer(RenderType.Header, new VirtualFreezeHdrRenderer(this.parent, this.locator));
            }
            else {
                renderer.addRenderer(RenderType.Header, new FreezeRender(this.parent, this.locator));
            }
            if (this.parent.enableVirtualization) {
                renderer.addRenderer(RenderType.Content, new VirtualFreezeRenderer(this.parent, this.locator));
            }
            else {
                renderer.addRenderer(RenderType.Content, new FreezeContentRender(this.parent, this.locator));
            }
        }
        if (this.parent.getFrozenLeftColumnsCount() || this.parent.getFrozenRightColumnsCount()) {
            renderer.addRenderer(RenderType.Header, new ColumnFreezeHeaderRenderer(this.parent, this.locator));
            if (this.parent.enableVirtualization) {
                renderer.addRenderer(RenderType.Content, new ColumnVirtualFreezeRenderer(this.parent, this.locator));
            }
            else {
                renderer.addRenderer(RenderType.Content, new ColumnFreezeContentRenderer(this.parent, this.locator));
            }
        }
    };
    Freeze.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off(events.initialLoad, this.instantiateRenderer);
        this.parent.off(events.destroy, this.destroy);
    };
    Freeze.prototype.destroy = function () {
        this.removeEventListener();
    };
    return Freeze;
}());
export { Freeze };
