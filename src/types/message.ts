export enum MessageType {
  Result = "Result",
  Raw = "Raw"
}

export enum MessageLevel {
  Info = "Info",
  Warning = "Warning",
  Error = "Error"
}

export type JsonPath = {
  tag: string;
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

export type RawMessageRecord = BaseMessageRecord & {};

export type RawMessage = {
  type: MessageType;
  data: RawMessageRecord[];
};

export type ResultMessage = {
  type: MessageType;
  data: ResultMessage[];
};

export type Message = ResultMessage | RawMessage;
