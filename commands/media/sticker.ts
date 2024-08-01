import { sticker } from "../../lib/convert";
import downloadMedia from "../../lib/downloadMedia";
import { StickerOptions } from "../../types/exif";
import {
  ICommandOptions,
  IRunConnection,
  IRunMessage,
} from "../../types/message";

/**
 * Command to create a sticker from an image, video, or existing sticker file
 */
const stickerCommand: ICommandOptions = {
  name: "sticker",
  alias: ["sticker", "s"],
  desc: "Creates a sticker from an image, video, or existing sticker file",
  use: "!sticker",
  example: "!sticker",
  category: "utility",
  wait: true,
  isOwner: false,
  isAdmin: false,
  isQuoted: true,
  isGroup: false,
  isBotAdmin: false,
  isQuery: false,
  isPrivate: false,
  isUrl: false,
  run: async (connection: IRunConnection, message?: IRunMessage) => {
    if (
      !connection.msg.raw.message?.imageMessage &&
      !connection.msg.raw.message?.videoMessage &&
      !connection.msg.raw.message?.stickerMessage &&
      !connection.msg.raw.message?.extendedTextMessage
    ) {
      await connection.conn.sendMessage(connection.msg.from, {
        text: "Please reply to an image, video, or sticker message with the command.",
      });
      return;
    }

    try {
      const fileBuffer = await downloadMedia(connection.msg.raw);
      if (!fileBuffer) {
        await connection.conn.sendMessage(connection.msg.from, {
          text: "Failed to download the media file.",
        });
        return;
      }

      const opts: StickerOptions = {
        isImage: connection.msg.raw.message?.imageMessage != null,
        isVideo: connection.msg.raw.message?.videoMessage != null,
        isSticker: connection.msg.raw.message?.stickerMessage != null,
        withPackInfo: false,
        packInfo: {
          author: "Open WABOT",
          packname: "Open WABOT Sticker Pack",
        },
        cmdType: "1",
      };

      const stickerBuffer = await sticker(fileBuffer as Buffer, opts);
      if (stickerBuffer) {
        await connection.conn.sendMessage(connection.msg.from, {
          sticker: stickerBuffer,
        });
      } else {
        await connection.conn.sendMessage(connection.msg.from, {
          text: "Failed to create the sticker.",
        });
      }
    } catch (error) {
      await connection.conn.sendMessage(connection.msg.from, {
        text: `${error}`,
      });
    }
  },
};

module.exports = stickerCommand;
