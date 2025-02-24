const RPM_XZ_MAGIC = Buffer.from([
  0x00, 0x00, 0x00, 0x10, 0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00,
]);

export default (buf: Buffer) => {
  const idx = buf.indexOf(RPM_XZ_MAGIC);

  // The + 4 offsets the four bytes from the RPM data structure.
  // i.e. [0x00, 0x00, 0x00, 0x10] are from RPM, not xz.
  return idx === -1 ? -1 : idx + 4;
};
