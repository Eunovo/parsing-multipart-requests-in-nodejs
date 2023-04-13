export function parseDisposition(line: string) {
    const disposition: any = {};
    const tokens = line.trim().split('; ')
    tokens.forEach((element, index) => {
        if (index === 0) return;
        const equalityIndex = element.indexOf('=');
        disposition[element.substring(0, equalityIndex)] = element.substring(
            equalityIndex + 2, element.length - 1
        );
    });
    return disposition as { name: string, filename?: string };
}

export function parseContentType(line: string) {
    const tokens = line.trim().split(':')
    const type = tokens[1]?.trim();
    return type;
}

export function shiftLeft(buff: Buffer, data: any) {
    let shiftedOutData = buff[0];

    buff.copyWithin(0, 1);
    buff[buff.length - 1] = data;

    // If data is x00, return an empty buffer
    if (shiftedOutData === 0) return Buffer.alloc(0);

    return Buffer.from([shiftedOutData]);
}
