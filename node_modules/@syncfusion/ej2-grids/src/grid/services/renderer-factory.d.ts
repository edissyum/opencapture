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
    addRenderer(name: RenderType, type: IRenderer): void;
    getRenderer(name: RenderType): IRenderer;
}
