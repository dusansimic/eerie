import test from 'ava';
import init from './modules/sequelize-init';
import methods from './modules/sequelize-methods';
import eerie from './eerie';

test('init', async t => {
	await init();
	t.pass();
});

test('methods', async t => {
	const sequelizer = await init();
	await methods(sequelizer);
	t.pass();
});

test('server', async t => {
	await eerie();
	t.pass();
});
