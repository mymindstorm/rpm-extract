declare module "cpio-stream" {
  export interface Extract extends stream.Writable {
    on(
      event: "entry",
      listener: (
        headers: Headers,
        stream: stream.PassThrough,
        callback: () => void,
      ) => void,
    ): this;
    on(event: "end" | "finish", callback: () => void): this;
  }

  export function extract(opts?: stream.WritableOptions): Extract;
}
