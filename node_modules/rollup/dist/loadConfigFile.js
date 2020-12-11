/*
  @license
	Rollup.js v2.32.1
	Wed, 21 Oct 2020 07:32:18 GMT - commit 51e727c99bfc67a6bc46087c63950cec2a7fe12f


	https://github.com/rollup/rollup

	Released under the MIT License.
*/
'use strict';

require('./shared/rollup.js');
require('fs');
require('path');
require('./shared/mergeOptions.js');
var loadConfigFile_js = require('./shared/loadConfigFile.js');
require('crypto');
require('events');
require('url');



module.exports = loadConfigFile_js.loadAndParseConfigFile;
//# sourceMappingURL=loadConfigFile.js.map
