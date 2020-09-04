import { MessageRecord } from "../../src/types/message";
import rawMessage from "./rawMessage.json";
import markdownMessage from "./markdownMessage.json";
import resultMessage from "./resultMessage.json";

describe("Message", () => {
  test("should parse raw message", () => {
    const rawMsg = JSON.stringify(rawMessage);
    const msg: MessageRecord = JSON.parse(rawMsg);
    expect(msg.type).toBe("Raw");
    expect(msg).toMatchSnapshot();
  });

  test("should parse result message", () => {
    const resultMsg = JSON.stringify(resultMessage);
    const msg: MessageRecord = JSON.parse(resultMsg);
    expect(msg.type).toBe("Result");
    expect(msg).toMatchSnapshot();
  });

  test("should parse markdown message", () => {
    const markdownMsg = JSON.stringify(markdownMessage);
    const msg: MessageRecord = JSON.parse(markdownMsg);
    expect(msg.type).toBe("Markdown");
    expect(msg).toMatchSnapshot();
  });
});
