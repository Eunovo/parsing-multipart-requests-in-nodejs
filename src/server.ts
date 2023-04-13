import http from 'http';
import { createFormStream } from './create-form-stream';
import { Field } from './Field';

interface IMakeServerProps {
    onText: (data: Field) => void;
    onFile: (data: Field) => void;
}

export function makeServer({
    onText,
    onFile
}: IMakeServerProps) {
    const server = http.createServer();

    server.on('request', (request, res) => {
        const contentType = request.headers['content-type'];
        const method = request.method;

        if (method?.toLowerCase() !== 'post') {
            res.writeHead(405);
            res.end("Method Not Allowed");
            return;
        }

        if (!contentType?.startsWith('multipart/form-data')) {
            res.writeHead(415);
            res.end("Unsupported Media Type");
            return;
        }

        const boundary = contentType.split("boundary=")[1]?.split(";")[0];

        const form = createFormStream(request, Buffer.from("--" + boundary));
        form.on('data', (field: Field) => {
            if (field.type === 'text') onText(field);
            if (field.type === 'file') onFile(field);
        });
        form.on('end', () => {
            res.writeHead(200);
            res.end();
        });
    });

    return {
        server
    }
}
