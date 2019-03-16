import test from 'ava';
import init from './eerie';

let server;

test('first', t => {
	server = init();
	t.pass();
});

test('second', t => {
	server.methods.test.writeAll();
	t.pass();
});
