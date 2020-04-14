#!/usr/bin/env node
import { CompletedEvent, InProgressEvent, PipelineEvent } from 'swagger-validation-common/lib/event';

import { PipelineRun } from '../../../libraries/swagger-validation-common/src/types/event';
import { AzureBlobClient } from './AzureBlobClient';
import { configSchema, PublishResultConfig } from './config';
import { EventHubProducer } from './EventHubClient';
import { logger } from './logger';


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

  async publishEvent(event: PipelineEvent): Promise<void> {
    try {
      const producer = await this.getEventHubProduer();
      await producer.send([JSON.stringify(event)]);
      await producer.close();
    } catch (e) {
      logger.error("Failed to send pipeline result:", JSON.stringify(event), e);
      throw e;
    }
  }

  async uploadLog(path: string, blobName: string): Promise<string> {
    try {
      const client = await this.getAzureBlobClient();
      const uploadedUrl = await client.uploadLocal(path, blobName);
      return uploadedUrl;
    } catch (e) {
      logger.error("Failed to upload pipeline log:", path, e);
      throw e;
    }
  }
}
export async function main(config: PublishResultConfig): Promise<void> {
  const resultPublisher = new ResultPublisher(config);
  logger.info(config);
  const event: PipelineRun = {
    taskKey: config.taskKey,
    taskRunId: config.taskRunId,
    pipelineBuildId: config.pipelineBuildId,
    pipelineJobId: config.pipelineJobId,
    pipelineTaskId: config.pipelineTaskId,
  };
  logger.info(event);
  switch (config.status) {
    case "InProgress":
      const inprogressEvent = {
        ...event,
        status: "InProgress"
      } as InProgressEvent;
      await resultPublisher.publishEvent(inprogressEvent);
      break;
    case "Completed":
      let logPath = "";
      if (config.logPath) {
        logPath = await resultPublisher.uploadLog(
          config.logPath,
          `${config.taskRunId}-${config.pipelineBuildId}/${config.taskKey}-result.json`
        );
      }
      const completionEvent: CompletedEvent = {
        ...event,
        status: "Completed",
        result: config.result!,
        logPath
      };
      await resultPublisher.publishEvent(completionEvent);
      break;
  }
}

if (require.main === module) {
  configSchema.load({});
  configSchema.validate({ allowed: "strict" });
  const config = configSchema.getProperties();
  main(config).catch(error => {
    logger.error("Error:", error);
    process.exit(1);
  });
}
