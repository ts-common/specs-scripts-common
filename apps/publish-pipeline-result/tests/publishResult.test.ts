import { PublishResultConfig } from "../src/config";
import * as pr from "../src/publishResult";

const sendBatch = jest.fn();

jest.mock("convict");

jest.mock("@azure/event-hubs", () => ({
  EventHubProducerClient: () => ({
    createBatch: () => ({
      tryAdd: () => true,
      count: 1,
    }),
    sendBatch,
    close: jest.fn(),
  }),
}));

const uploadFile = jest.fn().mockResolvedValue({ errorCode: 0 });
jest.mock("@azure/storage-blob", () => ({
  BlobServiceClient: () => ({
    getContainerClient: () => ({
      exists: () => true,
      getBlockBlobClient: () => ({
        accountName: "dummyaccountname",
        uploadFile,
      }),
    }),
  }),
}));

describe("publishResult", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // this is important - it clears the cache
    process.env = { ...OLD_ENV };
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("should send skipped event of sub task", async () => {
    process.env.SYSTEM_COLLECTIONURI = "https://systemcollection.com";
    process.env.SYSTEM_TEAMPROJECT = "teamproject";
    process.env.BUILD_BUILDID = "123";
    const argv: PublishResultConfig = {
      source: "github",
      env: "prod",
      repoKey: "testorg/testspecrepo",
      pipelineBuildId: "1",
      pipelineJobId: "1",
      pipelineTaskId: "1",
      unifiedPipelineTaskKey: "SdkAuto",
      unifiedPipelineSubTaskKey: "azure-sdk-for-python",
      unifiedPipelineBuildId: "12",
      status: "skipped",
      subTitle: "why skipped",
      eventHubConnectionString: "dummy",
    };
    expect(pr.main(argv)).resolves.not.toThrow();
  });

  it("should send queued event of sub task", async () => {
    process.env.SYSTEM_COLLECTIONURI = "https://systemcollection.com";
    process.env.SYSTEM_TEAMPROJECT = "teamproject";
    process.env.BUILD_BUILDID = "123";
    const argv: PublishResultConfig = {
      source: "github",
      env: "ppe",
      repoKey: "testorg/testspecrepo",
      pipelineBuildId: "1",
      pipelineJobId: "1",
      pipelineTaskId: "1",
      unifiedPipelineTaskKey: "SdkAuto",
      unifiedPipelineSubTaskKey: "azure-sdk-for-python",
      unifiedPipelineBuildId: "12",
      status: "queued",
      eventHubConnectionString: "dummy",
    };
    expect(pr.main(argv)).resolves.not.toThrow();
  });

  it("should send in progress event", async () => {
    process.env.SYSTEM_COLLECTIONURI = "https://systemcollection.com";
    process.env.SYSTEM_TEAMPROJECT = "teamproject";
    process.env.BUILD_BUILDID = "123";
    const argv: PublishResultConfig = {
      env: "prod",
      source: "github",
      repoKey: "testorg/testspecrepo",
      pipelineBuildId: "1",
      pipelineJobId: "1",
      pipelineTaskId: "1",
      unifiedPipelineTaskKey: "LintDiff",
      unifiedPipelineBuildId: "12",
      status: "in_progress",
      eventHubConnectionString: "dummy",
    };
    expect(pr.main(argv)).resolves.not.toThrow();
  });

  it("should send completed event", async () => {
    process.env.SYSTEM_COLLECTIONURI = "https://systemcollection.com";
    process.env.SYSTEM_TEAMPROJECT = "teamproject";
    process.env.BUILD_BUILDID = "123";

    const argv: PublishResultConfig = {
      source: "github",
      repoKey: "testorg/testspecrepo",
      pipelineBuildId: "123",
      pipelineJobId: "1",
      pipelineTaskId: "1",
      subTitle: "this is subtitle",
      unifiedPipelineTaskKey: "LintDiff",
      unifiedPipelineBuildId: "12",
      status: "completed",
      result: "failure",
      logPath: "./package.json",
      azureBlobContainerName: "containername",
      azureBlobSasUrl: "dummy",
      eventHubConnectionString: "dummy",
    };
    expect(pr.main(argv)).resolves.not.toThrow();
    expect(sendBatch).toHaveBeenCalled();
  });
});
