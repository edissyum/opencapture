class TranslateHttpLoader {
    constructor(http, prefix = "/assets/i18n/", suffix = ".json") {
        this.http = http;
        this.prefix = prefix;
        this.suffix = suffix;
    }
    /**
     * Gets the translations from the server
     */
    getTranslation(lang) {
        return this.http.get(`${this.prefix}${lang}${this.suffix}`);
    }
}

/**
 * Generated bundle index. Do not edit.
 */

export { TranslateHttpLoader };

//# sourceMappingURL=ngx-translate-http-loader.js.map