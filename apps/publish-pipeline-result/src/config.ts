import {
  PipelineResult,
  PipelineStatus,
  PipelineTriggerSource,
  Env,
} from "@azure/swagger-validation-common";
import convict from "convict";

const statuses: ReadonlyArray<PipelineStatus> = [
  "in_progress",
  "completed",
  "queued",
  "skipped",
];
const results: ReadonlyArray<PipelineResult> = ["success", "failure"];
const envs: ReadonlyArray<Env> = ["ppe", "prod"];
const sources: ReadonlyArray<PipelineTriggerSource> = ["github", "openapi_hub"];

const stringMustHaveLength = (value: string) => {
  if (value.length === 0) {
    throw new Error("must not be empty");
  }
};

export interface PublishResultConfig {
  source: PipelineTriggerSource;
  repoKey: string;
  unifiedPipelineBuildId: string;
  unifiedPipelineTaskKey: string;
  unifiedPipelineSubTaskKey?: string;
  env?: Env;
  pipelineBuildId: string;
  pipelineJobId: string;
  pipelineTaskId: string;
  status: PipelineStatus;
  result?: PipelineResult;
  subTitle?: string;
  logPath?: string;
  azureBlobSasUrl?: string;
  azureBlobContainerName?: string;
  eventHubConnectionString: string;
}

export const configSchema = convict<PublishResultConfig>({
  env: {
    format: envs,
    default: "prod",
    doc: "which env the build is in",
    arg: "env",
    env: "ENV",
  },
  source: {
    format: sources,
    default: "github",
    doc: "Source from which the pipeline is triggered",
    arg: "source",
    env: "SOURCE",
  },
  repoKey: {
    format: stringMustHaveLength,
    default: "",
    doc: "spec repo name, e.g. Azure/azure-rest-api-specs-only",
    arg: "repoKey",
    env: "REPO_KEY",
  },
  unifiedPipelineTaskKey: {
    format: stringMustHaveLength,
    default: "",
    doc: "pipeline task key",
    arg: "unifiedPipelineTaskKey",
    env: "TASK_KEY",
  },
  unifiedPipelineSubTaskKey: {
    format: String,
    default: "",
    doc: "pipeline sub task key",
    arg: "unifiedPipelineSubTaskKey",
    env: "SUB_TASK_KEY",
  },
  subTitle: {
    format: String,
    default: "",
    doc: "pipeline sub title in comment report",
    arg: "subTitle",
    env: "SUB_TITLE",
  },
  unifiedPipelineBuildId: {
    format: stringMustHaveLength,
    default: "",
    doc: "unified pipeline allocated unique task id",
    arg: "unifiedPipelineBuildId",
    env: "UNIFIED_PIPELINE_BUILD_ID",
  },
  pipelineBuildId: {
    format: stringMustHaveLength,
    default: "",
    doc: "azure pipeline build id",
    arg: "pipelineBuildId",
    env: "BUILD_BUILDID",
  },
  pipelineJobId: {
    format: stringMustHaveLength,
    default: "",
    doc: "azure pipeline job id",
    arg: "pipelineJobId",
    env: "SYSTEM_JOBID",
  },
  pipelineTaskId: {
    default: "",
    doc: "azure pipeline task id",
    arg: "pipelineTaskId",
    env: "VALIDATION_TASKID",
  },
  status: {
    format: statuses,
    default: "in_progress",
    doc: "status of the pipeline task",
    arg: "status",
  },
  result: {
    format: results,
    default: "success",
    doc: "result of the pipeline task",
    arg: "result",
  },
  logPath: {
    format: String,
    default: "/tmp/log.json",
    doc: "log path of the pipeline result",
    arg: "logPath",
  },
  azureBlobSasUrl: {
    format: String,
    default: "",
    doc: "azure blob sas url for uploading pipeline step log",
    env: "AZURE_BLOB_SAS_URL",
    sensitive: true,
  },
  azureBlobContainerName: {
    format: stringMustHaveLength,
    default: "pipelinelogs",
    doc: "azure blob container name",
    arg: "azureBlobContainerName",
  },
  eventHubConnectionString: {
    format: String,
    default: "",
    doc: "event hub connection string for sending pipeline progress events",
    env: "EVENTHUB_CONNECTION_STRING",
    sensitive: true,
  },
});
