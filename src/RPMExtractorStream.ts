import { PassThrough, Transform, TransformCallback } from "stream";
import isRpm from "./isRpm";
import isGzRpm from "./isGzRpm";
import isXzRpm from "./isXzRpm";
import zlib from "zlib";
import lzma from "lzma-native";
// @ts-expect-error no types and I don't feel like wrangling esbuild
import cpioStream from "cpio-stream";
import { finished, pipeline, Stream, Writable } from "node:stream";

export interface ExtractedFile {
  stream: PassThrough;
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

let myBuf = new Buffer(0);

export class RPMExtractorStream extends Transform {
  private headerValidated = false;
  private buffer = Buffer.alloc(0);
  private rpmDecompressStream?: Transform;
  private decompressorOffset?: number;
  private cpioDecompressStream: PassThrough;

  constructor() {
    super({ objectMode: true });

    this.cpioDecompressStream = cpioStream.extract();
    this.cpioDecompressStream.on("entry", this.handleCpioEntry.bind(this));
    this.cpioDecompressStream.on("error", (err: Error) =>
      this.emit("error", err),
    );
  }

  async _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): Promise<void> {
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
    if (!this.rpmDecompressStream) {
      // This could be kept to 20 bytes-ish window, but who cares?
      this.buffer = Buffer.concat([this.buffer, chunk]);

      if ((this.decompressorOffset = isGzRpm(this.buffer)) !== -1) {
        this.rpmDecompressStream = zlib.createUnzip();
      } else if ((this.decompressorOffset = isXzRpm(this.buffer)) !== -1) {
        this.rpmDecompressStream = lzma.createDecompressor();
      }

      if (!this.rpmDecompressStream) return callback();
      this.rpmDecompressStream.on("error", (err: Error) =>
        this.emit("error", err),
      );

      // this.rpmDecompressStream.pipe(this.cpioDecompressStream);
      this.rpmDecompressStream.write(
        this.buffer.subarray(this.decompressorOffset),
      );
      myBuf = this.buffer.subarray(this.decompressorOffset);
      this.buffer = Buffer.alloc(0); // Not sure if this helps gc get rid of the buffer
    } else {
      this.rpmDecompressStream.write(chunk);
      myBuf = Buffer.concat([myBuf, chunk]);
    }

    return callback();
  }

  _flush(callback: TransformCallback): void {
    if (this.rpmDecompressStream) {
      this.rpmDecompressStream.end();
      this.cpioDecompressStream.write(zlib.unzipSync(myBuf));
      finished(this.cpioDecompressStream, (err) => callback());
    } else {
      callback();
    }
  }

  private handleCpioEntry(header: CpioHeader, stream: PassThrough) {
    console.log("emitting file ", header.name);
    this.emitFile({
      stream: stream,
      mode: header.mode,
      mtime: header.mtime,
      path: header.name,
      type: header.type,
      linkname: header?.linkname,
    });
  }

  private emitFile(file: ExtractedFile): void {
    this.emit("file", file);
  }
}
