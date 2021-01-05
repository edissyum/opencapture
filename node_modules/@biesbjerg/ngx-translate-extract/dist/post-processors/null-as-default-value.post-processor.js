Object.defineProperty(exports, "__esModule", { value: true });
exports.NullAsDefaultValuePostProcessor = void 0;
class NullAsDefaultValuePostProcessor {
    constructor() {
        this.name = 'NullAsDefaultValue';
    }
    process(draft, extracted, existing) {
        return draft.map((key, val) => (existing.get(key) === undefined ? null : val));
    }
}
exports.NullAsDefaultValuePostProcessor = NullAsDefaultValuePostProcessor;
//# sourceMappingURL=null-as-default-value.post-processor.js.map