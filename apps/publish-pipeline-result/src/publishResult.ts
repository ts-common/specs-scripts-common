#!/usr/bin/env node

import {
  CompletedEvent,
  InProgressEvent,
  PipelineEvent,
  PipelineResult,
  PipelineStatus
} from "swagger-validation-common/lib/event";
import * as yargs from "yargs";
import { AzureBlobClient } from "./AzureBlobClient";
import { EventHubProducer } from "./EventHubClient";

type BuildProperties = {
  buildId: string;
};

function getBuildProperties(): BuildProperties {
  return {
    buildId: process.env.BUILD_BUILD_ID
  } as BuildProperties;
}

async function getEventHubProduer(): Promise<EventHubProducer> {
  const connectionString = process.env["EVENTHUB_CONNECTION_STRING"] || "";
  const producer = new EventHubProducer(connectionString);
  return producer;
}

async function getAzureBlobClient(): Promise<AzureBlobClient> {
  const sasURL = process.env["AZURE_BLOB_SAS_URL"] || "";
  const containerName =
    process.env["AZURE_BLOB_CONTAINER_NAME"] || "pipelinelogs";
  if (!sasURL) {
    throw new Error("Please specify AZURE_BLOB_SAS_URL");
  }
  const wrapper = new AzureBlobClient(sasURL, containerName);
  return wrapper;
}

async function publishEvent(event: PipelineEvent): Promise<void> {
  try {
    const producer = await getEventHubProduer();
    await producer.send([JSON.stringify(event)]);
    await producer.close();
  } catch (e) {
    console.error("Failed to send pipeline result:", JSON.stringify(event), e);
    throw e;
  }
}

async function uploadLog(path: string, blobName: string): Promise<string> {
  try {
    const client = await getAzureBlobClient();
    const uploadedUrl = await client.uploadLocal(path, blobName);
    return uploadedUrl;
  } catch (e) {
    console.error("Failed to upload pipeline log:", path, e);
    throw e;
  }
}

export async function main(argv: ArgvType): Promise<void> {
  console.log(argv);
  const prop = getBuildProperties();
  const event = {
    taskKey: argv.taskKey,
    taskRunId: argv.taskRunId,
    buildId: prop.buildId
  };
  console.log(event);
  switch (argv.status) {
    case "InProgress":
      const inprogressEvent = {
        ...event,
        status: "InProgress"
      } as InProgressEvent;
      await publishEvent(inprogressEvent);
      break;
    case "Completed":
      let logPath = "";
      if (argv.logPath) {
        logPath = await uploadLog(
          argv.logPath,
          `${argv.taskRunId}-${prop.buildId}/${argv.taskKey}-result.json`
        );
      }
      const completionEvent = {
        ...event,
        status: "Completed",
        result: argv.result,
        logPath
      } as CompletedEvent;
      await publishEvent(completionEvent);
      break;
  }
}

const statuses: ReadonlyArray<PipelineStatus> = ["InProgress", "Completed"];
const results: ReadonlyArray<PipelineResult> = ["Success", "Failure"];

const argv = yargs
  .option("taskKey", {
    alias: "k",
    demandOption: true,
    description: "pipeline job name"
  })
  .option("taskRunId", {
    alias: "i",
    demandOption: true,
    description: "unified pipeline allocated unique task id"
  })
  .option("status", {
    alias: "s",
    choices: statuses,
    demandOption: true,
    description: "status of the pipeline task"
  })
  .option("result", {
    alias: "r",
    choices: results,
    demandOption: false,
    description: "result of the pipeline task"
  })
  .option("logPath", {
    alias: "l",
    type: "string",
    description: "log path of the pipeline result",
    demandOption: false
  })
  .check((data: any) => {
    if (data.status == "Completed") {
      return !!data.result;
    }
    return true;
  }).argv;

type ArgvType = typeof argv;

main(argv).catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
