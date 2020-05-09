import convict from 'convict';
import { PipelineResult, PipelineStatus, PipelineTriggerSource } from 'swagger-validation-common';

const statuses: ReadonlyArray<PipelineStatus> = ["in_progress", "completed"];
const results: ReadonlyArray<PipelineResult> = ["success", "failure"];
const sources: ReadonlyArray<PipelineTriggerSource> = ["github", "openapi_hub"];

const stringMustHaveLength = (value: string) => {
  if (value.length === 0) {
    throw new Error("must not be empty");
  }
};

export interface PublishResultConfig {
  source: PipelineTriggerSource
  repoKey: string;
  unifiedPipelineBuildId: string;
  unifiedPipelineTaskKey: string;
  pipelineBuildId: string;
  pipelineJobId: string;
  pipelineTaskId: string;
  status: PipelineStatus;
  result?: PipelineResult;
  logPath?: string;
  azureBlobSasUrl?: string;
  azureBlobContainerName?: string;
  eventHubConnectionString: string;
}

export const configSchema = convict<PublishResultConfig>({
  source: {
    format: sources,
    default: "github",
    doc: "Source from which the pipeline is triggered",
    arg: "source",
  },
  repoKey: {
    format: stringMustHaveLength,
    default: "",
    doc: "spec repo name, e.g. Azure/azure-rest-api-specs-only",
    arg: "repoKey",
  },
  unifiedPipelineTaskKey: {
    format: stringMustHaveLength,
    default: "",
    doc: "pipeline job name",
    arg: "unifiedPipelineTaskKey",
  },
  unifiedPipelineBuildId: {
    format: stringMustHaveLength,
    default: "",
    doc: "unified pipeline allocated unique task id",
    arg: "unifiedPipelineBuildId",
  },
  pipelineBuildId: {
    format: stringMustHaveLength,
    default: "",
    doc: "azure pipeline build id",
    arg: "pipelineBuildId",
  },
  pipelineJobId: {
    format: stringMustHaveLength,
    default: "",
    doc: "azure pipeline job id",
    arg: "pipelineJobId",
  },
  pipelineTaskId: {
    format: stringMustHaveLength,
    default: "",
    doc: "azure pipeline task id",
    arg: "pipelineTaskId",
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
