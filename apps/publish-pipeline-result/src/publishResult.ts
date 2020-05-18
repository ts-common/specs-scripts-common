#!/usr/bin/env node
import {
  CompletedEvent,
  InProgressEvent,
  PipelineEvent,
  PipelineRun,
} from "swagger-validation-common";

import { AzureBlobClient } from "./AzureBlobClient";
import { configSchema, PublishResultConfig } from "./config";
import { EventHubProducer } from "./EventHubClient";
import { logger } from "./logger";
import * as fs from "fs";

class ResultPublisher {
  constructor(private config: PublishResultConfig) {}
  async getEventHubProduer(): Promise<EventHubProducer> {
    if (!this.config.eventHubConnectionString) {
      throw new Error("Please specify event hub connection string");
    }
    const producer = new EventHubProducer(this.config.eventHubConnectionString);
    return producer;
  }

  async getAzureBlobClient(): Promise<AzureBlobClient> {
    if (!this.config.azureBlobSasUrl) {
      throw new Error("Please specify azure blob sas url");
    }

    if (!this.config.azureBlobContainerName) {
      throw new Error("Please specify azure blob container name");
    }

    const wrapper = new AzureBlobClient(
      this.config.azureBlobSasUrl,
      this.config.azureBlobContainerName
    );
    return wrapper;
  }

  async publishEvent(
    event: PipelineEvent,
    partitionKey?: string
  ): Promise<void> {
    try {
      const producer = await this.getEventHubProduer();
      await producer.send([JSON.stringify(event)], partitionKey);
      await producer.close();
    } catch (e) {
      logger.error("Failed to send pipeline result:", JSON.stringify(event), e);
      throw e;
    }
  }

  async uploadLog(path: string, blobName: string) {
    try {
      const client = await this.getAzureBlobClient();
      await client.uploadLocal(path, blobName);
    } catch (e) {
      logger.error("Failed to upload pipeline log:", path, e);
      throw e;
    }
  }
}
export async function main(config: PublishResultConfig): Promise<void> {
  const resultPublisher = new ResultPublisher(config);
  const event: PipelineRun = {
    source: config.source,
    unifiedPipelineTaskKey: config.unifiedPipelineTaskKey,
    unifiedPipelineBuildId: config.unifiedPipelineBuildId,
    pipelineBuildId: config.pipelineBuildId,
    pipelineJobId: config.pipelineJobId,
    pipelineTaskId: config.pipelineTaskId,
  };
  const partitionKey = config.unifiedPipelineBuildId;
  switch (config.status) {
    case "in_progress":
      const inprogressEvent = {
        ...event,
        status: "in_progress",
      } as InProgressEvent;
      await resultPublisher.publishEvent(inprogressEvent, partitionKey);
      break;
    case "completed":
      let logPath = "";
      if (config.logPath) {
        // if result is success, it may not have the pipeline log, it's fine
        // otherwise, we should try to upload the pipeline log
        if (config.result === "success" && !fs.existsSync(config.logPath)) {
          logger.info(
            `result is ${config.result} and ${config.logPath} not exists, skipped uploading to azure blob`
          );
        } else {
          logPath = `${config.repoKey}/${config.unifiedPipelineBuildId}/${config.pipelineBuildId}/${config.unifiedPipelineTaskKey}.json`;
          await resultPublisher.uploadLog(config.logPath, logPath);
        }
      }
      const completionEvent: CompletedEvent = {
        ...event,
        status: "completed",
        result: config.result!,
        logPath,
      };
      await resultPublisher.publishEvent(completionEvent, partitionKey);
      break;
  }
}

if (require.main === module) {
  configSchema.load({});
  configSchema.validate({ allowed: "strict" });
  const config = configSchema.getProperties();
  main(config).catch((error) => {
    logger.error("Error:", error);
    process.exit(1);
  });
}
