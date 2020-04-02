import convict from 'convict';
import { PipelineResult, PipelineStatus } from 'swagger-validation-common/lib/event';

const statuses: ReadonlyArray<PipelineStatus> = ["InProgress", "Completed"];
const results: ReadonlyArray<PipelineResult> = ["Success", "Failure"];

const stringMustHaveLength = (value: string) => {
  if (value.length === 0) {
    throw new Error("must not be empty");
  }
};

export interface PublishResultConfig {
  taskKey: string;
  buildId: string;
  taskRunId: string;
  status: PipelineStatus;
  result?: PipelineResult;
  logPath?: string;
  azureBlobSasUrl?: string;
  azureBlobContainerName?: string;
  eventHubConnectionString: string;
}

export const configSchema = convict<PublishResultConfig>({
  taskKey: {
    format: stringMustHaveLength,
    default: "",
    doc: "pipeline job name",
    arg: "taskKey",
  },
  taskRunId: {
    format: stringMustHaveLength,
    default: "",
    doc: "unified pipeline allocated unique task id",
    arg: "taskRunId",
  },
  buildId: {
    format: stringMustHaveLength,
    default: "",
    doc: "azure pipeline build id",
    arg: "buildId",
  },
  status: {
    format: statuses,
    default: "Queued",
    doc: "status of the pipeline task",
    arg: "status",
  },
  result: {
    format: results,
    default: "Success",
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
