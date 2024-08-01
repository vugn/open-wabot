import {
  ICommandOptions,
  IRunConnection,
  IRunMessage,
} from "../../types/message";

/**
 * Command to Hide Tag All Group Member
 */
const hideTagCommand: ICommandOptions = {
  name: "hidetag",
  alias: ["hide", "hidetag"],
  desc: "Hidetag all Group Member",
  use: "!hidetag",
  example: "!hidetag",
  category: "Admin",
  wait: false,
  isOwner: true,
  isAdmin: true,
  isQuoted: false,
  isGroup: false,
  isBotAdmin: false,
  isQuery: false,
  isPrivate: true,
  isUrl: false,
  run: async (connection: IRunConnection, message?: IRunMessage) => {
    if (!message?.isAdmin) {
      await connection.conn.sendMessage(
        connection.msg.from,
        {
          text: `You are not an admin!`,
        },
        {
          quoted: connection.msg.raw,
        }
      );
      return;
    }
    await connection.conn.sendMessage(connection.msg.from, {
      text: `${message?.arg}`,
      mentions: message?.groups?.participants.map(
        (participant) => participant.id
      ),
    });
  },
};

module.exports = hideTagCommand;
