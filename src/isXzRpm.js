import pify from "pify";
import fs from "fs";

const RPM_XZ_MAGIC = [
  0x00, 0x00, 0x00, 0x10, 0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00,
];
const readFileAsync = pify(fs.readFile);

export default async (file) => {
  let data;
  if (typeof file === "string") {
    data = await readFileAsync(file);
  } else {
    data = file;
  }

  const idx = data.indexOf(Buffer.from(RPM_XZ_MAGIC));
  return idx !== -1;
};
