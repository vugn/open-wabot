import makeWASocket, { proto } from "@whiskeysockets/baileys";
import { Serialized } from "../types/message";
const cmd = {
  1: [
    "-fs 1M",
    "-vcodec",
    "libwebp",
    "-vf",
    `scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1`,
  ],
  2: ["-fs 1M", "-vcodec", "libwebp"],
};

async function serialize(
  msg: proto.IWebMessageInfo,
  conn: ReturnType<typeof makeWASocket>
) {
  let isGroup: boolean = msg.key.remoteJid?.includes("@g.us") ?? false;
  let isSelf: boolean = msg.key.fromMe ?? false;
  const mediaMessage =
    msg?.message?.imageMessage ||
    msg?.message?.videoMessage ||
    msg?.message?.documentMessage;
  let message: Serialized = {
    id: msg.key.id ?? "",
    from: msg.key.remoteJid ?? "",
    isSelf: isSelf,
    isGroup: isGroup,
    sender: isGroup ? msg.key.participant ?? "" : msg.key.remoteJid ?? "",
    body:
      msg.message?.conversation && msg.message?.conversation.trim() !== ""
        ? msg.message?.conversation
        : mediaMessage?.caption ?? msg.message?.extendedTextMessage?.text ?? "",
    raw: msg,
  };
  return message;
}

export { serialize };
