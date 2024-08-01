import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeInMemoryStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import Pino from "pino";
import { FeatureAttribute } from "./types/attributes";
import readFeatures from "./lib/readFeatures";
import logger from "./lib/logger";

// Initialize attributes object
const attr: FeatureAttribute = {
  uptime: new Date(),
  command: new Map(),
};

// Create an in-memory store with Pino logger
let store = makeInMemoryStore({
  logger: Pino().child({
    level: "silent",
    stream: "store",
  }),
});

// Read features from the 'lib' module
readFeatures(attr);

async function connectToWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      "auth_info_baileys"
    );
    let sock: ReturnType<typeof makeWASocket> | undefined;

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: Pino({ level: "silent" }),
      syncFullHistory: false,
      markOnlineOnConnect: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 10000,
      linkPreviewImageThumbnailWidth: 300,
      generateHighQualityLinkPreview: true,
      patchMessageBeforeSending: (message) => {
        // Patch messages before sending if required
        const requiresPatch = !!(
          message.buttonsMessage ||
          message.templateMessage ||
          message.listMessage
        );
        if (requiresPatch) {
          message = {
            viewOnceMessage: {
              message: {
                messageContextInfo: {
                  deviceListMetadataVersion: 2,
                  deviceListMetadata: {},
                },
                ...message,
              },
            },
          };
        }
        return message;
      },
      getMessage: async (key) => {
        // Get message from the store or return a default message
        if (store) {
          const msg = await store.loadMessage(
            key.remoteJid ?? "",
            key.id ?? ""
          );
          return msg?.message || undefined;
        }
        return {
          conversation: "hello world",
        };
      },
    });

    // Bind store to the connection events
    store.bind(sock.ev);

    // Listen for 'creds.update' event and save credentials
    sock.ev.on("creds.update", saveCreds);

    // Use a function expression for event handler
    const connectionUpdateHandler = async (update: any) => {
      const { lastDisconnect, connection } = update;

      // Log connection status
      if (connection) {
        console.log(
          connection === "connecting"
            ? "Connecting to the WhatsApp bot..."
            : `Connection: ${connection}`
        );
      }

      // Handle different connection states
      switch (connection) {
        case "open":
          console.log("Successfully connected to WhatsApp");
          break;
        case "close":
          handleDisconnect(lastDisconnect?.error);
          break;
      }
    };

    sock.ev.on("connection.update", connectionUpdateHandler);

    // Define the handleDisconnect function outside the async function
    function handleDisconnect(error: Error | undefined) {
      const reason = new Boom(error).output.statusCode;

      // Handle specific disconnect reasons
      switch (reason) {
        case DisconnectReason.badSession:
          console.log("Bad Session File, Please Delete session and Scan Again");
          sock?.logout();
          break;
        case DisconnectReason.connectionClosed:
          console.log("Connection closed, reconnecting...");
          connectToWhatsApp();
          break;
        case DisconnectReason.connectionLost:
          console.log("Connection Lost from Server, reconnecting...");
          connectToWhatsApp();
          break;
        case DisconnectReason.connectionReplaced:
          console.log(
            "Connection Replaced, Another New Session Opened, Please Close Current Session First"
          );
          sock?.logout();
          break;
        case DisconnectReason.loggedOut:
          console.log(
            "Device Logged Out, Please Delete session and Scan Again."
          );
          sock?.logout();
          break;
        case DisconnectReason.restartRequired:
          console.log("ReconnectToWhatsApp Required, Reconnecting...");
          connectToWhatsApp();
          break;
        case DisconnectReason.timedOut:
          console.log("Connection TimedOut, Reconnecting...");
          connectToWhatsApp();
          break;
        default:
          sock?.end(Error(`Unknown DisconnectReason: ${reason}|${error}`));
      }
    }

    sock.ev.on("messages.upsert", async (message) => {
      //TODO Create Upsert Event
    });

    sock.ev.on("group-participants.update", async (message) => {
      //TODO Create Group Event
    });
  } catch (error) {
    console.error(error);
  }
}

// Run in main file
connectToWhatsApp();
