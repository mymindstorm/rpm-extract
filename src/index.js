import gzUnzip from "./gzUnzip";
import cpioExtract from "./cpioExtract";
import isRpm from "./isRpm";
import isGzRpm from "./isGzRpm";
import isXzRpm from "./isXzRpm";
import xzUnzip from "./xzUnzip";

async function extract(file) {
  if (!isRpm(file)) {
    throw new Error("Not a valid rpm.");
  }

  let files;
  if (await isGzRpm(file)) {
    files = await gzUnzip(file).then(cpioExtract);
  } else if (await isXzRpm(file)) {
    files = await xzUnzip(file).then(cpioExtract);
  } else {
    throw new Error("Unsupported compression type!");
  }

  return files;
}

export default extract;
