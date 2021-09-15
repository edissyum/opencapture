/**
 * Overview component
 */
import { TestHelper } from '@syncfusion/ej2-base/helpers/e2e';
/**
 * Represents the Overview helpers.
 */
export declare class OverviewHelper extends TestHelper {
    /**
     * Specifies the ID of the overview.
     */
    id: string;
    /**
     * Specifies the current helper function of the overview.
     */
    wrapperFn: Function;
    /**
     * Constructor for creating the helper object for overview component.
     */
    constructor(id: string, wrapperFn: Function);
    /**
     * Gets the overview element, which will have the overview objects like nodes, connectors, and more.
     */
    getDiagramLayer(): any;
    /**
     * Gets the HTML layer element of the overview component, which will have the HTML node content.
     */
    getHtmlLayer(): any;
    /**
     * Gets the overview handle elements.
     */
    getHandle(): any;
}
