"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _os = _interopRequireDefault(require("os"));

var _crypto = _interopRequireDefault(require("crypto"));

var _webpack = _interopRequireDefault(require("webpack"));

var _schemaUtils = require("schema-utils");

var _pLimit = _interopRequireDefault(require("p-limit"));

var _globby = _interopRequireDefault(require("globby"));

var _findCacheDir = _interopRequireDefault(require("find-cache-dir"));

var _serializeJavascript = _interopRequireDefault(require("serialize-javascript"));

var _cacache = _interopRequireDefault(require("cacache"));

var _loaderUtils = _interopRequireDefault(require("loader-utils"));

var _normalizePath = _interopRequireDefault(require("normalize-path"));

var _globParent = _interopRequireDefault(require("glob-parent"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _package = require("../package.json");

var _options = _interopRequireDefault(require("./options.json"));

var _promisify = require("./utils/promisify");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// webpack 5 exposes the sources property to ensure the right version of webpack-sources is used
const {
  RawSource
} = // eslint-disable-next-line global-require
_webpack.default.sources || require('webpack-sources');

const template = /(\[ext\])|(\[name\])|(\[path\])|(\[folder\])|(\[emoji(?::(\d+))?\])|(\[(?:([^:\]]+):)?(?:hash|contenthash)(?::([a-z]+\d*))?(?::(\d+))?\])|(\[\d+\])/;

class CopyPlugin {
  constructor(options = {}) {
    (0, _schemaUtils.validate)(_options.default, options, {
      name: 'Copy Plugin',
      baseDataPath: 'options'
    });
    this.patterns = options.patterns;
    this.options = options.options || {};
  } // eslint-disable-next-line class-methods-use-this


  async runPattern(compiler, compilation, logger, inputPattern) {
    const pattern = typeof inputPattern === 'string' ? {
      from: inputPattern
    } : { ...inputPattern
    };
    pattern.fromOrigin = pattern.from;
    pattern.from = _path.default.normalize(pattern.from);
    pattern.to = _path.default.normalize(typeof pattern.to !== 'undefined' ? pattern.to : '');
    pattern.context = _path.default.normalize(typeof pattern.context !== 'undefined' ? !_path.default.isAbsolute(pattern.context) ? _path.default.join(compiler.options.context, pattern.context) : pattern.context : compiler.options.context);
    logger.debug(`processing from "${pattern.from}" to "${pattern.to}"`);

    const isToDirectory = _path.default.extname(pattern.to) === '' || pattern.to.slice(-1) === _path.default.sep;

    switch (true) {
      // if toType already exists
      case !!pattern.toType:
        break;

      case template.test(pattern.to):
        pattern.toType = 'template';
        break;

      case isToDirectory:
        pattern.toType = 'dir';
        break;

      default:
        pattern.toType = 'file';
    }

    if (_path.default.isAbsolute(pattern.from)) {
      pattern.absoluteFrom = pattern.from;
    } else {
      pattern.absoluteFrom = _path.default.resolve(pattern.context, pattern.from);
    }

    logger.debug(`getting stats for "${pattern.absoluteFrom}" to determinate "fromType"`);
    const {
      inputFileSystem
    } = compiler;
    let stats;

    try {
      stats = await (0, _promisify.stat)(inputFileSystem, pattern.absoluteFrom);
    } catch (error) {// Nothing
    }

    if (stats) {
      if (stats.isDirectory()) {
        pattern.fromType = 'dir';
      } else if (stats.isFile()) {
        pattern.fromType = 'file';
      }
    } // eslint-disable-next-line no-param-reassign


    pattern.globOptions = { ...{
        followSymbolicLinks: true
      },
      ...(pattern.globOptions || {}),
      ...{
        cwd: pattern.context,
        objectMode: true
      }
    }; // TODO remove after drop webpack@4

    if (inputFileSystem.lstat && inputFileSystem.stat && inputFileSystem.lstatSync && inputFileSystem.statSync && inputFileSystem.readdir && inputFileSystem.readdirSync) {
      pattern.globOptions.fs = inputFileSystem;
    }

    switch (pattern.fromType) {
      case 'dir':
        logger.debug(`determined "${pattern.absoluteFrom}" is a directory`);
        compilation.contextDependencies.add(pattern.absoluteFrom);
        logger.debug(`add "${pattern.absoluteFrom}" as a context dependency`);
        /* eslint-disable no-param-reassign */

        pattern.context = pattern.absoluteFrom;
        pattern.glob = _path.default.posix.join(_fastGlob.default.escapePath((0, _normalizePath.default)(_path.default.resolve(pattern.absoluteFrom))), '**/*');
        pattern.absoluteFrom = _path.default.join(pattern.absoluteFrom, '**/*');

        if (typeof pattern.globOptions.dot === 'undefined') {
          pattern.globOptions.dot = true;
        }
        /* eslint-enable no-param-reassign */


        break;

      case 'file':
        logger.debug(`determined "${pattern.absoluteFrom}" is a file`);
        compilation.fileDependencies.add(pattern.absoluteFrom);
        logger.debug(`add "${pattern.absoluteFrom}" as a file dependency`);
        /* eslint-disable no-param-reassign */

        pattern.context = _path.default.dirname(pattern.absoluteFrom);
        pattern.glob = _fastGlob.default.escapePath((0, _normalizePath.default)(_path.default.resolve(pattern.absoluteFrom)));

        if (typeof pattern.globOptions.dot === 'undefined') {
          pattern.globOptions.dot = true;
        }
        /* eslint-enable no-param-reassign */


        break;

      default:
        {
          logger.debug(`determined "${pattern.absoluteFrom}" is a glob`);

          const contextDependencies = _path.default.normalize((0, _globParent.default)(pattern.absoluteFrom));

          compilation.contextDependencies.add(contextDependencies);
          logger.debug(`add "${contextDependencies}" as a context dependency`);
          /* eslint-disable no-param-reassign */

          pattern.fromType = 'glob';
          pattern.glob = _path.default.isAbsolute(pattern.fromOrigin) ? pattern.fromOrigin : _path.default.posix.join(_fastGlob.default.escapePath((0, _normalizePath.default)(_path.default.resolve(pattern.context))), pattern.fromOrigin);
          /* eslint-enable no-param-reassign */
        }
    }

    logger.log(`begin globbing "${pattern.glob}" with a context of "${pattern.context}"`);
    const paths = await (0, _globby.default)(pattern.glob, pattern.globOptions);

    if (paths.length === 0) {
      if (pattern.noErrorOnMissing) {
        return Promise.resolve();
      }

      const missingError = new Error(`unable to locate "${pattern.from}" at "${pattern.absoluteFrom}"`);
      logger.error(missingError.message);
      compilation.errors.push(missingError);
      return Promise.resolve();
    }

    const filteredPaths = (await Promise.all(paths.map(async item => {
      // Exclude directories
      if (!item.dirent.isFile()) {
        return false;
      }

      if (pattern.filter) {
        const isFiltered = await pattern.filter(item.path);
        return isFiltered ? item : false;
      }

      return item;
    }))).filter(item => item);

    if (filteredPaths.length === 0) {
      return Promise.resolve();
    }

    const files = filteredPaths.map(item => {
      const from = item.path;
      logger.debug(`found "${from}"`); // `globby`/`fast-glob` return the relative path when the path contains special characters on windows

      const absoluteFrom = _path.default.resolve(pattern.context, from);

      const relativeFrom = pattern.flatten ? _path.default.basename(absoluteFrom) : _path.default.relative(pattern.context, absoluteFrom);
      let webpackTo = pattern.toType === 'dir' ? _path.default.join(pattern.to, relativeFrom) : pattern.to;

      if (_path.default.isAbsolute(webpackTo)) {
        webpackTo = _path.default.relative(compiler.options.output.path, webpackTo);
      }

      logger.log(`determined that "${from}" should write to "${webpackTo}"`);
      return {
        absoluteFrom,
        relativeFrom,
        webpackTo
      };
    });
    return Promise.all(files.map(async file => {
      // If this came from a glob, add it to the file watchlist
      if (pattern.fromType === 'glob') {
        logger.debug(`add ${file.absoluteFrom} as fileDependencies`);
        compilation.fileDependencies.add(file.absoluteFrom);
      }

      logger.debug(`reading "${file.absoluteFrom}" to write to assets`);
      let data;

      try {
        data = await (0, _promisify.readFile)(inputFileSystem, file.absoluteFrom);
      } catch (error) {
        compilation.errors.push(error);
        return;
      }

      if (pattern.transform) {
        logger.log(`transforming content for "${file.absoluteFrom}"`);

        if (pattern.cacheTransform) {
          const cacheDirectory = pattern.cacheTransform.directory ? pattern.cacheTransform.directory : typeof pattern.cacheTransform === 'string' ? pattern.cacheTransform : (0, _findCacheDir.default)({
            name: 'copy-webpack-plugin'
          }) || _os.default.tmpdir();
          let defaultCacheKeys = {
            version: _package.version,
            transform: pattern.transform,
            contentHash: _crypto.default.createHash('md4').update(data).digest('hex')
          };

          if (typeof pattern.cacheTransform.keys === 'function') {
            defaultCacheKeys = await pattern.cacheTransform.keys(defaultCacheKeys, file.absoluteFrom);
          } else {
            defaultCacheKeys = { ...defaultCacheKeys,
              ...pattern.cacheTransform.keys
            };
          }

          const cacheKeys = (0, _serializeJavascript.default)(defaultCacheKeys);

          try {
            const result = await _cacache.default.get(cacheDirectory, cacheKeys);
            logger.debug(`getting cached transformation for "${file.absoluteFrom}"`);
            ({
              data
            } = result);
          } catch (_ignoreError) {
            data = await pattern.transform(data, file.absoluteFrom);
            logger.debug(`caching transformation for "${file.absoluteFrom}"`);
            await _cacache.default.put(cacheDirectory, cacheKeys, data);
          }
        } else {
          data = await pattern.transform(data, file.absoluteFrom);
        }
      }

      if (pattern.toType === 'template') {
        logger.log(`interpolating template "${file.webpackTo}" for "${file.relativeFrom}"`); // If it doesn't have an extension, remove it from the pattern
        // ie. [name].[ext] or [name][ext] both become [name]

        if (!_path.default.extname(file.relativeFrom)) {
          // eslint-disable-next-line no-param-reassign
          file.webpackTo = file.webpackTo.replace(/\.?\[ext]/g, '');
        } // eslint-disable-next-line no-param-reassign


        file.immutable = /\[(?:([^:\]]+):)?(?:hash|contenthash)(?::([a-z]+\d*))?(?::(\d+))?\]/gi.test(file.webpackTo); // eslint-disable-next-line no-param-reassign

        file.webpackTo = _loaderUtils.default.interpolateName({
          resourcePath: file.absoluteFrom
        }, file.webpackTo, {
          content: data,
          context: pattern.context
        }); // Bug in `loader-utils`, package convert `\\` to `/`, need fix in loader-utils
        // eslint-disable-next-line no-param-reassign

        file.webpackTo = _path.default.normalize(file.webpackTo);
      }

      if (pattern.transformPath) {
        logger.log(`transforming path "${file.webpackTo}" for "${file.absoluteFrom}"`); // eslint-disable-next-line no-param-reassign

        file.immutable = false; // eslint-disable-next-line no-param-reassign

        file.webpackTo = await pattern.transformPath(file.webpackTo, file.absoluteFrom);
      } // eslint-disable-next-line no-param-reassign


      file.data = data; // eslint-disable-next-line no-param-reassign

      file.targetPath = (0, _normalizePath.default)(file.webpackTo); // eslint-disable-next-line no-param-reassign

      file.force = pattern.force; // eslint-disable-next-line consistent-return

      return file;
    }));
  }

  apply(compiler) {
    const pluginName = this.constructor.name;
    const limit = (0, _pLimit.default)(this.options.concurrency || 100);
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      const logger = compilation.getLogger('copy-webpack-plugin');
      compilation.hooks.additionalAssets.tapAsync('copy-webpack-plugin', async callback => {
        logger.debug('start to adding additional assets');
        let assets;

        try {
          assets = await Promise.all(this.patterns.map(item => limit(async () => this.runPattern(compiler, compilation, logger, item))));
        } catch (error) {
          compilation.errors.push(error);
          callback();
          return;
        } // Avoid writing assets inside `p-limit`, because it creates concurrency.
        // It could potentially lead to an error - "Multiple assets emit different content to the same filename"


        assets.reduce((acc, val) => acc.concat(val), []).filter(Boolean).forEach(asset => {
          const {
            absoluteFrom,
            targetPath,
            webpackTo,
            data,
            force
          } = asset;
          const source = new RawSource(data); // For old version webpack 4

          /* istanbul ignore if */

          if (typeof compilation.emitAsset !== 'function') {
            // eslint-disable-next-line no-param-reassign
            compilation.assets[targetPath] = source;
            return;
          }

          const existingAsset = compilation.getAsset(targetPath);

          if (existingAsset) {
            if (force) {
              logger.log(`force updating "${webpackTo}" to compilation assets from "${absoluteFrom}"`);
              const info = {
                copied: true
              };

              if (asset.immutable) {
                info.immutable = true;
              }

              compilation.updateAsset(targetPath, source, info);
              return;
            }

            logger.log(`skipping "${webpackTo}", because it already exists`);
            return;
          }

          logger.log(`writing "${webpackTo}" to compilation assets from "${absoluteFrom}"`);
          const info = {
            copied: true
          };

          if (asset.immutable) {
            info.immutable = true;
          }

          compilation.emitAsset(targetPath, source, info);
        });
        logger.debug('end to adding additional assets');
        callback();
      });

      if (compilation.hooks.statsPrinter) {
        compilation.hooks.statsPrinter.tap(pluginName, stats => {
          stats.hooks.print.for('asset.info.copied').tap('copy-webpack-plugin', (copied, {
            green,
            formatFlag
          }) => // eslint-disable-next-line no-undefined
          copied ? green(formatFlag('copied')) : undefined);
        });
      }
    });
  }

}

var _default = CopyPlugin;
exports.default = _default;