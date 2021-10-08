/**
 * TtfTableInfo.ts class for EJ2-PDF
 */
export declare class TtfTableInfo {
    /**
     * offset from beginning of true type font file.
     */
    offset: number;
    /**
     * length of the table.
     */
    length: number;
    /**
     * table checksum;
     */
    checksum: number;
    /**
     * Gets a value indicating whether this table is empty.
     * @private
     */
    readonly empty: boolean;
}
