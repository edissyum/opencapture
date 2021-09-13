import { Configuration } from "../configuration";
import { ExecutionMetrics } from "../execution-metrics";
import { ExecutedSpecs } from "../spec-reporter";
import { Theme } from "../theme";
import { Logger } from "./logger";
export declare class SummaryDisplay {
    private configuration;
    private theme;
    private logger;
    private specs;
    constructor(configuration: Configuration, theme: Theme, logger: Logger, specs: ExecutedSpecs);
    display(metrics: ExecutionMetrics): void;
    private successesSummary;
    private successfulSummary;
    private failuresSummary;
    private failedSummary;
    private pendingsSummary;
    private pendingSummary;
    private errorsSummary;
    private errorSummary;
}
