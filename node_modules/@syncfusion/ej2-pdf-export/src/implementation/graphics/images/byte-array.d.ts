/**
 * ByteArray class
 * Used to keep information about image stream as byte array.
 * @private
 */
export declare class ByteArray {
    /**
     * Current stream `position`.
     * @default 0
     * @private
     */
    private mPosition;
    /**
     * Uint8Array for returing `buffer`.
     * @hidden
     * @private
     */
    private buffer;
    /**
     * Specifies the `data view`.
     * @hidden
     * @private
     */
    private dataView;
    /**
     * Initialize the new instance for `byte-array` class
     * @hidden
     * @private
     */
    constructor(length: number);
    /**
     * Gets and Sets a current `position` of byte array.
     * @hidden
     * @private
     */
    position: number;
    /**
     * `Read` from current stream position.
     * @default 0
     * @hidden
     * @private
     */
    read(buffer: ByteArray, offset: number, count: number): void;
    /**
     * @hidden
     */
    getBuffer(index: number): number;
    /**
     * @hidden
     */
    writeFromBase64String(base64: string): void;
    /**
     * @hidden
     */
    encodedString(input: string): Uint8Array;
    /**
     * @hidden
     */
    readByte(offset: number): number;
    /**
     * @hidden
     */
    readonly internalBuffer: Uint8Array;
    /**
     * @hidden
     */
    readonly count: number;
    /**
     * 'readNextTwoBytes' stream
     * @hidden
     * @private
     */
    readNextTwoBytes(stream: ByteArray): number;
}
