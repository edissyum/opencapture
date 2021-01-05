import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { Observable } from 'rxjs';
import { BuildBuilderSchema } from './schema';
export declare function runBuilder(options: BuildBuilderSchema, context: BuilderContext): Observable<BuilderOutput>;
declare const _default: import("@angular-devkit/architect/src/internal").Builder<BuildBuilderSchema>;
export default _default;
