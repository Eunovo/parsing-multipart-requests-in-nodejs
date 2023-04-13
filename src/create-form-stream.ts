import through2 from "through2";
import { Readable } from "stream";
import { FieldBuilder } from "./Field";
import { shiftLeft, parseDisposition, parseContentType } from "./utils";

export function createFormStream(stream: Readable, boundary: Buffer) {
    let boundarySlidingBuffer = Buffer.alloc(boundary.length);
    let fieldBuffer = Buffer.alloc(0);

    return stream
        .pipe(
            through2(function (chunk, _enc, callback) {
                // Detect boundaries and output each field chunk
                let data: Buffer;
                for (let i = 0; i < chunk.length; i++) {
                    data = shiftLeft(boundarySlidingBuffer, chunk[i]);
                    fieldBuffer = Buffer.concat([fieldBuffer, data]);
                    if (boundarySlidingBuffer.compare(boundary) === 0) {
                        // Boundary detected
                        // Remove "\r\n" from the beginning and end then push
                        this.push(fieldBuffer.subarray(2, -2));
                        fieldBuffer = Buffer.alloc(0);
                        boundarySlidingBuffer = Buffer.alloc(boundary.length);
                    }
                }
                callback();
            })
        )
        .pipe(
            through2.obj(function (chunk, _enc, callback) {
                const lines: string[] = [];
                let dataStartIndex = 0;

                const newLine = Buffer.from("\r\n");
                let newLineSlidingBuffer = Buffer.alloc(newLine.length);
                let line = Buffer.alloc(0);
                let data: Buffer;
                for (let i = 0; i < chunk.length; i++) {
                    data = shiftLeft(newLineSlidingBuffer, chunk[i]);
                    line = Buffer.concat([line, data]);
                    if (newLineSlidingBuffer.compare(newLine) === 0) {
                        // New line detected
                        lines.push(line.toString());
                        if (lines[lines.length - 1] === '') {
                            // Break at first empty line. Time for data!
                            dataStartIndex = i + 1;
                            break;
                        }

                        line = Buffer.alloc(0);
                        newLineSlidingBuffer = Buffer.alloc(newLine.length);
                    }
                }

                const builder = new FieldBuilder();

                const disposition = parseDisposition(lines[0]);
                builder
                    .name(disposition.name)
                    .filename(disposition.filename);

                if (lines[1] !== '') {
                    const contentType = parseContentType(lines[1]);
                    builder.contentType(contentType);
                }

                this.push(
                    builder
                        .content(chunk.subarray(dataStartIndex))
                        .build()
                );

                callback();
            })
        );
}
