Object.defineProperty(exports, "__esModule", { value: true });
exports.PurgeObsoleteKeysPostProcessor = void 0;
class PurgeObsoleteKeysPostProcessor {
    constructor() {
        this.name = 'PurgeObsoleteKeys';
    }
    process(draft, extracted, existing) {
        return draft.intersect(extracted);
    }
}
exports.PurgeObsoleteKeysPostProcessor = PurgeObsoleteKeysPostProcessor;
//# sourceMappingURL=purge-obsolete-keys.post-processor.js.map