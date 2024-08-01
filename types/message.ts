import makeWASocket, {
  GroupMetadata,
  MessageUpsertType,
  proto,
  WAMessage,
} from "@whiskeysockets/baileys";
import { FeatureAttribute } from "./attributes";

export interface Msg {
  messages: WAMessage[];
  type: MessageUpsertType;
}

export type MessageType =
  | "imageMessage"
  | "videoMessage"
  | "stickerMessage"
  | "documentMessage"
  | "audioMessage"
  | "templateMessage"
  | "buttonsMessage";

export interface Serialized {
  id: string;
  isSelf: boolean;
  from: string;
  isGroup: boolean;
  sender: string;
  body: string;
  raw: proto.IWebMessageInfo;
}

export interface ICommandOptionsMap {
  [k: string]: any;
}
export interface IRunConnection {
  msg: Serialized;
  conn: ReturnType<typeof makeWASocket>;
}
export interface IRunMessage {
  query?: string | undefined;
  arg?: string | undefined;
  args?: any;
  map: FeatureAttribute;
  command?: ICommandOptions;
  groups?: GroupMetadata;
  clean?: string | undefined;
  prefix?: string | undefined;
  isGroup?: boolean | undefined;
  isAdmin?: boolean | undefined;
  isPrivate?: boolean | undefined;
  isBotAdmin?: boolean | undefined;
  isSelf?: boolean | undefined;
}
export interface ICommandOptions extends ICommandOptionsMap {
  name: string;
  alias: string[];
  desc?: string;
  use?: string;
  example?: string;
  url?: string;
  category?: string;
  type?: any;
  run: (connection: IRunConnection, message?: IRunMessage) => Promise<void>;
}
