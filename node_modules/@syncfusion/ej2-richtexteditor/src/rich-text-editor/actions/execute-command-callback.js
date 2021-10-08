import * as events from '../base/constant';
/**
 * `ExecCommandCallBack` module is used to run the editor manager command
 */
var ExecCommandCallBack = /** @class */ (function () {
    function ExecCommandCallBack(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    ExecCommandCallBack.prototype.addEventListener = function () {
        this.parent.on(events.execCommandCallBack, this.commandCallBack, this);
        this.parent.on(events.destroy, this.removeEventListener, this);
    };
    ExecCommandCallBack.prototype.commandCallBack = function (args) {
        if (args.requestType !== 'Undo' && args.requestType !== 'Redo') {
            this.parent.formatter.saveData();
        }
        this.parent.notify(events.toolbarRefresh, { args: args });
        this.parent.notify(events.count, {});
    };
    ExecCommandCallBack.prototype.removeEventListener = function () {
        this.parent.off(events.execCommandCallBack, this.commandCallBack);
        this.parent.off(events.destroy, this.removeEventListener);
    };
    return ExecCommandCallBack;
}());
export { ExecCommandCallBack };
