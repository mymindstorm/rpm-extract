const RPM_MAGIC = Buffer.from([0xed, 0xab, 0xee, 0xdb]);

export default (buffer: Buffer) => {
  return buffer.includes(RPM_MAGIC);
};
