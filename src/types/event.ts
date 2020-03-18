enum Stage {
  Queued = "Queued",
  InProgress = "InProgress",
  Completed = "Completed"
}

export type PipelineRun = {
  buildId: string;
  pipelineBuildId: string;
  pipelineTaskId: string;
};

export enum TaskResult {
  Success = "Success",
  Failure = "Failure",
  TimedOut = "TimedOut"
}

export type InProgressTask = PipelineRun & {
  stage: Stage.InProgress;
};

export type CompletedTask = PipelineRun & {
  stage: Stage.Completed;
  result: TaskResult;
  logPath: string;
};
