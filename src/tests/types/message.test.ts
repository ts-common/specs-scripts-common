import { Message, MessageType } from "../../types/message";

describe("Message", () => {
  const rawMsg = `{
  "type": "Raw",
  "data": [
    {
      "level": "Error",
      "message": "the tool failed",
      "time": "2012-04-23T18:25:43.511Z",
      "extra": {
        "role": "sdk automation"
      }
    }
  ]
}`;

  const resultMsg = `{
  "type": "Result",
  "data": [
    {
      "level": "Info",
      "id": "R2044",
      "time": "2012-04-23T18:25:43.511Z",
      "code": "InvalidVerbUsed",
      "docUrl": "https://github.com/Azure/azure-rest-api-specs/blob/master/documentation/openapi-authoring-automated-guidelines.md#r2044",
      "message": "Each operation definition must have a HTTP verb and it must be DELETE/GET/PUT/PATCH/HEAD/OPTIONS/POST/TRACE.",
      "paths": [
        {
          "tag": "swagger",
          "path": "specification/databox/resource-manager/Microsoft.DataBox/stable/2019-09-01/databox.json:123:12"
        },
        {
          "tag": "example",
          "path": "specification/databox/resource-manager/Microsoft.DataBox/stable/2019-09-01/databox.json:126:13"
        }
      ],
      "extra": {
        "readmeUrl": "http://readme.example.url",
        "otherDetails": {
          "test": "hello"
        }
      }
    }
  ]
}
`;
  test("should parse raw message", () => {
    const msg: Message = JSON.parse(rawMsg);
    expect(msg.type).toBe(MessageType.Raw);
    expect(msg).toMatchSnapshot();
  });

  test("should parse result message", () => {
    const msg: Message = JSON.parse(resultMsg);
    expect(msg.type).toBe(MessageType.Result);
    expect(msg).toMatchSnapshot();
  });
});
