import test from 'ava';
import request from 'supertest';
import { makeServer } from '../src/server';

test('test form data with text field', async t => {
    t.plan(2);

    const { server } = makeServer({
        onText(field) {
            t.is(field.name, 'test');
            t.is(field.data, 'Test Value');
        },
        onFile(field) {
            t.fail('No file field was expected');
        },
    });
    await request(server)
        .post('/')
        .field('test', 'Test Value')
        .expect(200);
});

test('test form data with file', async t => {
    t.plan(2);

    const { server } = makeServer({
        onText(field) {
            t.fail('No text field was expected');
        },
        onFile(field) {
            t.is(field.name, 'file');
            t.is(field.data.toString(), 'Test file');
        },
    });
    await request(server)
        .post('/')
        .attach('file', 'tests/fixtures/file.txt')
        .expect(200);
});

test('test form data with text field and file', async t => {
    t.plan(4);

    const { server } = makeServer({
        onText(field) {
            t.is(field.name, 'test');
            t.is(field.data, 'Test Value');
        },
        onFile(field) {
            t.is(field.name, 'file');
            t.is(field.data.toString(), 'Test file');
        },
    });
    await request(server)
        .post('/')
        .field('test', 'Test Value')
        .attach('file', 'tests/fixtures/file.txt')
        .expect(200);
});
