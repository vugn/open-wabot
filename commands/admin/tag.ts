import {
  ICommandOptions,
  IRunConnection,
  IRunMessage,
} from "../../types/message";

/**
 * Command to Tag All Group Members
 */
const tagCommand: ICommandOptions = {
  name: "tag",
  alias: ["tag", "everyone", "all"],
  desc: "Tag all Group Members",
  use: "!tag [message]",
  example: "!tag Hello everyone!",
  category: "Admin",
  wait: false,
  isOwner: false,
  isAdmin: true,
  isQuoted: false,
  isGroup: true,
  isBotAdmin: false,
  isQuery: false,
  isPrivate: false,
  isUrl: false,
  run: async (connection: IRunConnection, message?: IRunMessage) => {
    if (!message?.isAdmin && !message?.isOwner) {
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

    if (!message?.groups?.participants || message.groups.participants.length === 0) {
      await connection.conn.sendMessage(
        connection.msg.from,
        {
          text: `No participants found in this group.`,
        },
        {
          quoted: connection.msg.raw,
        }
      );
      return;
    }

    const userMessage = message?.arg ? `${message.arg}\n\n` : "";
    const mentionedJids = message?.groups?.participants.map(p => p.id);

    // Create a formatted list of all members with @mentions
    const tagList = message?.groups?.participants.map(participant => {
      const jid = participant.id;
      const username = jid.replace(/@s\.whatsapp\.net/g, '').split('@')[0];
      return `@${username}`;
    }).join(' ');

    await connection.conn.sendMessage(
      connection.msg.from,
      {
        text: `${userMessage}${tagList}`,
        mentions: mentionedJids,
      },
      {
        quoted: connection.msg.raw,
      }
    );
  },
};

module.exports = tagCommand;