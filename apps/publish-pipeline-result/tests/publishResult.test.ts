import * as pr from "../src/publishResult";

const sendBatch = jest.fn();

jest.mock("@azure/event-hubs", () => ({
  EventHubProducerClient: () => ({
    createBatch: () => ({
      tryAdd: () => true,
      count: 1
    }),
    sendBatch: sendBatch,
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
  beforeEach(() => {
    process.env["BUILD_BUILD_ID"] = "123";
    process.env["AZURE_BLOB_SAS_URL"] = "dummy";
    process.env["EVENTHUB_CONNECTION_STRING="] = "dummy";
  });

  it("should send in progress event", async () => {
    const argv = {
      taskKey: "LintDiff",
      taskRunId: 12,
      status: "InProgress"
    } as any;
    expect(pr.main(argv)).resolves.not.toThrow();
  });

  it("should send completed event", async () => {
    const argv = {
      taskKey: "LintDiff",
      taskRunId: 12,
      status: "Completed",
      result: "Failure",
      logPath: "./package.json"
    } as any;
    expect(pr.main(argv)).resolves.not.toThrow();
    expect(sendBatch).toHaveBeenCalled();
  });
});
