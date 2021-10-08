/**
 * Writes data in BigEndian order.
 */
export declare class BigEndianWriter {
    /**
     * Size of Int32 type.
     */
    readonly int32Size: number;
    /**
     * Size of Int16 type.
     */
    readonly int16Size: number;
    /**
     * Size of long type.
     */
    readonly int64Size: number;
    /**
     * Internal buffer.
     */
    private buffer;
    /**
     * Internal buffer capacity.
     */
    private bufferLength;
    /**
     * Current position.
     */
    private internalPosition;
    /**
     * Gets data written to the writer.
     */
    readonly data: number[];
    readonly position: number;
    /**
     * Creates a new writer.
     */
    constructor(capacity: number);
    /**
     * Writes short value.
     */
    writeShort(value: number): void;
    /**
     * Writes int value.
     */
    writeInt(value: number): void;
    /**
     * Writes u int value.
     */
    writeUInt(value: number): void;
    /**
     * Writes string value.
     */
    writeString(value: string): void;
    /**
     * Writes byte[] value.
     */
    writeBytes(value: number[]): void;
    private flush;
}
