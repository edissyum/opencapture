import { CommandHandler } from './command-manager';
import { MouseEventArgs } from './event-handlers';
import { ToolBase } from './tool';
/**
 * Multiple segments editing for Connector
 */
export declare class ConnectorEditing extends ToolBase {
    private endPoint;
    private selectedSegment;
    private segmentIndex;
    constructor(commandHandler: CommandHandler, endPoint: string);
    /**
     * mouseDown method\
     *
     * @returns {  void }    mouseDown method .\
     * @param {MouseEventArgs} args - provide the args value.
     * @private
     */
    mouseDown(args: MouseEventArgs): void;
    /**
     * mouseMove method\
     *
     * @returns {  void }    mouseMove method .\
     * @param {MouseEventArgs} args - provide the args value.
     * @private
     */
    mouseMove(args: MouseEventArgs): boolean;
    /**
     * mouseUp method\
     *
     * @returns {  void }    mouseUp method .\
     * @param {MouseEventArgs} args - provide the args value.
     * @private
     */
    mouseUp(args: MouseEventArgs): void;
    private removePrevSegment;
    private findSegmentDirection;
    private removeNextSegment;
    private addOrRemoveSegment;
    private findIndex;
    private dragOrthogonalSegment;
    private addSegments;
    private insertFirstSegment;
    private updateAdjacentSegments;
    private addTerminalSegment;
    private updatePortSegment;
    private updatePreviousSegment;
    private changeSegmentDirection;
    private updateNextSegment;
    private updateFirstSegment;
    private updateLastSegment;
    /**
     *To destroy the module
     *
     * @returns {void} To destroy the module
     */
    destroy(): void;
    /**
     * Get module name.
     */
    /**
     * Get module name.\
     *
     * @returns {  string  }    Get module name.\
     */
    protected getModuleName(): string;
}
