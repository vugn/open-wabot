import {
  ICommandOptions,
  IRunConnection,
  IRunMessage,
} from "../../types/message";

/**
 * Command to get the current time
 */
const currentTimeCommand: ICommandOptions = {
  name: "currentTime",
  alias: ["time", "currentTime"],
  desc: "Returns the current time",
  use: "!currentTime",
  example: "!currentTime",
  category: "utility",
  wait: false,
  isOwner: false,
  isAdmin: false,
  isQuoted: false,
  isGroup: false,
  isBotAdmin: false,
  isQuery: false,
  isPrivate: false,
  isUrl: false,
  run: async (connection: IRunConnection, message?: IRunMessage) => {
    const currentTime = new Date().toLocaleTimeString();
    await connection.conn.sendMessage(connection.msg.from, {
      text: `Current time is: ${currentTime}`,
    });
  },
};

module.exports = currentTimeCommand;
