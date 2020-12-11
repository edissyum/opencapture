(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system/testing/src/test_helper", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system/src/helpers", "@angular/compiler-cli/src/ngtsc/file_system/src/invalid_file_system", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_native", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_posix", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_windows"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initMockFileSystem = exports.runInEachFileSystem = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /// <reference types="jasmine"/>
    var ts = require("typescript");
    var helpers_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/helpers");
    var invalid_file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/invalid_file_system");
    var mock_file_system_native_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_native");
    var mock_file_system_posix_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_posix");
    var mock_file_system_windows_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_windows");
    var FS_NATIVE = 'Native';
    var FS_OS_X = 'OS/X';
    var FS_UNIX = 'Unix';
    var FS_WINDOWS = 'Windows';
    var FS_ALL = [FS_OS_X, FS_WINDOWS, FS_UNIX, FS_NATIVE];
    function runInEachFileSystemFn(callback) {
        FS_ALL.forEach(function (os) { return runInFileSystem(os, callback, false); });
    }
    function runInFileSystem(os, callback, error) {
        describe("<<FileSystem: " + os + ">>", function () {
            beforeEach(function () { return initMockFileSystem(os); });
            afterEach(function () { return helpers_1.setFileSystem(new invalid_file_system_1.InvalidFileSystem()); });
            callback(os);
            if (error) {
                afterAll(function () {
                    throw new Error("runInFileSystem limited to " + os + ", cannot pass");
                });
            }
        });
    }
    exports.runInEachFileSystem = runInEachFileSystemFn;
    exports.runInEachFileSystem.native = function (callback) {
        return runInFileSystem(FS_NATIVE, callback, true);
    };
    exports.runInEachFileSystem.osX = function (callback) {
        return runInFileSystem(FS_OS_X, callback, true);
    };
    exports.runInEachFileSystem.unix = function (callback) {
        return runInFileSystem(FS_UNIX, callback, true);
    };
    exports.runInEachFileSystem.windows = function (callback) {
        return runInFileSystem(FS_WINDOWS, callback, true);
    };
    function initMockFileSystem(os, cwd) {
        var fs = createMockFileSystem(os, cwd);
        helpers_1.setFileSystem(fs);
        monkeyPatchTypeScript(os, fs);
    }
    exports.initMockFileSystem = initMockFileSystem;
    function createMockFileSystem(os, cwd) {
        switch (os) {
            case 'OS/X':
                return new mock_file_system_posix_1.MockFileSystemPosix(/* isCaseSensitive */ false, cwd);
            case 'Unix':
                return new mock_file_system_posix_1.MockFileSystemPosix(/* isCaseSensitive */ true, cwd);
            case 'Windows':
                return new mock_file_system_windows_1.MockFileSystemWindows(/* isCaseSensitive*/ false, cwd);
            case 'Native':
                return new mock_file_system_native_1.MockFileSystemNative(cwd);
            default:
                throw new Error('FileSystem not supported');
        }
    }
    function monkeyPatchTypeScript(os, fs) {
        ts.sys.directoryExists = function (path) {
            var absPath = fs.resolve(path);
            return fs.exists(absPath) && fs.stat(absPath).isDirectory();
        };
        ts.sys.fileExists = function (path) {
            var absPath = fs.resolve(path);
            return fs.exists(absPath) && fs.stat(absPath).isFile();
        };
        ts.sys.getCurrentDirectory = function () { return fs.pwd(); };
        ts.sys.getDirectories = getDirectories;
        ts.sys.readFile = fs.readFile.bind(fs);
        ts.sys.resolvePath = fs.resolve.bind(fs);
        ts.sys.writeFile = fs.writeFile.bind(fs);
        ts.sys.readDirectory = readDirectory;
        function getDirectories(path) {
            return fs.readdir(helpers_1.absoluteFrom(path)).filter(function (p) { return fs.stat(fs.resolve(path, p)).isDirectory(); });
        }
        function getFileSystemEntries(path) {
            var e_1, _a;
            var files = [];
            var directories = [];
            var absPath = fs.resolve(path);
            var entries = fs.readdir(absPath);
            try {
                for (var entries_1 = tslib_1.__values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                    var entry = entries_1_1.value;
                    if (entry == '.' || entry === '..') {
                        continue;
                    }
                    var absPath_1 = fs.resolve(path, entry);
                    var stat = fs.stat(absPath_1);
                    if (stat.isDirectory()) {
                        directories.push(absPath_1);
                    }
                    else if (stat.isFile()) {
                        files.push(absPath_1);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return { files: files, directories: directories };
        }
        function realPath(path) {
            return fs.realpath(fs.resolve(path));
        }
        // Rather than completely re-implementing we are using the `ts.matchFiles` function,
        // which is internal to the `ts` namespace.
        var tsMatchFiles = ts.matchFiles;
        function readDirectory(path, extensions, excludes, includes, depth) {
            return tsMatchFiles(path, extensions, excludes, includes, fs.isCaseSensitive(), fs.pwd(), depth, getFileSystemEntries, realPath);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2ZpbGVfc3lzdGVtL3Rlc3Rpbmcvc3JjL3Rlc3RfaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxnQ0FBZ0M7SUFDaEMsK0JBQWlDO0lBRWpDLG1GQUE4RDtJQUM5RCwyR0FBZ0U7SUFJaEUsMkhBQStEO0lBQy9ELHlIQUE2RDtJQUM3RCw2SEFBaUU7SUFnQmpFLElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUMzQixJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDdkIsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUM3QixJQUFNLE1BQU0sR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRXpELFNBQVMscUJBQXFCLENBQUMsUUFBOEI7UUFDM0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLGVBQWUsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFwQyxDQUFvQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELFNBQVMsZUFBZSxDQUFDLEVBQVUsRUFBRSxRQUE4QixFQUFFLEtBQWM7UUFDakYsUUFBUSxDQUFDLG1CQUFpQixFQUFFLE9BQUksRUFBRTtZQUNoQyxVQUFVLENBQUMsY0FBTSxPQUFBLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7WUFDekMsU0FBUyxDQUFDLGNBQU0sT0FBQSx1QkFBYSxDQUFDLElBQUksdUNBQWlCLEVBQUUsQ0FBQyxFQUF0QyxDQUFzQyxDQUFDLENBQUM7WUFDeEQsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsUUFBUSxDQUFDO29CQUNQLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQThCLEVBQUUsa0JBQWUsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRVksUUFBQSxtQkFBbUIsR0FDNUIscUJBQThDLENBQUM7SUFFbkQsMkJBQW1CLENBQUMsTUFBTSxHQUFHLFVBQUMsUUFBOEI7UUFDeEQsT0FBQSxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUM7SUFBMUMsQ0FBMEMsQ0FBQztJQUMvQywyQkFBbUIsQ0FBQyxHQUFHLEdBQUcsVUFBQyxRQUE4QjtRQUNyRCxPQUFBLGVBQWUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQztJQUF4QyxDQUF3QyxDQUFDO0lBQzdDLDJCQUFtQixDQUFDLElBQUksR0FBRyxVQUFDLFFBQThCO1FBQ3RELE9BQUEsZUFBZSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDO0lBQXhDLENBQXdDLENBQUM7SUFDN0MsMkJBQW1CLENBQUMsT0FBTyxHQUFHLFVBQUMsUUFBOEI7UUFDekQsT0FBQSxlQUFlLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUM7SUFBM0MsQ0FBMkMsQ0FBQztJQUVoRCxTQUFnQixrQkFBa0IsQ0FBQyxFQUFVLEVBQUUsR0FBb0I7UUFDakUsSUFBTSxFQUFFLEdBQUcsb0JBQW9CLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLHVCQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEIscUJBQXFCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFKRCxnREFJQztJQUVELFNBQVMsb0JBQW9CLENBQUMsRUFBVSxFQUFFLEdBQW9CO1FBQzVELFFBQVEsRUFBRSxFQUFFO1lBQ1YsS0FBSyxNQUFNO2dCQUNULE9BQU8sSUFBSSw0Q0FBbUIsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkUsS0FBSyxNQUFNO2dCQUNULE9BQU8sSUFBSSw0Q0FBbUIsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbEUsS0FBSyxTQUFTO2dCQUNaLE9BQU8sSUFBSSxnREFBcUIsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDcEUsS0FBSyxRQUFRO2dCQUNYLE9BQU8sSUFBSSw4Q0FBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QztnQkFDRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7U0FDL0M7SUFDSCxDQUFDO0lBRUQsU0FBUyxxQkFBcUIsQ0FBQyxFQUFVLEVBQUUsRUFBa0I7UUFDM0QsRUFBRSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsVUFBQSxJQUFJO1lBQzNCLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDOUQsQ0FBQyxDQUFDO1FBQ0YsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsVUFBQSxJQUFJO1lBQ3RCLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDekQsQ0FBQyxDQUFDO1FBQ0YsRUFBRSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxjQUFNLE9BQUEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFSLENBQVEsQ0FBQztRQUM1QyxFQUFFLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDdkMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBRXJDLFNBQVMsY0FBYyxDQUFDLElBQVk7WUFDbEMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLHNCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQTFDLENBQTBDLENBQUMsQ0FBQztRQUNoRyxDQUFDO1FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxJQUFZOztZQUN4QyxJQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7WUFDM0IsSUFBTSxXQUFXLEdBQWEsRUFBRSxDQUFDO1lBQ2pDLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7Z0JBQ3BDLEtBQW9CLElBQUEsWUFBQSxpQkFBQSxPQUFPLENBQUEsZ0NBQUEscURBQUU7b0JBQXhCLElBQU0sS0FBSyxvQkFBQTtvQkFDZCxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTt3QkFDbEMsU0FBUztxQkFDVjtvQkFDRCxJQUFNLFNBQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDeEMsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFPLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7d0JBQ3RCLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBTyxDQUFDLENBQUM7cUJBQzNCO3lCQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFO3dCQUN4QixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQU8sQ0FBQyxDQUFDO3FCQUNyQjtpQkFDRjs7Ozs7Ozs7O1lBQ0QsT0FBTyxFQUFDLEtBQUssT0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVELFNBQVMsUUFBUSxDQUFDLElBQVk7WUFDNUIsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsb0ZBQW9GO1FBQ3BGLDJDQUEyQztRQUMzQyxJQUFNLFlBQVksR0FLcUMsRUFBVSxDQUFDLFVBQVUsQ0FBQztRQUU3RSxTQUFTLGFBQWEsQ0FDbEIsSUFBWSxFQUFFLFVBQWtDLEVBQUUsUUFBZ0MsRUFDbEYsUUFBZ0MsRUFBRSxLQUFjO1lBQ2xELE9BQU8sWUFBWSxDQUNmLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsZUFBZSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFDM0Usb0JBQW9CLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEMsQ0FBQztJQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwiamFzbWluZVwiLz5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2Fic29sdXRlRnJvbSwgc2V0RmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vc3JjL2hlbHBlcnMnO1xuaW1wb3J0IHtJbnZhbGlkRmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vc3JjL2ludmFsaWRfZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aH0gZnJvbSAnLi4vLi4vc3JjL3R5cGVzJztcblxuaW1wb3J0IHtNb2NrRmlsZVN5c3RlbX0gZnJvbSAnLi9tb2NrX2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TW9ja0ZpbGVTeXN0ZW1OYXRpdmV9IGZyb20gJy4vbW9ja19maWxlX3N5c3RlbV9uYXRpdmUnO1xuaW1wb3J0IHtNb2NrRmlsZVN5c3RlbVBvc2l4fSBmcm9tICcuL21vY2tfZmlsZV9zeXN0ZW1fcG9zaXgnO1xuaW1wb3J0IHtNb2NrRmlsZVN5c3RlbVdpbmRvd3N9IGZyb20gJy4vbW9ja19maWxlX3N5c3RlbV93aW5kb3dzJztcblxuZXhwb3J0IGludGVyZmFjZSBUZXN0RmlsZSB7XG4gIG5hbWU6IEFic29sdXRlRnNQYXRoO1xuICBjb250ZW50czogc3RyaW5nO1xuICBpc1Jvb3Q/OiBib29sZWFufHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSdW5JbkVhY2hGaWxlU3lzdGVtRm4ge1xuICAoY2FsbGJhY2s6IChvczogc3RyaW5nKSA9PiB2b2lkKTogdm9pZDtcbiAgd2luZG93cyhjYWxsYmFjazogKG9zOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkO1xuICB1bml4KGNhbGxiYWNrOiAob3M6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQ7XG4gIG5hdGl2ZShjYWxsYmFjazogKG9zOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkO1xuICBvc1goY2FsbGJhY2s6IChvczogc3RyaW5nKSA9PiB2b2lkKTogdm9pZDtcbn1cblxuY29uc3QgRlNfTkFUSVZFID0gJ05hdGl2ZSc7XG5jb25zdCBGU19PU19YID0gJ09TL1gnO1xuY29uc3QgRlNfVU5JWCA9ICdVbml4JztcbmNvbnN0IEZTX1dJTkRPV1MgPSAnV2luZG93cyc7XG5jb25zdCBGU19BTEwgPSBbRlNfT1NfWCwgRlNfV0lORE9XUywgRlNfVU5JWCwgRlNfTkFUSVZFXTtcblxuZnVuY3Rpb24gcnVuSW5FYWNoRmlsZVN5c3RlbUZuKGNhbGxiYWNrOiAob3M6IHN0cmluZykgPT4gdm9pZCkge1xuICBGU19BTEwuZm9yRWFjaChvcyA9PiBydW5JbkZpbGVTeXN0ZW0ob3MsIGNhbGxiYWNrLCBmYWxzZSkpO1xufVxuXG5mdW5jdGlvbiBydW5JbkZpbGVTeXN0ZW0ob3M6IHN0cmluZywgY2FsbGJhY2s6IChvczogc3RyaW5nKSA9PiB2b2lkLCBlcnJvcjogYm9vbGVhbikge1xuICBkZXNjcmliZShgPDxGaWxlU3lzdGVtOiAke29zfT4+YCwgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4gaW5pdE1vY2tGaWxlU3lzdGVtKG9zKSk7XG4gICAgYWZ0ZXJFYWNoKCgpID0+IHNldEZpbGVTeXN0ZW0obmV3IEludmFsaWRGaWxlU3lzdGVtKCkpKTtcbiAgICBjYWxsYmFjayhvcyk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBhZnRlckFsbCgoKSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgcnVuSW5GaWxlU3lzdGVtIGxpbWl0ZWQgdG8gJHtvc30sIGNhbm5vdCBwYXNzYCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgcnVuSW5FYWNoRmlsZVN5c3RlbTogUnVuSW5FYWNoRmlsZVN5c3RlbUZuID1cbiAgICBydW5JbkVhY2hGaWxlU3lzdGVtRm4gYXMgUnVuSW5FYWNoRmlsZVN5c3RlbUZuO1xuXG5ydW5JbkVhY2hGaWxlU3lzdGVtLm5hdGl2ZSA9IChjYWxsYmFjazogKG9zOiBzdHJpbmcpID0+IHZvaWQpID0+XG4gICAgcnVuSW5GaWxlU3lzdGVtKEZTX05BVElWRSwgY2FsbGJhY2ssIHRydWUpO1xucnVuSW5FYWNoRmlsZVN5c3RlbS5vc1ggPSAoY2FsbGJhY2s6IChvczogc3RyaW5nKSA9PiB2b2lkKSA9PlxuICAgIHJ1bkluRmlsZVN5c3RlbShGU19PU19YLCBjYWxsYmFjaywgdHJ1ZSk7XG5ydW5JbkVhY2hGaWxlU3lzdGVtLnVuaXggPSAoY2FsbGJhY2s6IChvczogc3RyaW5nKSA9PiB2b2lkKSA9PlxuICAgIHJ1bkluRmlsZVN5c3RlbShGU19VTklYLCBjYWxsYmFjaywgdHJ1ZSk7XG5ydW5JbkVhY2hGaWxlU3lzdGVtLndpbmRvd3MgPSAoY2FsbGJhY2s6IChvczogc3RyaW5nKSA9PiB2b2lkKSA9PlxuICAgIHJ1bkluRmlsZVN5c3RlbShGU19XSU5ET1dTLCBjYWxsYmFjaywgdHJ1ZSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0TW9ja0ZpbGVTeXN0ZW0ob3M6IHN0cmluZywgY3dkPzogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHtcbiAgY29uc3QgZnMgPSBjcmVhdGVNb2NrRmlsZVN5c3RlbShvcywgY3dkKTtcbiAgc2V0RmlsZVN5c3RlbShmcyk7XG4gIG1vbmtleVBhdGNoVHlwZVNjcmlwdChvcywgZnMpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNb2NrRmlsZVN5c3RlbShvczogc3RyaW5nLCBjd2Q/OiBBYnNvbHV0ZUZzUGF0aCk6IE1vY2tGaWxlU3lzdGVtIHtcbiAgc3dpdGNoIChvcykge1xuICAgIGNhc2UgJ09TL1gnOlxuICAgICAgcmV0dXJuIG5ldyBNb2NrRmlsZVN5c3RlbVBvc2l4KC8qIGlzQ2FzZVNlbnNpdGl2ZSAqLyBmYWxzZSwgY3dkKTtcbiAgICBjYXNlICdVbml4JzpcbiAgICAgIHJldHVybiBuZXcgTW9ja0ZpbGVTeXN0ZW1Qb3NpeCgvKiBpc0Nhc2VTZW5zaXRpdmUgKi8gdHJ1ZSwgY3dkKTtcbiAgICBjYXNlICdXaW5kb3dzJzpcbiAgICAgIHJldHVybiBuZXcgTW9ja0ZpbGVTeXN0ZW1XaW5kb3dzKC8qIGlzQ2FzZVNlbnNpdGl2ZSovIGZhbHNlLCBjd2QpO1xuICAgIGNhc2UgJ05hdGl2ZSc6XG4gICAgICByZXR1cm4gbmV3IE1vY2tGaWxlU3lzdGVtTmF0aXZlKGN3ZCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmlsZVN5c3RlbSBub3Qgc3VwcG9ydGVkJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbW9ua2V5UGF0Y2hUeXBlU2NyaXB0KG9zOiBzdHJpbmcsIGZzOiBNb2NrRmlsZVN5c3RlbSkge1xuICB0cy5zeXMuZGlyZWN0b3J5RXhpc3RzID0gcGF0aCA9PiB7XG4gICAgY29uc3QgYWJzUGF0aCA9IGZzLnJlc29sdmUocGF0aCk7XG4gICAgcmV0dXJuIGZzLmV4aXN0cyhhYnNQYXRoKSAmJiBmcy5zdGF0KGFic1BhdGgpLmlzRGlyZWN0b3J5KCk7XG4gIH07XG4gIHRzLnN5cy5maWxlRXhpc3RzID0gcGF0aCA9PiB7XG4gICAgY29uc3QgYWJzUGF0aCA9IGZzLnJlc29sdmUocGF0aCk7XG4gICAgcmV0dXJuIGZzLmV4aXN0cyhhYnNQYXRoKSAmJiBmcy5zdGF0KGFic1BhdGgpLmlzRmlsZSgpO1xuICB9O1xuICB0cy5zeXMuZ2V0Q3VycmVudERpcmVjdG9yeSA9ICgpID0+IGZzLnB3ZCgpO1xuICB0cy5zeXMuZ2V0RGlyZWN0b3JpZXMgPSBnZXREaXJlY3RvcmllcztcbiAgdHMuc3lzLnJlYWRGaWxlID0gZnMucmVhZEZpbGUuYmluZChmcyk7XG4gIHRzLnN5cy5yZXNvbHZlUGF0aCA9IGZzLnJlc29sdmUuYmluZChmcyk7XG4gIHRzLnN5cy53cml0ZUZpbGUgPSBmcy53cml0ZUZpbGUuYmluZChmcyk7XG4gIHRzLnN5cy5yZWFkRGlyZWN0b3J5ID0gcmVhZERpcmVjdG9yeTtcblxuICBmdW5jdGlvbiBnZXREaXJlY3RvcmllcyhwYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGZzLnJlYWRkaXIoYWJzb2x1dGVGcm9tKHBhdGgpKS5maWx0ZXIocCA9PiBmcy5zdGF0KGZzLnJlc29sdmUocGF0aCwgcCkpLmlzRGlyZWN0b3J5KCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0RmlsZVN5c3RlbUVudHJpZXMocGF0aDogc3RyaW5nKTogRmlsZVN5c3RlbUVudHJpZXMge1xuICAgIGNvbnN0IGZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGRpcmVjdG9yaWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGFic1BhdGggPSBmcy5yZXNvbHZlKHBhdGgpO1xuICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyKGFic1BhdGgpO1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgaWYgKGVudHJ5ID09ICcuJyB8fCBlbnRyeSA9PT0gJy4uJykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFic1BhdGggPSBmcy5yZXNvbHZlKHBhdGgsIGVudHJ5KTtcbiAgICAgIGNvbnN0IHN0YXQgPSBmcy5zdGF0KGFic1BhdGgpO1xuICAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKGFic1BhdGgpO1xuICAgICAgfSBlbHNlIGlmIChzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgIGZpbGVzLnB1c2goYWJzUGF0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7ZmlsZXMsIGRpcmVjdG9yaWVzfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWxQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGZzLnJlYWxwYXRoKGZzLnJlc29sdmUocGF0aCkpO1xuICB9XG5cbiAgLy8gUmF0aGVyIHRoYW4gY29tcGxldGVseSByZS1pbXBsZW1lbnRpbmcgd2UgYXJlIHVzaW5nIHRoZSBgdHMubWF0Y2hGaWxlc2AgZnVuY3Rpb24sXG4gIC8vIHdoaWNoIGlzIGludGVybmFsIHRvIHRoZSBgdHNgIG5hbWVzcGFjZS5cbiAgY29uc3QgdHNNYXRjaEZpbGVzOiAoXG4gICAgICBwYXRoOiBzdHJpbmcsIGV4dGVuc2lvbnM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPnx1bmRlZmluZWQsXG4gICAgICBleGNsdWRlczogUmVhZG9ubHlBcnJheTxzdHJpbmc+fHVuZGVmaW5lZCwgaW5jbHVkZXM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPnx1bmRlZmluZWQsXG4gICAgICB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzOiBib29sZWFuLCBjdXJyZW50RGlyZWN0b3J5OiBzdHJpbmcsIGRlcHRoOiBudW1iZXJ8dW5kZWZpbmVkLFxuICAgICAgZ2V0RmlsZVN5c3RlbUVudHJpZXM6IChwYXRoOiBzdHJpbmcpID0+IEZpbGVTeXN0ZW1FbnRyaWVzLFxuICAgICAgcmVhbHBhdGg6IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZykgPT4gc3RyaW5nW10gPSAodHMgYXMgYW55KS5tYXRjaEZpbGVzO1xuXG4gIGZ1bmN0aW9uIHJlYWREaXJlY3RvcnkoXG4gICAgICBwYXRoOiBzdHJpbmcsIGV4dGVuc2lvbnM/OiBSZWFkb25seUFycmF5PHN0cmluZz4sIGV4Y2x1ZGVzPzogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuICAgICAgaW5jbHVkZXM/OiBSZWFkb25seUFycmF5PHN0cmluZz4sIGRlcHRoPzogbnVtYmVyKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0c01hdGNoRmlsZXMoXG4gICAgICAgIHBhdGgsIGV4dGVuc2lvbnMsIGV4Y2x1ZGVzLCBpbmNsdWRlcywgZnMuaXNDYXNlU2Vuc2l0aXZlKCksIGZzLnB3ZCgpLCBkZXB0aCxcbiAgICAgICAgZ2V0RmlsZVN5c3RlbUVudHJpZXMsIHJlYWxQYXRoKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgRmlsZVN5c3RlbUVudHJpZXMge1xuICByZWFkb25seSBmaWxlczogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xuICByZWFkb25seSBkaXJlY3RvcmllczogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xufVxuIl19