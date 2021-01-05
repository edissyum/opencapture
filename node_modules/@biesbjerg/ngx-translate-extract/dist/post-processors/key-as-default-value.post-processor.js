Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyAsDefaultValuePostProcessor = void 0;
class KeyAsDefaultValuePostProcessor {
    constructor() {
        this.name = 'KeyAsDefaultValue';
    }
    process(draft, extracted, existing) {
        return draft.map((key, val) => (val === '' ? key : val));
    }
}
exports.KeyAsDefaultValuePostProcessor = KeyAsDefaultValuePostProcessor;
//# sourceMappingURL=key-as-default-value.post-processor.js.map