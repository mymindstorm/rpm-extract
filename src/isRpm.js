import readChunk from "read-chunk";

const RPM_MAGIC = [0xed, 0xab, 0xee, 0xdb];

export default (file) => {
  let header;
  if (typeof file === "string") {
    header = readChunk.sync(file, 0, RPM_MAGIC.length);
  } else {
    header = file.slice(0, RPM_MAGIC.length);
  }

  for (let i = 0; i < RPM_MAGIC.length; i++) {
    if (header[i] !== RPM_MAGIC[i]) {
      return false;
    }
  }

  return true;
};
