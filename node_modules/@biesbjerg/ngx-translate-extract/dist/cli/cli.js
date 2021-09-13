Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const yargs = require("yargs");
const colorette_1 = require("colorette");
const extract_task_1 = require("./tasks/extract.task");
const pipe_parser_1 = require("../parsers/pipe.parser");
const directive_parser_1 = require("../parsers/directive.parser");
const service_parser_1 = require("../parsers/service.parser");
const marker_parser_1 = require("../parsers/marker.parser");
const sort_by_key_post_processor_1 = require("../post-processors/sort-by-key.post-processor");
const key_as_default_value_post_processor_1 = require("../post-processors/key-as-default-value.post-processor");
const null_as_default_value_post_processor_1 = require("../post-processors/null-as-default-value.post-processor");
const string_as_default_value_post_processor_1 = require("../post-processors/string-as-default-value.post-processor");
const purge_obsolete_keys_post_processor_1 = require("../post-processors/purge-obsolete-keys.post-processor");
const compiler_factory_1 = require("../compilers/compiler.factory");
const fs_helpers_1 = require("../utils/fs-helpers");
const donate_1 = require("../utils/donate");
const y = yargs.option('patterns', {
    alias: 'p',
    describe: 'Default patterns',
    type: 'array',
    default: ['/**/*.html', '/**/*.ts'],
    hidden: true
});
const parsed = y.parse();
exports.cli = y
    .usage('Extract strings from files for translation.\nUsage: $0 [options]')
    .version(require(__dirname + '/../../package.json').version)
    .alias('version', 'v')
    .help('help')
    .alias('help', 'h')
    .option('input', {
    alias: 'i',
    describe: 'Paths you would like to extract strings from. You can use path expansion, glob patterns and multiple paths',
    default: [process.env.PWD],
    type: 'array',
    normalize: true,
    required: true
})
    .coerce('input', (input) => {
    const paths = fs_helpers_1.normalizePaths(input, parsed.patterns);
    return paths;
})
    .option('output', {
    alias: 'o',
    describe: 'Paths where you would like to save extracted strings. You can use path expansion, glob patterns and multiple paths',
    type: 'array',
    normalize: true,
    required: true
})
    .coerce('output', (output) => {
    const paths = fs_helpers_1.normalizePaths(output, parsed.patterns);
    return paths;
})
    .option('format', {
    alias: 'f',
    describe: 'Format',
    default: 'json',
    type: 'string',
    choices: ['json', 'namespaced-json', 'pot']
})
    .option('format-indentation', {
    alias: 'fi',
    describe: 'Format indentation (JSON/Namedspaced JSON)',
    default: '\t',
    type: 'string'
})
    .option('replace', {
    alias: 'r',
    describe: 'Replace the contents of output file if it exists (Merges by default)',
    type: 'boolean'
})
    .option('sort', {
    alias: 's',
    describe: 'Sort strings in alphabetical order',
    type: 'boolean'
})
    .option('clean', {
    alias: 'c',
    describe: 'Remove obsolete strings after merge',
    type: 'boolean'
})
    .option('key-as-default-value', {
    alias: 'k',
    describe: 'Use key as default value',
    type: 'boolean',
    conflicts: ['null-as-default-value', 'string-as-default-value']
})
    .option('null-as-default-value', {
    alias: 'n',
    describe: 'Use null as default value',
    type: 'boolean',
    conflicts: ['key-as-default-value', 'string-as-default-value']
})
    .option('string-as-default-value', {
    alias: 'd',
    describe: 'Use string as default value',
    type: 'string',
    conflicts: ['null-as-default-value', 'key-as-default-value']
})
    .group(['format', 'format-indentation', 'sort', 'clean', 'replace'], 'Output')
    .group(['key-as-default-value', 'null-as-default-value', 'string-as-default-value'], 'Extracted key value (defaults to empty string)')
    .conflicts('key-as-default-value', 'null-as-default-value')
    .example(`$0 -i ./src-a/ -i ./src-b/ -o strings.json`, 'Extract (ts, html) from multiple paths')
    .example(`$0 -i './{src-a,src-b}/' -o strings.json`, 'Extract (ts, html) from multiple paths using brace expansion')
    .example(`$0 -i ./src/ -o ./i18n/da.json -o ./i18n/en.json`, 'Extract (ts, html) and save to da.json and en.json')
    .example(`$0 -i ./src/ -o './i18n/{en,da}.json'`, 'Extract (ts, html) and save to da.json and en.json using brace expansion')
    .example(`$0 -i './src/**/*.{ts,tsx,html}' -o strings.json`, 'Extract from ts, tsx and html')
    .example(`$0 -i './src/**/!(*.spec).{ts,html}' -o strings.json`, 'Extract from ts, html, excluding files with ".spec" in filename')
    .wrap(110)
    .exitProcess(true)
    .parse(process.argv);
const extractTask = new extract_task_1.ExtractTask(exports.cli.input, exports.cli.output, {
    replace: exports.cli.replace
});
const parsers = [new pipe_parser_1.PipeParser(), new directive_parser_1.DirectiveParser(), new service_parser_1.ServiceParser(), new marker_parser_1.MarkerParser()];
extractTask.setParsers(parsers);
const postProcessors = [];
if (exports.cli.clean) {
    postProcessors.push(new purge_obsolete_keys_post_processor_1.PurgeObsoleteKeysPostProcessor());
}
if (exports.cli.keyAsDefaultValue) {
    postProcessors.push(new key_as_default_value_post_processor_1.KeyAsDefaultValuePostProcessor());
}
else if (exports.cli.nullAsDefaultValue) {
    postProcessors.push(new null_as_default_value_post_processor_1.NullAsDefaultValuePostProcessor());
}
else if (exports.cli.stringAsDefaultValue) {
    postProcessors.push(new string_as_default_value_post_processor_1.StringAsDefaultValuePostProcessor({ defaultValue: exports.cli.stringAsDefaultValue }));
}
if (exports.cli.sort) {
    postProcessors.push(new sort_by_key_post_processor_1.SortByKeyPostProcessor());
}
extractTask.setPostProcessors(postProcessors);
const compiler = compiler_factory_1.CompilerFactory.create(exports.cli.format, {
    indentation: exports.cli.formatIndentation
});
extractTask.setCompiler(compiler);
try {
    extractTask.execute();
    console.log(colorette_1.green('\nDone.\n'));
    console.log(donate_1.donateMessage);
    process.exit(0);
}
catch (e) {
    console.log(colorette_1.red(`\nAn error occurred: ${e}\n`));
    process.exit(1);
}
//# sourceMappingURL=cli.js.map