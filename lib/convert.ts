import { exec as run } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import Exif from "./exif";

const ex = new Exif();

/**
 * Function to convert an image file to a different format.
 * @param {Buffer} file - Image file buffer.
 * @param {string} ext1 - Original file extension.
 * @param {string} ext2 - Target file extension.
 * @param {Array} options - Additional ffmpeg options.
 * @returns {Promise<Buffer>} - Promise resolving to a buffer of the converted image.
 */
function convertImage(
  file: Buffer,
  ext1: string,
  ext2: string,
  options: Array<string> = []
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const temp = path.join(__dirname, "../temp", Date.now() + "." + ext1);
    const out = temp.replace(new RegExp(`\\.${ext1}$`), "") + "." + ext2;
    await fs.promises.writeFile(temp, file);
    ffmpeg(temp)
      .on("start", (cmd: string) => {})
      .on("error", (e: Error) => {
        fs.unlinkSync(temp);
        reject(e);
      })
      .on("end", () => {
        console.log("Finish Image");
        setTimeout(() => {
          fs.unlinkSync(temp);
          fs.unlinkSync(out);
        }, 2000);
        resolve(fs.readFileSync(out));
      })
      .addOutputOptions(options)
      .toFormat(ext2)
      .save(out);
  });
}

/**
 * Function to convert a video file to a different format.
 * @param {Buffer} file - Video file buffer.
 * @param {string} ext1 - Original file extension.
 * @param {string} ext2 - Target file extension.
 * @param {Array} options - Additional ffmpeg options.
 * @returns {Promise<Buffer>} - Promise resolving to a buffer of the converted video.
 */
function convertVideo(
  file: Buffer,
  ext1: string,
  ext2: string,
  options: Array<string> = []
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const temp = path.join(__dirname, "../temp", Date.now() + "." + ext1);
    const out = temp.replace(new RegExp(`\\.${ext1}$`), "") + "." + ext2;
    await fs.promises.writeFile(temp, file);
    ffmpeg(temp)
      .on("start", (cmd: string) => {})
      .on("error", (e: Error) => {
        fs.unlinkSync(temp);
        reject(e);
      })
      .on("end", () => {
        console.log("Finish");
        setTimeout(() => {
          fs.unlinkSync(temp);
          fs.unlinkSync(out);
        }, 2000);
        resolve(fs.readFileSync(out));
      })
      .addOutputOptions(options)
      .seekInput("00:00")
      .setDuration("00:05")
      .toFormat(ext2)
      .save(out);
  });
}

/**
 * Function to create a sticker from an image, video, or existing sticker file.
 * @param {Buffer} file - File buffer.
 * @param {Object} opts - Options object.
 * @returns {Promise<Buffer>} - Promise resolving to a buffer of the created sticker.
 */
async function sticker(file: Buffer, opts: any): Promise<Buffer | undefined> {
  if (typeof opts.cmdType === "undefined") opts.cmdType = "1";
  const cmd: { [key: number]: string[] } = {
    1: [
      "-fs 1M",
      "-vcodec",
      "libwebp",
      "-vf",
      `scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1`,
    ],
    2: ["-fs 1M", "-vcodec", "libwebp"],
  };

  if (opts.withPackInfo) {
    if (!opts.packInfo)
      throw Error("'packInfo' must be filled when using 'withPackInfo'");
    const ext = opts.isImage ? "jpg" : opts.isVideo ? "mp4" : null;
    return await stickerWithExif(
      file,
      ext ?? "",
      opts.packInfo,
      cmd[parseInt(opts.cmdType)]
    );
  }

  if (opts.isImage) {
    return convertImage(file, "jpg", "webp", cmd[parseInt(opts.cmdType)]);
  }
  if (opts.isSticker) {
    return convertImage(file, "webp", "webp", cmd[parseInt(opts.cmdType)]);
  }
  if (opts.isVideo) {
    return convertVideo(file, "mp4", "webp", cmd[parseInt(opts.cmdType)]);
  }

  // Explicitly return undefined if none of the conditions are met
  return undefined;
}

/**
 * Function to create a sticker with Exif data.
 * @param {Buffer} file - File buffer.
 * @param {string} ext - File extension.
 * @param {Object} packInfo - Sticker pack information.
 * @param {Array} cmd - ffmpeg command options.
 * @returns {Promise<Buffer>} - Promise resolving to a buffer of the created sticker with Exif data.
 */
function stickerWithExif(
  file: Buffer,
  ext: string,
  packInfo: any,
  cmd: Array<string>
): Promise<Buffer> {
  return new Promise(async (res, rej) => {
    const { packname, author } = packInfo;
    const filename = Date.now();
    const stickerBuffer =
      ext === "jpg"
        ? await convertImage(file, ext, "webp", cmd)
        : await convertVideo(file, ext, "webp", cmd);

    await ex.create(
      packname || "Open WABOT Sticker Pack",
      author || "Open WABOT",
      filename.toString()
    );

    await fs.promises.writeFile(
      path.join(__dirname, `../temp/${filename}.webp`),
      stickerBuffer
    );

    run(
      `webpmux -set exif ../temp/${filename}.exif ../temp/${filename}.webp -o ../temp/${filename}.webp`,
      async (err) => {
        if (err) {
          rej(err);
          await Promise.all([
            fs.promises.unlink(
              path.join(__dirname, `../temp/${filename}.webp`)
            ),
            fs.promises.unlink(
              path.join(__dirname, `../temp/${filename}.exif`)
            ),
          ]);
        }
        setTimeout(() => {
          fs.unlinkSync(path.join(__dirname, `../temp/${filename}.webp`));
          fs.unlinkSync(path.join(__dirname, `../temp/${filename}.exif`));
        }, 2000);
        res(fs.readFileSync(path.join(__dirname, `../temp/${filename}.webp`)));
      }
    );
  });
}

export { convertImage, convertVideo, sticker };
