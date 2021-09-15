/**
 * TtfNameTable.ts class for EJ2-PDF
 */
import { TtfNameRecord } from './ttf-name-record';
export declare class TtfNameTable {
    /**
     * Local variable to store Format Selector.
     */
    formatSelector: number;
    /**
     * Local variable to store Records Count.
     */
    recordsCount: number;
    /**
     * Local variable to store Offset.
     */
    offset: number;
    /**
     * Local variable to store Name Records.
     */
    nameRecords: TtfNameRecord[];
}
