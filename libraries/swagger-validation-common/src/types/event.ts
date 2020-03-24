export type PipelineResult = "Success" | "Failure" | "TimedOut";

export type PipelineRun = {
  taskKey: string; // a unified pipeline task key, e.g. LintDiff, Semantic
  taskRunId: string; // a unique id unified pipeline assigned for each task
  buildId?: string; // the id of the record for the completed azure pipeline build.
};

export type PipelineStatus = "Queued" | "InProgress" | "Completed";

export type QueuedEvent = PipelineRun & {
  status: "Queued";
};

export type InProgressEvent = PipelineRun & {
  status: "InProgress";
};

export type CompletedEvent = PipelineRun & {
  status: "Completed";
  result: PipelineResult;
  logPath: string;
};

export type PipelineEvent = QueuedEvent | InProgressEvent | CompletedEvent;
