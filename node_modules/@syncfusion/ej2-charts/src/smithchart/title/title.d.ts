import { ChildProperty } from '@syncfusion/ej2-base';
import { SmithchartFontModel } from '../utils/utils-model';
import { SmithchartAlignment } from '../utils/enum';
import { SubtitleModel } from '../title/title-model';
export declare class Subtitle extends ChildProperty<Subtitle> {
    /**
     * visibility for sub title.
     *
     * @default true
     */
    visible: boolean;
    /**
     * text for sub title.
     *
     * @default ''
     */
    text: string;
    /**
     * description for sub title.
     *
     * @default ''
     */
    description: string;
    /**
     * text alignment for sub title.
     *
     * @default Far
     */
    textAlignment: SmithchartAlignment;
    /**
     * trim the sub title.
     *
     * @default true
     */
    enableTrim: boolean;
    /**
     * maximum width of the sub title.
     *
     * @aspDefaultValueIgnore
     * @default null
     */
    maximumWidth: number;
    /**
     * options for customizing sub title font
     */
    textStyle: SmithchartFontModel;
}
export declare class Title extends ChildProperty<Title> {
    /**
     * visibility for title.
     *
     * @default true
     */
    visible: boolean;
    /**
     * text for title.
     *
     * @default ''
     */
    text: string;
    /**
     * description for title.
     *
     * @default ''
     */
    description: string;
    /**
     * text alignment for title.
     *
     * @default Center
     */
    textAlignment: SmithchartAlignment;
    /**
     * trim the title.
     *
     * @default true
     */
    enableTrim: boolean;
    /**
     * maximum width of the sub title
     *
     * @aspDefaultValueIgnore
     * @default null
     */
    maximumWidth: number;
    /**
     * options for customizing sub title
     */
    subtitle: SubtitleModel;
    /**
     * options for customizing title font
     */
    font: SmithchartFontModel;
    /**
     * options for customizing title text
     */
    textStyle: SmithchartFontModel;
}
