export type PipelineResult = "Success" | "Failure" | "TimedOut";

export type PipelineRun = {
  source: "GitHub" | "OpenAPIHub"
  unifiedPipelineTaskKey: string; // a unified pipeline task key, e.g. LintDiff, Semantic
  unifiedPipelineBuildId: string; // a unique build id unified pipeline assigned for each completed pipeline build id
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
