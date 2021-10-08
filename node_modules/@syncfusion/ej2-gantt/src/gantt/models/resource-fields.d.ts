import { ChildProperty } from '@syncfusion/ej2-base';
/**
 * Defines mapping property to get resource details from resource collection.
 */
export declare class ResourceFields extends ChildProperty<ResourceFields> {
    /**
     * To map id of resource from resource collection.
     *
     * @default null
     */
    id: string;
    /**
     * To map name of resource from resource collection.
     *
     * @default null
     */
    name: string;
    /**
     * To map unit of resource from resource collection.
     *
     * @default null
     */
    unit: string;
    /**
     * To map group of resource from resource collection.
     *
     * @default null
     */
    group: string;
}
