import xz from "xz";
import fs from "fs";

const XZ_MAGIC = [0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00];
const readFileAsync = pify(fs.readFile);

export default async (file) => {
  let data;
  if (typeof file === "string") {
    data = await readFileAsync(file);
  } else {
    data = file;
  }

  const idx = data.indexOf(Buffer.from(XZ_MAGIC));

  if (idx === -1) {
    throw new Error("Not an xz archive!");
  }

  const decompressor = new xz.Decompressor();

  return decompressor.updatePromise(data.slice(idx));
};
