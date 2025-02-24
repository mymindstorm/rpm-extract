import { PassThrough, Transform, TransformCallback } from "stream";
import isRpm from "./isRpm";
import isGzRpm from "./isGzRpm";
import isXzRpm from "./isXzRpm";
import zlib from "zlib";
import lzma from "lzma-native";
// @ts-expect-error no types and I don't feel like wrangling esbuild
import stream from "cpio-stream";
import concat from "concat-stream";

export interface ExtractedFile {
  data: Buffer;
  mode: string;
  mtime: string;
  path: string;
  type: string;
  linkname?: string;
}

interface CpioHeader {
  name: string;
  mode: string;
  mtime: string;
  path: string;
  type: string;
  linkname?: string;
}

export class RPMExtractorStream extends Transform {
  private headerValidated = false;
  private buffer = Buffer.alloc(0);
  private decompressor?: Transform;
  private decompressorOffset?: number;
  private decompressStream;

  constructor() {
    super({ objectMode: true });

    this.decompressStream = stream.extract();
    this.decompressStream.on("entry", this.handleCpioEntry);
  }

  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    // Check if this is a valid RPM
    if (!this.headerValidated) {
      // QUESTIONABLE: the first chunk _has_ to be more than 4 bytes, right?
      if (!isRpm(chunk)) {
        return callback(
          new Error("Trying to process file that is not an RPM!"),
        );
      }
      this.headerValidated = true;
    }

    // Decompress the RPM
    if (!this.decompressor) {
      // This could be kept to 20 bytes-ish window, but who cares?
      this.buffer = Buffer.concat([this.buffer, chunk]);

      if ((this.decompressorOffset = isGzRpm(this.buffer)) !== -1) {
        this.decompressor = zlib.createUnzip();
      } else if ((this.decompressorOffset = isXzRpm(this.buffer)) !== -1) {
        this.decompressor = lzma.createDecompressor();
      }

      if (!this.decompressor) return callback();

      this.decompressor.pipe(this.decompressStream);
      this.decompressor.write(this.buffer.subarray(this.decompressorOffset));
      this.buffer = Buffer.alloc(0); // Not sure if this helps gc get rid of the buffer
      this.pipe(this.decompressor);
    }

    return callback();
  }

  private handleCpioEntry(
    header: CpioHeader,
    stream: PassThrough,
    callback: () => void,
  ) {
    stream.pipe(
      concat((data: Buffer) => {
        concat((content) => {
          this.emitFile({
            data: content,
            mode: header.mode,
            mtime: header.mtime,
            path: header.name,
            type: header.type,
            linkname: header?.linkname,
          });
        });
      }),
    );
  }

  private emitFile(file: ExtractedFile): void {
    this.emit("file", file);
  }
}
