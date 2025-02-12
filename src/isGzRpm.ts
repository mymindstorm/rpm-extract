const RPM_GZIP_MAGIC = Buffer.from([0x00, 0x00, 0x00, 0x10, 0x1f, 0x8b, 0x08]);

export default (buf: Buffer) => {
  return buf.indexOf(RPM_GZIP_MAGIC);
};
