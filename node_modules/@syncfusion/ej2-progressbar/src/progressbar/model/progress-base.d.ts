import { ChildProperty } from '@syncfusion/ej2-base';
import { TextAlignmentType } from '../utils/enum';
/**
 * progress bar complex interface
 */
export declare class Margin extends ChildProperty<Margin> {
    /**
     * To customize top margin value
     *
     * @default 10
     */
    top: number;
    /**
     * To customize top bottom value
     *
     * @default 10
     */
    bottom: number;
    /**
     * To customize top left value
     *
     * @default 10
     */
    left: number;
    /**
     * To customize top right value
     *
     * @default 10
     */
    right: number;
}
/**
 * Configures the fonts in progressbar
 */
export declare class Font extends ChildProperty<Font> {
    /**
     * FontStyle for the text.
     *
     * @default 'Normal'
     */
    fontStyle: string;
    /**
     * Font size for the text.
     *
     * @default '16px'
     */
    size: string;
    /**
     * FontWeight for the text.
     *
     * @default 'Normal'
     */
    fontWeight: string;
    /**
     * Color for the text.
     *
     * @default ''
     */
    color: string;
    /**
     * FontFamily for the text.
     */
    fontFamily: string;
    /**
     * Opacity for the text.
     *
     * @default 1
     */
    opacity: number;
    /**
     * text alignment for label
     *
     * @default Far
     */
    textAlignment: TextAlignmentType;
    /**
     * label text
     *
     * @default ''
     */
    text: string;
}
/**
 * Animation
 */
export declare class Animation extends ChildProperty<Animation> {
    /**
     * enable
     *
     * @default false
     */
    enable: boolean;
    /**
     * duration
     *
     * @default 2000
     */
    duration: number;
    /**
     * delay
     *
     * @default 0
     */
    delay: number;
}
/**
 * Annotation
 */
export declare class ProgressAnnotationSettings extends ChildProperty<ProgressAnnotationSettings> {
    /**
     * Content of the annotation, which accepts the id of the custom element.
     *
     * @default null
     */
    content: string;
    /**
     * to move annotation
     *
     * @default 0
     */
    annotationAngle: number;
    /**
     * to move annotation
     *
     * @default '0%'
     */
    annotationRadius: string;
}
/**
 * RangeColor
 */
export declare class RangeColor extends ChildProperty<RangeColor> {
    /**
     * color
     *
     * @default null
     */
    color: string;
    /**
     * start
     *
     * @default null
     */
    start: number;
    /**
     * end
     *
     * @default null
     */
    end: number;
}
