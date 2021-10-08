import { PackageManager } from '../lib/config/schema';
export declare function supportsYarn(): boolean;
export declare function supportsNpm(): boolean;
export declare function getPackageManager(root: string): Promise<PackageManager>;
/**
 * Checks if the npm version is a supported 7.x version.  If not, display a warning.
 */
export declare function ensureCompatibleNpm(root: string): Promise<void>;
