import test from 'ava';
import init from './eerie';

test('first', t => {
	try {
		init();
		t.pass();
	} catch (error) {
		console.log(error.message);
	}
});
