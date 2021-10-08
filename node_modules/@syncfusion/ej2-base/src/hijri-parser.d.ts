/***
 * Hijri parser
 */
export declare namespace HijriParser {
    /**
     *
     * @param {Date} gDate ?
     * @returns {Object} ?
     */
    function getHijriDate(gDate: Date): Object;
    /**
     *
     * @param {number} year ?
     * @param {number} month ?
     * @param {number} day ?
     * @returns {Date} ?
     */
    function toGregorian(year: number, month: number, day: number): Date;
}
