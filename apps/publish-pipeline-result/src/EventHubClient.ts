// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License in the project root for license information.

import { EventHubProducerClient, CreateBatchOptions } from "@azure/event-hubs";
import { EventDataBatch } from "@azure/event-hubs/typings/event-hubs";
import { logger } from "./logger";

type HasNextBatch = boolean;

export class EventHubProducer {
  private producer: EventHubProducerClient;
  constructor(sasUrl: string) {
    this.producer = new EventHubProducerClient(sasUrl);
  }

  private async createBatch(partitionKey?: string) {
    const batchOptions: CreateBatchOptions = {};
    if (partitionKey) {
      batchOptions.partitionKey = partitionKey;
    }

    return await this.producer.createBatch(batchOptions);
  }

  private getNextBatch(
    events: string[],
    partitionKey?: string
  ): () => Promise<[HasNextBatch, EventDataBatch]> {
    let toAddIndex = 0;
    return async (): Promise<[HasNextBatch, EventDataBatch]> => {
      const batch = await this.createBatch(partitionKey);

      while (toAddIndex < events.length) {
        const isAdded = batch.tryAdd({ body: events[toAddIndex] });
        if (!isAdded) {
          break;
        }
        logger.info(`Added events[${toAddIndex}] to the batch`);
        ++toAddIndex;
      }
      return [toAddIndex < events.length, batch];
    };
  }

  public async send(events: string[], partitionKey?: string) {
    logger.info(`events to send: ${events}`);
    const getBatch = this.getNextBatch(events, partitionKey);
    let hasNext = events.length > 0;
    let nextBatch;
    while (hasNext) {
      [hasNext, nextBatch] = await getBatch();
      await this.producer.sendBatch(nextBatch);
    }
  }

  public async close() {
    try {
      await this.producer.close();
    } catch (err) {
      logger.error("Error when closing client: ", err);
    } // swallow the error
  }
}
