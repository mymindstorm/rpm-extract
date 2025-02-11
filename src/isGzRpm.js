import pify from "pify";
import fs from "fs";

const RPM_GZIP_MAGIC = [0x00, 0x00, 0x00, 0x10, 0x1f, 0x8b, 0x08];
const readFileAsync = pify(fs.readFile);

export default async (file) => {
  console.log("GZ");
  let data;
  if (typeof file === "string") {
    data = await readFileAsync(file);
  } else {
    data = file;
  }

  const idx = data.indexOf(Buffer.from(RPM_GZIP_MAGIC));

  console.log("IDX: " + idx);

  return idx !== -1;
};
