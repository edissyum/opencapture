Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractTask = void 0;
const translation_collection_1 = require("../../utils/translation.collection");
const colorette_1 = require("colorette");
const glob = require("glob");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
class ExtractTask {
    constructor(inputs, outputs, options) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.options = {
            replace: false
        };
        this.parsers = [];
        this.postProcessors = [];
        this.inputs = inputs.map((input) => path.resolve(input));
        this.outputs = outputs.map((output) => path.resolve(output));
        this.options = { ...this.options, ...options };
    }
    execute() {
        if (!this.compiler) {
            throw new Error('No compiler configured');
        }
        this.printEnabledParsers();
        this.printEnabledPostProcessors();
        this.printEnabledCompiler();
        this.out(colorette_1.bold('Extracting:'));
        const extracted = this.extract();
        this.out(colorette_1.green(`\nFound %d strings.\n`), extracted.count());
        this.out(colorette_1.bold('Saving:'));
        this.outputs.forEach((output) => {
            let dir = output;
            let filename = `strings.${this.compiler.extension}`;
            if (!fs.existsSync(output) || !fs.statSync(output).isDirectory()) {
                dir = path.dirname(output);
                filename = path.basename(output);
            }
            const outputPath = path.join(dir, filename);
            let existing = new translation_collection_1.TranslationCollection();
            if (!this.options.replace && fs.existsSync(outputPath)) {
                try {
                    existing = this.compiler.parse(fs.readFileSync(outputPath, 'utf-8'));
                }
                catch (e) {
                    this.out(`%s %s`, colorette_1.dim(`- ${outputPath}`), colorette_1.red(`[ERROR]`));
                    throw e;
                }
            }
            const draft = extracted.union(existing);
            const final = this.process(draft, extracted, existing);
            try {
                let event = 'CREATED';
                if (fs.existsSync(outputPath)) {
                    this.options.replace ? (event = 'REPLACED') : (event = 'MERGED');
                }
                this.save(outputPath, final);
                this.out(`%s %s`, colorette_1.dim(`- ${outputPath}`), colorette_1.green(`[${event}]`));
            }
            catch (e) {
                this.out(`%s %s`, colorette_1.dim(`- ${outputPath}`), colorette_1.red(`[ERROR]`));
                throw e;
            }
        });
    }
    setParsers(parsers) {
        this.parsers = parsers;
        return this;
    }
    setPostProcessors(postProcessors) {
        this.postProcessors = postProcessors;
        return this;
    }
    setCompiler(compiler) {
        this.compiler = compiler;
        return this;
    }
    extract() {
        let collection = new translation_collection_1.TranslationCollection();
        this.inputs.forEach((pattern) => {
            this.getFiles(pattern).forEach((filePath) => {
                this.out(colorette_1.dim('- %s'), filePath);
                const contents = fs.readFileSync(filePath, 'utf-8');
                this.parsers.forEach((parser) => {
                    const extracted = parser.extract(contents, filePath);
                    if (extracted instanceof translation_collection_1.TranslationCollection) {
                        collection = collection.union(extracted);
                    }
                });
            });
        });
        return collection;
    }
    process(draft, extracted, existing) {
        this.postProcessors.forEach((postProcessor) => {
            draft = postProcessor.process(draft, extracted, existing);
        });
        return draft;
    }
    save(output, collection) {
        const dir = path.dirname(output);
        if (!fs.existsSync(dir)) {
            mkdirp.sync(dir);
        }
        fs.writeFileSync(output, this.compiler.compile(collection));
    }
    getFiles(pattern) {
        return glob.sync(pattern).filter((filePath) => fs.statSync(filePath).isFile());
    }
    out(...args) {
        console.log.apply(this, arguments);
    }
    printEnabledParsers() {
        this.out(colorette_1.cyan('Enabled parsers:'));
        if (this.parsers.length) {
            this.out(colorette_1.cyan(colorette_1.dim(this.parsers.map((parser) => `- ${parser.constructor.name}`).join('\n'))));
        }
        else {
            this.out(colorette_1.cyan(colorette_1.dim('(none)')));
        }
        this.out();
    }
    printEnabledPostProcessors() {
        this.out(colorette_1.cyan('Enabled post processors:'));
        if (this.postProcessors.length) {
            this.out(colorette_1.cyan(colorette_1.dim(this.postProcessors.map((postProcessor) => `- ${postProcessor.constructor.name}`).join('\n'))));
        }
        else {
            this.out(colorette_1.cyan(colorette_1.dim('(none)')));
        }
        this.out();
    }
    printEnabledCompiler() {
        this.out(colorette_1.cyan('Compiler:'));
        this.out(colorette_1.cyan(colorette_1.dim(`- ${this.compiler.constructor.name}`)));
        this.out();
    }
}
exports.ExtractTask = ExtractTask;
//# sourceMappingURL=extract.task.js.map