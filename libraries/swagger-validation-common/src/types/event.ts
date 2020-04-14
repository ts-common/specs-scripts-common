export type PipelineResult = "Success" | "Failure" | "TimedOut";

export type PipelineRun = {
  taskKey: string; // a unified pipeline task key, e.g. LintDiff, Semantic
  taskRunId: string; // a unique id unified pipeline assigned for each task
  pipelineBuildId: string; // the id of the record for the completed azure pipeline build.
  pipelineJobId: string; // the id of the record for the completed azure pipeline job.
  pipelineTaskId: string; // the id of the record for the completed azure pipeline task.
};

export type PipelineStatus = "InProgress" | "Completed";

export type InProgressEvent = PipelineRun & {
  status: "InProgress";
};

export type CompletedEvent = PipelineRun & {
  status: "Completed";
  result: PipelineResult;
  logPath: string;
};

export type PipelineEvent = InProgressEvent | CompletedEvent;
