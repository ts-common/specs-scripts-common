import { MessageLine } from "./message";

export type PipelineResult = "success" | "failure" | "timed_out";

export type Env = "prod" | "ppe";

export type PipelineTriggerSource = "github" | "openapi_hub";

export type PipelineRun = {
  source: PipelineTriggerSource;
  unifiedPipelineTaskKey: string; // a unified pipeline task key, e.g. LintDiff, Semantic
  unifiedPipelineSubTaskKey?: string; // sub task key, for dynamic generated sub task message
  unifiedPipelineBuildId: string; // a unique build id unified pipeline assigned for each completed pipeline build id
  env?: Env; // which env the build is in
  pipelineBuildId: string; // the id of the record for the completed azure pipeline build.
  pipelineJobId: string; // the id of the record for the completed azure pipeline job.
  pipelineTaskId: string; // the id of the record for the completed azure pipeline task.
  logUrl: string; // the log url of the underlying azure pipeline
  labels?: string[]; // github label list which unified pipeline will add
};

export type PipelineStatus =
  | "queued"
  | "in_progress"
  | "completed"
  | "skipped"
  | "completed_with_result";

export type QueuedEvent = PipelineRun & {
  status: "queued";
};

export type SkippedEvent = PipelineRun & {
  status: "skipped";
  subTitle?: string;
};

export type InProgressEvent = PipelineRun & {
  status: "in_progress";
};

export type CompletedEvent = PipelineRun & {
  status: "completed";
  result: PipelineResult;
  logPath: string;
  subTitle?: string;
};

export type CompletedWithResultEvent = PipelineRun & {
  status: "completed_with_result";
  result: PipelineResult;
  messages: MessageLine[];
  subTitle?: string;
};

export type PipelineEvent =
  | QueuedEvent
  | InProgressEvent
  | CompletedEvent
  | SkippedEvent
  | CompletedWithResultEvent;
