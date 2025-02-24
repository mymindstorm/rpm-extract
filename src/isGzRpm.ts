const RPM_GZIP_MAGIC = Buffer.from([0x00, 0x00, 0x00, 0x10, 0x1f, 0x8b, 0x08]);

export default (buf: Buffer) => {
  const idx = buf.indexOf(RPM_GZIP_MAGIC);

  // The + 4 offsets the four bytes from the RPM data structure.
  // i.e. [0x00, 0x00, 0x00, 0x10] are from RPM, not gzip.
  return idx === -1 ? -1 : idx + 4;
};
