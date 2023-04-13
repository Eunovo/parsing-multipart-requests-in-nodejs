export type Field = {
    name: string,
    data: string |  Buffer;
} & ({
    type: 'text'
} | {
    type: 'file',
    filename: string,
    contentType: string
});

export class FieldBuilder {
    private field: any = {};

    name(name: string) {
        this.field.name = name;
        this.field.type = 'text';

        return this;
    }

    filename(name?: string) {
        if (!name) return this;

        this.field.type = 'file';
        this.field.filename = name;

        return this;
    }

    contentType(type: string) {
        this.field.contentType = type;

        return this;
    }

    content(data: Buffer) {
        this.field.data = data;

        return this;
    }

    build(): Field {
        if (this.field.type === 'text') this.field.data = this.field.data.toString();
        return this.field
    }
}
