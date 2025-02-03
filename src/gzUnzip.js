import zlib from "zlib";
import pify from "pify";
import fs from "fs";

const GZIP_MAGIC = [0x1f, 0x8b, 0x08];
const readFileAsync = pify(fs.readFile);

export default async (file) => {
  let data;
  if (typeof file === "string") {
    data = await readFileAsync(file);
  } else {
    data = file;
  }

  const idx = data.indexOf(Buffer.from(GZIP_MAGIC));

  if (idx === -1) {
    throw new Error("Only gzip compressed cpio archives are supported.");
  }

  return pify(zlib.unzip)(data.slice(idx));
};
