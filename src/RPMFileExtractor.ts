import { EventEmitter } from "events";
import { Duplex, Readable, Writable } from "stream";
import isRpm from "./isRpm";
import isGzRpm from "./isGzRpm";
import isXzRpm from "./isXzRpm";
import gzUnzip from "./old/gzUnzip";

export class RPMFileExtractor extends EventEmitter {
  private checkedRPMHeader = false;
  private foundCompression = false;
  private buf = new Buffer(0);
  private decompressor: Duplex = new Duplex();

  processStream(stream: Readable): void {
    stream.on("data", (chunk: Buffer) => {
      // Check if this is a valid RPM
      if (!this.checkedRPMHeader) {
        // QUESTIONABLE: the first chunk _has_ to be more than 4 bytes, right?
        if (!isRpm(chunk)) {
          throw new Error("Trying to process file that is not an RPM!");
        }
        this.checkedRPMHeader = true;
      }

      // Decompress the RPM
      if (!this.foundCompression) {
        // This could be kept to 20 bytes-ish, but who cares?
        this.buf = Buffer.concat([this.buf, chunk]);

        // Inefficient, but way less bad than the old way of doing it.
        let idx;
        if ((idx = isGzRpm(this.buf)) !== -1) {
          this.foundCompression = true;
          this.decompressor.write(this.buf.subarray(idx));
        } else if ((idx = isXzRpm(this.buf)) !== -1) {
          this.foundCompression = true;
          this.decompressor.write(this.buf.subarray(idx));
        }
      } else {
        // Now that we know the compression, just forward to decompressor
        this.decompressor.write(chunk);
      }
    });

    stream.on("end", () => {
      this.emit("end");
    });

    stream.on("error", (err) => {
      this.emit("error", err);
    });
  }

  emitFile(file: Buffer, path: string): void {
    this.emit("file", file, path);
  }
}
