// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License in the project root for license information.

import { EventHubProducerClient, CreateBatchOptions } from "@azure/event-hubs";
import { logger } from "./logger";

export class EventHubProducer {
  private producer: EventHubProducerClient;
  constructor(sasUrl: string) {
    this.producer = new EventHubProducerClient(sasUrl);
  }

  public async send(eventsToSend: string[], partitionKey?: string) {
    logger.info(`events to send: ${eventsToSend}`);
    try {
      const batchOptions: CreateBatchOptions = {};
      if (partitionKey) {
        batchOptions.partitionKey = partitionKey;
      }

      let batch = await this.producer.createBatch(batchOptions);
      let numEventsSent = 0;

      let i = 0;
      while (i < eventsToSend.length) {
        const isAdded = batch.tryAdd({ body: eventsToSend[i] });
        if (!isAdded) {
          logger.error(`Failed to add ${eventsToSend[i]}`);
        }
        if (isAdded) {
          logger.info(`Added eventsToSend[${i}] to the batch`);
          ++i;
          continue;
        }

        if (batch.count === 0) {
          logger.info(
            `Message was too large and can't be sent until it's made smaller. Skipping...`
          );
          ++i;
          continue;
        }

        // otherwise this just signals a good spot to send our batch
        logger.info(
          `Batch is full - sending ${batch.count} messages as a single batch.`
        );
        await this.producer.sendBatch(batch);
        numEventsSent += batch.count;

        // and create a new one to house the next set of messages
        batch = await this.producer.createBatch(batchOptions);
      }

      // send any remaining messages, if any.
      if (batch.count > 0) {
        logger.info(
          `Sending remaining ${batch.count} messages as a single batch.`
        );
        await this.producer.sendBatch(batch);
        numEventsSent += batch.count;
      }

      logger.info(`Sent ${numEventsSent} events`);

      if (numEventsSent !== eventsToSend.length) {
        throw new Error(
          `Not all messages were sent (${numEventsSent}/${eventsToSend.length})`
        );
      }
    } catch (err) {
      logger.error("Error when creating & sending a batch of events: ", err);
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
