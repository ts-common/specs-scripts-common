type Stage = "Queued" | "InProgress" | "Completed";

type Result = "Success" | "Failure" | "TimedOut";

export type PipelineRun = {
  buildId: string;
  pipelineBuildId: string;
  pipelineTaskId: string;
};

export type InProgressTask = PipelineRun & {
  stage: "InProgress";
};

export type CompletedTask = PipelineRun & {
  stage: "Completed";
  result: Result;
  logPath: string;
};
