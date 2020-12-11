(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/locking/sync_locker", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SyncLocker = void 0;
    /**
     * SyncLocker is used to prevent more than one instance of ngcc executing at the same time,
     * when being called in a synchronous context.
     *
     * * When ngcc starts executing, it creates a file in the `compiler-cli/ngcc` folder.
     * * If it finds one is already there then it fails with a suitable error message.
     * * When ngcc completes executing, it removes the file so that future ngcc executions can start.
     */
    var SyncLocker = /** @class */ (function () {
        function SyncLocker(lockFile) {
            this.lockFile = lockFile;
        }
        /**
         * Run the given function guarded by the lock file.
         *
         * @param fn the function to run.
         * @returns the value returned from the `fn` call.
         */
        SyncLocker.prototype.lock = function (fn) {
            this.create();
            try {
                return fn();
            }
            finally {
                this.lockFile.remove();
            }
        };
        /**
         * Write a lock file to disk, or error if there is already one there.
         */
        SyncLocker.prototype.create = function () {
            try {
                this.lockFile.write();
            }
            catch (e) {
                if (e.code !== 'EEXIST') {
                    throw e;
                }
                this.handleExistingLockFile();
            }
        };
        /**
         * The lock-file already exists so raise a helpful error.
         */
        SyncLocker.prototype.handleExistingLockFile = function () {
            var pid = this.lockFile.read();
            throw new Error("ngcc is already running at process with id " + pid + ".\n" +
                "If you are running multiple builds in parallel then you should pre-process your node_modules via the command line ngcc tool before starting the builds;\n" +
                "See https://v9.angular.io/guide/ivy#speeding-up-ngcc-compilation.\n" +
                ("(If you are sure no ngcc process is running then you should delete the lock-file at " + this.lockFile.path + ".)"));
        };
        return SyncLocker;
    }());
    exports.SyncLocker = SyncLocker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luY19sb2NrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvbG9ja2luZy9zeW5jX2xvY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFTQTs7Ozs7OztPQU9HO0lBQ0g7UUFDRSxvQkFBb0IsUUFBa0I7WUFBbEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFHLENBQUM7UUFFMUM7Ozs7O1dBS0c7UUFDSCx5QkFBSSxHQUFKLFVBQVEsRUFBVztZQUNqQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZCxJQUFJO2dCQUNGLE9BQU8sRUFBRSxFQUFFLENBQUM7YUFDYjtvQkFBUztnQkFDUixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3hCO1FBQ0gsQ0FBQztRQUVEOztXQUVHO1FBQ08sMkJBQU0sR0FBaEI7WUFDRSxJQUFJO2dCQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdkI7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO29CQUN2QixNQUFNLENBQUMsQ0FBQztpQkFDVDtnQkFDRCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzthQUMvQjtRQUNILENBQUM7UUFFRDs7V0FFRztRQUNPLDJDQUFzQixHQUFoQztZQUNFLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakMsTUFBTSxJQUFJLEtBQUssQ0FDWCxnREFBOEMsR0FBRyxRQUFLO2dCQUN0RCwySkFBMko7Z0JBQzNKLHFFQUFxRTtpQkFDckUseUZBQ0ksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQUksQ0FBQSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNILGlCQUFDO0lBQUQsQ0FBQyxBQTVDRCxJQTRDQztJQTVDWSxnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtMb2NrRmlsZX0gZnJvbSAnLi9sb2NrX2ZpbGUnO1xuXG4vKipcbiAqIFN5bmNMb2NrZXIgaXMgdXNlZCB0byBwcmV2ZW50IG1vcmUgdGhhbiBvbmUgaW5zdGFuY2Ugb2YgbmdjYyBleGVjdXRpbmcgYXQgdGhlIHNhbWUgdGltZSxcbiAqIHdoZW4gYmVpbmcgY2FsbGVkIGluIGEgc3luY2hyb25vdXMgY29udGV4dC5cbiAqXG4gKiAqIFdoZW4gbmdjYyBzdGFydHMgZXhlY3V0aW5nLCBpdCBjcmVhdGVzIGEgZmlsZSBpbiB0aGUgYGNvbXBpbGVyLWNsaS9uZ2NjYCBmb2xkZXIuXG4gKiAqIElmIGl0IGZpbmRzIG9uZSBpcyBhbHJlYWR5IHRoZXJlIHRoZW4gaXQgZmFpbHMgd2l0aCBhIHN1aXRhYmxlIGVycm9yIG1lc3NhZ2UuXG4gKiAqIFdoZW4gbmdjYyBjb21wbGV0ZXMgZXhlY3V0aW5nLCBpdCByZW1vdmVzIHRoZSBmaWxlIHNvIHRoYXQgZnV0dXJlIG5nY2MgZXhlY3V0aW9ucyBjYW4gc3RhcnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBTeW5jTG9ja2VyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBsb2NrRmlsZTogTG9ja0ZpbGUpIHt9XG5cbiAgLyoqXG4gICAqIFJ1biB0aGUgZ2l2ZW4gZnVuY3Rpb24gZ3VhcmRlZCBieSB0aGUgbG9jayBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gZm4gdGhlIGZ1bmN0aW9uIHRvIHJ1bi5cbiAgICogQHJldHVybnMgdGhlIHZhbHVlIHJldHVybmVkIGZyb20gdGhlIGBmbmAgY2FsbC5cbiAgICovXG4gIGxvY2s8VD4oZm46ICgpID0+IFQpOiBUIHtcbiAgICB0aGlzLmNyZWF0ZSgpO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZm4oKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5sb2NrRmlsZS5yZW1vdmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV3JpdGUgYSBsb2NrIGZpbGUgdG8gZGlzaywgb3IgZXJyb3IgaWYgdGhlcmUgaXMgYWxyZWFkeSBvbmUgdGhlcmUuXG4gICAqL1xuICBwcm90ZWN0ZWQgY3JlYXRlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmxvY2tGaWxlLndyaXRlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUuY29kZSAhPT0gJ0VFWElTVCcpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaGFuZGxlRXhpc3RpbmdMb2NrRmlsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbG9jay1maWxlIGFscmVhZHkgZXhpc3RzIHNvIHJhaXNlIGEgaGVscGZ1bCBlcnJvci5cbiAgICovXG4gIHByb3RlY3RlZCBoYW5kbGVFeGlzdGluZ0xvY2tGaWxlKCk6IHZvaWQge1xuICAgIGNvbnN0IHBpZCA9IHRoaXMubG9ja0ZpbGUucmVhZCgpO1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYG5nY2MgaXMgYWxyZWFkeSBydW5uaW5nIGF0IHByb2Nlc3Mgd2l0aCBpZCAke3BpZH0uXFxuYCArXG4gICAgICAgIGBJZiB5b3UgYXJlIHJ1bm5pbmcgbXVsdGlwbGUgYnVpbGRzIGluIHBhcmFsbGVsIHRoZW4geW91IHNob3VsZCBwcmUtcHJvY2VzcyB5b3VyIG5vZGVfbW9kdWxlcyB2aWEgdGhlIGNvbW1hbmQgbGluZSBuZ2NjIHRvb2wgYmVmb3JlIHN0YXJ0aW5nIHRoZSBidWlsZHM7XFxuYCArXG4gICAgICAgIGBTZWUgaHR0cHM6Ly92OS5hbmd1bGFyLmlvL2d1aWRlL2l2eSNzcGVlZGluZy11cC1uZ2NjLWNvbXBpbGF0aW9uLlxcbmAgK1xuICAgICAgICBgKElmIHlvdSBhcmUgc3VyZSBubyBuZ2NjIHByb2Nlc3MgaXMgcnVubmluZyB0aGVuIHlvdSBzaG91bGQgZGVsZXRlIHRoZSBsb2NrLWZpbGUgYXQgJHtcbiAgICAgICAgICAgIHRoaXMubG9ja0ZpbGUucGF0aH0uKWApO1xuICB9XG59XG4iXX0=