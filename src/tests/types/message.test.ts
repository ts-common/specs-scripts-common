import { Message, MessageType } from "../../types/message";
import rawMessage from "./rawMessage.json";
import resultMessage from "./resultMessage.json";

describe("Message", () => {
  test("should parse raw message", () => {
    const rawMsg = JSON.stringify(rawMessage);
    const msg: Message = JSON.parse(rawMsg);
    expect(msg.type).toBe(MessageType.Raw);
    expect(msg).toMatchSnapshot();
  });

  test("should parse result message", () => {
    const resultMsg = JSON.stringify(resultMessage);
    const msg: Message = JSON.parse(resultMsg);
    expect(msg.type).toBe(MessageType.Result);
    expect(msg).toMatchSnapshot();
  });
});
