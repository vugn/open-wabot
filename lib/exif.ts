import fs from "fs";
import path from "path";

const packID = "";
const playstore = "";
const itunes = "";

/**
 * @class Exif
 */
class Exif {
  /**
   * Create an EXIF file.
   * @param {string} packname
   * @param {string} authorname
   * @param {string} filename
   */
  async create(
    packname: string,
    authorname: string,
    filename: string = "data"
  ): Promise<void> {
    const json = {
      "sticker-pack-id": packID,
      "sticker-pack-name": packname,
      "sticker-pack-publisher": authorname,
      "android-app-store-link": playstore,
      "ios-app-store-link": itunes,
      emojis: ["😁"],
    };

    let len = new TextEncoder().encode(JSON.stringify(json)).length;
    const f = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00,
    ]);
    const code = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00];

    if (len > 256) {
      len = len - 256;
      code.unshift(0x01);
    } else {
      code.unshift(0x00);
    }

    const fff = Buffer.from(code);
    const ffff = Buffer.from(JSON.stringify(json));

    let lenHex = len.toString(16);
    if (len < 16) {
      lenHex = "0" + lenHex;
    }

    const ff = Buffer.from(lenHex, "hex");
    const buffer = Buffer.concat([f, ff, fff, ffff]);

    try {
      const filePath = path.join(__dirname, `../temp/${filename}.exif`);
      await fs.promises.writeFile(filePath, buffer);
    } catch (err) {
      console.error(err);
    }
  }
}

export default Exif;
