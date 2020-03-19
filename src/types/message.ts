export type MessageLevel = "Info" | "Warning" | "Error";

export type JsonPath = {
  tag: string; // meta info about the path, e.g. "swagger" or "example"
  path: string;
};

export type Extra = {
  [key: string]: any;
};

export type BaseMessageRecord = {
  level: MessageLevel;
  message: string;
  time: Date;
  extra?: Extra;
};

export type ResultMessageRecord = BaseMessageRecord & {
  id?: string;
  code?: string;
  docUrl?: string;
  paths: JsonPath[];
};

export type RawMessageRecord = BaseMessageRecord;

export type RawMessage = {
  type: "Raw";
  data: RawMessageRecord[];
};

export type ResultMessage = {
  type: "Result";
  data: ResultMessageRecord[];
};

export type Message = ResultMessage | RawMessage;
