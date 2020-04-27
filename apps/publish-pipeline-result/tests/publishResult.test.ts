import { PublishResultConfig } from '../src/config';
import * as pr from '../src/publishResult';

const sendBatch = jest.fn();

jest.mock("convict");

jest.mock("@azure/event-hubs", () => ({
  EventHubProducerClient: () => ({
    createBatch: () => ({
      tryAdd: () => true,
      count: 1
    }),
    sendBatch,
    close: jest.fn()
  })
}));

const uploadFile = jest.fn().mockResolvedValue({ errorCode: 0 });
jest.mock("@azure/storage-blob", () => ({
  BlobServiceClient: () => ({
    getContainerClient: () => ({
      exists: () => true,
      getBlockBlobClient: () => ({
        accountName: "dummyaccountname",
        uploadFile
      })
    })
  })
}));

describe("publishResult", () => {
  it("should send in progress event", async () => {
    const argv: PublishResultConfig = {
      repoKey: "testorg/testspecrepo",
      pipelineBuildId: "1",
      pipelineJobId: "1",
      pipelineTaskId: "1",
      taskKey: "LintDiff",
      taskRunId: "12",
      status: "InProgress",
      eventHubConnectionString: "dummy",
    };
    expect(pr.main(argv)).resolves.not.toThrow();
  });

  it("should send completed event", async () => {
    const argv: PublishResultConfig = {
      repoKey: "testorg/testspecrepo",
      pipelineBuildId: "1",
      pipelineJobId: "1",
      pipelineTaskId: "1",
      taskKey: "LintDiff",
      taskRunId: "12",
      status: "Completed",
      result: "Failure",
      logPath: "./package.json",
      azureBlobContainerName: "containername",
      azureBlobSasUrl: "dummy",
      eventHubConnectionString: "dummy",
    };
    expect(pr.main(argv)).resolves.not.toThrow();
    expect(sendBatch).toHaveBeenCalled();
  });
});
