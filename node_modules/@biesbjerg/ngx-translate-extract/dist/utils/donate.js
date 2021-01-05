Object.defineProperty(exports, "__esModule", { value: true });
exports.donateMessage = void 0;
const colorette_1 = require("colorette");
const boxen = require("boxen");
const terminalLink = require("terminal-link");
const url = 'https://donate.biesbjerg.com';
const link = terminalLink(url, url);
const message = `
If this tool saves you or your company time, please consider making a
donation to support my work and the continued maintainence and development:

${colorette_1.yellow(link)}`;
exports.donateMessage = boxen(message.trim(), {
    padding: 1,
    margin: 0,
    dimBorder: true
});
//# sourceMappingURL=donate.js.map