import {
  downloadContentFromMessage,
  downloadMediaMessage,
  MessageType,
  WAMessage,
} from "@whiskeysockets/baileys";
import fs from "fs";



// Function to download media content
const downloadMedia = async (
  message: WAMessage,
  pathFile?: string
): Promise<string | Buffer> => {
  let type: MessageType = Object.keys(message)[0] as MessageType;

  // Mapping of message types to MIME types
  const mimeMap: { [key in MessageType]?: string } = {
    imageMessage: "image",
    videoMessage: "video",
    stickerMessage: "sticker",
    documentMessage: "document",
    audioMessage: "audio",
  };

  let mes = message.message;

  try {
    if (pathFile) {
      // Determine the correct message type
      const mediaMessage =
        mes?.imageMessage ||
        mes?.videoMessage ||
        mes?.stickerMessage ||
        mes?.documentMessage ||
        mes?.audioMessage;

      if (!mediaMessage) {
        throw new Error("No media message found");
      }

      // Download and save media content to a file
      const stream = await downloadContentFromMessage(
        mediaMessage,
        mimeMap[type] as "image" | "video" | "sticker" | "document" | "audio"
      );
      let buffer = Buffer.from([]);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      await fs.promises.writeFile(pathFile, buffer);
      return pathFile;
    } else {
      // Download media content as a buffer
      const buffer = await downloadMediaMessage(message, "buffer", {});
      return buffer;
    }
  } catch (e) {
    throw e;
  }
};

export default downloadMedia;
