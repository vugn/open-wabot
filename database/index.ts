import * as fs from "fs";
import * as path from "path";

interface Message {
  pushName: string;
  command: string;
}

interface Command {
  use?: string;
  category?: string;
  desc?: string;
  example?: string;
}

interface Replacements {
  [key: string]: string | number;
}

/**
 * Database class for reading and saving data to JSON files with string replacements.
 */
export class Database {
  private replacements: Replacements;

  /**
   * Creates an instance of the Database class.
   * @param {Message} msg - The message object.
   * @param {Command} cmd - The command object.
   * @param {string} query - The query string.
   */
  constructor(msg: Message, cmd: Command, query: string) {
    // Placeholder replacements for string patterns
    this.replacements = {
      ":name:": msg.pushName,
      ":botname:": this.read("setting").bot.name,
      ":command:": msg.command,
      ":query:": query,
      ":use:": cmd && cmd.use ? cmd.use : "",
      ":cmd.category:":
        cmd && cmd.category ? cmd.category.replace(/ /gi, "") : "",
      ":cmd.description:": cmd && cmd.desc ? cmd.desc : "",
      ":cmd.example:":
        cmd && cmd.example ? cmd.example.replace(/%cmd/gi, msg.command) : "",
      ":cd.timeleft:": 0,
      linkfor: "",
    };
  }

  /**
   * Reads data from a JSON file and performs string replacements.
   * @param {string} identifier - The identifier for the JSON file.
   * @returns {object} The parsed and replaced JSON data.
   */
  read(identifier: string): any {
    const jsonData = JSON.parse(
      fs.readFileSync(this.getFilePath(identifier), "utf8")
    );
    return this.recursiveReplace(jsonData);
  }

  /**
   * Saves data to a JSON file after performing string replacements.
   * @param {string} identifier - The identifier for the JSON file.
   * @param {object} data - The data to be saved.
   */
  save(identifier: string, data: any): void {
    const jsonString = JSON.stringify(this.recursiveReplace(data), null, 2);
    fs.writeFileSync(this.getFilePath(identifier), jsonString, "utf8");
  }

  /**
   * Gets the file path based on the identifier.
   * @param {string} identifier - The identifier for the JSON file.
   * @returns {string} The file path.
   */
  getFilePath(identifier: string): string {
    if (identifier === "setting") return "./setting.json";
    else if (identifier.match("language")) return `./${identifier}.json`;
    else return path.join(`./database/${identifier}.json`);
  }

  /**
   * Recursively replaces string patterns in a JSON object.
   * @param {object} obj - The input JSON object.
   * @returns {object} The JSON object with replacements.
   */
  recursiveReplace(obj: any): any {
    for (let prop in obj) {
      if (obj[prop] instanceof Object) {
        // Recursively call recursiveReplace for nested objects
        obj[prop] = this.recursiveReplace(obj[prop]);
      } else if (typeof obj[prop] === "string") {
        // Perform the replacement in string values
        obj[prop] = this.replaceMultiple(obj[prop], this.replacements);
      }
    }
    return obj;
  }

  /**
   * Replaces multiple patterns in a string using a replacements object.
   * @param {string} str - The input string.
   * @param {Replacements} replacements - The replacements object.
   * @returns {string} The string with replacements.
   */
  replaceMultiple(str: string, replacements: Replacements): string {
    for (let key in replacements) {
      const pattern = new RegExp(key, "g");
      str = str.replace(pattern, replacements[key].toString());
    }
    return str;
  }

  /**
   * Sets the value of ":cd.timeleft:" in the replacements object.
   * @param {number} value - The value to set.
   */
  setTimeLeft(value: number): void {
    this.replacements[":cd.timeleft:"] = value;
  }

  /**
   * Set a replacement link for ':linkfor:' in the database
   * @param {string} text - The text to set as the replacement link
   */
  setLinkFor(text: string): void {
    this.replacements[":linkfor:"] = text;
  }
}