import { ChildProperty } from '@syncfusion/ej2-base';
import { InfiniteScrollSettings as GridInfiniteScrollSettings } from '@syncfusion/ej2-grids';
/**
 * Configures the infinite scroll behavior of Tree Grid.
 */
export declare class InfiniteScrollSettings extends ChildProperty<GridInfiniteScrollSettings> {
    /**
     * If `enableCache` is set to true, the Tree Grid will cache the loaded data to be reused next time it is needed.
     *
     * @default false
     */
    enableCache: boolean;
    /**
     * Defines the number of blocks to be maintained in Tree Grid while settings enableCache as true.
     *
     * @default 3
     */
    maxBlocks: number;
    /**
     * Defines the number of blocks will render at the initial Tree Grid rendering while enableCache is enabled.
     *
     * @default 3
     */
    initialBlocks: number;
}
