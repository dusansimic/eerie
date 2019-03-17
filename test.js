import test from 'ava';
import eerie from './eerie';

test('first', async t => {
	const application = await eerie();
	console.log(application);

	t.pass();
});
