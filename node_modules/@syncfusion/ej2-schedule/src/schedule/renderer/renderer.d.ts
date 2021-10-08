import { Schedule } from '../base/schedule';
import { View } from '../base/type';
/**
 * Schedule DOM rendering
 */
export declare class Render {
    parent: Schedule;
    constructor(parent: Schedule);
    render(viewName: View, isDataRefresh?: boolean): void;
    private initializeLayout;
    updateHeader(): void;
    updateLabelText(view: string): void;
}
