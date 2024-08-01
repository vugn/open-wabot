import fs from "fs";
import path from "path";
import {
  ICommandOptions,
  IRunConnection,
  IRunMessage,
} from "../../types/message";

/**
 * Command to show the list of available commands
 */
const helpCommand: ICommandOptions = {
  name: "help",
  alias: ["commands", "help"],
  desc: "Shows the list of available commands",
  use: "!help",
  example: "!help",
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
    const commands: Record<string, ICommandOptions[]> = {};
    const pathDir = path.join(__dirname, "../../commands");
    const features = fs.readdirSync(pathDir);

    for (const feature of features) {
      // Skip the "admin" folder if the user is not an admin
      if (feature === "admin" && !message?.isAdmin) {
        continue;
      }

      const commandFiles = fs
        .readdirSync(`${pathDir}/${feature}`)
        .filter((file) => file.endsWith(".ts"));

      for (const file of commandFiles) {
        const command = require(`${pathDir}/${feature}/${file}`);

        if (typeof command.run !== "function") continue;

        const defaultCmdOptions: ICommandOptions = {
          name: "Help",
          alias: ["help", "h", "commands"],
          desc: "Show the list of available commands",
          use: "!help",
          example: "!help",
          url: "",
          category: feature.toLowerCase(),
          wait: false,
          isOwner: false,
          isAdmin: false,
          isQuoted: false,
          isGroup: false,
          isBotAdmin: false,
          isQuery: false,
          isPrivate: false,
          isUrl: false,
          run: async () => {},
        };

        const cmdOptions = { ...defaultCmdOptions, ...command };
        if (!commands[feature]) {
          commands[feature] = [];
        }
        commands[feature].push(cmdOptions);
      }
    }

    let helpMessage = "Here are the available commands:\n\n";
    for (const feature in commands) {
      helpMessage += `*${
        feature.charAt(0).toUpperCase() + feature.slice(1)
      }:*\n`;
      commands[feature].forEach((cmd, index) => {
        helpMessage += `\n*${index + 1}. ${cmd.name}* (${cmd.alias.join(
          ", "
        )}):\n`;
        helpMessage += `- *Description:* ${cmd.desc}\n`;
        helpMessage += `- *Usage:* ${cmd.use}\n`;
        helpMessage += `- *Example:* ${cmd.example}\n`;
      });
      helpMessage += "\n";
    }

    await connection.conn.sendMessage(connection.msg.from, {
      text: helpMessage,
    });
  },
};

module.exports = helpCommand;
