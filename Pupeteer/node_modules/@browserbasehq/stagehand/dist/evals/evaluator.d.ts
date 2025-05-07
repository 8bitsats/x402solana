/**
 * This class is responsible for evaluating the result of an agentic task.
 * The first version includes a VLM evaluator specifically prompted to evaluate the state of a task
 * usually represented as a screenshot.
 * The evaluator will reply with YES or NO given the state of the provided task.
 */
import { AvailableModel, ClientOptions, Stagehand } from "@browserbasehq/stagehand";
import { EvaluateOptions, EvaluationResult, BatchEvaluateOptions } from "@/types/evaluator";
export declare class Evaluator {
    private stagehand;
    private modelName;
    private modelClientOptions;
    private yesPattern;
    private noPattern;
    constructor(stagehand: Stagehand, modelName?: AvailableModel, modelClientOptions?: ClientOptions);
    /**
     * Evaluates the current state of the page against a specific question.
     * Expects a JSON object response: { "evaluation": "YES" | "NO", "reasoning": "..." }
     * Returns the evaluation result with normalized response and success status.
     *
     * @param options - The options for evaluation
     * @returns A promise that resolves to an EvaluationResult
     * @throws Error if strictResponse is true and response is not clearly YES or NO, or if JSON parsing/validation fails.
     */
    evaluate(options: EvaluateOptions): Promise<EvaluationResult>;
    /**
     * Evaluates the current state of the page against multiple questions in a single screenshot.
     * Returns an array of evaluation results.
     *
     * @param options - The options for batch evaluation
     * @returns A promise that resolves to an array of EvaluationResults
     * @throws Error if strictResponse is true and any response is not clearly YES or NO
     */
    batchEvaluate(options: BatchEvaluateOptions): Promise<EvaluationResult[]>;
}
