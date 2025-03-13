import makeWASocket from "@whiskeysockets/baileys";
import logger from "./lib/logger";
import { serialize } from "./lib/serialize";
import { FeatureAttribute } from "./types/attributes";
import { ICommandOptions, Msg } from "./types/message";

async function handler(
  m: Msg,
  conn: ReturnType<typeof makeWASocket>,
  map: FeatureAttribute
) {
  try {
    if (m.type !== "notify") return;
    let msg = await serialize(m.messages[0], conn);
    if (!msg.raw) return;
    if (msg.raw.key && msg.raw.key.remoteJid === "status@broadcast") return;

    // Extract relevant information from the message
    const { isGroup, sender, body, from, isSelf, raw, id } = msg;
    const groups = await conn.groupMetadata(from);

    // Define bot owner number(s)
    const ownerNumbers = ["85156712795@s.whatsapp.net", "6285156712795@s.whatsapp.net"];
    const isOwner = ownerNumbers.includes(sender);

    // Function to get admin users in a group
    async function getAdmin() {
      try {
        const admins = groups.participants
          .filter((participant) => participant.admin)
          .map((admin) => admin.id);
        return admins;
      } catch (error) {
        throw error;
      }
    }

    // Check if the sender is an admin, if the chat is private, and if the bot is an admin
    const admins = isGroup ? await getAdmin() : [];
    const isAdmin = isGroup ? admins.includes(sender) : false;
    const isPrivate = from.endsWith("@s.whatsapp.net");
    const isBotAdmin = isGroup ? admins.includes(conn?.user?.id ?? "") : false;

    if (isGroup) {
      logger.info(
        `Message ${body} from ${sender} in ${isGroup ? "group" : "private"
        } chat`
      );
      // logger.info(raw);
    } else {
      logger.info(`Message ${body} from ${sender}`);
    }

    const prefixPattern = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi;
    const prefix = prefixPattern.test(body)
      ? body.match(prefixPattern)?.[0] ?? "#"
      : "#";

    // Extract additional information from the message
    const clean = body.replace(prefix, "");
    const query = clean.trim().split(/ +/).slice(1).join(" ");
    const arg = body.substring(body.indexOf(" ") + 1);
    const args = body.trim().split(/ +/).slice(1);
    const command = body.trim().split(/ +/)[0].toLowerCase();

    // Extract the command name from the message
    const cmdName = clean.trim().split(/ +/).shift()?.toLowerCase();

    // Get the command from the map
    const cmd: ICommandOptions =
      map.command.get(command) ||
      [...map.command.values()].find((x) => x.alias.includes(command)) ||
      map.command.get(cmdName) ||
      [...map.command.values()].find((x) => x.alias.includes(cmdName));

    if (cmd) {
      try {
        await cmd.run(
          { msg, conn },
          {
            query,
            map,
            args,
            groups,
            arg,
            prefix,
            isAdmin,
            isBotAdmin,
            isGroup,
            isPrivate,
            isSelf,
            isOwner
          }
        );
      } catch (error) {
        logger.error(error);
      }
    }
  } catch (error) {
    logger.error(error);
  }
}

export default handler;
