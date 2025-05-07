import { LogLine } from "../../types/log";
import { Stagehand } from "../index";
import { LLMClient } from "../llm/LLMClient";
import { StagehandPage } from "../StagehandPage";
export declare class StagehandObserveHandler {
    private readonly stagehand;
    private readonly logger;
    private readonly stagehandPage;
    private readonly userProvidedInstructions?;
    constructor({ stagehand, logger, stagehandPage, userProvidedInstructions, }: {
        stagehand: Stagehand;
        logger: (logLine: LogLine) => void;
        stagehandPage: StagehandPage;
        userProvidedInstructions?: string;
    });
    observe({ instruction, llmClient, requestId, returnAction, onlyVisible, drawOverlay, fromAct, }: {
        instruction: string;
        llmClient: LLMClient;
        requestId: string;
        domSettleTimeoutMs?: number;
        returnAction?: boolean;
        /**
         * @deprecated The `onlyVisible` parameter has no effect in this version of Stagehand and will be removed in later versions.
         */
        onlyVisible?: boolean;
        drawOverlay?: boolean;
        fromAct?: boolean;
    }): Promise<({
        selector: string;
        description: string;
    } | {
        selector: string;
        method: string;
        arguments: string[];
        description: string;
    })[]>;
}
