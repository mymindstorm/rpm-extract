import { RPMFileExtractor } from "./RPMFileEvent";
import { Readable } from "stream";

export default function extract(stream: Readable): RPMFileExtractor {
  const event = new RPMFileExtractor();
  event.processStream(stream);

  return event;
}
