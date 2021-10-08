import { IRenderer } from '../base/interface';
import { RenderType } from '../base/enum';
/**
 * RendererFactory
 *
 * @hidden

 */
export declare class RendererFactory {
    rendererMap: {
        [c: string]: IRenderer;
    };
    /**
     * addRenderer method
     *
     * @param {RenderType} name - specifies the render type
     * @param {IRenderer} type - specifies the renderer.
     * @returns {void}
     * @hidden

     */
    addRenderer(name: RenderType, type: IRenderer): void;
    /**
     * getRenderer method
     *
     * @param {RenderType} name - specifies the render type
     * @returns {void}
     * @hidden

     */
    getRenderer(name: RenderType): IRenderer;
}
