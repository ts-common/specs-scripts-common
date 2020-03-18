enum Stage {
  Queued = "Queued",
  InProgress = "InProgress",
  Completed = "Completed"
}

export type PipelineStage = {
  buildId: string;
  pipelineBuildId: string;
  pipelineTaskId: string;
};

export enum PipelineResult {
  Success = "Success",
  Failure = "Failure",
  TimedOut = "TimedOut"
}

export type PipelineInProgress = PipelineStage & {
  stage: Stage.InProgress;
};

export type PipelineCompletion = PipelineStage & {
  stage: Stage.Completed;
  result: PipelineResult;
  logPath: string;
};
